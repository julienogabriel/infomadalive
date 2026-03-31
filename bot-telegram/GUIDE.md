# Info Mada Live - Bot Telegram

## Installation en 5 minutes

### 1. Créer le bot sur Telegram

1. Ouvre Telegram, cherche **@BotFather**
2. Envoie `/newbot`
3. Nom : `Info Mada Live`
4. Username : `InfoMadaLiveBot` (ou un autre disponible)
5. BotFather te donne un **TOKEN** → copie-le

### 2. Configurer

```bash
cd bot-telegram
cp .env.example .env
```

Ouvre `.env` et colle ton token :
```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...
```

### 3. Installer et lancer

```bash
npm install
npm start
```

### 4. Configurer ton compte admin

1. Ouvre ton bot sur Telegram
2. Tape `/monid`
3. Copie le numéro
4. Ajoute dans `.env` :
```
ADMIN_IDS=123456789
```
5. Relance le bot (`npm start`)

## Commandes utilisateur

| Commande | Description |
|----------|-------------|
| `/start` | Accueil + inscription |
| `/coupures` | Alertes coupures JIRAMA |
| `/bonsplans` | Bons plans du moment |
| `/jobs` | Offres d'emploi |
| `/stats` | Nombre d'abonnés |
| `/partager` | Lien de partage |
| `INFO` | Résumé rapide |

## Commandes admin

| Commande | Exemple |
|----------|---------|
| `/addcoupure` | `/addcoupure Analakely \| 31 Mars \| 4h` |
| `/addbonplan` | `/addbonplan Riz pas cher \| 2000 Ar \| Marché Analakely` |
| `/addjob` | `/addjob Développeur \| TechCo \| 034 00 000 00` |
| `/broadcast` | `/broadcast Bonne année à tous !` |
| `/listeabonnes` | Voir les abonnés |

## Hébergement gratuit

Options pour faire tourner le bot 24/7 :
- **Railway.app** (gratuit pour commencer)
- **Render.com** (free tier)
- **Un vieux PC/téléphone** avec Node.js installé
