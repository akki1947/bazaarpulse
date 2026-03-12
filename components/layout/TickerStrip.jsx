import useSWR from 'swr';

const fetcher = url => fetch(url).then(r => r.json());

// Static placeholders shown before data loads
const STATIC = [
  'NIFTY 50','SENSEX','NIFTY Bank','NIFTY IT',
  'S&P 500','NASDAQ','USD/INR','Gold','Crude Brent','Bitcoin',
].map(name => ({ name, price: '—', chg: '—', up: true }));

function fmtPrice(q) {
  const p = q.price;
  if (!p) return '—';
  if (q.type === 'forex')                        return p.toFixed(4);
  if (q.type === 'crypto')                       return '$' + p.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (q.type === 'commodity')                    return '$' + p.toFixed(2);
  if (p >= 10000) return p.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  if (p >= 100)   return p.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  return p.toFixed(2);
}

function fmtChg(q) {
  if (q.changePct == null) return '—';
  const sign = q.changePct >= 0 ? '+' : '';
  return `${sign}${q.changePct.toFixed(2)}%`;
}

export default function TickerStrip() {
  // No live polling — data refreshed by cron, just read cache
  const { data } = useSWR('/api/market', fetcher, {
    refreshInterval: 0,          // no client polling
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const items = data?.quotes?.length
    ? data.quotes.map(q => ({ name: q.name, price: fmtPrice(q), chg: fmtChg(q), up: q.up }))
    : STATIC;

  const doubled = [...items, ...items];

  const session = data?.session;
  const fetched = data?.fetched
    ? new Date(data.fetched).toLocaleTimeString('en-IN', { timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit' })
    : null;

  return (
    <div className="ticker-bar">
      <div className="ticker-label">
        <span className="status-dot open" style={{ flexShrink: 0 }} />
        <span>{session || 'Live'}</span>
        {fetched && (
          <span style={{ fontSize: '0.52rem', color: 'var(--dim)', marginLeft: 4 }}>
            {fetched}
          </span>
        )}
      </div>
      <div className="ticker-scroll">
        <div className="ticker-track">
          {doubled.map((item, i) => (
            <div key={i} className="t-item">
              <span className="t-name">{item.name}</span>
              <span className="t-price">{item.price}</span>
              <span className={`t-chg ${item.up ? 'up' : 'dn'}`}>{item.chg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
