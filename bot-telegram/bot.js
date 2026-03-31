// ============================================
//  INFO MADA LIVE - Bot Telegram
//  Infos utiles & Bons plans Madagascar
// ============================================

const TelegramBot = require('node-telegram-bot-api');
const data = require('./data');

// --- CONFIGURATION ---
// Remplace par ton token (obtenu via @BotFather sur Telegram)
const TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'TON_TOKEN_ICI';

// ID admin (ton chat ID Telegram - tape /monid pour le voir)
const ADMIN_IDS = process.env.ADMIN_IDS
  ? process.env.ADMIN_IDS.split(',').map(Number)
  : [];

const bot = new TelegramBot(TOKEN, { polling: true });

console.log('🟢 Info Mada Live Bot démarré !');

// ============================================
//  COMMANDES UTILISATEUR
// ============================================

// /start - Accueil
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const nom = msg.from.first_name || 'ami(e)';

  data.ajouterAbonne(chatId, nom);

  bot.sendMessage(chatId,
    `🇲🇬 *Bienvenue sur Info Mada Live, ${nom} !*\n\n` +
    `Ici tu reçois chaque jour :\n` +
    `⚡ Coupures JIRAMA\n` +
    `🔥 Bons plans & prix\n` +
    `💼 Offres d'emploi\n\n` +
    `*Tape une commande :*\n\n` +
    `/coupures - Alertes coupures JIRAMA\n` +
    `/bonsplans - Bons plans du jour\n` +
    `/jobs - Offres d'emploi\n` +
    `/menu - Voir toutes les options\n\n` +
    `📢 Partage ce bot : t.me/InfoMadaLiveBot`,
    { parse_mode: 'Markdown' }
  );
});

// /menu
bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `📋 *MENU - Info Mada Live*\n\n` +
    `⚡ /coupures - Coupures JIRAMA\n` +
    `🔥 /bonsplans - Bons plans\n` +
    `💼 /jobs - Offres d'emploi\n` +
    `📊 /stats - Nombre d'abonnés\n` +
    `📢 /partager - Partager le bot\n\n` +
    `💡 _Envoie "INFO" à tout moment pour un résumé rapide_`,
    { parse_mode: 'Markdown' }
  );
});

