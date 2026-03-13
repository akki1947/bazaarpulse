import { get } from '@vercel/edge-config';
const STOOQ_INDIA = [
  { sym: "%5Ensei",    name: "NIFTY 50",   type: "index" },
  { sym: "%5Ebsesn",  name: "SENSEX",     type: "index" },
  { sym: "%5Ensebank",name: "NIFTY Bank", type: "index" },
  { sym: "%5Ecnxit",  name: "NIFTY IT",   type: "index" },
];
const FINNHUB_SYMBOLS = [
  { fh: "OANDA:SPX500_USD", name: "S&P 500",     type: "index"     },
  { fh: "OANDA:NAS100_USD", name: "NASDAQ 100",  type: "index"     },
  { fh: "OANDA:US30_USD",   name: "Dow Jones",   type: "index"     },
  { fh: "OANDA:USD_INR",    name: "USD/INR",     type: "forex"     },
  { fh: "OANDA:EUR_INR",    name: "EUR/INR",     type: "forex"     },
  { fh: "OANDA:GBP_INR",    name: "GBP/INR",     type: "forex"     },
  { fh: "OANDA:XAU_USD",    name: "Gold",        type: "commodity" },
  { fh: "OANDA:BCO_USD",    name: "Crude Brent", type: "commodity" },
];
async function fetchStooq(item) {
  const url = "https://stooq.com/q/l/?s=" + item.sym + "&f=sd2t2ohlcv&h&e=csv";
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error("Stooq " + res.status);
  const lines = (await res.text()).trim().split("\n");
  if (lines.length < 2) throw new Error("Empty Stooq");
  const p = lines[1].split(",");
  const close = parseFloat(p[6]), open = parseFloat(p[3]);
  if (!close) throw new Error("Zero price");
  const change = parseFloat((close - open).toFixed(2));
  const changePct = open > 0 ? parseFloat(((change / open) * 100).toFixed(2)) : 0;
  return { name: item.name, type: item.type, price: close, open, change, changePct, up: change >= 0, source: "stooq" };
}
async function fetchFinnhub(sym, apiKey) {
  const url = "https://finnhub.io/api/v1/quote?symbol=" + encodeURIComponent(sym.fh) + "&token=" + apiKey;
  const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!res.ok) throw new Error("Finnhub " + res.status);
  const d = await res.json();
  if (!d.c || d.c === 0) throw new Error("Zero: " + sym.fh);
  return { name: sym.name, type: sym.type, price: d.c, open: d.o, high: d.h, low: d.l,
    prevClose: d.pc, change: parseFloat((d.d||0).toFixed(4)), changePct: parseFloat((d.dp||0).toFixed(4)),
    up: (d.d||0) >= 0, source: "finnhub" };
}
async function fetchCrypto() {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";
  const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
  if (!res.ok) throw new Error("CoinGecko error");
  const d = await res.json();
  return [
    { name:"Bitcoin",  price:d.bitcoin?.usd,  changePct:d.bitcoin?.usd_24h_change  },
    { name:"Ethereum", price:d.ethereum?.usd, changePct:d.ethereum?.usd_24h_change },
    { name:"Solana",   price:d.solana?.usd,   changePct:d.solana?.usd_24h_change   },
  ].map(c => ({ ...c, type:"crypto", change:parseFloat(((c.price||0)*(c.changePct||0)/100).toFixed(4)), up:(c.changePct||0)>=0, source:"coingecko" }));
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
  const [stooqRes, fhRes] = await Promise.all([
    Promise.allSettled(STOOQ_INDIA.map(s => fetchStooq(s))),
    Promise.allSettled(FINNHUB_SYMBOLS.map(s => fetchFinnhub(s, apiKey))),
  ]);
  const india  = stooqRes.filter(r => r.status === "fulfilled").map(r => r.value);
  const global = fhRes.filter(r => r.status === "fulfilled").map(r => r.value);
  const failed = fhRes.filter(r => r.status === "rejected").length;
  let crypto = [];
  try { crypto = await fetchCrypto(); } catch(e) { console.warn("Crypto:", e.message); }
  const quotes = [...india, ...global, ...crypto];
  return { quotes, session: getSession(), fetched: new Date().toISOString(),
    meta: { total: 15, loaded: quotes.length, failed } };
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
