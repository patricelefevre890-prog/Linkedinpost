import { useState, useRef, useCallback, useEffect } from "react";

// ── Charte graphique stricte ───────────────────────────────────────────────────
const BRAND = {
  green: "#00B82B",
  greenDark: "#009622",
  greenLight: "#00D432",
  black: "#0A0A0A",
  white: "#FFFFFF",
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray600: "#4B5563",
  gray800: "#1F2937",
};

// ── Layouts visuels disponibles ───────────────────────────────────────────────
const LAYOUTS = [
  "hero-centered",
  "diagonal-split",
  "sidebar-accent",
  "top-bar",
  "bottom-accent",
  "frame-border",
  "full-green-inverse",
  "grid-minimal",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Génération de config visuelle côté client ─────────────────────────────────
function generateVisualConfig(visualData) {
  const layout = pickRandom(LAYOUTS);
  const headlineSize = pickRandom([44, 52, 60, 68]);
  const padding = pickRandom([48, 56, 64, 72]);
  return {
    layout,
    headlineSize,
    padding,
    content: {
      headline: visualData?.headline || "Votre titre ici",
      subheadline: visualData?.subheadline || "",
      keyPoint: visualData?.keyPoint || "",
      stat: visualData?.stat || null,
    },
    decorative: {
      showCircle: Math.random() > 0.4,
      showDots: Math.random() > 0.5,
      circleSize: pickRandom([100, 140, 180, 220]),
      circlePos: pickRandom(["top-right", "bottom-left", "bottom-right"]),
    },
  };
}

// ── Rendu SVG du visuel LinkedIn ──────────────────────────────────────────────
function LinkedInVisual({ config }) {
  if (!config) return null;
  const W = 1200, H = 627;
  const { layout, headlineSize, padding, content, decorative } = config;

  // Couleurs selon layout
  const isDarkBg = ["hero-centered", "full-green-inverse", "bottom-accent"].includes(layout);
  const isGreenBg = ["hero-centered", "full-green-inverse"].includes(layout);
  const isBlackBg = layout === "bottom-accent";

  const bg = isGreenBg ? BRAND.green : isBlackBg ? BRAND.black : BRAND.white;
  const textPrimary = isDarkBg ? BRAND.white : BRAND.black;
  const textSecondary = isDarkBg ? "rgba(255,255,255,0.75)" : BRAND.gray600;
  const accentColor = isDarkBg ? BRAND.white : BRAND.green;

  // Éléments décoratifs
  const DecoCircle = () => {
    if (!decorative.showCircle) return null;
    const pos = decorative.circlePos;
    const s = decorative.circleSize;
    const cx = pos.includes("right") ? W - s * 0.3 : s * 0.3;
    const cy = pos.includes("top") ? s * 0.3 : H - s * 0.3;
    const fill = isGreenBg ? "rgba(0,0,0,0.12)" : isDarkBg ? "rgba(255,255,255,0.08)" : "rgba(0,184,43,0.08)";
    return <circle cx={cx} cy={cy} r={s} fill={fill} />;
  };

  const DecoDots = () => {
    if (!decorative.showDots) return null;
    const dots = [];
    const fillColor = isDarkBg ? "rgba(255,255,255,0.15)" : "rgba(0,184,43,0.2)";
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        dots.push(
          <circle key={`${r}-${c}`} cx={W - 120 + c * 20} cy={H - 100 + r * 20} r={2.5} fill={fillColor} />
        );
      }
    }
    return <>{dots}</>;
  };

  // ── Rendu par layout ────────────────────────────────────────────────────────
  const renderContent = () => {
    switch (layout) {
      case "hero-centered":
        return (
          <>
            <rect width={W} height={H} fill={BRAND.green} />
            <DecoCircle />
            <DecoDots />
            {/* Ligne décorative */}
            <line x1={padding} y1={H / 2 - 20} x2={W - padding} y2={H / 2 - 20} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            {/* Headline centrée */}
            <text x={W / 2} y={H / 2 - 60} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={headlineSize} fill={BRAND.white} style={{ letterSpacing: "-1px" }}>
              {splitText(content.headline, 30).map((line, i) => (
                <tspan key={i} x={W / 2} dy={i === 0 ? 0 : headlineSize * 1.2}>{line}</tspan>
              ))}
            </text>
            {/* Divider */}
            <rect x={W / 2 - 30} y={H / 2 + 10} width={60} height={3} fill="rgba(255,255,255,0.5)" rx={2} />
            {/* Subheadline */}
            {content.subheadline && (
              <text x={W / 2} y={H / 2 + 50} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={400} fontSize={22} fill="rgba(255,255,255,0.85)">
                {content.subheadline}
              </text>
            )}
            {/* KeyPoint pill */}
            {content.keyPoint && (
              <>
                <rect x={W / 2 - 200} y={H - 100} width={400} height={44} rx={22} fill="rgba(0,0,0,0.2)" />
                <text x={W / 2} y={H - 73} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={600} fontSize={16} fill={BRAND.white}>
                  {content.keyPoint}
                </text>
              </>
            )}
          </>
        );

      case "diagonal-split":
        const splitX = W * 0.42;
        const angle = 40;
        return (
          <>
            <rect width={W} height={H} fill={BRAND.white} />
            {/* Zone verte diagonale */}
            <polygon points={`0,0 ${splitX},0 ${splitX - angle},${H} 0,${H}`} fill={BRAND.green} />
            <DecoCircle />
            <DecoDots />
            {/* Texte sur le vert */}
            <text x={40} y={120} fontFamily="Inter, sans-serif" fontWeight={700} fontSize={18} fill="rgba(255,255,255,0.7)">
              INSIGHT
            </text>
            <rect x={40} y={140} width={40} height={3} fill={BRAND.white} rx={2} />
            {/* Headline principale sur blanc */}
            <text x={splitX + 60} y={padding + 30} fontFamily="Inter, sans-serif" fontWeight={800} fontSize={headlineSize * 0.85} fill={BRAND.black} style={{ letterSpacing: "-0.5px" }}>
              {splitText(content.headline, 22).map((line, i) => (
                <tspan key={i} x={splitX + 60} dy={i === 0 ? 0 : headlineSize * 1.1}>{line}</tspan>
              ))}
            </text>
            {content.subheadline && (
              <text x={splitX + 60} y={H / 2 + 40} fontFamily="Inter, sans-serif" fontWeight={400} fontSize={20} fill={BRAND.gray600}>
                {content.subheadline}
              </text>
            )}
            {content.stat && (
              <>
                <text x={60} y={H / 2 + 20} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={52} fill={BRAND.white}>
                  {content.stat.split(" ")[0]}
                </text>
                <text x={60} y={H / 2 + 50} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={400} fontSize={14} fill="rgba(255,255,255,0.8)">
                  {content.stat.split(" ").slice(1).join(" ")}
                </text>
              </>
            )}
          </>
        );

      case "sidebar-accent":
        const sideW = 12;
        return (
          <>
            <rect width={W} height={H} fill={BRAND.white} />
            <rect width={sideW} height={H} fill={BRAND.green} />
            <DecoCircle />
            <DecoDots />
            {/* Gros point vert décoratif */}
            <circle cx={sideW + 60} cy={H / 2} r={80} fill="rgba(0,184,43,0.06)" />
            <text x={sideW + 100} y={H / 2 - 80} fontFamily="Inter, sans-serif" fontWeight={900} fontSize={headlineSize} fill={BRAND.black} style={{ letterSpacing: "-1px" }}>
              {splitText(content.headline, 28).map((line, i) => (
                <tspan key={i} x={sideW + 100} dy={i === 0 ? 0 : headlineSize * 1.15}>{line}</tspan>
              ))}
            </text>
            {content.subheadline && (
              <text x={sideW + 100} y={H / 2 + 40} fontFamily="Inter, sans-serif" fontWeight={400} fontSize={22} fill={BRAND.gray600}>
                {content.subheadline}
              </text>
            )}
            {content.keyPoint && (
              <>
                <rect x={sideW + 100} y={H - 110} width={W - sideW - 200} height={2} fill={BRAND.gray200} rx={1} />
                <text x={sideW + 100} y={H - 70} fontFamily="Inter, sans-serif" fontWeight={600} fontSize={18} fill={BRAND.green}>
                  → {content.keyPoint}
                </text>
              </>
            )}
          </>
        );

      case "top-bar":
        return (
          <>
            <rect width={W} height={H} fill={BRAND.white} />
            <rect width={W} height={10} fill={BRAND.green} />
            <DecoCircle />
            <DecoDots />
            <text x={W / 2} y={H / 2 - 40} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={headlineSize} fill={BRAND.black} style={{ letterSpacing: "-1px" }}>
              {splitText(content.headline, 32).map((line, i) => (
                <tspan key={i} x={W / 2} dy={i === 0 ? 0 : headlineSize * 1.2}>{line}</tspan>
              ))}
            </text>
            <rect x={W / 2 - 40} y={H / 2 + 20} width={80} height={4} fill={BRAND.green} rx={2} />
            {content.subheadline && (
              <text x={W / 2} y={H / 2 + 60} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={400} fontSize={22} fill={BRAND.gray600}>
                {content.subheadline}
              </text>
            )}
          </>
        );

      case "bottom-accent":
        return (
          <>
            <rect width={W} height={H} fill={BRAND.black} />
            <rect y={H - 8} width={W} height={8} fill={BRAND.green} />
            <DecoCircle />
            <DecoDots />
            <text x={padding} y={H / 2 - 40} fontFamily="Inter, sans-serif" fontWeight={900} fontSize={headlineSize} fill={BRAND.white} style={{ letterSpacing: "-1px" }}>
              {splitText(content.headline, 28).map((line, i) => (
                <tspan key={i} x={padding} dy={i === 0 ? 0 : headlineSize * 1.2}>{line}</tspan>
              ))}
            </text>
            {content.subheadline && (
              <text x={padding} y={H / 2 + 40} fontFamily="Inter, sans-serif" fontWeight={400} fontSize={22} fill="rgba(255,255,255,0.7)">
                {content.subheadline}
              </text>
            )}
            <text x={padding} y={H - 30} fontFamily="Inter, sans-serif" fontWeight={600} fontSize={18} fill={BRAND.green}>
              {content.keyPoint}
            </text>
          </>
        );

      case "frame-border":
        const inset = 20;
        return (
          <>
            <rect width={W} height={H} fill={BRAND.white} />
            <rect x={inset} y={inset} width={W - inset * 2} height={H - inset * 2} fill="none" stroke={BRAND.green} strokeWidth={6} rx={4} />
            <DecoCircle />
            <text x={W / 2} y={H / 2 - 50} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={headlineSize} fill={BRAND.black} style={{ letterSpacing: "-1px" }}>
              {splitText(content.headline, 30).map((line, i) => (
                <tspan key={i} x={W / 2} dy={i === 0 ? 0 : headlineSize * 1.2}>{line}</tspan>
              ))}
            </text>
            <rect x={W / 2 - 50} y={H / 2 + 20} width={100} height={3} fill={BRAND.green} rx={2} />
            {content.subheadline && (
              <text x={W / 2} y={H / 2 + 60} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={400} fontSize={22} fill={BRAND.gray600}>
                {content.subheadline}
              </text>
            )}
            {content.keyPoint && (
              <>
                <rect x={inset + 20} y={H - 70} width={W - inset * 2 - 40} height={32} fill={BRAND.green} rx={4} />
                <text x={W / 2} y={H - 48} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={600} fontSize={16} fill={BRAND.white}>
                  {content.keyPoint}
                </text>
              </>
            )}
          </>
        );

      case "full-green-inverse":
        return (
          <>
            <rect width={W} height={H} fill={BRAND.green} />
            <rect x={40} y={40} width={W - 80} height={H - 80} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2} rx={4} />
            <DecoCircle />
            <DecoDots />
            <text x={W / 2} y={H / 2 - 50} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={headlineSize} fill={BRAND.white} style={{ letterSpacing: "-2px" }}>
              {splitText(content.headline, 30).map((line, i) => (
                <tspan key={i} x={W / 2} dy={i === 0 ? 0 : headlineSize * 1.15}>{line}</tspan>
              ))}
            </text>
            {content.subheadline && (
              <text x={W / 2} y={H / 2 + 40} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={400} fontSize={24} fill="rgba(255,255,255,0.85)">
                {content.subheadline}
              </text>
            )}
            {content.stat && (
              <text x={W / 2} y={H - 60} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={700} fontSize={20} fill="rgba(255,255,255,0.7)">
                {content.stat}
              </text>
            )}
          </>
        );

      case "grid-minimal":
      default:
        return (
          <>
            <rect width={W} height={H} fill={BRAND.gray50} />
            <rect x={0} y={0} width={W * 0.55} height={H} fill={BRAND.white} />
            <DecoCircle />
            <DecoDots />
            <circle cx={padding + 12} cy={padding + 12} r={10} fill={BRAND.green} />
            <text x={padding + 32} y={padding + 20} fontFamily="Inter, sans-serif" fontWeight={600} fontSize={14} fill={BRAND.green}>
              LinkedIn Content
            </text>
            <text x={padding} y={padding + 80} fontFamily="Inter, sans-serif" fontWeight={800} fontSize={headlineSize * 0.85} fill={BRAND.black} style={{ letterSpacing: "-0.5px" }}>
              {splitText(content.headline, 22).map((line, i) => (
                <tspan key={i} x={padding} dy={i === 0 ? 0 : headlineSize * 1.1}>{line}</tspan>
              ))}
            </text>
            {content.subheadline && (
              <text x={padding} y={H / 2 + 20} fontFamily="Inter, sans-serif" fontWeight={400} fontSize={20} fill={BRAND.gray600}>
                {content.subheadline}
              </text>
            )}
            {/* Carte de stat sur la droite */}
            <rect x={W * 0.6} y={H / 2 - 80} width={W * 0.35} height={160} rx={8} fill={BRAND.green} />
            <text x={W * 0.775} y={H / 2 - 20} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={900} fontSize={42} fill={BRAND.white}>
              {content.stat ? content.stat.split(" ")[0] : "✓"}
            </text>
            <text x={W * 0.775} y={H / 2 + 20} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={500} fontSize={16} fill="rgba(255,255,255,0.85)">
              {content.keyPoint?.substring(0, 20) || "Point clé"}
            </text>
          </>
        );
    }
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
      </defs>
      {renderContent()}
    </svg>
  );
}

