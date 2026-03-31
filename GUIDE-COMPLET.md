# INFO MADA LIVE — GUIDE COMPLET

## Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble)
2. [Créer le bot Telegram](#2-créer-le-bot-telegram)
3. [Déployer sur Koyeb (gratuit)](#3-déployer-sur-koyeb)
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
│   ├── bot.js             ← Code du bot
│   ├── data.js            ← Base de données JSON
│   ├── package.json       ← Dépendances
│   ├── .env.example       ← Template variables
│   ├── Procfile            ← Config déploiement
│   ├── railway.json        ← Config Railway (backup)
│   └── GUIDE.md            ← Guide bot Telegram
│
├── bot-whatsapp/           ← Bot WhatsApp
│   ├── bot-whatsapp.js     ← Code du bot
│   └── package.json        ← Dépendances
│
├── branding/               ← Identité visuelle
│   ├── identite.md         ← Nom, couleurs, slogan
│   ├── page-facebook.md    ← Config page FB
│   ├── posts-malagasy.md   ← Posts en malgache
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
├── Dockerfile              ← Config Docker (Koyeb)
├── .dockerignore
├── package.json            ← Config racine
├── railway.json            ← Config Railway
├── Procfile
└── GUIDE-COMPLET.md        ← CE FICHIER
```

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
# Ouvre .env et colle ton token
npm install
npm start
```

Le bot démarre → teste sur Telegram avec `/start`.

---

## 3. Déployer sur Koyeb (gratuit, 24/7)

### Étape 1 : Créer un compte

1. Va sur **app.koyeb.com**
2. Clique **"Sign up with GitHub"**
3. Autorise avec ton compte GitHub

### Étape 2 : Créer le service

1. Clique **"Create Service"**
2. Source : **GitHub**
3. Repo : **julienogabriel/infomadalive**
4. Branch : **main**
5. Builder : **Docker** (détecté automatiquement)

### Étape 3 : Configuration

1. Instance : **Free (nano)**
2. Region : **Frankfurt** (proche Madagascar)
3. Environment variables :

| Clé | Valeur |
|-----|--------|
| `TELEGRAM_BOT_TOKEN` | `7123456789:AAHx...` (ton token) |
| `ADMIN_IDS` | (vide pour l'instant) |

4. Health check : mettre sur **None** ou TCP
5. Clique **"Deploy"**

### Étape 4 : Trouver ton Admin ID

1. Le bot est maintenant en ligne
2. Va sur Telegram → parle à ton bot
3. Tape `/monid`
4. Tu reçois un numéro (ex: `987654321`)
5. Va sur Koyeb → ton service → Settings → Environment
6. Modifie `ADMIN_IDS` = `987654321`
7. Koyeb redéploie automatiquement

### Étape 5 : Vérifier

Tape sur Telegram :
- `/start` → message de bienvenue ✅
- `/admin` → commandes admin ✅
- `/addcoupure Test | Aujourd'hui | 2h` → ajouter test ✅
- `/coupures` → voir le test ✅

**Ton bot tourne maintenant 24/7 gratuitement.**

### Mises à jour automatiques

Chaque fois que tu push sur GitHub :
```bash
git add -A
git commit -m "mise à jour"
git push origin main
```
→ Koyeb redéploie automatiquement en 1-2 minutes.

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

⚡ COUPURES JIRAMA
→ On te prévient AVANT que ça coupe

🔥 BONS PLANS & PRIX
→ Où acheter moins cher à Tana

💼 OFFRES D'EMPLOI
→ Des vraies offres, vérifiées

⚠️ ALERTES
→ Tout ce qui est important à savoir

📌 COMMENT ÇA MARCHE ?
1. Abonne-toi à cette page
2. Active les notifications (clique sur ⭐)
3. Partage avec tes amis

💬 Tu as une info utile ? Envoie-la nous en MP !

C'est GRATUIT. C'est pour NOUS TOUS.

#InfoMadaLive #Madagascar #JIRAMA #BonsPlans
```

### Étape 6 : Premiers posts (Jour 1)

**7h du matin :**
```
⚡ BONJOUR TANA !

Rappel : pensez à charger vos téléphones et préparer de l'eau.
Les coupures JIRAMA sont fréquentes en ce moment.

Suivez cette page pour être prévenus EN AVANCE.
🔔 Active les notifications → tu seras le premier informé.

#JIRAMA #Antananarivo #InfoMadaLive
```

**10h :**
```
📊 SONDAGE — On veut savoir !

Quel est ton PLUS GROS problème au quotidien ?

👉 1 = Les coupures JIRAMA
👉 2 = Les prix qui augmentent
👉 3 = Trouver du travail
👉 4 = Autre (dis-nous en commentaire !)

Réponds en commentaire !

#Madagascar #InfoMadaLive
```

**12h :**
```
🔥 BON PLAN DU JOUR

Tu savais que le riz est moins cher au marché de [lieu] en ce moment ?

💰 Environ [prix] Ar le kapoaka
📍 [Lieu exact]
⏰ Meilleur moment : tôt le matin

Partage pour aider quelqu'un ! 👇

#BonPlan #Riz #Madagascar #InfoMadaLive
```

**15h :**
```
💼 OFFRE D'EMPLOI

[Entreprise] recrute : [Poste]

📍 Lieu : [Ville/Quartier]
💰 Salaire : [X] Ar
📞 Contact : [Numéro/Email]
📅 Date limite : [Date]

Partage ! Ça peut changer la vie de quelqu'un.

#Emploi #Recrutement #Madagascar #InfoMadaLive
```

**19h :**
```
📢 ON A BESOIN DE TOI !

Info Mada Live, c'est une page PAR les Malgaches, POUR les Malgaches.

🎯 Objectif : 1000 abonnés cette semaine

1. Like cette page ✅
2. Partage ce post ↗️
3. Invite 3 amis 👥

Ensemble, on s'informe mieux. Misaotra ! 🙏

#InfoMadaLive #Madagascar #Communauté
```

### Groupes Facebook où partager

- "Bon plan Antananarivo"
- "Emploi Madagascar"
- "Vide dressing Tana"
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
Ouvre `bot-whatsapp.js`, trouve la ligne :
```javascript
const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP || '';
```
Mets ton numéro au format `261XXXXXXXXX@c.us`

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
- Ou sur un VPS (serveur en ligne)
- Commence par le bot Telegram (plus simple), ajoute WhatsApp plus tard

---

## 6. Héberger le site web (GitHub Pages, gratuit)

1. Va sur ton repo GitHub : github.com/julienogabriel/infomadalive
2. Settings → **Pages**
3. Source : **Deploy from a branch**
4. Branch : **main** → dossier **/site-web** (ou **/ root**)
5. Save

**Problème** : GitHub Pages sert depuis la racine. Solution simple :

Option A : Copier `site-web/index.html` à la racine (mais ça écrase)

Option B : Créer un repo séparé juste pour le site :
1. Crée un nouveau repo : `julienogabriel.github.io`
2. Upload `index.html` dedans
3. Ton site sera sur `https://julienogabriel.github.io`

### Personnaliser le site

Ouvre `site-web/index.html` et remplace :
- `261XXXXXXXXX` → ton vrai numéro WhatsApp
- `InfoMadaLiveBot` → le vrai username de ton bot
- `infomadalive@gmail.com` → ton vrai email
- Les stats (1000+) → tes vrais chiffres

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
- Lancer le bot Telegram

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
- Construire l'audience
- 3 posts/jour
- Objectif : engagement

### Phase 2 (1000-5000 abonnés) : 50 000 - 200 000 Ar/mois

**Posts sponsorisés :**

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

### Phase 3 (5000-20000 abonnés) : 200 000 - 1 000 000 Ar/mois

**Tarifs augmentés :**

| Service | Prix |
|---------|------|
| 1 post | 10 000 Ar |
| Post + story + broadcast | 20 000 Ar |
| Pack semaine | 50 000 Ar |
| Pack mois | 150 000 Ar |

**Abonnement VIP :**

| Offre | Prix |
|-------|------|
| VIP Hebdo | 2 000 Ar/semaine |
| VIP Mensuel | 5 000 Ar/mois |
| VIP Pro | 15 000 Ar/mois |

**Offres d'emploi payantes :**

| Service | Prix |
|---------|------|
| 1 offre simple | 10 000 Ar |
| Offre + boost | 25 000 Ar |
| Pack 5 offres | 40 000 Ar |

### Phase 4 (20000+ abonnés) : 1 000 000 - 5 000 000+ Ar/mois

- Application mobile (Angular + Spring Boot + PostgreSQL)
- Partenariats grandes entreprises (Orange, Telma, Shoprite...)
- Data & insights
- Franchise dans d'autres villes

### Outils de paiement

| Outil | Usage |
|-------|-------|
| MVola (Telma) | Le plus utilisé |
| Orange Money | Très répandu |
| Airtel Money | 3ème option |
| Virement | Pour entreprises |
| Espèces | Petits commerces |

### Template de facture

```
═══════════════════════════════════════
           INFO MADA LIVE
═══════════════════════════════════════

FACTURE N° : IML-2026-001
Date : [DATE]

DE : Info Mada Live
MVola : [Numéro]

À : [Client]

───────────────────────────────────────
| Service              | Prix        |
|----------------------|-------------|
| Post sponsorisé      | 10 000 Ar   |
| Story Facebook       | 5 000 Ar    |
───────────────────────────────────────
TOTAL :                  15 000 Ar
───────────────────────────────────────

Paiement : MVola [numéro] / Orange Money [numéro]
═══════════════════════════════════════
```

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
| `/partager` | Lien de partage |
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

### Planificateur automatique

Le bot envoie automatiquement à tous les abonnés :
- **7h** (heure Mada) → Coupures du jour
- **12h** → Bons plans du midi
- **19h** → Offres d'emploi du soir

Le contenu est tiré de ce que tu as ajouté via /addcoupure, /addbonplan, /addjob.

### Crowdsourcing

Les utilisateurs peuvent signaler des infos via `/signaler` :
1. Ils choisissent le type (coupure, bon plan, job, alerte)
2. Ils indiquent la zone
3. Ils donnent les détails
4. L'info est envoyée aux admins
5. L'admin vérifie et publie si c'est fiable

---

## 10. FAQ & Dépannage

### Le bot ne répond pas
1. Vérifie que le service tourne sur Koyeb (status vert)
2. Vérifie le token dans les variables d'environnement
3. Va dans Koyeb → Logs pour voir les erreurs

### Je veux ajouter un 2ème admin
Dans Koyeb, modifie la variable :
```
ADMIN_IDS=123456789,987654321
```
(sépare les IDs par des virgules)

### Le bot perd les données au redéploiement
Normal : le fichier `db.json` est en mémoire. Pour garder les données :
- Phase 1 : c'est ok, tu as peu de données
- Phase 3 : migre vers PostgreSQL (gratuit sur Supabase ou Neon)

### Je veux modifier le bot
1. Modifie les fichiers en local
2. Push sur GitHub :
```bash
git add -A
git commit -m "description du changement"
git push origin main
```
3. Koyeb redéploie automatiquement

### Comment passer à PostgreSQL plus tard ?
Quand tu auras beaucoup de données :
1. Crée une base gratuite sur **neon.tech** ou **supabase.com**
2. Remplace `data.js` par des requêtes PostgreSQL
3. Les données persistent même après redéploiement

### Liens utiles
- Repo GitHub : github.com/julienogabriel/infomadalive
- Koyeb dashboard : app.koyeb.com
- BotFather : t.me/BotFather
- Canva : canva.com
