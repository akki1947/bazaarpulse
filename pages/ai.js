import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import ArticleCard from '../components/ui/ArticleCard';

const fetcher = url => fetch(url).then(r => r.json());

const AI_LANDSCAPE = [
  {
    id:'llm', label:'Large Language Models', icon:'🧠',
    players:[
      { name:'OpenAI GPT-4o',  org:'OpenAI',    status:'Live',  note:'Multimodal. Powers ChatGPT. $157B valuation.' },
      { name:'Claude 3.5',     org:'Anthropic',  status:'Live',  note:'Strong reasoning, coding. Amazon-backed.' },
      { name:'Gemini 1.5 Pro', org:'Google',     status:'Live',  note:'2M context window. Integrated into Google products.' },
      { name:'Grok 3',         org:'xAI',        status:'Live',  note:'Real-time X data access. Elon Musk backed.' },
      { name:'Llama 3',        org:'Meta',       status:'Open',  note:'Open source. Most downloaded model family.' },
      { name:'Mistral Large',  org:'Mistral',    status:'Live',  note:'European rival. Strong code + multilingual.' },
    ]
  },
  {
    id:'india', label:'AI in India', icon:'🇮🇳',
    players:[
      { name:'IndiaAI Mission',   org:'Govt of India', status:'Active', note:'₹10,372 Cr outlay. 10,000 GPU compute infrastructure.' },
      { name:'Sarvam AI',         org:'Startup',       status:'Live',   note:'India-focused LLM. 10 Indian languages. Series A funded.' },
      { name:'Krutrim',           org:'Ola',           status:'Live',   note:'Bhavish Aggarwal. India\'s first AI unicorn at launch.' },
      { name:'TCS AI Cloud',      org:'TCS',           status:'Live',   note:'WisdomNext platform. AI-led services transformation.' },
      { name:'Infosys Topaz',     org:'Infosys',       status:'Live',   note:'AI-first services suite. $2B+ AI revenue target FY26.' },
      { name:'Wipro AI360',       org:'Wipro',         status:'Live',   note:'Enterprise AI practice. 30,000+ employees trained.' },
    ]
  },
  {
    id:'invest', label:'AI Investment Themes', icon:'💰',
    players:[
      { name:'Nvidia (NVDA)',    org:'Semiconductor', status:'Dominant', note:'AI chip monopoly. H100/H200 GPUs. $2T market cap.' },
      { name:'Data Centres',    org:'Infrastructure',status:'Booming',  note:'Power, cooling, REITs. AI compute = electricity demand.' },
      { name:'IT Services',     org:'India',         status:'Opportunity', note:'TCS, Infosys — AI adds → margin expansion.' },
      { name:'Cybertech',       org:'Security',      status:'Growing',  note:'AI attacks → AI defence. Crowdstrike, Palo Alto.' },
      { name:'SaaS + AI',       org:'Global',        status:'Transition','note':'Every SaaS embedding AI. Pricing power shift.' },
      { name:'Robotics',        org:'Physical AI',   status:'Emerging', note:'Tesla Optimus, Figure AI. Long-term secular theme.' },
    ]
  },
];

const STATUS_COL = {
  Live:'var(--green)', Active:'var(--green)', Open:'var(--cyan)',
  Dominant:'var(--blue)', Booming:'var(--green)', Opportunity:'var(--yellow)',
  Growing:'var(--green)', Transition:'var(--yellow)', Emerging:'var(--muted)'
};

