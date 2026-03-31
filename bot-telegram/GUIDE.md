# Info Mada Live - Bot Telegram

## Installation en 5 minutes (Vercel, 100% gratuit)

### 1. Créer le bot sur Telegram

1. Ouvre Telegram, cherche **@BotFather**
2. Envoie `/newbot`
3. Nom : `Info Mada Live`
4. Username : `InfoMadaLiveBot` (ou un autre disponible)
5. BotFather te donne un **TOKEN** → copie-le

### 2. Créer la base de données (JSONBin, gratuit)

1. Va sur **jsonbin.io** → crée un compte gratuit
2. Va dans **API Keys** → copie ta **Master Key**
3. Lance :
```bash
cd bot-telegram
npm install
node setup-jsonbin.js TA_MASTER_KEY
```
4. Note le **JSONBIN_ID** et **JSONBIN_KEY** affichés

### 3. Déployer sur Vercel (gratuit pour toujours)

1. Va sur **vercel.com** → **"Sign up with GitHub"**
2. **"Add New Project"** → importe ton repo `infomadalive`
3. **Root Directory** → change en `bot-telegram`
4. **Environment Variables** → ajoute :

| Variable | Valeur |
|----------|--------|
| `TELEGRAM_BOT_TOKEN` | ton token BotFather |
| `ADMIN_IDS` | (vide pour l'instant) |
| `JSONBIN_ID` | celui du script |
| `JSONBIN_KEY` | ta master key |

5. Clique **Deploy**

### 4. Activer le webhook

```bash
node setup-webhook.js TON_TOKEN https://ton-projet.vercel.app
```

### 5. Configurer ton compte admin

1. Ouvre ton bot sur Telegram
2. Tape `/start` puis `/monid`
3. Copie le numéro
4. Va sur Vercel → Settings → Environment Variables
5. Modifie `ADMIN_IDS` = ton numéro
6. Redeploy (Deployments → clic sur les 3 points → Redeploy)

## Commandes utilisateur

| Commande | Description |
|----------|-------------|
| `/start` | Accueil + inscription |
| `/coupures` | Alertes coupures JIRAMA |
| `/bonsplans` | Bons plans du moment |
| `/jobs` | Offres d'emploi |
| `/signaler` | Signaler une info |
| `/stats` | Nombre d'abonnés |
| `/partager` | Lien de partage |
| `INFO` | Résumé rapide |

## Commandes admin

| Commande | Exemple |
|----------|---------|
| `/admin` | Voir les commandes admin |
| `/addcoupure` | `/addcoupure Analakely \| 31 Mars \| 4h` |
| `/addbonplan` | `/addbonplan Riz pas cher \| 2000 Ar \| Marché Analakely` |
| `/addjob` | `/addjob Développeur \| TechCo \| 034 00 000 00` |
| `/broadcast` | `/broadcast Bonne année à tous !` |
| `/listeabonnes` | Voir les abonnés |

## Hébergement

**Vercel** (100% gratuit, pour toujours) :
- Pas de carte bancaire requise
- Redeploy automatique à chaque push GitHub
- Données persistantes via JSONBin.io (gratuit, 10 000 requêtes/mois)

## Mises à jour

Modifie le code → push sur GitHub → Vercel redéploie automatiquement :
```bash
git add -A
git commit -m "description"
git push origin main
```
