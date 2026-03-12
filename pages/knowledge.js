import { useState } from 'react';
import Layout from '../components/layout/Layout';

const TOPICS = [
  {
    id:'rbi', icon:'🏦', title:'RBI & Monetary Policy', level:'Beginner',
    summary:'The Reserve Bank of India controls money supply, interest rates and inflation.',
    content:`The RBI is India's central bank, established in 1935. It has three core mandates:

1. **Price Stability** — Keep CPI inflation near 4% (±2% band)
2. **Growth Support** — Ensure adequate credit flow to the economy
3. **Financial Stability** — Regulate banks and payment systems

**Monetary Policy Committee (MPC):** 6-member body that meets every 2 months to set the Repo Rate — the rate at which banks borrow from RBI overnight.

**Key Rates:**
- Repo Rate: 6.25% (Feb 2026)
- Reverse Repo: 3.35%
- CRR (Cash Reserve Ratio): 4%
- SLR (Statutory Liquidity Ratio): 18%

**Why it matters for investors:** When RBI cuts rates, borrowing becomes cheaper → businesses invest more → corporate earnings grow → equity markets often rally. Bond prices rise (yields fall). FD rates eventually decrease. The opposite happens on rate hikes.`,
    tags:['Macro','Banking','Rates']
  },
  {
    id:'sebi', icon:'⚖️', title:'SEBI & Market Regulation', level:'Beginner',
    summary:'SEBI is the watchdog for Indian capital markets — stocks, mutual funds, brokers.',
    content:`Securities and Exchange Board of India (SEBI) was established in 1992.

**What SEBI regulates:**
- Stock exchanges (NSE, BSE)
- Brokers and sub-brokers
- Mutual fund houses (AMCs)
- FIIs/FPIs (foreign investors)
- Insider trading and price manipulation
- IPOs and takeovers

**Key SEBI frameworks:**
- SEBI (PIT) Regulations — Prohibition of Insider Trading
- Takeover Code — 26% trigger for open offer
- LODR — Listing obligations and disclosure norms
- MF Categorisation — Standardised 36-category scheme structure

**For retail investors:** SEBI's investor protection fund covers up to ₹25 lakh if broker defaults. Always check if your broker is SEBI-registered at sebi.gov.in`,
    tags:['Regulation','Stocks','MF']
  },
  {
    id:'nifty', icon:'📈', title:'Understanding Nifty & Sensex', level:'Beginner',
    summary:'India\'s two most-watched stock market benchmarks — what they measure and why.',
    content:`**Nifty 50** — NSE's benchmark index of the 50 largest, most liquid companies.
Launched: 1996 | Base: 1000 | Current: ~22,000

**Sensex (BSE 30)** — BSE's index of 30 large companies.
Launched: 1979 | Base: 100 | Current: ~73,000

**How they're calculated:** Free-float market capitalisation weighted. Only the freely traded portion of shares counts (promoter holdings excluded).

**Nifty Sectors (top weights):**
- Financial Services ~33%
- IT ~13%
- Oil & Gas ~12%
- Consumer Goods ~9%
- Auto ~7%

**Important derived indices:**
- Nifty Bank, Nifty IT, Nifty Pharma, Nifty Metal
- Nifty Midcap 150, Nifty Smallcap 250
- India VIX — fear gauge (volatility index)

**Tip:** Most retail investors should just buy a Nifty 50 or Nifty 500 index fund via SIP and hold for 10+ years. Historically ~12-15% CAGR over long periods.`,
    tags:['Markets','Indices','Basics']
  },
  {
    id:'fo', icon:'⚡', title:'F&O — Futures & Options Basics', level:'Intermediate',
    summary:'Derivatives contracts on stocks and indices — leverage, risk, and how to read them.',
    content:`**Futures:** Obligation to buy/sell an asset at a predetermined price on a future date.

**Options:** Right (not obligation) to buy (Call) or sell (Put) at a strike price before expiry.

**Key Terms:**
- **Premium** — Price paid for an options contract
- **Strike Price** — Price at which option can be exercised
- **Expiry** — NSE: Weekly (Thursday) and Monthly
- **Lot Size** — Minimum trading unit (e.g., Nifty = 75 units/lot)
- **PCR (Put-Call Ratio)** — >1 = bearish, <0.7 = bullish sentiment
- **MaxPain** — Strike price at which most option buyers lose money at expiry
- **OI (Open Interest)** — Total outstanding contracts; rising OI with price rise = bullish

**SEBI Warning:** >90% of F&O traders lose money. Average retail loss: ₹1.1 lakh/year (SEBI study 2024). Only trade with money you can afford to lose completely.

**Practical Use for Retail:** Covered calls to earn premium on holdings, protective puts to hedge downside.`,
    tags:['F&O','Advanced','Risk']
  },
  {
    id:'mf', icon:'💼', title:'Mutual Funds & SIP Strategy', level:'Beginner',
    summary:'How mutual funds work, how to pick one, and why SIP beats lump sum for most people.',
    content:`**Types of Mutual Funds (SEBI categories):**
- Large Cap: Top 100 companies by market cap
- Mid Cap: 101-250
- Small Cap: 251+
- Flexi Cap / Multi Cap: No restriction
- ELSS: Tax-saving (80C), 3-yr lock-in
- Index Funds: Passive, track Nifty 50 / Sensex
- Debt Funds: Bonds, safer, lower returns

**SIP (Systematic Investment Plan):**
Invest a fixed amount monthly regardless of market level. Benefits from rupee-cost averaging — you buy more units when markets fall, fewer when they rise.

**Key Metrics:**
- **NAV** — Net Asset Value (fund's per-unit price)
- **Expense Ratio** — Annual fee as % of AUM. Lower = better.
- **XIRR** — Your actual returns accounting for SIP timing
- **Alpha** — Returns above benchmark

**Simple Rule:** For most retail investors, a low-cost Nifty 50 index fund (expense ratio <0.1%) via monthly SIP beats ~80% of actively managed funds over 10+ years.`,
    tags:['MF','SIP','Basics']
  },
  {
    id:'tax', icon:'🧾', title:'Capital Gains Tax in India', level:'Intermediate',
    summary:'STCG, LTCG, indexation, debt fund taxation — complete picture after Budget 2024.',
    content:`**Equity & Equity MF (Budget 2024 changes):**
- STCG (held <12 months): 20% (was 15%)
- LTCG (held >12 months): 12.5% on gains above ₹1.25 lakh (was 10%, ₹1L limit)
- No indexation benefit

**Debt Mutual Funds (post Apr 2023):**
- Gains taxed as per income tax slab (both short & long term)
- Indexation removed entirely

**Real Estate:**
- STCG (<24 months): Slab rate
- LTCG (>24 months): 12.5% without indexation (Budget 2024 removed indexation option)

**Gold:**
- Physical/Gold ETF LTCG (>24 months): 12.5%
- Sovereign Gold Bonds: Exempt from LTCG if held to maturity

**Key Strategy:** Harvest LTCG up to ₹1.25 lakh annually tax-free by booking and re-buying. Use ELSS to save up to ₹46,800 in tax via 80C.`,
    tags:['Tax','Budgets','Planning']
  },
  {
    id:'forex', icon:'💱', title:'INR & Forex Basics', level:'Intermediate',
    summary:'What moves the rupee, how to interpret USD/INR movements, and sectoral impacts.',
    content:`**What determines USD/INR:**
- Trade Balance (India runs a deficit — imports > exports → rupee pressure)
- FII Flows (FIIs buying = rupee strengthens; selling = rupee weakens)
- Crude Oil Price (India imports ~85% crude; higher crude = more dollars demanded)
- US Dollar Index (DXY): Stronger dollar globally = INR weaker
- RBI Intervention: RBI can sell dollars to stabilise INR

**Current (Mar 2026): ~₹87/$**

**Sectoral Impact:**

Weak INR (>₹85/$) —
✅ IT (Infosys, TCS, Wipro) — USD revenues, INR costs = margin boost
✅ Pharma exporters — same logic
✅ ONGC, Oil India — crude in USD, revenue partially USD
❌ Oil Marketing (HPCL, BPCL, IOC) — import costs rise
❌ Airlines — ATF, leases in USD
❌ FMCG (some) — imported inputs costlier

Strong INR (<₹82/$) — reverse of above.

**RBI's Role:** RBI actively intervenes to prevent excessive volatility. It uses forex reserves ($620B) to buy/sell dollars.`,
    tags:['Forex','Macro','Sectors']
  },
  {
    id:'gloss', icon:'📖', title:'Financial Glossary', level:'Reference',
    summary:'Key terms from EBITDA to circuit breakers — a quick reference dictionary.',
    content:`**Market Terms:**
- **Circuit Breaker:** NSE halts trading when Nifty moves ±10% (30-min halt), ±15% (45-min), ±20% (rest of day)
- **Upper/Lower Circuit:** Individual stock freeze at ±5%, ±10%, ±20%
- **T+1 Settlement:** Shares credited next working day after buy
- **Bulk Deal:** >0.5% of company shares traded in single day
- **Block Deal:** >₹5 Cr, ≥5 lakh shares traded in 35-min window

**Company Financials:**
- **EBITDA:** Earnings Before Interest, Tax, Depreciation, Amortisation
- **PAT:** Profit After Tax (net profit)
- **EPS:** Earnings Per Share (PAT / no. of shares)
- **P/E Ratio:** Price / EPS — how expensive a stock is vs earnings
- **ROE:** Return on Equity (PAT / Shareholders' equity)
- **Debt-to-Equity:** Total debt / equity — <1 generally healthy

**Bond/Rate Terms:**
- **Yield:** Annual return on a bond
- **Yield Curve Inversion:** Short-term yields > long-term = recession signal
- **Spread:** Difference between two yields (e.g., corporate vs g-sec)

**Derivatives:**
- **Theta:** Options lose value as expiry approaches (time decay)
- **Delta:** How much option price moves per ₹1 move in underlying
- **IV (Implied Volatility):** Market's expectation of future price swings`,
    tags:['Reference','Glossary','All Levels']
  },
];

