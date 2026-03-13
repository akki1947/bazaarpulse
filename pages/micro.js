import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import ArticleCard from '../components/ui/ArticleCard';

const fetcher = url => fetch(url).then(r => r.json());

const SECTORS = [
  {
    id:'banking', label:'Banking & NBFC', icon:'🏦',
    metrics:[
      { label:'Credit Growth YoY', val:'12.8%', trend:'down', note:'Moderated from 16%+ peak. RBI comfortable.' },
      { label:'GNPA Ratio',        val:'2.6%',  trend:'down', note:'Best in decade. PSU banks recovering.' },
      { label:'Net NPA',           val:'0.6%',  trend:'down', note:'Provisioning adequate across top banks.' },
      { label:'CASA Ratio',        val:'41.2%', trend:'down', note:'Declining as FD rates remain attractive.' },
    ],
    stocks:['HDFCBANK','ICICIBANK','SBIN','KOTAKBANK','AXISBANK','INDUSINDBK'],
    outlook:'POSITIVE',
    note:'RBI rate cut cycle supports margins long-term. Watch slippage from MSME segment.',
  },
  {
    id:'it', label:'IT & Tech', icon:'💻',
    metrics:[
      { label:'TCS Revenue Growth', val:'5.6%',  trend:'up',   note:'USD revenue growth picking up H2 FY26.' },
      { label:'Infosys Guidance',   val:'4.5–5%',trend:'up',   note:'FY26 guidance raised post Q3 results.' },
      { label:'Attrition (Avg)',    val:'12.3%', trend:'down', note:'Stabilising after 2022–23 highs of 20%+.' },
      { label:'Deal TCV (TTM)',     val:'$42B',  trend:'up',   note:'Large deal wins accelerating. AI adds.' },
    ],
    stocks:['TCS','INFY','WIPRO','HCLTECH','TECHM','PERSISTENT'],
    outlook:'POSITIVE',
    note:'Weak INR is a tailwind (+1% INR depreciation = ~30–50bps margin improvement). AI transformation deals growing.',
  },
  {
    id:'pharma', label:'Pharma & Healthcare', icon:'💊',
    metrics:[
      { label:'US FDA Approvals',  val:'38 (FY26)', trend:'up',   note:'Record approvals. ANDA pipeline strong.' },
      { label:'API Export Growth', val:'+14% YoY',  trend:'up',   note:'China+1 beneficiary. Supply chain diversification.' },
      { label:'Domestic Growth',   val:'+9% YoY',   trend:'up',   note:'IPM growing driven by chronic therapies.' },
      { label:'CDMO Pipeline',     val:'₹8,200 Cr', trend:'up',   note:'Contract manufacturing orders surging.' },
    ],
    stocks:['SUNPHARMA','DRREDDY','CIPLA','DIVISLAB','LUPIN','AUROPHARMA'],
    outlook:'POSITIVE',
    note:'Geopolitical tailwind from Middle East crisis boosting generic demand. CDMO segment multi-year opportunity.',
  },
  {
    id:'auto', label:'Automobile', icon:'🚗',
    metrics:[
      { label:'Passenger Vehicle Sales', val:'4.44L/mo',  trend:'down', note:'Moderated from peak. Inventory normalising.' },
      { label:'2-Wheeler Growth',        val:'+8% YoY',   trend:'up',   note:'Rural recovery driving entry segment.' },
      { label:'EV Penetration',          val:'5.4%',      trend:'up',   note:'EV share of total PV at record. Tata leads.' },
      { label:'Crude Impact',            val:'HIGH RISK',  trend:'down', note:'Fuel price hike risk dampening demand.' },
    ],
    stocks:['MARUTI','TATAMOTORS','M&M','BAJAJ-AUTO','TVSMOTORS','EICHERMOT'],
    outlook:'NEUTRAL',
    note:'Crude oil surge is a key risk. EV transition accelerating. Premium segment outperforming mass market.',
  },
  {
    id:'realestate', label:'Real Estate', icon:'🏗',
    metrics:[
      { label:'Residential Launches',  val:'+18% YoY', trend:'up',   note:'Pan-India launches at multi-year highs.' },
      { label:'Avg Ticket Size',       val:'₹1.2 Cr',  trend:'up',   note:'Premiumisation trend strong.' },
      { label:'Office Absorption',     val:'62M sqft', trend:'up',   note:'FY26 on track for record absorption.' },
      { label:'Home Loan Rate',        val:'8.5%',     trend:'down', note:'Rate cut transmission beginning.' },
    ],
    stocks:['DLF','LODHA','PRESTIGE','GODREJPROP','OBEROIREALTY','PHOENIXLTD'],
    outlook:'POSITIVE',
    note:'Rate cut cycle is a strong positive. Housing demand structural. Commercial real estate GCC-driven.',
  },
  {
    id:'fmcg', label:'FMCG & Consumer', icon:'🛒',
    metrics:[
      { label:'Rural Volume Growth', val:'+6.2% YoY', trend:'up',   note:'Recovery underway. Normal monsoon boosted.' },
      { label:'Urban Growth',        val:'+4.1% YoY', trend:'down', note:'Slowing. Food inflation weighing on discretionary.' },
      { label:'Input Cost (Palm Oil)',val:'Elevated',  trend:'down', note:'Middle East conflict driving edible oil prices.' },
      { label:'Pricing Power',       val:'LIMITED',   trend:'down', note:'Competition from D2C, private labels intensifying.' },
    ],
    stocks:['HINDUNILVR','ITC','NESTLEIND','DABUR','BRITANNIA','MARICO'],
    outlook:'NEUTRAL',
    note:'Rural recovery is positive but input cost inflation from crude/palm oil compresses margins.',
  },
  {
    id:'infra', label:'Infrastructure & Capex', icon:'🏛',
    metrics:[
      { label:'Govt Capex (FY26)',  val:'₹11.11L Cr', trend:'up',   note:'3.4% of GDP. Roads, railways, ports.' },
      { label:'Order Inflow Growth', val:'+22% YoY',  trend:'up',   note:'L&T, KEC, Kalpataru seeing strong inflows.' },
      { label:'Book-to-Bill Ratio', val:'3.2x',       trend:'up',   note:'Multi-year earnings visibility.' },
      { label:'Working Capital',    val:'IMPROVING',  trend:'up',   note:'Govt payment cycles improving vs 2022.' },
    ],
    stocks:['LT','KEC','KALPATPOWR','NCC','PNCINFRA','IRB'],
    outlook:'POSITIVE',
    note:'Govt capex super-cycle continues regardless of election cycle. Water, defence, digital infra adding to traditional roads.',
  },
  {
    id:'energy', label:'Energy & Oil', icon:'⚡',
    metrics:[
      { label:'Brent Crude',        val:'~$100/bbl', trend:'up',   note:'War premium. Likely range $80–110 FY26.' },
      { label:'OMC Under-Recovery', val:'₹2.8/litre',trend:'up',   note:'HPCL/BPCL/IOC absorbing losses again.' },
      { label:'Renewables Capacity', val:'208 GW',   trend:'up',   note:'India target 500 GW by 2030. On track.' },
      { label:'Coal India Output',  val:'+6% YoY',   trend:'up',   note:'Record production. Power sector security.' },
    ],
    stocks:['RELIANCE','ONGC','HPCL','BPCL','IOC','ADANIGREEN'],
    outlook:'MIXED',
    note:'Crude spike hurts OMCs but benefits upstream ONGC/Oil India. Renewables sector structurally strong.',
  },
];

