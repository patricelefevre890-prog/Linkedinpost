import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Récupère et nettoie le contenu d'une URL
async function fetchUrlContent(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    // Supprime les balises HTML et garde le texte brut
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .substring(0, 2000);
    return text;
  } catch (e) {
    return null;
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { subject, context, documentText, tone = 'professionnel', url } = JSON.parse(event.body);

    if (!subject || subject.trim().length < 5) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Sujet trop court.' }) };
    }

    const toneLabels = {
      professionnel: 'professionnel et expert',
      inspirant: 'inspirant et motivant',
      éducatif: 'éducatif et pédagogique',
      storytelling: 'narratif avec storytelling',
    };

    // Récupération du contenu de l'URL si fournie
    let urlContent = '';
    if (url && url.startsWith('http')) {
      const fetched = await fetchUrlContent(url);
      if (fetched) urlContent = `\nContenu de l'URL (${url}) : ${fetched}`;
    }

    const docCtx = documentText ? `\nContexte document : ${documentText.substring(0, 800)}` : '';
    const addCtx = context ? `\nContexte additionnel : ${context.substring(0, 400)}` : '';

    const prompt = `Sujet LinkedIn : "${subject}"
Ton : ${toneLabels[tone] || 'professionnel'}${urlContent}${docCtx}${addCtx}

Génère un post LinkedIn (150-300 mots) + config visuelle.
Post : Hook percutant → 3 paragraphes courts → 3 hashtags.
Interdiction absolue de CTA, appel à l'action, invitation à commenter, partager ou suivre.
La dernière phrase est une conclusion, jamais un appel à l'action.
Si tu cites des chiffres, fournis leur source réelle (auteur, publication, année).
Si aucune source vérifiable n'existe, n'invente pas le chiffre.
Visual : headline 6-8 mots, subheadline 12-15 mots, 2-3 points clés avec stat + label + source.
Langue : Français uniquement.
Réponds UNIQUEMENT en JSON valide sans backticks.
Format exact :
{
  "post": {
    "hook": "...",
    "body": "...",
    "hashtags": ["...","...","..."],
    "emoji": "🔥",
    "sources": ["Auteur ou organisme, Titre, Année"]
  },
  "visual": {
    "headline": "...",
    "subheadline": "...",
    "points": [
      { "stat": "chiffre impactant", "label": "explication courte", "source": "Source courte" }
    ]
  }
}`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system: `Tu es un expert en marketing LinkedIn et communication B2B francophone.
Tu génères du contenu professionnel, engageant et authentique.
Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.
Aucun CTA, aucune invitation à commenter, partager, liker ou suivre.
La dernière phrase du post est toujours une conclusion, jamais un appel à l'action.
Quand tu cites des chiffres, fournis toujours leur source réelle.
Si aucune source vérifiable n'existe, n'invente pas le chiffre.`,
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
