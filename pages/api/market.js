const SYMBOLS = {
  indices:['^NSEI','^BSESN','^NSEBANK','^CNXIT','^CNXPHARMA','^CNXAUTO','^CNXMETAL','^CNXFMCG'],
  us:['^DJI','^GSPC','^IXIC','^VIX'],
  global:['^N225','^FTSE','^GDAXI','^HSI','000001.SS'],
  forex:['USDINR=X','EURINR=X','GBPINR=X','JPYINR=X'],
};
const NAMES = {
  '^NSEI':'NIFTY 50','^BSESN':'SENSEX','^NSEBANK':'NIFTY Bank','^CNXIT':'NIFTY IT',
  '^CNXPHARMA':'NIFTY Pharma','^CNXAUTO':'NIFTY Auto','^CNXMETAL':'NIFTY Metal','^CNXFMCG':'NIFTY FMCG',
  '^DJI':'Dow Jones','^GSPC':'S&P 500','^IXIC':'NASDAQ','^VIX':'VIX',
  '^N225':'Nikkei','^FTSE':'FTSE 100','^GDAXI':'DAX','^HSI':'Hang Seng','000001.SS':'Shanghai',
  'USDINR=X':'USD/INR','EURINR=X':'EUR/INR','GBPINR=X':'GBP/INR','JPYINR=X':'JPY/INR',
};
let cache = {};
const TTL = 3*60*1000;

export default async function handler(req, res) {
  res.setHeader('Cache-Control','public, s-maxage=180, stale-while-revalidate=30');
  const type = req.query.type || 'all';
  const now = Date.now();
  if (cache[type] && now-cache[type].ts < TTL) {
    return res.json({ ok:true, cached:true, data:cache[type].data });
  }
  try {
    const symList = type==='forex' ? SYMBOLS.forex
      : type==='indices' ? [...SYMBOLS.indices,...SYMBOLS.us,...SYMBOLS.global]
      : [...SYMBOLS.indices,...SYMBOLS.us,...SYMBOLS.global,...SYMBOLS.forex];
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symList.join(',')}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose`;
    const r = await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 BazaarPulse/2.0'},signal:AbortSignal.timeout(9000)});
    if (!r.ok) throw new Error('Yahoo '+r.status);
    const j = await r.json();
    const data = (j?.quoteResponse?.result||[]).map(q => ({
      symbol:q.symbol, name:NAMES[q.symbol]||q.shortName||q.symbol,
      price:q.regularMarketPrice, change:q.regularMarketChange,
      changePct:q.regularMarketChangePercent, prev:q.regularMarketPreviousClose,
      up:q.regularMarketChange>=0,
    }));
    cache[type] = {data, ts:now};
    return res.json({ ok:true, cached:false, data });
  } catch(e) {
    if (cache[type]) return res.json({ ok:true, cached:true, stale:true, data:cache[type].data });
    return res.status(500).json({ ok:false, error:e.message, data:[] });
  }
}
