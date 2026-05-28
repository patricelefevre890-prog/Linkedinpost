import React, { useState, useRef, useCallback } from "react";

const BRAND = {
  green: "#00B82B", greenDark: "#009622", black: "#0A0A0A", white: "#FFFFFF",
  gray200: "#E5E7EB", gray400: "#9CA3AF", gray600: "#4B5563", gray800: "#1F2937",
};

async function callClaude(subject, context, documentText, tone, url) {
  const res = await fetch("https://generate-d7ifqhvira-uc.a.run.app", {
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

const ANGLE_LABELS = {
  factuel: { label: "Factuel", icon: "📊", desc: "Chiffres et données" },
  storytelling: { label: "Storytelling", icon: "🎯", desc: "Angle narratif" },
  opinion: { label: "Prise de position", icon: "💡", desc: "Point de vue fort" },
};

export default function App() {
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [url, setUrl] = useState("");
  const [tone, setTone] = useState("professionnel");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [versions, setVersions] = useState(null);
  const [activeVersion, setActiveVersion] = useState("factuel");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState("form");
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
    setError(""); setLoading(true); setVersions(null);
    try {
      const data = await callClaude(subject, context, documentText, tone, url);
      setVersions({
        factuel: { post: formatPost(data.factuel), rawData: data.factuel },
        storytelling: { post: formatPost(data.storytelling), rawData: data.storytelling },
        opinion: { post: formatPost(data.opinion), rawData: data.opinion },
      });
      setActiveVersion("factuel");
      setStep("result");
    } catch (err) {
      setError(err.message || "Erreur lors de la génération. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const resetToForm = () => { setStep("form"); setVersions(null); setError(""); setCopied(false); };

  const currentPost = versions?.[activeVersion]?.post || "";
  const currentRaw = versions?.[activeVersion]?.rawData;

  if (step === "result" && versions) {
    return (
      <div style={{ minHeight:"100vh", background:"#F4F5F7", fontFamily:"'Inter',-apple-system,sans-serif" }}>
        <Header/>
        <main style={{ maxWidth:760, margin:"0 auto", padding:"40px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
            <div>
              <button onClick={resetToForm} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#4B5563", fontFamily:"inherit", padding:0, marginBottom:6 }}>← Nouvelle génération</button>
              <h2 style={{ margin:0, fontSize:26, fontWeight:900, letterSpacing:"-0.5px" }}>3 versions générées 🎉</h2>
            </div>
            <div style={{ background:"rgba(0,184,43,0.08)", border:"1px solid rgba(0,184,43,0.2)", borderRadius:20, padding:"7px 14px", fontSize:12, fontWeight:600, color:"#009622" }}>✓ Claude Haiku</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
            {Object.entries(ANGLE_LABELS).map(([key, { label, icon, desc }]) => (
              <button key={key} onClick={() => { setActiveVersion(key); setCopied(false); }} style={{
                padding:"16px 14px", borderRadius:12, border:`2px solid ${activeVersion===key ? BRAND.green : BRAND.gray200}`,
                background: activeVersion===key ? "rgba(0,184,43,0.06)" : BRAND.white,
                cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s",
              }}>
                <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color: activeVersion===key ? BRAND.greenDark : BRAND.black, marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:11, color: BRAND.gray600 }}>{desc}</div>
              </button>
            ))}
          </div>

          <div style={{ background:"#fff", borderRadius:16, border:`2px solid ${BRAND.green}`, overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.06)", marginBottom:14 }}>
            <div style={{ padding:"14px 22px", borderBottom:"1px solid #E5E7EB", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#00B82B,#009622)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:17, flexShrink:0 }}>V</div>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontWeight:700, fontSize:14, color:BRAND.black }}>Votre Nom</p>
                <p style={{ margin:"2px 0 0", fontSize:12, color:"#9CA3AF" }}>Votre titre · Maintenant</p>
              </div>
              <div style={{ background:"rgba(0,184,43,0.08)", border:"1px solid rgba(0,184,43,0.2)", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700, color:BRAND.greenDark }}>
                {ANGLE_LABELS[activeVersion].icon} {ANGLE_LABELS[activeVersion].label}
              </div>
            </div>
            <div style={{ padding:"22px", fontSize:15, lineHeight:1.85, whiteSpace:"pre-wrap", color:"#1F2937", fontFamily:"inherit" }}>
              {currentPost}
            </div>
          </div>

          <button onClick={() => { navigator.clipboard.writeText(currentPost).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }); }} style={{ width:"100%", padding:"16px 18px", border:"none", borderRadius:12, fontSize:15, fontWeight:700, color:"#fff", cursor:"pointer", fontFamily:"inherit", background: copied ? BRAND.greenDark : BRAND.green, display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:14 }}>
            {copied ? "✓ Copié dans le presse-papier !" : "📋 Copier cette version"}
          </button>

          {currentRaw?.hashtags && (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #E5E7EB", padding:"16px 18px", marginBottom:12 }}>
              <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.5px" }}>Hashtags</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {currentRaw.hashtags.map((h, i) => (
                  <span key={i} style={{ background:"rgba(0,184,43,0.08)", color:"#009622", padding:"5px 12px", borderRadius:20, fontSize:13, fontWeight:600, border:"1px solid rgba(0,184,43,0.2)" }}>#{h.replace(/^#/,"")}</span>
                ))}
              </div>
            </div>
          )}

          {currentRaw?.sources?.length > 0 && (
            <div style={{ background:"#fff", borderRadius:12, border:"1px solid #E5E7EB", padding:"16px 18px", marginBottom:12 }}>
              <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.5px" }}>Sources</p>
              {currentRaw.sources.map((s, i) => (
                <p key={i} style={{ margin: i > 0 ? "6px 0 0" : 0, fontSize:13, color:"#4B5563", lineHeight:1.5 }}>· {s}</p>
              ))}
            </div>
          )}

          <div style={{ textAlign:"center", marginTop:32 }}>
            <button onClick={resetToForm} style={{ padding:"13px 28px", background:BRAND.black, color:"#fff", border:"none", borderRadius:11, fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>✨ Nouveau sujet</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#F4F5F7", fontFamily:"'Inter',-apple-system,sans-serif" }}>
      <Header/>
      <main style={{ maxWidth:620, margin:"0 auto", padding:"40px 20px" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <h1 style={{ fontSize:38, fontWeight:900, letterSpacing:"-1.5px", lineHeight:1.1, margin:"0 0 10px" }}>
            Créez du contenu LinkedIn<br/><span style={{ color:BRAND.green }}>qui convertit</span>
          </h1>
          <p style={{ fontSize:16, color:"#4B5563", margin:0 }}>3 versions différentes générées en une fois</p>
        </div>

        <div style={{ background:"#fff", borderRadius:20, border:"1px solid #E5E7EB", padding:40, boxShadow:"0 4px 20px rgba(0,0,0,0.05)" }}>

          <div style={{ marginBottom:22 }}>
            <label style={labelStyle}>Sujet du post *</label>
            <textarea value={subject} onChange={e => setSubject(e.target.value.substring(0,500))} placeholder="Ex: L'importance de la musique dans un bar..." rows={3} style={{ width:"100%", padding:"12px 14px", border:`1.5px solid ${subject.length>0?BRAND.green:"#E5E7EB"}`, borderRadius:10, outline:"none", resize:"vertical", fontFamily:"inherit", fontSize:14, boxSizing:"border-box", lineHeight:1.6 }}/>
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:5, fontSize:11 }}>
              <span style={{ color: subject.length<5?"#EF4444":"#9CA3AF" }}>{subject.length<5?"Minimum 5 caractères":"✓ Parfait !"}</span>
              <span style={{ color:"#9CA3AF" }}>{subject.length}/500</span>
            </div>
          </div>

          <div style={{ marginBottom:22 }}>
            <label style={labelStyle}>Ton général</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[["professionnel","💼","Professionnel"],["inspirant","✨","Inspirant"],["éducatif","📚","Éducatif"]].map(([v,ic,lb]) => (
                <button key={v} onClick={() => setTone(v)} style={{ padding:"9px 16px", borderRadius:9, fontSize:13, fontWeight:600, border:`2px solid ${tone===v?BRAND.green:"#E5E7EB"}`, background: tone===v?"rgba(0,184,43,0.06)":"#fff", color: tone===v?"#009622":"#4B5563", cursor:"pointer", fontFamily:"inherit" }}>{ic} {lb}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:22 }}>
            <label style={labelStyle}>URL de référence (optionnel)</label>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔗</span>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://exemple.com/article..." style={{ width:"100%", padding:"12px 14px 12px 36px", border:`1.5px solid ${url?BRAND.green:"#E5E7EB"}`, borderRadius:10, outline:"none", fontFamily:"inherit", fontSize:14, boxSizing:"border-box" }}/>
            </div>
            {url && <p style={{ margin:"5px 0 0", fontSize:11, color:BRAND.green }}>✓ Le contenu de cette page sera analysé</p>}
          </div>

          <div style={{ marginBottom:22 }}>
            <label style={labelStyle}>Document de référence (optionnel)</label>
            <div onClick={() => fileRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }} style={{ border:`2px dashed ${dragOver||fileName?BRAND.green:"#E5E7EB"}`, borderRadius:12, padding:"20px", background: dragOver||fileName?"rgba(0,184,43,0.04)":"#F9FAFB", cursor:"pointer", textAlign:"center" }}>
              {fileName
                ? <div><span style={{ fontSize:20 }}>📄</span><p style={{ margin:"8px 0 0", fontSize:14, fontWeight:600, color:BRAND.green }}>{fileName}</p><p style={{ margin:"4px 0 0", fontSize:12, color:"#9CA3AF" }}>{documentText.length} caractères</p></div>
                : <div><span style={{ fontSize:26 }}>📎</span><p style={{ margin:"8px 0 4px", fontSize:14, fontWeight:500, color:"#4B5563" }}>Glissez ou cliquez</p><p style={{ margin:0, fontSize:12, color:"#9CA3AF" }}>TXT, MD (max 5 MB)</p></div>
              }
              <input ref={fileRef} type="file" accept=".txt,.md" onChange={e => handleFile(e.target.files[0])} style={{ display:"none" }}/>
            </div>
          </div>

          <div style={{ marginBottom:32 }}>
            <label style={labelStyle}>Contexte additionnel (optionnel)</label>
            <input type="text" value={context} onChange={e => setContext(e.target.value)} placeholder="Ex: Cible gérants de bar, angle chiffre d'affaires..." style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #E5E7EB", borderRadius:10, outline:"none", fontFamily:"inherit", fontSize:14, boxSizing:"border-box" }}/>
          </div>

          {error && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, padding:"12px 16px", marginBottom:18, fontSize:13, color:"#DC2626" }}>⚠️ {error}</div>}

          <button onClick={handleGenerate} disabled={loading || subject.trim().length < 5} style={{ width:"100%", padding:"16px 24px", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor: loading||subject.trim().length<5?"not-allowed":"pointer", fontFamily:"inherit", background: loading||subject.trim().length<5?"#E5E7EB":BRAND.green, color: loading||subject.trim().length<5?"#9CA3AF":"#fff", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            {loading ? <><Spinner/> Génération des 3 versions...</> : "✨ Générer 3 versions du post"}
          </button>
          <p style={{ textAlign:"center", fontSize:11, color:"#9CA3AF", margin:"10px 0 0" }}>Claude Haiku · ~$0.002 par génération</p>
        </div>
      </main>
    </div>
  );
}

const labelStyle = { display:"block", fontSize:11, fontWeight:700, color:"#1F2937", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.6px" };

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
