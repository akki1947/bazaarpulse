import { useState } from 'react';
import Layout from '../components/layout/Layout';
import macro from '../data/macro.json';

const STATUS_COLOR = { strong:'var(--green)', easing:'var(--blue)', normal:'var(--muted)', warning:'var(--yellow)', stress:'var(--red)' };
const TREND_ICON   = { up:'▲', down:'▼', flat:'─' };

function KpiCard({ item }) {
  const [exp, setExp] = useState(false);
  const tCol = item.trend==='up'?'var(--green)':item.trend==='down'?'var(--red)':'var(--dim)';
  const sCol = STATUS_COLOR[item.status]||'var(--muted)';
  return (
    <div className="kpi-card" style={{cursor:'pointer'}} onClick={()=>setExp(e=>!e)}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
        <div className="kpi-lbl">{item.label}</div>
        <span style={{fontSize:'0.55rem',letterSpacing:'0.1em',textTransform:'uppercase',
          color:sCol,border:`1px solid ${sCol}`,padding:'1px 5px',borderRadius:2}}>{item.status}</span>
      </div>
      <div className="kpi-val">{item.value}</div>
      <div className="kpi-meta" style={{marginTop:6}}>
        <span style={{color:tCol}}>{TREND_ICON[item.trend]||'─'} {item.prev}</span>
        <span style={{color:'var(--dim)'}}>·</span>
        <span>{item.period}</span>
      </div>
      <div style={{fontSize:'0.58rem',color:'var(--dim)',marginTop:4}}>{item.source} · Target: {item.target}</div>
      {exp && item.note && (
        <div style={{marginTop:8,padding:'6px 8px',background:'var(--raised)',
          borderLeft:'2px solid var(--blue)',fontSize:'0.7rem',color:'var(--body)',lineHeight:1.6}}>
          {item.note}
        </div>
      )}
    </div>
  );
}

