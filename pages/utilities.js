import { useState } from 'react';
import Layout from '../components/layout/Layout';

function SIPCalc() {
  const [monthly,setMonthly] = useState(5000);
  const [rate,setRate] = useState(12);
  const [years,setYears] = useState(10);
  const months = years*12;
  const r = rate/100/12;
  const fv = monthly * ((Math.pow(1+r,months)-1)/r) * (1+r);
  const invested = monthly*months;
  const gains = fv - invested;

  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');

  return (
    <div className="widget">
      <div className="w-head">📈 SIP Calculator</div>
      <div className="w-body">
        {[
          ['Monthly SIP', monthly, setMonthly, 500, 100000, 500, '₹'],
          ['Expected Return (%)', rate, setRate, 1, 30, 0.5, '%'],
          ['Duration (Years)', years, setYears, 1, 40, 1, 'yr'],
        ].map(([label, val, setter, min, max, step, unit]) => (
          <div key={label} style={{marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:'0.68rem',color:'var(--muted)'}}>{label}</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--bright)',fontSize:'0.78rem'}}>{unit}{val}{unit==='yr'?'':''}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e=>setter(Number(e.target.value))}
              style={{width:'100%',accentColor:'var(--blue)'}}/>
          </div>
        ))}
        <div style={{background:'var(--raised)',padding:14,marginTop:8}}>
          {[
            ['Total Invested', fmt(invested), 'var(--muted)'],
            ['Estimated Gains', fmt(gains), 'var(--green)'],
            ['Maturity Value', fmt(fv), 'var(--blue)'],
            ['Wealth Multiplier', (fv/invested).toFixed(2)+'x', 'var(--yellow)'],
          ].map(([l,v,c]) => (
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'0.68rem',color:'var(--muted)'}}>{l}</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:c,fontSize:'0.82rem'}}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:'0.6rem',color:'var(--dim)',marginTop:8,lineHeight:1.7}}>
          Returns are not guaranteed. Past performance is not indicative of future results. Consult a SEBI-registered financial advisor.
        </p>
      </div>
    </div>
  );
}

