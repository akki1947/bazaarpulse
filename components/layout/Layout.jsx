import Head from 'next/head';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Topbar from './Topbar';
import TickerStrip from './TickerStrip';
import NavBar from './NavBar';

const fetcher = url => fetch(url).then(r => r.json());

export default function Layout({ children, title='BazaarPulse', desc='India-centric financial intelligence dashboard' }) {
  const [isDark,   setIsDark]   = useState(true);
  const [lang,     setLang]     = useState('en');
  const [mounted,  setMounted]  = useState(false);

  // Prefetch articles for search
  const { data } = useSWR('/api/feed', fetcher, { revalidateOnFocus:false, refreshInterval:0 });
  const articles = data?.articles || [];

  useEffect(() => {
    setMounted(true);
    try {
      const t = localStorage.getItem('bp-theme');
      const l = localStorage.getItem('bp-lang');
      const dark = t !== 'light';
      setIsDark(dark);
      document.documentElement.classList.toggle('light', !dark);
      if (l) setLang(l);
    } catch {}
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try { localStorage.setItem('bp-theme', next?'dark':'light'); } catch {}
    document.documentElement.classList.toggle('light', !next);
  };

  const toggleLang = () => {
    const next = lang==='en'?'hi':'en';
    setLang(next);
    try { localStorage.setItem('bp-lang', next); } catch {}
  };

  if (!mounted) return (
    <div style={{background:'#080c10',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'0.75rem',color:'#6e7681',letterSpacing:'0.1em'}}>
        BAZAARPULSE▋
      </span>
    </div>
  );

  return (
    <>
      <Head>
        <title>{title} — BazaarPulse</title>
        <meta name="description" content={desc}/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <meta name="theme-color" content="#080c10"/>
        <meta name="robots" content="index,follow"/>
        <meta property="og:title" content={`${title} — BazaarPulse`}/>
        <meta property="og:description" content={desc}/>
        <meta property="og:type" content="website"/>
        <meta property="og:image" content="https://bazaarpulse.vercel.app/og-image.png"/>
        <meta name="twitter:card" content="summary_large_image"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      <Topbar isDark={isDark} onThemeToggle={toggleTheme} lang={lang} onLangToggle={toggleLang} articles={articles}/>
      <TickerStrip/>
      <NavBar lang={lang}/>
      <main style={{marginTop:'var(--shell-top)',minHeight:'calc(100vh - var(--shell-top))'}}>
        {children}
      </main>
      <footer className="site-footer">
        <div style={{maxWidth:1440,margin:'0 auto',display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:10}}>
          <span style={{color:'var(--body)',fontWeight:600}}>BazaarPulse v2.1</span>
          <span>Not SEBI registered · Not financial advice · Informational only · © 2026</span>
        </div>
      </footer>
    </>
  );
}
