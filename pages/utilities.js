import { useState, useMemo } from 'react';
import Layout from '../components/layout/Layout';

/* ── shared helpers ── */
const fmt  = n => '₹' + Math.round(n).toLocaleString('en-IN');
const fmtD = n => '₹' + n.toFixed(2);

function Slider({ label, val, setter, min, max, step, prefix='', suffix='' }) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <span style={{fontSize:'var(--fs-xs)',color:'var(--muted)'}}>{label}</span>
        <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:'var(--bright)',fontSize:'var(--fs-base)'}}>
          {prefix}{typeof val === 'number' ? val.toLocaleString('en-IN') : val}{suffix}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e=>setter(Number(e.target.value))}
        style={{width:'100%',accentColor:'var(--blue)',height:4}}/>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:3}}>
        <span style={{fontSize:'var(--fs-label)',color:'var(--dim)'}}>{prefix}{min}{suffix}</span>
        <span style={{fontSize:'var(--fs-label)',color:'var(--dim)'}}>{prefix}{max.toLocaleString('en-IN')}{suffix}</span>
      </div>
    </div>
  );
}

function ResultRow({ label, val, col='var(--body)', bold=false, large=false }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',
      padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
      <span style={{fontSize:'var(--fs-xs)',color:bold?'var(--body)':'var(--muted)',fontWeight:bold?600:400}}>{label}</span>
      <span style={{fontFamily:'var(--font-mono)',fontWeight:bold?700:600,color:col,
        fontSize:large?'var(--fs-lg)':'var(--fs-sm)'}}>{val}</span>
    </div>
  );
}

/* ── SIP ── */
function SIPCalc() {
  const [monthly, setMonthly] = useState(5000);
  const [rate,    setRate]    = useState(12);
  const [years,   setYears]   = useState(10);
  const months   = years * 12;
  const r        = rate / 100 / 12;
  const fv       = monthly * ((Math.pow(1+r,months)-1)/r) * (1+r);
  const invested = monthly * months;
  const gains    = fv - invested;

  return (
    <div>
      <Slider label="Monthly SIP Amount"   val={monthly} setter={setMonthly} min={500}  max={100000} step={500}  prefix="₹"/>
      <Slider label="Expected Return (p.a)"val={rate}    setter={setRate}    min={1}    max={30}     step={0.5}  suffix="%"/>
      <Slider label="Investment Duration"  val={years}   setter={setYears}   min={1}    max={40}     step={1}    suffix=" yrs"/>
      <div style={{background:'var(--raised)',padding:14,borderRadius:2,marginTop:4}}>
        <ResultRow label="Total Invested"    val={fmt(invested)} col="var(--muted)"/>
        <ResultRow label="Estimated Gains"   val={fmt(gains)}    col="var(--green)"/>
        <ResultRow label="Maturity Value"    val={fmt(fv)}       col="var(--blue)"  bold large/>
        <ResultRow label="Wealth Multiplier" val={(fv/invested).toFixed(2)+'x'} col="var(--yellow)"/>
      </div>
      <p style={{fontSize:'var(--fs-label)',color:'var(--muted)',marginTop:10,lineHeight:1.7}}>
        Returns not guaranteed. Past performance ≠ future results. Consult SEBI-registered advisor.
      </p>
    </div>
  );
}

/* ── Lump Sum ── */
function LumpsumCalc() {
  const [amount, setAmount] = useState(100000);
  const [rate,   setRate]   = useState(12);
  const [years,  setYears]  = useState(10);
  const fv    = amount * Math.pow(1 + rate/100, years);
  const gains = fv - amount;
  return (
    <div>
      <Slider label="Investment Amount"   val={amount} setter={setAmount} min={10000}   max={10000000} step={10000} prefix="₹"/>
      <Slider label="Expected Return p.a" val={rate}   setter={setRate}   min={1}       max={30}       step={0.5}   suffix="%"/>
      <Slider label="Duration"            val={years}  setter={setYears}  min={1}       max={40}       step={1}     suffix=" yrs"/>
      <div style={{background:'var(--raised)',padding:14,borderRadius:2,marginTop:4}}>
        <ResultRow label="Principal"       val={fmt(amount)} col="var(--muted)"/>
        <ResultRow label="Estimated Gains" val={fmt(gains)}  col="var(--green)"/>
        <ResultRow label="Final Value"     val={fmt(fv)}     col="var(--blue)" bold large/>
        <ResultRow label="CAGR"            val={rate+'%'}    col="var(--yellow)"/>
      </div>
    </div>
  );
}

