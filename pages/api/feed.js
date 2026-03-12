/**
 * BazaarPulse News Feed API
 * Fetches from 12 India-focused RSS sources
 * Scores and categorises each article
 * Caches for 5 minutes
 */

const xml2js  = require('xml2js');
const sources = require('../../data/sources.json');
const { processArticle } = require('../../lib/scorer');

let cache = { articles: [], ts: 0 };
const TTL = 5 * 60 * 1000;

function clean(s = '') {
  return String(s)
    .replace(/<!\[CDATA\[/gi, '').replace(/\]\]>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ')
    .replace(/\s+/g, ' ').trim();
}

async function fetchFeed(src) {
  const ctrl = new AbortController();
  const t    = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(src.url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BazaarPulse/2.0; +https://bazaarpulse.vercel.app)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    if (!res.ok) {
      console.warn(`Feed ${src.id} HTTP ${res.status}`);
      return [];
    }
    const xml    = await res.text();
    const parsed = await xml2js.parseStringPromise(xml, { explicitArray: false, ignoreAttrs: false });
    const channel = parsed?.rss?.channel || parsed?.feed || {};
    const items   = channel.item || channel.entry || [];
    const arr     = Array.isArray(items) ? items : [items];

    return arr.slice(0, 15).map(item => {
      const title   = clean(item.title   || '');
      const desc    = clean(item.description || item.summary || item['content:encoded'] || '');
      const rawLink = item.link || '';
      const link    = typeof rawLink === 'object'
        ? (rawLink?.$?.href || rawLink?._ || '')
        : String(rawLink);
      const pub = item.pubDate || item.published || item.updated || new Date().toISOString();
      return processArticle({ title, desc, link: link.trim(), pub, source: src.name }, src.id);
    }).filter(a => a.title && a.title.length > 10);

  } catch (e) {
    console.warn(`Feed ${src.id} failed:`, e.message);
    return [];
  } finally {
    clearTimeout(t);
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const now = Date.now();
  if (cache.ts && now - cache.ts < TTL && cache.articles.length > 0) {
    return res.json({ ok: true, cached: true, count: cache.articles.length, articles: cache.articles });
  }

  try {
    const top     = sources.sources.slice(0, 12);
    const results = await Promise.allSettled(top.map(s => fetchFeed(s)));
    let all = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .filter(a => a.title)
      .sort((a, b) => new Date(b.pub) - new Date(a.pub));

    // Deduplicate by title
    const seen = new Set();
    all = all.filter(a => {
      const k = a.title.toLowerCase().replace(/\s+/g, '').slice(0, 40);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 100);

    cache = { articles: all, ts: now };
    console.log(`[Feed] Loaded ${all.length} articles from ${top.length} sources`);
    return res.json({ ok: true, cached: false, count: all.length, articles: all });

  } catch (e) {
    console.error('[Feed] Error:', e.message);
    if (cache.articles.length) {
      return res.json({ ok: true, cached: true, stale: true, count: cache.articles.length, articles: cache.articles });
    }
    return res.status(500).json({ ok: false, error: e.message, articles: [] });
  }
}

export const config = { api: { responseLimit: '8mb' } };
