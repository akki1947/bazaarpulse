import useSWR from 'swr';

const fetcher = url => fetch(url).then(r => r.json());

const FALLBACK = [
  {name:'NIFTY 50', price:'22,124.15', chg:'-1.8%', up:false},
  {name:'SENSEX',   price:'73,198.10', chg:'-1.7%', up:false},
  {name:'NIFTY Bank',price:'48,242',   chg:'-2.1%', up:false},
  {name:'NIFTY IT', price:'36,844',    chg:'+0.4%', up:true },
  {name:'USD/INR',  price:'87.42',     chg:'+0.3%', up:false},
  {name:'EUR/INR',  price:'94.71',     chg:'-0.1%', up:false},
  {name:'CRUDE',    price:'$72.4',     chg:'-1.1%', up:false},
  {name:'GOLD MCX', price:'₹87,450',   chg:'+0.4%', up:true },
  {name:'BTC',      price:'$82,480',   chg:'-4.2%', up:false},
  {name:'S&P 500',  price:'5,614',     chg:'-0.8%', up:false},
  {name:'NASDAQ',   price:'17,522',    chg:'-1.1%', up:false},
  {name:'DOW',      price:'43,428',    chg:'-0.6%', up:false},
];

function fmt(q) {
  if (!q) return null;
  const p = q.price;
  const fmtP = p >= 1000 ? p.toLocaleString('en-IN',{maximumFractionDigits:0})
               : p >= 10  ? p.toFixed(2)
               : p.toFixed(4);
  const sign = q.change >= 0 ? '+' : '';
  return { name:q.name, price:fmtP, chg:`${sign}${q.changePct?.toFixed(2)}%`, up:q.change>=0 };
}

export default function TickerStrip() {
  const { data } = useSWR('/api/market?type=indices', fetcher, { refreshInterval:180000 });
  const raw = data?.data?.length ? data.data.slice(0,14).map(fmt).filter(Boolean) : FALLBACK;
  const items = [...raw, ...raw]; // duplicate for seamless loop

  return (
    <div className="ticker-bar">
      <div className="ticker-label">
        <span className="status-dot open" style={{flexShrink:0}}/>
        <span>Live</span>
      </div>
      <div className="ticker-scroll">
        <div className="ticker-track">
          {items.map((item, i) => (
            <div key={i} className="t-item">
              <span className="t-name">{item.name}</span>
              <span className="t-price">{item.price}</span>
              <span className={`t-chg ${item.up?'up':'dn'}`}>{item.chg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
