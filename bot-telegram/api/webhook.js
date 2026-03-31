// ============================================
//  INFO MADA LIVE - Bot Telegram (Vercel Webhook)
//  100% gratuit sur Vercel
// ============================================

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS = process.env.ADMIN_IDS
  ? process.env.ADMIN_IDS.split(',').map(Number)
  : [];

// --- Base de données via Vercel KV (Redis gratuit) ou JSON Store ---
// Pour commencer simple, on utilise jsonbin.io (gratuit)
const JSONBIN_ID = process.env.JSONBIN_ID || '';
const JSONBIN_KEY = process.env.JSONBIN_KEY || '';

// ============================================
//  HELPERS
// ============================================

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    })
  });
}

function isAdmin(chatId) {
  return ADMIN_IDS.includes(chatId);
}

// --- Stockage JSONBin (gratuit, 10000 requêtes/mois) ---

async function loadDB() {
  if (!JSONBIN_ID || !JSONBIN_KEY) {
    return { coupures: [], bonsPlans: [], jobs: [], abonnes: [] };
  }
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_KEY }
    });
    const json = await res.json();
    return json.record || { coupures: [], bonsPlans: [], jobs: [], abonnes: [] };
  } catch {
    return { coupures: [], bonsPlans: [], jobs: [], abonnes: [] };
  }
}

async function saveDB(data) {
  if (!JSONBIN_ID || !JSONBIN_KEY) return;
  await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY
    },
    body: JSON.stringify(data)
  });
}

// ============================================
//  COMMANDES
// ============================================

async function handleStart(chatId, nom) {
  const db = await loadDB();
  if (!db.abonnes.find(a => a.chatId === chatId)) {
    db.abonnes.push({ chatId, nom, date: new Date().toISOString() });
    await saveDB(db);
  }

  await sendMessage(chatId,
    `🇲🇬 *Bienvenue sur Info Mada Live, ${nom} !*\n\n` +
    `Ici tu reçois chaque jour :\n` +
    `⚡ Coupures JIRAMA\n` +
    `🔥 Bons plans & prix\n` +
    `💼 Offres d'emploi\n\n` +
    `*Tape une commande :*\n\n` +
    `/coupures - Alertes coupures JIRAMA\n` +
    `/bonsplans - Bons plans du jour\n` +
    `/jobs - Offres d'emploi\n` +
    `/signaler - Signaler une info\n` +
    `/menu - Toutes les options\n\n` +
    `📢 Partage ce bot avec tes amis !`
  );
}

async function handleMenu(chatId) {
  await sendMessage(chatId,
    `📋 *MENU - Info Mada Live*\n\n` +
    `⚡ /coupures - Coupures JIRAMA\n` +
    `🔥 /bonsplans - Bons plans\n` +
    `💼 /jobs - Offres d'emploi\n` +
    `📝 /signaler - Signaler une info\n` +
    `📊 /stats - Nombre d'abonnés\n` +
    `📢 /partager - Partager le bot\n\n` +
    `💡 _Envoie "INFO" pour un résumé rapide_`
  );
}

async function handleCoupures(chatId) {
  const db = await loadDB();
  const coupures = db.coupures.slice(-5);

  if (coupures.length === 0) {
    await sendMessage(chatId,
      `⚡ *Coupures JIRAMA*\n\nAucune coupure signalée.\nOn te prévient dès qu'il y en a ! ✅`
    );
    return;
  }

  let texte = `⚡ *COUPURES JIRAMA RÉCENTES*\n\n`;
  coupures.forEach((c, i) => {
    texte += `${i + 1}. 📍 *${c.zone}*\n   📅 ${c.date}\n   ⏱ Durée : ${c.duree}\n\n`;
  });
  texte += `_Partage pour prévenir tes proches !_`;
  await sendMessage(chatId, texte);
}

async function handleBonsPlans(chatId) {
  const db = await loadDB();
  const plans = db.bonsPlans.slice(-5);

  if (plans.length === 0) {
    await sendMessage(chatId, `🔥 *Bons Plans*\n\nAucun bon plan pour le moment. Reviens bientôt !`);
    return;
  }

  let texte = `🔥 *BONS PLANS DU MOMENT*\n\n`;
  plans.forEach((p, i) => {
    texte += `${i + 1}. *${p.titre}*\n   ${p.description}\n   📍 ${p.lieu}\n\n`;
  });
  await sendMessage(chatId, texte);
}

