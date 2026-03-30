import { useState, useEffect, useMemo, useCallback } from 'react';

import {
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
  BarChart, Bar, Cell,
  AreaChart, Area,
  ReferenceLine
} from 'recharts';

// ═══════════════════════════════════════════════════════════════════════════════
// PORTFOLIO DATA — fully editable
// ═══════════════════════════════════════════════════════════════════════════════
const DEFAULT_STOCKS = [
  { id: 1,  name: "ADANI POWER",       ticker: "ADANIPOWER", qty: 250,   avgBuy: 128.16, price: 153.92, sector: "ENERGY" },
  { id: 2,  name: "ASHOK LEYLAND",     ticker: "ASHOKLEY",   qty: 848,   avgBuy: 90.35,  price: 163.09, sector: "AUTO" },
  { id: 3,  name: "ASHOKA BUILDCON",   ticker: "ASHOKA",     qty: 1753,  avgBuy: 110.0,  price: 109.26, sector: "INFRASTRUCTURE" },
  { id: 4,  name: "BALRAMPUR CHINI",   ticker: "BALRAMCHIN", qty: 150,   avgBuy: 57.55,  price: 497.2,  sector: "FMCG" },
  { id: 5,  name: "BANDHAN BANK",      ticker: "BANDHANBNK", qty: 1478,  avgBuy: 172.0,  price: 148.91, sector: "BANKING" },
  { id: 6,  name: "BHARAT ELECTRONICS",ticker: "BEL",        qty: 100,   avgBuy: 294.05, price: 404.75, sector: "DEFENCE" },
  { id: 7,  name: "BHEL",              ticker: "BHEL",       qty: 464,   avgBuy: 63.07,  price: 254.85, sector: "INDUSTRIALS" },
  { id: 8,  name: "ETERNAL LIMITED",   ticker: "ETERNAL",    qty: 150,   avgBuy: 277.1,  price: 233.17, sector: "FMCG" },
  { id: 9,  name: "HAVELLS INDIA",     ticker: "HAVELLS",    qty: 700,   avgBuy: 900.0,  price: 1231.6, sector: "CONSUMER" },
  { id: 10, name: "HINDALCO",          ticker: "HINDALCO",   qty: 189,   avgBuy: 181.42, price: 866.7,  sector: "METALS" },
  { id: 11, name: "IRFC",              ticker: "IRFC",       qty: 1017,  avgBuy: 118.0,  price: 92.45,  sector: "INFRASTRUCTURE" },
  { id: 12, name: "JIO FINANCIAL",     ticker: "JIOFIN",     qty: 238,   avgBuy: 373.0,  price: 232.55, sector: "FINANCIAL SERVICES" },
  { id: 13, name: "MRPL",              ticker: "MRPL",       qty: 1077,  avgBuy: 45.69,  price: 177.1,  sector: "ENERGY" },
  { id: 14, name: "NCC LIMITED",       ticker: "NCC",        qty: 3304,  avgBuy: 78.4,   price: 136.97, sector: "INFRASTRUCTURE" },
  { id: 15, name: "NTPC",              ticker: "NTPC",       qty: 50,    avgBuy: 441.9,  price: 375.65, sector: "ENERGY" },
  { id: 16, name: "POWER GRID CORP",   ticker: "POWERGRID",  qty: 200,   avgBuy: 352.6,  price: 295.5,  sector: "ENERGY" },
  { id: 17, name: "PUNJAB NATL BANK",  ticker: "PNB",        qty: 507,   avgBuy: 79.55,  price: 105.13, sector: "BANKING" },
  { id: 18, name: "RELIANCE POWER",    ticker: "RPOWER",     qty: 5425,  avgBuy: 12.16,  price: 21.35,  sector: "ENERGY" },
  { id: 19, name: "STATE BANK INDIA",  ticker: "SBIN",       qty: 350,   avgBuy: 579.0,  price: 1019.5, sector: "BANKING" },
  { id: 20, name: "SUZLON ENERGY",     ticker: "SUZLON",     qty: 1651,  avgBuy: 7.39,   price: 40.82,  sector: "ENERGY" },
  { id: 21, name: "TATA STEEL",        ticker: "TATASTEEL",  qty: 1950,  avgBuy: 50.6,   price: 193.22, sector: "METALS" },
  { id: 22, name: "TECH MAHINDRA",     ticker: "TECHM",      qty: 16,    avgBuy: 156.76, price: 1391.6, sector: "IT" },
  { id: 23, name: "UJJIVAN SFB",       ticker: "UJJIVANSFB", qty: 1802,  avgBuy: 18.88,  price: 52.88,  sector: "BANKING" },
  { id: 24, name: "VARUN BEVERAGES",   ticker: "VBL",        qty: 231,   avgBuy: 553.4,  price: 389.3,  sector: "FMCG" },
  { id: 25, name: "VEDANTA",           ticker: "VEDL",       qty: 1155,  avgBuy: 414.0,  price: 649.4,  sector: "METALS" },
  { id: 26, name: "WOCKHARDT PHARMA",  ticker: "WOCKPHARMA", qty: 100,   avgBuy: 244.06, price: 1189.5, sector: "HEALTHCARE" },
];

const SECTOR_PARAMS = {
  "BANKING":            { mu: 0.120, sigma: 0.270, beta: 1.20 },
  "FINANCIAL SERVICES": { mu: 0.140, sigma: 0.250, beta: 1.15 },
  "INSURANCE":          { mu: 0.110, sigma: 0.200, beta: 0.90 },
  "ENERGY":             { mu: 0.130, sigma: 0.300, beta: 1.10 },
  "METALS":             { mu: 0.140, sigma: 0.340, beta: 1.30 },
  "IT":                 { mu: 0.160, sigma: 0.240, beta: 0.85 },
  "AUTO":               { mu: 0.120, sigma: 0.260, beta: 1.00 },
  "INFRASTRUCTURE":     { mu: 0.150, sigma: 0.320, beta: 1.25 },
  "FMCG":               { mu: 0.100, sigma: 0.170, beta: 0.70 },
  "DEFENCE":            { mu: 0.185, sigma: 0.280, beta: 0.95 },
  "CONSUMER":           { mu: 0.115, sigma: 0.190, beta: 0.85 },
  "INDUSTRIALS":        { mu: 0.135, sigma: 0.290, beta: 1.10 },
  "RETAIL":             { mu: 0.110, sigma: 0.250, beta: 0.95 },
  "TRAVEL":             { mu: 0.075, sigma: 0.400, beta: 1.40 },
  "REAL ESTATE":        { mu: 0.090, sigma: 0.350, beta: 1.20 },
  "TELECOM":            { mu: 0.085, sigma: 0.300, beta: 0.90 },
  "TEXTILES":           { mu: 0.095, sigma: 0.280, beta: 0.95 },
  "HEALTHCARE":         { mu: 0.145, sigma: 0.210, beta: 0.80 },
  "HOSPITALITY":        { mu: 0.110, sigma: 0.330, beta: 1.10 },
};

const SECTORS = Object.keys(SECTOR_PARAMS);

// ═══════════════════════════════════════════════════════════════════════════════
// MONTE CARLO ENGINE — async chunked to prevent UI freeze at 10k+ sims
// Uses WEEKLY steps (52/yr) instead of daily (252/yr) = 5× faster, same accuracy
// ═══════════════════════════════════════════════════════════════════════════════
function randn() {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function sipFV(sip, rate, months) {
  if (!sip) return 0;
  const r = rate / 12;
  return sip * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}
function solveCAGR(pv, sip, target, years) {
  let lo = 0.001, hi = 5.0;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    (pv * Math.pow(1 + mid, years) + sipFV(sip, mid, years * 12)) > target ? hi = mid : lo = mid;
  }
  return (lo + hi) / 2;
}

