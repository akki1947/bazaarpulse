import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Topbar({ isDark, onThemeToggle, lang, onLangToggle, articles=[] }) {
  const [time,    setTime]    = useState('--:--:--');
  const [status,  setStatus]  = useState({ open:false, label:'Closed' });
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [showRes, setShowRes] = useState(false);
  const searchRef = useRef(null);
  const router    = useRouter();

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const ist = new Intl.DateTimeFormat('en-IN', {
        timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
      }).format(now);
      setTime(ist);
      const d    = new Date(now.toLocaleString('en-US',{timeZone:'Asia/Kolkata'}));
      const mins = d.getHours()*60+d.getMinutes();
      const wd   = d.getDay();
      const open = wd>=1&&wd<=5&&mins>=555&&mins<930;
      const pre  = wd>=1&&wd<=5&&mins>=540&&mins<555;
      setStatus({ open, label:open?'NSE Open':pre?'Pre-Open':'NSE Closed' });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); setShowRes(false); return; }
    const q = query.toLowerCase();
    const hits = articles
      .filter(a => a.title?.toLowerCase().includes(q) || a.source?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q))
      .slice(0, 6);
    setResults(hits);
    setShowRes(hits.length > 0);
  }, [query, articles]);

  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setShowRes(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey||e.ctrlKey) && e.key==='k') {
        e.preventDefault();
        searchRef.current?.querySelector('input')?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const SEV_COL = { CRITICAL:'var(--red)', MAJOR:'var(--yellow)', MINOR:'var(--dim)' };

  return (
    <header className="topbar">
      {/* ── Logo — bigger and bolder ── */}
      <Link href="/" style={{display:'flex',alignItems:'center',gap:12,flexShrink:0,textDecoration:'none'}}>
        <div style={{
          width:38, height:38,
          background:'var(--blue)',
          display:'flex', alignItems:'center', justifyContent:'center',
          borderRadius:4,
          boxShadow:'0 0 0 2px rgba(88,166,255,0.25)',
          flexShrink:0,
        }}>
          <span style={{
            fontFamily:'var(--font-display)',
            fontWeight:800,
            fontSize:'1.2rem',
            color:'#000',
            lineHeight:1,
            letterSpacing:'-0.02em',
          }}>B</span>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:1}}>
          <div style={{
            fontFamily:'var(--font-display)',
            fontWeight:700,
            fontSize:'1.1rem',
            letterSpacing:'-0.02em',
            color:'var(--bright)',
            lineHeight:1,
          }}>
            Bazaar<span style={{color:'var(--blue)'}}>Pulse</span>
          </div>
          <div style={{
            fontSize:'0.6rem',
            letterSpacing:'0.16em',
            textTransform:'uppercase',
            color:'var(--muted)',
            lineHeight:1,
          }}>India · Finance · Intelligence</div>
        </div>
      </Link>

      {/* ── Search ── */}
      <div ref={searchRef} className="tb-search" style={{flex:1,maxWidth:340,position:'relative'}}>
        <div style={{position:'relative'}}>
          <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',
            color:'var(--dim)',fontSize:'var(--fs-xs)',pointerEvents:'none'}}>🔍</span>
          <input
            type="text"
            placeholder="Search news, stocks, sectors…  ⌘K"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length && setShowRes(true)}
            style={{paddingLeft:30,width:'100%'}}
          />
          {query && (
            <button onClick={() => { setQuery(''); setShowRes(false); }}
              style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',
                background:'none',border:'none',color:'var(--dim)',fontSize:'var(--fs-base)',cursor:'pointer'}}>×</button>
          )}
        </div>
        {showRes && (
          <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,
            background:'var(--surface)',border:'1px solid var(--border)',
            boxShadow:'0 8px 24px rgba(0,0,0,0.4)',zIndex:200,maxHeight:360,overflowY:'auto'}}>
            {results.map(a => (
              <a key={a.id} href={a.link} target="_blank" rel="noopener noreferrer"
                onClick={() => { setShowRes(false); setQuery(''); }}
                style={{display:'block',padding:'10px 12px',borderBottom:'1px solid var(--border)',textDecoration:'none'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--raised)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                  <span style={{fontSize:'var(--fs-label)',color:SEV_COL[a.severity]||'var(--dim)',
                    fontWeight:600,textTransform:'uppercase'}}>{a.severity}</span>
                  <span style={{fontSize:'var(--fs-label)',color:'var(--muted)',background:'var(--raised)',
                    padding:'1px 5px',borderRadius:2}}>{a.category}</span>
                  <span style={{marginLeft:'auto',fontSize:'var(--fs-label)',color:'var(--muted)'}}>{a.source}</span>
                </div>
                <div style={{fontSize:'var(--fs-xs)',color:'var(--bright)',lineHeight:1.4,
                  fontFamily:'var(--font-sans)',fontWeight:500}}>{a.title}</div>
              </a>
            ))}
            <div style={{padding:'7px 12px',fontSize:'var(--fs-label)',color:'var(--muted)',textAlign:'center'}}>
              {results.length} results
            </div>
          </div>
        )}
      </div>

      {/* ── Right ── */}
      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <span className="tb-clock" style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{color:'var(--muted)',fontSize:'var(--fs-label)'}}>IST</span>
          <span style={{fontFamily:'var(--font-mono)',color:'var(--body)',fontSize:'var(--fs-xs)'}}>{time}</span>
        </span>
        <span className="mkt-status" style={{color:status.open?'var(--green)':'var(--muted)'}}>
          <span className={`status-dot ${status.open?'open':'closed'}`}/>
          <span style={{fontSize:'var(--fs-label)'}}>{status.label}</span>
        </span>
        <button className="tb-btn" onClick={onLangToggle}>{lang==='en'?'हिं':'EN'}</button>
        <button className="tb-btn" onClick={onThemeToggle}>{isDark?'☀ Light':'◐ Dark'}</button>
      </div>
    </header>
  );
}
