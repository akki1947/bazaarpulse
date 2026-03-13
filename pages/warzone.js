import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import ArticleCard from '../components/ui/ArticleCard';

const fetcher = url => fetch(url).then(r => r.json());

const CONFLICTS = [
  {
    id: 'iran-israel',
    region: 'Iran–Israel–USA',
    status: 'ACTIVE WAR',
    impact: 'CRITICAL',
    started: 'Mar 1, 2026',
    parties: ['Iran','Israel','USA','Hezbollah','Hamas'],
    summary: 'US–Israel strikes on Iranian nuclear sites triggered retaliatory missile campaigns. Strait of Hormuz partially disrupted. Brent crude surged past $100/bbl.',
    indiaImpact: [
      { icon:'🛢', label:'Crude Oil', val:'+40%', note:'India imports 85% crude. Every $10/bbl rise = ₹70K Cr import bill increase.' },
      { icon:'💱', label:'INR/USD',   val:'₹92.4', note:'Rupee at record lows. RBI intervening. Import inflation accelerating.' },
      { icon:'🔥', label:'LPG Crisis', val:'Shortage', note:'LPG supply disrupted. Govt rationing domestic cylinders.' },
      { icon:'✈️', label:'Airlines',  val:'Fuel+30%', note:'IndiGo/Air India imposing fuel surcharges. Ticket prices rising.' },
    ],
    tags:['Hormuz','Nuclear','Energy','Sanctions'],
  },
  {
    id: 'russia-ukraine',
    region: 'Russia–Ukraine',
    status: 'ACTIVE',
    impact: 'HIGH',
    started: 'Feb 24, 2022',
    parties: ['Russia','Ukraine','NATO','EU'],
    summary: 'War enters 4th year. Frontline largely frozen. Continued drone strikes on infrastructure. Grain corridor disruptions seasonal. Sanctions regime intact.',
    indiaImpact: [
      { icon:'⚗️', label:'Fertilisers', val:'Elevated', note:'Potash, urea supply chains disrupted. India imports ~30% from conflict zone.' },
      { icon:'🌾', label:'Wheat/Edibles', val:'High', note:'Global food prices elevated. India\'s food inflation partially linked.' },
      { icon:'🛡', label:'Defence', val:'Positive', note:'India–Russia defence ties complex. Spare parts issues for legacy systems.' },
      { icon:'🛢', label:'Cheap Oil', val:'Discount', note:'India buying Russian crude at $15–20 discount. CAD buffer.' },
    ],
    tags:['NATO','Grain','Sanctions','Energy'],
  },
  {
    id: 'gaza-westbank',
    region: 'Israel–Gaza–West Bank',
    status: 'ACTIVE',
    impact: 'HIGH',
    started: 'Oct 7, 2023',
    parties: ['Israel','Hamas','Palestinian Authority','UNRWA'],
    summary: 'Gaza conflict continues with humanitarian crisis deepening. West Bank tensions elevated. ICJ proceedings ongoing. Regional spillover into Lebanon and Syria.',
    indiaImpact: [
      { icon:'🚢', label:'Red Sea', val:'Rerouted', note:'Houthi attacks force ships around Cape of Good Hope. +14 days transit.' },
      { icon:'💸', label:'Remittances', val:'At Risk', note:'~3M Indian workers in Gulf. Conflict proximity raises risk.' },
      { icon:'📦', label:'Exports', val:'Delayed', note:'Indian textiles, pharma exports via Suez facing 20–25% freight hike.' },
      { icon:'🏗', label:'Construction', val:'Disrupted', note:'Indian workers in Israel/Palestine construction sector affected.' },
    ],
    tags:['Gaza','Houthi','Red Sea','Shipping'],
  },
  {
    id: 'myanmar',
    region: 'Myanmar Civil War',
    status: 'ACTIVE',
    impact: 'MEDIUM',
    started: 'Feb 1, 2021',
    parties: ['Military Junta','PDF','Ethnic Armed Orgs','NUG'],
    summary: 'Military junta losing ground to resistance forces across multiple fronts. Significant territory captured in 2024–25 by ethnic armed orgs. Humanitarian crisis ongoing.',
    indiaImpact: [
      { icon:'🚧', label:'Border Trade', val:'Disrupted', note:'India–Myanmar border trade via Moreh/Zokhawthar severely impacted.' },
      { icon:'🌊', label:'Refugees', val:'Influx', note:'Chin and other refugees crossing into Mizoram/Manipur.' },
      { icon:'🔌', label:'ASEAN Gas', val:'At Risk', note:'Myanmar–Bangladesh–India gas pipeline projects stalled indefinitely.' },
      { icon:'🔐', label:'NE Security', val:'Elevated', note:'Insurgent group movement along porous 1,643 km India–Myanmar border.' },
    ],
    tags:['Junta','Humanitarian','ASEAN','Border'],
  },
  {
    id: 'sudan',
    region: 'Sudan Civil War',
    status: 'ACTIVE',
    impact: 'LOW',
    started: 'Apr 15, 2023',
    parties: ['SAF (Army)','RSF (Paramilitaries)','Civilian Groups'],
    summary: 'SAF vs RSF conflict has displaced 10M+ people — world\'s largest displacement crisis. Darfur atrocities ongoing. No ceasefire in sight.',
    indiaImpact: [
      { icon:'👥', label:'Indian Diaspora', val:'~4,000', note:'Indians evacuated via Op Kaveri in 2023. Residual community at risk.' },
      { icon:'🥜', label:'Sesame/Gum Arabic', val:'Supply Cut', note:'Sudan major supplier of sesame, gum arabic used in Indian food industry.' },
      { icon:'🌍', label:'Africa Investments', val:'Delayed', note:'Indian infra projects in Sudan region on hold.' },
    ],
    tags:['Humanitarian','Darfur','Africa','Displacement'],
  },
  {
    id: 'pakistan-taliban',
    region: 'Pakistan–TTP (Taliban)',
    status: 'ESCALATING',
    impact: 'HIGH',
    started: '2007 (re-escalated 2022)',
    parties: ['Pakistan Army','TTP','Afghan Taliban','PTI Supporters'],
    summary: 'TTP insurgency in KPK and Balochistan intensifying since Afghan Taliban takeover. Pakistan Army conducting major operations. Political instability with Imran Khan imprisoned. Economy in IMF crisis.',
    indiaImpact: [
      { icon:'🛡', label:'Security', val:'Elevated', note:'TTP–India nexus concerns. Cross-border terrorism risk assessment raised.' },
      { icon:'💣', label:'Nuclear Risk', val:'Monitored', note:'Pakistan political instability and nuclear arsenal under global scrutiny.' },
      { icon:'📉', label:'Trade', val:'Suspended', note:'India–Pakistan trade near zero since 2019. No normalisation in sight.' },
      { icon:'💰', label:'IMF Bailout', val:'$7B', note:'Pakistan on IMF drip. Default risk monitored for regional contagion.' },
    ],
    tags:['TTP','Nuclear','IMF','Terrorism'],
  },
  {
    id: 'china-taiwan',
    region: 'China–Taiwan Strait',
    status: 'TENSE',
    impact: 'MEDIUM',
    started: 'Ongoing (escalated 2022)',
    parties: ['China (PLA)','Taiwan','USA','Japan'],
    summary: 'PLA exercises around Taiwan increased in frequency. US arms sales to Taiwan ongoing. Economic decoupling between US–China accelerating.',
    indiaImpact: [
      { icon:'💻', label:'Semiconductors', val:'Supply Risk', note:'TSMC in Taiwan makes 90%+ of advanced chips. Disruption = global tech crisis.' },
      { icon:'📈', label:'Alt. Investment', val:'Positive', note:'India positioned as China+1 beneficiary in electronics, textiles.' },
      { icon:'💱', label:'FII Risk-Off', val:'Contagion', note:'Any Taiwan escalation = EM selloff including India.' },
    ],
    tags:['Semiconductors','PLA','China+1','Decoupling'],
  },
  {
    id: 'india-china',
    region: 'India–China Border (LAC)',
    status: 'MONITORING',
    impact: 'MEDIUM',
    started: 'Jun 2020 (Galwan)',
    parties: ['India (Army)','China (PLA)'],
    summary: 'Partial disengagement at Depsang and Demchok completed Oct 2024. Patrolling resumed. Overall LAC situation improved but trust deficit remains. Trade restrictions continue.',
    indiaImpact: [
      { icon:'🏭', label:'Import Bans', val:'Ongoing', note:'China imports of electronics, solar, APIs under scrutiny. FDI restrictions.' },
      { icon:'🛡', label:'Defence Capex', val:'₹6.2L Cr', note:'Border infrastructure push ongoing. Defence stocks benefit.' },
      { icon:'📡', label:'Tech Decoupling', val:'In Progress', note:'Huawei/ZTE banned. Chinese apps removed. Atma Nirbhar tech push.' },
    ],
    tags:['LAC','Disengagement','Decoupling','Defence'],
  },
];

