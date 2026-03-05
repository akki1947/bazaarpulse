// BazaarPulse /api/debug — tests all RSS sources, reports results
// Visit: https://bazaarpulse.vercel.app/api/debug

const https = require('https');
const http  = require('http');

const SOURCES = [
  { name:'ET',       url:'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
  { name:'Mint',     url:'https://www.livemint.com/rss/markets' },
  { name:'BS',       url:'https://www.business-standard.com/rss/markets-106.rss' },
  { name:'NDTV',     url:'https://feeds.feedburner.com/ndtvprofit-latest' },
  { name:'MC',       url:'https://www.moneycontrol.com/rss/buzzingstocks.xml' },
  { name:'Reuters',  url:'https://feeds.reuters.com/reuters/businessNews' },
  { name:'Bloomberg',url:'https://feeds.bloomberg.com/markets/news.rss' },
  { name:'CNBC',     url:'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
  { name:'FT',       url:'https://www.ft.com/rss/home/us' },
  { name:'WSJ',      url:'https://feeds.a.dj.com/rss/RSSMarketsMain.xml' },
  { name:'Yahoo',    url:'https://finance.yahoo.com/news/rssindex' },
  { name:'GNews',    url:'https://news.google.com/rss/search?q=nifty+sensex&hl=en-IN&gl=IN&ceid=IN:en' },
];

function get(url, redirects) {
  redirects = redirects || 0;
  return new Promise((resolve, reject) => {
    if (redirects > 4) return reject(new Error('Too many redirects'));
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BazaarPulse/3.0)',
        'Accept': 'application/rss+xml,application/xml,text/xml,*/*',
      }
    }, function(r) {
      if ([301,302,303,307,308].indexOf(r.statusCode) !== -1 && r.headers.location) {
        var next = r.headers.location.startsWith('http') ? r.headers.location : new URL(r.headers.location, url).href;
        r.resume();
        return resolve(get(next, redirects + 1));
      }
      var chunks = [];
      r.on('data', function(c) { chunks.push(c); });
      r.on('end', function() {
        var body = Buffer.concat(chunks).toString('utf8');
        resolve({ status: r.statusCode, size: body.length, hasItems: body.includes('<item>') || body.includes('<entry>'), preview: body.slice(0,120) });
      });
      r.on('error', reject);
    });
    req.on('timeout', function() { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const results = await Promise.allSettled(
    SOURCES.map(async s => {
      const start = Date.now();
      try {
        const r = await get(s.url);
        return { name: s.name, ok: r.status === 200 && r.hasItems, status: r.status, items: r.hasItems, ms: Date.now()-start, size: r.size };
      } catch(e) {
        return { name: s.name, ok: false, error: e.message, ms: Date.now()-start };
      }
    })
  );

  const data = results.map(r => r.value || r.reason);
  const working = data.filter(r => r.ok).length;

  res.status(200).json({
    summary: `${working}/${SOURCES.length} sources working`,
    time: new Date().toISOString(),
    sources: data
  });
};
