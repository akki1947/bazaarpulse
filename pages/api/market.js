/**
 * BazaarPulse Market Data API v6
 * Finnhub free tier compatible symbols
 * CoinGecko for crypto
 * Edge Config for persistence
 */

import { get } from '@vercel/edge-config';

// Finnhub free tier confirmed working symbols
// India indices use ^NSEI style on free tier
const SYMBOLS = [
  // India — Finnhub free tier uses Yahoo-style for indices
  { fh: 'BINANCE:NIFTYUSDT', name: 'NIFTY 50',    type: 'index',  fallback: true },
  // US indices via Finnhub free
  { fh: 'OANDA:SPX500_USD',  name: 'S&P 500',     type: 'index'  },
  { fh: 'OANDA:NAS100_USD',  name: 'NASDAQ 100',  type: 'index'  },
  { fh: 'OANDA:US30_USD',    name: 'Dow Jones',   type: 'index'  },
  // Forex
  { fh: 'OANDA:USD_INR',     name: 'USD/INR',     type: 'forex'  },
  { fh: 'OANDA:EUR_INR',     name: 'EUR/INR',     type: 'forex'  },
  { fh: 'OANDA:GBP_INR',     name: 'GBP/INR',     type: 'forex'  },
  // Commodities
  { fh: 'OANDA:XAU_USD',     name: 'Gold',        type: 'commodity' },
  { fh: 'OANDA:BCO_USD',     name: 'Crude Brent', type: 'commodity' },
  { fh: 'OANDA:WTICO_USD',   name: 'Crude WTI',   type: 'commodity' },
];

// Stooq as fallback for India indices (no auth, no CORS issue server-side)
const STOOQ_INDIA = [
  { sym: '%5Ensei',  name: 'NIFTY 50',    type: 'index' },
  { sym: '%5Ebsesn', name: 'SENSEX',      type: 'index' },
  { sym: '%5Ensebank',name:'NIFTY Bank',  type: 'index' },
  { sym: '%5Ecnxit', name: 'NIFTY IT',    type: 'index' },
];

async function fetchStooqQuote(item) {
  const url = `https://stooq.com/q/l/?s=${item.sym}&f=sd2t2ohlcv&h&e=csv`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Stooq ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split('\n');
  if (lines.length < 2) throw new Error('Empty Stooq response');
  const parts = lines[1].split(',');
  const close = parseFloat(parts[6]);
  const open  = parseFloat(parts[3]);
  if (!close || close === 0) throw new Error(`Zero price from Stooq for ${item.name}`);
  const change    = parseFloat((close - open).toFixed(2));
  const changePct = open > 0 ? parseFloat(((change / open) * 100).toFixed(2)) : 0;
  return { name: item.name, type: item.type, price: close, open, change, changePct, up: change >= 0, source: 'stooq' };
}

async function fetchFinnhubQuote(sym, apiKey) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym.fh)}&token=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Finnhub ${res.status} for ${sym.fh}`);
  const d = await res.json();
  if (!d.c || d.c === 0) throw new Error(`Zero price for ${sym.fh}`);
  return {
    name: sym.name, type: sym.type,
    price: d.c, open: d.o, high: d.h, low: d.l, prevClose: d.pc,
    change: parseFloat((d.d||0).toFixed(4)),
    changePct: parseFloat((d.dp||0).toFixed(4)),
    up: (d.d||0) >= 0,
    source: 'finnhub',
  };
}

async function fetchCrypto() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true';
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error('CoinGecko error');
  const d = await res.json();
  return [
    { name:'Bitcoin',  price:d.bitcoin?.usd,  changePct:d.bitcoin?.usd_24h_change  },
    { name:'Ethereum', price:d.ethereum?.usd, changePct:d.ethereum?.usd_24h_change },
    { name:'Solana',   price:d.solana?.usd,   changePct:d.solana?.usd_24h_change   },
  ].map(c => ({
    ...c, type:'crypto',
    change: parseFloat(((c.price||0)*(c.changePct||0)/100).toFixed(4)),
    up: (c.changePct||0) >= 0,
    source: 'coingecko',
  }));
}

function getSessionLabel() {
  const now  = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins >= 555 && mins < 780) return 'morning';
  if (mins >= 780 && mins < 930) return 'afternoon';
  if (mins >= 930)               return 'close';
  return 'pre-market';
}

async function fetchAll(apiKey) {
  // Fetch India indices from Stooq (reliable, no auth)
  const stooqResults = await Promise.allSettled(STOOQ_INDIA.map(s => fetchStooqQuote(s)));
  const indiaQuotes  = stooqResults.filter(r => r.status === 'fulfilled').map(r => r.value);

  // Fetch global indices + forex + commodities from Finnhub
  const fhResults  = await Promise.allSettled(SYMBOLS.map(s => fetchFinnhubQuote(s, apiKey)));
  const fhQuotes   = fhResults.filter(r => r.status === 'fulfilled').map(r => r.value);
  const fhFailed   = fhResults.filter(r => r.status === 'rejected').map(r => r.reason?.message);
  if (fhFailed.length) console.warn('Finnhub failures:', fhFailed);

  // Crypto from CoinGecko
  let crypto = [];
  try { crypto = await fetchCrypto(); } catch (e) { console.warn('Crypto failed:', e.message); }

  const quotes = [...indiaQuotes, ...fhQuotes, ...crypto];
  return {
    quotes,
    session: getSessionLabel(),
    fetched: new Date().toISOString(),
    meta: { total: STOOQ_INDIA.length + SYMBOLS.length + 3, loaded: quotes.length },
  };
}

async function writeToEdgeConfig(data) {
  const id    = process.env.EDGE_CONFIG_ID;
  const token = process.env.VERCEL_API_TOKEN;
  if (!id || !token) throw new Error('EDGE_CONFIG_ID or VERCEL_API_TOKEN not set');
  const res = await fetch(`https://api.vercel.com/v1/edge-config/${id}/items`, {
    method:  'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ items: [{ operation: 'upsert', key: 'market', value: data }] }),
  });
  if (!res.ok) throw new Error(`Edge Config write: ${await res.text()}`);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const apiKey = process.env.FINNHUB_API_KEY;

  // Cron refresh
  if (req.query.refresh === '1') {
    if (!apiKey) return res.status(500).json({ ok: false, error: 'FINNHUB_API_KEY not set' });
    try {
      const data = await fetchAll(apiKey);
      await writeToEdgeConfig(data);
      return res.json({ ok: true, refreshed: true, ...data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // Regular GET — read from Edge Config
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  try {
    const cached = await get('market');
    if (cached?.quotes?.length) {
      const age = Math.round((Date.now() - new Date(cached.fetched).getTime()) / 1000);
      return res.json({ ok: true, cached: true, age, ...cached });
    }
    // Cold start — fetch live
    if (!apiKey) return res.json({ ok: false, error: 'No cache and no API key', quotes: [] });
    const data = await fetchAll(apiKey);
    try { await writeToEdgeConfig(data); } catch {}
    return res.json({ ok: true, cached: false, age: 0, ...data });
  } catch (e) {
    // Edge Config not configured — fall back to live fetch
    console.warn('Edge Config error, falling back to live fetch:', e.message);
    if (!apiKey) return res.json({ ok: false, error: e.message, quotes: [] });
    try {
      const data = await fetchAll(apiKey);
      return res.json({ ok: true, cached: false, age: 0, ...data });
    } catch (e2) {
      return res.status(500).json({ ok: false, error: e2.message, quotes: [] });
    }
  }
}
