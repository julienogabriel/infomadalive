# INFO MADA LIVE — GUIDE COMPLET

## Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble)
2. [Créer le bot Telegram](#2-créer-le-bot-telegram)
3. [Déployer sur Vercel (100% gratuit)](#3-déployer-sur-vercel)
4. [Créer la page Facebook](#4-créer-la-page-facebook)
5. [Lancer le bot WhatsApp](#5-lancer-le-bot-whatsapp)
6. [Héberger le site web](#6-héberger-le-site-web)
7. [Stratégie de croissance](#7-stratégie-de-croissance)
8. [Monétisation](#8-monétisation)
9. [Commandes du bot](#9-commandes-du-bot)
10. [FAQ & Dépannage](#10-faq--dépannage)

---

## 1. Vue d'ensemble

**Info Mada Live** = plateforme d'infos utiles pour Madagascar.

```
Ce que tu offres :
⚡ Coupures JIRAMA (alertes en temps réel)
🔥 Bons plans & prix (où acheter moins cher)
💼 Offres d'emploi (jobs vérifiés)
⚠️ Alertes diverses (météo, trafic, événements)
```

### Structure du projet

```
infomadalive/
├── bot-telegram/          ← Bot Telegram principal
│   ├── api/
│   │   └── webhook.js     ← Code du bot (webhook Vercel)
│   ├── bot.js             ← Code du bot (version locale)
│   ├── data.js            ← Base de données locale
│   ├── package.json       ← Dépendances
│   ├── vercel.json        ← Config Vercel
│   ├── .env.example       ← Template variables
│   ├── setup-webhook.js   ← Script config webhook (1 fois)
│   ├── setup-jsonbin.js   ← Script config base de données (1 fois)
│   └── GUIDE.md           ← Guide bot Telegram
│
├── bot-whatsapp/           ← Bot WhatsApp
│   ├── bot-whatsapp.js     ← Code du bot
│   └── package.json        ← Dépendances
│
├── branding/               ← Identité visuelle
│   ├── identite.md         ← Nom, couleurs, slogan
│   ├── page-facebook.md    ← Config page FB + posts
│   ├── posts-malagasy.md   ← Posts en malgache + lexique
│   └── templates-posts.md  ← Templates Canva
│
├── monetisation/           ← Plan business
│   ├── strategie.md        ← Stratégie 4 phases
│   ├── facture-template.md ← Modèle de facture
│   └── suivi-clients.md    ← Pipeline clients
│
├── site-web/               ← Site vitrine
│   ├── index.html          ← Page web
│   └── DEPLOY.md           ← Guide hébergement
│
├── contenus-prets.md       ← Contenus prêts à publier
├── package.json            ← Config racine
└── GUIDE-COMPLET.md        ← CE FICHIER
```

### Stack technique

| Composant | Technologie | Coût |
|-----------|-------------|------|
| Bot Telegram | Node.js + Webhook | Gratuit |
| Hébergement bot | Vercel | Gratuit (pour toujours) |
| Base de données | JSONBin.io | Gratuit (10 000 req/mois) |
| Site web | HTML/CSS | Gratuit (Vercel ou GitHub Pages) |
| Bot WhatsApp | whatsapp-web.js | Gratuit (nécessite un PC) |

---

## 2. Créer le bot Telegram

### Étape 1 : Obtenir le token

1. Ouvre **Telegram** sur ton téléphone
2. Cherche **@BotFather** (le bot officiel de Telegram)
3. Envoie `/newbot`
4. Il te demande un nom → tape : `Info Mada Live`
5. Il te demande un username → tape : `InfoMadaLiveBot`
   - Si c'est pris, essaie : `InfoMadaLive_bot`, `InfoMada_Live_Bot`
6. BotFather te donne un **token** comme :
   ```
   7123456789:AAHx1234567890abcdef
   ```
7. **COPIE CE TOKEN** — c'est la clé de ton bot

### Étape 2 : Configurer le bot (description)

Toujours dans BotFather, envoie :
```
/setdescription
```
Choisis ton bot, puis colle :
```
🇲🇬 Info Mada Live — L'info utile au quotidien.
Coupures JIRAMA ⚡ Bons plans 🔥 Jobs 💼
Gratuit !
```

Puis :
```
/setabouttext
```
Colle :
```
Reçois chaque jour les coupures JIRAMA, bons plans et offres d'emploi à Madagascar. Tape /start pour commencer !
```

Puis :
```
/setcommands
```
Colle :
```
coupures - ⚡ Alertes coupures JIRAMA
bonsplans - 🔥 Bons plans du moment
jobs - 💼 Offres d'emploi
signaler - 📝 Signaler une info
menu - 📋 Voir toutes les options
stats - 📊 Nombre d'abonnés
partager - 📢 Partager le bot
```

### Étape 3 : Tester en local (optionnel)

```bash
cd bot-telegram
cp .env.example .env
# Ouvre .env et colle ton token + tes IDs
npm install
npm start
```

Le bot démarre en mode polling → teste sur Telegram avec `/start`.

---

## 3. Déployer sur Vercel (100% gratuit, pour toujours)

### Pourquoi Vercel ?

| | Vercel | Railway | Koyeb |
|--|--------|---------|-------|
| Gratuit | ✅ Pour toujours | ❌ 5$/mois après essai | ❌ Limité |
| Carte bancaire | Non requise | Requise | Requise |
| Auto-deploy | ✅ | ✅ | ✅ |
| Fiabilité | Excellente | Bonne | Bonne |

### Étape 1 : Créer la base de données JSONBin

JSONBin.io = base de données JSON en ligne, gratuite.

1. Va sur **jsonbin.io**
2. Crée un compte **gratuit** (email ou Google)
3. Une fois connecté, va dans **API Keys** (menu de gauche)
4. Copie ta **Master Key** (ressemble à : `$2a$10$xxx...`)
5. Sur ton PC, ouvre un terminal :

```bash
cd bot-telegram
npm install
node setup-jsonbin.js TA_MASTER_KEY
```

6. Le script affiche :
```
✅ Base de données créée !
JSONBIN_ID = 66xxx...
JSONBIN_KEY = $2a$10$xxx...
```

7. **NOTE CES 2 VALEURS** — tu en auras besoin dans Vercel

### Étape 2 : Déployer sur Vercel

1. Va sur **vercel.com**
2. Clique **"Sign up"** → **"Continue with GitHub"**
3. Autorise avec ton compte `julienogabriel`
4. Clique **"Add New Project"**
5. Tu vois ton repo `infomadalive` → clique **"Import"**
6. **IMPORTANT** — Configure :
   - **Root Directory** : clique "Edit" → tape `bot-telegram` → confirme
   - **Framework Preset** : Other
7. Ouvre **"Environment Variables"** et ajoute ces 4 variables :

| Name (exactement) | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | ton token BotFather (ex: `7123456789:AAHx...`) |
| `ADMIN_IDS` | laisse vide pour l'instant |
| `JSONBIN_ID` | l'ID du script setup-jsonbin (ex: `66xxx...`) |
| `JSONBIN_KEY` | ta Master Key JSONBin (ex: `$2a$10$xxx...`) |

8. Clique **"Deploy"**
9. Attends 30-60 secondes → tu vois "Congratulations!"
10. Vercel te donne une URL, par exemple : `https://infomadalive-xxx.vercel.app`
11. **COPIE CETTE URL**

### Étape 3 : Activer le webhook Telegram

Le webhook dit à Telegram : "envoie tous les messages à mon URL Vercel".

```bash
node setup-webhook.js TON_TOKEN https://ton-url.vercel.app
```

Exemple concret :
```bash
node setup-webhook.js 7123456789:AAHx1234 https://infomadalive-abc.vercel.app
```

Tu dois voir : `✅ Webhook configuré avec succès !`

### Étape 4 : Trouver ton Admin ID

1. Ouvre Telegram → va sur ton bot
2. Tape `/start` (tu dois recevoir le message de bienvenue !)
3. Tape `/monid`
4. Tu reçois un numéro (ex: `987654321`)
5. Va sur **Vercel** → ton projet → **Settings** → **Environment Variables**
6. Modifie `ADMIN_IDS` → mets ton numéro (ex: `987654321`)
7. Va dans **Deployments** → clique les 3 points du dernier deploy → **"Redeploy"**

### Étape 5 : Tester tout

Sur Telegram, tape :
```
/start          → Message de bienvenue ✅
/menu           → Toutes les commandes ✅
/monid          → Ton Chat ID ✅
/admin          → Commandes admin ✅
/addcoupure Analakely | 1er Avril 2026 | 4h    → ✅
/coupures       → Tu vois la coupure ✅
/addbonplan Riz | 2000 Ar kapoaka | Isotry     → ✅
/bonsplans      → Tu vois le bon plan ✅
/addjob Vendeur | Shoprite | 034 00 000 00     → ✅
/jobs           → Tu vois le job ✅
/stats          → 1 abonné ✅
/signaler       → Test crowdsourcing ✅
INFO            → Résumé rapide ✅
```

**C'est fait ! Ton bot tourne 24/7 gratuitement sur Vercel.**

### Mises à jour automatiques

Chaque fois que tu modifies le code et push :
```bash
git add -A
git commit -m "description du changement"
git push origin main
```
→ Vercel redéploie automatiquement en 30 secondes. Rien d'autre à faire.

---

## 4. Créer la page Facebook

### Étape 1 : Créer la page

1. Va sur Facebook → Pages → **Créer une page**
2. Nom : **Info Mada Live**
3. Catégorie : **Média / Actualités**
4. Bio (copie exactement) :
```
🇲🇬 Ton info utile au quotidien. Coupures JIRAMA ⚡ Bons plans 🔥 Jobs 💼 Gratuit. Rejoins-nous !
```

### Étape 2 : Photo de profil (Canva)

1. Va sur **canva.com** → Créer → 800x800px
2. Fond vert #007A3D
3. Texte blanc "IML" en gros (police Impact)
4. Exporte en PNG → upload sur Facebook

### Étape 3 : Photo de couverture (Canva)

1. Canva → Créer → 820x312px
2. Fond dégradé vert → rouge
3. Texte : "INFO MADA LIVE"
4. Sous-texte : "Coupures ⚡ Bons plans 🔥 Jobs 💼"
5. Exporte → upload

### Étape 4 : Description complète (À propos)

```
Info Mada Live — L'info utile, chaque jour, gratuitement.

On te donne chaque jour :
⚡ Les coupures JIRAMA dans ta zone
🔥 Les bons plans et meilleurs prix
💼 Les offres d'emploi du moment
⚠️ Les alertes importantes

Pourquoi nous suivre ?
→ Infos vérifiées
→ Mises à jour en temps réel
→ 100% gratuit
→ Par des Malgaches, pour des Malgaches

Rejoins aussi notre bot Telegram : t.me/InfoMadaLiveBot

Tu as une info utile ? Envoie-la nous en message privé !

#InfoMadaLive #Madagascar #Antananarivo #JIRAMA #BonsPlans #Emploi
```

### Étape 5 : Post épinglé

Publie ce post et ÉPINGLE-LE :

```
🇲🇬 BIENVENUE SUR INFO MADA LIVE !

On est là pour une seule raison : te donner les INFOS UTILES que tu cherches chaque jour.

Ce que tu trouves ici :

⚡ COUPURES JIRAMA → On te prévient AVANT que ça coupe
🔥 BONS PLANS & PRIX → Où acheter moins cher à Tana
💼 OFFRES D'EMPLOI → Des vraies offres, vérifiées
⚠️ ALERTES → Tout ce qui est important à savoir

📌 COMMENT ÇA MARCHE ?
1. Abonne-toi à cette page
2. Active les notifications (clique sur ⭐)
3. Partage avec tes amis

💬 Tu as une info utile ? Envoie-la nous en MP !

C'est GRATUIT. C'est pour NOUS TOUS.

#InfoMadaLive #Madagascar #JIRAMA #BonsPlans
```

### Étape 6 : Premiers posts (Jour 1)

Voir le fichier `branding/page-facebook.md` pour les 5 posts prêts à publier.
Voir le fichier `branding/posts-malagasy.md` pour les versions en malgache.
Voir le fichier `branding/templates-posts.md` pour les templates Canva.

### Groupes Facebook où partager

- "Bon plan Antananarivo"
- "Emploi Madagascar"
- "Vide dressing Tana" (beaucoup de membres actifs)
- "JIRAMA - coupures et infos"
- Groupes de quartier (Analakely, Ivandry, 67ha...)
- "Malgache entreprenant"
- "Madagascar Actualités"

**Règle : ne spam pas.** Partage UN post utile par groupe avec un vrai message.

---

## 5. Lancer le bot WhatsApp

### Prérequis
- Un PC ou serveur avec Node.js
- Un numéro WhatsApp dédié (pas ton numéro perso)

### Installation

```bash
cd bot-whatsapp
npm install
node bot-whatsapp.js
```

### Première connexion
1. Un QR code s'affiche dans le terminal
2. Ouvre WhatsApp → Appareils connectés → Scanner
3. Scanne le QR code
4. Le bot est connecté !

### Configuration admin
Dans `.env` ou en variable d'environnement :
```
ADMIN_WHATSAPP=261XXXXXXXXX@c.us
```

### Commandes utilisateur (WhatsApp)

| Message | Réponse |
|---------|---------|
| MENU | Menu principal |
| COUPURE | Alertes JIRAMA |
| BONPLAN | Bons plans |
| JOB | Offres emploi |
| INFO | Résumé rapide |
| PARTAGER | Lien de partage |

### Commandes admin (WhatsApp)

| Message | Exemple |
|---------|---------|
| !coupure | `!coupure Analakely \| 1er Avril \| 4h` |
| !bonplan | `!bonplan Riz pas cher \| 2000 Ar \| Marché` |
| !job | `!job Dev \| TechCo \| 034 00 000 00` |
| !broadcast | `!broadcast Bonne journée à tous !` |

### Important
- Le bot WhatsApp doit tourner sur un PC allumé en permanence
- Commence par le bot Telegram (plus simple, hébergé sur Vercel)
- Ajoute WhatsApp plus tard quand tu as de la traction

---

## 6. Héberger le site web

### Option 1 : Vercel (recommandé)

Tu peux héberger le site sur Vercel en créant un 2ème projet :
1. Vercel → "Add New Project" → même repo
2. Root Directory → `site-web`
3. Deploy

### Option 2 : GitHub Pages (gratuit aussi)

1. Crée un nouveau repo : `julienogabriel.github.io`
2. Upload `index.html` dedans
3. Ton site sera sur `https://julienogabriel.github.io`

### Personnaliser

Ouvre `site-web/index.html` et remplace :
- `261XXXXXXXXX` → ton vrai numéro WhatsApp
- `InfoMadaLiveBot` → le vrai username de ton bot
- `infomadalive@gmail.com` → ton vrai email

---

## 7. Stratégie de croissance

### Semaine 1 : Lancement (objectif 200 abonnés)
- 3 posts/jour (7h, 12h, 19h)
- Partager dans 10+ groupes Facebook
- Demander aux amis/famille de partager
- Poster en français ET malgache

### Semaine 2 : Engagement (objectif 500 abonnés)
- Sondages et questions chaque jour
- Commencer les vraies alertes JIRAMA
- Poster des bons plans vérifiés

### Semaine 3 : Viralité (objectif 1000 abonnés)
- "Tague 3 amis qui ont besoin de cette page"
- Concours : "Partage et gagne [lot]"
- Promouvoir le bot Telegram

### Semaine 4 : Monétisation test (objectif 2000 abonnés)
- Premier post sponsorisé (gratuit, pour tester)
- Proposer aux petits commerces
- Créer le tarif : 5000 Ar / publication

### Calendrier de publication (semaine type)

| Jour     | 7h                   | 12h                | 19h                   |
|----------|----------------------|--------------------|-----------------------|
| Lundi    | Coupures du jour     | Bon plan prix      | Job du jour           |
| Mardi    | Coupures du jour     | Astuce pratique    | Bon plan              |
| Mercredi | Coupures du jour     | Bon plan prix      | Sondage engagement    |
| Jeudi    | Coupures du jour     | Job du jour        | Bon plan              |
| Vendredi | Coupures du jour     | Bon plan weekend   | Appel à partager      |
| Samedi   | Résumé de la semaine | Bon plan marché    | -                     |
| Dimanche | -                    | Motivation/astuce  | Programme semaine     |

### Où trouver les infos

1. **Coupures JIRAMA** : Page Facebook JIRAMA, groupes quartier
2. **Prix** : Aller au marché, commerçants, groupes Facebook
3. **Jobs** : moov.mg, emploi.mg, pages Facebook entreprises
4. **Alertes** : Météo Madagascar, infos trafic

---

## 8. Monétisation

### Phase 1 (0-1000 abonnés) : 0 Ar
Construire l'audience. 3 posts/jour.

### Phase 2 (1000-5000 abonnés) : 50 000 - 200 000 Ar/mois

| Service | Prix |
|---------|------|
| 1 post bon plan | 5 000 Ar |
| 1 post + story | 8 000 Ar |
| Pack 5 posts | 20 000 Ar |
| Mention broadcast bot | 3 000 Ar |

**Clients cibles :** restaurants, vendeurs marché, boutiques, épiceries

**Script de démarchage :**
```
"Salut ! Je gère Info Mada Live, une page avec [X] abonnés.
On publie les bons plans, les gens adorent.
Je peux publier ton offre pour 5 000 Ar.
Tu veux essayer une fois gratuitement ?"
```
**Astuce :** Offre le PREMIER post gratuit. Montre les stats. Le client revient et paie.

### Phase 3 (5000-20000 abonnés) : 200 000 - 1 000 000 Ar/mois

| Service | Prix |
|---------|------|
| 1 post | 10 000 Ar |
| Post + story + broadcast | 20 000 Ar |
| Pack semaine | 50 000 Ar |
| Pack mois | 150 000 Ar |

Plus : Abonnements VIP, offres d'emploi payantes, commissions.
Voir `monetisation/strategie.md` pour tous les détails.

### Phase 4 (20000+ abonnés) : 1 000 000 - 5 000 000+ Ar/mois

- Application mobile (Angular + Spring Boot + PostgreSQL)
- Partenariats entreprises (Orange, Telma, Shoprite...)
- Data & insights
- Franchise dans d'autres villes

### Outils de paiement

| Outil | Usage |
|-------|-------|
| MVola (Telma) | Le plus utilisé |
| Orange Money | Très répandu |
| Airtel Money | 3ème option |
| Espèces | Petits commerces |

Voir `monetisation/facture-template.md` pour le modèle de facture.
Voir `monetisation/suivi-clients.md` pour le pipeline de démarchage.

---

## 9. Commandes du bot

### Commandes utilisateur (Telegram)

| Commande | Description |
|----------|-------------|
| `/start` | Accueil + inscription |
| `/menu` | Toutes les commandes |
| `/coupures` | Alertes coupures JIRAMA |
| `/bonsplans` | Bons plans du moment |
| `/jobs` | Offres d'emploi |
| `/signaler` | Signaler une info (crowdsourcing) |
| `/stats` | Nombre d'abonnés |
| `/partager` | Partager le bot |
| `/monid` | Voir son Chat ID |
| `INFO` | Résumé rapide (mot-clé) |

### Commandes admin (Telegram)

| Commande | Exemple |
|----------|---------|
| `/admin` | Voir toutes les commandes admin |
| `/addcoupure` | `/addcoupure Analakely \| 31 Mars \| 4h` |
| `/addbonplan` | `/addbonplan Riz \| 2000 Ar \| Marché Analakely` |
| `/addjob` | `/addjob Dev \| TechCo \| 034 00 000 00` |
| `/broadcast` | `/broadcast Bonne journée à tous !` |
| `/listeabonnes` | Voir les 20 derniers abonnés |

### Crowdsourcing (utilisateurs envoient des infos)

Via `/signaler` puis `/signal` :
```
/signal coupure | Analakely | Demain 8h | 4h
/signal bonplan | Riz pas cher | 2000 Ar | Marché Isotry
/signal job | Vendeur | Shoprite | 034 00 000 00
```
L'info est envoyée aux admins pour vérification avant publication.

---

## 10. FAQ & Dépannage

### Le bot ne répond pas
1. Vérifie que le webhook est configuré :
   ```bash
   node setup-webhook.js TON_TOKEN TON_URL_VERCEL
   ```
2. Vérifie les variables sur Vercel (Settings → Environment Variables)
3. Va dans Vercel → Logs pour voir les erreurs

### Le bot répond en double
Le webhook est peut-être configuré 2 fois. Lance :
```bash
node setup-webhook.js TON_TOKEN TON_URL_VERCEL
```
Le script supprime l'ancien webhook avant d'en créer un nouveau.

### Je veux ajouter un 2ème admin
Sur Vercel, modifie la variable `ADMIN_IDS` :
```
987654321,123456789
```
(sépare les IDs par des virgules, puis Redeploy)

### Les données disparaissent
Vérifie que `JSONBIN_ID` et `JSONBIN_KEY` sont corrects dans Vercel.
Va sur jsonbin.io → tes bins → vérifie que le bin existe.

### Je veux modifier le bot
1. Modifie `bot-telegram/api/webhook.js`
2. Push sur GitHub :
```bash
git add -A
git commit -m "description du changement"
git push origin main
```
3. Vercel redéploie automatiquement en 30 secondes

### Comment passer à PostgreSQL plus tard ?
Quand tu dépasses les limites de JSONBin (10 000 req/mois) :
1. Crée une base gratuite sur **neon.tech** ou **supabase.com**
2. Remplace les fonctions loadDB/saveDB dans `api/webhook.js`
3. Les données persistent indéfiniment

### Limites Vercel gratuit
- 100 Go de bande passante/mois (largement suffisant)
- Fonctions serverless : 100 000 exécutions/mois (largement suffisant)
- Pas de limite de temps
- Pas de carte bancaire requise

### Limites JSONBin gratuit
- 10 000 requêtes/mois
- Suffisant pour environ 300 utilisateurs actifs/jour
- Si tu dépasses → migre vers Supabase (gratuit aussi, 500 Mo)

### Liens utiles
- Repo GitHub : github.com/julienogabriel/infomadalive
- Vercel : vercel.com
- JSONBin : jsonbin.io
- BotFather : t.me/BotFather
- Canva : canva.com
