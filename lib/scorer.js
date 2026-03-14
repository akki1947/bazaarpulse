const cats = require('../data/categories.json');
const { categories, keywords: KW, severity: SEV } = cats;

function scoreArticle(title='', desc='') {
  const txt = (title+' '+desc).toLowerCase();
  let score = 0;
  for (const w of KW.critical.words) if (txt.includes(w)) score += KW.critical.weight;
  for (const w of KW.major.words)    if (txt.includes(w)) score += KW.major.weight;
  for (const w of KW.minor.words)    if (txt.includes(w)) score += KW.minor.weight;
  if (score >= SEV.CRITICAL.threshold) return 'CRITICAL';
  if (score >= SEV.MAJOR.threshold)    return 'MAJOR';
  return 'MINOR';
}

// Noise filter — truly irrelevant content (NOT sports — sports has its own category now)
const NOISE_PATTERNS = [
  /\bott releases\b/i,
  /\bnetflix original\b/i,
  /\bwatch this weekend\b/i,
  /\bbox office collection\b/i,
  /\bfilm review\b/i,
  /\bmovie release\b/i,
  /\bweb series\b/i,
  /\bimd warns.*rain\b/i,
  /\bthunderstorm.*maharashtra\b/i,
  /\bfreedom of religion bill\b/i,
  /\bsleeper cell\b/i,
  /\bharis rauf.*unsold\b/i,
  /\bauction.*cricket.*unsold\b/i,
];

function isNoise(title='', desc='') {
  const txt = title + ' ' + desc;
  return NOISE_PATTERNS.some(p => p.test(txt));
}

function categoriseArticle(title='', desc='') {
  const txt = (title+' '+desc).toLowerCase();

  // ── Sports — check early, very specific ──
  const sportsSignals = [
    'cricket','ipl','bcci','test match',' odi ','t20','icc trophy',
    'premier league','champions league','la liga','bundesliga','serie a','isl',
    ' fih ','hockey india','hockey world cup',
    'wimbledon','us open','french open','atp tour','wta tour',
    'formula 1',' f1 ',' grand prix',
    'olympics','asian games','commonwealth games',
    'bwf','pv sindhu','saina nehwal'
  ];
  if (sportsSignals.some(s => txt.includes(s))) return 'sports';

  // ── AI/ML — check early ──
  const aiSignals = ['artificial intelligence','machine learning','deep learning','generative ai',
    'large language model',' llm ','chatgpt','openai','anthropic','gemini','grok',
    'ai model','ai chip','ai startup','ai funding','ai regulation','ai stock',
    'ai revenue','ai strategy','ai competition','ai tool','nvidia ai','copilot ai',
    'foundation model','transformer model'];
  if (aiSignals.some(s => txt.includes(s))) return 'aiml';

  // ── India signals ──
  const indiaSignals = ['rbi','sebi','nifty','sensex','bse','nse','rupee','inr',
    'irdai','pfrda','pib','modi','india','indian','mumbai','delhi'];
  const hasIndia = indiaSignals.some(s => txt.includes(s));

  // ── Global/US signals ──
  const globalSignals = ['federal reserve','fed rate','fomc','wall street','s&p 500',
    'nasdaq','dow jones','us stocks','us market','us economy','us gdp','us cpi',
    'us jobs','nonfarm','treasury yield','ecb','bank of england','pboc',
    'china economy','europe','eurozone','uk economy','japan','nikkei','ftse',
    'dax','hang seng','adobe','microsoft','apple','google','amazon','meta',
    'nvidia','tesla','alphabet','us earnings','silicon valley',
    'iran war','west asia','strait of hormuz','middle east war','us consumer',
    'us stock','us federal'];
  const isGlobal = globalSignals.some(s => txt.includes(s));

  if (isGlobal && !hasIndia) return 'global';

  // ── India-specific category matching ──
  const order = ['banking','economy','government','forex','commodities','mfsip','markets','corporate'];
  for (const id of order) {
    const cat = categories.find(c => c.id === id);
    if (cat && cat.keywords.some(k => txt.includes(k))) return id;
  }

  if (isGlobal) return 'global';
  return 'corporate';
}