function RbiTimeline() {
  const cols = { cut:'var(--green)', hike:'var(--red)', hold:'var(--yellow)' };
  return (
    <div className="widget" style={{marginBottom:0}}>
      <div className="w-head">🏦 RBI Monetary Policy Timeline</div>
      <div className="w-body">
        {macro.rbiTimeline.map((item,i) => (
          <div key={i} style={{display:'flex',gap:14,paddingBottom:i===macro.rbiTimeline.length-1?0:16}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:cols[item.type]||'var(--dim)',flexShrink:0,marginTop:2}}/>
              {i<macro.rbiTimeline.length-1&&<div style={{width:1,flex:1,background:'var(--border)',marginTop:4}}/>}
            </div>
            <div>
              <div style={{fontSize:'0.6rem',color:'var(--muted)',marginBottom:2}}>{item.date}</div>
              <div style={{fontSize:'0.75rem',fontWeight:600,color:'var(--bright)',marginBottom:3}}>
                <span style={{color:cols[item.type]||'var(--dim)',marginRight:6}}>
                  {item.type==='cut'?'▼':item.type==='hike'?'▲':'●'}
                </span>{item.event}
              </div>
              <div style={{fontSize:'0.68rem',color:'var(--body)',lineHeight:1.5}}>{item.detail}</div>
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
    insight:'GDP at 6.4% is robust but moderating. IIP at 5.0% shows manufacturing recovery. Services sector remains the primary growth driver.' },
  { id:'fiscal',    label:'Fiscal Health',    icon:'🏛', ids:['fiscal-deficit','gst'],
    insight:'GST at ₹1.84L Cr beats monthly average, supporting fiscal consolidation. Fiscal deficit of 4.4% GDP is on track.' },
  { id:'external',  label:'External Sector',  icon:'🌐', ids:['forex-reserve','repo'],
    insight:'Forex reserves at $620.7B provide ~11 months import cover. RBI Feb 2026 cut signals a pivot toward growth support.' },
];

export default function MacroPage() {
  return (
    <Layout title="Macro Economy" desc="India macroeconomic indicators — GDP, CPI, Repo Rate, Forex Reserves">
      <div className="shell">
        {/* Main */}
        <div className="shell-main">
          <div className="slbl">
            <span className="slbl-dot"/>
            Macro Economy
            <span className="slbl-count" style={{marginLeft:'auto',color:'var(--dim)',fontSize:'0.6rem'}}>
              Updated {macro.lastUpdated}
            </span>
          </div>

          {SECTIONS.map(sec => {
            const items = sec.ids.map(id=>macro.indicators.find(x=>x.id===id)).filter(Boolean);
            return (
              <div key={sec.id} style={{marginBottom:28}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,
                  paddingBottom:8,borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:'1rem'}}>{sec.icon}</span>
                  <span style={{fontSize:'0.72rem',fontWeight:600,letterSpacing:'0.1em',
                    textTransform:'uppercase',color:'var(--muted)'}}>{sec.label}</span>
                </div>
                <div className="kpi-grid" style={{marginBottom:10}}>
                  {items.map(it=><KpiCard key={it.id} item={it}/>)}
                </div>
                <div style={{padding:'8px 12px',background:'var(--raised)',borderLeft:'2px solid var(--blue)',
                  fontSize:'0.7rem',color:'var(--muted)',lineHeight:1.7}}>
                  💡 {sec.insight}
                </div>
              </div>
            );
          })}

          {/* War impact banner */}
          <div style={{padding:'14px 16px',background:'var(--raised)',border:'1px solid var(--border)',
            borderLeft:'3px solid var(--red)',marginBottom:24}}>
            <div style={{fontSize:'0.62rem',letterSpacing:'0.12em',textTransform:'uppercase',
              color:'var(--red)',marginBottom:6}}>⚠ Middle East War Impact — Live Watch</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10,marginTop:8}}>
              {[
                { label:'Crude Brent',    val:'~$100/bbl', note:'Up 40% since conflict', col:'var(--red)'   },
                { label:'INR vs USD',     val:'₹92.3',     note:'Near record lows',       col:'var(--red)'   },
                { label:'FII Outflow',    val:'₹33,680 Cr',note:'Since conflict start',   col:'var(--red)'   },
                { label:'Gold MCX',       val:'₹87,450',   note:'Safe haven demand',      col:'var(--green)' },
              ].map((w,i)=>(
                <div key={i} style={{padding:'8px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:2}}>
                  <div style={{fontSize:'0.58rem',color:'var(--dim)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}}>{w.label}</div>
                  <div style={{fontSize:'1.1rem',fontWeight:600,color:w.col,fontFamily:'var(--font-mono)'}}>{w.val}</div>
                  <div style={{fontSize:'0.6rem',color:'var(--muted)',marginTop:2}}>{w.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aside */}
        <div className="shell-aside">
          <div className="widget" style={{marginBottom:12}}>
            <div className="w-head">📅 Upcoming MPC Calendar</div>
            <div className="w-body" style={{padding:0}}>
              {MPC_CALENDAR.map((e,i)=>(
                <div key={i} style={{padding:'10px 12px',borderBottom:i<MPC_CALENDAR.length-1?'1px solid var(--border)':'none'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                    <span style={{fontSize:'0.68rem',fontWeight:600,color:'var(--bright)'}}>{e.date}</span>
                    {e.upcoming&&<span style={{fontSize:'0.52rem',background:'var(--blue)',color:'var(--bg)',
                      padding:'1px 6px',borderRadius:2,letterSpacing:'0.08em'}}>NEXT</span>}
                  </div>
                  <div style={{fontSize:'0.62rem',color:'var(--muted)',lineHeight:1.5}}>{e.note}</div>
                </div>
              ))}
            </div>
          </div>

          <RbiTimeline />

          <div style={{padding:12,background:'var(--raised)',border:'1px solid var(--border)',
            fontSize:'0.62rem',color:'var(--dim)',lineHeight:1.9,marginTop:12}}>
            <div style={{color:'var(--muted)',fontWeight:600,marginBottom:6,letterSpacing:'0.1em',
              textTransform:'uppercase',fontSize:'0.58rem'}}>Data Sources</div>
            MoSPI · RBI · Ministry of Finance · DPIIT · AMFI. Data updated manually. Click any KPI card to expand notes.
          </div>
        </div>
      </div>
    </Layout>
  );
}
