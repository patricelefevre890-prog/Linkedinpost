import React, { useState, useRef, useCallback } from "react";

const BRAND = {
  green: "#00B82B", greenDark: "#009622", black: "#0A0A0A", white: "#FFFFFF",
  gray50: "#F9FAFB", gray100: "#F3F4F6", gray200: "#E5E7EB",
  gray400: "#9CA3AF", gray600: "#4B5563", gray800: "#1F2937",
};

const LAYOUTS = [
  "hero-centered","diagonal-split","sidebar-accent",
  "top-bar","bottom-accent","frame-border","full-green-inverse","grid-minimal",
];

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateVisualConfig(visualData) {
  return {
    layout: pickRandom(LAYOUTS),
    headlineSize: pickRandom([44, 52, 60, 68]),
    padding: pickRandom([48, 56, 64]),
    content: {
      headline: visualData?.headline || "Votre titre ici",
      subheadline: visualData?.subheadline || "",
      points: visualData?.points || [],
    },
    decorative: {
      showCircle: Math.random() > 0.4,
      showDots: Math.random() > 0.5,
      circleSize: pickRandom([100, 140, 180]),
      circlePos: pickRandom(["top-right", "bottom-left", "bottom-right"]),
    },
  };
}

function splitText(text, maxChars) {
  if (!text) return [""];
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = (current + " " + word).trim();
    if (candidate.length <= maxChars) { current = candidate; }
    else { if (current) lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function LinkedInVisual({ config, svgRef }) {
  if (!config) return null;
  const W = 1200, H = 627;
  const { layout, headlineSize: hs, padding, content, decorative } = config;
  const isDark = ["hero-centered","full-green-inverse","bottom-accent"].includes(layout);
  const isGreen = ["hero-centered","full-green-inverse"].includes(layout);

  const circleEl = decorative.showCircle ? (() => {
    const s = decorative.circleSize;
    const pos = decorative.circlePos;
    const cx = pos.includes("right") ? W - s * 0.3 : s * 0.3;
    const cy = pos.includes("top") ? s * 0.3 : H - s * 0.3;
    const fill = isGreen ? "rgba(0,0,0,0.1)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,184,43,0.07)";
    return <circle cx={cx} cy={cy} r={s} fill={fill}/>;
  })() : null;

  const dotsEl = decorative.showDots ? (() => {
    const fillColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,184,43,0.2)";
    const dots = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++)
      dots.push(<circle key={`${r}-${c}`} cx={W-110+c*20} cy={H-90+r*20} r={2.5} fill={fillColor}/>);
    return <>{dots}</>;
  })() : null;

  const headlines = splitText(content.headline, 28);
  const points = content.points || [];

  const renderDataLayout = () => {
    const textColor = isDark ? BRAND.white : BRAND.black;
    const textMuted = isDark ? "rgba(255,255,255,0.5)" : BRAND.gray600;
    const cardBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,184,43,0.04)";
    const headlineLines = splitText(content.headline, 22);
    const headY = 160;
    return <>
      <rect width={W} height={H} fill={isDark ? BRAND.black : BRAND.white}/>
      {isDark && <rect width={W} height={8} fill={BRAND.green}/>}
      {circleEl}
      <text x={64} y={isDark ? 80 : 60} fontFamily="Inter,sans-serif" fontWeight={700} fontSize={13} fill={BRAND.green} letterSpacing="2">
        {content.subheadline?.toUpperCase() || "LINKEDIN CONTENT"}
      </text>
      <rect x={64} y={isDark ? 94 : 74} width={48} height={3} fill={BRAND.green} rx={2}/>
      {headlineLines.map((line, i) => (
        <text key={i} x={64} y={headY + i * hs * 1.15} fontFamily="Inter,sans-serif" fontWeight={900} fontSize={hs} fill={i === headlineLines.length - 1 ? BRAND.green : textColor} letterSpacing="-2">
          {line}
        </text>
      ))}
      <line x1={560} y1={50} x2={560} y2={570} stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"} strokeWidth={1}/>
      {points.slice(0, 3).map((pt, i) => {
        const cardY = 50 + i * 178;
        return (
          <g key={i}>
            <rect x={592} y={cardY} width={572} height={158} rx={10} fill={cardBg}/>
            <rect x={592} y={cardY} width={5} height={158} rx={2} fill={BRAND.green}/>
            <text x={620} y={cardY + 58} fontFamily="Inter,sans-serif" fontWeight={900} fontSize={52} fill={BRAND.green}>{pt.stat}</text>
            <text x={620} y={cardY + 92} fontFamily="Inter,sans-serif" fontWeight={600} fontSize={17} fill={textColor}>{pt.label}</text>
            <text x={620} y={cardY + 118} fontFamily="Inter,sans-serif" fontWeight={400} fontSize={13} fill={textMuted}>{pt.source}</text>
          </g>
        );
      })}
      <rect x={0} y={578} width={W} height={49} fill={isDark ? "rgba(0,184,43,0.1)" : "rgba(0,184,43,0.06)"}/>
      <rect x={0} y={578} width={W} height={2} fill={BRAND.green}/>
      <text x={64} y={607} fontFamily="Inter,sans-serif" fontWeight={600} fontSize={13} fill={isDark ? "rgba(255,255,255,0.55)" : BRAND.gray600}>
        {points.length > 0 ? `Sources : ${points.map(p => p.source).join(" · ")}` : content.headline}
      </text>
    </>;
  };

  if (points.length > 0) {
    return (
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"auto", display:"block" }}>
        <defs><style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style></defs>
        {renderDataLayout()}
      </svg>
    );
  }

  const tsEls = (x) => headlines.map((l, i) =>
    <tspan key={i} x={x} dy={i===0 ? 0 : hs*1.2}>{l}</tspan>
  );

  const renderClassicLayout = () => {
    switch(layout) {
      case "hero-centered": {
        const y0 = H/2 - hs*headlines.length/2 - 30;
        const subY = y0 + headlines.length*hs*1.2 + 30;
        return <>
          <rect width={W} height={H} fill={BRAND.green}/>
          {circleEl}{dotsEl}
          <line x1={padding} y1={H/2-15} x2={W-padding} y2={H/2-15} stroke="rgba(255,255,255,0.2)" strokeWidth={1}/>
          <text x={W/2} y={y0} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={800} fontSize={hs} fill={BRAND.white} letterSpacing="-1">{tsEls(W/2)}</text>
          <rect x={W/2-30} y={subY-10} width={60} height={3} fill="rgba(255,255,255,0.5)" rx={2}/>
          {content.subheadline && <text x={W/2} y={subY+30} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={400} fontSize={22} fill="rgba(255,255,255,0.85)">{content.subheadline}</text>}
        </>;
      }
      case "sidebar-accent": {
        const sw = 12;
        const textY = H/2 - (headlines.length*hs*1.15)/2 - 20;
        return <>
          <rect width={W} height={H} fill={BRAND.white}/>
          <rect width={sw} height={H} fill={BRAND.green}/>
          <circle cx={sw+50} cy={H/2} r={80} fill="rgba(0,184,43,0.05)"/>
          {circleEl}{dotsEl}
          <text x={sw+100} y={textY} fontFamily="Inter,sans-serif" fontWeight={900} fontSize={hs} fill={BRAND.black} letterSpacing="-1">{tsEls(sw+100)}</text>
          {content.subheadline && <text x={sw+100} y={textY+headlines.length*hs*1.15+35} fontFamily="Inter,sans-serif" fontWeight={400} fontSize={21} fill={BRAND.gray600}>{content.subheadline}</text>}
        </>;
      }
      case "bottom-accent": {
        const textY = H/2 - (headlines.length*hs*1.2)/2 - 20;
        return <>
          <rect width={W} height={H} fill={BRAND.black}/>
          <rect y={H-8} width={W} height={8} fill={BRAND.green}/>
          {circleEl}{dotsEl}
          <text x={padding} y={textY} fontFamily="Inter,sans-serif" fontWeight={900} fontSize={hs} fill={BRAND.white} letterSpacing="-1">{tsEls(padding)}</text>
          {content.subheadline && <text x={padding} y={textY+headlines.length*hs*1.2+35} fontFamily="Inter,sans-serif" fontWeight={400} fontSize={22} fill="rgba(255,255,255,0.7)">{content.subheadline}</text>}
        </>;
      }
      case "frame-border": {
        const ins = 20;
        const textY = H/2 - (headlines.length*hs*1.2)/2 - 20;
        return <>
          <rect width={W} height={H} fill={BRAND.white}/>
          <rect x={ins} y={ins} width={W-ins*2} height={H-ins*2} fill="none" stroke={BRAND.green} strokeWidth={6} rx={4}/>
          {circleEl}
          <text x={W/2} y={textY} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={800} fontSize={hs} fill={BRAND.black} letterSpacing="-1">{tsEls(W/2)}</text>
          <rect x={W/2-50} y={textY+headlines.length*hs*1.2+12} width={100} height={3} fill={BRAND.green} rx={2}/>
          {content.subheadline && <text x={W/2} y={textY+headlines.length*hs*1.2+50} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={400} fontSize={22} fill={BRAND.gray600}>{content.subheadline}</text>}
        </>;
      }
      case "full-green-inverse": {
        const textY = H/2 - (headlines.length*hs*1.15)/2 - 20;
        return <>
          <rect width={W} height={H} fill={BRAND.green}/>
          <rect x={40} y={40} width={W-80} height={H-80} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2} rx={4}/>
          {circleEl}{dotsEl}
          <text x={W/2} y={textY} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={900} fontSize={hs} fill={BRAND.white} letterSpacing="-2">{tsEls(W/2)}</text>
          {content.subheadline && <text x={W/2} y={textY+headlines.length*hs*1.15+40} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={400} fontSize={24} fill="rgba(255,255,255,0.85)">{content.subheadline}</text>}
        </>;
      }
      default: {
        const textY = H/2 - (headlines.length*hs*1.2)/2 - 20;
        return <>
          <rect width={W} height={H} fill={BRAND.white}/>
          <rect width={W} height={10} fill={BRAND.green}/>
          {circleEl}{dotsEl}
          <text x={W/2} y={textY} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={800} fontSize={hs} fill={BRAND.black} letterSpacing="-1">{tsEls(W/2)}</text>
          <rect x={W/2-45} y={textY+headlines.length*hs*1.2+15} width={90} height={4} fill={BRAND.green} rx={2}/>
          {content.subheadline && <text x={W/2} y={textY+headlines.length*hs*1.2+56} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={400} fontSize={22} fill={BRAND.gray600}>{content.subheadline}</text>}
        </>;
      }
    }
  };

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"auto", display:"block" }}>
      <defs><style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style></defs>
      {renderClassicLayout()}
    </svg>
  );
}

