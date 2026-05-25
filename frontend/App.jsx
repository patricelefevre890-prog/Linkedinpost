import { useState, useRef, useCallback } from "react";

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
      keyPoint: visualData?.keyPoint || "",
      stat: visualData?.stat || null,
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
  const isBlack = layout === "bottom-accent";

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

  const renderLayout = () => {
    const tsEls = (x, baseY) => headlines.map((l, i) =>
      <tspan key={i} x={x} dy={i===0 ? 0 : hs*1.2}>{l}</tspan>
    );

    switch(layout) {
      case "hero-centered": {
        const y0 = H/2 - hs*headlines.length/2 - 30;
        const subY = y0 + headlines.length*hs*1.2 + 30;
        return <>
          <rect width={W} height={H} fill={BRAND.green}/>
          {circleEl}{dotsEl}
          <line x1={padding} y1={H/2-15} x2={W-padding} y2={H/2-15} stroke="rgba(255,255,255,0.2)" strokeWidth={1}/>
          <text x={W/2} y={y0} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={800} fontSize={hs} fill={BRAND.white} letterSpacing="-1">{tsEls(W/2, y0)}</text>
          <rect x={W/2-30} y={subY-10} width={60} height={3} fill="rgba(255,255,255,0.5)" rx={2}/>
          {content.subheadline && <text x={W/2} y={subY+30} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={400} fontSize={22} fill="rgba(255,255,255,0.85)">{content.subheadline}</text>}
          {content.keyPoint && <><rect x={W/2-200} y={H-100} width={400} height={44} rx={22} fill="rgba(0,0,0,0.2)"/><text x={W/2} y={H-73} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={600} fontSize={16} fill={BRAND.white}>{content.keyPoint}</text></>}
        </>;
      }
      case "diagonal-split": {
        const sx = W*0.42, ang = 40;
        const textY = H/2 - (headlines.length*hs*0.85*1.15)/2 - 20;
        return <>
          <rect width={W} height={H} fill={BRAND.white}/>
          <polygon points={`0,0 ${sx},0 ${sx-ang},${H} 0,${H}`} fill={BRAND.green}/>
          {circleEl}{dotsEl}
          <text x="45" y="115" fontFamily="Inter,sans-serif" fontWeight={700} fontSize={16} fill="rgba(255,255,255,0.7)">INSIGHT</text>
          <rect x="45" y="128" width={35} height={3} fill={BRAND.white} rx={2}/>
          <text x={sx+60} y={textY} fontFamily="Inter,sans-serif" fontWeight={800} fontSize={hs*0.85} fill={BRAND.black} letterSpacing="-0.5">{tsEls(sx+60, textY)}</text>
          {content.subheadline && <text x={sx+60} y={textY+headlines.length*hs*0.85*1.15+35} fontFamily="Inter,sans-serif" fontWeight={400} fontSize={20} fill={BRAND.gray600}>{content.subheadline}</text>}
          {content.stat && <><text x="65" y={H/2+15} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={900} fontSize={48} fill={BRAND.white}>{content.stat.split(" ")[0]}</text><text x="65" y={H/2+45} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={400} fontSize={13} fill="rgba(255,255,255,0.8)">{content.stat.split(" ").slice(1).join(" ")}</text></>}
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
          <text x={sw+100} y={textY} fontFamily="Inter,sans-serif" fontWeight={900} fontSize={hs} fill={BRAND.black} letterSpacing="-1">{tsEls(sw+100, textY)}</text>
          {content.subheadline && <text x={sw+100} y={textY+headlines.length*hs*1.15+35} fontFamily="Inter,sans-serif" fontWeight={400} fontSize={21} fill={BRAND.gray600}>{content.subheadline}</text>}
          {content.keyPoint && <><rect x={sw+100} y={H-112} width={W-sw-200} height={2} fill={BRAND.gray200} rx={1}/><text x={sw+100} y={H-72} fontFamily="Inter,sans-serif" fontWeight={600} fontSize={18} fill={BRAND.green}>→ {content.keyPoint}</text></>}
        </>;
      }
      case "top-bar": {
        const textY = H/2 - (headlines.length*hs*1.2)/2 - 20;
        return <>
          <rect width={W} height={H} fill={BRAND.white}/>
          <rect width={W} height={10} fill={BRAND.green}/>
          {circleEl}{dotsEl}
          <text x={W/2} y={textY} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={800} fontSize={hs} fill={BRAND.black} letterSpacing="-1">{tsEls(W/2, textY)}</text>
          <rect x={W/2-45} y={textY+headlines.length*hs*1.2+15} width={90} height={4} fill={BRAND.green} rx={2}/>
          {content.subheadline && <text x={W/2} y={textY+headlines.length*hs*1.2+56} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={400} fontSize={22} fill={BRAND.gray600}>{content.subheadline}</text>}
        </>;
      }
      case "bottom-accent": {
        const textY = H/2 - (headlines.length*hs*1.2)/2 - 20;
        return <>
          <rect width={W} height={H} fill={BRAND.black}/>
          <rect y={H-8} width={W} height={8} fill={BRAND.green}/>
          {circleEl}{dotsEl}
          <text x={padding} y={textY} fontFamily="Inter,sans-serif" fontWeight={900} fontSize={hs} fill={BRAND.white} letterSpacing="-1">{tsEls(padding, textY)}</text>
          {content.subheadline && <text x={padding} y={textY+headlines.length*hs*1.2+35} fontFamily="Inter,sans-serif" fontWeight={400} fontSize={22} fill="rgba(255,255,255,0.7)">{content.subheadline}</text>}
          {content.keyPoint && <text x={padding} y={H-28} fontFamily="Inter,sans-serif" fontWeight={600} fontSize={18} fill={BRAND.green}>{content.keyPoint}</text>}
        </>;
      }
      case "frame-border": {
        const ins = 20;
        const textY = H/2 - (headlines.length*hs*1.2)/2 - 20;
        return <>
          <rect width={W} height={H} fill={BRAND.white}/>
          <rect x={ins} y={ins} width={W-ins*2} height={H-ins*2} fill="none" stroke={BRAND.green} strokeWidth={6} rx={4}/>
          {circleEl}
          <text x={W/2} y={textY} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={800} fontSize={hs} fill={BRAND.black} letterSpacing="-1">{tsEls(W/2, textY)}</text>
          <rect x={W/2-50} y={textY+headlines.length*hs*1.2+12} width={100} height={3} fill={BRAND.green} rx={2}/>
          {content.subheadline && <text x={W/2} y={textY+headlines.length*hs*1.2+50} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={400} fontSize={22} fill={BRAND.gray600}>{content.subheadline}</text>}
          {content.keyPoint && <><rect x={ins+20} y={H-72} width={W-ins*2-40} height={34} fill={BRAND.green} rx={4}/><text x={W/2} y={H-49} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={600} fontSize={16} fill={BRAND.white}>{content.keyPoint}</text></>}
        </>;
      }
      case "full-green-inverse": {
        const textY = H/2 - (headlines.length*hs*1.15)/2 - 20;
        return <>
          <rect width={W} height={H} fill={BRAND.green}/>
          <rect x={40} y={40} width={W-80} height={H-80} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2} rx={4}/>
          {circleEl}{dotsEl}
          <text x={W/2} y={textY} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={900} fontSize={hs} fill={BRAND.white} letterSpacing="-2">{tsEls(W/2, textY)}</text>
          {content.subheadline && <text x={W/2} y={textY+headlines.length*hs*1.15+40} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={400} fontSize={24} fill="rgba(255,255,255,0.85)">{content.subheadline}</text>}
          {content.stat && <text x={W/2} y={H-60} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={700} fontSize={20} fill="rgba(255,255,255,0.7)">{content.stat}</text>}
        </>;
      }
      case "grid-minimal":
      default: {
        const textY = H/2 - (headlines.length*hs*0.85*1.1)/2 - 20;
        return <>
          <rect width={W} height={H} fill={BRAND.gray50}/>
          <rect x={0} y={0} width={W*0.55} height={H} fill={BRAND.white}/>
          <circle cx={padding+12} cy={padding+12} r={9} fill={BRAND.green}/>
          <text x={padding+30} y={padding+20} fontFamily="Inter,sans-serif" fontWeight={600} fontSize={13} fill={BRAND.green}>LinkedIn Content</text>
          {circleEl}{dotsEl}
          <text x={padding} y={textY} fontFamily="Inter,sans-serif" fontWeight={800} fontSize={hs*0.85} fill={BRAND.black} letterSpacing="-0.5">{tsEls(padding, textY)}</text>
          {content.subheadline && <text x={padding} y={textY+headlines.length*hs*0.85*1.1+35} fontFamily="Inter,sans-serif" fontWeight={400} fontSize={19} fill={BRAND.gray600}>{content.subheadline}</text>}
          <rect x={W*0.6} y={H/2-80} width={W*0.35} height={160} rx={8} fill={BRAND.green}/>
          <text x={W*0.775} y={H/2+8} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={900} fontSize={40} fill={BRAND.white}>{content.stat ? content.stat.split(" ")[0] : "✓"}</text>
          <text x={W*0.775} y={H/2+38} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight={500} fontSize={15} fill="rgba(255,255,255,0.9)">{(content.keyPoint || "Point clé").substring(0,20)}</text>
        </>;
      }
    }
  };

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"auto", display:"block" }}>
      <defs><style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style></defs>
      {renderLayout()}
    </svg>
  );
}