const OUTLOOK_COL = { POSITIVE:'var(--green)', NEGATIVE:'var(--red)', NEUTRAL:'var(--yellow)', MIXED:'var(--orange)' };

function SectorCard({ sector }) {
  const [exp, setExp] = useState(false);
  const outCol = OUTLOOK_COL[sector.outlook] || 'var(--muted)';
  return (
    <div style={{background:'var(--surface)',border:'1px solid var(--border)',marginBottom:10,
      borderTop:`2px solid ${outCol}`}}>
      <div style={{padding:'12px 14px',cursor:'pointer'}} onClick={() => setExp(e => !e)}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
          <span style={{fontSize:'1.1rem'}}>{sector.icon}</span>
          <span style={{fontSize:'0.88rem',fontWeight:600,color:'var(--bright)',fontFamily:'var(--font-sans)'}}>{sector.label}</span>
          <span style={{marginLeft:'auto',fontSize:'0.6rem',letterSpacing:'0.1em',textTransform:'uppercase',
            color:outCol,border:`1px solid ${outCol}`,padding:'2px 7px',borderRadius:2}}>{sector.outlook}</span>
          <span style={{fontSize:'0.7rem',color:'var(--dim)'}}>{exp?'▲':'▼'}</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
          {sector.metrics.slice(0,2).map((m,i) => (
            <div key={i} style={{padding:'6px 8px',background:'var(--raised)',borderRadius:2}}>
              <div style={{fontSize:'0.58rem',color:'var(--dim)',marginBottom:2,letterSpacing:'0.06em',textTransform:'uppercase'}}>{m.label}</div>
              <div style={{fontSize:'0.82rem',fontWeight:600,color:'var(--bright)',fontFamily:'var(--font-mono)'}}>{m.val}</div>
            </div>
          ))}
        </div>
      </div>
      {exp && (
        <div style={{borderTop:'1px solid var(--border)',padding:'12px 14px',background:'var(--raised)'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6,marginBottom:10}}>
            {sector.metrics.map((m,i) => (
              <div key={i} style={{padding:'7px 9px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:2}}>
                <div style={{fontSize:'0.58rem',color:'var(--dim)',marginBottom:2,letterSpacing:'0.06em',textTransform:'uppercase'}}>{m.label}</div>
                <div style={{fontSize:'0.78rem',fontWeight:600,color:'var(--bright)',fontFamily:'var(--font-mono)',marginBottom:2}}>{m.val}</div>
                <div style={{fontSize:'0.62rem',color:'var(--muted)',lineHeight:1.4}}>{m.note}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'7px 10px',background:'var(--surface)',borderLeft:'2px solid '+outCol,
            fontSize:'0.7rem',color:'var(--muted)',lineHeight:1.6,marginBottom:8}}>
            💡 {sector.note}
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
            <span style={{fontSize:'0.58rem',color:'var(--dim)',marginRight:2}}>Stocks:</span>
            {sector.stocks.map(s => (
              <span key={s} style={{fontSize:'0.6rem',background:'var(--surface)',color:'var(--blue)',
                padding:'2px 6px',borderRadius:2,border:'1px solid var(--border)',fontFamily:'var(--font-mono)'}}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MicroPage() {
  const [activeTab, setActiveTab] = useState('sectors');
  const { data } = useSWR('/api/feed', fetcher, { revalidateOnFocus: false });
  const corpNews = (data?.articles || []).filter(a => ['corporate','markets','banking'].includes(a.category)).slice(0, 20);

  return (
    <Layout title="Micro Economy" desc="India sector analysis, corporate metrics, earnings tracker">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl">
            <span className="slbl-dot" style={{background:'var(--cyan)'}}/>
            Micro Economy
          </div>

          {/* Sub tabs */}
          <div style={{display:'flex',gap:4,marginBottom:20,borderBottom:'1px solid var(--border)',paddingBottom:0}}>
            {[
              {id:'sectors', label:'Sector Outlook'},
              {id:'news',    label:'Corporate News'},
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{padding:'6px 14px',background:'none',border:'none',
                  fontSize:'0.68rem',fontWeight:500,letterSpacing:'0.08em',textTransform:'uppercase',
                  color:activeTab===t.id?'var(--bright)':'var(--muted)',
                  borderBottom:activeTab===t.id?'2px solid var(--blue)':'2px solid transparent',
                  cursor:'pointer',transition:'all 0.12s'}}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'sectors' && (
            <div>
              <div style={{padding:'8px 12px',background:'var(--raised)',borderLeft:'2px solid var(--dim)',
                fontSize:'0.7rem',color:'var(--muted)',lineHeight:1.6,marginBottom:16}}>
                Click any sector card to expand metrics, analyst notes and key stocks. Outlook reflects 3–6 month view.
              </div>
              {SECTORS.map(s => <SectorCard key={s.id} sector={s}/>)}
            </div>
          )}

          {activeTab === 'news' && (
            <div>
              {corpNews.length
                ? corpNews.map(a => <ArticleCard key={a.id} article={a}/>)
                : [1,2,3,4].map(i => (
                    <div key={i} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                      <div className="skel" style={{height:10,width:'85%',marginBottom:8}}/>
                      <div className="skel" style={{height:10,width:'55%'}}/>
                    </div>
                  ))
              }
            </div>
          )}
        </div>

        <div className="shell-aside">
          <div className="widget">
            <div className="w-head">📊 Sector Scorecard</div>
            <div className="w-body" style={{padding:0}}>
              {SECTORS.map(s => {
                const col = OUTLOOK_COL[s.outlook] || 'var(--muted)';
                return (
                  <div key={s.id} style={{padding:'7px 12px',borderBottom:'1px solid var(--border)',
                    display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <span style={{fontSize:'0.7rem',color:'var(--body)'}}>{s.icon} {s.label}</span>
                    <span style={{fontSize:'0.6rem',color:col,letterSpacing:'0.08em',textTransform:'uppercase'}}>{s.outlook}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{padding:12,background:'var(--raised)',border:'1px solid var(--border)',
            fontSize:'0.62rem',color:'var(--dim)',lineHeight:1.9,marginTop:12}}>
            <div style={{color:'var(--muted)',fontWeight:600,marginBottom:6,letterSpacing:'0.1em',
              textTransform:'uppercase',fontSize:'0.58rem'}}>About Micro</div>
            Sector-level analysis covering earnings, metrics and stock watchlists. Data sourced from company filings, SEBI, NSE/BSE disclosures.
          </div>
        </div>
      </div>
    </Layout>
  );
}
