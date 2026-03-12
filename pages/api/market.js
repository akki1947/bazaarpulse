/**
 * BazaarPulse Market Data API v3
 * 
 * Sources:
 *   - Finnhub (primary) — indices, forex, crypto
 *   - CoinGecko (crypto fallback)
 * 
 * Refresh strategy:
 *   - Cron triggers at 09:15, 13:00, 15:45 IST
 *   - All other requests served from cache
 *   - Stale cache returned on any fetch error
 * 
 * Env vars required:
 *   FINNHUB_API_KEY=your_key_here
 */

// ── Symbol map ──────────────────────────────────────────────
const SYMBOLS = [
  // India indices (Finnhub uses exchange prefix)
  { fh: 'NSE:NIFTY50',  name: 'NIFTY 50',    type: 'index'     },
  { fh: 'BSE:SENSEX',   name: 'SENSEX',       type: 'index'     },
  { fh: 'NSE:BANKNIFTY',name: 'NIFTY Bank',   type: 'index'     },
  { fh: 'NSE:CNXIT',    name: 'NIFTY IT',     type: 'index'     },
  { fh: 'NSE:CNXPHARMA',name: 'NIFTY Pharma', type: 'index'     },
  { fh: 'NSE:CNXAUTO',  name: 'NIFTY Auto',   type: 'index'     },
  // US indices
  { fh: 'OANDA:SPX500_USD', name: 'S&P 500',  type: 'index'     },
  { fh: 'OANDA:NAS100_USD', name: 'NASDAQ',   type: 'index'     },
  { fh: 'OANDA:US30_USD',   name: 'Dow Jones',type: 'index'     },
  // Forex (Finnhub forex endpoint)
  { fh: 'OANDA:USD_INR', name: 'USD/INR',     type: 'forex'     },
  { fh: 'OANDA:EUR_INR', name: 'EUR/INR',     type: 'forex'     },
  { fh: 'OANDA:GBP_INR', name: 'GBP/INR',     type: 'forex'     },
  // Commodities
  { fh: 'OANDA:XAU_USD', name: 'Gold',        type: 'commodity' },
  { fh: 'OANDA:BCO_USD', name: 'Crude Brent', type: 'commodity' },
];

// ── In-memory cache (persists across requests in same instance) ──
let CACHE = {
  quotes: [],
  ts:     0,
  label:  null,   // 'morning' | 'afternoon' | 'close'
  source: null,
};

// ── Fetch single quote from Finnhub ─────────────────────────
async function fetchFinnhubQuote(sym, apiKey) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym.fh)}&token=${apiKey}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Finnhub ${res.status} for ${sym.fh}`);
  const d = await res.json();

  // Finnhub returns: c=current, d=change, dp=changePct, h=high, l=low, o=open, pc=prevClose
  if (!d.c || d.c === 0) throw new Error(`Zero price for ${sym.fh}`);

  return {
    symbol:    sym.fh,
    name:      sym.name,
    type:      sym.type,
    price:     d.c,
    open:      d.o,
    high:      d.h,
    low:       d.l,
    prevClose: d.pc,
    change:    d.d,
    changePct: d.dp,
    up:        d.d >= 0,
    source:    'finnhub',
  };
}

// ── Fetch crypto from CoinGecko (no key needed) ──────────────
async function fetchCrypto() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true';
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error('CoinGecko error');
  const d = await res.json();
  return [
    { symbol:'BTC', name:'Bitcoin',  price:d.bitcoin?.usd,  changePct:d.bitcoin?.usd_24h_change,  type:'crypto', source:'coingecko' },
    { symbol:'ETH', name:'Ethereum', price:d.ethereum?.usd, changePct:d.ethereum?.usd_24h_change, type:'crypto', source:'coingecko' },
    { symbol:'SOL', name:'Solana',   price:d.solana?.usd,   changePct:d.solana?.usd_24h_change,   type:'crypto', source:'coingecko' },
  ].map(c => ({ ...c, change: parseFloat(((c.price||0) * (c.changePct||0) / 100).toFixed(4)), up: (c.changePct||0) >= 0 }));
}

// ── Determine which session we're in (IST) ───────────────────
function getSessionLabel() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const h = now.getHours();
  const m = now.getMinutes();
  const mins = h * 60 + m;
  if (mins >= 555 && mins < 780)  return 'morning';    // 09:15–13:00
  if (mins >= 780 && mins < 930)  return 'afternoon';  // 13:00–15:30
  if (mins >= 930)                return 'close';      // 15:30+
  return 'premarket';
}

// ── Main fetch ────────────────────────────────────────────────
async function fetchAll(apiKey) {
  // Fetch all Finnhub symbols with individual error tolerance
  const results = await Promise.allSettled(
    SYMBOLS.map(sym => fetchFinnhubQuote(sym, apiKey))
  );

  const quotes = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);

  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason?.message);

  if (failed.length > 0) {
    console.warn('Finnhub partial failures:', failed);
  }

  // Crypto from CoinGecko
  let crypto = [];
  try { crypto = await fetchCrypto(); } catch (e) { console.warn('Crypto fetch failed:', e.message); }

  return {
    quotes:  [...quotes, ...crypto],
    session: getSessionLabel(),
    fetched: new Date().toISOString(),
    meta: {
      total:   SYMBOLS.length + 3,
      loaded:  quotes.length + crypto.length,
      failed:  failed.length,
    },
  };
}

// ── API Handler ───────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.FINNHUB_API_KEY;
  const now    = Date.now();

  // ── Cron refresh endpoint: POST /api/market?refresh=1 ──
  // Called by Vercel cron at 09:15, 13:00, 15:45 IST
  if (req.method === 'POST' || req.query.refresh === '1') {
    // Verify cron secret to prevent abuse
    const secret = req.headers['x-cron-secret'] || req.query.secret;
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    if (!apiKey) return res.status(500).json({ ok: false, error: 'FINNHUB_API_KEY not set' });

    try {
      const data = await fetchAll(apiKey);
      CACHE = { ...data, ts: now };
      console.log(`[Market Cron] Refreshed ${data.quotes.length} quotes at ${data.fetched}`);
      return res.json({ ok: true, refreshed: true, ...data });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // ── Regular GET: serve from cache ──
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');

  // If cache is empty, fetch live on first request
  if (!CACHE.quotes.length) {
    if (!apiKey) {
      return res.json({ ok: false, error: 'FINNHUB_API_KEY not set', quotes: [] });
    }
    try {
      const data = await fetchAll(apiKey);
      CACHE = { ...data, ts: now };
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message, quotes: [] });
    }
  }

  const ageSeconds = Math.round((now - CACHE.ts) / 1000);
  return res.json({
    ok:      true,
    cached:  true,
    age:     ageSeconds,
    session: CACHE.session,
    fetched: CACHE.fetched,
    quotes:  CACHE.quotes,
    meta:    CACHE.meta,
  });
}
