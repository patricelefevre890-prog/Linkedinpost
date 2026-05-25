/**
 * Service de construction des prompts pour Claude Haiku
 * Prompts courts et précis = moins de tokens = coût réduit
 */

export function buildPrompt({ subject, context, documentText, tone }) {
  const toneMap = {
    professionnel: 'professionnel et expert',
    inspirant: 'inspirant et motivant',
    éducatif: 'éducatif et pédagogique',
    storytelling: 'narratif avec storytelling',
  };

  const toneLabel = toneMap[tone] || 'professionnel';
  const docContext = documentText ? `\nContexte document : ${documentText.substring(0, 800)}` : '';
  const additionalContext = context ? `\nContexte additionnel : ${context.substring(0, 400)}` : '';

  return `Sujet LinkedIn : "${subject}"
Ton : ${toneLabel}${docContext}${additionalContext}

Génère un post LinkedIn (150-300 mots) + config visuelle.
Post : Hook percutant → 3 paragraphes courts → 3 hashtags.
Interdiction absolue d'ajouter un CTA, appel à l'action, invitation à commenter, partager ou suivre.
La dernière phrase est une conclusion, jamais un appel à l'action.
Visuel : headline 6-8 mots, subheadline 12-15 mots, keyPoint 10-12 mots.
Langue : Français uniquement.
Réponds UNIQUEMENT en JSON valide.`;
}
