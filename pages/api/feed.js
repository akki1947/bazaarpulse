const xml2js = require('xml2js');
const sources = require('../../data/sources.json');
const { processArticle } = require('../../lib/scorer');

let cache = { articles:[], ts:0 };
const TTL = 5 * 60 * 1000;

function clean(s='') {
  return s.replace(/<!\[CDATA\[/gi,'').replace(/\]\]>/gi,'')
    .replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<')
    .replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
    .replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
}

async function fetchFeed(src) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 9000);
  try {
    const res = await fetch(src.url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'BazaarPulse/2.0 (+https://bazaarpulse.vercel.app)' },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = await xml2js.parseStringPromise(xml, { explicitArray:false, ignoreAttrs:false });
    const channel = parsed?.rss?.channel || parsed?.feed || {};
    const items = channel.item || channel.entry || [];
    const arr = Array.isArray(items) ? items : [items];
    return arr.slice(0,12).map(item => {
      const title = clean(item.title||'');
      const desc  = clean(item.description||item.summary||item['content:encoded']||'');
      const rawLink = item.link || '';
      const link = typeof rawLink==='object' ? (rawLink?.$?.href || rawLink?._ || '') : rawLink;
      const pub = item.pubDate || item.published || item.updated || '';
      return processArticle({ title, desc, link:String(link).trim(), pub, source:src.name }, src.id);
    }).filter(a => a.title.length > 10);
  } catch { return []; } finally { clearTimeout(t); }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
  if (cache.ts && Date.now()-cache.ts < TTL && cache.articles.length > 0) {
    return res.json({ ok:true, cached:true, count:cache.articles.length, articles:cache.articles });
  }
  try {
    const top = sources.sources.slice(0, 12);
    const results = await Promise.allSettled(top.map(s => fetchFeed(s)));
    let all = results
      .filter(r => r.status==='fulfilled').flatMap(r => r.value)
      .filter(a => a.title)
      .sort((a,b) => new Date(b.pub) - new Date(a.pub));

    // Deduplicate
    const seen = new Set();
    all = all.filter(a => {
      const k = a.title.toLowerCase().replace(/\s+/g,'').slice(0,40);
      if (seen.has(k)) return false; seen.add(k); return true;
    }).slice(0, 100);

    cache = { articles:all, ts:Date.now() };
    return res.json({ ok:true, cached:false, count:all.length, articles:all });
  } catch(e) {
    return res.status(500).json({ ok:false, error:e.message, articles:[] });
  }
}

export const config = { api:{ responseLimit:'8mb' } };
