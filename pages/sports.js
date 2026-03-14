import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import ArticleCard from '../components/ui/ArticleCard';

const fetcher = url => fetch(url).then(r => r.json());

const SCHEDULE = [
  {
    sport:'🏏 Cricket', event:'IPL 2026', dates:'Mar 22 – May 25, 2026', status:'UPCOMING',
    line1:'10 franchises battle for the title across 74 matches at home venues.',
    line2:'Tata title sponsor. Live on Star Sports and JioCinema. ₹16,347 Cr revenue expected.',
  },
  {
    sport:'🏏 Cricket', event:'ICC Champions Trophy 2026', dates:'Feb 19 – Mar 9, 2026', status:'COMPLETED',
    line1:'India won the tournament, defeating Pakistan in the final at Dubai.',
    line2:'Rohit Sharma Player of Tournament. Pakistan and UAE co-hosted. 8 teams participated.',
  },
  {
    sport:'🏏 Cricket', event:'India vs England Test Series', dates:'Jun – Jul 2026', status:'UPCOMING',
    line1:'5-match Test series in England. India\'s first Test tour to England since 2022.',
    line2:'Critical for WTC 2025-27 cycle standings. Jasprit Bumrah fitness key variable.',
  },
  {
    sport:'🏏 Cricket', event:'Asia Cup 2026', dates:'Sep 2026 (TBC)', status:'UPCOMING',
    line1:'India, Pakistan, Sri Lanka, Bangladesh, Afghanistan and UAE in contention.',
    line2:'Host nation TBC. Rights with Star Network India. T20 format expected.',
  },
  {
    sport:'⚽ Football', event:'UEFA Champions League 2025-26', dates:'Sep 2025 – Jun 2026', status:'ACTIVE',
    line1:'Quarter-final stage underway. Real Madrid, Bayern, Man City, Arsenal among contenders.',
    line2:'New 36-team league phase format introduced this season. Final at Munich Allianz Arena.',
  },
  {
    sport:'⚽ Football', event:'FIFA World Cup 2026', dates:'Jun 11 – Jul 19, 2026', status:'UPCOMING',
    line1:'First ever 48-team World Cup across USA, Canada and Mexico — 16 venues.',
    line2:'India did not qualify. Streaming rights held by JioCinema + Sony Sports for Indian viewers.',
  },
  {
    sport:'⚽ Football', event:'Indian Super League 2025-26', dates:'Oct 2025 – Apr 2026', status:'ACTIVE',
    line1:'12 teams. Mumbai City FC defending champions. 131 matches this season.',
    line2:'Broadcast on Star Sports. Reliance and Tata major sponsors. Growing viewership.',
  },
  {
    sport:'🎾 Tennis', event:'French Open 2026 (Roland Garros)', dates:'May 25 – Jun 8, 2026', status:'UPCOMING',
    line1:'Clay court Grand Slam in Paris. Defending champion Carlos Alcaraz (Men).',
    line2:'Iga Swiatek dominates women\'s clay. Indian hope: Sumit Nagal in qualifiers.',
  },
  {
    sport:'🎾 Tennis', event:'Wimbledon 2026', dates:'Jun 29 – Jul 12, 2026', status:'UPCOMING',
    line1:'Grass court Grand Slam at the All England Club. Carlos Alcaraz defending.',
    line2:'BBC + Star Sports India broadcast. Prize money £50M+. Dress code: all white.',
  },
  {
    sport:'🎾 Tennis', event:'US Open 2026', dates:'Aug 24 – Sep 6, 2026', status:'UPCOMING',
    line1:'Hard court Grand Slam at Flushing Meadows, New York. Night session spectacle.',
    line2:'Biggest prize money in tennis. Jannik Sinner defending men\'s title.',
  },
  {
    sport:'🏑 Hockey', event:'FIH Hockey Pro League 2025-26', dates:'Jan – Jun 2026', status:'ACTIVE',
    line1:'India ranked 4th globally. Home and away round-robin format across 9 nations.',
    line2:'India host Netherlands and Germany at Rourkela/Bhubaneswar in April 2026.',
  },
  {
    sport:'🏑 Hockey', event:'Hockey India League (HIL) 2026', dates:'Jan – Feb 2026', status:'COMPLETED',
    line1:'Revived after 8-year hiatus. 6 franchises. Soorma HC won the inaugural title.',
    line2:'Broadcast on Star Sports. Dutch, Belgian, Australian stars featured as marquee players.',
  },
  {
    sport:'🏸 Badminton', event:'BWF World Tour Finals 2026', dates:'Dec 2026 (TBC)', status:'UPCOMING',
    line1:'Season-ending championship for top-8 ranked players. Singapore likely host.',
    line2:'PV Sindhu targeting return to form. HS Prannoy defending ranking points.',
  },
  {
    sport:'🏎 Formula 1', event:'F1 2026 Season', dates:'Mar – Nov 2026', status:'ACTIVE',
    line1:'New 2026 regulations: smaller cars, sustainable fuel, active aero, new power units.',
    line2:'Lewis Hamilton debuts at Ferrari. Max Verstappen defending 4-time champion at Red Bull.',
  },
];