const IMPACT_MATRIX = [
  { sector:'Crude Oil & OMCs',  exposure:'CRITICAL', note:'₹100+ Brent. HPCL/BPCL/IOC under-recovery risk. LPG subsidy burden rising.',                          col:'var(--red)'    },
  { sector:'INR / Forex',       exposure:'CRITICAL', note:'₹92+ levels. RBI burning reserves. Import inflation feeding CPI.',                                      col:'var(--red)'    },
  { sector:'Defence Stocks',    exposure:'POSITIVE', note:'BEL, HAL, Paras Defence, BEML, Bharat Dynamics. Multi-year order books.',                               col:'var(--green)'  },
  { sector:'Gold & Silver',     exposure:'POSITIVE', note:'Safe haven demand. MCX Gold ₹87,450+. Global central bank buying.',                                     col:'var(--green)'  },
  { sector:'Pharma Exports',    exposure:'POSITIVE', note:'Supply chain disruptions globally boosting Indian generic demand.',                                      col:'var(--green)'  },
  { sector:'Airlines',          exposure:'HIGH RISK','note':'Jet fuel +30%. IndiGo/Air India surcharges. Route disruptions.',                                      col:'var(--red)'    },
  { sector:'Fertilisers',       exposure:'HIGH RISK','note':'Russia–Ukraine disrupts potash/urea. Input cost inflation for agri sector.',                          col:'var(--red)'    },
  { sector:'Shipping/Ports',    exposure:'HIGH RISK','note':'Red Sea rerouting adding 2 weeks + 25% freight. Adani Ports partially resilient.',                   col:'var(--red)'    },
  { sector:'IT / TCS / Infosys',exposure:'NEUTRAL',  note:'USD revenue hedge. Weak INR = earnings tailwind. Client caution on budgets.',                          col:'var(--yellow)' },
  { sector:'FII Flows',         exposure:'HIGH RISK', note:'Rs 33,680 Cr outflow since conflict. Nifty weak. FII positioning at 5-year low.',                      col:'var(--red)'    },
  { sector:'Remittances',       exposure:'AT RISK',  note:'$125B+ Gulf remittances. 3M+ Indian workers in conflict-adjacent zones.',                              col:'var(--yellow)' },
  { sector:'Semiconductors',    exposure:'WATCH',    note:'Taiwan escalation tail risk. India chip fab plan a long-term hedge.',                                   col:'var(--dim)'    },
];

