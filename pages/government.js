import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import ArticleCard from '../components/ui/ArticleCard';

const fetcher = url => fetch(url).then(r => r.json());

const BUDGET_ITEMS = [
  { cat:'Direct Tax',     item:'New Tax Slabs FY26',           detail:'₹0–3L: Nil | 3–7L: 5% | 7–10L: 10% | 10–12L: 15% | 12–15L: 20% | >15L: 30%',                         tag:'Personal' },
  { cat:'Capital Gains',  item:'LTCG/STCG Revision',           detail:'LTCG 12.5% (was 10%). STCG 20% (was 15%). Indexation removed on property.',                             tag:'Investing' },
  { cat:'Capex',          item:'Capital Expenditure',           detail:'₹11.11 lakh crore — 3.4% of GDP. Highways ₹2.78L Cr, Railways ₹2.52L Cr, Defence ₹6.21L Cr.',         tag:'Economy'   },
  { cat:'PLI',            item:'PLI Scheme Outlay',             detail:'₹6,200 crore across 14 sectors: electronics, pharma, auto, textiles, food processing.',                 tag:'Sectors'   },
  { cat:'Fiscal',         item:'Fiscal Deficit Target',         detail:'4.4% of GDP for FY26. FY25 revised to 5.1%. Consolidation path credible per IMF.',                      tag:'Macro'     },
  { cat:'Defence',        item:'Defence Budget',                detail:'₹6.21 lakh crore — 13% increase. Largest ever. iDEX, Make in India, capital procurement focus.',        tag:'Sector'    },
  { cat:'Railways',       item:'Railways Outlay',               detail:'₹2.52 lakh crore. New lines, station redevelopment, Vande Bharat expansion to tier 2/3 cities.',        tag:'Infra'     },
  { cat:'Housing',        item:'PMAY Urban 2.0',                detail:'₹2.30 lakh crore for 1 crore urban houses. Interest subsidy of ₹1.80 lakh for EWS/LIG.',               tag:'Real Est.' },
  { cat:'Agriculture',    item:'PM KISAN + Kisan Credit',       detail:'PM KISAN ₹6,000/year continues. KCC limit raised to ₹5 lakh from ₹3 lakh.',                            tag:'Agri'      },
  { cat:'Disinvestment',  item:'Disinvestment Target',          detail:'₹50,000 crore. BPCL, CONCOR, SCI, IDBI Bank on block. IDBI bids scrapped Mar 2026.',                   tag:'PSU'       },
  { cat:'Startup',        item:'DPIIT Startup Incentives',      detail:'Angel Tax abolished. DPIIT startups get 100% profit deduction for 3 consecutive years.',                tag:'Startup'   },
  { cat:'EV',             item:'EV & Green Energy',             detail:'PM E-DRIVE ₹10,900 Cr. FAME III expected. Solar PLI ₹24,000 Cr. Green hydrogen ₹19,744 Cr.',          tag:'Green'     },
];

const SEBI_ACTIONS = [
  { date:'Mar 2026', type:'Circular',  title:'F&O Margin Framework',          detail:'New peak margin rules tightened. Intraday leverage caps further reduced for retail participants.' },
  { date:'Feb 2026', type:'Order',     title:'Manipal Group Insider Trading',  detail:'₹45 Cr disgorgement. SEBI found coordinated front-running via shell entities.' },
  { date:'Feb 2026', type:'Circular',  title:'Finfluencer Regulations',        detail:'Mandatory SEBI registration for paid financial advice. Disclosures for YouTube/Instagram.' },
  { date:'Jan 2026', type:'Order',     title:'Front-Running by Fund House',    detail:'₹120 crore disgorgement from fund manager. Real-time trade monitoring ordered.' },
  { date:'Jan 2026', type:'Circular',  title:'SME IPO Norms Tightened',        detail:'Minimum profitability (₹3 Cr EBITDA for 2 years), lock-in strengthened.' },
  { date:'Dec 2025', type:'Circular',  title:'Algo Trading Framework',         detail:'Retail algo trading via API brokers permitted with audit trail, risk controls, SEBI tag.' },
  { date:'Dec 2025', type:'Order',     title:'Finfluencer Crackdown Round 1',  detail:'12 entities barred. Sebi found unregistered advice reaching 5M+ via social media.' },
  { date:'Nov 2025', type:'Circular',  title:'T+0 Settlement Expansion',       detail:'T+0 optional settlement expanded to top 500 stocks. Aims to reduce counterparty risk.' },
];

