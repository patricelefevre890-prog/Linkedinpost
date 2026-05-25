/**
 * Service de génération de configurations visuelles
 * Génère des layouts CSS uniques à chaque appel pour éviter la répétition
 * Utilise uniquement la charte graphique : #00B82B, noir, blanc
 * Pas d'API externe → coût zéro
 */

// Palette stricte selon charte graphique
const COLORS = {
  green: '#00B82B',
  greenDark: '#009622',
  greenLight: '#00D432',
  black: '#0A0A0A',
  white: '#FFFFFF',
  gray: '#F5F5F5',
  grayMid: '#E0E0E0',
  grayDark: '#888888',
};

// Bibliothèque de layouts disponibles
const LAYOUTS = [
  'hero-centered',       // Titre centré, fond vert dominant
  'diagonal-split',      // Diagonale vert/blanc
  'sidebar-accent',      // Bande verte latérale gauche
  'top-bar',            // Barre verte en haut, contenu blanc
  'bottom-accent',       // Accent vert en bas
  'grid-minimal',        // Grille asymétrique minimaliste
  'full-green-inverse',  // Fond entièrement vert, texte blanc
  'frame-border',        // Encadrement vert autour du contenu
];

// Familles de polices avec fallbacks (Inter via Google Fonts)
const FONT_WEIGHTS = {
  headline: [700, 800, 900],
  subheadline: [400, 500, 600],
  keypoint: [600, 700],
};

/**
 * Génère une configuration visuelle unique et variée
 * @param {Object} content - Données textuelles issues de Claude
 * @returns {Object} - Configuration complète pour le rendu SVG/Canvas frontend
 */
export function generateVisualConfig(content) {
  // Sélection aléatoire du layout (seed basé sur le timestamp pour unicité)
  const layoutIndex = Math.floor(Math.random() * LAYOUTS.length);
  const layout = LAYOUTS[layoutIndex];

  // Variation des poids typographiques
  const headlineWeight = pickRandom(FONT_WEIGHTS.headline);
  const subWeight = pickRandom(FONT_WEIGHTS.subheadline);

  // Variation de l'espacement et des proportions
  const paddingVariant = pickRandom([40, 48, 56, 64]);
  const accentThickness = pickRandom([6, 8, 10, 12]);

  // Génération de la configuration selon le layout choisi
  const layoutConfig = generateLayoutConfig(layout, {
    headline: content?.headline || 'Votre titre ici',
    subheadline: content?.subheadline || 'Sous-titre explicatif',
    keyPoint: content?.keyPoint || 'Point clé à retenir',
    stat: content?.stat || null,
  });

  return {
    layout,
    layoutIndex,
    dimensions: { width: 1200, height: 627 }, // Format LinkedIn optimal
    colors: layoutConfig.colors,
    typography: {
      family: 'Inter',
      headlineWeight,
      subWeight,
      keyPointWeight: pickRandom(FONT_WEIGHTS.keypoint),
    },
    spacing: {
      padding: paddingVariant,
      accentSize: accentThickness,
      gap: pickRandom([16, 20, 24, 28]),
    },
    elements: layoutConfig.elements,
    content: {
      headline: content?.headline || 'Votre titre ici',
      subheadline: content?.subheadline || '',
      keyPoint: content?.keyPoint || '',
      stat: content?.stat || null,
    },
    decorative: generateDecorativeElements(layout),
  };
}

/**
 * Génère la configuration spécifique à chaque type de layout
 */
