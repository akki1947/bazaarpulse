import { useState } from 'react';
import useSWR from 'swr';
import Layout from '../components/layout/Layout';
import ArticleCard from '../components/ui/ArticleCard';

const fetcher = url => fetch(url).then(r => r.json());

const AI_MODELS = [
  {
    category:'Frontier LLMs', icon:'🧠',
    models:[
      { name:'GPT-4o / o3',      org:'OpenAI',    status:'Live',    cap:'Multimodal (text/image/audio/video). Powers ChatGPT. o3 = best reasoning model.',   update:'o3 released Jan 2026. GPT-5 rumoured Q2 2026.' },
      { name:'Claude 3.7 Sonnet',org:'Anthropic',  status:'Live',    cap:'Extended thinking mode. Best for coding, analysis, long-context. 200K tokens.',     update:'3.7 adds visible reasoning chains. Amazon $4B partner.' },
      { name:'Gemini 2.0 Flash', org:'Google',     status:'Live',    cap:'Multimodal natively. 1M context. Integrated into Google Search, Workspace, Android.',update:'Gemini 2.0 Pro Ultra in testing for enterprise Jan 2026.' },
      { name:'Grok 3',           org:'xAI',        status:'Live',    cap:'Real-time X/Twitter data. Strongest STEM benchmark scores. SuperGrok subscription.',  update:'Grok 3 launched Feb 2026. DeepSearch + Think modes.' },
      { name:'Llama 3.3 / 4',    org:'Meta',       status:'Open',    cap:'Open source. 405B params. Best open weights model. Runs locally or on cloud.',        update:'Llama 4 (multimodal) expected Q1 2026. Meta AI everywhere.' },
      { name:'Mistral Large 2',  org:'Mistral AI', status:'Live',    cap:'European rival. Strong multilingual + code. Apache 2.0 license for commercial use.',  update:'Mistral Small 3 released Jan 2026. Le Chat assistant growing.' },
      { name:'DeepSeek V3 / R1', org:'DeepSeek',   status:'Live',    cap:'Chinese open-source model matching GPT-4 at fraction of cost. Shocked AI industry.',  update:'R1 reasoning model released Jan 2026. Caused Nvidia stock drop.' },
      { name:'Qwen 2.5',         org:'Alibaba',    status:'Open',    cap:'Strong multilingual especially Chinese/English. 72B open model tops leaderboards.',   update:'Qwen 2.5-Max matches GPT-4o. Growing enterprise adoption.' },
    ]
  },
  {
    category:'Specialised AI', icon:'🔬',
    models:[
      { name:'AlphaFold 3',    org:'Google DeepMind',status:'Research', cap:'Protein structure prediction. Revolutionising drug discovery and biology.',        update:'AF3 adds DNA/RNA/ligand prediction. Nobel Prize in Chemistry 2024.' },
      { name:'Sora / Veo 2',   org:'OpenAI / Google',status:'Limited',  cap:'Text-to-video generation. Sora by OpenAI, Veo 2 by Google. Photorealistic video.',  update:'Sora launched Dec 2024. Veo 2 added to Gemini Feb 2026.' },
      { name:'DALL-E 4 / Flux',org:'OpenAI / BlackF',status:'Live',     cap:'Image generation. Flux by Black Forest Labs rivals Midjourney. Commercial use.',    update:'Flux 1.1 Pro is current best open image model as of 2026.' },
      { name:'Whisper / Gemini',org:'OpenAI / Google',status:'Live',    cap:'Speech-to-text and real-time translation. 99 languages. Near-human accuracy.',      update:'Gemini Live enables real-time voice conversations on Android.' },
      { name:'GitHub Copilot',  org:'Microsoft',    status:'Live',      cap:'AI coding assistant. 77M developers. GPT-4o + Claude integration.',                  update:'Copilot Workspace for full repo editing launched 2025.' },
      { name:'Cursor / Windsurf',org:'Anysphere',   status:'Live',      cap:'AI-native code editors. Full codebase context. Agents that write & test code.',      update:'Cursor raised $100M. 360K developers paying subscribers.' },
    ]
  },
  {
    category:'India AI Ecosystem', icon:'🇮🇳',
    models:[
      { name:'IndiaAI Mission',  org:'Govt of India', status:'Active',  cap:'₹10,372 Cr national AI programme. 10,000 GPU compute infra. AI safety framework.',  update:'First GPU cluster operational at C-DAC Pune. Jan 2026.' },
      { name:'Sarvam AI',        org:'Startup',       status:'Live',    cap:'India-specific LLM. Fluent in 10 languages. ASR, TTS for Bharat use cases.',        update:'Series B ₹400 Cr. Govt AI pilot for agriculture, health.' },
      { name:'Krutrim',          org:'Ola / Agnikul', status:'Live',    cap:'Hindi-first LLM. Krutrim cloud for enterprise. India\'s first AI unicorn.',           update:'Krutrim 2 model released. Focus on SME automation tools.' },
      { name:'TCS WisdomNext',   org:'TCS',           status:'Live',    cap:'Enterprise AI platform. Cognitive automation, AI agents, data analytics.',           update:'$500M+ AI deal wins FY26. 150,000 employees AI-trained.' },
      { name:'Infosys Topaz',    org:'Infosys',       status:'Live',    cap:'AI-first services suite. Gen AI, responsible AI, data engineering.',                 update:'FY26 guidance raised citing AI demand. 50+ gen AI POCs live.' },
      { name:'BHASHINI',         org:'MeitY',         status:'Active',  cap:'Govt language AI platform. Real-time translation across 22 Indian languages.',       update:'Integrated into DigiLocker, UMANG, Aarogya Setu.' },
    ]
  },
  {
    category:'Upcoming Developments', icon:'🔮',
    models:[
      { name:'GPT-5',            org:'OpenAI',        status:'Expected', cap:'Next frontier model. Rumoured agent-first architecture with autonomous task completion.',update:'Expected Q2 2026. Leaked benchmarks show significant leap over GPT-4o.' },
      { name:'Gemini 2.0 Ultra', org:'Google',        status:'Testing',  cap:'Google\'s most capable model. Natively multimodal. Designed for agentic workflows.',  update:'Limited preview to enterprise customers. General release H1 2026.' },
      { name:'Claude 4',         org:'Anthropic',     status:'Expected', cap:'Next Claude generation. Rumoured 1M+ token context. Improved instruction following.',   update:'Expected mid-2026. Amazon and Google investing $7.5B total.' },
      { name:'Llama 4',          org:'Meta',          status:'Expected', cap:'Multimodal open-source model. Will include vision. Runs on consumer hardware.',         update:'Expected Q1-Q2 2026. Massive impact on self-hosted AI deployments.' },
      { name:'AI Agents (Wave)', org:'Industry-wide', status:'Emerging', cap:'Autonomous AI agents that plan, use tools, browse web, write and execute code.',        update:'2026 called "Year of Agents" by Sam Altman. OpenAI Operator launched.' },
      { name:'Physical AI',      org:'Various',       status:'Emerging', cap:'AI in robots: Tesla Optimus, Figure AI, 1X. Manufacturing + logistics automation.',      update:'Figure 02 deployed at BMW factory. Tesla Optimus in internal use.' },
    ]
  },
];