// ── Appel Claude Haiku — sans CTA ─────────────────────────────────────────────
async function callClaude(subject, context, documentText, tone) {
  const toneLabels = {
    professionnel: "professionnel et expert",
    inspirant: "inspirant et motivant",
    éducatif: "éducatif et pédagogique",
    storytelling: "narratif avec storytelling",
  };
  const docCtx = documentText ? `\nContexte document : ${documentText.substring(0, 800)}` : "";
  const addCtx = context ? `\nContexte additionnel : ${context.substring(0, 400)}` : "";

  const prompt = `Sujet LinkedIn : "${subject}"
Ton : ${toneLabels[tone] || "professionnel"}${docCtx}${addCtx}

Génère un post LinkedIn (150-300 mots) + config visuelle.
Post : Hook percutant → 3 paragraphes courts → 3 hashtags.
Interdiction absolue d'ajouter un CTA, appel à l'action, invitation à commenter, partager ou suivre.
La dernière phrase est une conclusion, jamais un appel à l'action.
Visual : headline 6-8 mots, subheadline 12-15 mots, keyPoint 10-12 mots.
Langue : Français uniquement.
Réponds UNIQUEMENT en JSON valide sans backticks.
Format exact :
{"post":{"hook":"...","body":"...","hashtags":["...","...","..."],"emoji":"🔥"},"visual":{"headline":"...","subheadline":"...","keyPoint":"...","stat":"..."}}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `Tu es un expert en marketing LinkedIn et communication B2B francophone.
Tu génères du contenu professionnel, engageant et authentique.
Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.
Aucun CTA, aucune invitation à commenter, partager, liker ou suivre.
La dernière phrase du post est toujours une conclusion, jamais un appel à l'action.`,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erreur API ${res.status}`);
  }

  const data = await res.json();
  const raw = (data.content?.[0]?.text || "").trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(raw);
}

