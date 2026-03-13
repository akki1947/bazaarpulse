import { get } from '@vercel/edge-config';

// Finnhub free tier - US ETFs as index proxies + NSE large caps as India proxy
const FINNHUB_QUOTES = [
  // US Indices via ETFs
  { symbol: "SPY",    name: "S&P 500",    type: "index",     scale: 1 },
  { symbol: "QQQ",    name: "NASDAQ 100", type: "index",     scale: 1 },
  { symbol: "DIA",    name: "Dow Jones",  type: "index",     scale: 1 },
  // India via NSE-listed ETFs on Finnhub (exchange: NSE)
  { symbol: "NSE:NIFTYBEES", name: "NIFTY 50",   type: "index", scale: 100 },
  { symbol: "NSE:BANKBEES",  name: "NIFTY Bank", type: "index", scale: 100 },
  { symbol: "NSE:ICICIB22",  name: "SENSEX",     type: "index", scale: 100 },
  // Commodities via ETFs
  { symbol: "GLD",    name: "Gold",       type: "commodity", scale: 1 },
  { symbol: "USO",    name: "Crude Oil",  type: "commodity", scale: 1 },
];

async function fetchFinnhubQuote(item, apiKey) {
  const url = "https://finnhub.io/api/v1/quote?symbol=" + encodeURIComponent(item.symbol) + "&token=" + apiKey;
  const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error("Finnhub " + res.status + " " + item.symbol);
  const d = await res.json();
  if (!d.c || d.c === 0) throw new Error("Zero: " + item.symbol);
  const scale = item.scale || 1;
  return {
    name: item.name, type: item.type,
    price: parseFloat((d.c * scale).toFixed(2)),
    open: parseFloat(((d.o||0) * scale).toFixed(2)),
    high: parseFloat(((d.h||0) * scale).toFixed(2)),
    low: parseFloat(((d.l||0) * scale).toFixed(2)),
    prevClose: parseFloat(((d.pc||0) * scale).toFixed(2)),
    change: parseFloat(((d.d||0) * scale).toFixed(2)),
    changePct: parseFloat((d.dp||0).toFixed(2)),
    up: (d.d||0) >= 0,
    source: "finnhub",
  };
}

async function fetchForex(apiKey) {
  const url = "https://finnhub.io/api/v1/forex/rates?base=USD&token=" + apiKey;
  const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error("Forex " + res.status);
  const d = await res.json();
  const q = d.quote || {};
  const usdInr = q.INR;
  if (!usdInr) throw new Error("No INR rate");
  return [
    { name: "USD/INR", type: "forex", price: parseFloat(usdInr.toFixed(4)),          change: 0, changePct: 0, up: true, source: "finnhub" },
    { name: "EUR/INR", type: "forex", price: parseFloat((usdInr / (q.EUR||1)).toFixed(4)), change: 0, changePct: 0, up: true, source: "finnhub" },
    { name: "GBP/INR", type: "forex", price: parseFloat((usdInr / (q.GBP||1)).toFixed(4)), change: 0, changePct: 0, up: true, source: "finnhub" },
  ];
}

async function fetchCrypto() {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";
  const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
  if (!res.ok) throw new Error("CoinGecko");
  const d = await res.json();
  return [
    { name: "Bitcoin",  price: d.bitcoin?.usd,  changePct: d.bitcoin?.usd_24h_change  },
    { name: "Ethereum", price: d.ethereum?.usd, changePct: d.ethereum?.usd_24h_change },
    { name: "Solana",   price: d.solana?.usd,   changePct: d.solana?.usd_24h_change   },
  ].map(c => ({ ...c, type: "crypto",
    change: parseFloat(((c.price||0)*(c.changePct||0)/100).toFixed(2)),
    up: (c.changePct||0) >= 0, source: "coingecko" }));
}

function getSession() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const m = now.getHours() * 60 + now.getMinutes();
  if (m >= 555 && m < 780) return "morning";
  if (m >= 780 && m < 930) return "afternoon";
  if (m >= 930) return "close";
  return "pre-market";
}

async function fetchAll(apiKey) {
  const [quotesRes, forexData] = await Promise.all([
    Promise.allSettled(FINNHUB_QUOTES.map(s => fetchFinnhubQuote(s, apiKey))),
    fetchForex(apiKey).catch(e => { console.warn("Forex failed:", e.message); return []; }),
  ]);
  const quotes = quotesRes.filter(r => r.status === "fulfilled").map(r => r.value);
  const failed = quotesRes.filter(r => r.status === "rejected");
  failed.forEach(r => console.warn("Quote failed:", r.reason?.message));
  let crypto = [];
  try { crypto = await fetchCrypto(); } catch(e) { console.warn("Crypto:", e.message); }
  const all = [...quotes, ...forexData, ...crypto];
  return { quotes: all, session: getSession(), fetched: new Date().toISOString(),
    meta: { total: FINNHUB_QUOTES.length + 3 + 3, loaded: all.length, failed: failed.length } };
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