/* ── FD ── */
const FD_RATES = [
  ['SBI','7.10%','<₹3Cr, 1-3yr'], ['HDFC Bank','7.40%','2yr-3yr'],
  ['ICICI Bank','7.25%','15-18mo'],['Kotak','7.40%','390 days'],
  ['Post Office','7.50%','5-yr'],  ['Senior +50bps','0.50%','Extra on all'],
];
function FDCalc() {
  const [principal, setPrincipal] = useState(100000);
  const [rate,      setRate]      = useState(7.5);
  const [years,     setYears]     = useState(3);
  const fv       = principal * Math.pow(1 + rate/100/4, 4*years);
  const interest = fv - principal;
  return (
    <div>
      <Slider label="Principal Amount"  val={principal} setter={setPrincipal} min={10000} max={5000000} step={10000} prefix="₹"/>
      <Slider label="Interest Rate p.a" val={rate}      setter={setRate}      min={4}     max={9.5}     step={0.1}   suffix="%"/>
      <Slider label="Duration"          val={years}     setter={setYears}     min={0.25}  max={10}      step={0.25}  suffix=" yrs"/>
      <div style={{background:'var(--raised)',padding:14,borderRadius:2,marginTop:4,marginBottom:16}}>
        <ResultRow label="Principal"       val={fmt(principal)} col="var(--muted)"/>
        <ResultRow label="Total Interest"  val={fmt(interest)}  col="var(--green)"/>
        <ResultRow label="Maturity Amount" val={fmt(fv)}        col="var(--blue)" bold large/>
      </div>
      <div style={{fontSize:'var(--fs-label)',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',
        color:'var(--muted)',marginBottom:8}}>Current Bank FD Rates</div>
      {FD_RATES.map(([bank,r,note]) => (
        <div key={bank} style={{display:'flex',justifyContent:'space-between',alignItems:'center',
          padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
          <div>
            <div style={{fontSize:'var(--fs-sm)',color:'var(--body)',fontWeight:500}}>{bank}</div>
            <div style={{fontSize:'var(--fs-label)',color:'var(--muted)'}}>{note}</div>
          </div>
          <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:'var(--green)',fontSize:'var(--fs-sm)'}}>{r}</span>
        </div>
      ))}
    </div>
  );
}

/* ── EMI ── */
function EMICalc() {
  const [loan,  setLoan]  = useState(3000000);
  const [rate,  setRate]  = useState(8.5);
  const [years, setYears] = useState(20);
  const months = years * 12;
  const r   = rate / 100 / 12;
  const emi = loan * r * Math.pow(1+r,months) / (Math.pow(1+r,months)-1);
  const total = emi * months;
  const interest = total - loan;
  return (
    <div>
      <Slider label="Loan Amount"         val={loan}  setter={setLoan}  min={100000}  max={10000000} step={100000} prefix="₹"/>
      <Slider label="Interest Rate p.a"   val={rate}  setter={setRate}  min={5}       max={20}       step={0.1}   suffix="%"/>
      <Slider label="Loan Tenure"         val={years} setter={setYears} min={1}       max={30}       step={1}     suffix=" yrs"/>
      <div style={{background:'var(--raised)',padding:14,borderRadius:2,marginTop:4}}>
        <ResultRow label="Monthly EMI"   val={fmt(emi)}      col="var(--blue)"   bold large/>
        <ResultRow label="Total Interest"val={fmt(interest)} col="var(--red)"/>
        <ResultRow label="Total Payment" val={fmt(total)}    col="var(--body)"/>
        <ResultRow label="Interest %"    val={((interest/loan)*100).toFixed(1)+'%'} col="var(--yellow)"/>
      </div>
    </div>
  );
}

