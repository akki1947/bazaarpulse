/**
 * BazaarPulse Market Data API v5
 *
 * Cache strategy: Vercel Edge Config (free, built-in, no external service)
 * - Cron writes to Edge Config 3x/day via Vercel Edge Config API
 * - All reads served from Edge Config — sub-1ms globally
 * - Falls back to live Finnhub fetch if Edge Config is empty
 *
 * Env vars required:
 *   FINNHUB_API_KEY          — your Finnhub key
 *   EDGE_CONFIG              — auto-set by Vercel when you create Edge Config
 *   EDGE_CONFIG_ID           — from Vercel dashboard (e.g. ecfg_xxxx)
 *   VERCEL_API_TOKEN         — create at vercel.com/account/tokens (write access)
 */

import { get } from '@vercel/edge-config';

const SYMBOLS = [
  { fh: 'NSE:NIFTY50',      name: 'NIFTY 50',    type: 'index'     },
  { fh: 'BSE:SENSEX',       name: 'SENSEX',       type: 'index'     },
  { fh: 'NSE:BANKNIFTY',    name: 'NIFTY Bank',   type: 'index'     },
  { fh: 'NSE:CNXIT',        name: 'NIFTY IT',     type: 'index'     },
  { fh: 'NSE:CNXPHARMA',    name: 'NIFTY Pharma', type: 'index'     },
  { fh: 'NSE:CNXAUTO',      name: 'NIFTY Auto',   type: 'index'     },
  { fh: 'OANDA:SPX500_USD', name: 'S&P 500',      type: 'index'     },
  { fh: 'OANDA:NAS100_USD', name: 'NASDAQ',       type: 'index'     },
  { fh: 'OANDA:US30_USD',   name: 'Dow Jones',    type: 'index'     },
  { fh: 'OANDA:USD_INR',    name: 'USD/INR',      type: 'forex'     },
  { fh: 'OANDA:EUR_INR',    name: 'EUR/INR',      type: 'forex'     },
  { fh: 'OANDA:GBP_INR',    name: 'GBP/INR',      type: 'forex'     },
  { fh: 'OANDA:XAU_USD',    name: 'Gold',         type: 'commodity' },
  { fh: 'OANDA:BCO_USD',    name: 'Crude Brent',  type: 'commodity' },
];

function getSessionLabel() {
  const now  = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins >= 555 && mins < 780) return 'morning';
  if (mins >= 780 && mins < 930) return 'afternoon';
  if (mins >= 930)               return 'close';
  return 'pre-market';
}

async function fetchFinnhubQuote(sym, apiKey) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym.fh)}&token=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Finnhub ${res.status} for ${sym.fh}`);
  const d = await res.json();
  if (!d.c || d.c === 0) throw new Error(`Zero price for ${sym.fh}`);
  return {
    symbol: sym.fh, name: sym.name, type: sym.type,
    price: d.c, open: d.o, high: d.h, low: d.l, prevClose: d.pc,
    change: d.d, changePct: d.dp, up: d.d >= 0,
    source: 'finnhub',
  };
}

async function fetchCrypto() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true';
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error('CoinGecko error');
  const d = await res.json();
  return [
    { name:'Bitcoin',  price:d.bitcoin?.usd,  changePct:d.bitcoin?.usd_24h_change,  type:'crypto' },
    { name:'Ethereum', price:d.ethereum?.usd, changePct:d.ethereum?.usd_24h_change, type:'crypto' },
    { name:'Solana',   price:d.solana?.usd,   changePct:d.solana?.usd_24h_change,   type:'crypto' },
  ].map(c => ({
    ...c,
    change: parseFloat(((c.price||0)*(c.changePct||0)/100).toFixed(4)),
    up: (c.changePct||0) >= 0,
    source: 'coingecko',
  }));
}

async function fetchAll(apiKey) {
  const results = await Promise.allSettled(SYMBOLS.map(s => fetchFinnhubQuote(s, apiKey)));
  const quotes  = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  const failed  = results.filter(r => r.status === 'rejected').length;
  let crypto = [];
  try { crypto = await fetchCrypto(); } catch {}
  return {
    quotes:  [...quotes, ...crypto],
    session: getSessionLabel(),
    fetched: new Date().toISOString(),
    meta:    { total: SYMBOLS.length + 3, loaded: quotes.length + crypto.length, failed },
  };
}

// Write to Edge Config via REST API (only called by cron)
async function writeToEdgeConfig(data) {
  const id    = process.env.EDGE_CONFIG_ID;
  const token = process.env.VERCEL_API_TOKEN;
  if (!id || !token) throw new Error('EDGE_CONFIG_ID or VERCEL_API_TOKEN not set');

  const res = await fetch(`https://api.vercel.com/v1/edge-config/${id}/items`, {
    method:  'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ items: [{ operation: 'upsert', key: 'market', value: data }] }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Edge Config write failed: ${err}`);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const apiKey = process.env.FINNHUB_API_KEY;

  // ── Cron refresh: /api/market?refresh=1 ─────────────────
  if (req.query.refresh === '1') {
    const secret = req.headers['x-cron-secret'];
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    if (!apiKey) return res.status(500).json({ ok: false, error: 'FINNHUB_API_KEY not set' });
    try {
      const data = await fetchAll(apiKey);
      await writeToEdgeConfig(data);
      console.log(`[Cron] Refreshed ${data.quotes.length} quotes, session: ${data.session}`);
      return res.json({ ok: true, refreshed: true, ...data });
    } catch (e) {
      console.error('[Cron] Failed:', e.message);
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // ── Regular GET: read from Edge Config ──────────────────
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  try {
    const cached = await get('market');
    if (cached) {
      const age = Math.round((Date.now() - new Date(cached.fetched).getTime()) / 1000);
      return res.json({ ok: true, cached: true, age, ...cached });
    }
    // Edge Config empty (first deploy) — fetch live once to warm it up
    if (!apiKey) return res.json({ ok: false, error: 'No cache and FINNHUB_API_KEY not set', quotes: [] });
    const data = await fetchAll(apiKey);
    try { await writeToEdgeConfig(data); } catch (e) { console.warn('Edge Config write skipped:', e.message); }
    return res.json({ ok: true, cached: false, age: 0, ...data });
  } catch (e) {
    console.error('[Market GET]', e.message);
    return res.status(500).json({ ok: false, error: e.message, quotes: [] });
  }
}