function generateImpact(category, severity) {
  const IMPACTS = {
    banking:  {
      CRITICAL: 'Direct impact on loan EMIs, savings rates and bank stocks. Check floating rate loans and FD renewal rates urgently.',
      MAJOR:    'May shift bank stock valuations and rate expectations. Review your banking sector holdings.',
      MINOR:    'Routine banking update. Monitor if you hold bank stocks or have MCLR-linked loans.',
    },
    economy:  {
      CRITICAL: 'Macro shift affecting all asset classes. Review portfolio allocation across equity, debt and gold.',
      MAJOR:    'Economic data influencing RBI policy direction. Watch for FII flows and bond yield movement.',
      MINOR:    'Economic update building the macro picture. Relevant for long-term investors.',
    },
    aiml:     {
      CRITICAL: 'Major AI disruption event. Tech stocks and IT sector funds likely affected. Review exposure to AI-heavy portfolios.',
      MAJOR:    'Significant AI development with investment implications. Monitor IT, semiconductor and AI-linked stocks.',
      MINOR:    'AI sector update. Relevant for investors in tech funds, IT stocks and global innovation themes.',
    },
    sports:   {
      CRITICAL: 'Major sports event with potential sponsorship, media rights or brand impact on listed companies.',
      MAJOR:    'Sports event with business implications — broadcasters, sponsors, sports-tech companies.',
      MINOR:    'Sports update. Watch for impact on media companies, fantasy sports platforms and sponsors.',
    },
    markets:  {
      CRITICAL: 'Significant market event. Avoid panic decisions — diversified portfolios absorb shocks better.',
      MAJOR:    'Market-moving development. Good time to check stop-losses and near-term positions.',
      MINOR:    'Normal market activity. Stay the course for long-term SIP and index investors.',
    },
    corporate: {
      CRITICAL: 'Major corporate event — significant stock price impact expected. Wait for clarity before acting.',
      MAJOR:    'Earnings or corporate action with direct price impact. Review position sizing if you hold this stock.',
      MINOR:    'Company update. Monitor if you have direct exposure.',
    },
    government: {
      CRITICAL: 'Policy change with broad market implications. Specific sectors may see sharp moves.',
      MAJOR:    'Government announcement with sector impact. Check if your holdings are in affected industries.',
      MINOR:    'Policy development. Long-term implications may emerge; low immediate action needed.',
    },
    forex:    {
      CRITICAL: 'Sharp INR move. IT/pharma exporters gain on weak rupee; oil importers and inflation pressured.',
      MAJOR:    'Currency move impacts sectors: IT/pharma gain, import-heavy companies lose on weak INR.',
      MINOR:    'Routine forex movement. Minimal direct impact for most domestic retail investors.',
    },
    commodities: {
      CRITICAL: 'Major commodity shock. Check exposure to OMCs, metals, paints, tyre and FMCG stocks.',
      MAJOR:    'Commodity price shift affects input costs. Watch paints, tyres, FMCG, airlines.',
      MINOR:    'Commodity market update. Sector-specific relevance for commodity-linked stocks.',
    },
    mfsip:    {
      CRITICAL: 'Fund industry or regulatory change. Review your scheme, AUM and fund house stability.',
      MAJOR:    'MF development. Check if your specific fund or category is affected.',
      MINOR:    'MF/SIP news. Continue your SIPs unless fund fundamentals change.',
    },
    global:   {
      CRITICAL: 'Global shock with FII flow implications. India likely affected via capital outflows and commodity prices.',
      MAJOR:    'Global event influencing FII sentiment. Watch for domestic market reaction next session.',
      MINOR:    'Global market update. India impact usually with a 1-2 session lag.',
    },
  };
  const map = IMPACTS[category] || IMPACTS.global;
  return map[severity] || map.MINOR;
}

function processArticle(raw, sourceId) {
  if (isNoise(raw.title || '', raw.desc || '')) return null;
  const category = categoriseArticle(raw.title, raw.desc || '');
  const severity  = scoreArticle(raw.title, raw.desc || '');
  return {
    id:       `${sourceId}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
    title:    (raw.title || '').trim(),
    desc:     (raw.desc || '').trim(),
    link:     raw.link || '#',
    pub:      raw.pub ? new Date(raw.pub).toISOString() : new Date().toISOString(),
    source:   raw.source || sourceId,
    sourceId,
    category,
    severity,
    impact:   generateImpact(category, severity),
  };
}

module.exports = { scoreArticle, categoriseArticle, generateImpact, processArticle, isNoise };