const STATUS_COL = {
  Live:'var(--green)', Active:'var(--green)', Open:'var(--cyan)',
  Limited:'var(--yellow)', Research:'var(--purple)',
  Expected:'var(--yellow)', Testing:'var(--orange)', Emerging:'var(--blue)'
};

export default function AIPage() {
  const [tab, setTab] = useState('news');
  const { data } = useSWR('/api/feed', fetcher, { revalidateOnFocus:false });
  const aiNews = (data?.articles||[]).filter(a => a.category==='aiml').slice(0,30);

  const TABS = [
    { id:'news',      label:'Live News'    },
    { id:'models',    label:'LLM Frontier' },
    { id:'special',   label:'Specialised'  },
    { id:'india',     label:'India AI'     },
    { id:'upcoming',  label:'Upcoming'     },
  ];

  const categoryMap = { news:null, models:'Frontier LLMs', special:'Specialised AI', india:'India AI Ecosystem', upcoming:'Upcoming Developments' };

  return (
    <Layout title="AI & ML" desc="AI model landscape, India AI ecosystem, upcoming developments and investment themes">
      <div className="shell">
        <div className="shell-main">
          <div className="slbl">
            <span className="slbl-dot" style={{background:'var(--purple)'}}/>
            AI & Machine Learning
          </div>

          <div style={{display:'flex',gap:0,marginBottom:20,borderBottom:'1px solid var(--border)',overflowX:'auto'}}>
            {TABS.map(t => (
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

          {tab==='news' && (
            <div>
              {aiNews.length
                ? aiNews.map(a => <ArticleCard key={a.id} article={a}/>)
                : <div style={{padding:32,textAlign:'center',color:'var(--muted)',fontSize:'var(--fs-sm)',lineHeight:1.8}}>
                    No AI/ML stories in current feed.<br/>
                    <span style={{fontSize:'var(--fs-xs)',color:'var(--dim)'}}>AI stories from TechCrunch, VentureBeat and ET Markets appear here.</span>
                  </div>
              }
            </div>
          )}

          {tab!=='news' && (() => {
            const sec = AI_MODELS.find(s => s.category === categoryMap[tab]);
            if (!sec) return null;
            return (
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,
                  paddingBottom:8,borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:'1.2rem'}}>{sec.icon}</span>
                  <span style={{fontSize:'var(--fs-md)',fontWeight:700,color:'var(--bright)'}}>{sec.category}</span>
                </div>
                {sec.models.map((m,i) => (
                  <div key={i} style={{background:'var(--surface)',border:'1px solid var(--border)',
                    marginBottom:10,borderLeft:`3px solid ${STATUS_COL[m.status]||'var(--dim)'}`}}>
                    <div style={{padding:'12px 14px'}}>
                      <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:7}}>
                        <div style={{flex:1}}>
                          <div style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:8,marginBottom:4}}>
                            <span style={{fontSize:'var(--fs-md)',fontWeight:700,color:'var(--bright)',
                              fontFamily:'var(--font-sans)'}}>{m.name}</span>
                            <span style={{fontSize:'var(--fs-label)',color:'var(--muted)',
                              background:'var(--raised)',padding:'1px 6px',borderRadius:2}}>{m.org}</span>
                            <span style={{marginLeft:'auto',fontSize:'var(--fs-label)',fontWeight:600,
                              color:STATUS_COL[m.status]||'var(--dim)',
                              border:`1px solid ${STATUS_COL[m.status]||'var(--border)'}`,
                              padding:'2px 7px',borderRadius:2}}>{m.status}</span>
                          </div>
                          <div style={{fontSize:'var(--fs-sm)',color:'var(--body)',lineHeight:1.65,marginBottom:6}}>{m.cap}</div>
                          <div style={{fontSize:'var(--fs-xs)',color:'var(--blue)',lineHeight:1.6,
                            borderTop:'1px solid var(--border)',paddingTop:7}}>
                            🔄 {m.update}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="shell-aside">
          <div className="widget">
            <div className="w-head" style={{color:'var(--purple)'}}>🤖 AI Quick Stats</div>
            <div className="w-body" style={{padding:0}}>
              {[
                { label:'India AI Mission Budget', val:'₹10,372 Cr',  note:'Govt FY26 allocation'       },
                { label:'IndiaAI GPU Cluster',     val:'10,000 GPUs',  note:'H100-equiv at C-DAC'        },
                { label:'Global AI Spend 2026',    val:'$500B+',       note:'Hardware + software + cloud' },
                { label:'Nvidia Data Centre Rev',  val:'$115B FY26',   note:'GPU monopoly earnings'      },
                { label:'IT AI Revenue (TCS)',      val:'$2B+ target', note:'FY26 guidance'               },
                { label:'ChatGPT Users',            val:'400M+',       note:'Weekly active Jan 2026'      },
                { label:'AI Unicorns India',        val:'4',           note:'Krutrim, Sarvam + 2 others'  },
                { label:'Coding AI Market',         val:'$10B+',       note:'Copilot, Cursor, Windsurf'   },
              ].map((s,i) => (
                <div key={i} style={{padding:'8px 12px',borderBottom:'1px solid var(--border)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
                    <span style={{fontSize:'var(--fs-xs)',color:'var(--muted)',flex:1,paddingRight:8}}>{s.label}</span>
                    <span style={{fontSize:'var(--fs-sm)',fontWeight:700,color:'var(--bright)',
                      fontFamily:'var(--font-mono)',flexShrink:0}}>{s.val}</span>
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