async function handleJobs(chatId) {
  const db = await loadDB();
  const jobs = db.jobs.slice(-5);

  if (jobs.length === 0) {
    await sendMessage(chatId, `💼 *Offres d'emploi*\n\nAucune offre pour le moment. On publie dès qu'on en a !`);
    return;
  }

  let texte = `💼 *OFFRES D'EMPLOI*\n\n`;
  jobs.forEach((j, i) => {
    texte += `${i + 1}. *${j.poste}*\n   🏢 ${j.entreprise}\n   📞 ${j.contact}\n\n`;
  });
  await sendMessage(chatId, texte);
}

async function handleStats(chatId) {
  const db = await loadDB();
  await sendMessage(chatId,
    `📊 *Info Mada Live*\n\n👥 ${db.abonnes.length} abonné(s)\n\nAide-nous à grandir : /partager`
  );
}

async function handlePartager(chatId) {
  await sendMessage(chatId,
    `📢 *Partage Info Mada Live !*\n\n` +
    `Envoie ce lien à tes amis :\n👉 https://t.me/InfoMadaLiveBot\n\n` +
    `_Plus on est nombreux, plus les infos sont fiables !_`
  );
}

async function handleMonId(chatId) {
  await sendMessage(chatId, `Ton Chat ID : \`${chatId}\``);
}

async function handleInfo(chatId) {
  const db = await loadDB();
  await sendMessage(chatId,
    `🇲🇬 *RÉSUMÉ INFO MADA LIVE*\n\n` +
    `⚡ *Coupures :* ${db.coupures.length > 0 ? db.coupures.length + ' signalée(s)' : 'Aucune'}\n` +
    `🔥 *Bons plans :* ${db.bonsPlans.length > 0 ? db.bonsPlans.length + ' disponible(s)' : 'Aucun'}\n` +
    `💼 *Jobs :* ${db.jobs.length > 0 ? db.jobs.length + ' offre(s)' : 'Aucun'}\n\n` +
    `Tape /coupures, /bonsplans ou /jobs pour les détails.`
  );
}

async function handleSignaler(chatId) {
  await sendMessage(chatId,
    `📝 *SIGNALER UNE INFO*\n\n` +
    `Envoie ton signalement en UN message avec ce format :\n\n` +
    `Pour une coupure :\n` +
    `/signal coupure | Zone | Date et heure | Durée\n` +
    `Ex: /signal coupure | Analakely | Demain 8h | 4h\n\n` +
    `Pour un bon plan :\n` +
    `/signal bonplan | Titre | Description | Lieu\n` +
    `Ex: /signal bonplan | Riz pas cher | 2000 Ar | Marché Isotry\n\n` +
    `Pour un job :\n` +
    `/signal job | Poste | Entreprise | Contact\n` +
    `Ex: /signal job | Vendeur | Shoprite | 034 00 000 00`
  );
}

async function handleSignal(chatId, nom, texte) {
  const parts = texte.split('|').map(s => s.trim());
  if (parts.length < 3) {
    await sendMessage(chatId, `Format incorrect. Tape /signaler pour voir le format.`);
    return;
  }

  const type = parts[0].toUpperCase();
  const emojis = { COUPURE: '⚡', BONPLAN: '🔥', JOB: '💼' };
  const emoji = emojis[type] || '⚠️';

  const rapport =
    `🔔 *NOUVEAU SIGNALEMENT*\n\n` +
    `${emoji} Type : *${type}*\n` +
    `👤 De : ${nom} (ID: ${chatId})\n` +
    `📝 Détails : ${parts.slice(1).join(' | ')}\n\n` +
    `_Pour publier, utilise /addcoupure, /addbonplan ou /addjob_`;

  for (const adminId of ADMIN_IDS) {
    await sendMessage(adminId, rapport).catch(() => {});
  }

  await sendMessage(chatId,
    `✅ *Merci ${nom} !*\n\nTon signalement a été envoyé. Si c'est vérifié, on le publie ! 🙏`
  );
}

// --- ADMIN ---

async function handleAdmin(chatId) {
  if (!isAdmin(chatId)) return;
  await sendMessage(chatId,
    `🔐 *ADMIN*\n\n` +
    `/addcoupure Zone | Date | Durée\n` +
    `/addbonplan Titre | Description | Lieu\n` +
    `/addjob Poste | Entreprise | Contact\n` +
    `/broadcast Ton message\n` +
    `/listeabonnes`
  );
}

async function handleAddCoupure(chatId, args) {
  if (!isAdmin(chatId)) return;
  const parts = args.split('|').map(s => s.trim());
  if (parts.length < 3) {
    await sendMessage(chatId, 'Format : /addcoupure Zone | Date | Durée');
    return;
  }
  const db = await loadDB();
  db.coupures.push({ zone: parts[0], date: parts[1], duree: parts[2], creeLe: new Date().toISOString() });
  if (db.coupures.length > 50) db.coupures = db.coupures.slice(-50);
  await saveDB(db);
  await sendMessage(chatId, `✅ Coupure ajoutée : ${parts[0]}`);
}

