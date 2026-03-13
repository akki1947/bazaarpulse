import { get } from '@vercel/edge-config';

// Finnhub forex rates endpoint - confirmed free tier
async function fetchForex(apiKey) {
  const url = "https://finnhub.io/api/v1/forex/rates?base=USD&token=" + apiKey;
  const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error("Forex " + res.status);
  const d = await res.json();
  const q = d.quote || {};
  const usdInr = q.INR || 0;
  return [
    { name: "USD/INR", type: "forex", price: usdInr, changePct: 0, change: 0, up: true, source: "finnhub" },
    { name: "EUR/INR", type: "forex", price: q.INR && q.EUR ? parseFloat((q.INR / q.EUR).toFixed(4)) : 0, changePct: 0, change: 0, up: true, source: "finnhub" },
    { name: "GBP/INR", type: "forex", price: q.INR && q.GBP ? parseFloat((q.INR / q.GBP).toFixed(4)) : 0, changePct: 0, change: 0, up: true, source: "finnhub" },
  ].filter(x => x.price > 0);
}

// Finnhub quote for US stocks/ETFs - works on free tier
async function fetchFinnhubQuote(symbol, name, type, apiKey) {
  const url = "https://finnhub.io/api/v1/quote?symbol=" + encodeURIComponent(symbol) + "&token=" + apiKey;
  const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error("Finnhub " + res.status + " for " + symbol);
  const d = await res.json();
  if (!d.c || d.c === 0) throw new Error("Zero price for " + symbol);
  return { name, type, price: d.c, open: d.o, high: d.h, low: d.l, prevClose: d.pc,
    change: parseFloat((d.d||0).toFixed(2)), changePct: parseFloat((d.dp||0).toFixed(2)),
    up: (d.d||0) >= 0, source: "finnhub" };
}

// CoinGecko for crypto
async function fetchCrypto() {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";
  const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
  if (!res.ok) throw new Error("CoinGecko error");
  const d = await res.json();
  return [
    { name: "Bitcoin",  price: d.bitcoin?.usd,  changePct: d.bitcoin?.usd_24h_change  },
    { name: "Ethereum", price: d.ethereum?.usd, changePct: d.ethereum?.usd_24h_change },
    { name: "Solana",   price: d.solana?.usd,   changePct: d.solana?.usd_24h_change   },
  ].map(c => ({ ...c, type: "crypto", change: parseFloat(((c.price||0)*(c.changePct||0)/100).toFixed(2)), up: (c.changePct||0) >= 0, source: "coingecko" }));
}

// US ETFs as proxy for indices - all work on Finnhub free tier
const ETF_PROXIES = [
  { symbol: "SPY",  name: "S&P 500",   type: "index" },
  { symbol: "QQQ",  name: "NASDAQ",    type: "index" },
  { symbol: "DIA",  name: "Dow Jones", type: "index" },
  { symbol: "GLD",  name: "Gold",      type: "commodity" },
  { symbol: "USO",  name: "Crude Oil", type: "commodity" },
];

// India indices via NSE unofficial endpoint (no auth needed)
async function fetchNSEIndex(symbol, name) {
  const url = "https://query1.finance.yahoo.com/v8/finance/quote?symbols=" + symbol;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json", "Accept-Language": "en-US,en;q=0.9" },
    signal: AbortSignal.timeout(9000),
  });
  if (!res.ok) throw new Error("Yahoo " + res.status);
  const d = await res.json();
  const q = d?.quoteResponse?.result?.[0];
  if (!q || !q.regularMarketPrice) throw new Error("No data for " + symbol);
  return { name, type: "index",
    price: q.regularMarketPrice,
    change: parseFloat((q.regularMarketChange||0).toFixed(2)),
    changePct: parseFloat((q.regularMarketChangePercent||0).toFixed(2)),
    up: (q.regularMarketChange||0) >= 0,
    source: "yahoo" };
}

const NSE_INDICES = [
  { symbol: "%5ENSEI",    name: "NIFTY 50"   },
  { symbol: "%5EBSESN",   name: "SENSEX"     },
  { symbol: "%5ENSEBANK", name: "NIFTY Bank" },
  { symbol: "%5ECNXIT",   name: "NIFTY IT"   },
];

function getSession() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const m = now.getHours() * 60 + now.getMinutes();
  if (m >= 555 && m < 780) return "morning";
  if (m >= 780 && m < 930) return "afternoon";
  if (m >= 930) return "close";
  return "pre-market";
}

async function fetchAll(apiKey) {
  const [nseRes, etfRes, forexRes] = await Promise.all([
    Promise.allSettled(NSE_INDICES.map(s => fetchNSEIndex(s.symbol, s.name))),
    Promise.allSettled(ETF_PROXIES.map(s => fetchFinnhubQuote(s.symbol, s.name, s.type, apiKey))),
    fetchForex(apiKey).catch(e => { console.warn("Forex:", e.message); return []; }),
  ]);

  const india  = nseRes.filter(r => r.status === "fulfilled").map(r => r.value);
  const etfs   = etfRes.filter(r => r.status === "fulfilled").map(r => r.value);
  const forex  = Array.isArray(forexRes) ? forexRes : [];

  const nFail = nseRes.filter(r => r.status === "rejected").length;
  const eFail = etfRes.filter(r => r.status === "rejected").length;
  if (nFail) console.warn("NSE failures:", nFail);
  if (eFail) console.warn("ETF failures:", eFail);

  let crypto = [];
  try { crypto = await fetchCrypto(); } catch(e) { console.warn("Crypto:", e.message); }

  const quotes = [...india, ...etfs, ...forex, ...crypto];
  return { quotes, session: getSession(), fetched: new Date().toISOString(),
    meta: { total: NSE_INDICES.length + ETF_PROXIES.length + 3 + 3, loaded: quotes.length, failed: nFail + eFail } };
}

async function writeEdge(data) {
  const id = process.env.EDGE_CONFIG_ID, token = process.env.VERCEL_API_TOKEN;
  if (!id || !token) return;
  await fetch("https://api.vercel.com/v1/edge-config/" + id + "/items", {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ operation: "upsert", key: "market", value: data }] }),
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const apiKey = process.env.FINNHUB_API_KEY;

  if (req.query.refresh === "1") {
    if (!apiKey) return res.status(500).json({ ok: false, error: "FINNHUB_API_KEY not set" });
    try {
      const data = await fetchAll(apiKey);
      await writeEdge(data);
      return res.json({ ok: true, refreshed: true, ...data });
    } catch(e) { return res.status(500).json({ ok: false, error: e.message }); }
  }

  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  try {
    const cached = await get("market");
    if (cached?.quotes?.length) {
      const age = Math.round((Date.now() - new Date(cached.fetched).getTime()) / 1000);
      return res.json({ ok: true, cached: true, age, ...cached });
    }
  } catch(e) { console.warn("Edge Config:", e.message); }

  if (!apiKey) return res.json({ ok: false, error: "No cache, no API key", quotes: [] });
  try {
    const data = await fetchAll(apiKey);
    try { await writeEdge(data); } catch {}
    return res.json({ ok: true, cached: false, age: 0, ...data });
  } catch(e) { return res.status(500).json({ ok: false, error: e.message, quotes: [] }); }
}
