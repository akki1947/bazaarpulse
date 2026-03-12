import { formatDistanceToNow } from 'date-fns';
import categoriesConfig from '../../data/categories.json';

export default function HeroCard({ article }) {
  if (!article) return null;
  const { title, desc, link, pub, source, category, severity, impact } = article;
  const cat = categoriesConfig.categories.find(c => c.id === category);
  const timeAgo = pub ? formatDistanceToNow(new Date(pub), { addSuffix: true }) : '';

  return (
    <div className="hero-card mb-6 animate-fade-in">
      {/* Category + Severity */}
      <div className="flex items-center gap-3 mb-3">
        {cat && (
          <span
            className="font-mono"
            style={{ fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-40)' }}
          >
            {cat.icon} {cat.label}
          </span>
        )}
        {severity === 'CRITICAL' && (
          <span className="badge-critical animate-pulse-dot">⚡ Breaking</span>
        )}
        {severity === 'MAJOR' && <span className="badge-major">Major</span>}
      </div>

      {/* Title */}
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="font-display block"
        style={{
          fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em',
          color: 'var(--ink)', textDecoration: 'none', marginBottom: 10,
        }}
        onMouseOver={e => e.currentTarget.style.textDecoration = 'underline'}
        onMouseOut={e => e.currentTarget.style.textDecoration = 'none'}
      >
        {title}
      </a>

      {/* Description */}
      {desc && desc.length > 30 && (
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-60)', lineHeight: 1.6, marginBottom: 12 }}>
          {desc.slice(0, 260)}{desc.length > 260 ? '…' : ''}
        </p>
      )}

      {/* Meta + Impact */}
      <div
        className="flex items-center justify-between flex-wrap gap-2 pt-3 font-mono"
        style={{ borderTop: '1px solid var(--rule)', fontSize: '0.65rem', color: 'var(--ink-40)', letterSpacing: '0.04em' }}
      >
        <span>{source} · {timeAgo}</span>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono"
          style={{
            fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--ink)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          Read full story →
        </a>
      </div>

      {/* Impact box always shown on hero */}
      {impact && (
        <div className="impact-box mt-3">
          <div
            className="font-mono"
            style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 5 }}
          >
            💡 Retail Investor Impact
          </div>
          <div style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>{impact}</div>
        </div>
      )}
    </div>
  );
}
