import Layout from '../components/layout/Layout';
import macro from '../data/macro.json';

function Indicator({ item }) {
  const up = item.trend === 'up';
  return (
    <div className="kpi-card">
      <div className="kpi-lbl">{item.label}</div>
      <div className="kpi-val">{item.value}</div>
      <div className="kpi-meta">
        <span className={up?'trend-up':'trend-dn'}>{up?'▲':'▼'} {item.prev}</span>
        <span style={{color:'var(--dim)'}}>·</span>
        <span>{item.period}</span>
      </div>
      <div style={{fontSize:'0.6rem',color:'var(--dim)',marginTop:5}}>{item.source}</div>
      {item.note && <div style={{fontSize:'0.65rem',color:'var(--muted)',marginTop:4,borderTop:'1px solid var(--border)',paddingTop:4}}>{item.note}</div>}
    </div>
  );
}

function TimelineItem({ item, last }) {
  const cols = {cut:'var(--green)',hike:'var(--red)',hold:'var(--yellow)'};
  return (
    <div style={{display:'flex',gap:14,paddingBottom:last?0:16}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
        <div style={{width:10,height:10,borderRadius:'50%',background:cols[item.type]||'var(--dim)',flexShrink:0}}/>
        {!last && <div style={{width:1,flex:1,background:'var(--border)',marginTop:4}}/>}
      </div>
      <div style={{paddingBottom:last?0:4}}>
        <div style={{fontSize:'0.62rem',color:'var(--muted)',marginBottom:3}}>{item.date}</div>
        <div style={{fontSize:'0.78rem',fontWeight:600,color:'var(--bright)',marginBottom:2,fontFamily:'var(--font-sans)'}}>{item.event}</div>
        <div style={{fontSize:'0.72rem',color:'var(--body)',lineHeight:1.5}}>{item.detail}</div>
      </div>
    </div>
  );
}

export default function MacroPage() {
  return (
    <Layout title="Macro Economy" desc="India macroeconomic indicators, RBI policy timeline">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl"><span className="slbl-dot"/>India Macro Indicators
            <span className="slbl-count">{macro.lastUpdated}</span>
          </div>
          <div className="kpi-grid">
            {macro.indicators.map(ind => <Indicator key={ind.id} item={ind} />)}
          </div>

          <div className="slbl" style={{marginTop:32}}><span className="slbl-dot" style={{background:'var(--yellow)'}}/>RBI Monetary Policy Timeline</div>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',padding:'20px 20px 4px'}}>
            {macro.rbiTimeline.map((item, i) => (
              <TimelineItem key={i} item={item} last={i===macro.rbiTimeline.length-1} />
            ))}
          </div>
        </div>

        <div className="shell-aside">
          <div className="widget">
            <div className="w-head">📋 Key Readings</div>
            <div className="w-body">
              {[
                ['Repo Rate',    '6.25%', 'down','Feb 2026 Cut'],
                ['GDP Growth',   '6.4%',  'down','Q3 FY26'],
                ['CPI',          '4.31%', 'down','Jan 2026'],
                ['Forex Reserve','$620B', 'up',  'Mar 7, 2026'],
                ['Fiscal Def.',  '4.4%',  'down','FY26 Target'],
              ].map(([label,val,t,period]) => (
                <div key={label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--border)'}}>
                  <div>
                    <div style={{fontSize:'0.62rem',color:'var(--muted)'}}>{label}</div>
                    <div style={{fontSize:'0.6rem',color:'var(--dim)'}}>{period}</div>
                  </div>
                  <span style={{fontFamily:'var(--font-mono)',fontWeight:600,color:t==='up'?'var(--green)':'var(--red)'}}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{padding:12,background:'var(--raised)',border:'1px solid var(--border)',fontSize:'0.62rem',color:'var(--dim)',lineHeight:1.9}}>
            <div style={{color:'var(--muted)',fontWeight:600,marginBottom:6,letterSpacing:'0.1em',textTransform:'uppercase',fontSize:'0.58rem'}}>Data Sources</div>
            MoSPI · Ministry of Finance · RBI · DPIIT · NSO<br/>
            Data updated manually. Always verify with official sources before decisions.
          </div>
        </div>
      </div>
    </Layout>
  );
}
