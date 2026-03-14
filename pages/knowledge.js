import { useState } from 'react';
import Layout from '../components/layout/Layout';

const TOPICS = [
  {
    id:'rbi', icon:'🏦', title:'RBI & Monetary Policy', level:'Beginner', tag:'Macro',
    summary:'The Reserve Bank of India controls money supply, interest rates and inflation targeting.',
    points:[
      'RBI is India\'s central bank, established 1935. Core mandates: price stability, growth support, financial stability.',
      'Monetary Policy Committee (MPC): 6-member body meets every 2 months to set the Repo Rate.',
      'Repo Rate (6.25%) = rate at which banks borrow from RBI overnight. Lower rate → cheaper loans → more investment.',
      'CRR (4%): Cash banks must keep with RBI. Cut = more money in system. SLR (18%): Bonds banks must hold.',
      'For investors: Rate cuts → bond prices rise, FD rates fall, equities often rally. Rate hikes = opposite.',
      'RBI also manages INR via forex intervention, regulates all banks, NBFCs, and payment systems.',
    ],
    keyRates:[
      { label:'MPC Meetings/Year', val:'6',      note:'Every ~2 months' },
      { label:'Inflation Target',  val:'4% ±2%', note:'RBI mandate band' },
      { label:'MPC Members',       val:'6',      note:'3 RBI + 3 Govt' },
      { label:'RBI Est.',          val:'1935',   note:'Year established' },
    ],
    tags:['Macro','Banking','Rates'],
  },
  {
    id:'sebi', icon:'⚖️', title:'SEBI & Market Regulation', level:'Beginner', tag:'Regulation',
    summary:'SEBI is the watchdog for Indian capital markets — stocks, mutual funds, brokers, and FIIs.',
    points:[
      'SEBI (est. 1992) regulates: stock exchanges (NSE/BSE), brokers, mutual funds, FIIs, investment advisors.',
      'SEBI\'s 3 functions: Investor protection, market development, regulation of intermediaries.',
      'Key powers: Can ban traders, impose fines, freeze accounts, order disgorgement of illegal gains.',
      'SEBI categories for investors: Retail (< ₹2L per IPO), HNI (₹2–10L), QIB (FIIs, MFs, banks).',
      'Recent crackdowns: F&O lot size increase, finfluencer regulations, algo trading framework.',
      'SCORES portal: File complaints against SEBI-regulated entities. 30-day resolution target.',
    ],
    keyRates:[
      { label:'SEBI Est.',         val:'1992',  note:'Year established' },
      { label:'Listed Companies',  val:'5,300+',note:'NSE + BSE combined' },
      { label:'SCORES Portal',     val:'30 days',note:'Complaint resolution' },
      { label:'Demat Accounts',    val:'17 Cr+', note:'Mar 2026 milestone' },
    ],
    tags:['Regulation','Tax','Markets'],
  },
  {
    id:'nifty', icon:'📈', title:'Nifty, Sensex & Indices', level:'Beginner', tag:'Markets',
    summary:'India\'s benchmark indices — how they work, what moves them, and how to use them.',
    points:[
      'Nifty 50: Top 50 companies by free-float market cap on NSE. Rebalanced semi-annually.',
      'Sensex: Top 30 companies on BSE. Both are float-adjusted market cap weighted indices.',
      'Nifty sectoral indices: Bank, IT, Pharma, Auto, Metal, FMCG, Realty — each tracks its sector.',
      'Index funds/ETFs track these indices. Low cost (0.05–0.2% expense ratio) vs active funds (1–2%).',
      'What moves Nifty: FII flows, RBI policy, US Fed, crude oil, INR, quarterly earnings, global cues.',
      'Circuit breakers: Trading halts at 10%, 15%, 20% Nifty move. Prevents panic selling.',
    ],
    keyRates:[
      { label:'Nifty 50 Stocks',  val:'50',     note:'Free-float weighted' },
      { label:'Rebalancing',      val:'2x/year',note:'Semi-annual review' },
      { label:'Circuit Breakers', val:'10/15/20%',note:'Nifty move triggers halt' },
      { label:'Index Launch',     val:'1996',   note:'NSE Nifty base year 1995' },
    ],
    tags:['Markets','Index','Investing'],
  },
  {
    id:'fo', icon:'🔄', title:'F&O — Futures & Options', level:'Intermediate', tag:'Derivatives',
    summary:'Derivatives explained — what F&O is, how it works, and why most retail traders lose.',
    points:[
      'F&O = Futures & Options. Derivatives — contracts deriving value from underlying (stock/index).',
      'Futures: Agreement to buy/sell at fixed price on future date. Compulsory settlement.',
      'Options: Right (not obligation) to buy (Call) or sell (Put) at strike price before expiry.',
      'Premium = price of option. Affected by: intrinsic value + time value + implied volatility.',
      'SEBI data: 93% of F&O retail traders lose money. Average loss ₹1.1L/year per trader.',
      'Lot size: Nifty = 25 units per lot. Minimum margin required. Weekly and monthly expiry.',
      'Hedging use: Legitimate use = protecting portfolio. Speculation = high risk, leverage amplifies losses.',
    ],
    keyRates:[
      { label:'Nifty Lot Size',   val:'25 units',note:'Per Nifty contract' },
      { label:'Retail Loss %',    val:'93%',     note:'SEBI FY24 study' },
      { label:'F&O Traders (IN)', val:'1.1 Cr+', note:'Active retail traders' },
      { label:'Weekly Expiry',    val:'Thursday',note:'Nifty/BankNifty/FinNifty' },
    ],
    tags:['Derivatives','Risk','Advanced'],
  },
  {
    id:'mf', icon:'💼', title:'Mutual Funds & SIP', level:'Beginner', tag:'Investing',
    summary:'Everything about mutual funds — types, taxation, SIP mechanics and how to choose.',
    points:[
      'Mutual fund = pool of money from many investors, managed by AMC (Asset Management Company).',
      'Categories: Equity (stocks), Debt (bonds), Hybrid (both), Index (passive), ELSS (tax saving).',
      'NAV (Net Asset Value) = fund\'s per-unit price. Calculated daily after market close.',
      'SIP (Systematic Investment Plan) = invest fixed amount monthly. Benefits from rupee cost averaging.',
      'Expense ratio: Annual fee deducted from NAV. Index funds: 0.05–0.2%. Active: 0.5–2%.',
      'Taxation: Equity MF LTCG (>1yr): 12.5% above ₹1.25L. Debt MF: slab rate (post Apr 2023).',
      'AMFI registration: Check if your fund house and advisor are registered at amfiindia.com.',
    ],
    keyRates:[
      { label:'Total MF AUM',    val:'₹67L Cr+',note:'Feb 2026 record' },
      { label:'SIP Accounts',    val:'10 Cr+',  note:'Active SIP folios' },
      { label:'Monthly SIP Flow',val:'₹26,000 Cr',note:'Record high Feb 2026' },
      { label:'Min SIP',         val:'₹100',    note:'Most platforms' },
    ],
    tags:['Investing','Tax','SIP'],
  },
  {
    id:'tax', icon:'📋', title:'Capital Gains & Tax', level:'Intermediate', tag:'Tax',
    summary:'Complete guide to taxes on investments — stocks, MF, FD, real estate and gold.',
    points:[
      'STCG (Short Term Capital Gains): Sold within 1 year → 20% flat for equity/equity MF.',
      'LTCG (Long Term Capital Gains): Held >1 year → 12.5% above ₹1.25L annual exemption.',
      'Debt MF (post Apr 2023): Taxed at slab rate regardless of holding period. No indexation.',
      'FD Interest: Added to income, taxed at slab rate. TDS at 10% if interest > ₹40K/year.',
      'Real Estate: LTCG (>2yr) 12.5% without indexation (Budget 2024 change). STCG at slab.',
      'Gold: Physical/SGB/Gold ETF — LTCG (>3yr) 12.5%. STT exempt on SGB redemption.',
      'Tax Harvesting: Book LTCG up to ₹1.25L every year to reset cost basis. Legal and effective.',
      'ELSS: Invest up to ₹1.5L under 80C. 3-year lock-in. LTCG applicable on redemption.',
    ],
    keyRates:[
      { label:'LTCG Exemption', val:'₹1.25L',note:'Annual equity LTCG exempt' },
      { label:'FD TDS Limit',   val:'₹40K',  note:'Interest above = TDS applies' },
      { label:'ELSS Lock-in',   val:'3 years',note:'Shortest tax-saving lock-in' },
      { label:'80C Limit',      val:'₹1.5L', note:'Max annual deduction' },
    ],
    tags:['Tax','LTCG','Planning'],
  },
  {
    id:'forex', icon:'💱', title:'Forex & Currency', level:'Intermediate', tag:'Forex',
    summary:'How the rupee works, what affects INR/USD, and how currency moves impact your portfolio.',
    points:[
      'INR is a partially convertible currency. RBI manages exchange rate through intervention.',
      'Factors weakening INR: High crude oil prices, FII outflows, current account deficit, US rate hikes.',
      'Factors strengthening INR: High forex reserves, FII inflows, falling crude, RBI intervention.',
      'Impact on sectors: Weak INR = IT/pharma exports benefit (earn USD), importers (oil, electronics) lose.',
      'Forex reserves ($620B): ~11 months import cover. RBI uses this to defend INR at key levels.',
      'LRS (Liberalised Remittance Scheme): Indians can remit up to $250,000/year abroad. TCS applicable.',
      'RBI intervention: Sells USD when INR weakens sharply, buys when INR strengthens excessively.',
    ],
    keyRates:[
      { label:'Forex Reserves', val:'$620B+',note:'~11 months import cover' },
      { label:'LRS Annual Limit',val:'$250K', note:'Per person per year' },
      { label:'TCS on LRS',     val:'20%',   note:'>₹7L non-education remittance' },
      { label:'India Rank',     val:'Top 5', note:'Global forex reserve holders' },
    ],
    tags:['Forex','Currency','RBI'],
  },
  {
    id:'glossary', icon:'📖', title:'Investor Glossary', level:'Beginner', tag:'Reference',
    summary:'Quick-reference glossary of 40+ financial terms every Indian investor should know.',
    points:[], // rendered differently
    glossary:[
      { term:'AUM',        def:'Assets Under Management — total market value of funds managed by AMC.' },
      { term:'CAGR',       def:'Compound Annual Growth Rate — annualised return over multiple years.' },
      { term:'CASA',       def:'Current Account Savings Account ratio — higher = cheaper funding for banks.' },
      { term:'Circuit',    def:'Trading halt triggered at 5/10/20% price move on individual stocks.' },
      { term:'CRISIL',     def:'Credit rating agency. AAA = highest safety. D = default.' },
      { term:'DII',        def:'Domestic Institutional Investors — mutual funds, insurance companies.' },
      { term:'DRHP',       def:'Draft Red Herring Prospectus — IPO document filed with SEBI before listing.' },
      { term:'EBITDA',     def:'Earnings Before Interest, Tax, Depreciation, Amortisation — operating profit.' },
      { term:'EPS',        def:'Earnings Per Share — net profit divided by total shares outstanding.' },
      { term:'FII/FPI',    def:'Foreign Institutional/Portfolio Investor — overseas funds investing in India.' },
      { term:'GMP',        def:'Grey Market Premium — unofficial IPO price before listing. Not regulated.' },
      { term:'IEPF',       def:'Investor Education and Protection Fund — unclaimed dividends go here.' },
      { term:'IPO',        def:'Initial Public Offering — first sale of shares to the public.' },
      { term:'MCX',        def:'Multi Commodity Exchange — India\'s leading commodity derivatives exchange.' },
      { term:'NAV',        def:'Net Asset Value — price per unit of a mutual fund. Calculated daily.' },
      { term:'NPA',        def:'Non-Performing Asset — loan where repayment is overdue >90 days.' },
      { term:'P/E Ratio',  def:'Price to Earnings — stock price divided by EPS. Valuation metric.' },
      { term:'P/B Ratio',  def:'Price to Book — market cap vs book value. Used for banks/financials.' },
      { term:'PLI',        def:'Production Linked Incentive — govt scheme to boost domestic manufacturing.' },
      { term:'ROCE',       def:'Return on Capital Employed — profitability relative to capital used.' },
      { term:'ROE',        def:'Return on Equity — net profit as % of shareholders equity.' },
      { term:'SEBI',       def:'Securities and Exchange Board of India — capital markets regulator.' },
      { term:'SGBs',       def:'Sovereign Gold Bonds — RBI-issued bonds linked to gold price. Tax-free on maturity.' },
      { term:'SIP',        def:'Systematic Investment Plan — fixed periodic investment in a mutual fund.' },
      { term:'STT',        def:'Securities Transaction Tax — charged on every equity buy/sell transaction.' },
      { term:'T+1',        def:'Trade plus 1 day — settlement cycle. Shares credited next trading day.' },
      { term:'UPI',        def:'Unified Payments Interface — NPCI real-time payment system.' },
      { term:'XIRR',       def:'Extended Internal Rate of Return — accurate return calc for SIP/irregular cash flows.' },
      { term:'YTM',        def:'Yield to Maturity — total return on bond if held until maturity.' },
    ],
    tags:['Reference','Basics','All levels'],
  },
];

