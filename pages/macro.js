import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import macro from '../data/macro.json';

const fetcher = url => fetch(url).then(r => r.json());

const STATUS_COLOR = { strong:'var(--green)', easing:'var(--blue)', normal:'var(--muted)', warning:'var(--yellow)', stress:'var(--red)' };

function KpiCard({ item }) {
  const [exp, setExp] = useState(false);
  const tCol = item.trend==='up'?'var(--green)':item.trend==='down'?'var(--red)':'var(--dim)';
  const sCol = STATUS_COLOR[item.status]||'var(--muted)';
  const tIcon = item.trend==='up'?'▲':item.trend==='down'?'▼':'─';
  return (
    <div className="kpi-card" style={{cursor:'pointer'}} onClick={()=>setExp(e=>!e)}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div className="kpi-lbl">{item.label}</div>
        <span style={{fontSize:'var(--fs-label)',letterSpacing:'0.08em',textTransform:'uppercase',
          color:sCol,border:`1px solid ${sCol}`,padding:'2px 7px',borderRadius:2,fontWeight:600}}>{item.status}</span>
      </div>
      <div className="kpi-val">{item.value}</div>
      <div className="kpi-meta" style={{marginTop:6}}>
        <span style={{color:tCol,fontWeight:600}}>{tIcon} {item.prev}</span>
        <span style={{color:'var(--border2)'}}>·</span>
        <span style={{color:'var(--muted)'}}>{item.period}</span>
      </div>
      <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)',marginTop:5}}>
        {item.source} · Target: <span style={{color:'var(--body)'}}>{item.target}</span>
      </div>
      {exp && item.note && (
        <div style={{marginTop:10,padding:'8px 10px',background:'var(--raised)',
          borderLeft:'2px solid var(--blue)',fontSize:'var(--fs-sm)',color:'var(--body)',lineHeight:1.65}}>
          {item.note}
        </div>
      )}
    </div>
  );
}

