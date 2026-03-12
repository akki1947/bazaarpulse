import { useRouter } from 'next/router';
import Link from 'next/link';

const TABS = [
  { href:'/',            en:'News',          hi:'समाचार'     },
  { href:'/macro',       en:'Macro',         hi:'मैक्रो'      },
  { href:'/government',  en:'Govt & Policy', hi:'सरकार'      },
  { href:'/warzone',     en:'War Zone',      hi:'युद्ध क्षेत्र' },
  { href:'/knowledge',   en:'Knowledge',     hi:'ज्ञान'       },
  { href:'/utilities',   en:'Utilities',     hi:'उपकरण'      },
];

export default function NavBar({ lang='en' }) {
  const { pathname } = useRouter();
  const active = (href) => href==='/' ? pathname==='/' : pathname.startsWith(href);

  return (
    <nav className="navbar">
      {TABS.map(t => (
        <Link key={t.href} href={t.href} className={`nav-tab ${active(t.href)?'active':''}`}>
          {lang==='hi' ? t.hi : t.en}
        </Link>
      ))}
    </nav>
  );
}