// Divise le texte en lignes selon une largeur max de caractères
function splitText(text, maxChars) {
  if (!text) return [""];
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length <= maxChars) {
      current = (current + " " + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ── Appel API Claude (via proxy Anthropic) ────────────────────────────────────
async function callClaude(subject, context, documentText, tone) {
  const toneLabels = {
    professionnel: "professionnel et expert",
    inspirant: "inspirant et motivant",
    éducatif: "éducatif et pédagogique",
    storytelling: "narratif avec storytelling",
  };
  const toneLabel = toneLabels[tone] || "professionnel";
  const docCtx = documentText ? `\nContexte document : ${documentText.substring(0, 800)}` : "";
  const addCtx = context ? `\nContexte additionnel : ${context.substring(0, 400)}` : "";

  const prompt = `Sujet LinkedIn : "${subject}"
Ton : ${toneLabel}${docCtx}${addCtx}

Génère un post LinkedIn (150-300 mots) + config visuelle.
Post : Hook percutant → 3 paragraphes courts → CTA → 3 hashtags.
Visual : headline 6-8 mots, subheadline 12-15 mots, keyPoint 10-12 mots.
Langue : Français uniquement.
Réponds UNIQUEMENT en JSON valide sans backticks.
Format exact :
{
  "post": {
    "hook": "...",
    "body": "...",
    "cta": "...",
    "hashtags": ["...", "...", "..."],
    "emoji": "🔥"
  },
  "visual": {
    "headline": "...",
    "subheadline": "...",
    "keyPoint": "...",
    "stat": "..."
  }
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `Tu es un expert en marketing LinkedIn et communication B2B francophone.
Tu génères du contenu professionnel, engageant et authentique.
Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks, sans commentaires.`,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erreur API ${res.status}`);
  }

  const data = await res.json();
  const raw = data.content?.[0]?.text?.trim() || "";
  
  // Nettoyage des backticks éventuels
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

// ── Téléchargement du SVG en PNG ──────────────────────────────────────────────
function downloadVisualAsPNG(svgRef) {
  const svg = svgRef.current;
  if (!svg) return;
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `linkedin-visual-${Date.now()}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
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
  const [step, setStep] = useState("form"); // form | result
  const svgRef = useRef(null);
  const fileRef = useRef(null);

  // Lecture du fichier texte uploadé
  const handleFile = useCallback((file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Fichier trop volumineux (max 5 MB).");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setDocumentText(e.target.result?.substring(0, 3000) || "");
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleGenerate = async () => {
    if (!subject.trim() || subject.trim().length < 5) {
      setError("Le sujet doit contenir au moins 5 caractères.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    setVisualConfig(null);
    
    try {
      const data = await callClaude(subject, context, documentText, tone);
      const config = generateVisualConfig(data.visual);
      
      const post = [
        data.post.emoji ? `${data.post.emoji} ${data.post.hook}` : data.post.hook,
        "",
        data.post.body,
        "",
        data.post.cta,
        "",
        data.post.hashtags?.map(h => `#${h.replace(/^#/, "")}`).join(" ") || "",
      ].join("\n");

      setResult({ post, rawData: data });
      setVisualConfig(config);
      setStep("result");
    } catch (err) {
      setError(err.message || "Erreur lors de la génération. Vérifiez votre clé API.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenVisual = () => {
    if (result?.rawData?.visual) {
      setVisualConfig(generateVisualConfig(result.rawData.visual));
    }
  };

  const handleCopy = () => {
    if (result?.post) {
      navigator.clipboard.writeText(result.post).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F8F9FA",
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* ── Header ── */}
      <header style={{
        background: BRAND.white,
        borderBottom: `1px solid ${BRAND.gray200}`,
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, background: BRAND.green, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: BRAND.white, fontWeight: 900, fontSize: 18, lineHeight: 1 }}>in</span>
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 16, color: BRAND.black }}>LinkedIn</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: BRAND.green }}> Generator</span>
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: BRAND.gray100, borderRadius: 20, padding: "4px 12px",
        }}>
          <div style={{ width: 8, height: 8, background: BRAND.green, borderRadius: "50%" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: BRAND.gray600 }}>Claude Haiku · Coûts optimisés</span>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {step === "form" && (
          <FormView
            subject={subject} setSubject={setSubject}
            context={context} setContext={setContext}
            tone={tone} setTone={setTone}
            documentText={documentText} fileName={fileName}
            dragOver={dragOver} setDragOver={setDragOver}
            fileRef={fileRef} handleFile={handleFile} handleDrop={handleDrop}
            loading={loading} error={error}
            onGenerate={handleGenerate}
          />
        )}
        {step === "result" && result && visualConfig && (
          <ResultView
            result={result}
            visualConfig={visualConfig}
            svgRef={svgRef}
            copied={copied}
            onCopy={handleCopy}
            onRegenVisual={handleRegenVisual}
            onBack={() => setStep("form")}
            onDownload={() => downloadVisualAsPNG(svgRef)}
          />
        )}
      </main>
    </div>
  );
}