function downloadSVG(svgRef) {
  const svg = svgRef.current;
  if (!svg) return;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `linkedin-visuel-${Date.now()}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [documentText, setDocumentText] = useState("");
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
      const data = await callClaude(subject, context, documentText, tone);
      const post = [
        data.post.emoji ? `${data.post.emoji} ${data.post.hook}` : data.post.hook,
        "",
        data.post.body,
        "",
        data.post.hashtags?.map(h => `#${h.replace(/^#/, "")}`).join(" ") || "",
      ].join("\n");
      setResult({ post, rawData: data });
      setVisualConfig(generateVisualConfig(data.visual));
      setStep("result");
    } catch (err) {
      setError(err.message || "Erreur lors de la génération. Vérifiez votre clé API.");
    } finally {
      setLoading(false);
    }
  };

  const s = { fontFamily: "'Inter', -apple-system, sans-serif" };

  if (step === "result" && result && visualConfig) {
    return (
      <div style={{ ...s, minHeight:"100vh", background:"#F4F5F7" }}>
        <Header/>
        <main style={{ maxWidth:1060, margin:"0 auto", padding:"32px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
            <div>
              <button onClick={() => { setStep("form"); setResult(null); setVisualConfig(null); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#4B5563", fontFamily:"inherit", padding:0, marginBottom:6 }}>← Nouvelle génération</button>
              <h2 style={{ margin:0, fontSize:26, fontWeight:900, letterSpacing:"-0.5px" }}>Votre contenu est prêt 🎉</h2>
            </div>
            <div style={{ background:"rgba(0,184,43,0.08)", border:"1px solid rgba(0,184,43,0.2)", borderRadius:20, padding:"7px 14px", fontSize:12, fontWeight:600, color:"#009622" }}>✓ Claude Haiku</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"start" }}>
            {/* Visuel */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#1F2937", textTransform:"uppercase", letterSpacing:"0.6px" }}>Visuel LinkedIn</span>
                <span style={{ fontSize:10, background:"#F3F4F6", padding:"3px 8px", borderRadius:5, color:"#6B7280", fontWeight:600 }}>{visualConfig.layout}</span>
              </div>
              <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #E5E7EB", boxShadow:"0 4px 16px rgba(0,0,0,0.07)" }}>
                <LinkedInVisual config={visualConfig} svgRef={svgRef}/>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:10 }}>
                <button onClick={() => setVisualConfig(generateVisualConfig(result.rawData.visual))} style={{ flex:1, padding:"11px 14px", background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer", fontFamily:"inherit" }}>🔄 Nouveau layout</button>
                <button onClick={() => downloadSVG(svgRef)} style={{ flex:1, padding:"11px 14px", background:BRAND.green, border:"none", borderRadius:9, fontSize:13, fontWeight:600, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>⬇️ Télécharger SVG</button>
              </div>
            </div>

            {/* Post */}
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
                <div style={{ padding:"18px", fontSize:13, lineHeight:1.75, whiteSpace:"pre-wrap", maxHeight:300, overflowY:"auto", color:"#1F2937", fontFamily:"inherit" }}>{result.post}</div>
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
            </div>
          </div>

          <div style={{ textAlign:"center", marginTop:36 }}>
            <button onClick={() => { setStep("form"); setResult(null); setVisualConfig(null); }} style={{ padding:"13px 28px", background:BRAND.black, color:"#fff", border:"none", borderRadius:11, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✨ Créer un nouveau post</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ ...s, minHeight:"100vh", background:"#F4F5F7" }}>
      <Header/>
      <main style={{ maxWidth:640, margin:"0 auto", padding:"32px 20px" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <h1 style={{ fontSize:36, fontWeight:900, letterSpacing:"-1.5px", lineHeight:1.1, margin:"0 0 10px" }}>Créez du contenu LinkedIn<br/><span style={{ color:BRAND.green }}>qui convertit</span></h1>
          <p style={{ fontSize:16, color:"#4B5563", margin:0 }}>Visuel professionnel + post optimisé en quelques secondes</p>
        </div>

        <div style={{ background:"#fff", borderRadius:18, border:"1px solid #E5E7EB", padding:36, boxShadow:"0 4px 20px rgba(0,0,0,0.05)" }}>
          {/* Sujet */}
          <div style={{ marginBottom:22 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#1F2937", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.6px" }}>Sujet du post *</label>
            <textarea value={subject} onChange={e => setSubject(e.target.value.substring(0,500))} placeholder="Ex: Comment l'IA transforme notre façon de travailler en 2025..." rows={3} style={{ width:"100%", padding:"12px 14px", border:`1.5px solid ${subject.length>0?BRAND.green:"#E5E7EB"}`, borderRadius:10, outline:"none", resize:"vertical", fontFamily:"inherit", fontSize:14, boxSizing:"border-box", lineHeight:1.6 }}/>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:5, fontSize:11 }}>
              <span style={{ color: subject.length<5?"#EF4444":"#9CA3AF" }}>{subject.length<5?"Minimum 5 caractères":"✓ Parfait !"}</span>
              <span style={{ color:"#9CA3AF" }}>{subject.length}/500</span>
            </div>
          </div>

          {/* Ton */}
          <div style={{ marginBottom:22 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#1F2937", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.6px" }}>Ton du post</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[["professionnel","💼","Professionnel"],["inspirant","✨","Inspirant"],["éducatif","📚","Éducatif"],["storytelling","🎯","Storytelling"]].map(([v,ic,lb]) => (
                <button key={v} onClick={() => setTone(v)} style={{ padding:"9px 16px", borderRadius:9, fontSize:13, fontWeight:600, border:`2px solid ${tone===v?BRAND.green:"#E5E7EB"}`, background: tone===v?"rgba(0,184,43,0.06)":"#fff", color: tone===v?"#009622":"#4B5563", cursor:"pointer", fontFamily:"inherit" }}>{ic} {lb}</button>
              ))}
            </div>
          </div>

          {/* Upload */}
          <div style={{ marginBottom:22 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#1F2937", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.6px" }}>Document de référence (optionnel)</label>
            <div onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }} style={{ border:`2px dashed ${dragOver||fileName?BRAND.green:"#E5E7EB"}`, borderRadius:12, padding:"22px 20px", background: dragOver||fileName?"rgba(0,184,43,0.04)":"#F9FAFB", cursor:"pointer", textAlign:"center" }}>
              {fileName ? <div><span style={{ fontSize:20 }}>📄</span><p style={{ margin:"8px 0 0", fontSize:14, fontWeight:600, color:BRAND.green }}>{fileName}</p><p style={{ margin:"4px 0 0", fontSize:12, color:"#9CA3AF" }}>{documentText.length} caractères</p></div>
              : <div><span style={{ fontSize:26 }}>📎</span><p style={{ margin:"8px 0 4px", fontSize:14, fontWeight:500, color:"#4B5563" }}>Glissez ou cliquez</p><p style={{ margin:0, fontSize:12, color:"#9CA3AF" }}>TXT, MD (max 5 MB)</p></div>}
              <input ref={fileRef} type="file" accept=".txt,.md" onChange={e => handleFile(e.target.files[0])} style={{ display:"none" }}/>
            </div>
          </div>

          {/* Contexte */}
          <div style={{ marginBottom:32 }}>
            <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#1F2937", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.6px" }}>Contexte additionnel (optionnel)</label>
            <input type="text" value={context} onChange={e => setContext(e.target.value)} placeholder="Ex: Cible DRH, secteur tech, angle innovation..." style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #E5E7EB", borderRadius:10, outline:"none", fontFamily:"inherit", fontSize:14, boxSizing:"border-box" }}/>
          </div>

          {error && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"12px 16px", marginBottom:18, fontSize:13, color:"#DC2626" }}>⚠️ {error}</div>}

          <button onClick={handleGenerate} disabled={loading || subject.trim().length < 5} style={{ width:"100%", padding:"16px 24px", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor: loading||subject.trim().length<5?"not-allowed":"pointer", fontFamily:"inherit", background: loading||subject.trim().length<5?"#E5E7EB":BRAND.green, color: loading||subject.trim().length<5?"#9CA3AF":"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {loading ? <><Spinner/> Génération en cours...</> : "✨ Générer le contenu LinkedIn"}
          </button>
          <p style={{ textAlign:"center", fontSize:11, color:"#9CA3AF", margin:"10px 0 0" }}>Claude Haiku · ~$0.0008 par génération</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginTop:24 }}>
          {[["🎨","8 layouts","Visuels différents à chaque fois"],["✍️","Sans CTA","Post qui conclut, jamais qui sollicite"],["💰","Coût minimal","Claude Haiku, le moins cher"]].map(([ic,t,d]) => (
            <div key={t} style={{ background:"#fff", borderRadius:12, padding:"18px 14px", border:"1px solid #E5E7EB", textAlign:"center" }}>
              <span style={{ fontSize:24 }}>{ic}</span>
              <p style={{ margin:"8px 0 4px", fontSize:13, fontWeight:700 }}>{t}</p>
              <p style={{ margin:0, fontSize:11, color:"#4B5563" }}>{d}</p>
            </div>
          ))}
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
