# Héberger le site GRATUITEMENT

## Option 1 : Vercel (recommandé)

Le site se déploie automatiquement avec le bot sur Vercel.
Si tu veux un site séparé :

1. Va sur **vercel.com** (tu as déjà un compte)
2. **"Add New Project"** → importe le même repo
3. **Root Directory** → `site-web`
4. **Framework Preset** → Other
5. Deploy → ton site est en ligne !

URL : `https://infomadalive.vercel.app`

## Option 2 : GitHub Pages (gratuit aussi)

1. Va sur ton repo GitHub : github.com/julienogabriel/infomadalive
2. Settings → **Pages**
3. Source : **Deploy from a branch**
4. Branch : main → / (root)
5. Save

URL : `https://julienogabriel.github.io/infomadalive`

Note : GitHub Pages sert depuis la racine. Tu peux aussi créer un repo séparé `julienogabriel.github.io` et y mettre le `index.html`.

## Personnaliser le site

Ouvre `site-web/index.html` et remplace :
- `261XXXXXXXXX` → ton vrai numéro WhatsApp
- `InfoMadaLiveBot` → le vrai username de ton bot
- `infomadalive@gmail.com` → ton vrai email

## Nom de domaine personnalisé (plus tard)

Tu peux acheter un domaine :
- `infomadalive.mg` (domaine malgache)
- `infomadalive.com`
Coût : environ 10-15$/an
Connecte-le dans Vercel → Settings → Domains