const RBI_ACTIONS = [
  { date:'Feb 2026', type:'Rate Cut',   title:'Repo Rate Cut 25bps',            detail:'Repo: 6.50% → 6.25%. Neutral stance. Unanimous 6-0. GDP growth prioritised.' },
  { date:'Feb 2026', type:'Circular',   title:'UPI Limit Enhancement',          detail:'UPI transaction limit raised to ₹5 lakh for tax payments, healthcare, education.' },
  { date:'Jan 2026', type:'Guideline',  title:'Digital Lending Norms',          detail:'Revised DLG framework. FLDG capped at 5% for NBFC–Fintech partnerships.' },
  { date:'Jan 2026', type:'Circular',   title:'CBDC (e₹) Phase 2',              detail:'Wholesale CBDC expanded to 20 banks. Retail e₹ pilot crosses 50 lakh users.' },
  { date:'Dec 2025', type:'Hold',       title:'Repo Rate Hold at 6.50%',        detail:'Withdrawal of accommodation stance maintained. CRR cut 50bps to 4.0% to boost liquidity.' },
  { date:'Nov 2025', type:'Guideline',  title:'Gold Loan Norms',                detail:'LTV cap at 75% reinstated. Operational guidelines for gold loan NBFCs tightened.' },
];

const POLICY_TRACKER = [
  { ministry:'Finance', scheme:'Viksit Bharat 2047',     status:'Active',    detail:'Long-term economic blueprint targeting $30T GDP. Annual budget aligned.' },
  { ministry:'Commerce', scheme:'India–UK FTA',          status:'Near Final','detail':'FTA negotiations concluded. Expected ratification H1 2026.' },
  { ministry:'Commerce', scheme:'India–US Trade Deal',   status:'Critical Minerals', detail:'Section 301 probe filed against India Feb 2026. Bilateral talks ongoing.' },
  { ministry:'IT',       scheme:'Digital India Act',     status:'Drafting',   detail:'Replaces IT Act 2000. AI regulation, deepfake laws, data fiduciary framework.' },
  { ministry:'Power',    scheme:'Green Hydrogen Mission',status:'Active',     detail:'₹19,744 Cr outlay. 5 MMT production target by 2030.' },
  { ministry:'Health',   scheme:'Ayushman Bharat Expansion',status:'Active', detail:'Coverage expanded to 70+ age group. Hospital empanelment at 29,000+.' },
  { ministry:'Defence',  scheme:'iDEX / DRHBO',         status:'Active',     detail:'Defence innovation ecosystem. 300+ startups funded. Export target $5B by 2025.' },
  { ministry:'DPIIT',    scheme:'Startup India 2.0',     status:'Active',     detail:'Angel tax abolished. 1.4 lakh DPIIT-recognised startups. Unicorn count 117.' },
];