/* ── Brokerage ── */
function BrokerageCalc() {
  const [qty,       setQty]       = useState(100);
  const [buyPrice,  setBuyPrice]  = useState(500);
  const [sellPrice, setSellPrice] = useState(520);
  const [broker,    setBroker]    = useState('zerodha');
  const BROKERS = {
    zerodha:  { label:'Zerodha', rate:0.0003, cap:20 },
    groww:    { label:'Groww',   rate:0.0005, cap:20 },
    upstox:   { label:'Upstox',  rate:0.0003, cap:20 },
    angel:    { label:'Angel',   rate:0.0003, cap:20 },
    fyers:    { label:'Fyers',   rate:0.0003, cap:20 },
  };
  const br          = BROKERS[broker];
  const buyVal      = qty * buyPrice;
  const sellVal     = qty * sellPrice;
  const turnover    = buyVal + sellVal;
  const gross       = qty * (sellPrice - buyPrice);
  const brokerage   = Math.min(br.rate*buyVal, br.cap) + Math.min(br.rate*sellVal, br.cap);
  const stt         = sellVal * 0.001;
  const exchTxn     = turnover * 0.0000345;
  const sebiCharge  = turnover * 0.000001;
  const stampDuty   = buyVal * 0.00015;
  const gst         = (brokerage + exchTxn + sebiCharge) * 0.18;
  const totalCharges = brokerage + stt + exchTxn + sebiCharge + stampDuty + gst;
  const netPL       = gross - totalCharges;
  return (
    <div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
        {Object.entries(BROKERS).map(([key,{label}]) => (
          <button key={key} onClick={()=>setBroker(key)} className={`fchip ${broker===key?'on':''}`}>{label}</button>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:16}}>
        {[['Qty',qty,setQty,1,10000,1],['Buy ₹',buyPrice,setBuyPrice,1,100000,0.5],['Sell ₹',sellPrice,setSellPrice,1,100000,0.5]].map(([label,val,setter,min,max,step]) => (
          <div key={label}>
            <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)',marginBottom:5}}>{label}</div>
            <input type="number" value={val} min={min} max={max} step={step}
              onChange={e=>setter(Number(e.target.value))}
              style={{width:'100%',background:'var(--raised)',border:'1px solid var(--border)',
                color:'var(--bright)',fontFamily:'var(--font-mono)',fontSize:'var(--fs-sm)',
                padding:'6px 8px',borderRadius:3,outline:'none'}}/>
          </div>
        ))}
      </div>
      <div style={{background:'var(--raised)',padding:14,borderRadius:2}}>
        <ResultRow label="Gross P&L"     val={fmtD(gross)}        col={gross>=0?'var(--green)':'var(--red)'} bold/>
        <ResultRow label="Brokerage"     val={fmtD(brokerage)}    col="var(--muted)"/>
        <ResultRow label="STT"           val={fmtD(stt)}          col="var(--muted)"/>
        <ResultRow label="Exch+SEBI"     val={fmtD(exchTxn+sebiCharge)} col="var(--muted)"/>
        <ResultRow label="GST+Stamp"     val={fmtD(gst+stampDuty)} col="var(--muted)"/>
        <ResultRow label="Total Charges" val={fmtD(totalCharges)} col="var(--red)" bold/>
        <ResultRow label="Net P&L"       val={fmtD(netPL)}        col={netPL>=0?'var(--green)':'var(--red)'} bold large/>
      </div>
      <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)',marginTop:8}}>Delivery trade. Charges approx. Verify with broker.</div>
    </div>
  );
}

