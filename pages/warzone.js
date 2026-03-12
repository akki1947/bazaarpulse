import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import ArticleCard from '../components/ui/ArticleCard';

const fetcher = url => fetch(url).then(r=>r.json());

const CONFLICTS = [
  { region:'Russia–Ukraine', status:'Active', impact:'HIGH', detail:'Grain, energy, fertiliser supply chains. ₹/$ pressure via FII outflows.' },
  { region:'Middle East', status:'Tense', impact:'HIGH', detail:'Red Sea shipping disruptions. Brent crude volatility. Indian exports affected.' },
  { region:'India–China Border', status:'Monitoring', impact:'MEDIUM', detail:'Disengagement process ongoing. Trade flows under scrutiny.' },
  { region:'Taiwan Strait', status:'Monitoring', impact:'MEDIUM', detail:'Semiconductor supply risk. FII risk-off sentiment if escalation.' },
  { region:'North Korea', status:'Monitoring', impact:'LOW', detail:'Missile tests. Regional uncertainty, limited direct India impact.' },
];

const INDIA_IMPACT = [
  { label:'Crude Oil', desc:'India imports ~85% crude. Middle East conflict = oil spike = CAD widening, INR pressure, OMC losses.' },
  { label:'Remittances', desc:'$125B+ annual remittances from Gulf. Conflict in ME disrupts Indian diaspora income flows.' },
  { label:'Defence Stocks', desc:'BEL, HAL, Paras Defence, Bharat Dynamics benefit from conflict-driven capex visibility.' },
  { label:'Gold as Safe Haven', desc:'Geopolitical stress drives gold demand. MCX gold correlates strongly with global risk-off.' },
  { label:'FII Outflows', desc:'Global conflict = EM risk-off. FIIs exit India → Nifty pressure, INR depreciation.' },
  { label:'Pharma Exports', desc:'Disrupted global supply chains can actually boost Indian pharma export demand.' },
];

export default function WarzPage() {
  const { data } = useSWR('/api/feed', fetcher, { revalidateOnFocus:false });
  const warNews = (data?.articles||[])
    .filter(a => ['global','government'].includes(a.category) || 
      (a.title+' '+(a.desc||'')).toLowerCase().match(/war|conflict|military|missile|ukraine|russia|middle east|ceasefire|sanction|troops/))
    .slice(0,15);

  return (
    <Layout title="War Zone" desc="Geopolitical conflicts and their impact on Indian markets">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl"><span className="slbl-dot" style={{background:'var(--red)'}}/>Active Geopolitical Situations</div>

          <div style={{marginBottom:24}}>
            {CONFLICTS.map((c,i) => {
              const col = c.impact==='HIGH'?'var(--red)':c.impact==='MEDIUM'?'var(--yellow)':'var(--dim)';
              return (
                <div key={i} style={{display:'flex',gap:14,padding:'13px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',paddingTop:3}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:col}}/>
                    {c.status==='Active'&&<div style={{width:8,height:8,borderRadius:'50%',background:col,marginTop:2,opacity:0.3}}/>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                      <span style={{fontSize:'0.84rem',fontWeight:600,color:'var(--bright)',fontFamily:'var(--font-sans)'}}>{c.region}</span>
                      <span style={{fontSize:'0.58rem',letterSpacing:'0.1em',textTransform:'uppercase',color:col,background:'var(--raised)',padding:'1px 5px',borderRadius:2}}>{c.status}</span>
                      <span style={{fontSize:'0.56rem',letterSpacing:'0.1em',textTransform:'uppercase',color:col,marginLeft:'auto'}}>Impact: {c.impact}</span>
                    </div>
                    <div style={{fontSize:'0.74rem',color:'var(--muted)',lineHeight:1.5}}>{c.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="slbl" style={{marginTop:8}}><span className="slbl-dot" style={{background:'var(--orange)'}}/>India Market Impact Matrix</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:10,marginBottom:28}}>
            {INDIA_IMPACT.map((item,i) => (
              <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',padding:14}}>
                <div style={{fontSize:'0.68rem',fontWeight:600,color:'var(--orange)',marginBottom:5,letterSpacing:'0.06em',textTransform:'uppercase'}}>{item.label}</div>
                <div style={{fontSize:'0.72rem',color:'var(--muted)',lineHeight:1.6}}>{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="slbl"><span className="slbl-dot"/>Live Geopolitical News
            <span className="slbl-count">{warNews.length} stories</span>
          </div>
          {warNews.length ? warNews.map(a => <ArticleCard key={a.id} article={a}/>) : (
            [1,2,3].map(i => (
              <div key={i} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                <div className="skel" style={{height:10,width:'90%',marginBottom:8}}/>
                <div className="skel" style={{height:10,width:'60%'}}/>
              </div>
            ))
          )}
        </div>

        <div className="shell-aside">
          <div className="widget">
            <div className="w-head">🛢 Crude Oil Impact</div>
            <div className="w-body" style={{fontSize:'0.72rem',color:'var(--muted)',lineHeight:1.7}}>
              Every $10 rise in Brent crude adds ~₹60,000 Cr to India&apos;s import bill.<br/><br/>
              <strong style={{color:'var(--body)'}}>Affected:</strong> OMCs (HPCL, BPCL, IOC), Airlines (IndiGo, AIX), Paints, Tyres, FMCG.<br/><br/>
              <strong style={{color:'var(--body)'}}>Beneficiaries:</strong> ONGC, Oil India, MRPL.
            </div>
          </div>
          <div className="widget">
            <div className="w-head">🛡 Defence Stocks</div>
            <div className="w-body">
              {['HAL','BEL','BHEL','Paras Defence','GRSE','Mazagon Dock','Data Patterns'].map(s => (
                <div key={s} style={{padding:'4px 0',borderBottom:'1px solid var(--border)',fontSize:'0.72rem',color:'var(--body)'}}>{s}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
