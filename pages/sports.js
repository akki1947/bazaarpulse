import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import ArticleCard from '../components/ui/ArticleCard';

const fetcher = url => fetch(url).then(r => r.json());

const SCHEDULE = [
  { sport:'🏏 Cricket', event:'IPL 2026',               dates:'Mar 22 – May 25, 2026', status:'UPCOMING', note:'10 teams. Tata title sponsor. Star Sports + JioCinema.' },
  { sport:'🏏 Cricket', event:'ICC Champions Trophy',   dates:'Feb 19 – Mar 9, 2026',  status:'COMPLETED',note:'India won. Rohit Sharma. Pakistan co-hosts.' },
  { sport:'⚽ Football',event:'UEFA Champions League',  dates:'Sep 2025 – Jun 2026',   status:'ACTIVE',   note:'QF stage. Real Madrid defending champions.' },
  { sport:'⚽ Football',event:'FIFA World Cup 2026',    dates:'Jun 11 – Jul 19, 2026', status:'UPCOMING', note:'USA/Canada/Mexico. 48 teams. First expanded edition.' },
  { sport:'🎾 Tennis',  event:'French Open (Roland Garros)','dates':'May 25 – Jun 8, 2026',status:'UPCOMING',note:'Clay court Grand Slam. Paris.' },
  { sport:'🎾 Tennis',  event:'Wimbledon 2026',         dates:'Jun 29 – Jul 12, 2026', status:'UPCOMING', note:'Grass court Grand Slam. London.' },
  { sport:'🏑 Hockey',  event:'FIH Pro League 2025-26', dates:'Jan – Jun 2026',        status:'ACTIVE',   note:'India ranked 4th. Home and away format.' },
  { sport:'🏎 F1',      event:'Formula 1 2026 Season',  dates:'Mar – Nov 2026',        status:'ACTIVE',   note:'New power unit regs. 24 races. Hamilton at Ferrari.' },
];

const BUSINESS_IMPACT = [
  { company:'Star Sports / Disney+',  angle:'IPL media rights', val:'₹48,390 Cr', note:'5-year deal for IPL broadcast rights. Revenue driver.' },
  { company:'JioCinema (Reliance)',   angle:'IPL digital rights',val:'₹23,758 Cr', note:'Digital streaming. 650M+ viewers in 2025.' },
  { company:'Dream11',               angle:'Fantasy sports',    val:'$8B valuation',note:'India\'s largest fantasy sports. IPO expected.' },
  { company:'BYJU\'S / EdTech Logos', angle:'IPL sponsorship',  val:'Pulled back', note:'Financial stress caused major sponsor exits.' },
  { company:'Tata Group',            angle:'IPL title sponsor', val:'₹335 Cr/yr',  note:'Multi-brand visibility: Tata Motors, Tata Salt, etc.' },
  { company:'Nike / Adidas',         angle:'Kit & endorsement', val:'Global',      note:'Virat, Rohit → Nike. Sports apparel listed companies.' },
];

const STATUS_COL = { UPCOMING:'var(--yellow)', ACTIVE:'var(--green)', COMPLETED:'var(--dim)' };

export default function SportsPage() {
  const [tab, setTab] = useState('news');
  const { data } = useSWR('/api/feed', fetcher, { revalidateOnFocus:false });
  const sportsNews = (data?.articles||[]).filter(a => a.category==='sports').slice(0,30);

  return (
    <Layout title="Sports" desc="Cricket, football, tennis, hockey news and sports business impact">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl">
            <span className="slbl-dot" style={{background:'var(--orange)'}}/>
            Sports
          </div>

          <div style={{display:'flex',gap:0,marginBottom:20,borderBottom:'1px solid var(--border)',overflowX:'auto'}}>
            {[{id:'news',label:'Live News'},{id:'schedule',label:'Schedule'},{id:'business',label:'Business Impact'}].map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{padding:'7px 16px',background:'none',border:'none',whiteSpace:'nowrap',
                  fontSize:'var(--fs-label)',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',
                  color:tab===t.id?'var(--bright)':'var(--muted)',
                  borderBottom:tab===t.id?'2px solid var(--orange)':'2px solid transparent',
                  cursor:'pointer',transition:'all 0.12s'}}>
                {t.label}
              </button>
            ))}
          </div>

          {tab==='news' && (
            <div>
              {sportsNews.length
                ? sportsNews.map(a => <ArticleCard key={a.id} article={a}/>)
                : <div style={{padding:32,textAlign:'center',color:'var(--muted)',fontSize:'var(--fs-sm)'}}>
                    No sports stories in current feed. Stories will appear as sources publish sports content.
                  </div>
              }
            </div>
          )}

          {tab==='schedule' && (
            <div>
              {SCHEDULE.map((s,i) => (
                <div key={i} style={{display:'flex',gap:14,padding:'13px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{flexShrink:0,paddingTop:2}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:STATUS_COL[s.status]||'var(--dim)'}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:8,marginBottom:4}}>
                      <span style={{fontSize:'var(--fs-label)',color:'var(--muted)'}}>{s.sport}</span>
                      <span style={{fontSize:'var(--fs-base)',fontWeight:700,color:'var(--bright)',fontFamily:'var(--font-sans)'}}>{s.event}</span>
                      <span style={{marginLeft:'auto',fontSize:'var(--fs-label)',
                        color:STATUS_COL[s.status],border:`1px solid ${STATUS_COL[s.status]}`,
                        padding:'1px 6px',borderRadius:2}}>{s.status}</span>
                    </div>
                    <div style={{fontSize:'var(--fs-xs)',color:'var(--blue)',marginBottom:3}}>{s.dates}</div>
                    <div style={{fontSize:'var(--fs-xs)',color:'var(--body)',lineHeight:1.5}}>{s.note}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab==='business' && (
            <div>
              <div style={{padding:'8px 12px',background:'var(--raised)',borderLeft:'2px solid var(--orange)',
                fontSize:'var(--fs-xs)',color:'var(--body)',lineHeight:1.7,marginBottom:16}}>
                💡 Sports is a ₹15,000+ Cr annual industry in India. IPL alone generates ₹15,000 Cr revenue. Media rights, sponsorship, fantasy sports and apparel are key investment angles.
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
                {BUSINESS_IMPACT.map((b,i) => (
                  <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',padding:'12px 14px'}}>
                    <div style={{fontSize:'var(--fs-base)',fontWeight:700,color:'var(--bright)',marginBottom:4,fontFamily:'var(--font-sans)'}}>{b.company}</div>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:'var(--fs-label)',color:'var(--orange)'}}>{b.angle}</span>
                      <span style={{fontSize:'var(--fs-sm)',fontWeight:700,color:'var(--blue)',fontFamily:'var(--font-mono)'}}>{b.val}</span>
                    </div>
                    <div style={{fontSize:'var(--fs-xs)',color:'var(--body)',lineHeight:1.6}}>{b.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shell-aside">
          <div className="widget">
            <div className="w-head">🏆 Sports Calendar</div>
            <div className="w-body" style={{padding:0}}>
              {SCHEDULE.filter(s=>s.status!=='COMPLETED').map((s,i)=>(
                <div key={i} style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}>
                    <span style={{fontSize:'var(--fs-xs)',fontWeight:600,color:'var(--body)'}}>{s.event}</span>
                    <span style={{fontSize:'var(--fs-label)',color:STATUS_COL[s.status]}}>{s.status}</span>
                  </div>
                  <div style={{fontSize:'var(--fs-label)',color:'var(--muted)'}}>{s.sport} · {s.dates}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