const BUSINESS_IMPACT = [
  { company:'Star Sports / Disney+ Hotstar', angle:'IPL broadcast rights',  val:'₹48,390 Cr', note:'5-year exclusive TV rights deal for IPL (2023-27). Single largest sports media deal in India history.' },
  { company:'JioCinema (Reliance)',          angle:'IPL digital rights',    val:'₹23,758 Cr', note:'Digital streaming rights for IPL. 650M+ peak viewers in 2025. Free on JioCinema app.' },
  { company:'Dream11 / MPL',                angle:'Fantasy sports market',  val:'₹25,000 Cr', note:'India\'s fantasy sports industry. Dream11 at $8B valuation. Dream11 is IPL co-sponsor at ₹222 Cr/yr.' },
  { company:'Tata Group',                   angle:'IPL title sponsor',      val:'₹335 Cr/yr', note:'Multi-brand visibility for Tata Motors, Tata Salt, TataPlay etc. across IPL season.' },
  { company:'BCCI',                         angle:'Cricket revenue',        val:'₹18,000 Cr', note:'BCCI annual revenue FY26. Richest cricket board globally. Tax-exempt status under debate.' },
  { company:'Nike / Adidas India',          angle:'Sports endorsements',    val:'Growing',    note:'Virat Kohli → Nike (₹110 Cr/yr). Rohit Sharma → Adidas. Sports apparel market ₹50,000 Cr by 2027.' },
  { company:'Sporta Technologies (Dream11)',angle:'IPO pipeline',           val:'Awaited',    note:'Dream11 parent exploring IPO. Gaming regulation risk is key overhang for investors.' },
  { company:'Sony Sports / Ten Network',    angle:'Tennis + Football',      val:'Rights Heavy',note:'Wimbledon, US Open, La Liga, Bundesliga India rights. Premium sports viewer demographic.' },
];

const STATUS_COL = { UPCOMING:'var(--yellow)', ACTIVE:'var(--green)', COMPLETED:'var(--dim)' };

