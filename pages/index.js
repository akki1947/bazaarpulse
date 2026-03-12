import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import ArticleCard from '../components/ui/ArticleCard';
import FilterBar from '../components/ui/FilterBar';

const fetcher = url => fetch(url).then(r => r.json());

function SkeletonCard() {
  return (
    <div style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
      <div className="skel" style={{height:10,width:'30%',marginBottom:8}}/>
      <div className="skel" style={{height:14,width:'90%',marginBottom:5}}/>
      <div className="skel" style={{height:12,width:'70%',marginBottom:8}}/>
      <div className="skel" style={{height:10,width:'25%'}}/>
    </div>
  );
}

function MarketSnapshot() {
  const { data } = useSWR('/api/market?type=indices', fetcher, { refreshInterval:180000 });
  const items = data?.data?.slice(0,6) || [];
  return (
    <div className="widget">
      <div className="w-head">
        <span style={{color:'var(--green)'}}>●</span> Market Snapshot
        <span style={{marginLeft:'auto',color:'var(--dim)',fontSize:'0.58rem'}}>Live · 3-min refresh</span>
      </div>
      <div className="w-body" style={{padding:0}}>
        <table className="ptable" style={{margin:0}}>
          <thead>
            <tr>
              <th>Index</th>
              <th style={{textAlign:'right'}}>Price</th>
              <th style={{textAlign:'right'}}>Chg%</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? items.map((q,i) => {
              const p = q.price >= 1000 ? q.price.toLocaleString('en-IN',{maximumFractionDigits:0}) : q.price?.toFixed(2);
              const c = `${q.change>=0?'+':''}${q.changePct?.toFixed(2)}%`;
              return (
                <tr key={i}>
                  <td style={{color:'var(--muted)'}}>{q.name}</td>
                  <td style={{textAlign:'right',fontWeight:500}}>{p}</td>
                  <td style={{textAlign:'right'}} className={q.change>=0?'up':'dn'}>{c}</td>
                </tr>
              );
            }) : [1,2,3,4,5,6].map(i => (
              <tr key={i}>
                <td><div className="skel" style={{height:10,width:80}}/></td>
                <td><div className="skel" style={{height:10,width:60,marginLeft:'auto'}}/></td>
                <td><div className="skel" style={{height:10,width:40,marginLeft:'auto'}}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeedStatus({ total, filtered, lastUpdated }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12,fontSize:'0.6rem',color:'var(--dim)',letterSpacing:'0.06em'}}>
      <span style={{color:'var(--green)',display:'flex',alignItems:'center',gap:4}}>
        <span className="status-dot open" style={{width:5,height:5}}/>
        Live
      </span>
      <span>{filtered} of {total} stories</span>
      {lastUpdated && <span>Updated {lastUpdated}</span>}
    </div>
  );
}

export default function NewsPage() {
  const [sev, setSev] = useState('ALL');
  const [cat, setCat] = useState('ALL');
  const { data, error, isLoading } = useSWR('/api/feed', fetcher, {
    refreshInterval: 5*60*1000,
    revalidateOnFocus: false,
  });

  const articles = data?.articles || [];

  const counts = useMemo(() => {
    const c = { ALL: articles.length, CRITICAL:0, MAJOR:0, MINOR:0 };
    articles.forEach(a => {
      c[a.severity] = (c[a.severity]||0)+1;
      c[a.category] = (c[a.category]||0)+1;
    });
    return c;
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter(a =>
      (sev==='ALL' || a.severity===sev) &&
      (cat==='ALL' || a.category===cat)
    );
  }, [articles, sev, cat]);

  const hero = filtered[0];
  const rest  = filtered.slice(1);

  return (
    <Layout title="News Feed" desc="Live India financial news, categorised by sector and severity">
      <div className="shell">
        {/* ── Main ── */}
        <div className="shell-main">
          <div className="slbl">
            <span className="slbl-dot"/>
            News Feed
            <span className="slbl-count">{filtered.length} stories</span>
          </div>

          <FilterBar sev={sev} cat={cat} onSev={setSev} onCat={setCat} counts={counts} />

          {error && (
            <div style={{padding:16,background:'var(--raised)',border:'1px solid var(--border)',color:'var(--red)',fontSize:'0.75rem',marginBottom:16,fontFamily:'var(--font-mono)'}}>
              ⚠ Failed to load feed. Retrying…
            </div>
          )}

          {isLoading ? (
            Array.from({length:8}).map((_,i) => <SkeletonCard key={i}/>)
          ) : (
            <>
              {hero && <ArticleCard article={hero} hero />}
              {rest.map(a => <ArticleCard key={a.id} article={a} />)}
              {filtered.length===0 && !isLoading && (
                <div style={{padding:32,textAlign:'center',color:'var(--muted)',fontSize:'0.75rem'}}>
                  No stories match the current filters.
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Aside ── */}
        <div className="shell-aside">
          <MarketSnapshot />

          <div className="widget">
            <div className="w-head">📊 Priority Breakdown</div>
            <div className="w-body">
              {[['CRITICAL','var(--red)'],['MAJOR','var(--yellow)'],['MINOR','var(--dim)']].map(([s,col]) => (
                <div key={s} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:'0.65rem',letterSpacing:'0.1em',textTransform:'uppercase',color:col}}>{s}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--bright)'}}>{counts[s]||0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="widget">
            <div className="w-head">🇮🇳 Top Sectors</div>
            <div className="w-body">
              {Object.entries(counts)
                .filter(([k]) => !['ALL','CRITICAL','MAJOR','MINOR'].includes(k))
                .sort((a,b)=>b[1]-a[1])
                .slice(0,6)
                .map(([id,cnt]) => {
                  const c = require('../data/categories.json').categories.find(x=>x.id===id);
                  return c ? (
                    <div key={id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'0.7rem',color:'var(--body)'}}>{c.icon} {c.label}</span>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.7rem',color:'var(--dim)'}}>{cnt}</span>
                    </div>
                  ) : null;
                })}
            </div>
          </div>

          <div style={{padding:12,background:'var(--raised)',border:'1px solid var(--border)',fontSize:'0.62rem',color:'var(--dim)',lineHeight:1.9}}>
            <div style={{color:'var(--muted)',fontWeight:600,marginBottom:6,letterSpacing:'0.1em',textTransform:'uppercase',fontSize:'0.58rem'}}>About</div>
            BazaarPulse aggregates India financial news from ET, Mint, BS, NDTV, RBI, SEBI and 15+ sources. Stories are scored for severity and categorised by sector. "Retail Impact" summaries are system-generated and not financial advice.
          </div>
        </div>
      </div>
    </Layout>
  );
}