const LEVEL_COL = { Beginner:'var(--green)', Intermediate:'var(--yellow)', Advanced:'var(--red)' };

export default function KnowledgePage() {
  const [active, setActive] = useState('rbi');
  const [search, setSearch] = useState('');
  const topic = TOPICS.find(t => t.id === active);

  const filteredTopics = TOPICS.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.summary.toLowerCase().includes(search.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Layout title="Knowledge Base" desc="RBI, SEBI, Nifty, F&O, Mutual Funds, Tax, Forex — India investment education">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl">
            <span className="slbl-dot" style={{background:'var(--purple)'}}/>
            Knowledge Base
            <span className="slbl-count">{TOPICS.length} topics</span>
          </div>

          {/* Topic selector */}
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
            {TOPICS.map(t => (
              <button key={t.id} onClick={() => setActive(t.id)}
                className={`fchip ${active===t.id?'on':''}`}>
                {t.icon} {t.title.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Topic content */}
          {topic && (
            <div key={active} className="animate-fade-up">
              {/* Header */}
              <div style={{background:'var(--surface)',border:'1px solid var(--border)',
                borderTop:`3px solid ${LEVEL_COL[topic.level]||'var(--blue)'}`,
                padding:'18px 20px',marginBottom:16}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:14}}>
                  <span style={{fontSize:'2rem',lineHeight:1}}>{topic.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                      <h2 style={{fontSize:'var(--fs-xl)',fontWeight:700,color:'var(--bright)',
                        fontFamily:'var(--font-display)',letterSpacing:'-0.01em'}}>{topic.title}</h2>
                      <span style={{fontSize:'var(--fs-label)',color:LEVEL_COL[topic.level],
                        border:`1px solid ${LEVEL_COL[topic.level]}`,padding:'2px 8px',borderRadius:2,fontWeight:600}}>
                        {topic.level}
                      </span>
                    </div>
                    <p style={{fontSize:'var(--fs-base)',color:'var(--body)',lineHeight:1.65}}>{topic.summary}</p>
                    <div style={{display:'flex',gap:4,marginTop:8,flexWrap:'wrap'}}>
                      {topic.tags.map(tag => (
                        <span key={tag} style={{fontSize:'var(--fs-label)',background:'var(--raised)',
                          color:'var(--body)',padding:'2px 8px',borderRadius:2,border:'1px solid var(--border)'}}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key rates */}
              {topic.keyRates && (
                <>
                <div style={{fontSize:'var(--fs-label)',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--muted)',marginBottom:10}}>Key Statistics</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:8,marginBottom:16}}>
                  {topic.keyRates.map((r,i) => (
                    <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',padding:'10px 12px'}}>
                      <div style={{fontSize:'var(--fs-label)',color:'var(--muted)',letterSpacing:'0.08em',
                        textTransform:'uppercase',marginBottom:5}}>{r.label}</div>
                      <div style={{fontSize:'var(--fs-lg)',fontWeight:700,color:'var(--bright)',
                        fontFamily:'var(--font-mono)',marginBottom:3}}>{r.val}</div>
                      <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)'}}>{r.note}</div>
                    </div>
                  ))}
                </div>
                </>
              )}

              {/* Glossary special rendering */}
              {topic.id === 'glossary' ? (
                <div>
                  <input
                    type="text"
                    placeholder="Search glossary terms..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{width:'100%',background:'var(--raised)',border:'1px solid var(--border)',
                      color:'var(--body)',fontFamily:'var(--font-mono)',fontSize:'var(--fs-sm)',
                      padding:'8px 12px',outline:'none',marginBottom:12,borderRadius:3}}
                  />
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:8}}>
                    {(topic.glossary||[])
                      .filter(g => !search || g.term.toLowerCase().includes(search.toLowerCase()) || g.def.toLowerCase().includes(search.toLowerCase()))
                      .map((g,i) => (
                        <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',padding:'10px 14px'}}>
                          <div style={{fontSize:'var(--fs-sm)',fontWeight:700,color:'var(--blue)',
                            fontFamily:'var(--font-mono)',marginBottom:4}}>{g.term}</div>
                          <div style={{fontSize:'var(--fs-xs)',color:'var(--body)',lineHeight:1.6}}>{g.def}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ) : (
                /* Key points */
                <div>
                  {topic.points.map((point, i) => (
                    <div key={i} style={{display:'flex',gap:12,padding:'10px 0',
                      borderBottom:'1px solid var(--border)'}}>
                      <div style={{flexShrink:0,width:22,height:22,borderRadius:'50%',
                        background:'var(--raised)',border:'1px solid var(--border)',
                        display:'flex',alignItems:'center',justifyContent:'center',marginTop:1}}>
                        <span style={{fontSize:'var(--fs-label)',color:'var(--blue)',fontWeight:700}}>{i+1}</span>
                      </div>
                      <p style={{fontSize:'var(--fs-sm)',color:'var(--body)',lineHeight:1.7,margin:0}}>{point}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Aside */}
        <div className="shell-aside">
          <div className="widget">
            <div className="w-head">📚 All Topics</div>
            <div className="w-body" style={{padding:0}}>
              {TOPICS.map(t => (
                <div key={t.id} onClick={() => setActive(t.id)}
                  style={{padding:'9px 12px',borderBottom:'1px solid var(--border)',
                    cursor:'pointer',background:active===t.id?'var(--raised)':'transparent',
                    borderLeft:active===t.id?'2px solid var(--blue)':'2px solid transparent',
                    transition:'all 0.1s'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:'0.9rem'}}>{t.icon}</span>
                    <div>
                      <div style={{fontSize:'var(--fs-xs)',fontWeight:active===t.id?600:400,
                        color:active===t.id?'var(--bright)':'var(--body)'}}>{t.title}</div>
                      <span style={{fontSize:'var(--fs-label)',color:LEVEL_COL[t.level]}}>{t.level}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{marginTop:12,padding:12,background:'var(--raised)',border:'1px solid var(--border)',
            fontSize:'var(--fs-xs)',color:'var(--muted)',lineHeight:1.9}}>
            <div style={{color:'var(--body)',fontWeight:600,marginBottom:6,letterSpacing:'0.08em',
              textTransform:'uppercase',fontSize:'var(--fs-label)'}}>Disclaimer</div>
            Educational content only. Not financial advice. Consult a SEBI-registered investment advisor before making decisions.
          </div>
        </div>
      </div>
    </Layout>
  );
}
