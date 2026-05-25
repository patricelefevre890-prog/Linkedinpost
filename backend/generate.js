/**
 * Route de génération de contenu LinkedIn
 * Utilise Claude Haiku (modèle le moins coûteux) pour générer :
 * 1. Un post LinkedIn structuré (Hook → Développement → Conclusion + Sources)
 * 2. Une configuration visuelle unique pour chaque génération
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger.js';
import { generateVisualConfig } from '../services/visualGenerator.js';
import { buildPrompt } from '../services/promptBuilder.js';
import { cache } from '../utils/cache.js';

const anthropic = new Anthropic({ timeout: 30_000 });

/**
 * POST /api/generate
 * Body: { subject, context, documentText?, tone? }
 */
export async function generateContent(req, res) {
  const startTime = Date.now();

  try {
    const { subject, context, documentText, tone = 'professionnel' } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!subject || subject.trim().length < 5) {
      return res.status(400).json({ error: 'Le sujet doit contenir au moins 5 caractères.' });
    }
    if (subject.length > 500) {
      return res.status(400).json({ error: 'Le sujet ne peut pas dépasser 500 caractères.' });
    }

    // ── Cache ─────────────────────────────────────────────────────────────────
    const cacheKey = `${subject}-${context || ''}-${tone}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info('Réponse servie depuis le cache');
      return res.json({ ...cached, fromCache: true });
    }

    // ── Prompt ────────────────────────────────────────────────────────────────
    const userPrompt = buildPrompt({ subject, context, documentText, tone });

    // ── Appel Claude Haiku ────────────────────────────────────────────────────
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `Tu es un expert en marketing LinkedIn et en communication B2B francophone.
Tu génères du contenu professionnel, engageant et authentique.
Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.
Aucun CTA, aucune invitation à commenter, partager, liker ou suivre.
La dernière phrase du post est toujours une conclusion, jamais un appel à l'action.
Quand tu cites des chiffres ou anecdotes, tu fournis toujours leur source réelle (auteur, publication, année).
Si aucune source vérifiable n'existe, n'invente pas le chiffre.
Structure exacte requise :
{
  "post": {
    "hook": "première phrase accrocheuse (max 20 mots)",
    "body": "développement en 3-4 paragraphes courts",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "emoji": "1 emoji pertinent maximum",
    "sources": ["Auteur ou organisme, Titre ou étude, Année", "..."]
  },
  "visual": {
    "headline": "titre court et percutant (max 8 mots)",
    "subheadline": "sous-titre explicatif (max 15 mots)",
    "points": [
      { "stat": "chiffre ou % impactant", "label": "explication courte (max 10 mots)", "source": "Source courte" }
    ]
  }
}`,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // ── Parsing JSON ──────────────────────────────────────────────────────────
    const rawContent = message.content[0].text.trim();
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (parseError) {
      logger.error('Erreur parsing JSON Claude:', rawContent.substring(0, 200));
      return res.status(500).json({ error: 'La réponse de l\'IA n\'a pas pu être analysée. Réessayez.' });
    }

    // ── Config visuelle ───────────────────────────────────────────────────────
    const visualConfig = generateVisualConfig(parsed.visual);

    const result = {
      post: formatLinkedInPost(parsed.post),
      visual: visualConfig,
      rawVisualData: parsed.visual,
      rawPostData: parsed.post,
      meta: {
        model: 'claude-haiku-4-5',
        tokens: message.usage,
        processingTime: Date.now() - startTime,
      },
    };

    cache.set(cacheKey, result, 600);
    logger.info(`Contenu généré en ${Date.now() - startTime}ms | Tokens: ${JSON.stringify(message.usage)}`);
    res.json(result);

  } catch (error) {
    logger.error('Erreur génération:', error);
    if (error.status === 429) return res.status(429).json({ error: 'Limite API atteinte. Attendez avant de réessayer.' });
    if (error.status === 401) return res.status(500).json({ error: 'Configuration API invalide.' });
    res.status(500).json({
      error: 'Erreur lors de la génération du contenu. Réessayez.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Formate le post LinkedIn avec bloc sources — sans CTA
 */
function formatLinkedInPost(post) {
  if (!post) return '';

  const parts = [
    post.emoji ? `${post.emoji} ${post.hook}` : post.hook,
    '',
    post.body,
    '',
    post.hashtags?.map(h => `#${h.replace(/^#/, '')}`).join(' ') || '',
  ];

  // Ajout du bloc sources si présentes
  if (post.sources && post.sources.length > 0) {
    parts.push('');
    parts.push('──');
    parts.push('Sources : ' + post.sources.join(' · '));
  }

  return parts.filter(p => p !== undefined).join('\n');
}