// /coupures
bot.onText(/\/coupures/, (msg) => {
  const coupures = data.getCoupures();

  if (coupures.length === 0) {
    bot.sendMessage(msg.chat.id,
      `⚡ *Coupures JIRAMA*\n\n` +
      `Aucune coupure signalée pour le moment.\n` +
      `On te prévient dès qu'il y en a ! ✅`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  let texte = `⚡ *COUPURES JIRAMA RÉCENTES*\n\n`;
  coupures.forEach((c, i) => {
    texte += `${i + 1}. 📍 *${c.zone}*\n`;
    texte += `   📅 ${c.date}\n`;
    texte += `   ⏱ Durée : ${c.duree}\n\n`;
  });
  texte += `_Partage pour prévenir tes proches !_`;

  bot.sendMessage(msg.chat.id, texte, { parse_mode: 'Markdown' });
});

// /bonsplans
bot.onText(/\/bonsplans/, (msg) => {
  const plans = data.getBonsPlans();

  if (plans.length === 0) {
    bot.sendMessage(msg.chat.id,
      `🔥 *Bons Plans*\n\nAucun bon plan pour le moment. Reviens bientôt !`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  let texte = `🔥 *BONS PLANS DU MOMENT*\n\n`;
  plans.forEach((p, i) => {
    texte += `${i + 1}. *${p.titre}*\n`;
    texte += `   ${p.description}\n`;
    texte += `   📍 ${p.lieu}\n\n`;
  });

  bot.sendMessage(msg.chat.id, texte, { parse_mode: 'Markdown' });
});

// /jobs
bot.onText(/\/jobs/, (msg) => {
  const jobs = data.getJobs();

  if (jobs.length === 0) {
    bot.sendMessage(msg.chat.id,
      `💼 *Offres d'emploi*\n\nAucune offre pour le moment. On publie dès qu'on en a !`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  let texte = `💼 *OFFRES D'EMPLOI*\n\n`;
  jobs.forEach((j, i) => {
    texte += `${i + 1}. *${j.poste}*\n`;
    texte += `   🏢 ${j.entreprise}\n`;
    texte += `   📞 ${j.contact}\n\n`;
  });

  bot.sendMessage(msg.chat.id, texte, { parse_mode: 'Markdown' });
});

// /stats
bot.onText(/\/stats/, (msg) => {
  const nb = data.getNombreAbonnes();
  bot.sendMessage(msg.chat.id,
    `📊 *Info Mada Live*\n\n👥 ${nb} abonné(s)\n\n` +
    `Aide-nous à grandir : /partager`,
    { parse_mode: 'Markdown' }
  );
});

// /partager
bot.onText(/\/partager/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `📢 *Partage Info Mada Live !*\n\n` +
    `Envoie ce lien à tes amis :\n` +
    `👉 t.me/InfoMadaLiveBot\n\n` +
    `_Plus on est nombreux, plus les infos sont fiables !_`,
    { parse_mode: 'Markdown' }
  );
});

// /monid - Pour connaître son chat ID (utile pour config admin)
bot.onText(/\/monid/, (msg) => {
  bot.sendMessage(msg.chat.id, `Ton Chat ID : \`${msg.chat.id}\``, { parse_mode: 'Markdown' });
});

// Mot-clé "INFO" → résumé rapide
bot.on('message', (msg) => {
  if (msg.text && msg.text.toUpperCase().trim() === 'INFO') {
    const coupures = data.getCoupures();
    const plans = data.getBonsPlans();
    const jobs = data.getJobs();

    let texte = `🇲🇬 *RÉSUMÉ INFO MADA LIVE*\n\n`;

    texte += `⚡ *Coupures :* ${coupures.length > 0 ? coupures.length + ' signalée(s)' : 'Aucune'}\n`;
    texte += `🔥 *Bons plans :* ${plans.length > 0 ? plans.length + ' disponible(s)' : 'Aucun'}\n`;
    texte += `💼 *Jobs :* ${jobs.length > 0 ? jobs.length + ' offre(s)' : 'Aucun'}\n\n`;

    texte += `Tape /coupures, /bonsplans ou /jobs pour les détails.`;

    bot.sendMessage(msg.chat.id, texte, { parse_mode: 'Markdown' });
  }
});

// ============================================
//  COMMANDES ADMIN (toi seul)
// ============================================

function isAdmin(chatId) {
  return ADMIN_IDS.includes(chatId);
}

// /admin - Voir les commandes admin
bot.onText(/\/admin/, (msg) => {
  if (!isAdmin(msg.chat.id)) return;

  bot.sendMessage(msg.chat.id,
    `🔐 *ADMIN - Info Mada Live*\n\n` +
    `Ajouter du contenu :\n\n` +
    `/addcoupure Zone | Date | Durée\n` +
    `Ex: /addcoupure Analakely | 31 Mars 2026 | 4h\n\n` +
    `/addbonplan Titre | Description | Lieu\n` +
    `Ex: /addbonplan Riz pas cher | 2000 Ar le kapoaka | Marché Analakely\n\n` +
    `/addjob Poste | Entreprise | Contact\n` +
    `Ex: /addjob Développeur | TechCo | 034 00 000 00\n\n` +
    `/broadcast Ton message\n` +
    `→ Envoie un message à TOUS les abonnés\n\n` +
    `/listeabonnes - Voir tous les abonnés`,
    { parse_mode: 'Markdown' }
  );
});

// /addcoupure
bot.onText(/\/addcoupure (.+)/, (msg, match) => {
  if (!isAdmin(msg.chat.id)) return;

  const parts = match[1].split('|').map(s => s.trim());
  if (parts.length < 3) {
    bot.sendMessage(msg.chat.id, 'Format : /addcoupure Zone | Date | Durée');
    return;
  }

  data.ajouterCoupure(parts[0], parts[1], parts[2]);
  bot.sendMessage(msg.chat.id, `✅ Coupure ajoutée : ${parts[0]}`);
});

// /addbonplan
bot.onText(/\/addbonplan (.+)/, (msg, match) => {
  if (!isAdmin(msg.chat.id)) return;

  const parts = match[1].split('|').map(s => s.trim());
  if (parts.length < 3) {
    bot.sendMessage(msg.chat.id, 'Format : /addbonplan Titre | Description | Lieu');
    return;
  }

  data.ajouterBonPlan(parts[0], parts[1], parts[2]);
  bot.sendMessage(msg.chat.id, `✅ Bon plan ajouté : ${parts[0]}`);
});

// /addjob
bot.onText(/\/addjob (.+)/, (msg, match) => {
  if (!isAdmin(msg.chat.id)) return;

  const parts = match[1].split('|').map(s => s.trim());
  if (parts.length < 3) {
    bot.sendMessage(msg.chat.id, 'Format : /addjob Poste | Entreprise | Contact');
    return;
  }

  data.ajouterJob(parts[0], parts[1], parts[2]);
  bot.sendMessage(msg.chat.id, `✅ Job ajouté : ${parts[0]}`);
});

// /broadcast - Envoyer un message à tous les abonnés
bot.onText(/\/broadcast (.+)/, async (msg, match) => {
  if (!isAdmin(msg.chat.id)) return;

  const message = match[1];
  const abonnes = data.getAbonnes();
  let envoyes = 0;
  let erreurs = 0;

  for (const ab of abonnes) {
    try {
      await bot.sendMessage(ab.chatId, `📢 *Info Mada Live*\n\n${message}`, { parse_mode: 'Markdown' });
      envoyes++;
    } catch {
      erreurs++;
    }
  }

  bot.sendMessage(msg.chat.id,
    `📊 Broadcast terminé :\n✅ ${envoyes} envoyé(s)\n❌ ${erreurs} erreur(s)`
  );
});

// /listeabonnes
bot.onText(/\/listeabonnes/, (msg) => {
  if (!isAdmin(msg.chat.id)) return;

  const abonnes = data.getAbonnes();
  if (abonnes.length === 0) {
    bot.sendMessage(msg.chat.id, 'Aucun abonné pour le moment.');
    return;
  }

  let texte = `👥 *${abonnes.length} abonné(s)*\n\n`;
  abonnes.slice(-20).forEach((a, i) => {
    texte += `${i + 1}. ${a.nom} (${a.date.split('T')[0]})\n`;
  });

  bot.sendMessage(msg.chat.id, texte, { parse_mode: 'Markdown' });
});

// ============================================
//  CROWDSOURCING — Les utilisateurs envoient des infos
// ============================================

// État des soumissions en cours (chatId → { type, step, data })
const submissions = {};

// /signaler - Un utilisateur signale une info
bot.onText(/\/signaler/, (msg) => {
  const chatId = msg.chat.id;
  submissions[chatId] = { step: 'choix', data: {} };

  bot.sendMessage(chatId,
    `📝 *SIGNALER UNE INFO*\n\n` +
    `Que veux-tu signaler ?\n\n` +
    `1️⃣ ⚡ Coupure JIRAMA\n` +
    `2️⃣ 🔥 Bon plan / prix\n` +
    `3️⃣ 💼 Offre d'emploi\n` +
    `4️⃣ ⚠️ Autre alerte\n\n` +
    `_Réponds avec le numéro (1, 2, 3 ou 4)_`,
    { parse_mode: 'Markdown' }
  );
});

// Gestion du flow de soumission
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const texte = msg.text;

  if (!texte || !submissions[chatId]) return;

  const sub = submissions[chatId];

  // Étape 1 : Choix du type
  if (sub.step === 'choix') {
    const types = { '1': 'coupure', '2': 'bonplan', '3': 'job', '4': 'autre' };
    const labels = { '1': 'Coupure JIRAMA', '2': 'Bon plan', '3': 'Offre emploi', '4': 'Alerte' };

    if (!types[texte]) {
      bot.sendMessage(chatId, 'Réponds avec 1, 2, 3 ou 4.');
      return;
    }

    sub.type = types[texte];
    sub.step = 'zone';
    bot.sendMessage(chatId,
      `✅ *${labels[texte]}*\n\n📍 Dans quelle zone / quel quartier ?\n\n_Exemple : Analakely, Ivandry, 67ha..._`,
      { parse_mode: 'Markdown' }
    );
    return;
  }

  // Étape 2 : Zone
  if (sub.step === 'zone') {
    sub.data.zone = texte;
    sub.step = 'detail';

    const questions = {
      coupure: '⏱ Donne les détails (heure, durée estimée...)',
      bonplan: '💰 Décris le bon plan (produit, prix, lieu exact...)',
      job: '💼 Décris l\'offre (poste, entreprise, contact...)',
      autre: '📝 Décris l\'alerte (quoi, quand, détails...)'
    };

    bot.sendMessage(chatId, questions[sub.type], { parse_mode: 'Markdown' });
    return;
  }

  // Étape 3 : Détail → Envoi aux admins
  if (sub.step === 'detail') {
    sub.data.detail = texte;
    const nom = msg.from.first_name || 'Anonyme';

    const emojis = { coupure: '⚡', bonplan: '🔥', job: '💼', autre: '⚠️' };
    const labels = { coupure: 'COUPURE', bonplan: 'BON PLAN', job: 'JOB', autre: 'ALERTE' };

    // Message à l'admin
    const rapport =
      `🔔 *NOUVEAU SIGNALEMENT*\n\n` +
      `${emojis[sub.type]} Type : *${labels[sub.type]}*\n` +
      `👤 De : ${nom} (ID: ${chatId})\n` +
      `📍 Zone : ${sub.data.zone}\n` +
      `📝 Détail : ${sub.data.detail}\n\n` +
      `_Pour publier, utilise /addcoupure, /addbonplan ou /addjob_`;

    // Envoyer à tous les admins
    ADMIN_IDS.forEach(adminId => {
      bot.sendMessage(adminId, rapport, { parse_mode: 'Markdown' }).catch(() => {});
    });

    // Confirmation à l'utilisateur
    bot.sendMessage(chatId,
      `✅ *Merci ${nom} !*\n\n` +
      `Ton signalement a été envoyé à notre équipe.\n` +
      `Si c'est vérifié, on le publie pour tout le monde !\n\n` +
      `🙏 _Grâce à toi, la communauté est mieux informée._`,
      { parse_mode: 'Markdown' }
    );

    delete submissions[chatId];
    return;
  }
});

// ============================================
//  PLANIFICATEUR — Posts automatiques
// ============================================

// Messages programmés (heure en format 24h, heure de Madagascar UTC+3)
const SCHEDULED_MESSAGES = [
  {
    heure: 7,
    minute: 0,
    message: () => {
      const coupures = data.getCoupures();
      if (coupures.length === 0) return null;
      let txt = `⚡ *BONJOUR MADA ! Coupures du jour :*\n\n`;
      coupures.slice(-3).forEach((c, i) => {
        txt += `${i + 1}. 📍 ${c.zone} — ${c.date} (${c.duree})\n`;
      });
      txt += `\n_Tape /coupures pour plus de détails_`;
      return txt;
    }
  },
  {
    heure: 12,
    minute: 0,
    message: () => {
      const plans = data.getBonsPlans();
      if (plans.length === 0) return null;
      let txt = `🔥 *BONS PLANS DU MIDI*\n\n`;
      plans.slice(-3).forEach((p, i) => {
        txt += `${i + 1}. *${p.titre}* — ${p.description} (📍 ${p.lieu})\n`;
      });
      txt += `\n_Tape /bonsplans pour tout voir_`;
      return txt;
    }
  },
  {
    heure: 19,
    minute: 0,
    message: () => {
      const jobs = data.getJobs();
      if (jobs.length === 0) return null;
      let txt = `💼 *OFFRES D'EMPLOI DU SOIR*\n\n`;
      jobs.slice(-3).forEach((j, i) => {
        txt += `${i + 1}. *${j.poste}* — ${j.entreprise} (📞 ${j.contact})\n`;
      });
      txt += `\n_Tape /jobs pour tout voir_`;
      return txt;
    }
  }
];

// Vérifier toutes les minutes si un message doit être envoyé
let lastSent = '';

setInterval(() => {
  const now = new Date();
  // Ajuster pour Madagascar (UTC+3)
  const utcHours = now.getUTCHours();
  const mgHour = (utcHours + 3) % 24;
  const mgMinute = now.getUTCMinutes();
  const timeKey = `${mgHour}:${mgMinute}`;

  // Éviter d'envoyer en double
  if (lastSent === timeKey) return;

  SCHEDULED_MESSAGES.forEach(sched => {
    if (mgHour === sched.heure && mgMinute === sched.minute) {
      const msg = sched.message();
      if (!msg) return;

      lastSent = timeKey;
      const abonnes = data.getAbonnes();

      console.log(`📤 Envoi programmé ${timeKey} à ${abonnes.length} abonnés`);

      abonnes.forEach((ab, index) => {
        // Délai entre chaque envoi pour éviter le rate limit
        setTimeout(() => {
          bot.sendMessage(ab.chatId, msg, { parse_mode: 'Markdown' }).catch(() => {});
        }, index * 100);
      });
    }
  });
}, 60000); // Check toutes les 60 secondes

// Mise à jour du menu pour inclure /signaler
bot.onText(/\/menu/, (msg) => {
  bot.sendMessage(msg.chat.id,
    `📋 *MENU - Info Mada Live*\n\n` +
    `⚡ /coupures - Coupures JIRAMA\n` +
    `🔥 /bonsplans - Bons plans\n` +
    `💼 /jobs - Offres d'emploi\n` +
    `📝 /signaler - Signaler une info\n` +
    `📊 /stats - Nombre d'abonnés\n` +
    `📢 /partager - Partager le bot\n\n` +
    `💡 _Envoie "INFO" à tout moment pour un résumé rapide_`,
    { parse_mode: 'Markdown' }
  );
});

console.log('📋 Commandes chargées. En attente de messages...');
console.log('⏰ Planificateur activé (7h, 12h, 19h heure Mada)');