export default function AIPage() {
  const [tab, setTab] = useState('news');
  const { data } = useSWR('/api/feed', fetcher, { revalidateOnFocus:false });
  const aiNews = (data?.articles||[]).filter(a => a.category==='aiml').slice(0,30);

  return (
    <Layout title="AI & ML" desc="Artificial intelligence news, India AI policy, investment themes and model landscape">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl">
            <span className="slbl-dot" style={{background:'var(--purple)'}}/>
            AI & Machine Learning
          </div>

          <div style={{display:'flex',gap:0,marginBottom:20,borderBottom:'1px solid var(--border)',overflowX:'auto'}}>
            {[{id:'news',label:'Live News'},{id:'landscape',label:'AI Landscape'},{id:'india',label:'India AI'},{id:'invest',label:'Invest'}].map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)}
                style={{padding:'7px 16px',background:'none',border:'none',whiteSpace:'nowrap',
                  fontSize:'var(--fs-label)',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',
                  color:tab===t.id?'var(--bright)':'var(--muted)',
                  borderBottom:tab===t.id?'2px solid var(--purple)':'2px solid transparent',
                  cursor:'pointer',transition:'all 0.12s'}}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'news' && (
            <div>
              {aiNews.length
                ? aiNews.map(a => <ArticleCard key={a.id} article={a}/>)
                : <div style={{padding:32,textAlign:'center',color:'var(--muted)',fontSize:'var(--fs-sm)'}}>
                    No AI/ML stories in current feed. Refresh the feed or check back shortly.
                  </div>
              }
            </div>
          )}

          {(tab==='landscape'||tab==='india'||tab==='invest') && (
            <div>
              {AI_LANDSCAPE.filter(s => tab==='landscape'?s.id==='llm':tab==='india'?s.id==='india':s.id==='invest').map(sec => (
                <div key={sec.id}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,
                    paddingBottom:8,borderBottom:'1px solid var(--border)'}}>
                    <span style={{fontSize:'1.1rem'}}>{sec.icon}</span>
                    <span style={{fontSize:'var(--fs-base)',fontWeight:700,color:'var(--bright)'}}>{sec.label}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:10,marginBottom:24}}>
                    {sec.players.map((p,i) => (
                      <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',
                        padding:'12px 14px',borderTop:`2px solid ${STATUS_COL[p.status]||'var(--dim)'}`}}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
                          <span style={{fontSize:'var(--fs-base)',fontWeight:700,color:'var(--bright)',fontFamily:'var(--font-sans)'}}>{p.name}</span>
                          <span style={{fontSize:'var(--fs-label)',color:STATUS_COL[p.status]||'var(--dim)',
                            border:`1px solid ${STATUS_COL[p.status]||'var(--border)'}`,
                            padding:'1px 6px',borderRadius:2,flexShrink:0,marginLeft:6}}>{p.status}</span>
                        </div>
                        <div style={{fontSize:'var(--fs-label)',color:'var(--muted)',marginBottom:5}}>{p.org}</div>
                        <div style={{fontSize:'var(--fs-xs)',color:'var(--body)',lineHeight:1.6}}>{p.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shell-aside">
          <div className="widget">
            <div className="w-head" style={{color:'var(--purple)'}}>🤖 AI Quick Stats</div>
            <div className="w-body" style={{padding:0}}>
              {[
                { label:'India AI Mission',    val:'₹10,372 Cr', note:'Govt allocation FY26' },
                { label:'IndiaAI GPU Target',  val:'10,000',     note:'H100 equivalent GPUs' },
                { label:'AI Unicorns India',   val:'4',          note:'Krutrim, Sarvam, etc.' },
                { label:'IT AI Revenue TCS',   val:'$2B+ target',note:'FY26 guidance' },
                { label:'Global AI Spend',     val:'$500B+',     note:'2026 estimate' },
                { label:'Nvidia Market Cap',   val:'~$2T',       note:'AI chip monopoly' },
              ].map((s,i) => (
                <div key={i} style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
                    <span style={{fontSize:'var(--fs-xs)',color:'var(--muted)'}}>{s.label}</span>
                    <span style={{fontSize:'var(--fs-sm)',fontWeight:700,color:'var(--bright)',fontFamily:'var(--font-mono)'}}>{s.val}</span>
                  </div>
                  <div style={{fontSize:'var(--fs-label)',color:'var(--dim)'}}>{s.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
