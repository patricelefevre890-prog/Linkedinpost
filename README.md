# 🚀 LinkedIn Content Generator

Plateforme SaaS de génération de contenu LinkedIn combinant visuels SVG et posts textuels,
alimentée par **Claude Haiku** (modèle le moins coûteux d'Anthropic).

---

## 📁 Structure du projet

```
linkedin-generator/
├── backend/
│   ├── server.js                    ← Serveur Express principal
│   ├── package.json
│   ├── routes/
│   │   ├── generate.js              ← POST /api/generate (Claude Haiku)
│   │   └── upload.js                ← POST /api/upload (documents)
│   ├── services/
│   │   ├── visualGenerator.js       ← Génération configs visuelles variées
│   │   └── promptBuilder.js         ← Construction prompts optimisés
│   └── utils/
│       ├── cache.js                 ← Cache mémoire TTL 10min
│       └── logger.js                ← Logger structuré
├── frontend/
│   └── linkedin-generator-app.jsx  ← Application React complète
├── .env.example
└── README.md
```

---

## 🔧 Installation

### Prérequis
- Node.js 18+
- Une clé API Anthropic (https://console.anthropic.com)

### Backend

```bash
cd backend
npm install
cp ../.env.example .env
# Éditez .env et ajoutez ANTHROPIC_API_KEY=sk-ant-...
npm start
```

### Frontend (artifact React autonome)
Le fichier `linkedin-generator-app.jsx` est un artifact React complet.
Il peut être utilisé directement dans Claude.ai ou intégré dans une app React :

```bash
# Pour une app Vite/React :
npm create vite@latest frontend -- --template react
cd frontend
npm install
# Copier linkedin-generator-app.jsx dans src/App.jsx
npm run dev
```

---

## 🌐 API Endpoints

### POST /api/generate
Génère un post LinkedIn + configuration visuelle.

**Body JSON :**
```json
{
  "subject": "Comment l'IA transforme les RH en 2025",
  "context": "Cible DRH, secteur tech",
  "documentText": "Texte extrait du document (optionnel)",
  "tone": "professionnel"
}
```

**Tons disponibles :** `professionnel` | `inspirant` | `éducatif` | `storytelling`

**Réponse :**
```json
{
  "post": "✨ Hook percutant...\n\nDéveloppement...\n\nCTA\n\n#hashtag1 #hashtag2",
  "visual": {
    "layout": "sidebar-accent",
    "content": {
      "headline": "L'IA redéfinit les ressources humaines",
      "subheadline": "De nouvelles pratiques RH pour 2025",
      "keyPoint": "Automatisation + Intelligence humaine"
    },
    "dimensions": { "width": 1200, "height": 627 }
  },
  "meta": {
    "model": "claude-haiku-4-5",
    "tokens": { "input_tokens": 245, "output_tokens": 380 },
    "processingTime": 1842
  }
}
```

### POST /api/upload
Upload et extraction de texte d'un document.

```bash
curl -X POST http://localhost:3001/api/upload \
  -F "document=@mon-fichier.txt"
```

**Réponse :**
```json
{
  "success": true,
  "filename": "mon-fichier.txt",
  "extractedText": "Contenu extrait...",
  "charCount": 1245,
  "preview": "Début du contenu..."
}
```

### GET /api/health
Vérification de l'état du serveur.

---

## 🎨 Layouts visuels disponibles

8 layouts générés aléatoirement à chaque appel :

| Layout | Description |
|--------|-------------|
| `hero-centered` | Fond vert, titre centré, style impact |
| `diagonal-split` | Diagonale vert/blanc, composition dynamique |
| `sidebar-accent` | Bande verte latérale gauche, contenu blanc |
| `top-bar` | Barre verte supérieure, design épuré |
| `bottom-accent` | Fond noir, accent vert en bas |
| `frame-border` | Encadrement vert autour du contenu |
| `full-green-inverse` | Fond vert plein, texte blanc |
| `grid-minimal` | Grille asymétrique, carte de stat verte |

---

## 💰 Optimisation des coûts

### Pourquoi Claude Haiku ?
- **80× moins cher** que Claude Opus pour des résultats excellents sur ce cas d'usage
- Coût estimé : **~$0.0008 par génération** (245 tokens in + 380 tokens out)
- Pour 1000 générations/mois : ~$0.80

### Mécanismes de réduction des coûts
1. **Prompts courts** : Prompt utilisateur limité à ~100 tokens
2. **Cache mémoire** : TTL 10 min, évite les appels redondants
3. **Rate limiting** : 10 requêtes/minute/IP
4. **Texte tronqué** : Documents limités à 800 chars envoyés à Claude
5. **max_tokens: 1024** : Réponse limitée à l'essentiel

---

## 🚀 Déploiement

### Railway / Render / Fly.io (recommandé)

```bash
# Variables d'environnement à configurer :
ANTHROPIC_API_KEY=sk-ant-votre-cle
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://votre-frontend.com
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY backend/package.json .
RUN npm install --production
COPY backend/ .
EXPOSE 3001
CMD ["node", "server.js"]
```

### Vercel (frontend uniquement)
Le composant React peut être déployé sur Vercel/Netlify.
Pointez `VITE_API_URL` vers votre backend déployé.

---

## 🔒 Sécurité

- Helmet.js pour les headers HTTP sécurisés
- Rate limiting par IP (express-rate-limit)
- Validation des inputs côté serveur
- Limitation de taille des fichiers (5 MB)
- Pas d'exposition de la clé API au frontend

---

## 📊 Exemples cURL

### Générer un post complet
```bash
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Les 3 erreurs qui tuent la productivité de votre équipe",
    "tone": "éducatif",
    "context": "Cible managers, PME 50-200 salariés"
  }'
```

### Uploader un document
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "document=@rapport-rh.txt"
```

---

## 🛠️ Évolutions possibles

- **Batch API** : Pour traitement groupé de 10+ posts simultanés (économie 50%)
- **Stockage S3** : Sauvegarde des visuels générés
- **Historique** : Base de données SQLite ou PostgreSQL
- **Export PNG** : Canvas API côté serveur avec Sharp.js
- **Templates** : Bibliothèque de templates métiers
- **Webhook** : Publication automatique via LinkedIn API

---

*Développé avec ❤️ · Charte graphique : #00B82B, Noir, Blanc · Police : Inter*
