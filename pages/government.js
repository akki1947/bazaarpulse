import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import ArticleCard from '../components/ui/ArticleCard';

const fetcher = url => fetch(url).then(r=>r.json());

const BUDGET_ITEMS = [
  { cat:'Direct Tax', item:'New Tax Slabs', detail:'₹0-3L: Nil | 3-7L: 5% | 7-10L: 10% | 10-12L: 15% | 12-15L: 20% | >15L: 30%', tag:'Personal Finance' },
  { cat:'Capital Gains', item:'LTCG on Equity', detail:'12.5% (was 10%). STCG 20% (was 15%). Indexation removed on RE.', tag:'Investing' },
  { cat:'Capex', item:'Capital Expenditure', detail:'₹11.11 lakh crore — 3.4% of GDP. Infrastructure-heavy allocation.', tag:'Economy' },
  { cat:'PLI', item:'PLI Scheme Outlay', detail:'₹6,200 crore across 14 sectors including electronics, pharma, auto.', tag:'Sectors' },
  { cat:'Fiscal', item:'Fiscal Deficit Target', detail:'4.4% of GDP for FY26. FY25 revised to 5.1%.', tag:'Macro' },
  { cat:'Defence', item:'Defence Budget', detail:'₹6.21 lakh crore — 13% increase. Largest ever allocation.', tag:'Sector' },
  { cat:'Railways', item:'Railways Outlay', detail:'₹2.52 lakh crore — new lines, upgrades, Vande Bharat expansion.', tag:'Infra' },
  { cat:'Disinvestment', item:'Disinvestment Target', detail:'₹50,000 crore. Key: BPCL, CONCOR, SCI likely on block.', tag:'PSU' },
];

const SEBI_ACTIONS = [
  { date:'Feb 2026', type:'Circular', title:'F&O Lot Size Revision', detail:'Increased minimum lot size across index derivatives to reduce retail speculation.' },
  { date:'Jan 2026', type:'Order', title:'Front-Running Crackdown', detail:'₹120 crore disgorgement from fund house employees for front-running trades.' },
  { date:'Jan 2026', type:'Circular', title:'SME IPO Norms Tightened', detail:'Minimum profitability and lock-in requirements strengthened for SME IPOs.' },
  { date:'Dec 2025', type:'Circular', title:'Algo Trading Framework', detail:'SEBI framework for retail algo trading: API brokers, risk checks, audit trail.' },
  { date:'Dec 2025', type:'Order', title:'Finfluencer Crackdown', detail:'12 entities barred for unregistered investment advice via social media.' },
];

export default function GovernmentPage() {
  const { data } = useSWR('/api/feed', fetcher, { revalidateOnFocus:false });
  const govNews = (data?.articles||[]).filter(a => a.category==='government').slice(0,12);

  return (
    <Layout title="Govt & Policy" desc="Union Budget, SEBI orders, RBI actions, policy tracker">
      <div className="shell">
        <div className="shell-main">
          {/* Budget */}
          <div className="slbl"><span className="slbl-dot" style={{background:'var(--yellow)'}}/>Union Budget 2025-26
            <span className="slbl-count">Feb 1, 2025 · FM Sitharaman</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10,marginBottom:28}}>
            {BUDGET_ITEMS.map((item,i) => (
              <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',padding:'14px',transition:'border-color 0.15s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border2)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
              >
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:'0.58rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--yellow)'}}>{item.cat}</span>
                  <span style={{fontSize:'0.56rem',letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--dim)',background:'var(--raised)',padding:'1px 5px',borderRadius:2}}>{item.tag}</span>
                </div>
                <div style={{fontSize:'0.82rem',fontWeight:600,color:'var(--bright)',marginBottom:5,fontFamily:'var(--font-sans)'}}>{item.item}</div>
                <div style={{fontSize:'0.72rem',color:'var(--muted)',lineHeight:1.5}}>{item.detail}</div>
              </div>
            ))}
          </div>

          {/* SEBI Actions */}
          <div className="slbl" style={{marginTop:8}}><span className="slbl-dot" style={{background:'var(--orange)'}}/>SEBI Actions & Circulars</div>
          <div style={{marginBottom:28}}>
            {SEBI_ACTIONS.map((item,i) => (
              <div key={i} style={{display:'flex',gap:14,padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{flexShrink:0,width:60}}>
                  <div style={{fontSize:'0.6rem',color:'var(--dim)'}}>{item.date}</div>
                  <div style={{fontSize:'0.58rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--orange)',marginTop:2}}>{item.type}</div>
                </div>
                <div>
                  <div style={{fontSize:'0.84rem',fontWeight:500,color:'var(--bright)',marginBottom:4,fontFamily:'var(--font-sans)'}}>{item.title}</div>
                  <div style={{fontSize:'0.72rem',color:'var(--muted)',lineHeight:1.5}}>{item.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Live news */}
          <div className="slbl"><span className="slbl-dot"/>Live Policy News
            <span className="slbl-count">{govNews.length} stories</span>
          </div>
          {govNews.length ? govNews.map(a => <ArticleCard key={a.id} article={a}/>) : (
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
            <div className="w-head">🔑 Key Policies FY26</div>
            <div className="w-body">
              {[['PLI Scheme','₹6,200 Cr, 14 sectors'],['GIFT City','IFSCs, SEBI sandbox'],
                ['NPS Vatsalya','Child pension scheme'],['MSME Credit','₹15,000 Cr fund'],
                ['Green Hydrogen','₹600 Cr mission'],['Semiconductor','₹76,000 Cr scheme'],
              ].map(([k,v]) => (
                <div key={k} style={{padding:'5px 0',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',gap:8}}>
                  <span style={{fontSize:'0.7rem',color:'var(--body)'}}>{k}</span>
                  <span style={{fontSize:'0.68rem',color:'var(--muted)',textAlign:'right'}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="widget">
            <div className="w-head">📅 Upcoming Policy Dates</div>
            <div className="w-body">
              {[['Apr 2026','RBI MPC Meeting'],['May 2026','Q4 FY26 GDP Data'],
                ['Jun 2026','RBI MPC Meeting'],['Jul 2026','Union Budget FY27'],
                ['Aug 2026','RBI MPC Meeting'],
              ].map(([d,e]) => (
                <div key={d} style={{padding:'5px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{fontSize:'0.6rem',color:'var(--dim)'}}>{d}</div>
                  <div style={{fontSize:'0.72rem',color:'var(--body)'}}>{e}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