function generateLayoutConfig(layout, content) {
  const configs = {
    'hero-centered': {
      colors: {
        background: COLORS.green,
        primary: COLORS.white,
        secondary: 'rgba(255,255,255,0.75)',
        accent: COLORS.black,
      },
      elements: {
        headlineAlign: 'center',
        headlineSize: pickRandom([56, 64, 72]),
        contentPosition: 'center',
        showDivider: true,
        dividerColor: 'rgba(255,255,255,0.3)',
      },
    },
    'diagonal-split': {
      colors: {
        background: COLORS.white,
        primary: COLORS.black,
        secondary: COLORS.grayDark,
        accent: COLORS.green,
        split: COLORS.green,
      },
      elements: {
        headlineAlign: 'left',
        headlineSize: pickRandom([48, 56, 60]),
        splitAngle: pickRandom([8, 10, 12]),
        splitPosition: pickRandom([35, 40, 45]), // % depuis la gauche
        contentPosition: 'left',
        showDivider: false,
      },
    },
    'sidebar-accent': {
      colors: {
        background: COLORS.white,
        primary: COLORS.black,
        secondary: COLORS.grayDark,
        accent: COLORS.green,
        sidebar: COLORS.green,
      },
      elements: {
        headlineAlign: 'left',
        headlineSize: pickRandom([52, 60, 68]),
        sidebarWidth: pickRandom([8, 10, 12]),
        contentPosition: 'left',
        paddingLeft: pickRandom([80, 96, 112]),
        showDivider: false,
      },
    },
    'top-bar': {
      colors: {
        background: COLORS.white,
        primary: COLORS.black,
        secondary: COLORS.grayDark,
        accent: COLORS.green,
        bar: COLORS.green,
      },
      elements: {
        headlineAlign: pickRandom(['left', 'center']),
        headlineSize: pickRandom([56, 64, 72]),
        barHeight: pickRandom([8, 10, 12]),
        contentPosition: pickRandom(['top', 'center']),
        showDivider: true,
        dividerColor: COLORS.grayMid,
      },
    },
    'bottom-accent': {
      colors: {
        background: COLORS.black,
        primary: COLORS.white,
        secondary: 'rgba(255,255,255,0.7)',
        accent: COLORS.green,
        bar: COLORS.green,
      },
      elements: {
        headlineAlign: 'left',
        headlineSize: pickRandom([56, 64, 72]),
        barHeight: pickRandom([6, 8, 10]),
        contentPosition: 'bottom-left',
        showDivider: false,
      },
    },
    'grid-minimal': {
      colors: {
        background: COLORS.gray,
        primary: COLORS.black,
        secondary: COLORS.grayDark,
        accent: COLORS.green,
      },
      elements: {
        headlineAlign: 'left',
        headlineSize: pickRandom([48, 52, 56]),
        gridCols: 2,
        contentPosition: 'grid',
        showDivider: false,
        accentDot: true,
      },
    },
    'full-green-inverse': {
      colors: {
        background: COLORS.green,
        primary: COLORS.white,
        secondary: 'rgba(255,255,255,0.8)',
        accent: COLORS.black,
        card: 'rgba(0,0,0,0.1)',
      },
      elements: {
        headlineAlign: pickRandom(['left', 'center']),
        headlineSize: pickRandom([60, 68, 76]),
        contentPosition: pickRandom(['center', 'bottom-left']),
        showCard: true,
        showDivider: true,
        dividerColor: 'rgba(255,255,255,0.4)',
      },
    },
    'frame-border': {
      colors: {
        background: COLORS.white,
        primary: COLORS.black,
        secondary: COLORS.grayDark,
        accent: COLORS.green,
        border: COLORS.green,
      },
      elements: {
        headlineAlign: 'center',
        headlineSize: pickRandom([52, 60, 68]),
        borderWidth: pickRandom([4, 6, 8]),
        borderInset: pickRandom([12, 16, 20]),
        contentPosition: 'center',
        showDivider: true,
        dividerColor: COLORS.green,
      },
    },
  };

  return configs[layout] || configs['hero-centered'];
}

/**
 * Génère des éléments décoratifs pour enrichir le visuel
 */
function generateDecorativeElements(layout) {
  const decorations = [];

  // Cercles décoratifs
  if (Math.random() > 0.4) {
    decorations.push({
      type: 'circle',
      opacity: pickRandom([0.05, 0.08, 0.1, 0.12]),
      size: pickRandom([120, 160, 200, 240]),
      position: pickRandom(['top-right', 'bottom-left', 'top-left']),
    });
  }

  // Points pattern
  if (Math.random() > 0.5) {
    decorations.push({
      type: 'dots',
      opacity: pickRandom([0.08, 0.1, 0.12]),
      position: pickRandom(['bottom-right', 'top-right']),
      spacing: pickRandom([16, 20, 24]),
    });
  }

  // Ligne décorative
  if (Math.random() > 0.6) {
    decorations.push({
      type: 'line',
      opacity: pickRandom([0.15, 0.2, 0.25]),
      orientation: pickRandom(['horizontal', 'diagonal']),
      position: pickRandom(['top', 'bottom']),
    });
  }

  return decorations;
}

/**
 * Utilitaire : pick aléatoire dans un tableau
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
