import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Topbar({ isDark, onThemeToggle, lang, onLangToggle }) {
  const [time, setTime] = useState('--:--:--');
  const [status, setStatus] = useState({ open: false, label: 'Closed' });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const ist = new Intl.DateTimeFormat('en-IN', {
        timeZone:'Asia/Kolkata', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false
      }).format(now);
      setTime(ist);
      const d = new Date(now.toLocaleString('en-US',{timeZone:'Asia/Kolkata'}));
      const mins = d.getHours()*60+d.getMinutes();
      const wd = d.getDay();
      const open = wd>=1&&wd<=5&&mins>=555&&mins<930;
      const pre  = wd>=1&&wd<=5&&mins>=540&&mins<555;
      setStatus({ open, label: open?'NSE Open':pre?'Pre-Open':'NSE Closed' });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="topbar">
      <Link href="/" className="topbar-logo" style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        <div style={{width:28,height:28,background:'var(--blue)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:3}}>
          <span style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'0.9rem',color:'var(--bg)',lineHeight:1}}>B</span>
        </div>
        <div>
          <div className="logo-name">Bazaar<span>Pulse</span></div>
          <div className="logo-sub">India · Finance · Intelligence</div>
        </div>
      </Link>

      <div className="tb-search" style={{flex:1,maxWidth:300}}>
        <input type="text" placeholder="Search news, stocks, sectors…  ⌘K" />
      </div>

      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:14,flexShrink:0}}>
        <span className="tb-clock" style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{color:'var(--dim)'}}>IST</span> {time}
        </span>
        <span className="mkt-status" style={{color:status.open?'var(--green)':'var(--muted)'}}>
          <span className={`status-dot ${status.open?'open':'closed'}`}/>
          {status.label}
        </span>
        <button className="tb-btn" onClick={onLangToggle}>{lang==='en'?'हिं':'EN'}</button>
        <button className="tb-btn" onClick={onThemeToggle}>{isDark?'Light':'Dark'}</button>
      </div>
    </header>
  );
}
