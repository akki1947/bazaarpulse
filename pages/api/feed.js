// BazaarPulse /api/feed â€” server-side RSS fetcher
// Usage: GET /api/feed?url=<encoded_rss_url>

const https = require('https');
const http  = require('http');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const raw = req.query && req.query.url;
  if (!raw) return res.status(400).send('Missing url param');

  const url = decodeURIComponent(raw);

  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).send('Invalid url');
  }

  try {
    const xml = await get(url);
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300');
    return res.status(200).send(xml);
  } catch(e) {
    console.error('feed fetch error:', e.message, url);
    return res.status(502).send('Feed unavailable: ' + e.message);
  }
};

function get(url, redirects) {
  redirects = redirects || 0;
  return new Promise((resolve, reject) => {
    if (redirects > 4) return reject(new Error('Too many redirects'));
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BazaarPulse/3.0)',
        'Accept': 'application/rss+xml,application/xml,text/xml,*/*',
        'Accept-Encoding': 'identity'
      }
    }, function(r) {
      if ([301,302,303,307,308].indexOf(r.statusCode) !== -1 && r.headers.location) {
        var next = r.headers.location.startsWith('http')
          ? r.headers.location
          : new URL(r.headers.location, url).href;
        r.resume();
        return resolve(get(next, redirects + 1));
      }
      if (r.statusCode !== 200) {
        r.resume();
        return reject(new Error('HTTP ' + r.statusCode));
      }
      var chunks = [];
      r.on('data', function(c) { chunks.push(c); });
      r.on('end', function() { resolve(Buffer.concat(chunks).toString('utf8')); });
      r.on('error', reject);
    });
    req.on('timeout', function() { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