function RbiTimeline() {
  const cols = { cut:'var(--green)', hike:'var(--red)', hold:'var(--yellow)' };
  const icons = { cut:'▼', hike:'▲', hold:'●' };
  return (
    <div className="widget" style={{marginBottom:0}}>
      <div className="w-head">🏦 RBI Monetary Policy Timeline</div>
      <div className="w-body">
        {macro.rbiTimeline.map((item,i) => (
          <div key={i} style={{display:'flex',gap:14,paddingBottom:i===macro.rbiTimeline.length-1?0:18}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:cols[item.type]||'var(--dim)',flexShrink:0,marginTop:3}}/>
              {i<macro.rbiTimeline.length-1 && <div style={{width:1,flex:1,background:'var(--border)',marginTop:4}}/>}
            </div>
            <div>
              <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)',marginBottom:3}}>{item.date}</div>
              <div style={{fontSize:'var(--fs-base)',fontWeight:600,color:'var(--bright)',marginBottom:4}}>
                <span style={{color:cols[item.type]||'var(--dim)',marginRight:6}}>{icons[item.type]||'●'}</span>
                {item.event}
              </div>
              <div style={{fontSize:'var(--fs-sm)',color:'var(--body)',lineHeight:1.6}}>{item.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const MPC_CALENDAR = [
  { date:'Apr 9, 2026',  note:'Rate decision expected. Market pricing 25bps cut.', upcoming:true  },
  { date:'Jun 6, 2026',  note:'Second meeting of FY27.',                           upcoming:false },
  { date:'Aug 6, 2026',  note:'Third meeting of FY27.',                            upcoming:false },
];

const SECTIONS = [
  { id:'inflation', label:'Inflation Pulse',  icon:'🌡', ids:['cpi','wpi'],
    insight:'CPI at 4.31% is within RBI comfort band (2–6%). Food inflation is the key swing factor. WPI easing signals producer-level pressure is subsiding.' },
  { id:'growth',    label:'Growth Engines',   icon:'⚡', ids:['gdp','iip'],
    insight:'GDP at 6.4% is robust but moderating from the post-COVID peak. IIP at 5.0% shows manufacturing recovery. Services sector remains the primary growth driver.' },
  { id:'fiscal',    label:'Fiscal Health',    icon:'🏛', ids:['fiscal-deficit','gst'],
    insight:'GST at ₹1.84L Cr beats monthly average, supporting fiscal consolidation. Fiscal deficit of 4.4% GDP is on track with the consolidation glide path.' },
  { id:'external',  label:'External Sector',  icon:'🌐', ids:['forex-reserve','repo'],
    insight:'Forex reserves at $620.7B provide ~11 months import cover. RBI Feb 2026 cut signals a pivot toward growth support from inflation control.' },
];

export default function MacroPage() {
  const { data } = useSWR('/api/feed', fetcher, { revalidateOnFocus:false });
  const macroNews = (data?.articles||[])
    .filter(a => ['economy','banking','government','forex'].includes(a.category))
    .slice(0, 6);

  return (
    <Layout title="Macro Economy" desc="India macroeconomic indicators — GDP, CPI, Repo Rate, Forex Reserves, fiscal data">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl">
            <span className="slbl-dot"/>
            Macro Economy
            <span className="slbl-count">Updated {macro.lastUpdated}</span>
          </div>

          {SECTIONS.map(sec => {
            const items = sec.ids.map(id=>macro.indicators.find(x=>x.id===id)).filter(Boolean);
            return (
              <div key={sec.id} style={{marginBottom:28}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,
                  paddingBottom:8,borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:'1.1rem'}}>{sec.icon}</span>
                  <span style={{fontSize:'var(--fs-base)',fontWeight:700,color:'var(--bright)'}}>{sec.label}</span>
                </div>
                <div className="kpi-grid" style={{marginBottom:12}}>
                  {items.map(it=><KpiCard key={it.id} item={it}/>)}
                </div>
                <div style={{padding:'10px 14px',background:'var(--raised)',borderLeft:'2px solid var(--blue)',
                  fontSize:'var(--fs-sm)',color:'var(--body)',lineHeight:1.7}}>
                  💡 {sec.insight}
                </div>
              </div>
            );
          })}
        {/* Macro news brief */}
          {macroNews.length > 0 && (
            <div style={{marginTop:8}}>
              <div className="slbl" style={{marginTop:20}}>
                <span className="slbl-dot" style={{background:'var(--yellow)'}}/>
                Macro News Brief
                <span className="slbl-count">{macroNews.length} stories</span>
              </div>
              {macroNews.map(a => (
                <div key={a.id} style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
                    <span style={{fontSize:'var(--fs-label)',fontWeight:600,
                      color:a.severity==='CRITICAL'?'var(--red)':a.severity==='MAJOR'?'var(--yellow)':'var(--muted)',
                      textTransform:'uppercase'}}>{a.severity}</span>
                    <span style={{fontSize:'var(--fs-label)',background:'var(--raised)',color:'var(--muted)',
                      padding:'1px 5px',borderRadius:2}}>{a.category}</span>
                    <span style={{marginLeft:'auto',fontSize:'var(--fs-label)',color:'var(--dim)'}}>{a.source}</span>
                  </div>
                  <a href={a.link} target="_blank" rel="noopener noreferrer"
                    style={{fontSize:'var(--fs-sm)',fontWeight:600,color:'var(--bright)',
                      fontFamily:'var(--font-sans)',lineHeight:1.4,display:'block',marginBottom:4,
                      textDecoration:'none'}}
                    onMouseEnter={e=>e.target.style.color='var(--blue)'}
                    onMouseLeave={e=>e.target.style.color='var(--bright)'}>{a.title}</a>
                  {a.desc && <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)',lineHeight:1.55,
                    display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{a.desc}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Aside */}}
        <div className="shell-aside">
          <div className="widget" style={{marginBottom:12}}>
            <div className="w-head">📅 Upcoming MPC Calendar</div>
            <div className="w-body" style={{padding:0}}>
              {MPC_CALENDAR.map((e,i)=>(
                <div key={i} style={{padding:'10px 12px',borderBottom:i<MPC_CALENDAR.length-1?'1px solid var(--border)':'none'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <span style={{fontSize:'var(--fs-sm)',fontWeight:600,color:'var(--bright)'}}>{e.date}</span>
                    {e.upcoming && <span style={{fontSize:'var(--fs-label)',background:'var(--blue)',color:'var(--bg)',
                      padding:'2px 7px',borderRadius:2,fontWeight:600,letterSpacing:'0.06em'}}>NEXT</span>}
                  </div>
                  <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)',lineHeight:1.55}}>{e.note}</div>
                </div>
              ))}
            </div>
          </div>

          <RbiTimeline />

          <div style={{marginTop:12,padding:12,background:'var(--raised)',border:'1px solid var(--border)',
            fontSize:'var(--fs-xs)',color:'var(--muted)',lineHeight:1.9}}>
            <div style={{color:'var(--body)',fontWeight:600,marginBottom:6,letterSpacing:'0.08em',
              textTransform:'uppercase',fontSize:'var(--fs-label)'}}>Data Sources</div>
            MoSPI · RBI · Ministry of Finance · DPIIT · AMFI<br/>
            Click any KPI card to expand notes.
          </div>
        </div>
      </div>
    </Layout>
  );
}
