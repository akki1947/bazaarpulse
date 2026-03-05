// Vercel Serverless Function: /api/feed
// Fetches RSS feeds server-side — no CORS, no proxies, always works
// Called by: fetch('/api/feed?url=<encoded_rss_url>')

const https = require('https');
const http  = require('http');
const { URL } = require('url');

// Sources allowed to be fetched (security whitelist)
const ALLOWED_DOMAINS = [
  'economictimes.indiatimes.com',
  'www.livemint.com',
  'www.business-standard.com',
  'feeds.feedburner.com',
  'www.ndtvprofit.com',
  'www.moneycontrol.com',
  'feeds.reuters.com',
  'feeds.bloomberg.com',
  'www.bloomberg.com',
  'www.cnbc.com',
  'www.ft.com',
  'feeds.a.dj.com',
  'finance.yahoo.com',
  'feeds.finance.yahoo.com',
  'news.yahoo.com',
  'news.google.com',
  'www.investing.com',
];

function fetchUrl(urlStr, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));
    let parsed;
    try { parsed = new URL(urlStr); } catch(e) { return reject(new Error('Invalid URL')); }

    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BazaarPulse/2.0; +https://bazaarpulse.vercel.app)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
      }
    };

    const req = lib.request(options, (res) => {
      // Follow redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsed.protocol}//${parsed.hostname}${res.headers.location}`;
        return resolve(fetchUrl(next, redirectCount + 1));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }

      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  // CORS headers so browser can call this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60'); // 5 min edge cache

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  let decoded;
  try { decoded = decodeURIComponent(url); } catch(e) {
    return res.status(400).json({ error: 'Invalid url encoding' });
  }

  // Security: only allow whitelisted domains
  let parsed;
  try { parsed = new URL(decoded); } catch(e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
    return res.status(403).json({ error: `Domain not allowed: ${parsed.hostname}` });
  }

  try {
    const xml = await fetchUrl(decoded);

    // Validate it looks like XML/RSS
    if (!xml.includes('<') || xml.length < 100) {
      return res.status(502).json({ error: 'Empty or invalid response' });
    }

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(xml);

  } catch (err) {
    console.error(`Feed fetch failed for ${decoded}: ${err.message}`);
    return res.status(502).json({ error: err.message });
  }
};