async function callClaude(subject, context, documentText, tone, url) {
  const res = await fetch("/.netlify/functions/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, context, documentText, tone, url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Erreur ${res.status}`);
  }
  return res.json();
}

function formatPost(post) {
  if (!post) return "";
  const parts = [
    post.emoji ? `${post.emoji} ${post.hook}` : post.hook,
    "",
    post.body,
    "",
    post.hashtags?.map(h => `#${h.replace(/^#/, "")}`).join(" ") || "",
  ];
  if (post.sources && post.sources.length > 0) {
    parts.push("");
    parts.push("──");
    parts.push("Sources : " + post.sources.join(" · "));
  }
  return parts.filter(p => p !== undefined).join("\n");
}

export default function App() {
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [url, setUrl] = useState("");
  const [tone, setTone] = useState("professionnel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [visualConfig, setVisualConfig] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState("form");
  const svgRef = useRef(null);
  const fileRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("Fichier trop volumineux (max 5 MB)."); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setDocumentText(e.target.result?.substring(0, 3000) || "");
    reader.readAsText(file);
  }, []);

  const handleGenerate = async () => {
    if (!subject.trim() || subject.trim().length < 5) { setError("Le sujet doit contenir au moins 5 caractères."); return; }
    setError(""); setLoading(true); setResult(null); setVisualConfig(null);
    try {
      const data = await callClaude(subject, context, documentText, tone, url);
      setResult({ post: formatPost(data.post), rawData: data });
      setVisualConfig(generateVisualConfig(data.visual));
      setStep("result");
    } catch (err) {
      setError(err.message || "Erreur lors de la génération. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const resetToForm = () => { setStep("form"); setResult(null); setVisualConfig(null); setError(""); };

  if (step === "result" && result && visualConfig) {
    return (
      <div style={{ minHeight:"100vh", background:"#F4F5F7", fontFamily:"'Inter',-apple-system,sans-serif" }}>
        <Header/>
        <main style={{ maxWidth:1060, margin:"0 auto", padding:"32px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
            <div>
              <button onClick={resetToForm} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#4B5563", fontFamily:"inherit", padding:0, marginBottom:6 }}>← Nouvelle génération</button>
              <h2 style={{ margin:0, fontSize:26, fontWeight:900, letterSpacing:"-0.5px" }}>Votre contenu est prêt 🎉</h2>
            </div>
            <div style={{ background:"rgba(0,184,43,0.08)", border:"1px solid rgba(0,184,43,0.2)", borderRadius:20, padding:"7px 14px", fontSize:12, fontWeight:600, color:"#009622" }}>✓ Claude Haiku</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"start" }}>
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#1F2937", textTransform:"uppercase", letterSpacing:"0.6px" }}>Visuel LinkedIn</span>
                <span style={{ fontSize:10, background:"#F3F4F6", padding:"3px 8px", borderRadius:5, color:"#6B7280", fontWeight:600 }}>{visualConfig.layout}</span>
              </div>
              <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #E5E7EB", boxShadow:"0 4px 16px rgba(0,0,0,0.07)" }}>
                <LinkedInVisual config={visualConfig} svgRef={svgRef}/>
              </div>
              <button onClick={() => setVisualConfig(generateVisualConfig(result.rawData.visual))} style={{ width:"100%", marginTop:10, padding:"11px 14px", background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer", fontFamily:"inherit" }}>🔄 Nouveau layout</button>
            </div>

            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#1F2937", textTransform:"uppercase", letterSpacing:"0.6px" }}>Post LinkedIn</span>
                <span style={{ fontSize:11, color:"#9CA3AF" }}>{result.post.length} car.</span>
              </div>
              <div style={{ background:"#fff", borderRadius:12, border:"1px solid #E5E7EB", overflow:"hidden" }}>
                <div style={{ padding:"14px 18px", borderBottom:"1px solid #E5E7EB", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#00B82B,#009622)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:15, flexShrink:0 }}>V</div>
                  <div>
                    <p style={{ margin:0, fontWeight:600, fontSize:13 }}>Votre Nom</p>
                    <p style={{ margin:0, fontSize:11, color:"#9CA3AF" }}>Votre titre · Maintenant</p>
                  </div>
                </div>
                <div style={{ padding:"18px", fontSize:13, lineHeight:1.75, whiteSpace:"pre-wrap", maxHeight:340, overflowY:"auto", color:"#1F2937", fontFamily:"inherit" }}>{result.post}</div>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(result.post).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }); }} style={{ width:"100%", marginTop:10, padding:"13px 18px", border:"none", borderRadius:9, fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer", fontFamily:"inherit", background: copied ? BRAND.greenDark : BRAND.green, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                {copied ? "✓ Copié !" : "📋 Copier le post"}
              </button>

              {result.rawData?.post?.hashtags && (
                <div style={{ marginTop:14 }}>
                  <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.5px" }}>Hashtags</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                    {result.rawData.post.hashtags.map((h, i) => (
                      <span key={i} style={{ background:"rgba(0,184,43,0.08)", color:"#009622", padding:"4px 11px", borderRadius:20, fontSize:12, fontWeight:600, border:"1px solid rgba(0,184,43,0.2)" }}>#{h.replace(/^#/,"")}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.rawData?.post?.sources && result.rawData.post.sources.length > 0 && (
                <div style={{ marginTop:14, background:"#F9FAFB", border:"1px solid #E5E7EB", borderRadius:10, padding:"12px 14px" }}>
                  <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.5px" }}>Sources</p>
                  {result.rawData.post.sources.map((s, i) => (
                    <p key={i} style={{ margin: i > 0 ? "4px 0 0" : 0, fontSize:12, color:"#4B5563", lineHeight:1.5 }}>· {s}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign:"center", marginTop:36 }}>
            <button onClick={resetToForm} style={{ padding:"13px 28px", background:BRAND.black, color:"#fff", border:"none", borderRadius:11, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✨ Créer un nouveau post</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#F4F5F7", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <Header/>
      <main style={{ maxWidth:640, margin:"0 auto", padding:"32px 20px" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <h1 style={{ fontSize:36, fontWeight:900, letterSpacing:"-1.5px", lineHeight:1.1, margin:"0 0 10px" }}>Créez du contenu LinkedIn<br/><span style={{ color:BRAND.green }}>qui convertit</span></h1>
          <p style={{ fontSize:16, color:"#4B5563", margin:0 }}>Visuel professionnel + post sourcé en quelques secondes</p>
        </div>

        <div style={{ background:"#fff", borderRadius:18, border:"1px solid #E5E7EB", padding:36, boxShadow:"0 4px 20px rgba(0,0,0,0.05)" }}>

          <div style={{ marginBottom:22 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#1F2937", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.6px" }}>Sujet du post *</label>
            <textarea value={subject} onChange={e => setSubject(e.target.value.substring(0,500))} placeholder="Ex: L'importance de la musique dans un bar..." rows={3} style={{ width:"100%", padding:"12px 14px", border:`1.5px solid ${subject.length>0?BRAND.green:"#E5E7EB"}`, borderRadius:10, outline:"none", resize:"vertical", fontFamily:"inherit", fontSize:14, boxSizing:"border-box", lineHeight:1.6 }}/>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:5, fontSize:11 }}>
              <span style={{ color: subject.length<5?"#EF4444":"#9CA3AF" }}>{subject.length<5?"Minimum 5 caractères":"✓ Parfait !"}</span>
              <span style={{ color:"#9CA3AF" }}>{subject.length}/500</span>
            </div>
          </div>

          <div style={{ marginBottom:22 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#1F2937", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.6px" }}>Ton du post</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[["professionnel","💼","Professionnel"],["inspirant","✨","Inspirant"],["éducatif","📚","Éducatif"],["storytelling","🎯","Storytelling"]].map(([v,ic,lb]) => (
                <button key={v} onClick={() => setTone(v)} style={{ padding:"9px 16px", borderRadius:9, fontSize:13, fontWeight:600, border:`2px solid ${tone===v?BRAND.green:"#E5E7EB"}`, background: tone===v?"rgba(0,184,43,0.06)":"#fff", color: tone===v?"#009622":"#4B5563", cursor:"pointer", fontFamily:"inherit" }}>{ic} {lb}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:22 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#1F2937", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.6px" }}>URL de référence (optionnel)</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔗</span>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://exemple.com/article..." style={{ width:"100%", padding:"12px 14px 12px 36px", border:`1.5px solid ${url?BRAND.green:"#E5E7EB"}`, borderRadius:10, outline:"none", fontFamily:"inherit", fontSize:14, boxSizing:"border-box" }}/>
            </div>
            {url && <p style={{ margin:"5px 0 0", fontSize:11, color:BRAND.green }}>✓ Le contenu de cette page sera analysé</p>}
          </div>

          <div style={{ marginBottom:22 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#1F2937", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.6px" }}>Document de référence (optionnel)</label>
            <div onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }} style={{ border:`2px dashed ${dragOver||fileName?BRAND.green:"#E5E7EB"}`, borderRadius:12, padding:"20px", background: dragOver||fileName?"rgba(0,184,43,0.04)":"#F9FAFB", cursor:"pointer", textAlign:"center" }}>
              {fileName ? <div><span style={{ fontSize:20 }}>📄</span><p style={{ margin:"8px 0 0", fontSize:14, fontWeight:600, color:BRAND.green }}>{fileName}</p><p style={{ margin:"4px 0 0", fontSize:12, color:"#9CA3AF" }}>{documentText.length} caractères</p></div>
              : <div><span style={{ fontSize:26 }}>📎</span><p style={{ margin:"8px 0 4px", fontSize:14, fontWeight:500, color:"#4B5563" }}>Glissez ou cliquez</p><p style={{ margin:0, fontSize:12, color:"#9CA3AF" }}>TXT, MD (max 5 MB)</p></div>}
              <input ref={fileRef} type="file" accept=".txt,.md" onChange={e => handleFile(e.target.files[0])} style={{ display:"none" }}/>
            </div>
          </div>

          <div style={{ marginBottom:32 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#1F2937", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.6px" }}>Contexte additionnel (optionnel)</label>
            <input type="text" value={context} onChange={e => setContext(e.target.value)} placeholder="Ex: Cible gérants de bar, angle chiffre d'affaires..." style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #E5E7EB", borderRadius:10, outline:"none", fontFamily:"inherit", fontSize:14, boxSizing:"border-box" }}/>
          </div>

          {error && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"12px 16px", marginBottom:18, fontSize:13, color:"#DC2626" }}>⚠️ {error}</div>}

          <button onClick={handleGenerate} disabled={loading || subject.trim().length < 5} style={{ width:"100%", padding:"16px 24px", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor: loading||subject.trim().length<5?"not-allowed":"pointer", fontFamily:"inherit", background: loading||subject.trim().length<5?"#E5E7EB":BRAND.green, color: loading||subject.trim().length<5?"#9CA3AF":"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {loading ? <><Spinner/> Génération en cours...</> : "✨ Générer le contenu LinkedIn"}
          </button>
          <p style={{ textAlign:"center", fontSize:11, color:"#9CA3AF", margin:"10px 0 0" }}>Claude Haiku · ~$0.0008 par génération</p>
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header style={{ background:"#fff", borderBottom:"1px solid #E5E7EB", padding:"0 32px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, fontFamily:"'Inter',sans-serif" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:30, height:30, background:"#00B82B", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:16 }}>in</div>
        <span style={{ fontWeight:800, fontSize:15 }}>LinkedIn <span style={{ color:"#00B82B" }}>Generator</span></span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, background:"#F3F4F6", borderRadius:20, padding:"5px 12px", fontSize:12, fontWeight:600, color:"#4B5563" }}>
        <div style={{ width:7, height:7, background:"#00B82B", borderRadius:"50%" }}/>
        Claude Haiku · Coûts optimisés
      </div>
    </header>
  );
}

function Spinner() {
  return <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ animation:"spin 0.8s linear infinite" }}><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style><circle cx={12} cy={12} r={10} stroke="rgba(255,255,255,0.3)" strokeWidth={3}/><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth={3} strokeLinecap="round"/></svg>;
}
