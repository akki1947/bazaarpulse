import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import cats from '../../data/categories.json';

const catMap = Object.fromEntries(cats.categories.map(c => [c.id, c]));

export default function ArticleCard({ article, hero=false }) {
  const [open, setOpen] = useState(false);
  const { title, desc, link, pub, source, category, severity, impact } = article;
  const cat = catMap[category];
  const ago = pub ? formatDistanceToNow(new Date(pub), {addSuffix:true}) : '';

  if (hero) return (
    <div className={`hero-card ${severity}`}>
      <div className="hero-eye">
        {severity==='CRITICAL'?'⚡ Breaking':'★ Top Story'} · {cat?.icon} {cat?.label}
      </div>
      <a href={link} target="_blank" rel="noopener noreferrer" className="hero-title" style={{display:'block'}}>
        {title}
      </a>
      {desc && <div className="hero-desc">{desc.slice(0,240)}{desc.length>240?'…':''}</div>}
      <div className="hero-footer">
        <span style={{display:'flex',alignItems:'center',gap:6}}>
          <span className={`badge badge-${severity}`}>{severity}</span>
          <span style={{color:'var(--dim)'}}>{source} · {ago}</span>
        </span>
        <a href={link} target="_blank" rel="noopener noreferrer" className="hero-read">
          Full story →
        </a>
      </div>
      {impact && (
        <div className={`impact-box ${severity}`} style={{marginTop:12}}>
          <div className="impact-lbl">💡 Retail Investor Impact</div>
          {impact}
        </div>
      )}
    </div>
  );

  return (
    <div className="acard">
      <div className="acard-badges">
        <span className={`badge badge-${severity}`}>{severity}</span>
        {cat && <span className="cat-tag" style={{color:`var(--cat-${category},'var(--muted)')`}}>{cat.icon} {cat.label}</span>}
        <span style={{marginLeft:'auto'}} className="acard-meta">{source} · {ago}</span>
      </div>
      <a href={link} target="_blank" rel="noopener noreferrer" className="acard-title" style={{display:'block'}}>
        {title}
      </a>
      {desc && desc.length>20 && (
        <div className="acard-desc">{desc.slice(0,160)}{desc.length>160?'…':''}</div>
      )}
      {impact && (
        <>
          <button className="impact-toggle" onClick={() => setOpen(v=>!v)}>
            <span>{open?'▲':'▼'}</span> Retail Impact
          </button>
          {open && (
            <div className={`impact-box ${severity}`}>
              <div className="impact-lbl">💡 What this means for you</div>
              {impact}
            </div>
          )}
        </>
      )}
    </div>
  );
}
