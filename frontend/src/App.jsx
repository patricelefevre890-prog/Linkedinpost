import React, { useState, useRef, useCallback } from "react";
import * as htmlToImage from "html-to-image";

const BRAND = {
  green: "#00B82B", greenDark: "#009622", black: "#0A0A0A", white: "#FFFFFF",
  gray50: "#F9FAFB", gray100: "#F3F4F6", gray200: "#E5E7EB",
  gray400: "#9CA3AF", gray600: "#4B5563", gray800: "#1F2937",
};

const LAYOUTS = [
  "data-dark", "data-light", "data-green",
  "hero-centered", "sidebar-accent", "bottom-accent", "frame-border", "top-bar",
];

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function truncate(text, max) {
  if (!text) return "";
  return text.length > max ? text.substring(0, max - 1) + "…" : text;
}

function generateVisualConfig(visualData) {
  return {
    layout: pickRandom(LAYOUTS),
    headlineSize: pickRandom([48, 56, 64]),
    content: {
      headline: visualData?.headline || "Votre titre ici",
      subheadline: visualData?.subheadline || "",
      points: visualData?.points || [],
    },
  };
}

// ── Rendu HTML du visuel (1200×700) ──────────────────────────────────────────
function LinkedInVisual({ config, visRef }) {
  if (!config) return null;
  const { layout, headlineSize, content } = config;
  const points = content.points || [];

  const base = {
    width: 1200, height: 700, position: "relative", overflow: "hidden",
    fontFamily: "'Inter', -apple-system, sans-serif",
  };

  // ── Layout avec données chiffrées ─────────────────────────────────────────
  const DataLayout = ({ bg, textColor, mutedColor, cardBg, borderColor, labelColor, footerBg }) => (
    <div ref={visRef} style={{ ...base, background: bg, display: "flex" }}>
      {/* Barre verte top si fond sombre */}
      {bg !== BRAND.white && <div style={{ position:"absolute", top:0, left:0, right:0, height:8, background:BRAND.green }}/>}

      {/* Colonne gauche */}
      <div style={{ width:520, padding:"60px 0 60px 64px", display:"flex", flexDirection:"column", justifyContent:"center", flexShrink:0 }}>
        <div style={{ fontSize:12, fontWeight:700, color:BRAND.green, letterSpacing:"2px", marginBottom:12, textTransform:"uppercase" }}>
          {truncate(content.subheadline, 38)}
        </div>
        <div style={{ width:40, height:3, background:BRAND.green, borderRadius:2, marginBottom:28 }}/>
        <div style={{ fontSize:headlineSize, fontWeight:900, lineHeight:1.1, letterSpacing:"-2px", color:textColor }}>
          {content.headline.split(" ").slice(0, Math.ceil(content.headline.split(" ").length / 2)).join(" ")}
          <span style={{ color:BRAND.green, display:"block" }}>
            {content.headline.split(" ").slice(Math.ceil(content.headline.split(" ").length / 2)).join(" ")}
          </span>
        </div>
      </div>

      {/* Séparateur */}
      <div style={{ width:1, background:borderColor, flexShrink:0, margin:"30px 0" }}/>

      {/* Colonne droite : 3 cartes */}
      <div style={{ flex:1, padding:"28px 32px 28px 28px", display:"flex", flexDirection:"column", gap:14 }}>
        {points.slice(0, 3).map((pt, i) => (
          <div key={i} style={{ flex:1, background:cardBg, borderRadius:10, display:"flex", alignItems:"stretch", overflow:"hidden" }}>
            <div style={{ width:5, background:BRAND.green, flexShrink:0 }}/>
            <div style={{ padding:"14px 20px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
              <div style={{ fontSize:46, fontWeight:900, color:BRAND.green, lineHeight:1, marginBottom:6 }}>{truncate(pt.stat, 12)}</div>
              <div style={{ fontSize:15, fontWeight:600, color:textColor, marginBottom:4 }}>{truncate(pt.label, 48)}</div>
              <div style={{ fontSize:12, fontWeight:400, color:mutedColor }}>{truncate(pt.source, 55)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:50, background:footerBg, borderTop:`2px solid ${BRAND.green}`, display:"flex", alignItems:"center", padding:"0 64px" }}>
        <span style={{ fontSize:12, fontWeight:600, color:mutedColor }}>
          {truncate(points.length > 0 ? `Sources : ${points.map(p => p.source).join(" · ")}` : content.headline, 110)}
        </span>
      </div>
    </div>
  );

  if (layout === "data-dark") return <DataLayout
    bg={BRAND.black} textColor={BRAND.white} mutedColor="rgba(255,255,255,0.5)"
    cardBg="rgba(255,255,255,0.04)" borderColor="rgba(255,255,255,0.08)"
    labelColor={BRAND.green} footerBg="rgba(0,184,43,0.1)"
  />;

  if (layout === "data-light") return <DataLayout
    bg={BRAND.white} textColor={BRAND.black} mutedColor={BRAND.gray600}
    cardBg="rgba(0,184,43,0.04)" borderColor="rgba(0,0,0,0.06)"
    labelColor={BRAND.green} footerBg="rgba(0,184,43,0.06)"
  />;

  if (layout === "data-green") return <DataLayout
    bg={BRAND.green} textColor={BRAND.white} mutedColor="rgba(255,255,255,0.7)"
    cardBg="rgba(0,0,0,0.12)" borderColor="rgba(255,255,255,0.15)"
    labelColor={BRAND.white} footerBg="rgba(0,0,0,0.15)"
  />;

  // ── Layouts classiques (sans données) ─────────────────────────────────────
  if (layout === "hero-centered") return (
    <div ref={visRef} style={{ ...base, background:BRAND.green, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", textAlign:"center", padding:"0 80px" }}>
      <div style={{ fontSize:headlineSize, fontWeight:900, color:BRAND.white, lineHeight:1.1, letterSpacing:"-2px", marginBottom:24 }}>{content.headline}</div>
      <div style={{ width:60, height:4, background:"rgba(255,255,255,0.5)", borderRadius:2, marginBottom:24 }}/>
      {content.subheadline && <div style={{ fontSize:22, fontWeight:400, color:"rgba(255,255,255,0.85)" }}>{truncate(content.subheadline, 80)}</div>}
    </div>
  );

  if (layout === "sidebar-accent") return (
    <div ref={visRef} style={{ ...base, background:BRAND.white, display:"flex" }}>
      <div style={{ width:12, background:BRAND.green, flexShrink:0 }}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 80px" }}>
        <div style={{ fontSize:headlineSize, fontWeight:900, color:BRAND.black, lineHeight:1.1, letterSpacing:"-2px", marginBottom:24 }}>{content.headline}</div>
        {content.subheadline && <div style={{ fontSize:22, fontWeight:400, color:BRAND.gray600 }}>{truncate(content.subheadline, 80)}</div>}
      </div>
    </div>
  );

  if (layout === "bottom-accent") return (
    <div ref={visRef} style={{ ...base, background:BRAND.black, display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 80px" }}>
      <div style={{ fontSize:headlineSize, fontWeight:900, color:BRAND.white, lineHeight:1.1, letterSpacing:"-2px", marginBottom:24 }}>{content.headline}</div>
      {content.subheadline && <div style={{ fontSize:22, fontWeight:400, color:"rgba(255,255,255,0.7)", marginBottom:40 }}>{truncate(content.subheadline, 80)}</div>}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:8, background:BRAND.green }}/>
    </div>
  );

  if (layout === "frame-border") return (
    <div ref={visRef} style={{ ...base, background:BRAND.white, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", textAlign:"center", padding:"60px 80px" }}>
      <div style={{ position:"absolute", inset:20, border:`6px solid ${BRAND.green}`, borderRadius:8, pointerEvents:"none" }}/>
      <div style={{ fontSize:headlineSize, fontWeight:900, color:BRAND.black, lineHeight:1.1, letterSpacing:"-2px", marginBottom:20 }}>{content.headline}</div>
      <div style={{ width:100, height:3, background:BRAND.green, borderRadius:2, marginBottom:20 }}/>
      {content.subheadline && <div style={{ fontSize:22, fontWeight:400, color:BRAND.gray600 }}>{truncate(content.subheadline, 80)}</div>}
    </div>
  );

  // top-bar (default)
  return (
    <div ref={visRef} style={{ ...base, background:BRAND.white, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"60px 80px" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:10, background:BRAND.green }}/>
      <div style={{ fontSize:headlineSize, fontWeight:900, color:BRAND.black, lineHeight:1.1, letterSpacing:"-2px", marginBottom:20 }}>{content.headline}</div>
      <div style={{ width:90, height:4, background:BRAND.green, borderRadius:2, marginBottom:20 }}/>
      {content.subheadline && <div style={{ fontSize:22, fontWeight:400, color:BRAND.gray600 }}>{truncate(content.subheadline, 80)}</div>}
    </div>
  );
}

// ── Téléchargement PNG haute qualité via html-to-image ────────────────────────
async function downloadPNG(visRef) {
  const node = visRef.current;
  if (!node) return;
  try {
    const dataUrl = await htmlToImage.toPng(node, {
      width: 1200,
      height: 700,
      pixelRatio: 3, // 3× = qualité 3600×2100px
      style: { fontFamily: "'Inter', -apple-system, sans-serif" },
    });
    const a = document.createElement("a");
    a.download = `linkedin-visuel-${Date.now()}.png`;
    a.href = dataUrl;
    a.click();
  } catch (e) {
    alert("Erreur lors du téléchargement. Réessayez.");
  }
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
    "", post.body, "",
    post.hashtags?.map(h => `#${h.replace(/^#/, "")}`).join(" ") || "",
  ];
  if (post.sources?.length > 0) {
    parts.push("", "──", "Sources : " + post.sources.join(" · "));
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
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [visualConfig, setVisualConfig] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState("form");
  const visRef = useRef(null);
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
    if (subject.trim().length < 5) { setError("Le sujet doit contenir au moins 5 caractères."); return; }
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

  const handleDownload = async () => {
    setDownloading(true);
    await downloadPNG(visRef);
    setDownloading(false);
  };

  const resetToForm = () => { setStep("form"); setResult(null); setVisualConfig(null); setError(""); };

  if (step === "result" && result && visualConfig) {
    return (
      <div style={{ minHeight:"100vh", background:"#F4F5F7", fontFamily:"'Inter',-apple-system,sans-serif" }}>
        <Header/>
        <main style={{ maxWidth:1100, margin:"0 auto", padding:"32px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
            <div>
              <button onClick={resetToForm} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#4B5563", fontFamily:"inherit", padding:0, marginBottom:6 }}>← Nouvelle génération</button>
              <h2 style={{ margin:0, fontSize:26, fontWeight:900, letterSpacing:"-0.5px" }}>Votre contenu est prêt 🎉</h2>
            </div>
            <div style={{ background:"rgba(0,184,43,0.08)", border:"1px solid rgba(0,184,43,0.2)", borderRadius:20, padding:"7px 14px", fontSize:12, fontWeight:600, color:"#009622" }}>✓ Claude Haiku</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:28, alignItems:"start" }}>
            {/* Visuel */}
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:700, color:"#1F2937", textTransform:"uppercase", letterSpacing:"0.6px" }}>Visuel LinkedIn</span>
                <span style={{ fontSize:10, background:"#F3F4F6", padding:"3px 8px", borderRadius:5, color:"#6B7280", fontWeight:600 }}>{visualConfig.layout}</span>
              </div>
              <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #E5E7EB", boxShadow:"0 4px 16px rgba(0,0,0,0.07)" }}>
                <LinkedInVisual config={visualConfig} visRef={visRef}/>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:10 }}>
                <button onClick={() => setVisualConfig(generateVisualConfig(result.rawData.visual))} style={{ flex:1, padding:"11px 14px", background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:9, fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer", fontFamily:"inherit" }}>🔄 Nouveau layout</button>
                <button onClick={handleDownload} disabled={downloading} style={{ flex:1, padding:"11px 14px", background: downloading?"#E5E7EB":BRAND.green, border:"none", borderRadius:9, fontSize:13, fontWeight:600, color: downloading?"#9CA3AF":"#fff", cursor: downloading?"not-allowed":"pointer", fontFamily:"inherit" }}>
                  {downloading ? "⏳ Export..." : "⬇️ Télécharger PNG"}
                </button>
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

              {result.rawData?.post?.sources?.length > 0 && (
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
              {fileName ? <div><span style={{ fontSize:20 }}>📄</span><p style={{ margin:"8px 0 0", fontSize:14, fontWeight:600, color:BRAND.green }}>{fileName}</p><p style={{ margin:"4px 0 0", fontSize:12, color:"#9CA3AF" }}>{documentText.length} car.</p></div>
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