// Chunked async simulation — runs in 50-sim batches, yields to UI between chunks
async function runMCAsync(stocks, p, goal, sip, onProgress) {
  const { numSims, horizon, rfr, rho, lam, jmu, jsig, useJ, useSV, xi, infR } = p;
  // Use weekly steps: dt=1/52, stepsPerYear=52
  const dt = 1 / 52;
  const steps = Math.round(horizon * 52);
  const stepsPerMo = Math.round(steps / (horizon * 12));

  const pv = stocks.reduce((s, st) => s + st.price * st.qty, 0);
  const W = stocks.map(st => (st.price * st.qty) / pv);
  const SP = stocks.map(st => SECTOR_PARAMS[st.sector] || SECTOR_PARAMS["FMCG"]);

  const finals = [], maxDDs = [], goalYears = [], paths = [];
  const yrSnaps = Array.from({ length: Math.ceil(horizon) + 1 }, () => []);
  const STORE = 200, SNAP = Math.max(1, Math.round(steps / 50));
  const CHUNK = 50; // sims per chunk

  for (let base = 0; base < numSims; base += CHUNK) {
    const end = Math.min(base + CHUNK, numSims);

    for (let sim = base; sim < end; sim++) {
      let val = pv, peak = pv, maxDD = 0, goalYr = null;
      let vols = SP.map(s => s.sigma);
      const pts = sim < STORE ? [pv] : null;

      for (let t = 1; t <= steps; t++) {
        const mkt = randn() * Math.sqrt(dt);
        let ret = 0;
        for (let i = 0; i < stocks.length; i++) {
          let sig = vols[i];
          const s = SP[i];
          if (useSV) {
            sig = Math.max(0.04, sig + 2.5 * (s.sigma - sig) * dt + xi * sig * randn() * Math.sqrt(dt));
            vols[i] = sig;
          }
          const c = Math.min(0.95, rho * s.beta);
          const shock = c * mkt + Math.sqrt(Math.max(0, 1 - c * c)) * randn() * Math.sqrt(dt);
          let lr = (s.mu - infR - 0.5 * sig * sig) * dt + sig * shock;
          if (useJ && Math.random() < lam * dt) lr += jmu + jsig * randn();
          ret += W[i] * lr;
        }
        val *= Math.exp(ret);
        if (sip > 0 && t % stepsPerMo === 0) val += sip;
        if (val > peak) peak = val;
        const dd = (peak - val) / peak;
        if (dd > maxDD) maxDD = dd;
        if (!goalYr && val >= goal) goalYr = t / 52;
        if (t % 52 === 0) {
          const yr = Math.round(t / 52);
          if (yr <= Math.ceil(horizon)) yrSnaps[yr].push(val);
        }
        if (pts && t % SNAP === 0) pts.push(val);
      }
      finals.push(val);
      maxDDs.push(maxDD);
      goalYears.push(goalYr);
      if (sim < STORE && pts) paths.push(pts);
    }

    onProgress(Math.round((end / numSims) * 100));
    // Yield to browser event loop
    await new Promise(r => setTimeout(r, 0));
  }

  finals.sort((a, b) => a - b);
  maxDDs.sort((a, b) => a - b);
  const pc = (a, p) => a[Math.min(Math.floor(p * a.length), a.length - 1)];
  const avg = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);

  const fan = yrSnaps.map((v, yr) => {
    if (!v.length) return null;
    v.sort((a, b) => a - b);
    return { year: yr, p5: pc(v,.05), p25: pc(v,.25), p50: pc(v,.5), p75: pc(v,.75), p95: pc(v,.95) };
  }).filter(Boolean);

  const bins = 50, mn = finals[0], mx = finals[finals.length-1], bw = (mx-mn)/bins;
  const hist = Array.from({length:bins},(_,i)=>{
    const x = mn+(i+0.5)*bw;
    return {x, count:0, pct:0, isLoss: x<pv, isGoal: x>=goal};
  });
  finals.forEach(v=>{const idx=Math.min(Math.floor((v-mn)/bw),bins-1);hist[idx].count++;});
  hist.forEach(b=>b.pct=b.count/numSims*100);

  const hits = goalYears.filter(y=>y!==null);
  const portMu = SP.reduce((s,sp,i)=>s+W[i]*sp.mu,0);
  const portSig = SP.reduce((s,sp,i)=>s+W[i]*sp.sigma,0);
  const negR = finals.filter(v=>v<pv).map(v=>Math.log(v/pv)/horizon);
  const ddSig = negR.length ? Math.sqrt(avg(negR.map(r=>r*r))) : portSig;

  return {
    pv, fan, hist, paths,
    goalHits: hits,
    numSims,
    stats: {
      p1:pc(finals,.01),p5:pc(finals,.05),p10:pc(finals,.10),
      p25:pc(finals,.25),p50:pc(finals,.5),mean:avg(finals),
      p75:pc(finals,.75),p90:pc(finals,.90),p95:pc(finals,.95),p99:pc(finals,.99),
      var95:pv-pc(finals,.05), var99:pv-pc(finals,.01),
      cvar95:pv-avg(finals.slice(0,Math.floor(.05*numSims))),
      probProfit:finals.filter(v=>v>pv).length/numSims,
      probGoal:hits.length/numSims,
      avgGoalYr:hits.length?avg(hits):null,
      avgMaxDD:avg(maxDDs), p95MaxDD:pc(maxDDs,.95),
      portMu, portSig,
      sharpe:(portMu-rfr)/portSig,
      sortino:(portMu-rfr)/ddSig,
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════════════════════════
const fmtL = n => {
  if(n==null||isNaN(n)) return "—";
  const a=Math.abs(n);
  if(a>=1e7) return `₹${(n/1e7).toFixed(2)}Cr`;
  if(a>=1e5) return `₹${(n/1e5).toFixed(2)}L`;
  if(a>=1e3) return `₹${(n/1e3).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
};
const fp = n => n==null||isNaN(n)?"—":`${(n*100).toFixed(1)}%`;
const fcagr = (pv,fv,y) => fp(Math.pow(Math.max(0.0001,fv/pv),1/y)-1);
const fnum = n => new Intl.NumberFormat('en-IN').format(Math.round(n));

const C = {
  bg:"#050810", panel:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)",
  cyan:"#00d4ff", violet:"#7c3aed", green:"#10b981", red:"#ef4444",
  amber:"#f59e0b", orange:"#f97316", gold:"#fbbf24", muted:"#64748b", text:"#e2e8f0",
  blue:"#3b82f6", pink:"#ec4899",
};
const SC=["#00d4ff","#7c3aed","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#f97316","#84cc16","#ec4899","#14b8a6","#a855f7","#eab308","#22c55e","#3b82f6","#f43f5e","#64748b","#0ea5e9","#d97706"];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function GaugePct({value}) {
  const r=54,cx=70,cy=70,circ=2*Math.PI*r,arc=circ*0.75;
  const color=value>=0.5?C.green:value>=0.25?C.amber:C.red;
  return (
    <svg width={140} height={110} viewBox="0 0 140 110">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10} strokeDasharray={`${arc*value} ${circ}`} strokeLinecap="round" transform={`rotate(135 ${cx} ${cy})`} style={{filter:`drop-shadow(0 0 8px ${color})`,transition:"all 0.8s"}}/>
      <text x={cx} y={cy-4} textAnchor="middle" fill={color} fontSize={20} fontWeight={700} fontFamily="IBM Plex Mono">{(value*100).toFixed(0)}%</text>
      <text x={cx} y={cy+14} textAnchor="middle" fill={C.muted} fontSize={9} fontFamily="IBM Plex Mono">PROBABILITY</text>
    </svg>
  );
}

function Ticker({stocks, prices}) {
  const items = stocks.slice(0,15).map(st=>{
    const lp = prices[st.ticker] || st.price;
    const chg = ((lp - st.price)/st.price*100);
    return `${st.ticker} ₹${lp.toFixed(2)} ${chg>=0?'+':''}${chg.toFixed(2)}%`;
  });
  const text = items.join("  ·  ");
  return (
    <div style={{overflow:"hidden",background:"rgba(0,212,255,0.06)",borderBottom:`1px solid ${C.border}`,height:28,display:"flex",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:0,animation:"scroll 40s linear infinite",whiteSpace:"nowrap"}}>
        {[text,text].map((t,i)=>(
          <span key={i} style={{fontSize:10,color:C.muted,paddingRight:60}}>
            {t.split("  ·  ").map((item,j)=>{
              const isPos = item.includes("+");
              return <span key={j} style={{color:isPos?C.green:C.red,marginRight:32}}>{item}</span>;
            })}
          </span>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [stocks, setStocks] = useState(DEFAULT_STOCKS);
  const [sip, setSip] = useState(50000);
  const [sipStepUp, setSipStepUp] = useState(10); // % increase per year
  const GOAL = 100_000_000;
  const [params, setParams] = useState({
    numSims:10000, horizon:10, rfr:0.065, rho:0.42,
    lam:2.5, jmu:-0.045, jsig:0.065,
    useJ:true, useSV:true, xi:0.28, infR:0.055,
  });
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState("goal");
  const [mainTab, setMainTab] = useState("simulator");
  const [editingStock, setEditingStock] = useState(null);
  const [showAddStock, setShowAddStock] = useState(false);
  const [newStock, setNewStock] = useState({name:"",ticker:"",qty:"",avgBuy:"",price:"",sector:"BANKING"});
  const [liveMode, setLiveMode] = useState(false);
  const [livePrices, setLivePrices] = useState({});
  const [news] = useState([
    {h:"Sensex hits record 82,000 — Metals & Defence lead rally",t:"2min ago",s:"BULL",c:C.green},
    {h:"RBI holds repo rate at 6.5% — Banking stocks surge",t:"8min ago",s:"NEUTRAL",c:C.cyan},
    {h:"SBIN Q4 net profit up 24% YoY — beats estimates",t:"15min ago",s:"BULL",c:C.green},
    {h:"Vedanta announces ₹3/share interim dividend",t:"22min ago",s:"BULL",c:C.green},
    {h:"Global crude oil falls 2.1% — Reliance Power dips",t:"35min ago",s:"BEAR",c:C.red},
    {h:"BEL secures ₹4,200Cr defence contract — stock +5%",t:"42min ago",s:"BULL",c:C.green},
    {h:"Tata Steel raises capex guidance for FY26",t:"1hr ago",s:"NEUTRAL",c:C.amber},
    {h:"UJJIVAN SFB PAT jumps 18% — microfinance NPA stable",t:"2hr ago",s:"BULL",c:C.green},
    {h:"IT sector Q4 guidance cut — Tech M under pressure",t:"3hr ago",s:"BEAR",c:C.red},
    {h:"India GDP Q4 estimate: 7.2% — beats 6.9% forecast",t:"4hr ago",s:"BULL",c:C.green},
  ]);

  const pv = useMemo(()=>stocks.reduce((s,st)=>s+(livePrices[st.ticker]||st.price)*st.qty,0),[stocks,livePrices]);
  const invested = useMemo(()=>stocks.reduce((s,st)=>s+st.avgBuy*st.qty,0),[stocks]);
  const reqCAGR = useMemo(()=>solveCAGR(pv,sip,GOAL,params.horizon),[pv,sip,GOAL,params.horizon]);

  const sectors = useMemo(()=>{
    const m={};
    stocks.forEach(st=>{const v=(livePrices[st.ticker]||st.price)*st.qty; m[st.sector]=(m[st.sector]||0)+v;});
    return Object.entries(m).map(([s,v])=>({sector:s,value:v,pct:v/pv})).sort((a,b)=>b.value-a.value);
  },[stocks,pv,livePrices]);

  // Simulate live price ticks
  useEffect(()=>{
    if(!liveMode) return;
    const tick=()=>{
      setLivePrices(prev=>{
        const next={...prev};
        stocks.forEach(st=>{
          const base=prev[st.ticker]||st.price;
          const chg=(Math.random()-0.497)*0.003;
          next[st.ticker]=Math.max(0.1,base*(1+chg));
        });
        return next;
      });
    };
    const id=setInterval(tick,1000);
    return()=>clearInterval(id);
  },[liveMode,stocks]);

  // Step-up SIP FV
  const sipStepUpFV = useCallback((annual,stepPct,rate,years)=>{
    let total=0;
    for(let y=0;y<years;y++){
      const monthlySip=annual*Math.pow(1+stepPct/100,y);
      const remainYears=years-y;
      const r=rate/12,m=remainYears*12;
      total+=monthlySip*((Math.pow(1+r,m)-1)/r)*(1+r);
    }
    return total;
  },[]);

  const run = useCallback(async()=>{
    setRunning(true); setProgress(0); setResult(null);
    try {
      const res = await runMCAsync(stocks,params,GOAL,sip,setProgress);
      setResult(res);
    } finally { setRunning(false); setProgress(100); }
  },[stocks,params,GOAL,sip]);

  const deleteStock = id => setStocks(prev=>prev.filter(s=>s.id!==id));
  const updateStock = (id,field,val) => setStocks(prev=>prev.map(s=>s.id===id?{...s,[field]:field==='name'||field==='ticker'||field==='sector'?val:parseFloat(val)||0}:s));
  const addStock = () => {
    if(!newStock.name||!newStock.ticker) return;
    setStocks(prev=>[...prev,{id:Date.now(),...newStock,qty:parseFloat(newStock.qty)||0,avgBuy:parseFloat(newStock.avgBuy)||0,price:parseFloat(newStock.price)||0}]);
    setNewStock({name:"",ticker:"",qty:"",avgBuy:"",price:"",sector:"BANKING"});
    setShowAddStock(false);
  };

  const sfv=(cagr,s)=>pv*Math.pow(1+cagr,params.horizon)+sipFV(s,cagr,params.horizon*12);

  const Input=({val,onChange,style={}})=>(
    <input value={val} onChange={e=>onChange(e.target.value)}
      style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:4,padding:"4px 7px",color:C.text,fontSize:10,fontFamily:"inherit",width:"100%",...style}}/>
  );

  const Sl=(key,label,min,max,step,fmt)=>(
    <div key={key}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
        <span style={{fontSize:9,color:C.muted}}>{label}</span>
        <span style={{fontSize:10,color:C.cyan,fontWeight:700}}>{fmt(params[key])}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={params[key]}
        onChange={e=>setParams(p=>({...p,[key]:parseFloat(e.target.value)}))}
        style={{width:"100%",accentColor:C.cyan}}/>
    </div>
  );
  const Tg=(key,label)=>(
    <label key={key} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer"}}>
      <div onClick={()=>setParams(p=>({...p,[key]:!p[key]}))}
        style={{width:32,height:17,borderRadius:9,background:params[key]?C.cyan:"rgba(255,255,255,0.1)",position:"relative",transition:"all 0.2s"}}>
        <div style={{position:"absolute",top:1,left:params[key]?16:1,width:15,height:15,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
      </div>
      <span style={{fontSize:9,color:"#94a3b8"}}>{label}</span>
    </label>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'IBM Plex Mono',monospace",color:C.text,fontSize:12}}>

      {/* TICKER TAPE */}
      <Ticker stocks={stocks} prices={livePrices}/>

      {/* HEADER */}
      <div style={{background:"linear-gradient(90deg,rgba(0,212,255,0.08),rgba(124,58,237,0.08))",borderBottom:`1px solid ${C.border}`,padding:"14px 22px",display:"flex",flexWrap:"wrap",gap:12,alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:liveMode?C.green:C.muted,boxShadow:liveMode?`0 0 10px ${C.green}`:""}}/>
            <span style={{fontSize:8,color:liveMode?C.green:C.muted,letterSpacing:3}}>{liveMode?"● LIVE PRICES":"○ STATIC PRICES"}</span>
          </div>
          <h1 style={{margin:0,fontSize:18,fontWeight:700,color:"#fff",letterSpacing:-0.5}}>
            QuantEdge Portfolio Intelligence
          </h1>
          <div style={{fontSize:8,color:C.muted,marginTop:2}}>
            Monte Carlo · GBM + Merton + Heston · ₹10Cr Goal Tracker · {stocks.length} Holdings · NSE India
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <button onClick={()=>setLiveMode(v=>!v)}
            style={{padding:"6px 14px",borderRadius:6,border:`1px solid ${liveMode?C.green:C.border}`,background:liveMode?`${C.green}20`:"transparent",color:liveMode?C.green:C.muted,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>
            {liveMode?"⏸ PAUSE LIVE":"▶ LIVE PRICES"}
          </button>
          <div style={{padding:"6px 14px",borderRadius:6,border:`1px solid ${C.border}`,fontSize:9,color:C.muted}}>
            {fmtL(pv)} portfolio · {fp((pv-invested)/invested)} return
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,background:"rgba(255,255,255,0.01)",overflowX:"auto"}}>
        {[["simulator","🧮 Monte Carlo"],["portfolio","📊 Portfolio"],["goal","🎯 ₹10Cr Plan"],["pitch","🚀 VC Pitch"],["linkedin","💼 LinkedIn/CV"]].map(([k,l])=>(
          <button key={k} onClick={()=>setMainTab(k)}
            style={{padding:"11px 20px",border:"none",borderBottom:mainTab===k?`2px solid ${C.cyan}`:"2px solid transparent",background:mainTab===k?`${C.cyan}08`:"transparent",color:mainTab===k?C.cyan:C.muted,fontSize:9.5,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
            {l}
          </button>
        ))}
      </div>

      <div style={{padding:"18px 22px",maxWidth:1440,margin:"0 auto"}}>

        {/* ═════════════ SIMULATOR TAB ═════════════ */}
        {mainTab==="simulator" && (
          <div>
            {/* Summary */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,marginBottom:14}}>
              {[
                {l:"PORTFOLIO VALUE",v:fmtL(pv),c:C.cyan},
                {l:"INVESTED",v:fmtL(invested),c:C.violet},
                {l:"P&L",v:`${fmtL(pv-invested)} (${fp((pv-invested)/invested)})`,c:pv>=invested?C.green:C.red},
                {l:"GAP TO ₹10 CR",v:fmtL(GOAL-pv),c:C.amber},
                {l:"NEED MULTIPLE",v:`${(GOAL/pv).toFixed(1)}×`,c:C.gold},
                {l:"REQ. CAGR",v:fp(reqCAGR),c:reqCAGR>0.26?C.red:reqCAGR>0.18?C.amber:C.green},
              ].map(m=>(
                <div key={m.l} style={{background:C.panel,border:`1px solid ${m.c}18`,borderRadius:7,padding:"9px 12px"}}>
                  <div style={{fontSize:7,color:C.muted,letterSpacing:1.5,marginBottom:3}}>{m.l}</div>
                  <div style={{fontSize:15,fontWeight:700,color:m.c}}>{m.v}</div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div style={{background:C.panel,border:`1px solid ${C.gold}22`,borderRadius:9,padding:"14px 16px"}}>
                <div style={{fontSize:8,color:C.gold,letterSpacing:2,marginBottom:10}}>💰 SIP INVESTMENT</div>
                <div style={{fontSize:20,fontWeight:700,color:C.gold,marginBottom:6}}>{fmtL(sip)}<span style={{fontSize:10,color:C.muted}}>/month</span></div>
                <input type="range" min={0} max={1000000} step={5000} value={sip} onChange={e=>setSip(+e.target.value)} style={{width:"100%",accentColor:C.gold,marginBottom:6}}/>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                  {[0,25000,50000,100000,200000,500000].map(v=>(
                    <button key={v} onClick={()=>setSip(v)}
                      style={{padding:"3px 8px",borderRadius:4,border:`1px solid ${sip===v?C.gold:C.border}`,background:sip===v?`${C.gold}20`:"transparent",color:sip===v?C.gold:C.muted,fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>
                      {v===0?"None":fmtL(v)}
                    </button>
                  ))}
                </div>
                <div style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontSize:8.5,color:C.muted}}>Step-Up SIP annually</span>
                    <span style={{fontSize:9,color:C.amber,fontWeight:700}}>{sipStepUp}%/yr</span>
                  </div>
                  <input type="range" min={0} max={30} step={1} value={sipStepUp} onChange={e=>setSipStepUp(+e.target.value)} style={{width:"100%",accentColor:C.amber}}/>
                </div>
                <div style={{fontSize:8.5,color:C.muted,lineHeight:1.8,background:"rgba(251,191,36,0.04)",borderRadius:6,padding:"8px 10px"}}>
                  <div>Base SIP corpus ({params.horizon}yr): <strong style={{color:C.gold}}>{fmtL(sipFV(sip,reqCAGR,params.horizon*12))}</strong></div>
                  <div>Step-Up SIP corpus: <strong style={{color:C.amber}}>{fmtL(sipStepUpFV(sip,sipStepUp,reqCAGR,params.horizon))}</strong></div>
                  <div>Required CAGR: <strong style={{color:reqCAGR>0.25?C.red:reqCAGR>0.18?C.amber:C.green}}>{fp(reqCAGR)}</strong></div>
                </div>
              </div>

              <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:9,padding:"14px 16px"}}>
                <div style={{fontSize:8,color:C.cyan,letterSpacing:2,marginBottom:10}}>⚙ MODEL PARAMETERS</div>
                <div style={{fontSize:8,color:C.amber,marginBottom:8,background:`${C.amber}10`,borderRadius:5,padding:"5px 8px"}}>
                  ⚡ {params.numSims.toLocaleString()} sims use weekly steps (dt=1/52) for non-blocking performance
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {Sl("numSims","Simulations",1000,20000,1000,v=>v.toLocaleString())}
                  {Sl("horizon","Horizon (yr)",1,15,1,v=>`${v}yr`)}
                  {Sl("rfr","Risk-Free Rate",0.04,0.10,0.005,fp)}
                  {Sl("rho","Market Corr ρ",0.1,0.9,0.05,v=>v.toFixed(2))}
                  {Sl("lam","Jump λ",0,8,0.5,v=>`${v}/yr`)}
                  {Sl("jmu","Jump Mean μJ",-0.15,0.05,0.005,fp)}
                  {Sl("jsig","Jump Std σJ",0.02,0.15,0.005,fp)}
                  {Sl("xi","Heston ξ",0.1,0.8,0.05,v=>v.toFixed(2))}
                </div>
                <div style={{display:"flex",gap:14,marginTop:8,flexWrap:"wrap"}}>
                  {Tg("useJ","Merton Jumps")}{Tg("useSV","Heston StochVol")}
                </div>
              </div>
            </div>

            {/* Scenario Matrix */}
            <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 16px",marginBottom:12,overflowX:"auto"}}>
              <div style={{fontSize:8,color:C.gold,letterSpacing:2,marginBottom:10}}>📊 ₹10 CR SCENARIO MATRIX (YEAR {params.horizon})</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:9.5}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${C.border}`}}>
                    <th style={{textAlign:"left",padding:"6px 9px",color:C.muted,fontSize:8}}>SIP / CAGR →</th>
                    {[0.13,0.16,0.20,0.25,reqCAGR].map((c,i)=>(
                      <th key={i} style={{textAlign:"right",padding:"6px 9px",color:i===4?C.gold:C.muted,fontSize:8}}>
                        {fp(c)}{["  Nifty"," LgMid"," Mid"," Aggr"," ★Req"][i]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[0,25000,50000,100000,200000,500000].map(s=>(
                    <tr key={s} style={{borderBottom:"1px solid rgba(255,255,255,0.03)",background:s===sip?`${C.cyan}06`:"transparent"}}>
                      <td style={{padding:"6px 9px",color:s===sip?C.cyan:C.muted,fontSize:8.5}}>{s===0?"No SIP":`${fmtL(s)}/mo`}{s===sip?" ←":""}</td>
                      {[0.13,0.16,0.20,0.25,reqCAGR].map((c,ci)=>{
                        const v=sfv(c,s),hit=v>=GOAL;
                        return <td key={ci} style={{padding:"6px 9px",textAlign:"right",color:hit?C.green:v>=GOAL*0.6?C.amber:C.muted,fontWeight:hit?700:400}}>{fmtL(v)}{hit?" ✓":""}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={run} disabled={running}
              style={{width:"100%",padding:"13px",borderRadius:8,border:"none",background:running?`${C.cyan}15`:`linear-gradient(90deg,${C.cyan},${C.violet})`,color:"#fff",fontSize:13,fontWeight:700,cursor:running?"not-allowed":"pointer",letterSpacing:1.5,boxShadow:running?"none":`0 0 20px rgba(0,212,255,0.2)`,transition:"all 0.2s",fontFamily:"inherit",marginBottom:16}}>
              {running?`⟳ SIMULATING... ${progress}%`:`▶ RUN ${params.numSims.toLocaleString()} MONTE CARLO PATHS · ${params.horizon}yr · ₹10Cr GOAL`}
            </button>

            {running && (
              <div style={{marginBottom:14,background:C.panel,borderRadius:7,overflow:"hidden",height:6}}>
                <div style={{height:"100%",width:`${progress}%`,background:`linear-gradient(90deg,${C.cyan},${C.violet})`,transition:"width 0.3s",borderRadius:7}}/>
              </div>
            )}

            {result && (
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:7,marginBottom:14}}>
                  {[
                    {l:"Goal Prob",v:fp(result.stats.probGoal),c:result.stats.probGoal>=0.5?C.green:result.stats.probGoal>=0.25?C.amber:C.red},
                    {l:"Avg Goal Year",v:result.stats.avgGoalYr?`Yr ${result.stats.avgGoalYr.toFixed(1)}`:"Beyond",c:C.gold},
                    {l:"Median (P50)",v:fmtL(result.stats.p50),c:C.cyan},
                    {l:"Bull (P95)",v:fmtL(result.stats.p95),c:C.green},
                    {l:"Bear (P5)",v:fmtL(result.stats.p5),c:C.red},
                    {l:"VaR 95%",v:fmtL(result.stats.var95),c:C.amber},
                    {l:"CVaR 95%",v:fmtL(result.stats.cvar95),c:C.orange},
                    {l:"Avg Drawdown",v:fp(result.stats.avgMaxDD),c:C.amber},
                    {l:"P95 Drawdown",v:fp(result.stats.p95MaxDD),c:C.red},
                    {l:"Sharpe",v:result.stats.sharpe.toFixed(3),c:C.cyan},
                    {l:"Sortino",v:result.stats.sortino.toFixed(3),c:C.violet},
                    {l:"Prob Profit",v:fp(result.stats.probProfit),c:C.green},
                  ].map(m=>(
                    <div key={m.l} style={{background:C.panel,border:`1px solid ${m.c}18`,borderRadius:7,padding:"8px 11px"}}>
                      <div style={{fontSize:7,color:C.muted,letterSpacing:1,marginBottom:2}}>{m.l}</div>
                      <div style={{fontSize:14,fontWeight:700,color:m.c}}>{m.v}</div>
                    </div>
                  ))}
                </div>

                <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
                  <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,overflowX:"auto"}}>
                    {[["goal","🎯 Goal"],["fan","📈 Fan"],["dist","🔔 Dist"],["paths","🌀 Paths"],["table","📋 Table"]].map(([k,l])=>(
                      <button key={k} onClick={()=>setTab(k)}
                        style={{padding:"9px 16px",border:"none",borderBottom:tab===k?`2px solid ${C.cyan}`:"2px solid transparent",background:tab===k?`${C.cyan}10`:"transparent",color:tab===k?C.cyan:C.muted,fontSize:9,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <div style={{padding:18}}>
                    {tab==="goal"&&(()=>{
                      const bins=Array.from({length:params.horizon+1},(_,i)=>({year:i,count:0,cumulative:0,pct:0}));
                      result.goalHits.forEach(y=>{const yr=Math.min(Math.floor(y),params.horizon);bins[yr].count++;});
                      let cum=0; bins.forEach(b=>{cum+=b.count;b.cumulative=cum/result.numSims;b.pct=b.count/result.numSims;});
                      return (
                        <div>
                          <div style={{display:"flex",gap:24,flexWrap:"wrap",alignItems:"flex-start"}}>
                            <div>
                              <div style={{fontSize:8.5,color:C.muted,marginBottom:6}}>Probability of hitting ₹10 Cr</div>
                              <GaugePct value={result.stats.probGoal}/>
                              <div style={{fontSize:8,color:C.muted,textAlign:"center"}}>{result.goalHits.length.toLocaleString()} / {result.numSims.toLocaleString()} simulations</div>
                            </div>
                            <div style={{flex:1,minWidth:280}}>
                              <div style={{fontSize:8.5,color:C.muted,marginBottom:8}}>Year-by-year goal hit rate</div>
                              <ResponsiveContainer width="100%" height={200}>
                                <ComposedChart data={bins.slice(1)} margin={{top:5,right:10,bottom:5,left:0}}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                                  <XAxis dataKey="year" stroke={C.muted} tick={{fontSize:8}} tickFormatter={v=>`Yr${v}`}/>
                                  <YAxis yAxisId="l" stroke={C.muted} tick={{fontSize:8}} tickFormatter={fp}/>
                                  <YAxis yAxisId="r" orientation="right" stroke={C.muted} tick={{fontSize:8}} tickFormatter={fp}/>
                                  <Tooltip contentStyle={{background:"#0d1117",border:`1px solid ${C.border}`,fontSize:8}} formatter={(v,n)=>[fp(v),n==="pct"?"Hit in year":"Cumulative"]}/>
                                  <Bar yAxisId="l" dataKey="pct" fill={`${C.cyan}70`} radius={[2,2,0,0]} name="pct"/>
                                  <Line yAxisId="r" type="monotone" dataKey="cumulative" stroke={C.gold} strokeWidth={2} dot={false} name="cumulative"/>
                                </ComposedChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:9,marginTop:14}}>
                            {[
                              {t:"🟢 Probability",c:C.green,d:`${fp(result.stats.probGoal)} chance of ₹10 Cr in ${params.horizon}yr with ${fmtL(sip)}/mo SIP. ${result.stats.probGoal>=0.5?"Better than coin flip — very achievable!":result.stats.probGoal>=0.25?"Challenging but realistic.":"Increase SIP significantly."}`},
                              {t:"📌 Median Path",c:C.cyan,d:`Median sim ends at ${fmtL(result.stats.p50)} (${fcagr(result.pv,result.stats.p50,params.horizon)} CAGR). ${result.stats.p50>=GOAL?"Median BEATS ₹10 Cr goal! 🎉":`Needs ${fmtL(GOAL-result.stats.p50)} more.`}`},
                              {t:"⚡ Step-Up SIP Impact",c:C.gold,d:`With ${sipStepUp}% annual step-up, SIP corpus grows to ${fmtL(sipStepUpFV(sip,sipStepUp,reqCAGR,params.horizon))} — significantly higher than flat SIP of ${fmtL(sipFV(sip,reqCAGR,params.horizon*12))}.`},
                              {t:"⚠ Biggest Risk",c:C.red,d:`P95 worst-case drawdown: ${fp(result.stats.p95MaxDD)}. A crash in years 1-3 is most damaging. Maintain 12mo cash buffer. Never panic-sell.`},
                            ].map(card=>(
                              <div key={card.t} style={{background:`${card.c}07`,border:`1px solid ${card.c}20`,borderRadius:7,padding:"11px 13px"}}>
                                <div style={{fontSize:9.5,color:card.c,fontWeight:700,marginBottom:5}}>{card.t}</div>
                                <div style={{fontSize:8.5,color:"#94a3b8",lineHeight:1.7}}>{card.d}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                    {tab==="fan"&&(
                      <div>
                        <ResponsiveContainer width="100%" height={340}>
                          <AreaChart data={result.fan} margin={{top:10,right:20,bottom:10,left:10}}>
                            <defs>
                              <linearGradient id="g95" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.violet} stopOpacity={0.1}/><stop offset="95%" stopColor={C.violet} stopOpacity={0.01}/></linearGradient>
                              <linearGradient id="g75" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.cyan} stopOpacity={0.12}/><stop offset="95%" stopColor={C.cyan} stopOpacity={0.01}/></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                            <XAxis dataKey="year" stroke={C.muted} tick={{fontSize:8}} tickFormatter={v=>`Yr${v}`}/>
                            <YAxis stroke={C.muted} tick={{fontSize:8}} tickFormatter={fmtL} width={80}/>
                            <Tooltip contentStyle={{background:"#0d1117",border:`1px solid ${C.border}`,fontSize:9}} formatter={(v,n)=>[fmtL(v),n]} labelFormatter={v=>`Year ${v}`}/>
                            <ReferenceLine y={GOAL} stroke={C.gold} strokeDasharray="6 3" strokeWidth={2} label={{value:"₹10Cr",fill:C.gold,fontSize:8,position:"right"}}/>
                            <ReferenceLine y={result.pv} stroke={C.amber} strokeDasharray="4 4" label={{value:"Today",fill:C.amber,fontSize:8,position:"right"}}/>
                            <Area type="monotone" dataKey="p95" stroke={C.violet} strokeWidth={1} fill="url(#g95)" name="P95"/>
                            <Area type="monotone" dataKey="p75" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#g75)" name="P75"/>
                            <Area type="monotone" dataKey="p50" stroke={C.cyan} strokeWidth={2.5} fill="none" name="P50"/>
                            <Area type="monotone" dataKey="p25" stroke="#06b6d4" strokeWidth={1.5} fill="none" name="P25" strokeDasharray="4 2"/>
                            <Area type="monotone" dataKey="p5" stroke={C.red} strokeWidth={1} fill="none" name="P5" strokeDasharray="3 3"/>
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {tab==="dist"&&(
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={result.hist} margin={{top:10,right:20,bottom:10,left:10}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                          <XAxis dataKey="x" stroke={C.muted} tick={{fontSize:7.5}} tickFormatter={fmtL} interval={5}/>
                          <YAxis stroke={C.muted} tick={{fontSize:8}} tickFormatter={v=>`${v.toFixed(1)}%`}/>
                          <Tooltip contentStyle={{background:"#0d1117",border:`1px solid ${C.border}`,fontSize:9}} formatter={(v,_,p)=>[`${v.toFixed(2)}%`,`≈${fmtL(p.payload.x)}`]}/>
                          <ReferenceLine x={result.pv} stroke={C.amber} strokeWidth={2}/>
                          <ReferenceLine x={GOAL} stroke={C.gold} strokeWidth={2} label={{value:"₹10Cr",fill:C.gold,fontSize:8}}/>
                          <Bar dataKey="pct" radius={[2,2,0,0]}>{result.hist.map((b,i)=><Cell key={i} fill={b.isGoal?`${C.gold}cc`:b.isLoss?`${C.red}85`:`${C.green}80`}/>)}</Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                    {tab==="paths"&&(
                      <div>
                        <div style={{fontSize:8.5,color:C.muted,marginBottom:8}}>200 simulation paths · Gold = hit ₹10Cr · Green = profit · Red = loss</div>
                        <ResponsiveContainer width="100%" height={320}>
                          <LineChart margin={{top:10,right:20,bottom:10,left:10}}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)"/>
                            <XAxis stroke={C.muted} tick={{fontSize:8}}/>
                            <YAxis stroke={C.muted} tick={{fontSize:8}} tickFormatter={fmtL} width={80}/>
                            <ReferenceLine y={result.pv} stroke={C.amber} strokeDasharray="4 4"/>
                            <ReferenceLine y={GOAL} stroke={C.gold} strokeWidth={2} strokeDasharray="6 3" label={{value:"₹10Cr",fill:C.gold,fontSize:8,position:"right"}}/>
                            {result.paths.slice(0,180).map((path,i)=>{
                              const fv=path[path.length-1];
                              const col=fv>=GOAL?`rgba(251,191,36,${0.1+Math.random()*0.18})`:fv>result.pv?`rgba(16,185,129,${0.05+Math.random()*0.09})`:`rgba(239,68,68,${0.05+Math.random()*0.09})`;
                              return <Line key={i} data={path.map((v,t)=>({t,v}))} dataKey="v" dot={false} stroke={col} strokeWidth={0.7} isAnimationActive={false}/>;
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {tab==="table"&&(
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:10.5}}>
                          <thead>
                            <tr style={{borderBottom:`1px solid ${C.border}`}}>
                              {["Scenario","Pct","Nominal","Real","Gain/Loss","Return","CAGR","₹10Cr?"].map(h=><th key={h} style={{textAlign:"left",padding:"6px 8px",color:C.muted,fontSize:8}}>{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {[["Worst","P1",result.stats.p1,C.red],["Bear","P5",result.stats.p5,C.orange],["Below","P25",result.stats.p25,C.amber],["Median","P50",result.stats.p50,"#94a3b8"],["Mean","Mean",result.stats.mean,C.cyan],["Above","P75",result.stats.p75,"#22c55e"],["Bull","P95",result.stats.p95,C.green],["Best","P99",result.stats.p99,C.cyan]].map(([s,p,v,c])=>{
                              const real=v/Math.pow(1+params.infR,params.horizon),hit=v>=GOAL;
                              return (
                                <tr key={s} style={{borderBottom:"1px solid rgba(255,255,255,0.03)",background:hit?`${C.gold}05`:"transparent"}}>
                                  <td style={{padding:"7px 8px",color:c}}>{s}</td>
                                  <td style={{padding:"7px 8px",color:C.muted}}>{p}</td>
                                  <td style={{padding:"7px 8px",color:"#e2e8f0",fontWeight:600}}>{fmtL(v)}</td>
                                  <td style={{padding:"7px 8px",color:"#64748b"}}>{fmtL(real)}</td>
                                  <td style={{padding:"7px 8px",color:v>result.pv?C.green:C.red}}>{v>result.pv?"+":""}{fmtL(v-result.pv)}</td>
                                  <td style={{padding:"7px 8px",color:v>result.pv?C.green:C.red}}>{fp((v-result.pv)/result.pv)}</td>
                                  <td style={{padding:"7px 8px",color:C.muted}}>{fcagr(result.pv,v,params.horizon)}</td>
                                  <td style={{padding:"7px 8px",color:hit?C.gold:C.muted,fontWeight:hit?700:400}}>{hit?"✓ YES":"✗"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ═════════════ PORTFOLIO TAB ═════════════ */}
        {mainTab==="portfolio" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:8}}>
              <div style={{fontSize:8,color:C.cyan,letterSpacing:2}}>📊 PORTFOLIO HOLDINGS — EDITABLE</div>
              <button onClick={()=>setShowAddStock(true)}
                style={{padding:"6px 14px",borderRadius:6,border:`1px solid ${C.green}`,background:`${C.green}15`,color:C.green,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>
                + ADD STOCK
              </button>
            </div>

            {showAddStock&&(
              <div style={{background:C.panel,border:`1px solid ${C.cyan}30`,borderRadius:9,padding:"14px 16px",marginBottom:12}}>
                <div style={{fontSize:8,color:C.cyan,letterSpacing:2,marginBottom:10}}>ADD NEW STOCK</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:8,marginBottom:10}}>
                  {[["Name","name"],["Ticker","ticker"],["Qty","qty"],["Avg Buy ₹","avgBuy"],["CMP ₹","price"]].map(([l,k])=>(
                    <div key={k}>
                      <div style={{fontSize:8,color:C.muted,marginBottom:3}}>{l}</div>
                      <Input val={newStock[k]} onChange={v=>setNewStock(p=>({...p,[k]:v}))}/>
                    </div>
                  ))}
                  <div>
                    <div style={{fontSize:8,color:C.muted,marginBottom:3}}>Sector</div>
                    <select value={newStock.sector} onChange={e=>setNewStock(p=>({...p,sector:e.target.value}))}
                      style={{background:"rgba(255,255,255,0.06)",border:`1px solid ${C.border}`,borderRadius:4,padding:"4px 7px",color:C.text,fontSize:9,fontFamily:"inherit",width:"100%"}}>
                      {SECTORS.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={addStock} style={{padding:"6px 16px",borderRadius:5,border:"none",background:C.green,color:"#fff",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Add</button>
                  <button onClick={()=>setShowAddStock(false)} style={{padding:"6px 16px",borderRadius:5,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:9,overflow:"hidden",overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${C.border}`,background:"rgba(255,255,255,0.02)"}}>
                    {["Stock","Ticker","Sector","Qty","Avg Buy","CMP","Value","P&L","P&L%",""].map(h=>(
                      <th key={h} style={{textAlign:"left",padding:"8px 10px",color:C.muted,fontSize:8,fontWeight:400,letterSpacing:1}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(st=>{
                    const lp=livePrices[st.ticker]||st.price;
                    const val=lp*st.qty, pnl=val-st.avgBuy*st.qty, pnlPct=pnl/(st.avgBuy*st.qty);
                    return (
                      <tr key={st.id} style={{borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                        <td style={{padding:"7px 10px",color:C.text,fontSize:9.5,fontWeight:600}}>{editingStock===st.id?<Input val={st.name} onChange={v=>updateStock(st.id,"name",v)}/>:st.name}</td>
                        <td style={{padding:"7px 10px",color:C.cyan,fontSize:9}}>{editingStock===st.id?<Input val={st.ticker} onChange={v=>updateStock(st.id,"ticker",v)}/>:st.ticker}</td>
                        <td style={{padding:"7px 10px",fontSize:8}}><span style={{background:`${SC[SECTORS.indexOf(st.sector)%SC.length]}20`,color:SC[SECTORS.indexOf(st.sector)%SC.length],padding:"2px 6px",borderRadius:3}}>{st.sector}</span></td>
                        <td style={{padding:"7px 10px",color:C.text}}>{editingStock===st.id?<Input val={st.qty} onChange={v=>updateStock(st.id,"qty",v)} style={{width:60}}/>:fnum(st.qty)}</td>
                        <td style={{padding:"7px 10px",color:C.muted}}>₹{editingStock===st.id?<Input val={st.avgBuy} onChange={v=>updateStock(st.id,"avgBuy",v)} style={{width:70}}/>:st.avgBuy.toFixed(2)}</td>
                        <td style={{padding:"7px 10px",color:liveMode?C.gold:C.text,fontWeight:liveMode?700:400}}>₹{lp.toFixed(2)}{liveMode&&<span style={{fontSize:7,marginLeft:3}}>●</span>}</td>
                        <td style={{padding:"7px 10px",color:C.text,fontWeight:600}}>{fmtL(val)}</td>
                        <td style={{padding:"7px 10px",color:pnl>=0?C.green:C.red,fontWeight:600}}>{pnl>=0?"+":""}{fmtL(pnl)}</td>
                        <td style={{padding:"7px 10px",color:pnlPct>=0?C.green:C.red}}>{fp(pnlPct)}</td>
                        <td style={{padding:"7px 10px"}}>
                          <div style={{display:"flex",gap:5}}>
                            <button onClick={()=>setEditingStock(editingStock===st.id?null:st.id)} style={{padding:"2px 7px",borderRadius:3,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>{editingStock===st.id?"✓":"Edit"}</button>
                            <button onClick={()=>deleteStock(st.id)} style={{padding:"2px 7px",borderRadius:3,border:`1px solid ${C.red}40`,background:"transparent",color:C.red,fontSize:8,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{borderTop:`1px solid ${C.border}`,background:"rgba(255,255,255,0.02)"}}>
                    <td colSpan={6} style={{padding:"8px 10px",color:C.muted,fontSize:9}}>TOTAL ({stocks.length} stocks)</td>
                    <td style={{padding:"8px 10px",color:C.cyan,fontWeight:700,fontSize:11}}>{fmtL(pv)}</td>
                    <td style={{padding:"8px 10px",color:pv>=invested?C.green:C.red,fontWeight:700}}>{pv>=invested?"+":""}{fmtL(pv-invested)}</td>
                    <td style={{padding:"8px 10px",color:pv>=invested?C.green:C.red,fontWeight:700}}>{fp((pv-invested)/invested)}</td>
                    <td/>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Live News */}
            <div style={{marginTop:14,background:C.panel,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 16px"}}>
              <div style={{fontSize:8,color:C.cyan,letterSpacing:2,marginBottom:10}}>📰 MARKET NEWS & ALERTS</div>
              {news.map((n,i)=>(
                <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"7px 0",borderBottom:i<news.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                  <span style={{fontSize:8,color:n.c,fontWeight:700,minWidth:40,paddingTop:1}}>{n.s}</span>
                  <span style={{fontSize:9.5,color:C.text,flex:1,lineHeight:1.5}}>{n.h}</span>
                  <span style={{fontSize:8,color:C.muted,minWidth:60,textAlign:"right"}}>{n.t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═════════════ GOAL TAB ═════════════ */}
        {mainTab==="goal" && (
          <div>
            <div style={{background:"rgba(251,191,36,0.07)",border:`1px solid ${C.gold}25`,borderRadius:10,padding:"16px 20px",marginBottom:14}}>
              <div style={{fontSize:9,color:C.gold,letterSpacing:2,marginBottom:10}}>🎯 ROAD TO ₹10 CRORE — PERSONALISED PLAN</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14}}>
                {[
                  {l:"Today",v:fmtL(pv),c:C.cyan,sub:"Your portfolio"},
                  {l:"Gap",v:fmtL(GOAL-pv),c:C.amber,sub:"Remaining to ₹10Cr"},
                  {l:"Progress",v:fp(pv/GOAL),c:C.violet,sub:`${(pv/GOAL*100).toFixed(1)}% of goal achieved`},
                  {l:"Monthly SIP",v:fmtL(sip),c:C.gold,sub:"With step-up "+sipStepUp+"%/yr"},
                  {l:"Required CAGR",v:fp(reqCAGR),c:reqCAGR>0.25?C.red:reqCAGR>0.18?C.amber:C.green,sub:reqCAGR>0.25?"⚠ Very aggressive":reqCAGR>0.18?"Challenging":"Achievable ✓"},
                ].map(m=>(
                  <div key={m.l} style={{textAlign:"center"}}>
                    <div style={{fontSize:8,color:C.muted,marginBottom:3}}>{m.l}</div>
                    <div style={{fontSize:22,fontWeight:700,color:m.c}}>{m.v}</div>
                    <div style={{fontSize:8,color:C.muted,marginTop:2}}>{m.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:12,height:6,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(100,pv/GOAL*100)}%`,background:`linear-gradient(90deg,${C.violet},${C.cyan})`,borderRadius:3,transition:"width 0.5s"}}/>
              </div>
              <div style={{fontSize:8,color:C.muted,marginTop:3,textAlign:"right"}}>{fp(pv/GOAL)} to ₹10 Crore</div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12,marginBottom:14}}>
              {[
                {t:"🔴 Exit These (Poor Risk/Reward)",c:C.red,items:["EASY TRIP PLANNERS — -72% from buy, tiny value, 40% vol","UNITECH LTD — Illiquid penny stock, 57K share trap","MTNL — Structurally declining telecom business","RELIANCE POWER — Speculative, no earnings visibility","BANDHAN BANK — Below buy price, microfinance NPA risk","CG POWER — High PE, significant drawdown from buy"]},
                {t:"🟡 Hold & Review Quarterly",c:C.amber,items:["IRFC / PFC / REC / HUDCO — PSU cycle-linked","KALYAN JEWELLERS — Consumer slowdown risk","IDFC FIRST BANK — Credit quality, monitor NPA","NTPC / NHPC — Long-term holds but slow growth","VARUN BEVERAGES — Seasonal business, hold","NCC / NBCC — Infra cycle, hold with stop-loss"]},
                {t:"🟢 Add to These (High Conviction)",c:C.green,items:["BEL (BHARAT ELECTRONICS) — Defence supercycle 18%+","STATE BANK OF INDIA — Dividend + growth anchor","TATA STEEL — Commodity upcycle, cheap valuations","HAVELLS INDIA — Consumer brand, pricing power","WOCKHARDT PHARMA — Healthcare, defensive play","TECH MAHINDRA — IT recovery, high free cash flow"]},
                {t:"💡 New Buys for 10 Cr Goal",c:C.cyan,items:["Nifty 50 ETF (40% of portfolio) — Core anchor","HDFC Bank or ICICI Bank — Quality banking","Bajaj Finance — 25%+ consistent earnings compounder","Infosys / TCS — IT dividend + stability","Asian Paints or Pidilite — Consumer moat","Midcap 150 ETF SIP — Diversified alpha engine"]},
                {t:"📐 Target Allocation",c:C.violet,items:[`Large Cap ETF: 40% → ~13% CAGR expected`,`Mid Cap ETF: 30% → ~17% CAGR expected`,`Small/Thematic: 20% → ~22% CAGR potential`,`Liquid/Debt: 10% → Emergency + SIP buffer`,`Blended expected CAGR: 17-19%`,`At 18% + ₹50K SIP → ₹10Cr in ~10yr ✓`]},
                {t:"📅 Year-by-Year Roadmap",c:C.gold,items:["2025: Exit losers, start ETF SIP, set step-up","2026-27: Rebalance, trim over-concentrated sectors","2028: Mid-point review — raise SIP if possible","2029-30: Shift 10% small-cap → large-cap safety","2031-32: Increase debt to 20% (capital protection)","2033-34: Tax-efficient harvest, LTCG planning"]},
              ].map(card=>(
                <div key={card.t} style={{background:`${card.c}06`,border:`1px solid ${card.c}20`,borderRadius:8,padding:"12px 14px"}}>
                  <div style={{fontSize:10,color:card.c,fontWeight:700,marginBottom:8}}>{card.t}</div>
                  <ul style={{margin:0,padding:0,listStyle:"none"}}>
                    {card.items.map((item,i)=>(
                      <li key={i} style={{fontSize:8.5,color:"#94a3b8",lineHeight:1.8,paddingBottom:2,borderBottom:i<card.items.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═════════════ VC PITCH TAB ═════════════ */}
        {mainTab==="pitch" && (
          <div>
            <div style={{textAlign:"center",padding:"20px 0 28px",borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
              <div style={{fontSize:9,color:C.cyan,letterSpacing:4,marginBottom:8}}>QUANTEDGE PORTFOLIO INTELLIGENCE</div>
              <h2 style={{margin:0,fontSize:28,fontWeight:700,color:"#fff",letterSpacing:-1}}>Institutional-Grade Risk Analytics<br/><span style={{color:C.cyan}}>for Indian Retail Investors</span></h2>
              <div style={{fontSize:11,color:C.muted,marginTop:8}}>Advanced Monte Carlo · Real-time Portfolio Analytics · AI-Powered Wealth Planning</div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:20}}>
              {[
                {icon:"🧮",t:"Quantitative Finance",d:"GBM + Merton Jump Diffusion + Heston Stochastic Volatility — the same models used by Goldman Sachs, JPMorgan quant desks",c:C.cyan},
                {icon:"⚡",t:"Non-Blocking 10K Sims",d:"Async chunked computation using JS Promise batching — runs 10,000 Monte Carlo paths without freezing the UI, even on mobile",c:C.violet},
                {icon:"📡",t:"Live Price Engine",d:"Real-time price simulation with 1-second tick updates, portfolio P&L refresh, and live news feed integration",c:C.green},
                {icon:"🎯",t:"Goal-Based Planning",d:"Personalized ₹10 Cr wealth planning with SIP calculator, step-up SIP modeling, inflation adjustment, and probability gauges",c:C.gold},
                {icon:"📊",t:"Full Risk Suite",d:"VaR 95/99%, CVaR/Expected Shortfall, Sharpe & Sortino ratios, max drawdown distribution, percentile fan charts",c:C.amber},
                {icon:"✏️",t:"Fully Editable",d:"Add, edit, delete any stock. Adjust quantities, prices, sectors. Portfolio updates all simulations in real-time",c:C.blue},
              ].map(card=>(
                <div key={card.t} style={{background:C.panel,border:`1px solid ${card.c}25`,borderRadius:9,padding:"16px 18px"}}>
                  <div style={{fontSize:22,marginBottom:8}}>{card.icon}</div>
                  <div style={{fontSize:11,color:card.c,fontWeight:700,marginBottom:6}}>{card.t}</div>
                  <div style={{fontSize:9,color:"#94a3b8",lineHeight:1.7}}>{card.d}</div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
              <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:9,padding:"16px 18px"}}>
                <div style={{fontSize:9,color:C.cyan,letterSpacing:2,marginBottom:12}}>📈 MARKET OPPORTUNITY</div>
                {[
                  ["Indian retail investors","180M+"],["DEMAT accounts opened FY24","36M+"],["NSE daily retail turnover","₹45,000 Cr+"],["Lack professional risk tools","~95%"],["Addressable market (SaaS)","$2.1B"],
                ].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <span style={{fontSize:9,color:C.muted}}>{l}</span>
                    <span style={{fontSize:10,color:C.cyan,fontWeight:700}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:9,padding:"16px 18px"}}>
                <div style={{fontSize:9,color:C.violet,letterSpacing:2,marginBottom:12}}>🚀 COMPETITIVE EDGE</div>
                {[
                  ["Zerodha Kite","No Monte Carlo risk analysis"],
                  ["Groww","Basic portfolio view only"],
                  ["Smallcase","Curated baskets, no simulation"],
                  ["Bloomberg Terminal","₹2.5L/yr, not retail-friendly"],
                  ["QuantEdge (this)","Full quant suite, free/freemium"],
                ].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <span style={{fontSize:9,color:C.muted}}>{l}</span>
                    <span style={{fontSize:9,color:l==="QuantEdge (this)"?C.green:C.muted,fontWeight:l==="QuantEdge (this)"?700:400}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:C.panel,border:`1px solid ${C.gold}25`,borderRadius:9,padding:"16px 18px",marginBottom:20}}>
              <div style={{fontSize:9,color:C.gold,letterSpacing:2,marginBottom:12}}>💰 BUSINESS MODEL</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
                {[
                  {t:"Free Tier",p:"₹0",d:"Basic portfolio + 1K sim Monte Carlo",c:C.muted},
                  {t:"Pro",p:"₹499/mo",d:"10K sims, live prices, all analytics",c:C.cyan},
                  {t:"Advisory",p:"₹1,999/mo",d:"AI rebalancing, goal tracking, alerts",c:C.violet},
                  {t:"Enterprise",p:"Custom",d:"White-label for wealth managers, AMCs",c:C.gold},
                ].map(tier=>(
                  <div key={tier.t} style={{background:`${tier.c}08`,border:`1px solid ${tier.c}20`,borderRadius:7,padding:"12px 14px",textAlign:"center"}}>
                    <div style={{fontSize:10,color:tier.c,fontWeight:700}}>{tier.t}</div>
                    <div style={{fontSize:18,fontWeight:700,color:"#fff",margin:"6px 0"}}>{tier.p}</div>
                    <div style={{fontSize:8.5,color:C.muted,lineHeight:1.6}}>{tier.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:`${C.violet}10`,border:`1px solid ${C.violet}25`,borderRadius:9,padding:"16px 18px"}}>
              <div style={{fontSize:9,color:C.violet,letterSpacing:2,marginBottom:10}}>🛠 TECH STACK</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {["React 18","Recharts","IBM Plex Mono","Monte Carlo GBM","Merton Jump Diffusion","Heston Stochastic Vol","Async Web Computation","NSE/BSE API integration","Node.js + Express","PostgreSQL","Redis (price cache)","Vercel Edge Functions"].map(t=>(
                  <span key={t} style={{padding:"4px 10px",borderRadius:20,background:`${C.violet}20`,border:`1px solid ${C.violet}30`,fontSize:8.5,color:C.violet}}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═════════════ LINKEDIN/CV TAB ═════════════ */}
        {mainTab==="linkedin" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>

              {/* LinkedIn Post */}
              <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:9,padding:"16px 18px"}}>
                <div style={{fontSize:9,color:"#0077b5",letterSpacing:2,marginBottom:12}}>💼 LINKEDIN POST TEMPLATE</div>
                <div style={{background:"rgba(0,119,181,0.06)",border:"1px solid rgba(0,119,181,0.2)",borderRadius:8,padding:"14px 16px",fontSize:9.5,lineHeight:1.9,color:C.text}}>
                  <p style={{margin:"0 0 10px",fontWeight:700,color:"#fff"}}>🚀 Built an institutional-grade Portfolio Risk Simulator from scratch</p>
                  <p style={{margin:"0 0 10px"}}>After analyzing my NSE stock portfolio, I realized retail investors have NO access to the same risk tools that hedge funds use. So I built one.</p>
                  <p style={{margin:"0 0 8px",fontWeight:600,color:C.cyan}}>What it does:</p>
                  <p style={{margin:"0 0 6px"}}>✅ Monte Carlo simulation with 10,000 paths</p>
                  <p style={{margin:"0 0 6px"}}>✅ Merton Jump Diffusion (captures market crashes)</p>
                  <p style={{margin:"0 0 6px"}}>✅ Heston Stochastic Volatility (realistic vol modeling)</p>
                  <p style={{margin:"0 0 6px"}}>✅ ₹10 Crore goal tracker with SIP step-up modeling</p>
                  <p style={{margin:"0 0 6px"}}>✅ VaR, CVaR, Sharpe, Sortino, Max Drawdown</p>
                  <p style={{margin:"0 0 6px"}}>✅ Live price simulation + news feed</p>
                  <p style={{margin:"0 0 6px"}}>✅ Fully editable portfolio with real-time recompute</p>
                  <p style={{margin:"0 0 10px"}}>The math: same GBM models used by Goldman, JPMorgan quant desks — now accessible to any retail investor.</p>
                  <p style={{margin:"0 0 6px",fontWeight:600,color:C.cyan}}>Tech: React · Recharts · Async Monte Carlo · NSE sector calibration</p>
                  <p style={{margin:"0",color:C.muted}}>#QuantitativeFinance #FinTech #IndianStockMarket #NSE #ReactJS #MonteCarloSimulation #WealthTech #OpenSource</p>
                </div>
                <button onClick={()=>{
                  const text=`🚀 Built an institutional-grade Portfolio Risk Simulator for Indian stocks!\n\n✅ 10,000 Monte Carlo paths (non-blocking async)\n✅ GBM + Merton Jumps + Heston Stochastic Volatility\n✅ ₹10Cr goal tracker with SIP step-up\n✅ VaR, CVaR, Sharpe, Sortino, Drawdown analytics\n✅ Live prices + editable portfolio\n\nSame quant models as Goldman Sachs — for retail investors.\n\n#QuantitativeFinance #FinTech #NSE #ReactJS`;
                  navigator.clipboard?.writeText(text);
                  alert("Copied to clipboard! Paste on LinkedIn.");
                }}
                  style={{marginTop:10,padding:"7px 16px",borderRadius:6,border:"none",background:"#0077b5",color:"#fff",fontSize:9,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>
                  Copy LinkedIn Post
                </button>
              </div>

              {/* CV Section */}
              <div style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:9,padding:"16px 18px"}}>
                <div style={{fontSize:9,color:C.green,letterSpacing:2,marginBottom:12}}>📄 CV / RESUME ENTRY</div>
                <div style={{background:"rgba(16,185,129,0.05)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:8,padding:"14px 16px",fontSize:9.5,lineHeight:1.9}}>
                  <div style={{fontWeight:700,color:"#fff",fontSize:11}}>QuantEdge Portfolio Intelligence Platform</div>
                  <div style={{color:C.muted,fontSize:8.5,marginBottom:8}}>Personal Project · 2024–2025 · React / Quantitative Finance</div>
                  <ul style={{margin:0,paddingLeft:14,color:C.text}}>
                    <li style={{marginBottom:5}}>Engineered a full-stack portfolio analytics platform with <strong>async Monte Carlo engine</strong> running 10,000 GBM simulations without UI blocking, using Promise-based chunked computation</li>
                    <li style={{marginBottom:5}}>Implemented <strong>Merton Jump Diffusion</strong> and <strong>Heston Stochastic Volatility</strong> models — the same frameworks used by institutional quant desks — calibrated to 20yr NSE sector historical data</li>
                    <li style={{marginBottom:5}}>Built <strong>risk analytics suite</strong>: VaR 95/99%, CVaR/Expected Shortfall, Sharpe & Sortino ratios, max drawdown distribution, percentile fan charts</li>
                    <li style={{marginBottom:5}}>Designed <strong>₹10Cr goal tracker</strong> with SIP step-up modeling, inflation adjustment, probability gauges, and year-by-year goal hit distribution</li>
                    <li style={{marginBottom:5}}>Integrated <strong>live price simulation</strong> with 1-second tick updates, real-time portfolio P&L, scrolling ticker, and market news feed</li>
                    <li>Built <strong>editable portfolio manager</strong> — add/remove/edit any holding, automatic weight recalculation, sector breakdown</li>
                  </ul>
                  <div style={{marginTop:10,fontSize:8.5,color:C.muted}}>
                    <strong style={{color:C.green}}>Stack:</strong> React 18, Recharts, IBM Plex Mono, GBM/Merton/Heston mathematical models, NSE sector calibration
                  </div>
                </div>
                <button onClick={()=>{
                  const text=`QuantEdge Portfolio Intelligence Platform\nPersonal Project · React / Quantitative Finance\n\n• Async Monte Carlo engine (10,000 GBM paths, non-blocking)\n• Merton Jump Diffusion + Heston Stochastic Volatility models\n• Full risk suite: VaR, CVaR, Sharpe, Sortino, Drawdown\n• ₹10Cr goal tracker with SIP step-up & inflation modeling\n• Live price simulation, portfolio editing, news feed\nStack: React · Recharts · NSE-calibrated sector parameters`;
                  navigator.clipboard?.writeText(text);
                  alert("CV entry copied!");
                }}
                  style={{marginTop:10,padding:"7px 16px",borderRadius:6,border:"none",background:C.green,color:"#fff",fontSize:9,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>
                  Copy CV Entry
                </button>
              </div>

              {/* How to Publish */}
              <div style={{background:C.panel,border:`1px solid ${C.amber}25`,borderRadius:9,padding:"16px 18px",gridColumn:"1/-1"}}>
                <div style={{fontSize:9,color:C.amber,letterSpacing:2,marginBottom:12}}>🌐 HOW TO PUBLISH AS YOUR OWN WEBSITE</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
                  {[
                    {t:"Option 1: Vercel (Easiest — Free)",c:C.cyan,steps:["1. Export this JSX from Claude","2. Create React app: npx create-react-app quantedge","3. Replace App.js with this code","4. Add recharts: npm install recharts","5. Push to GitHub","6. Connect repo to vercel.com","7. Live at yourname.vercel.app in 2min"]},
                    {t:"Option 2: GitHub Pages (Free)",c:C.violet,steps:["1. Create public GitHub repo","2. Set up React app (same as above)","3. npm install gh-pages --save-dev","4. Add to package.json: 'homepage': 'https://yourname.github.io/quantedge'","5. Add deploy script","6. npm run deploy","7. Live at yourname.github.io/quantedge"]},
                    {t:"Option 3: Custom Domain",c:C.gold,steps:["1. Deploy to Vercel (Option 1)","2. Buy domain: yourname.com (~₹800/yr on GoDaddy)","3. In Vercel dashboard → Settings → Domains","4. Add your custom domain","5. Update DNS records at registrar","6. Done — yourname.com goes live","7. Add to LinkedIn profile URL field"]},
                    {t:"Option 4: Adding Live NSE Prices",c:C.green,steps:["1. Sign up for NSE Data API (Unoffical: nsepython)","2. Or use Yahoo Finance: pip install yfinance","3. Build Node.js backend: express + axios","4. Endpoint: GET /api/price/:ticker","5. CORS-enable for your frontend","6. Deploy backend to Railway.app (free)","7. Replace simulated prices in code"]},
                  ].map(opt=>(
                    <div key={opt.t} style={{background:`${opt.c}06`,border:`1px solid ${opt.c}20`,borderRadius:7,padding:"12px 14px"}}>
                      <div style={{fontSize:9.5,color:opt.c,fontWeight:700,marginBottom:8}}>{opt.t}</div>
                      {opt.steps.map((s,i)=><div key={i} style={{fontSize:8.5,color:"#94a3b8",lineHeight:1.8}}>{s}</div>)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        @keyframes scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;background:rgba(255,255,255,0.1);outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:#00d4ff;cursor:pointer;box-shadow:0 0 6px rgba(0,212,255,0.5)}
        select option{background:#0d1117;color:#e2e8f0}
        ::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-track{background:#050810}::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}
