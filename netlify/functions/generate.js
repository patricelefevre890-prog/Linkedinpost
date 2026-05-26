import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function fetchUrlContent(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .substring(0, 2000);
  } catch (e) { return null; }
}

async function generateVersion(prompt, angle) {
  const angleInstructions = {
    factuel: `Angle FACTUEL : utilise des chiffres, statistiques et données concrètes. Structure : fait marquant → analyse → données → conclusion factuelle.`,
    storytelling: `Angle STORYTELLING : commence par une anecdote ou scénario concret. Structure : situation vécue → tension → révélation → leçon.`,
    opinion: `Angle PRISE DE POSITION : commence par une affirmation forte ou contre-intuitive. Structure : assertion forte → argument → nuance → conclusion tranchée.`,
  };

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: `Tu es un expert en marketing LinkedIn et communication B2B francophone.
Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.
Aucun CTA, aucune invitation à commenter, partager, liker ou suivre.
La dernière phrase est toujours une conclusion, jamais un appel à l'action.
Quand tu cites des chiffres, fournis leur source réelle. Si aucune source vérifiable n'existe, n'invente pas le chiffre.`,
    messages: [{ role: 'user', content: `${prompt}\n\n${angleInstructions[angle]}\n\nFormat JSON exact :\n{"hook":"...","body":"...","hashtags":["...","...","..."],"emoji":"🔥","sources":["Auteur, Titre, Année"]}` }],
  });

  const raw = message.content[0].text.trim()
    .replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(raw);
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { subject, context, documentText, tone = 'professionnel', url } = JSON.parse(event.body);

    if (!subject || subject.trim().length < 5) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Sujet trop court.' }) };
    }

    const toneLabels = {
      professionnel: 'professionnel et expert',
      inspirant: 'inspirant et motivant',
      éducatif: 'éducatif et pédagogique',
    };

    let urlContent = '';
    if (url?.startsWith('http')) {
      const fetched = await fetchUrlContent(url);
      if (fetched) urlContent = `\nContenu de l'URL : ${fetched}`;
    }

    const docCtx = documentText ? `\nContexte document : ${documentText.substring(0, 800)}` : '';
    const addCtx = context ? `\nContexte additionnel : ${context.substring(0, 400)}` : '';

    const basePrompt = `Sujet LinkedIn : "${subject}"
Ton : ${toneLabels[tone] || 'professionnel'}${urlContent}${docCtx}${addCtx}

Génère un post LinkedIn de 150-300 mots avec 3 hashtags.
Interdiction absolue de CTA ou invitation à commenter/partager.
La dernière phrase est une conclusion.
Langue : Français uniquement.`;

    // Génération des 3 versions en parallèle
    const [factuel, storytelling, opinion] = await Promise.all([
      generateVersion(basePrompt, 'factuel'),
      generateVersion(basePrompt, 'storytelling'),
      generateVersion(basePrompt, 'opinion'),
    ]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ factuel, storytelling, opinion }),
    };

  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Erreur serveur.' }),
    };
  }
};