/* ── Goal Planner ── */
function GoalCalc() {
  const [goal,    setGoal]    = useState(5000000);
  const [years,   setYears]   = useState(10);
  const [rate,    setRate]    = useState(12);
  const [current, setCurrent] = useState(500000);
  const r        = rate / 100 / 12;
  const months   = years * 12;
  const fvCurrent = current * Math.pow(1+rate/100, years);
  const remaining = Math.max(0, goal - fvCurrent);
  const sip       = remaining > 0 ? remaining * r / (Math.pow(1+r,months)-1) / (1+r) : 0;
  return (
    <div>
      <Slider label="Financial Goal"         val={goal}    setter={setGoal}    min={100000} max={100000000} step={100000} prefix="₹"/>
      <Slider label="Time Horizon"           val={years}   setter={setYears}   min={1}      max={40}        step={1}      suffix=" yrs"/>
      <Slider label="Expected Return p.a"    val={rate}    setter={setRate}    min={6}      max={20}        step={0.5}    suffix="%"/>
      <Slider label="Current Savings/Corpus" val={current} setter={setCurrent} min={0}      max={5000000}   step={50000}  prefix="₹"/>
      <div style={{background:'var(--raised)',padding:14,borderRadius:2,marginTop:4}}>
        <ResultRow label="Target Goal"       val={fmt(goal)}      col="var(--blue)"/>
        <ResultRow label="Current corpus grows to" val={fmt(fvCurrent)} col="var(--muted)"/>
        <ResultRow label="Gap to fill"       val={fmt(remaining)} col={remaining>0?'var(--yellow)':'var(--green)'}/>
        <ResultRow label="Monthly SIP needed"val={remaining>0?fmt(sip):'₹0 — Already on track!'} col={remaining>0?'var(--orange)':'var(--green)'} bold large/>
      </div>
    </div>
  );
}

/* ── CAGR Calculator ── */
function CAGRCalc() {
  const [initial, setInitial] = useState(100000);
  const [final,   setFinal]   = useState(250000);
  const [years,   setYears]   = useState(5);
  const cagr      = (Math.pow(final/initial, 1/years) - 1) * 100;
  const absReturn = ((final-initial)/initial*100).toFixed(1);
  return (
    <div>
      <Slider label="Initial Investment" val={initial} setter={setInitial} min={10000} max={10000000} step={10000} prefix="₹"/>
      <Slider label="Final Value"        val={final}   setter={setFinal}   min={10000} max={50000000} step={10000} prefix="₹"/>
      <Slider label="Duration"           val={years}   setter={setYears}   min={1}     max={30}       step={0.5}   suffix=" yrs"/>
      <div style={{background:'var(--raised)',padding:14,borderRadius:2,marginTop:4}}>
        <ResultRow label="Initial Investment"  val={fmt(initial)}    col="var(--muted)"/>
        <ResultRow label="Final Value"         val={fmt(final)}      col="var(--muted)"/>
        <ResultRow label="Absolute Return"     val={absReturn+'%'}   col="var(--yellow)"/>
        <ResultRow label="CAGR"                val={cagr.toFixed(2)+'%'} col="var(--blue)" bold large/>
      </div>
      <div style={{padding:'10px 12px',background:'var(--raised)',borderLeft:'2px solid var(--blue)',
        marginTop:12,fontSize:'var(--fs-xs)',color:'var(--body)',lineHeight:1.7}}>
        💡 Rule of 72: Divide 72 by CAGR to find years to double. At {cagr.toFixed(1)}%, money doubles in ~{(72/cagr).toFixed(1)} years.
      </div>
    </div>
  );
}

const TOOLS = [
  { id:'sip',       icon:'📈', label:'SIP',          desc:'Monthly investment returns',     component:<SIPCalc/>       },
  { id:'lump',      icon:'💰', label:'Lump Sum',      desc:'One-time investment calculator', component:<LumpsumCalc/>  },
  { id:'fd',        icon:'🏦', label:'FD',            desc:'Fixed deposit with bank rates',  component:<FDCalc/>        },
  { id:'emi',       icon:'🏠', label:'EMI / Loan',    desc:'Home, car, personal loan',       component:<EMICalc/>       },
  { id:'brokerage', icon:'💹', label:'Brokerage',     desc:'Trade charges & net P&L',        component:<BrokerageCalc/>},
  { id:'goal',      icon:'🎯', label:'Goal Planner',  desc:'How much SIP to reach a goal',   component:<GoalCalc/>      },
  { id:'cagr',      icon:'📊', label:'CAGR',          desc:'Compound annual growth rate',    component:<CAGRCalc/>      },
];