// ── Vue formulaire ────────────────────────────────────────────────────────────
function FormView({ subject, setSubject, context, setContext, tone, setTone, documentText, fileName, dragOver, setDragOver, fileRef, handleFile, handleDrop, loading, error, onGenerate }) {
  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: BRAND.black, margin: "0 0 12px", letterSpacing: "-1.5px", lineHeight: 1.1 }}>
          Créez du contenu LinkedIn<br />
          <span style={{ color: BRAND.green }}>qui convertit</span>
        </h1>
        <p style={{ fontSize: 18, color: BRAND.gray600, margin: 0, fontWeight: 400 }}>
          Visuel professionnel + post optimisé en quelques secondes
        </p>
      </div>

      <div style={{
        background: BRAND.white,
        borderRadius: 20,
        border: `1px solid ${BRAND.gray200}`,
        padding: 40,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        {/* Sujet */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: BRAND.gray800, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Sujet du post *
          </label>
          <textarea
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Comment l'IA transforme notre façon de travailler en 2025..."
            rows={3}
            style={{
              width: "100%", padding: "14px 16px", fontSize: 15,
              border: `1.5px solid ${subject.length > 0 ? BRAND.green : BRAND.gray200}`,
              borderRadius: 12, outline: "none", resize: "vertical",
              fontFamily: "inherit", color: BRAND.black, boxSizing: "border-box",
              transition: "border-color 0.2s", background: BRAND.white,
              lineHeight: 1.6,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 12, color: subject.length < 5 ? "#EF4444" : BRAND.gray400 }}>
              {subject.length < 5 ? "Minimum 5 caractères" : "Parfait !"}
            </span>
            <span style={{ fontSize: 12, color: BRAND.gray400 }}>{subject.length}/500</span>
          </div>
        </div>

        {/* Ton */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: BRAND.gray800, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Ton du post
          </label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { value: "professionnel", label: "Professionnel", icon: "💼" },
              { value: "inspirant", label: "Inspirant", icon: "✨" },
              { value: "éducatif", label: "Éducatif", icon: "📚" },
              { value: "storytelling", label: "Storytelling", icon: "🎯" },
            ].map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setTone(value)}
                style={{
                  padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 500,
                  border: `2px solid ${tone === value ? BRAND.green : BRAND.gray200}`,
                  background: tone === value ? `rgba(0,184,43,0.06)` : BRAND.white,
                  color: tone === value ? BRAND.greenDark : BRAND.gray600,
                  cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload document */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: BRAND.gray800, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Document de référence (optionnel)
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? BRAND.green : fileName ? BRAND.green : BRAND.gray200}`,
              borderRadius: 12, padding: "24px 20px",
              background: dragOver ? "rgba(0,184,43,0.04)" : fileName ? "rgba(0,184,43,0.02)" : BRAND.gray50,
              cursor: "pointer", textAlign: "center", transition: "all 0.2s",
            }}
          >
            {fileName ? (
              <div>
                <span style={{ fontSize: 20 }}>📄</span>
                <p style={{ margin: "8px 0 0", fontSize: 14, color: BRAND.green, fontWeight: 600 }}>{fileName}</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: BRAND.gray400 }}>{documentText.length} caractères extraits</p>
              </div>
            ) : (
              <div>
                <span style={{ fontSize: 28 }}>📎</span>
                <p style={{ margin: "8px 0 4px", fontSize: 14, fontWeight: 500, color: BRAND.gray600 }}>Glissez un fichier ou cliquez</p>
                <p style={{ margin: 0, fontSize: 12, color: BRAND.gray400 }}>TXT, MD (max 5 MB)</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept=".txt,.md" onChange={(e) => handleFile(e.target.files[0])} style={{ display: "none" }} />
          </div>
        </div>

        {/* Contexte additionnel */}
        <div style={{ marginBottom: 32 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: BRAND.gray800, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Contexte additionnel (optionnel)
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ex: Cible : DRH, secteur tech, angle innovation RH..."
            style={{
              width: "100%", padding: "12px 16px", fontSize: 14,
              border: `1.5px solid ${BRAND.gray200}`, borderRadius: 10, outline: "none",
              fontFamily: "inherit", color: BRAND.black, boxSizing: "border-box",
              background: BRAND.white,
            }}
          />
        </div>

        {/* Erreur */}
        {error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10,
            padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#DC2626",
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onGenerate}
          disabled={loading || subject.trim().length < 5}
          style={{
            width: "100%", padding: "18px 24px",
            background: loading || subject.trim().length < 5 ? BRAND.gray200 : BRAND.green,
            color: loading || subject.trim().length < 5 ? BRAND.gray400 : BRAND.white,
            border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
            cursor: loading || subject.trim().length < 5 ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.2s", letterSpacing: "-0.3px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Génération en cours...
            </>
          ) : (
            <>✨ Générer le contenu LinkedIn</>
          )}
        </button>

        {/* Info coût */}
        <p style={{ textAlign: "center", fontSize: 12, color: BRAND.gray400, margin: "12px 0 0" }}>
          Propulsé par Claude Haiku · ~$0.0008 par génération
        </p>
      </div>

      {/* Features */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 32 }}>
        {[
          { icon: "🎨", title: "8 layouts uniques", desc: "Visuel différent à chaque fois" },
          { icon: "✍️", title: "Post structuré", desc: "Hook → Contenu → CTA" },
          { icon: "💰", title: "Coûts minimisés", desc: "Claude Haiku, le moins cher" },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{
            background: BRAND.white, borderRadius: 12, padding: "20px 16px",
            border: `1px solid ${BRAND.gray200}`, textAlign: "center",
          }}>
            <span style={{ fontSize: 28 }}>{icon}</span>
            <p style={{ margin: "8px 0 4px", fontSize: 14, fontWeight: 600, color: BRAND.black }}>{title}</p>
            <p style={{ margin: 0, fontSize: 12, color: BRAND.gray600 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Vue résultats ─────────────────────────────────────────────────────────────
function ResultView({ result, visualConfig, svgRef, copied, onCopy, onRegenVisual, onBack, onDownload }) {
  return (
    <div>
      {/* Header résultat */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <button onClick={onBack} style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontSize: 14, color: BRAND.gray600, fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
          }}>
            ← Nouvelle génération
          </button>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: BRAND.black, letterSpacing: "-0.5px" }}>
            Votre contenu est prêt 🎉
          </h2>
        </div>
        <div style={{
          background: "rgba(0,184,43,0.08)", border: `1px solid rgba(0,184,43,0.2)`,
          borderRadius: 20, padding: "8px 16px",
          fontSize: 13, fontWeight: 600, color: BRAND.greenDark,
        }}>
          ✓ Généré avec Claude Haiku
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "start" }}>
        {/* Colonne gauche : Visuel */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: BRAND.gray800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Visuel LinkedIn (1200×627)
            </h3>
            <span style={{
              fontSize: 11, background: BRAND.gray100, borderRadius: 6,
              padding: "3px 8px", color: BRAND.gray600, fontWeight: 600,
            }}>
              Layout : {visualConfig.layout}
            </span>
          </div>

          <div style={{
            borderRadius: 12, overflow: "hidden",
            border: `1px solid ${BRAND.gray200}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}>
            <svg
              ref={svgRef}
              viewBox="0 0 1200 627"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "100%", height: "auto", display: "block" }}
            >
              <LinkedInVisualInner config={visualConfig} />
            </svg>
          </div>

          {/* Boutons visuel */}
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={onRegenVisual} style={{
              flex: 1, padding: "12px 16px",
              background: BRAND.white, border: `1.5px solid ${BRAND.gray200}`,
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: BRAND.gray700, cursor: "pointer", fontFamily: "inherit",
            }}>
              🔄 Nouveau layout
            </button>
            <button onClick={onDownload} style={{
              flex: 1, padding: "12px 16px",
              background: BRAND.green, border: "none",
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: BRAND.white, cursor: "pointer", fontFamily: "inherit",
            }}>
              ⬇️ Télécharger SVG
            </button>
          </div>
        </div>

        {/* Colonne droite : Post */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: BRAND.gray800, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Post LinkedIn
            </h3>
            <span style={{ fontSize: 12, color: BRAND.gray400 }}>
              {result.post.length} caractères
            </span>
          </div>

          {/* Preview LinkedIn */}
          <div style={{
            background: BRAND.white, borderRadius: 12,
            border: `1px solid ${BRAND.gray200}`,
            overflow: "hidden",
          }}>
            {/* Mock LinkedIn header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${BRAND.gray200}`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.greenDark})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: BRAND.white, fontWeight: 700, fontSize: 16,
              }}>
                V
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: BRAND.black }}>Votre Nom</p>
                <p style={{ margin: 0, fontSize: 12, color: BRAND.gray400 }}>Votre titre • Maintenant</p>
              </div>
            </div>

            {/* Contenu du post */}
            <div style={{
              padding: "20px", fontSize: 14, lineHeight: 1.7, color: BRAND.gray800,
              whiteSpace: "pre-wrap", maxHeight: 320, overflowY: "auto",
              fontFamily: "inherit",
            }}>
              {result.post}
            </div>
          </div>

          {/* Bouton copier */}
          <button onClick={onCopy} style={{
            width: "100%", marginTop: 12, padding: "14px 20px",
            background: copied ? BRAND.greenDark : BRAND.green,
            border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
            color: BRAND.white, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.2s",
          }}>
            {copied ? "✓ Copié dans le presse-papier !" : "📋 Copier le post"}
          </button>

          {/* Hashtags séparés */}
          {result.rawData?.post?.hashtags && (
            <div style={{ marginTop: 16 }}>
              <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: BRAND.gray600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Hashtags suggérés
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.rawData.post.hashtags.map((tag, i) => (
                  <span key={i} style={{
                    background: "rgba(0,184,43,0.08)", color: BRAND.greenDark,
                    padding: "5px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600,
                    border: `1px solid rgba(0,184,43,0.2)`,
                  }}>
                    #{tag.replace(/^#/, "")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bouton nouvelle génération */}
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <button onClick={onBack} style={{
          padding: "14px 32px", background: BRAND.black,
          color: BRAND.white, border: "none", borderRadius: 12,
          fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>
          ✨ Créer un nouveau post
        </button>
      </div>
    </div>
  );
}

// Composant SVG interne pour le ref
function LinkedInVisualInner({ config }) {
  return <LinkedInVisual config={config} />;
}

// ── Spinner de chargement ─────────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