export default function GovernmentPage() {
  const [tab, setTab] = useState('budget');
  const { data } = useSWR('/api/feed', fetcher, { revalidateOnFocus: false });
  const govNews = (data?.articles || []).filter(a => a.category === 'government').slice(0, 15);

  const TABS = [
    { id:'budget',  label:'Budget 2025-26' },
    { id:'sebi',    label:'SEBI Actions'   },
    { id:'rbi',     label:'RBI Actions'    },
    { id:'policy',  label:'Policy Tracker' },
    { id:'news',    label:'Live Feed'      },
  ];

  const TYPE_COL = { 'Rate Cut':'var(--green)', 'Rate Hike':'var(--red)', Hold:'var(--yellow)',
    Circular:'var(--blue)', Order:'var(--red)', Guideline:'var(--muted)', 'Near Final':'var(--green)',
    Active:'var(--green)', Drafting:'var(--yellow)', Critical:'var(--orange)' };

  return (
    <Layout title="Govt & Policy" desc="Union Budget, SEBI orders, RBI actions, policy tracker — India regulatory intelligence">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl">
            <span className="slbl-dot" style={{background:'var(--yellow)'}}/>
            Govt & Policy
          </div>

          {/* Sub tabs */}
          <div style={{display:'flex',gap:0,marginBottom:20,borderBottom:'1px solid var(--border)',overflowX:'auto'}}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{padding:'7px 14px',background:'none',border:'none',whiteSpace:'nowrap',
                  fontSize:'var(--fs-xs)',fontWeight:500,letterSpacing:'0.08em',textTransform:'uppercase',
                  color:tab===t.id?'var(--bright)':'var(--muted)',
                  borderBottom:tab===t.id?'2px solid var(--blue)':'2px solid transparent',
                  cursor:'pointer',transition:'all 0.12s'}}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Budget */}
          {tab === 'budget' && (
            <div>
              <div style={{padding:'8px 12px',background:'var(--raised)',borderLeft:'2px solid var(--yellow)',
                fontSize:'var(--fs-sm)',color:'var(--muted)',lineHeight:1.6,marginBottom:16}}>
                📅 Union Budget 2025-26 presented by FM Nirmala Sitharaman on Feb 1, 2025. Full FY26 in effect.
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
                {BUDGET_ITEMS.map((item,i) => (
                  <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',padding:14,
                    transition:'border-color 0.15s'}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{fontSize:'var(--fs-label)',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--yellow)'}}>{item.cat}</span>
                      <span style={{fontSize:'var(--fs-label)',background:'var(--raised)',color:'var(--muted)',padding:'1px 5px',borderRadius:2}}>{item.tag}</span>
                    </div>
                    <div style={{fontSize:'var(--fs-base)',fontWeight:600,color:'var(--bright)',marginBottom:5,fontFamily:'var(--font-sans)'}}>{item.item}</div>
                    <div style={{fontSize:'var(--fs-sm)',color:'var(--muted)',lineHeight:1.5}}>{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEBI */}
          {tab === 'sebi' && (
            <div>
              {SEBI_ACTIONS.map((a,i) => (
                <div key={i} style={{padding:'13px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',marginBottom:5}}>
                    <span style={{fontSize:'var(--fs-xs)',color:'var(--muted)'}}>{a.date}</span>
                    <span style={{fontSize:'var(--fs-label)',letterSpacing:'0.1em',textTransform:'uppercase',
                      color:TYPE_COL[a.type]||'var(--muted)',background:'var(--raised)',padding:'1px 5px',borderRadius:2,
                      border:`1px solid ${TYPE_COL[a.type]||'var(--border)'}`}}>{a.type}</span>
                    <span style={{fontSize:'var(--fs-base)',fontWeight:600,color:'var(--bright)',fontFamily:'var(--font-sans)'}}>{a.title}</span>
                  </div>
                  <div style={{fontSize:'var(--fs-sm)',color:'var(--muted)',lineHeight:1.5}}>{a.detail}</div>
                </div>
              ))}
            </div>
          )}

          {/* RBI */}
          {tab === 'rbi' && (
            <div>
              {RBI_ACTIONS.map((a,i) => (
                <div key={i} style={{padding:'13px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',marginBottom:5}}>
                    <span style={{fontSize:'var(--fs-xs)',color:'var(--muted)'}}>{a.date}</span>
                    <span style={{fontSize:'var(--fs-label)',letterSpacing:'0.1em',textTransform:'uppercase',
                      color:TYPE_COL[a.type]||'var(--muted)',background:'var(--raised)',padding:'1px 5px',borderRadius:2,
                      border:`1px solid ${TYPE_COL[a.type]||'var(--border)'}`}}>{a.type}</span>
                    <span style={{fontSize:'var(--fs-base)',fontWeight:600,color:'var(--bright)',fontFamily:'var(--font-sans)'}}>{a.title}</span>
                  </div>
                  <div style={{fontSize:'var(--fs-sm)',color:'var(--muted)',lineHeight:1.5}}>{a.detail}</div>
                </div>
              ))}
            </div>
          )}

          {/* Policy Tracker */}
          {tab === 'policy' && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10}}>
              {POLICY_TRACKER.map((p,i) => {
                const col = TYPE_COL[p.status] || 'var(--muted)';
                return (
                  <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',
                    borderLeft:`3px solid ${col}`,padding:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                      <span style={{fontSize:'var(--fs-label)',color:'var(--muted)',letterSpacing:'0.08em',textTransform:'uppercase'}}>{p.ministry}</span>
                      <span style={{fontSize:'var(--fs-label)',color:col,letterSpacing:'0.08em',textTransform:'uppercase'}}>{p.status}</span>
                    </div>
                    <div style={{fontSize:'var(--fs-base)',fontWeight:600,color:'var(--bright)',marginBottom:5,fontFamily:'var(--font-sans)'}}>{p.scheme}</div>
                    <div style={{fontSize:'var(--fs-sm)',color:'var(--muted)',lineHeight:1.5}}>{p.detail}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Live News */}
          {tab === 'news' && (
            <div>
              {govNews.length
                ? govNews.map(a => <ArticleCard key={a.id} article={a}/>)
                : [1,2,3].map(i => (
                    <div key={i} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                      <div className="skel" style={{height:10,width:'90%',marginBottom:8}}/>
                      <div className="skel" style={{height:10,width:'60%'}}/>
                    </div>
                  ))
              }
            </div>
          )}
        </div>

        {/* Aside */}
        <div className="shell-aside">
          <div className="widget">
            <div className="w-head">🗓 Key Upcoming Events</div>
            <div className="w-body" style={{padding:0}}>
              {[
                { date:'Apr 1, 2026',  event:'FY27 begins',             type:'fiscal'   },
                { date:'Apr 9, 2026',  event:'RBI MPC Decision',        type:'rbi'      },
                { date:'Apr 30, 2026', event:'Q4 FY26 Results Start',   type:'earnings' },
                { date:'May 2026',     event:'India–UK FTA signing',    type:'trade'    },
                { date:'Jun 6, 2026',  event:'RBI MPC Meeting',         type:'rbi'      },
                { date:'Jul 2026',     event:'Union Budget FY27 prep',  type:'fiscal'   },
              ].map((e,i) => (
                <div key={i} style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>
                  <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)',marginBottom:2}}>{e.date}</div>
                  <div style={{fontSize:'var(--fs-sm)',color:'var(--body)',fontWeight:500}}>{e.event}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="widget" style={{marginTop:12}}>
            <div className="w-head">📋 Regulatory Bodies</div>
            <div className="w-body" style={{padding:0}}>
              {[
                { name:'RBI',   full:'Reserve Bank of India',         url:'rbi.org.in'    },
                { name:'SEBI',  full:'Securities & Exchange Board',   url:'sebi.gov.in'   },
                { name:'IRDAI', full:'Insurance Regulatory Body',     url:'irdai.gov.in'  },
                { name:'PFRDA', full:'Pension Fund Regulator',        url:'pfrda.org.in'  },
                { name:'MCA',   full:'Ministry of Corporate Affairs', url:'mca.gov.in'    },
                { name:'DPIIT', full:'Dept for Promotion of Industry',url:'dpiit.gov.in'  },
              ].map((b,i) => (
                <div key={i} style={{padding:'7px 12px',borderBottom:'1px solid var(--border)',
                  display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:'var(--fs-xs)',fontWeight:600,color:'var(--bright)'}}>{b.name}</div>
                    <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)'}}>{b.full}</div>
                  </div>
                  <span style={{fontSize:'var(--fs-label)',color:'var(--blue)'}}>{b.url}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