function TopicCard({ topic, onSelect, active }) {
  const levelColor = { 'Beginner':'var(--green)', 'Intermediate':'var(--yellow)', 'Advanced':'var(--red)', 'Reference':'var(--blue)' };
  return (
    <div
      onClick={() => onSelect(active ? null : topic.id)}
      style={{
        background:'var(--surface)', border:`1px solid ${active?'var(--blue)':'var(--border)'}`,
        padding:16, cursor:'pointer', transition:'all 0.15s',
        borderLeft: active ? '3px solid var(--blue)' : '1px solid var(--border)',
      }}
      onMouseEnter={e=>{if(!active)e.currentTarget.style.borderColor='var(--border2)'}}
      onMouseLeave={e=>{if(!active)e.currentTarget.style.borderColor='var(--border)'}}
    >
      <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
        <span style={{fontSize:'1.3rem',flexShrink:0}}>{topic.icon}</span>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap'}}>
            <span style={{fontSize:'0.84rem',fontWeight:600,color:'var(--bright)',fontFamily:'var(--font-sans)'}}>{topic.title}</span>
            <span style={{fontSize:'0.56rem',letterSpacing:'0.1em',textTransform:'uppercase',color:levelColor[topic.level]||'var(--muted)',marginLeft:'auto'}}>{topic.level}</span>
          </div>
          <div style={{fontSize:'0.72rem',color:'var(--muted)',lineHeight:1.5}}>{topic.summary}</div>
          <div style={{display:'flex',gap:5,marginTop:7,flexWrap:'wrap'}}>
            {topic.tags.map(t=>(
              <span key={t} style={{fontSize:'0.56rem',letterSpacing:'0.08em',textTransform:'uppercase',padding:'1px 5px',background:'var(--raised)',color:'var(--dim)',borderRadius:2}}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {active && (
        <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)'}}>
          {topic.content.split('\n\n').map((para,i) => {
            // Bold formatting: **text**
            const html = para.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--bright)">$1</strong>');
            return (
              <div key={i} style={{fontSize:'0.78rem',color:'var(--body)',lineHeight:1.7,marginBottom:12}}
                dangerouslySetInnerHTML={{__html:html}}/>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function KnowledgePage() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('All');
  const levels = ['All','Beginner','Intermediate','Advanced','Reference'];
  const filtered = filter==='All' ? TOPICS : TOPICS.filter(t=>t.level===filter);

  return (
    <Layout title="Knowledge" desc="Financial education for Indian retail investors">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl"><span className="slbl-dot" style={{background:'var(--purple)'}}/>Financial Learning Hub
            <span className="slbl-count">{TOPICS.length} topics</span>
          </div>

          {/* Level filter */}
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
            {levels.map(l => (
              <button key={l} onClick={()=>setFilter(l)}
                className={`fchip ${filter===l?'on':''}`} style={{fontSize:'0.62rem'}}>
                {l}
              </button>
            ))}
          </div>

          <div style={{display:'grid',gap:10}}>
            {filtered.map(t => (
              <TopicCard key={t.id} topic={t} onSelect={setSelected} active={selected===t.id}/>
            ))}
          </div>
        </div>

        <div className="shell-aside">
          <div className="widget">
            <div className="w-head">📊 Topic Categories</div>
            <div className="w-body">
              {[['Beginner','var(--green)',TOPICS.filter(t=>t.level==='Beginner').length],
                ['Intermediate','var(--yellow)',TOPICS.filter(t=>t.level==='Intermediate').length],
                ['Advanced','var(--red)',TOPICS.filter(t=>t.level==='Advanced').length],
                ['Reference','var(--blue)',TOPICS.filter(t=>t.level==='Reference').length],
              ].map(([l,c,n]) => (
                <div key={l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:'0.68rem',color:c}}>{l}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--bright)'}}>{n}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{padding:14,background:'var(--raised)',border:'1px solid var(--border)',fontSize:'0.7rem',color:'var(--muted)',lineHeight:1.8}}>
            <div style={{color:'var(--blue)',fontWeight:600,marginBottom:6,fontSize:'0.62rem',letterSpacing:'0.1em',textTransform:'uppercase'}}>⚡ Quick Nav</div>
            {TOPICS.map(t => (
              <div key={t.id} onClick={()=>setSelected(t.id===selected?null:t.id)}
                style={{cursor:'pointer',padding:'2px 0',color:selected===t.id?'var(--bright)':'var(--muted)',transition:'color 0.1s'}}
                onMouseEnter={e=>e.currentTarget.style.color='var(--body)'}
                onMouseLeave={e=>e.currentTarget.style.color=selected===t.id?'var(--bright)':'var(--muted)'}>
                {t.icon} {t.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
