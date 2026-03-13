import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import ArticleCard from '../components/ui/ArticleCard';
import FilterBar from '../components/ui/FilterBar';
import catsData from '../data/categories.json';

const fetcher = url => fetch(url).then(r => r.json());

function SkeletonCard() {
  return (
    <div style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
      <div className="skel" style={{height:9,width:'28%',marginBottom:8}}/>
      <div className="skel" style={{height:14,width:'92%',marginBottom:5}}/>
      <div className="skel" style={{height:11,width:'68%',marginBottom:8}}/>
      <div className="skel" style={{height:9,width:'22%'}}/>
    </div>
  );
}

export default function NewsPage() {
  const [sev, setSev] = useState('ALL');
  const [cat, setCat] = useState('ALL');

  const { data, error, isLoading } = useSWR('/api/feed', fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
  });

  const articles = data?.articles || [];

  const counts = useMemo(() => {
    const c = { ALL: articles.length, CRITICAL:0, MAJOR:0, MINOR:0 };
    articles.forEach(a => {
      c[a.severity] = (c[a.severity]||0) + 1;
      c[a.category] = (c[a.category]||0) + 1;
    });
    return c;
  }, [articles]);

  const filtered = useMemo(() =>
    articles.filter(a =>
      (sev === 'ALL' || a.severity === sev) &&
      (cat === 'ALL' || a.category === cat)
    ), [articles, sev, cat]);

  const hero = filtered[0];
  const rest = filtered.slice(1);

  return (
    <Layout title="News Feed" desc="Live India financial news, categorised by sector and severity">
      <div className="shell">
        {/* Main */}
        <div className="shell-main">
          <div className="slbl">
            <span className="slbl-dot"/>
            News Feed
            <span className="slbl-count">{filtered.length} stories</span>
          </div>

          <FilterBar sev={sev} cat={cat} onSev={setSev} onCat={setCat} counts={counts} />

          {error && (
            <div style={{padding:14,background:'var(--raised)',border:'1px solid var(--border)',
              borderLeft:'3px solid var(--red)',color:'var(--red)',fontSize:'0.72rem',marginBottom:16}}>
              ⚠ Feed failed to load. Try refreshing.
            </div>
          )}

          {isLoading
            ? Array.from({length:8}).map((_,i) => <SkeletonCard key={i}/>)
            : <>
                {hero && <ArticleCard article={hero} hero />}
                {rest.map(a => <ArticleCard key={a.id} article={a}/>)}
                {!isLoading && filtered.length === 0 && (
                  <div style={{padding:32,textAlign:'center',color:'var(--muted)',fontSize:'0.75rem'}}>
                    No stories match current filters.
                  </div>
                )}
              </>
          }
        </div>

        {/* Aside */}
        <div className="shell-aside">
          <div className="widget">
            <div className="w-head">📊 Priority Breakdown</div>
            <div className="w-body">
              {[['CRITICAL','var(--red)'],['MAJOR','var(--yellow)'],['MINOR','var(--dim)']].map(([s,col]) => (
                <div key={s} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:'0.65rem',letterSpacing:'0.1em',textTransform:'uppercase',color:col}}>{s}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--bright)',fontSize:'0.82rem'}}>{counts[s]||0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="widget">
            <div className="w-head">🇮🇳 Top Sectors</div>
            <div className="w-body">
              {Object.entries(counts)
                .filter(([k]) => !['ALL','CRITICAL','MAJOR','MINOR'].includes(k))
                .sort((a,b) => b[1]-a[1])
                .slice(0,8)
                .map(([id,cnt]) => {
                  const c = catsData.categories.find(x => x.id===id);
                  return c ? (
                    <div key={id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                      padding:'5px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:'0.7rem',color:'var(--body)'}}>{c.icon} {c.label}</span>
                      <span style={{fontFamily:'var(--font-mono)',fontSize:'0.7rem',color:'var(--dim)'}}>{cnt}</span>
                    </div>
                  ) : null;
                })}
            </div>
          </div>

          <div style={{padding:12,background:'var(--raised)',border:'1px solid var(--border)',
            fontSize:'0.62rem',color:'var(--dim)',lineHeight:1.9}}>
            <div style={{color:'var(--muted)',fontWeight:600,marginBottom:6,letterSpacing:'0.1em',
              textTransform:'uppercase',fontSize:'0.58rem'}}>About</div>
            Aggregates India finance news from ET, Mint, BS, NDTV, RBI, SEBI and 15+ sources.
            Auto-scored for severity. "Retail Impact" summaries are system-generated, not financial advice.
          </div>
        </div>
      </div>
    </Layout>
  );
}
