/**
 * BazaarPulse News Feed API v3
 * - 22 RSS sources (India finance + AI)
 * - 4x daily crawl via Vercel cron
 * - Noise filter via scorer.js
 * - In-memory cache with stale fallback
 */

const xml2js  = require('xml2js');
const sources = require('../../data/sources.json');
const { processArticle } = require('../../lib/scorer');

let cache = { articles: [], ts: 0 };
const TTL = 6 * 60 * 60 * 1000; // 6 hours — refreshed by cron

function clean(s = '') {
  return String(s)
    .replace(/<!\[CDATA\[/gi, '').replace(/\]\]>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ')
    .replace(/\s+/g,' ').trim();
}

async function fetchFeed(src) {
  const ctrl = new AbortController();
  const t    = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(src.url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BazaarPulse/2.0; +https://bazaarpulse.vercel.app)',
        'Accept':     'application/rss+xml, application/xml, text/xml, */*',
        'Cache-Control': 'no-cache',
      },
    });
    if (!res.ok) { console.warn(`[Feed] ${src.id} HTTP ${res.status}`); return []; }
    const xml    = await res.text();
    const parsed = await xml2js.parseStringPromise(xml, { explicitArray:false, ignoreAttrs:false });
    const channel = parsed?.rss?.channel || parsed?.feed || {};
    const items   = channel.item || channel.entry || [];
    const arr     = Array.isArray(items) ? items : [items];

    const articles = arr.slice(0, 20).map(item => {
      const title   = clean(item.title || '');
      const desc    = clean(item.description || item.summary || item['content:encoded'] || '');
      const rawLink = item.link || '';
      const link    = typeof rawLink === 'object'
        ? (rawLink?.$?.href || rawLink?._ || '')
        : String(rawLink);
      const pub = item.pubDate || item.published || item.updated || new Date().toISOString();
      return processArticle({ title, desc, link: link.trim(), pub, source: src.name }, src.id);
    }).filter(a => a && a.title && a.title.length > 10);

    console.log(`[Feed] ${src.id}: ${articles.length} articles`);
    return articles;
  } catch (e) {
    console.warn(`[Feed] ${src.id} failed:`, e.message);
    return [];
  } finally {
    clearTimeout(t);
  }
}

async function buildFeed() {
  // Priority 1 sources first (parallel), then priority 2
  const p1 = sources.sources.filter(s => s.priority === 1);
  const p2 = sources.sources.filter(s => s.priority === 2);

  const [r1, r2] = await Promise.all([
    Promise.allSettled(p1.map(s => fetchFeed(s))),
    Promise.allSettled(p2.map(s => fetchFeed(s))),
  ]);

  let all = [...r1, ...r2]
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(a => a && a.title)
    .sort((a, b) => new Date(b.pub) - new Date(a.pub));

  // Deduplicate by title similarity
  const seen = new Set();
  all = all.filter(a => {
    const k = a.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 50);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 150);

  console.log(`[Feed] Built ${all.length} articles from ${sources.sources.length} sources`);
  return all;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const now = Date.now();

  // Cron refresh: /api/feed?refresh=1
  if (req.query.refresh === '1') {
    try {
      const articles = await buildFeed();
      cache = { articles, ts: now };
      return res.json({ ok:true, refreshed:true, count:articles.length, articles });
    } catch (e) {
      return res.status(500).json({ ok:false, error:e.message });
    }
  }

  // Serve from cache if fresh
  if (cache.ts && now - cache.ts < TTL && cache.articles.length > 0) {
    const age = Math.round((now - cache.ts) / 1000);
    return res.json({ ok:true, cached:true, age, count:cache.articles.length, articles:cache.articles });
  }

  // Cold start or stale — build fresh
  try {
    const articles = await buildFeed();
    cache = { articles, ts: now };
    return res.json({ ok:true, cached:false, age:0, count:articles.length, articles });
  } catch (e) {
    if (cache.articles.length) {
      return res.json({ ok:true, cached:true, stale:true, count:cache.articles.length, articles:cache.articles });
    }
    return res.status(500).json({ ok:false, error:e.message, articles:[] });
  }
}

export const config = { api: { responseLimit: '8mb' } };
