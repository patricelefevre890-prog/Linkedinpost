import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { subject, context, documentText, tone = 'professionnel' } = JSON.parse(event.body);

    if (!subject || subject.trim().length < 5) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Sujet trop court.' }) };
    }

    const toneLabels = {
      professionnel: 'professionnel et expert',
      inspirant: 'inspirant et motivant',
      éducatif: 'éducatif et pédagogique',
      storytelling: 'narratif avec storytelling',
    };

    const docCtx = documentText ? `\nContexte document : ${documentText.substring(0, 800)}` : '';
    const addCtx = context ? `\nContexte additionnel : ${context.substring(0, 400)}` : '';

    const prompt = `Sujet LinkedIn : "${subject}"
Ton : ${toneLabels[tone] || 'professionnel'}${docCtx}${addCtx}

Génère un post LinkedIn (150-300 mots) + config visuelle.
Post : Hook percutant → 3 paragraphes courts → 3 hashtags.
Interdiction absolue de CTA, appel à l'action, invitation à commenter, partager ou suivre.
La dernière phrase est une conclusion, jamais un appel à l'action.
Si tu cites des chiffres, fournis leur source réelle (auteur, publication, année).
Réponds UNIQUEMENT en JSON valide sans backticks.
Format exact :
{
  "post": {
    "hook": "...",
    "body": "...",
    "hashtags": ["...","...","..."],
    "emoji": "🔥",
    "sources": ["Auteur, Titre, Année"]
  },
  "visual": {
    "headline": "...",
    "subheadline": "...",
    "points": [
      { "stat": "chiffre", "label": "explication courte", "source": "Source courte" }
    ]
  }
}`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: `Tu es un expert en marketing LinkedIn et communication B2B francophone.
Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.
Aucun CTA, aucune invitation à commenter, partager, liker ou suivre.
La dernière phrase du post est toujours une conclusion.
Quand tu cites des chiffres, fournis toujours leur source réelle.`,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim()
      .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: raw,
    };

  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Erreur serveur.' }),
    };
  }
};
