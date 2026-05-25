/**
 * Route de génération de contenu LinkedIn
 * Utilise Claude Haiku (modèle le moins coûteux) pour générer :
 * 1. Un post LinkedIn structuré (Hook → Explication → CTA)
 * 2. Une configuration visuelle unique pour chaque génération
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger.js';
import { generateVisualConfig } from '../services/visualGenerator.js';
import { buildPrompt } from '../services/promptBuilder.js';
import { cache } from '../utils/cache.js';

// Client Anthropic — la clé est injectée automatiquement depuis ANTHROPIC_API_KEY
const anthropic = new Anthropic({
  timeout: 30_000, // Timeout 30 secondes
});

/**
 * POST /api/generate
 * Body: { subject, context, documentText?, tone? }
 */
export async function generateContent(req, res) {
  const startTime = Date.now();
  
  try {
    const { subject, context, documentText, tone = 'professionnel' } = req.body;

    // ── Validation des inputs ─────────────────────────────────────────────────
    if (!subject || subject.trim().length < 5) {
      return res.status(400).json({
        error: 'Le sujet doit contenir au moins 5 caractères.',
      });
    }
    if (subject.length > 500) {
      return res.status(400).json({
        error: 'Le sujet ne peut pas dépasser 500 caractères.',
      });
    }

    // ── Vérification du cache pour éviter les appels redondants ──────────────
    const cacheKey = `${subject}-${context || ''}-${tone}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info('Réponse servie depuis le cache');
      return res.json({ ...cached, fromCache: true });
    }

    // ── Construction du prompt optimisé pour Haiku ────────────────────────────
    const userPrompt = buildPrompt({ subject, context, documentText, tone });

    // ── Appel API Claude Haiku ─────────────────────────────────────────────────
    // Modèle le moins coûteux : claude-haiku-4-5
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `Tu es un expert en marketing LinkedIn et en communication B2B francophone.
Tu génères du contenu professionnel, engageant et authentique.
Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks.
Structure exacte requise :
{
  "post": {
    "hook": "première phrase accrocheuse (max 20 mots)",
    "body": "développement en 3-4 paragraphes courts",
    "cta": "call-to-action clair",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "emoji": "1-2 emojis pertinents"
  },
  "visual": {
    "headline": "titre court et percutant (max 8 mots)",
    "subheadline": "sous-titre explicatif (max 15 mots)",
    "keyPoint": "point clé à retenir (max 12 mots)",
    "stat": "statistique ou chiffre impactant si pertinent (optionnel)"
  }
}`,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // ── Parsing de la réponse JSON ─────────────────────────────────────────────
    const rawContent = message.content[0].text.trim();
    let parsed;
    
    try {
      parsed = JSON.parse(rawContent);
    } catch (parseError) {
      logger.error('Erreur parsing JSON Claude:', rawContent.substring(0, 200));
      return res.status(500).json({
        error: 'La réponse de l\'IA n\'a pas pu être analysée. Réessayez.',
      });
    }

    // ── Génération de la configuration visuelle (côté serveur, gratuit) ───────
    const visualConfig = generateVisualConfig(parsed.visual);

    // ── Construction de la réponse finale ─────────────────────────────────────
    const result = {
      post: formatLinkedInPost(parsed.post),
      visual: visualConfig,
      rawVisualData: parsed.visual,
      meta: {
        model: 'claude-haiku-4-5',
        tokens: message.usage,
        processingTime: Date.now() - startTime,
      },
    };

    // ── Mise en cache (TTL 10 minutes) ─────────────────────────────────────────
    cache.set(cacheKey, result, 600);

    logger.info(`Contenu généré en ${Date.now() - startTime}ms | Tokens: ${JSON.stringify(message.usage)}`);
    
    res.json(result);

  } catch (error) {
    logger.error('Erreur génération:', error);

    // Gestion spécifique des erreurs Anthropic
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Limite API atteinte. Attendez quelques secondes avant de réessayer.',
      });
    }
    if (error.status === 401) {
      return res.status(500).json({
        error: 'Configuration API invalide. Contactez l\'administrateur.',
      });
    }

    res.status(500).json({
      error: 'Erreur lors de la génération du contenu. Réessayez.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * Formate le post LinkedIn en texte prêt à copier
 */
function formatLinkedInPost(post) {
  if (!post) return '';
  
  const parts = [
    post.emoji ? `${post.emoji} ${post.hook}` : post.hook,
    '',
    post.body,
    '',
    post.cta,
    '',
    post.hashtags?.map(h => `#${h.replace(/^#/, '')}`).join(' ') || '',
  ];

  return parts.filter(p => p !== undefined).join('\n');
}
