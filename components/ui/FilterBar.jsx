import cats from '../../data/categories.json';

const SEV = [{id:'ALL',label:'All'},{id:'CRITICAL',label:'Critical',cls:'crit'},{id:'MAJOR',label:'Major',cls:'maj'},{id:'MINOR',label:'Minor'}];

export default function FilterBar({ sev, cat, onSev, onCat, counts={} }) {
  return (
    <div className="filter-bar">
      {SEV.map(f => (
        <button key={f.id} onClick={()=>onSev(f.id)}
          className={`fchip ${f.cls||''} ${sev===f.id?'on':''}`}>
          {f.label}{counts[f.id]!=null?` ${counts[f.id]}`:''}
        </button>
      ))}
      <div className="fdiv"/>
      <button onClick={()=>onCat('ALL')} className={`fchip ${cat==='ALL'?'on':''}`}>All Sectors</button>
      {cats.categories.map(c => (
        <button key={c.id} onClick={()=>onCat(c.id)}
          className={`fchip ${cat===c.id?'on':''}`}>
          {c.icon} {c.label}{counts[c.id]!=null?` ${counts[c.id]}`:''}
        </button>
      ))}
    </div>
  );
}