export default function WarzonePage() {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const { data } = useSWR('/api/feed', fetcher, { revalidateOnFocus: false });
  const warNews = (data?.articles || [])
    .filter(a => {
      const txt = (a.title + ' ' + (a.desc || '')).toLowerCase();
      return ['global','commodities','government'].includes(a.category) ||
        /war|conflict|military|missile|strike|ceasefire|sanction|troops|iran|russia|ukraine|hamas|gaza|taliban|myanmar|sudan|taiwan/i.test(txt);
    })
    .slice(0, 20);

  const impactCols = { 'CRITICAL':'var(--red)', 'HIGH RISK':'var(--red)', 'POSITIVE':'var(--green)', 'NEUTRAL':'var(--yellow)', 'AT RISK':'var(--yellow)', 'WATCH':'var(--dim)' };
  const statusCols = { 'ACTIVE WAR':'var(--red)', 'ACTIVE':'var(--red)', 'ESCALATING':'var(--orange)', 'TENSE':'var(--yellow)', 'MONITORING':'var(--dim)' };

  return (
    <Layout title="War Zone" desc="Active global conflicts and their impact on Indian markets and economy">
      <div className="shell">
        <div className="shell-main">

          {/* Live conflict counter */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:20}}>
            {[
              { label:'Active Wars',       val:3, col:'var(--red)'    },
              { label:'Escalating',        val:1, col:'var(--orange)' },
              { label:'Tense / Watching',  val:2, col:'var(--yellow)' },
              { label:'Monitoring',        val:2, col:'var(--dim)'    },
            ].map((s,i) => (
              <div key={i} style={{padding:'10px 12px',background:'var(--surface)',border:'1px solid var(--border)',textAlign:'center'}}>
                <div style={{fontSize:'1.6rem',fontWeight:700,color:s.col,fontFamily:'var(--font-mono)',lineHeight:1}}>{s.val}</div>
                <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)',letterSpacing:'0.1em',textTransform:'uppercase',marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="slbl">
            <span className="slbl-dot" style={{background:'var(--red)'}}/>
            Active Geopolitical Situations
            <span className="slbl-count">{CONFLICTS.length} tracked</span>
          </div>

          {CONFLICTS.map(c => {
            const isOpen = expanded[c.id];
            const impactCol = c.impact==='CRITICAL'?'var(--red)':c.impact==='HIGH'?'var(--orange)':c.impact==='MEDIUM'?'var(--yellow)':'var(--dim)';
            const statusCol = statusCols[c.status] || 'var(--dim)';
            return (
              <div key={c.id} style={{marginBottom:10,background:'var(--surface)',border:'1px solid var(--border)',
                borderLeft:`3px solid ${statusCol}`}}>
                <div style={{padding:'12px 14px',cursor:'pointer',display:'flex',alignItems:'flex-start',gap:12}}
                  onClick={() => toggle(c.id)}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:8,marginBottom:5}}>
                      <span style={{fontSize:'var(--fs-lg)',fontWeight:600,color:'var(--bright)',fontFamily:'var(--font-sans)'}}>{c.region}</span>
                      <span style={{fontSize:'var(--fs-label)',letterSpacing:'0.1em',textTransform:'uppercase',
                        color:statusCol,background:'var(--raised)',padding:'2px 6px',borderRadius:2,border:`1px solid ${statusCol}`}}>
                        {c.status}
                      </span>
                      <span style={{fontSize:'var(--fs-label)',letterSpacing:'0.1em',textTransform:'uppercase',
                        color:impactCol,marginLeft:'auto'}}>India Impact: {c.impact}</span>
                    </div>
                    <div style={{fontSize:'var(--fs-sm)',color:'var(--muted)',lineHeight:1.55}}>{c.summary}</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:6}}>
                      <span style={{fontSize:'var(--fs-label)',color:'var(--muted)'}}>Since {c.started} ·</span>
                      {c.parties.map(p => (
                        <span key={p} style={{fontSize:'var(--fs-label)',background:'var(--raised)',color:'var(--muted)',
                          padding:'1px 5px',borderRadius:2}}>{p}</span>
                      ))}
                    </div>
                  </div>
                  <span style={{fontSize:'var(--fs-sm)',color:'var(--muted)',flexShrink:0,marginTop:2}}>{isOpen?'▲':'▼'}</span>
                </div>

                {isOpen && (
                  <div style={{borderTop:'1px solid var(--border)',padding:'12px 14px',background:'var(--raised)'}}>
                    <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>
                      India Market Impact
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:8,marginBottom:10}}>
                      {c.indiaImpact.map((imp,i) => (
                        <div key={i} style={{padding:'8px 10px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:2}}>
                          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                            <span style={{fontSize:'1rem'}}>{imp.icon}</span>
                            <span style={{fontSize:'var(--fs-xs)',fontWeight:600,color:'var(--bright)'}}>{imp.label}</span>
                            <span style={{marginLeft:'auto',fontSize:'var(--fs-xs)',fontWeight:600,color:impactCol}}>{imp.val}</span>
                          </div>
                          <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)',lineHeight:1.5}}>{imp.note}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                      {c.tags.map(tag => (
                        <span key={tag} style={{fontSize:'var(--fs-label)',background:'var(--surface)',color:'var(--blue)',
                          padding:'2px 7px',borderRadius:2,border:'1px solid var(--border)'}}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="slbl" style={{marginTop:24}}>
            <span className="slbl-dot" style={{background:'var(--orange)'}}/>
            India Market Impact Matrix
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:8,marginBottom:28}}>
            {IMPACT_MATRIX.map((item,i) => (
              <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',padding:'12px 14px',
                borderTop:`2px solid ${impactCols[item.exposure]||'var(--dim)'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                  <span style={{fontSize:'var(--fs-sm)',fontWeight:600,color:'var(--bright)',fontFamily:'var(--font-sans)'}}>{item.sector}</span>
                  <span style={{fontSize:'var(--fs-label)',letterSpacing:'0.08em',textTransform:'uppercase',
                    color:impactCols[item.exposure]||'var(--dim)'}}>{item.exposure}</span>
                </div>
                <div style={{fontSize:'var(--fs-sm)',color:'var(--muted)',lineHeight:1.5}}>{item.note}</div>
              </div>
            ))}
          </div>

          {/* Live war impact panel — moved from Macro */}
          <div style={{padding:'14px 16px',background:'var(--raised)',border:'1px solid var(--border)',
            borderLeft:'3px solid var(--red)',marginBottom:24}}>
            <div style={{fontSize:'var(--fs-label)',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',
              color:'var(--red)',marginBottom:12}}>⚠ Middle East War — Live Market Watch</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:10}}>
              {[
                { label:'Crude Brent',    val:'~$100/bbl', note:'+40% since conflict start', col:'var(--red)'    },
                { label:'INR/USD',        val:'₹92.3',     note:'Near record lows',           col:'var(--red)'    },
                { label:'FII Outflow',    val:'₹33,680 Cr',note:'Since Mar 1, 2026',          col:'var(--red)'    },
                { label:'Gold MCX',       val:'₹87,450',   note:'Safe haven demand surge',    col:'var(--green)'  },
                { label:'LPG',            val:'Shortage',  note:'Domestic rationing in place',col:'var(--red)'    },
                { label:'Nifty 50',       val:'-8.4%',     note:'From pre-war high',          col:'var(--red)'    },
              ].map((w,i) => (
                <div key={i} style={{padding:'10px 12px',background:'var(--surface)',border:'1px solid var(--border)'}}>
                  <div style={{fontSize:'var(--fs-label)',color:'var(--muted)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:5}}>{w.label}</div>
                  <div style={{fontSize:'var(--fs-lg)',fontWeight:700,color:w.col,fontFamily:'var(--font-mono)',marginBottom:3}}>{w.val}</div>
                  <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)'}}>{w.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="slbl">
            <span className="slbl-dot"/>
            Live Geopolitical News
            <span className="slbl-count">{warNews.length} stories</span>
          </div>
          {warNews.length
            ? warNews.map(a => <ArticleCard key={a.id} article={a}/>)
            : [1,2,3].map(i => (
                <div key={i} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                  <div className="skel" style={{height:10,width:'90%',marginBottom:8}}/>
                  <div className="skel" style={{height:10,width:'60%'}}/>
                </div>
              ))
          }
        </div>

        {/* Aside */}
        <div className="shell-aside">
          <div className="widget">
            <div className="w-head" style={{color:'var(--red)'}}>⚠ Conflict Risk Monitor</div>
            <div className="w-body" style={{padding:0}}>
              {CONFLICTS.map(c => {
                const col = statusCols[c.status]||'var(--dim)';
                const lvl = {'ACTIVE WAR':5,'ACTIVE':4,'ESCALATING':3,'TENSE':2,'MONITORING':1}[c.status]||1;
                return (
                  <div key={c.id} style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                      <span style={{fontSize:'var(--fs-xs)',color:'var(--body)',fontWeight:500}}>{c.region}</span>
                      <span style={{fontSize:'var(--fs-label)',color:col}}>{c.status}</span>
                    </div>
                    <div style={{display:'flex',gap:2}}>
                      {[1,2,3,4,5].map(n => (
                        <div key={n} style={{height:4,flex:1,borderRadius:1,
                          background:n<=lvl?col:'var(--raised)'}}/>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="widget">
            <div className="w-head">🛢 Commodities Watch</div>
            <div className="w-body" style={{padding:0}}>
              {[
                { label:'Brent Crude', val:'~$100/bbl', note:'+40% since conflict', col:'var(--red)'    },
                { label:'MCX Gold',    val:'₹87,450',   note:'Safe haven demand',    col:'var(--green)'  },
                { label:'INR/USD',     val:'₹92.3',     note:'Near record low',      col:'var(--red)'    },
                { label:'Nat. Gas',    val:'Elevated',  note:'LNG supply at risk',   col:'var(--yellow)' },
              ].map((w,i) => (
                <div key={i} style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:'var(--fs-xs)',color:'var(--muted)'}}>{w.label}</span>
                    <span style={{fontSize:'var(--fs-sm)',fontWeight:600,color:w.col,fontFamily:'var(--font-mono)'}}>{w.val}</span>
                  </div>
                  <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)',marginTop:2}}>{w.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{padding:12,background:'var(--raised)',border:'1px solid var(--border)',
            fontSize:'var(--fs-xs)',color:'var(--muted)',lineHeight:1.9}}>
            <div style={{color:'var(--muted)',fontWeight:600,marginBottom:6,letterSpacing:'0.1em',
              textTransform:'uppercase',fontSize:'var(--fs-label)'}}>Disclaimer</div>
            Conflict data is for informational purposes. Market impact assessments are analyst perspectives, not investment advice. Situations change rapidly.
          </div>
        </div>
      </div>
    </Layout>
  );
}
