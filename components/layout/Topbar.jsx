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

  // Search handler
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); setShowRes(false); return; }
    const q = query.toLowerCase();
    const hits = articles
      .filter(a => a.title?.toLowerCase().includes(q) || a.source?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q))
      .slice(0, 6);
    setResults(hits);
    setShowRes(hits.length > 0);
  }, [query, articles]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setShowRes(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K
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
      <Link href="/" style={{display:'flex',alignItems:'center',gap:10,flexShrink:0,textDecoration:'none'}}>
        <div style={{width:28,height:28,background:'var(--blue)',display:'flex',alignItems:'center',
          justifyContent:'center',borderRadius:3,flexShrink:0}}>
          <span style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'var(--fs-md)',
            color:'var(--bg)',lineHeight:1}}>B</span>
        </div>
        <div style={{display:'flex',flexDirection:'column'}}>
          <div className="logo-name">Bazaar<span>Pulse</span></div>
          <div className="logo-sub">India · Finance · Intelligence</div>
        </div>
      </Link>

      {/* Search */}
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
                background:'none',border:'none',color:'var(--dim)',fontSize:'var(--fs-sm)',cursor:'pointer'}}>×</button>
          )}
        </div>

        {/* Dropdown results */}
        {showRes && (
          <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,
            background:'var(--surface)',border:'1px solid var(--border)',
            boxShadow:'0 8px 24px rgba(0,0,0,0.4)',zIndex:200,maxHeight:360,overflowY:'auto'}}>
            {results.map(a => (
              <a key={a.id} href={a.link} target="_blank" rel="noopener noreferrer"
                onClick={() => { setShowRes(false); setQuery(''); }}
                style={{display:'block',padding:'10px 12px',borderBottom:'1px solid var(--border)',
                  textDecoration:'none',transition:'background 0.1s'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--raised)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                  <span style={{fontSize:'var(--fs-label)',color:SEV_COL[a.severity]||'var(--dim)',
                    fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>{a.severity}</span>
                  <span style={{fontSize:'var(--fs-label)',color:'var(--muted)',background:'var(--raised)',
                    padding:'1px 5px',borderRadius:2}}>{a.category}</span>
                  <span style={{marginLeft:'auto',fontSize:'var(--fs-label)',color:'var(--muted)'}}>{a.source}</span>
                </div>
                <div style={{fontSize:'var(--fs-xs)',color:'var(--bright)',lineHeight:1.4,
                  fontFamily:'var(--font-sans)',fontWeight:500}}>{a.title}</div>
              </a>
            ))}
            <div style={{padding:'8px 12px',fontSize:'var(--fs-label)',color:'var(--muted)',
              textAlign:'center',borderTop:'1px solid var(--border)'}}>
              {results.length} results · Press Esc to close
            </div>
          </div>
        )}
      </div>

      {/* Right side */}
      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
        <span className="tb-clock" style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{color:'var(--muted)',fontSize:'var(--fs-label)'}}>IST</span>
          <span style={{fontFamily:'var(--font-mono)',color:'var(--body)'}}>{time}</span>
        </span>
        <span className="mkt-status" style={{color:status.open?'var(--green)':'var(--muted)'}}>
          <span className={`status-dot ${status.open?'open':'closed'}`}/>
          <span style={{display:'none'}} className="tb-mkt-label">{status.label}</span>
          <span>{status.label}</span>
        </span>
        <button className="tb-btn" onClick={onLangToggle} title="Toggle Hindi/English">
          {lang==='en'?'हिं':'EN'}
        </button>
        <button className="tb-btn" onClick={onThemeToggle} title="Toggle light/dark mode">
          {isDark?'☀ Light':'◐ Dark'}
        </button>
      </div>
    </header>
  );
}
