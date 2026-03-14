/**
 * BazaarPulse News Feed API v4
 * Robust multi-source RSS aggregator
 */

const xml2js  = require('xml2js');
const sources = require('../../data/sources.json');
const { processArticle } = require('../../lib/scorer');

let cache = { articles: [], ts: 0 };
const TTL = 6 * 60 * 60 * 1000;

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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    
    if (!res.ok) {
      console.warn(`[Feed] ${src.id} HTTP ${res.status}`);
      return [];
    }
    
    const xml = await res.text();
    if (!xml || xml.length < 100) {
      console.warn(`[Feed] ${src.id} empty response`);
      return [];
    }

    // Try strict parse first, then lenient
    let parsed;
    try {
      parsed = await xml2js.parseStringPromise(xml, {
        explicitArray: false, ignoreAttrs: false,
        strict: true, normalize: true,
      });
    } catch {
      try {
        parsed = await xml2js.parseStringPromise(xml, {
          explicitArray: false, ignoreAttrs: false,
          strict: false, normalize: true,
        });
      } catch (e2) {
        console.warn(`[Feed] ${src.id} parse failed: ${e2.message?.slice(0,60)}`);
        return [];
      }
    }

    const channel = parsed?.rss?.channel || parsed?.feed || parsed?.['rdf:RDF']?.channel || {};
    const items   = channel.item || channel.entry || parsed?.rss?.channel?.item || [];
    const arr     = Array.isArray(items) ? items : (items ? [items] : []);

    if (!arr.length) {
      console.warn(`[Feed] ${src.id} no items found`);
      return [];
    }

    const articles = arr.slice(0, 20).map(item => {
      const title   = clean(item.title?._?.toString() || item.title?.toString() || '');
      const desc    = clean(
        item.description?._?.toString() || item.description?.toString() ||
        item.summary?._?.toString()     || item.summary?.toString()     ||
        item['content:encoded']?.toString() || ''
      );
      const rawLink = item.link || item.url || '';
      const link = typeof rawLink === 'object'
        ? (rawLink?.$?.href || rawLink?._ || Object.values(rawLink)[0] || '')
        : String(rawLink);
      const pub = item.pubDate || item.published || item.updated || item['dc:date'] || new Date().toISOString();
      
      if (!title || title.length < 8) return null;
      return processArticle({ title, desc, link: link.trim(), pub, source: src.name }, src.id);
    }).filter(Boolean);

    console.log(`[Feed] ${src.id}: ${articles.length}/${arr.length} articles`);
    return articles;

  } catch (e) {
    console.warn(`[Feed] ${src.id} error: ${e.message?.slice(0,80)}`);
    return [];
  } finally {
    clearTimeout(t);
  }
}

async function buildFeed() {
  const activeSources = sources.sources.filter(s => (s.priority||1) <= 2);
  console.log(`[Feed] Fetching ${activeSources.length} sources`);
  
  const results = await Promise.allSettled(activeSources.map(s => fetchFeed(s)));
  
  let all = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(a => a && a.title)
    .sort((a, b) => new Date(b.pub) - new Date(a.pub));

  // Deduplicate
  const seen = new Set();
  all = all.filter(a => {
    const k = a.title.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,50);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 150);

  console.log(`[Feed] Built ${all.length} articles from ${activeSources.length} sources`);
  return all;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const now = Date.now();

  // Debug endpoint
  if (req.query.debug === '1') {
    const src = sources.sources.find(s => s.id === req.query.src);
    if (src) {
      const articles = await fetchFeed(src);
      return res.json({ source: src.id, count: articles.length, articles: articles.slice(0,3) });
    }
    return res.json({ sources: sources.sources.map(s => s.id) });
  }

  // Cron refresh
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

  // Cold start — build fresh
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
