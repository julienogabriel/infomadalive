# ÉTAPES À FAIRE — Info Mada Live

## 1. Vercel — Variables d'environnement
- [ ] Aller sur https://vercel.com → projet `infomadalive` → Settings → Environment Variables
- [ ] Ajouter `MVOLA_NUMBER` = `034 01 772 60`
- [ ] Ajouter `ORANGE_MONEY_NUMBER` = `032 89 707 69`
- [ ] Cliquer Save
- [ ] Redeploy le projet (Deployments → 3 points → Redeploy)

## 2. Telegram — Configurer le webhook
- [ ] Ouvrir un terminal
- [ ] Lancer :
```bash
cd bot-telegram
node setup-webhook.js 8064681235:AAH5XUX_p9VAFHFGnJSyXeHMdBEzcbJ-9TU https://infomadalive.vercel.app
```
- [ ] Vérifier que ça affiche "Webhook configuré avec succès"

## 3. Telegram — Tester le bot
- [ ] Aller sur https://t.me/InfoMadaLiveBot
- [ ] Taper `/start` → vérifier le message de bienvenue
- [ ] Taper `/menu` → vérifier toutes les commandes
- [ ] Taper `/monid` → noter ton Chat ID
- [ ] Taper `/vip` → vérifier les offres VIP
- [ ] Taper `/payer` → vérifier les numéros MVola/Orange Money

## 4. Telegram — Configurer ton Admin ID
- [ ] Ton Chat ID Telegram (résultat de /monid) doit être dans `ADMIN_IDS` sur Vercel
- [ ] Vérifier que `ADMIN_IDS` = ton Chat ID dans Vercel Environment Variables
- [ ] Taper `/admin` → vérifier que tu vois les commandes admin
- [ ] Taper `/dashboard` → vérifier le dashboard

## 5. Telegram — Tester les commandes admin
- [ ] `/addcoupure Analakely | 2 Avril 2026 | 4h` → ajouter une coupure test
- [ ] `/addbonplan Riz pas cher | 2000 Ar le kapoaka | Marché Analakely` → ajouter un bon plan test
- [ ] `/addjob Vendeur | Shoprite | 034 00 000 00` → ajouter un job test
- [ ] `/coupures` → vérifier que la coupure apparaît
- [ ] `/bonsplans` → vérifier que le bon plan apparaît
- [ ] `/jobs` → vérifier que le job apparaît

## 6. Telegram — Tester les posts sponsorisés
- [ ] `/addclient Resto Kaly | 034 12 345 67 | Post simple | 5000`
- [ ] `/clients` → vérifier que le client apparaît
- [ ] `/addsponsor Resto Kaly | 🔥 PROMO ! Plat du jour à 5000 Ar au Resto Kaly, Analakely`
- [ ] `/diffusersponsor` → envoyer à tous les abonnés
- [ ] `/dashboard` → vérifier que le revenu est mis à jour

## 7. Facebook — Configurer la page
- [ ] Aller sur https://web.facebook.com/profile.php?id=61564348247377
- [ ] Ajouter la photo de profil (ouvrir `branding/profil-800x800.html` dans le navigateur → capture d'écran)
- [ ] Ajouter la photo de couverture (ouvrir `branding/couverture-820x312.html` → capture d'écran)
- [ ] Remplir la bio : `🇲🇬 Ton info utile au quotidien. Coupures JIRAMA ⚡ Bons plans 🔥 Jobs 💼 Gratuit. Rejoins-nous !`
- [ ] Remplir la section "À propos" (voir contenus-prets.md)
- [ ] Publier et épingler le post de bienvenue

## 8. GitHub Pages — Vérifier le site
- [ ] Aller sur https://github.com/julienogabriel/infomadalive → Settings → Pages
- [ ] Source : Deploy from a branch → main → / (root) → Save
- [ ] Vérifier que https://julienogabriel.github.io/infomadalive/ fonctionne

## 9. Vercel — Variable Cron Secret
- [ ] Aller sur Vercel → Settings → Environment Variables
- [ ] Ajouter `CRON_SECRET` = un mot de passe au choix (ex: `monsecret123`)
- [ ] Redeploy le projet

## 10. Commencer a publier !
- [ ] Publier 3 posts/jour sur Facebook (coupures, bons plans, jobs)
- [ ] Partager le bot Telegram dans les groupes Facebook malgaches
- [ ] Objectif : 1000 abonnes → commencer la monetisation

## 11. Utiliser les nouvelles fonctionnalites revenus
- [ ] `/promo VIP a moitie prix cette semaine !` → envoyer promo flash
- [ ] `/parrainer` → tester ton propre lien de parrainage
- [ ] `/statsparrainage` → voir les stats de parrainage
- [ ] Le cron tourne automatiquement 3x/jour (7h, 12h, 19h Mada)
- [ ] Les VIP recoivent des relances auto avant expiration
- [ ] Les non-VIP recoivent une promo chaque lundi
- [ ] Tu recois un rapport admin chaque soir
