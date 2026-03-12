import Head from 'next/head';
import { useState, useEffect } from 'react';
import Topbar from './Topbar';
import TickerStrip from './TickerStrip';
import NavBar from './NavBar';

export default function Layout({ children, title='BazaarPulse', desc='India-centric financial intelligence dashboard' }) {
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const t = localStorage.getItem('bp-theme');
      const l = localStorage.getItem('bp-lang');
      const dark = t !== 'light'; // default dark
      setIsDark(dark);
      if (dark) {
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
      }
      if (l) setLang(l);
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try { localStorage.setItem('bp-theme', next ? 'dark' : 'light'); } catch {}
    if (next) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  };

  const toggleLang = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
    try { localStorage.setItem('bp-lang', next); } catch {}
  };

  if (!mounted) return (
    <div style={{background:'#080c10',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.72rem',color:'#6e7681',letterSpacing:'0.1em'}}>
        BAZAARPULSE▋
      </span>
    </div>
  );

  return (
    <>
      <Head>
        <title>{title} — BazaarPulse</title>
        <meta name="description" content={desc} />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#080c10" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Topbar isDark={isDark} onThemeToggle={toggleTheme} lang={lang} onLangToggle={toggleLang} />
      <TickerStrip />
      <NavBar lang={lang} />
      <main style={{marginTop:'var(--shell-top)',minHeight:'calc(100vh - var(--shell-top))'}}>
        {children}
      </main>
      <footer className="site-footer">
        <div style={{maxWidth:1440,margin:'0 auto',display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:12}}>
          <span style={{color:'var(--body)',fontWeight:600}}>BazaarPulse v2.0</span>
          <span>Not SEBI registered · Not financial advice · Informational only · © 2026</span>
        </div>
      </footer>
    </>
  );
}