function LumpsumCalc() {
  const [amount,setAmount] = useState(100000);
  const [rate,setRate] = useState(12);
  const [years,setYears] = useState(10);
  const fv = amount * Math.pow(1+rate/100, years);
  const gains = fv - amount;
  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
  return (
    <div className="widget">
      <div className="w-head">💰 Lump Sum Calculator</div>
      <div className="w-body">
        {[
          ['Investment Amount',amount,setAmount,10000,10000000,10000,'₹'],
          ['Expected Return (%)',rate,setRate,1,30,0.5,'%'],
          ['Duration (Years)',years,setYears,1,40,1,'yr'],
        ].map(([label,val,setter,min,max,step,unit]) => (
          <div key={label} style={{marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:'0.68rem',color:'var(--muted)'}}>{label}</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--bright)',fontSize:'0.78rem'}}>{unit==='₹'?unit:''}{val}{unit!=='₹'?unit:''}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e=>setter(Number(e.target.value))}
              style={{width:'100%',accentColor:'var(--blue)'}}/>
          </div>
        ))}
        <div style={{background:'var(--raised)',padding:14}}>
          {[
            ['Principal',fmt(amount),'var(--muted)'],
            ['Gains',fmt(gains),'var(--green)'],
            ['Final Value',fmt(fv),'var(--blue)'],
            ['CAGR',rate+'%','var(--yellow)'],
          ].map(([l,v,c])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'0.68rem',color:'var(--muted)'}}>{l}</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:c,fontSize:'0.82rem'}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FDCalc() {
  const [principal,setPrincipal] = useState(100000);
  const [rate,setRate] = useState(7.5);
  const [years,setYears] = useState(3);
  const [compound,setCompound] = useState(4); // quarterly
  const fv = principal * Math.pow(1 + rate/100/compound, compound*years);
  const interest = fv - principal;
  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const FD_RATES = [
    ['SBI','7.10%','< ₹3Cr, 1-3yr'],['HDFC Bank','7.40%','2yr-3yr'],
    ['ICICI Bank','7.25%','15-18 months'],['Kotak Mahindra','7.40%','390 days'],
    ['Post Office TD','7.50%','5-yr'],['Senior Citizen +','0.50%','Extra on all FDs'],
  ];
  return (
    <div className="widget">
      <div className="w-head">🏦 FD Calculator</div>
      <div className="w-body">
        {[
          ['Principal',principal,setPrincipal,10000,5000000,10000,'₹'],
          ['Interest Rate (%)',rate,setRate,4,9.5,0.1,'%'],
          ['Duration (Years)',years,setYears,0.25,10,0.25,'yr'],
        ].map(([label,val,setter,min,max,step,unit]) => (
          <div key={label} style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:'0.68rem',color:'var(--muted)'}}>{label}</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--bright)',fontSize:'0.78rem'}}>{unit==='₹'?unit:''}{val}{unit!=='₹'?unit:''}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e=>setter(Number(e.target.value))}
              style={{width:'100%',accentColor:'var(--blue)'}}/>
          </div>
        ))}
        <div style={{background:'var(--raised)',padding:14,marginBottom:14}}>
          {[
            ['Principal',fmt(principal),'var(--muted)'],
            ['Total Interest',fmt(interest),'var(--green)'],
            ['Maturity Amount',fmt(fv),'var(--blue)'],
          ].map(([l,v,c])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'0.68rem',color:'var(--muted)'}}>{l}</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:c,fontSize:'0.82rem'}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{fontSize:'0.62rem',color:'var(--dim)',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8}}>Current Bank FD Rates</div>
        {FD_RATES.map(([bank,rate,note]) => (
          <div key={bank} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 0',borderBottom:'1px solid var(--border)'}}>
            <div>
              <div style={{fontSize:'0.7rem',color:'var(--body)'}}>{bank}</div>
              <div style={{fontSize:'0.6rem',color:'var(--dim)'}}>{note}</div>
            </div>
            <span style={{fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--green)',fontSize:'0.72rem'}}>{rate}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BrokerageCalc() {
  const [qty,setQty] = useState(100);
  const [buyPrice,setBuyPrice] = useState(500);
  const [sellPrice,setSellPrice] = useState(520);
  const [broker,setBroker] = useState('zerodha');
  const turnover = (qty*buyPrice) + (qty*sellPrice);
  const gross = qty*(sellPrice-buyPrice);
  const BROKERS = {
    zerodha: { brokerage: Math.min(qty*sellPrice*0.0003+qty*buyPrice*0.0003, 40), label:'Zerodha Kite' },
    groww:   { brokerage: Math.min(qty*sellPrice*0.0005+qty*buyPrice*0.0005, 40), label:'Groww' },
    upstox:  { brokerage: Math.min(qty*sellPrice*0.0003+qty*buyPrice*0.0003, 40), label:'Upstox' },
  };
  const br = BROKERS[broker];
  const stt = qty*sellPrice*0.001;
  const exchTxn = turnover*0.0000345;
  const sebi = turnover*0.000001;
  const stampDuty = qty*buyPrice*0.00015;
  const gst = (br.brokerage+exchTxn+sebi)*0.18;
  const totalCharges = br.brokerage + stt + exchTxn + sebi + stampDuty + gst;
  const netPL = gross - totalCharges;
  const fmt = n => '₹' + Math.abs(n).toFixed(2);
  return (
    <div className="widget">
      <div className="w-head">💹 Brokerage Calculator</div>
      <div className="w-body">
        <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
          {Object.entries(BROKERS).map(([key,{label}]) => (
            <button key={key} onClick={()=>setBroker(key)}
              className={`fchip ${broker===key?'on':''}`}>{label}</button>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:14}}>
          {[
            ['Qty',qty,setQty,1,10000,1],
            ['Buy ₹',buyPrice,setBuyPrice,1,100000,0.5],
            ['Sell ₹',sellPrice,setSellPrice,1,100000,0.5],
          ].map(([label,val,setter,min,max,step]) => (
            <div key={label}>
              <div style={{fontSize:'0.62rem',color:'var(--muted)',marginBottom:4}}>{label}</div>
              <input type="number" value={val} min={min} max={max} step={step}
                onChange={e=>setter(Number(e.target.value))}
                style={{width:'100%',background:'var(--raised)',border:'1px solid var(--border)',color:'var(--bright)',fontFamily:'var(--font-mono)',fontSize:'0.78rem',padding:'5px 8px',borderRadius:3,outline:'none'}}/>
            </div>
          ))}
        </div>
        <div style={{background:'var(--raised)',padding:12}}>
          {[
            ['Gross P&L',fmt(gross),gross>=0?'var(--green)':'var(--red)'],
            ['Brokerage',fmt(br.brokerage),'var(--muted)'],
            ['STT',fmt(stt),'var(--muted)'],
            ['Exch + SEBI',fmt(exchTxn+sebi),'var(--muted)'],
            ['GST + Stamp',fmt(gst+stampDuty),'var(--muted)'],
            ['Total Charges',fmt(totalCharges),'var(--red)'],
            ['Net P&L',fmt(netPL),netPL>=0?'var(--green)':'var(--red)'],
          ].map(([l,v,c]) => (
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid var(--border)',fontWeight:l==='Net P&L'?700:400}}>
              <span style={{fontSize:'0.68rem',color:l==='Net P&L'?'var(--body)':'var(--muted)'}}>{l}</span>
              <span style={{fontFamily:'var(--font-mono)',color:c,fontSize:'0.72rem'}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EMICalc() {
  const [loan,setLoan] = useState(3000000);
  const [rate,setRate] = useState(8.5);
  const [years,setYears] = useState(20);
  const months = years*12;
  const r = rate/100/12;
  const emi = loan*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1);
  const total = emi*months;
  const interest = total-loan;
  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
  return (
    <div className="widget">
      <div className="w-head">🏠 EMI / Loan Calculator</div>
      <div className="w-body">
        {[
          ['Loan Amount',loan,setLoan,100000,10000000,100000,'₹'],
          ['Interest Rate (%)',rate,setRate,5,20,0.1,'%'],
          ['Loan Tenure (Yrs)',years,setYears,1,30,1,'yr'],
        ].map(([label,val,setter,min,max,step,unit]) => (
          <div key={label} style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
              <span style={{fontSize:'0.68rem',color:'var(--muted)'}}>{label}</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:600,color:'var(--bright)',fontSize:'0.78rem'}}>{unit==='₹'?unit:''}{val}{unit!=='₹'?unit:''}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={val}
              onChange={e=>setter(Number(e.target.value))}
              style={{width:'100%',accentColor:'var(--blue)'}}/>
          </div>
        ))}
        <div style={{background:'var(--raised)',padding:14}}>
          {[
            ['Monthly EMI',fmt(emi),'var(--blue)'],
            ['Total Interest',fmt(interest),'var(--red)'],
            ['Total Payment',fmt(total),'var(--body)'],
            ['Interest %',((interest/loan)*100).toFixed(1)+'%','var(--yellow)'],
          ].map(([l,v,c]) => (
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:'0.68rem',color:'var(--muted)'}}>{l}</span>
              <span style={{fontFamily:'var(--font-mono)',fontWeight:700,color:c,fontSize:'0.82rem'}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const TOOLS = [
  { id:'sip', label:'SIP Calc', component:<SIPCalc/> },
  { id:'lump', label:'Lump Sum', component:<LumpsumCalc/> },
  { id:'fd', label:'FD Calculator', component:<FDCalc/> },
  { id:'brokerage', label:'Brokerage', component:<BrokerageCalc/> },
  { id:'emi', label:'EMI / Loan', component:<EMICalc/> },
];

export default function UtilitiesPage() {
  const [active, setActive] = useState('sip');
  const tool = TOOLS.find(t=>t.id===active);
  return (
    <Layout title="Utilities" desc="SIP, FD, brokerage and EMI calculators for retail investors">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl"><span className="slbl-dot" style={{background:'var(--cyan)'}}/>Financial Calculators</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:20}}>
            {TOOLS.map(t => (
              <button key={t.id} onClick={()=>setActive(t.id)} className={`fchip ${active===t.id?'on':''}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="animate-fade-up" key={active}>
            {tool?.component}
          </div>
        </div>
        <div className="shell-aside">
          <div className="widget">
            <div className="w-head">⚡ Quick Rules of Thumb</div>
            <div className="w-body">
              {[
                ['Rule of 72','Divide 72 by rate to get years to double money. At 12% → 6 years.'],
                ['50-30-20','50% needs, 30% wants, 20% savings/investments.'],
                ['100 - Age','Stock allocation % for your age. 30yr old = 70% equity.'],
                ['Emergency Fund','6 months of expenses in liquid FD or liquid fund.'],
                ['Insurance','Life cover = 10x annual income. Term plan only.'],
                ['SIP Wisdom','Time in market beats timing the market. Never stop SIPs in crashes.'],
              ].map(([rule,desc]) => (
                <div key={rule} style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{fontSize:'0.7rem',fontWeight:600,color:'var(--bright)',marginBottom:3}}>{rule}</div>
                  <div style={{fontSize:'0.65rem',color:'var(--muted)',lineHeight:1.6}}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