export default function SportsPage() {
  const [tab, setTab] = useState('news');
  const { data } = useSWR('/api/feed', fetcher, { revalidateOnFocus:false });
  const sportsNews = (data?.articles||[]).filter(a => a.category==='sports').slice(0,30);

  return (
    <Layout title="Sports" desc="Cricket, football, tennis, hockey news — schedule, results and sports business impact">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl">
            <span className="slbl-dot" style={{background:'var(--orange)'}}/>
            Sports
            <span className="slbl-count">{SCHEDULE.length} events tracked</span>
          </div>

          <div style={{display:'flex',gap:0,marginBottom:20,borderBottom:'1px solid var(--border)',overflowX:'auto'}}>
            {[
              {id:'news',     label:'Live News'},
              {id:'schedule', label:'Schedule & Results'},
              {id:'business', label:'Business Impact'},
            ].map(t => (
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
                : <div style={{padding:32,textAlign:'center',color:'var(--muted)',fontSize:'var(--fs-sm)',lineHeight:1.8}}>
                    No sports stories in current feed.<br/>
                    <span style={{fontSize:'var(--fs-xs)',color:'var(--dim)'}}>Sources publish sports content around match days and major events.</span>
                  </div>
              }
            </div>
          )}

          {tab==='schedule' && (
            <div>
              {/* Group by sport */}
              {['🏏 Cricket','⚽ Football','🎾 Tennis','🏑 Hockey','🏸 Badminton','🏎 Formula 1'].map(sportGroup => {
                const events = SCHEDULE.filter(s => s.sport === sportGroup);
                if (!events.length) return null;
                return (
                  <div key={sportGroup} style={{marginBottom:24}}>
                    <div style={{fontSize:'var(--fs-base)',fontWeight:700,color:'var(--bright)',
                      paddingBottom:8,marginBottom:12,borderBottom:'1px solid var(--border)'}}>
                      {sportGroup}
                    </div>
                    {events.map((s,i) => (
                      <div key={i} style={{display:'flex',gap:14,padding:'13px 0',
                        borderBottom:'1px solid var(--border)'}}>
                        <div style={{flexShrink:0,paddingTop:3}}>
                          <div style={{width:8,height:8,borderRadius:'50%',
                            background:STATUS_COL[s.status]||'var(--dim)'}}/>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',
                            gap:8,marginBottom:5}}>
                            <span style={{fontSize:'var(--fs-md)',fontWeight:700,color:'var(--bright)',
                              fontFamily:'var(--font-sans)'}}>{s.event}</span>
                            <span style={{marginLeft:'auto',fontSize:'var(--fs-label)',
                              color:STATUS_COL[s.status],border:`1px solid ${STATUS_COL[s.status]}`,
                              padding:'2px 7px',borderRadius:2,fontWeight:600,flexShrink:0}}>{s.status}</span>
                          </div>
                          <div style={{fontSize:'var(--fs-xs)',color:'var(--blue)',
                            marginBottom:6,fontWeight:500}}>{s.dates}</div>
                          <div style={{fontSize:'var(--fs-sm)',color:'var(--body)',
                            lineHeight:1.6,marginBottom:4}}>{s.line1}</div>
                          <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)',
                            lineHeight:1.6}}>{s.line2}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {tab==='business' && (
            <div>
              <div style={{padding:'10px 14px',background:'var(--raised)',borderLeft:'2px solid var(--orange)',
                fontSize:'var(--fs-sm)',color:'var(--body)',lineHeight:1.7,marginBottom:16}}>
                💡 India sports industry valued at ₹15,000+ Cr annually. IPL alone generates ₹16,000 Cr. 
                Media rights, fantasy sports, sponsorship and apparel are the four main investment angles for listed and unlisted companies.
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
                {BUSINESS_IMPACT.map((b,i) => (
                  <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',padding:'12px 14px'}}>
                    <div style={{fontSize:'var(--fs-base)',fontWeight:700,color:'var(--bright)',
                      marginBottom:5,fontFamily:'var(--font-sans)'}}>{b.company}</div>
                    <div style={{display:'flex',justifyContent:'space-between',
                      alignItems:'center',marginBottom:7}}>
                      <span style={{fontSize:'var(--fs-label)',color:'var(--orange)'}}>{b.angle}</span>
                      <span style={{fontSize:'var(--fs-sm)',fontWeight:700,color:'var(--blue)',
                        fontFamily:'var(--font-mono)'}}>{b.val}</span>
                    </div>
                    <div style={{fontSize:'var(--fs-xs)',color:'var(--body)',lineHeight:1.65}}>{b.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shell-aside">
          <div className="widget">
            <div className="w-head">🏆 Events Calendar</div>
            <div className="w-body" style={{padding:0}}>
              {SCHEDULE.filter(s=>s.status!=='COMPLETED').slice(0,8).map((s,i)=>(
                <div key={i} style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',
                    alignItems:'flex-start',marginBottom:3}}>
                    <span style={{fontSize:'var(--fs-xs)',fontWeight:600,
                      color:'var(--bright)',flex:1,paddingRight:8}}>{s.event}</span>
                    <span style={{fontSize:'var(--fs-label)',color:STATUS_COL[s.status],
                      flexShrink:0}}>{s.status}</span>
                  </div>
                  <div style={{fontSize:'var(--fs-label)',color:'var(--muted)'}}>{s.sport}</div>
                  <div style={{fontSize:'var(--fs-label)',color:'var(--dim)',marginTop:1}}>{s.dates}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{marginTop:12,padding:12,background:'var(--raised)',border:'1px solid var(--border)',
            fontSize:'var(--fs-xs)',color:'var(--muted)',lineHeight:1.9}}>
            <div style={{color:'var(--body)',fontWeight:600,marginBottom:6,letterSpacing:'0.08em',
              textTransform:'uppercase',fontSize:'var(--fs-label)'}}>Coverage</div>
            Cricket · Football · Tennis · Hockey · Badminton · Formula 1.<br/>
            Sports content updates on match days. Business data updated manually.
          </div>
        </div>
      </div>
    </Layout>
  );
}