async function handleAddBonPlan(chatId, args) {
  if (!isAdmin(chatId)) return;
  const parts = args.split('|').map(s => s.trim());
  if (parts.length < 3) {
    await sendMessage(chatId, 'Format : /addbonplan Titre | Description | Lieu');
    return;
  }
  const db = await loadDB();
  db.bonsPlans.push({ titre: parts[0], description: parts[1], lieu: parts[2], creeLe: new Date().toISOString() });
  if (db.bonsPlans.length > 50) db.bonsPlans = db.bonsPlans.slice(-50);
  await saveDB(db);
  await sendMessage(chatId, `✅ Bon plan ajouté : ${parts[0]}`);
}

async function handleAddJob(chatId, args) {
  if (!isAdmin(chatId)) return;
  const parts = args.split('|').map(s => s.trim());
  if (parts.length < 3) {
    await sendMessage(chatId, 'Format : /addjob Poste | Entreprise | Contact');
    return;
  }
  const db = await loadDB();
  db.jobs.push({ poste: parts[0], entreprise: parts[1], contact: parts[2], creeLe: new Date().toISOString() });
  if (db.jobs.length > 50) db.jobs = db.jobs.slice(-50);
  await saveDB(db);
  await sendMessage(chatId, `✅ Job ajouté : ${parts[0]}`);
}

async function handleBroadcast(chatId, message) {
  if (!isAdmin(chatId)) return;
  const db = await loadDB();
  let envoyes = 0;
  for (const ab of db.abonnes) {
    try {
      await sendMessage(ab.chatId, `📢 *Info Mada Live*\n\n${message}`);
      envoyes++;
    } catch { /* skip */ }
  }
  await sendMessage(chatId, `📊 Broadcast : ✅ ${envoyes}/${db.abonnes.length} envoyé(s)`);
}

async function handleListeAbonnes(chatId) {
  if (!isAdmin(chatId)) return;
  const db = await loadDB();
  if (db.abonnes.length === 0) {
    await sendMessage(chatId, 'Aucun abonné.');
    return;
  }
  let texte = `👥 *${db.abonnes.length} abonné(s)*\n\n`;
  db.abonnes.slice(-20).forEach((a, i) => {
    texte += `${i + 1}. ${a.nom} (${a.date.split('T')[0]})\n`;
  });
  await sendMessage(chatId, texte);
}

// ============================================
//  WEBHOOK HANDLER (point d'entrée Vercel)
// ============================================

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(200).send('Info Mada Live Bot is running!');
    return;
  }

  try {
    const { message } = req.body;
    if (!message || !message.text) {
      res.status(200).send('ok');
      return;
    }

    const chatId = message.chat.id;
    const text = message.text;
    const nom = message.from.first_name || 'ami(e)';

    // --- Routing des commandes ---

    if (text === '/start') {
      await handleStart(chatId, nom);
    } else if (text === '/menu') {
      await handleMenu(chatId);
    } else if (text === '/coupures') {
      await handleCoupures(chatId);
    } else if (text === '/bonsplans') {
      await handleBonsPlans(chatId);
    } else if (text === '/jobs') {
      await handleJobs(chatId);
    } else if (text === '/stats') {
      await handleStats(chatId);
    } else if (text === '/partager') {
      await handlePartager(chatId);
    } else if (text === '/monid') {
      await handleMonId(chatId);
    } else if (text === '/signaler') {
      await handleSignaler(chatId);
    } else if (text.startsWith('/signal ')) {
      await handleSignal(chatId, nom, text.substring(8));
    } else if (text === '/admin') {
      await handleAdmin(chatId);
    } else if (text.startsWith('/addcoupure ')) {
      await handleAddCoupure(chatId, text.substring(12));
    } else if (text.startsWith('/addbonplan ')) {
      await handleAddBonPlan(chatId, text.substring(12));
    } else if (text.startsWith('/addjob ')) {
      await handleAddJob(chatId, text.substring(8));
    } else if (text.startsWith('/broadcast ')) {
      await handleBroadcast(chatId, text.substring(11));
    } else if (text === '/listeabonnes') {
      await handleListeAbonnes(chatId);
    } else if (text.toUpperCase().trim() === 'INFO') {
      await handleInfo(chatId);
    }

    res.status(200).send('ok');
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(200).send('ok');
  }
};