const RULES = [
  { rule:'Rule of 72',   desc:'Divide 72 by return rate to get years to double. 12% → 6 years.' },
  { rule:'50-30-20',     desc:'50% needs, 30% wants, 20% savings/investments.' },
  { rule:'100 – Age',    desc:'Equity allocation % = 100 minus your age. 30yr → 70% equity.' },
  { rule:'6-Month Fund', desc:'Keep 6 months expenses in liquid fund/FD as emergency buffer.' },
  { rule:'10x Insurance',desc:'Life cover = 10× annual income. Term plan, not endowment.' },
  { rule:'3-5-7 Equity', desc:'Invest in equity only if you can stay for 3–5 years minimum.' },
  { rule:'1% SIP Step',  desc:'Increase SIP by 10-15% every year to beat inflation impact.' },
];

export default function UtilitiesPage() {
  const [active, setActive] = useState('sip');
  const tool = TOOLS.find(t => t.id === active);

  return (
    <Layout title="Financial Calculators" desc="SIP, FD, EMI, brokerage, goal planner and CAGR calculators for Indian investors">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl">
            <span className="slbl-dot" style={{background:'var(--cyan)'}}/>
            Financial Calculators
          </div>

          {/* Tool selector */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:8,marginBottom:24}}>
            {TOOLS.map(t => (
              <button key={t.id} onClick={() => setActive(t.id)}
                style={{padding:'10px 12px',background:active===t.id?'var(--blue)':'var(--surface)',
                  border:`1px solid ${active===t.id?'var(--blue)':'var(--border)'}`,
                  color:active===t.id?'var(--bg)':'var(--body)',
                  textAlign:'left',cursor:'pointer',transition:'all 0.12s',borderRadius:2}}>
                <div style={{fontSize:'1.1rem',marginBottom:4}}>{t.icon}</div>
                <div style={{fontSize:'var(--fs-sm)',fontWeight:600}}>{t.label}</div>
                <div style={{fontSize:'var(--fs-label)',color:active===t.id?'rgba(255,255,255,0.7)':'var(--muted)',marginTop:2}}>{t.desc}</div>
              </button>
            ))}
          </div>

          {/* Active calculator */}
          <div key={active} className="animate-fade-up" style={{background:'var(--surface)',
            border:'1px solid var(--border)',padding:20}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20,
              paddingBottom:12,borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'1.4rem'}}>{tool?.icon}</span>
              <div>
                <div style={{fontSize:'var(--fs-md)',fontWeight:700,color:'var(--bright)',fontFamily:'var(--font-display)'}}>{tool?.label} Calculator</div>
                <div style={{fontSize:'var(--fs-xs)',color:'var(--muted)'}}>{tool?.desc}</div>
              </div>
            </div>
            {tool?.component}
          </div>
        </div>

        {/* Aside */}
        <div className="shell-aside">
          <div className="widget">
            <div className="w-head">⚡ Rules of Thumb</div>
            <div className="w-body" style={{padding:0}}>
              {RULES.map(r => (
                <div key={r.rule} style={{padding:'10px 12px',borderBottom:'1px solid var(--border)'}}>
                  <div style={{fontSize:'var(--fs-sm)',fontWeight:700,color:'var(--bright)',marginBottom:4}}>{r.rule}</div>
                  <div style={{fontSize:'var(--fs-xs)',color:'var(--body)',lineHeight:1.65}}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{marginTop:12,padding:12,background:'var(--raised)',border:'1px solid var(--border)',
            fontSize:'var(--fs-xs)',color:'var(--muted)',lineHeight:1.9}}>
            <div style={{color:'var(--body)',fontWeight:600,marginBottom:6,letterSpacing:'0.08em',
              textTransform:'uppercase',fontSize:'var(--fs-label)'}}>Disclaimer</div>
            Calculations are illustrative. Returns not guaranteed. Tax implications vary. Consult a SEBI-registered financial advisor.
          </div>
        </div>
      </div>
    </Layout>
  );
}
