// ============================================
//  INFO MADA LIVE - Bot Telegram (Vercel Webhook)
//  Avec : Paiement VIP, Dashboard Admin, Posts Sponsorisés
// ============================================

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS = process.env.ADMIN_IDS
  ? process.env.ADMIN_IDS.split(',').map(Number)
  : [];

const MVOLA_NUMBER = process.env.MVOLA_NUMBER || '034 00 000 00';
const ORANGE_MONEY_NUMBER = process.env.ORANGE_MONEY_NUMBER || '032 00 000 00';

// --- Base de données JSONBin ---
const JSONBIN_ID = process.env.JSONBIN_ID || '';
const JSONBIN_KEY = process.env.JSONBIN_KEY || '';

// ============================================
//  HELPERS
// ============================================

async function sendMessage(chatId, text, options = {}) {
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: 'Markdown',
    ...options
  };
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

function isAdmin(chatId) {
  return ADMIN_IDS.includes(chatId);
}

// --- Stockage JSONBin ---

const DEFAULT_DB = {
  coupures: [],
  bonsPlans: [],
  jobs: [],
  abonnes: [],
  vip: [],           // { chatId, nom, expiration, plan, paiement }
  clients: [],       // { id, nom, contact, service, prix, dateAjout, posts: [] }
  sponsors: [],      // { id, texte, client, dateCreation, diffuse }
  paiements: [],     // { id, chatId, nom, montant, methode, date, statut }
  revenus: { total: 0, mois: {} },
  parrainages: []    // { parrainId, filleulId, date, recompense }
};

async function loadDB() {
  if (!JSONBIN_ID || !JSONBIN_KEY) return { ...DEFAULT_DB };
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_KEY }
    });
    const json = await res.json();
    const record = json.record || {};
    // Merge with defaults to ensure all fields exist
    return { ...DEFAULT_DB, ...record };
  } catch {
    return { ...DEFAULT_DB };
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

function isVIP(db, chatId) {
  const member = db.vip.find(v => v.chatId === chatId);
  if (!member) return false;
  return new Date(member.expiration) > new Date();
}

function getMoisKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ============================================
//  COMMANDES UTILISATEUR
// ============================================

async function handleStart(chatId, nom, startPayload) {
  const db = await loadDB();
  const isNew = !db.abonnes.find(a => a.chatId === chatId);

  if (isNew) {
    db.abonnes.push({ chatId, nom, date: new Date().toISOString() });

    // Parrainage : si l'utilisateur vient via un lien de parrainage
    if (startPayload && startPayload.startsWith('ref_')) {
      const parrainId = parseInt(startPayload.substring(4));
      if (parrainId && parrainId !== chatId) {
        if (!db.parrainages) db.parrainages = [];
        db.parrainages.push({
          parrainId,
          filleulId: chatId,
          filleulNom: nom,
          date: new Date().toISOString(),
          recompense: false
        });

        // Notifier le parrain
        const nbFilleuls = db.parrainages.filter(p => p.parrainId === parrainId).length;
        try {
          await sendMessage(parrainId,
            `*${nom} a rejoint grace a toi !*\n\n` +
            `Tu as maintenant *${nbFilleuls} filleul(s)*.\n` +
            (nbFilleuls >= 5 && !db.parrainages.find(p => p.parrainId === parrainId && p.recompense)
              ? `\n*BRAVO ! 5 filleuls = 1 semaine VIP GRATUITE !*\nOn t'active ca tout de suite...`
              : `Encore ${Math.max(0, 5 - nbFilleuls)} pour gagner 1 semaine VIP gratuite !`)
          );

          // Recompense auto a 5 filleuls
          if (nbFilleuls >= 5) {
            const dejaRecompense = (db.vip || []).find(v =>
              v.chatId === parrainId && v.source === 'parrainage'
            );
            if (!dejaRecompense) {
              const expiration = new Date();
              expiration.setDate(expiration.getDate() + 7);
              const existant = (db.vip || []).findIndex(v => v.chatId === parrainId);
              const vipData = {
                chatId: parrainId,
                plan: 'Hebdo (Parrainage)',
                expiration: expiration.toISOString(),
                dateActivation: new Date().toISOString(),
                source: 'parrainage'
              };
              if (existant >= 0) {
                db.vip[existant] = vipData;
              } else {
                db.vip.push(vipData);
              }
            }
          }
        } catch {}
      }
    }

    await saveDB(db);

    // Notifier les admins du nouvel abonne
    for (const adminId of ADMIN_IDS) {
      try {
        await sendMessage(adminId,
          `*Nouvel abonne !*\n${nom} (ID: \`${chatId}\`)\nTotal : *${db.abonnes.length}*`
        );
      } catch {}
    }
  }

  await sendMessage(chatId,
    `*Bienvenue sur Info Mada Live, ${nom} !*\n\n` +
    `Ici tu recois chaque jour :\n` +
    `Coupures JIRAMA\n` +
    `Bons plans & prix\n` +
    `Offres d'emploi\n\n` +
    `*Tape une commande :*\n\n` +
    `/coupures - Alertes coupures JIRAMA\n` +
    `/bonsplans - Bons plans du jour\n` +
    `/jobs - Offres d'emploi\n` +
    `/vip - Contenu exclusif VIP\n` +
    `/parrainer - Invite tes amis, gagne VIP gratuit\n` +
    `/menu - Toutes les options\n\n` +
    `Partage ce bot avec tes amis !`
  );
}

async function handleMenu(chatId) {
  const db = await loadDB();
  const vipStatus = isVIP(db, chatId) ? 'VIP actif' : 'Gratuit';
  const nbFilleuls = (db.parrainages || []).filter(p => p.parrainId === chatId).length;

  await sendMessage(chatId,
    `*MENU - Info Mada Live*\n` +
    `Statut : ${vipStatus}\n\n` +
    `/coupures - Coupures JIRAMA\n` +
    `/bonsplans - Bons plans\n` +
    `/jobs - Offres d'emploi\n` +
    `/signaler - Signaler une info\n` +
    `/stats - Nombre d'abonnes\n` +
    `/partager - Partager le bot\n\n` +
    `*VIP :*\n` +
    `/vip - Devenir VIP (bons plans exclusifs)\n` +
    `/payer - Comment payer\n\n` +
    `*Parrainage (${nbFilleuls} filleuls) :*\n` +
    `/parrainer - Ton lien + gagne VIP gratuit\n` +
    `/mesfilleuls - Voir tes filleuls\n\n` +
    `_Envoie "INFO" pour un resume rapide_`
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
    `📊 *Info Mada Live*\n\n👥 ${db.abonnes.length} abonné(s)\n⭐ ${db.vip.filter(v => new Date(v.expiration) > new Date()).length} VIP actif(s)\n\nAide-nous à grandir : /partager`
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
    try { await sendMessage(adminId, rapport); } catch {}
  }

  await sendMessage(chatId,
    `✅ *Merci ${nom} !*\n\nTon signalement a été envoyé. Si c'est vérifié, on le publie ! 🙏`
  );
}

// ============================================
//  SYSTÈME VIP & PAIEMENT
// ============================================

async function handleVip(chatId) {
  const db = await loadDB();
  const membre = db.vip.find(v => v.chatId === chatId);
  const estVip = membre && new Date(membre.expiration) > new Date();

  if (estVip) {
    const expDate = new Date(membre.expiration).toLocaleDateString('fr-FR');
    await sendMessage(chatId,
      `⭐ *TU ES VIP !*\n\n` +
      `Plan : *${membre.plan}*\n` +
      `Expire le : *${expDate}*\n\n` +
      `Ce que tu as en plus :\n` +
      `🔥 Bons plans AVANT tout le monde\n` +
      `💼 Jobs exclusifs non publiés\n` +
      `⚡ Alertes prioritaires\n` +
      `📊 Prix comparés par quartier\n\n` +
      `/vipcontent - Voir le contenu exclusif`
    );
    return;
  }

  await sendMessage(chatId,
    `⭐ *DEVENIR VIP — Info Mada Live*\n\n` +
    `Reçois les infos EN PREMIER, avant tout le monde !\n\n` +
    `*Nos offres :*\n\n` +
    `🟢 *Hebdo* — 2 000 Ar/semaine\n` +
    `   Bons plans exclusifs avant publication\n\n` +
    `🔵 *Mensuel* — 5 000 Ar/mois\n` +
    `   Bons plans + jobs exclusifs + alertes prioritaires\n\n` +
    `🟡 *Pro* — 15 000 Ar/mois\n` +
    `   Tout + réseau business + mises en relation\n\n` +
    `👉 Tape /payer pour voir comment payer`
  );
}

async function handlePayer(chatId) {
  await sendMessage(chatId,
    `💰 *COMMENT PAYER*\n\n` +
    `*Étape 1 :* Choisis ton plan\n` +
    `   🟢 Hebdo : 2 000 Ar\n` +
    `   🔵 Mensuel : 5 000 Ar\n` +
    `   🟡 Pro : 15 000 Ar\n\n` +
    `*Étape 2 :* Envoie le montant par :\n\n` +
    `📱 *MVola* : ${MVOLA_NUMBER}\n` +
    `   Nom : Info Mada Live\n\n` +
    `📱 *Orange Money* : ${ORANGE_MONEY_NUMBER}\n` +
    `   Nom : Info Mada Live\n\n` +
    `*Étape 3 :* Confirme ici :\n` +
    `/confirmer MVola | Montant | Réf transaction\n` +
    `ou\n` +
    `/confirmer OrangeMoney | Montant | Réf transaction\n\n` +
    `_Exemple :_\n` +
    `/confirmer MVola | 5000 | REF123456\n\n` +
    `On active ton VIP dans les minutes qui suivent ! ⚡`
  );
}

async function handleConfirmer(chatId, nom, texte) {
  const parts = texte.split('|').map(s => s.trim());
  if (parts.length < 3) {
    await sendMessage(chatId, `Format : /confirmer Méthode | Montant | Réf transaction\nEx: /confirmer MVola | 5000 | REF123456`);
    return;
  }

  const [methode, montant, reference] = parts;
  const db = await loadDB();

  // Enregistrer le paiement en attente
  const paiement = {
    id: `PAY-${Date.now()}`,
    chatId,
    nom,
    montant: parseInt(montant) || 0,
    methode,
    reference,
    date: new Date().toISOString(),
    statut: 'en_attente'
  };
  db.paiements.push(paiement);
  await saveDB(db);

  // Notifier les admins
  for (const adminId of ADMIN_IDS) {
    try {
      await sendMessage(adminId,
        `💰 *NOUVEAU PAIEMENT EN ATTENTE*\n\n` +
        `👤 De : ${nom} (ID: \`${chatId}\`)\n` +
        `💳 Méthode : *${methode}*\n` +
        `💵 Montant : *${montant} Ar*\n` +
        `🔖 Réf : \`${reference}\`\n` +
        `📅 Date : ${new Date().toLocaleString('fr-FR')}\n\n` +
        `Pour valider :\n` +
        `/validerpaiement ${chatId} | hebdo\n` +
        `/validerpaiement ${chatId} | mensuel\n` +
        `/validerpaiement ${chatId} | pro`
      );
    } catch {}
  }

  await sendMessage(chatId,
    `✅ *Paiement enregistré !*\n\n` +
    `💳 ${methode} — ${montant} Ar\n` +
    `🔖 Réf : ${reference}\n\n` +
    `Notre équipe va vérifier et activer ton VIP très rapidement.\n` +
    `Tu recevras une notification dès que c'est fait ! ⏳`
  );
}

async function handleValiderPaiement(chatId, args) {
  if (!isAdmin(chatId)) return;

  const parts = args.split('|').map(s => s.trim());
  if (parts.length < 2) {
    await sendMessage(chatId, `Format : /validerpaiement ChatID | plan (hebdo/mensuel/pro)`);
    return;
  }

  const userChatId = parseInt(parts[0]);
  const plan = parts[1].toLowerCase();

  const durees = { hebdo: 7, mensuel: 30, pro: 30 };
  const prix = { hebdo: 2000, mensuel: 5000, pro: 15000 };
  const noms = { hebdo: 'Hebdo', mensuel: 'Mensuel', pro: 'Pro' };

  if (!durees[plan]) {
    await sendMessage(chatId, `Plan invalide. Utilise : hebdo, mensuel ou pro`);
    return;
  }

  const db = await loadDB();

  // Calculer expiration
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + durees[plan]);

  // Ajouter ou mettre à jour VIP
  const existant = db.vip.findIndex(v => v.chatId === userChatId);
  const vipData = {
    chatId: userChatId,
    plan: noms[plan],
    expiration: expiration.toISOString(),
    dateActivation: new Date().toISOString()
  };

  if (existant >= 0) {
    db.vip[existant] = vipData;
  } else {
    db.vip.push(vipData);
  }

  // Mettre à jour le paiement
  const paiement = db.paiements.findLast(p => p.chatId === userChatId && p.statut === 'en_attente');
  if (paiement) {
    paiement.statut = 'validé';
  }

  // Mettre à jour les revenus
  const montant = prix[plan];
  db.revenus.total += montant;
  const moisKey = getMoisKey();
  db.revenus.mois[moisKey] = (db.revenus.mois[moisKey] || 0) + montant;

  await saveDB(db);

  // Notifier l'utilisateur
  try {
    await sendMessage(userChatId,
      `🎉 *FÉLICITATIONS ! Tu es maintenant VIP !*\n\n` +
      `⭐ Plan : *${noms[plan]}*\n` +
      `📅 Valable jusqu'au : *${expiration.toLocaleDateString('fr-FR')}*\n\n` +
      `Tu as maintenant accès à :\n` +
      `🔥 Bons plans AVANT tout le monde\n` +
      `💼 Jobs exclusifs\n` +
      `⚡ Alertes prioritaires\n\n` +
      `Tape /vipcontent pour voir le contenu exclusif !`
    );
  } catch {}

  await sendMessage(chatId,
    `✅ VIP activé pour \`${userChatId}\`\nPlan : ${noms[plan]} — Expire : ${expiration.toLocaleDateString('fr-FR')}\nRevenu : +${montant} Ar`
  );
}

async function handleVipContent(chatId) {
  const db = await loadDB();

  if (!isVIP(db, chatId) && !isAdmin(chatId)) {
    await sendMessage(chatId,
      `🔒 *Contenu réservé aux VIP*\n\n` +
      `Deviens VIP pour accéder aux bons plans exclusifs !\n` +
      `👉 /vip pour voir les offres`
    );
    return;
  }

  // Contenu VIP : les 10 derniers bons plans + jobs (au lieu de 5)
  const plans = db.bonsPlans.slice(-10);
  const jobs = db.jobs.slice(-10);

  let texte = `⭐ *CONTENU VIP EXCLUSIF*\n\n`;

  if (plans.length > 0) {
    texte += `🔥 *TOUS les bons plans (${plans.length}) :*\n\n`;
    plans.forEach((p, i) => {
      texte += `${i + 1}. *${p.titre}*\n   ${p.description}\n   📍 ${p.lieu}\n\n`;
    });
  }

  if (jobs.length > 0) {
    texte += `💼 *TOUS les jobs (${jobs.length}) :*\n\n`;
    jobs.forEach((j, i) => {
      texte += `${i + 1}. *${j.poste}*\n   🏢 ${j.entreprise}\n   📞 ${j.contact}\n\n`;
    });
  }

  if (plans.length === 0 && jobs.length === 0) {
    texte += `Pas encore de contenu exclusif. Ça arrive bientôt ! 🚀`;
  }

  await sendMessage(chatId, texte);
}

// ============================================
//  DASHBOARD ADMIN
// ============================================

async function handleDashboard(chatId) {
  if (!isAdmin(chatId)) return;

  const db = await loadDB();
  const now = new Date();
  const moisKey = getMoisKey();
  const vipActifs = db.vip.filter(v => new Date(v.expiration) > now).length;
  const paiementsAttente = db.paiements.filter(p => p.statut === 'en_attente').length;
  const revenuMois = db.revenus.mois[moisKey] || 0;

  await sendMessage(chatId,
    `📊 *DASHBOARD — Info Mada Live*\n` +
    `${now.toLocaleDateString('fr-FR')}\n\n` +
    `👥 *Abonnés :* ${db.abonnes.length}\n` +
    `⭐ *VIP actifs :* ${vipActifs}\n` +
    `💰 *Paiements en attente :* ${paiementsAttente}\n\n` +
    `📈 *REVENUS*\n` +
    `   Ce mois : *${revenuMois.toLocaleString()} Ar*\n` +
    `   Total : *${db.revenus.total.toLocaleString()} Ar*\n\n` +
    `📝 *CONTENU*\n` +
    `   Coupures : ${db.coupures.length}\n` +
    `   Bons plans : ${db.bonsPlans.length}\n` +
    `   Jobs : ${db.jobs.length}\n` +
    `   Posts sponsorisés : ${db.sponsors.length}\n` +
    `   Clients : ${db.clients.length}\n\n` +
    `*Commandes :*\n` +
    `/paiementsattente - Voir paiements à valider\n` +
    `/clients - Gérer les clients\n` +
    `/revenudetail - Détail revenus par mois\n` +
    `/sponsor - Gérer les posts sponsorisés`
  );
}

async function handlePaiementsAttente(chatId) {
  if (!isAdmin(chatId)) return;

  const db = await loadDB();
  const attente = db.paiements.filter(p => p.statut === 'en_attente');

  if (attente.length === 0) {
    await sendMessage(chatId, `✅ Aucun paiement en attente.`);
    return;
  }

  let texte = `💰 *PAIEMENTS EN ATTENTE (${attente.length})*\n\n`;
  attente.forEach((p, i) => {
    texte += `${i + 1}. *${p.nom}* — ${p.montant} Ar\n`;
    texte += `   📱 ${p.methode} — Réf: \`${p.reference}\`\n`;
    texte += `   📅 ${p.date.split('T')[0]}\n`;
    texte += `   → /validerpaiement ${p.chatId} | mensuel\n\n`;
  });

  await sendMessage(chatId, texte);
}

async function handleRevenuDetail(chatId) {
  if (!isAdmin(chatId)) return;

  const db = await loadDB();
  const mois = db.revenus.mois || {};

  let texte = `📈 *REVENUS PAR MOIS*\n\n`;

  const sorted = Object.entries(mois).sort((a, b) => b[0].localeCompare(a[0]));
  if (sorted.length === 0) {
    texte += `Aucun revenu enregistré.`;
  } else {
    sorted.forEach(([moisKey, montant]) => {
      texte += `📅 ${moisKey} : *${montant.toLocaleString()} Ar*\n`;
    });
    texte += `\n💰 *Total : ${db.revenus.total.toLocaleString()} Ar*`;
  }

  await sendMessage(chatId, texte);
}

// ============================================
//  GESTION CLIENTS (ENTREPRISES)
// ============================================

async function handleClients(chatId) {
  if (!isAdmin(chatId)) return;

  const db = await loadDB();

  if (db.clients.length === 0) {
    await sendMessage(chatId,
      `🏢 *CLIENTS*\n\nAucun client pour le moment.\n\n` +
      `Ajouter un client :\n` +
      `/addclient Nom | Contact | Service | Prix\n` +
      `Ex: /addclient Resto Kaly | 034 12 345 67 | Pack mois | 150000`
    );
    return;
  }

  let texte = `🏢 *CLIENTS (${db.clients.length})*\n\n`;
  db.clients.forEach((c, i) => {
    texte += `${i + 1}. *${c.nom}*\n`;
    texte += `   📞 ${c.contact}\n`;
    texte += `   📋 ${c.service} — ${c.prix} Ar\n`;
    texte += `   📝 ${c.posts ? c.posts.length : 0} post(s)\n\n`;
  });
  texte += `/addclient Nom | Contact | Service | Prix`;

  await sendMessage(chatId, texte);
}

async function handleAddClient(chatId, args) {
  if (!isAdmin(chatId)) return;

  const parts = args.split('|').map(s => s.trim());
  if (parts.length < 4) {
    await sendMessage(chatId, `Format : /addclient Nom | Contact | Service | Prix\nEx: /addclient Resto Kaly | 034 12 345 67 | Pack mois | 150000`);
    return;
  }

  const db = await loadDB();
  const client = {
    id: `CLI-${Date.now()}`,
    nom: parts[0],
    contact: parts[1],
    service: parts[2],
    prix: parseInt(parts[3]) || 0,
    dateAjout: new Date().toISOString(),
    posts: []
  };
  db.clients.push(client);

  // Ajouter au revenu
  db.revenus.total += client.prix;
  const moisKey = getMoisKey();
  db.revenus.mois[moisKey] = (db.revenus.mois[moisKey] || 0) + client.prix;

  await saveDB(db);
  await sendMessage(chatId,
    `✅ *Client ajouté !*\n\n` +
    `🏢 ${client.nom}\n` +
    `📞 ${client.contact}\n` +
    `📋 ${client.service} — ${client.prix} Ar\n\n` +
    `Revenu +${client.prix} Ar ajouté au total.`
  );
}

async function handleDeleteClient(chatId, args) {
  if (!isAdmin(chatId)) return;

  const index = parseInt(args) - 1;
  const db = await loadDB();

  if (isNaN(index) || index < 0 || index >= db.clients.length) {
    await sendMessage(chatId, `Numéro invalide. Tape /clients pour voir la liste.`);
    return;
  }

  const removed = db.clients.splice(index, 1)[0];
  await saveDB(db);
  await sendMessage(chatId, `✅ Client supprimé : ${removed.nom}`);
}

// ============================================
//  POSTS SPONSORISÉS
// ============================================

async function handleSponsor(chatId) {
  if (!isAdmin(chatId)) return;

  const db = await loadDB();
  const actifs = db.sponsors.filter(s => !s.diffuse);

  let texte = `📣 *POSTS SPONSORISÉS*\n\n`;

  if (actifs.length === 0) {
    texte += `Aucun post sponsorisé en attente.\n\n`;
  } else {
    texte += `*En attente de diffusion (${actifs.length}) :*\n\n`;
    actifs.forEach((s, i) => {
      texte += `${i + 1}. [${s.client}] ${s.texte.substring(0, 50)}...\n`;
    });
    texte += `\n`;
  }

  texte +=
    `*Commandes :*\n` +
    `/addsponsor Client | Texte du post\n` +
    `/diffusersponsor - Envoyer les posts en attente\n` +
    `/historiquesp - Historique des posts`;

  await sendMessage(chatId, texte);
}

async function handleAddSponsor(chatId, args) {
  if (!isAdmin(chatId)) return;

  const pipeIndex = args.indexOf('|');
  if (pipeIndex === -1) {
    await sendMessage(chatId,
      `Format : /addsponsor Client | Texte du post\n` +
      `Ex: /addsponsor Resto Kaly | 🔥 PROMO ce midi ! Plat du jour à 5000 Ar au Resto Kaly, Analakely.`
    );
    return;
  }

  const client = args.substring(0, pipeIndex).trim();
  const texte = args.substring(pipeIndex + 1).trim();

  const db = await loadDB();
  const sponsor = {
    id: `SP-${Date.now()}`,
    client,
    texte,
    dateCreation: new Date().toISOString(),
    diffuse: false,
    dateDiffusion: null
  };
  db.sponsors.push(sponsor);

  // Lier au client si existant
  const clientObj = db.clients.find(c => c.nom.toLowerCase() === client.toLowerCase());
  if (clientObj) {
    clientObj.posts.push(sponsor.id);
  }

  await saveDB(db);
  await sendMessage(chatId,
    `✅ *Post sponsorisé créé !*\n\n` +
    `🏢 Client : ${client}\n` +
    `📝 Texte : ${texte.substring(0, 100)}...\n\n` +
    `Tape /diffusersponsor pour l'envoyer à tous les abonnés.`
  );
}

async function handleDiffuserSponsor(chatId) {
  if (!isAdmin(chatId)) return;

  const db = await loadDB();
  const attente = db.sponsors.filter(s => !s.diffuse);

  if (attente.length === 0) {
    await sendMessage(chatId, `Aucun post sponsorisé en attente.`);
    return;
  }

  let envoyes = 0;
  for (const sponsor of attente) {
    const message =
      `📣 *SPONSORISÉ*\n\n` +
      `${sponsor.texte}\n\n` +
      `_— Publié par ${sponsor.client} via Info Mada Live_`;

    for (const ab of db.abonnes) {
      try {
        await sendMessage(ab.chatId, message);
        envoyes++;
      } catch {}
    }

    sponsor.diffuse = true;
    sponsor.dateDiffusion = new Date().toISOString();
  }

  await saveDB(db);
  await sendMessage(chatId,
    `✅ *Diffusion terminée !*\n\n` +
    `📣 ${attente.length} post(s) envoyé(s)\n` +
    `👥 ${envoyes} message(s) délivré(s)`
  );
}

async function handleHistoriqueSp(chatId) {
  if (!isAdmin(chatId)) return;

  const db = await loadDB();
  const diffuses = db.sponsors.filter(s => s.diffuse).slice(-10);

  if (diffuses.length === 0) {
    await sendMessage(chatId, `Aucun post sponsorisé diffusé.`);
    return;
  }

  let texte = `📣 *HISTORIQUE POSTS SPONSORISÉS*\n\n`;
  diffuses.forEach((s, i) => {
    texte += `${i + 1}. [${s.client}] ${s.texte.substring(0, 40)}...\n`;
    texte += `   📅 ${s.dateDiffusion ? s.dateDiffusion.split('T')[0] : 'N/A'}\n\n`;
  });

  await sendMessage(chatId, texte);
}

// ============================================
//  COMMANDES ADMIN EXISTANTES
// ============================================

async function handleAdmin(chatId) {
  if (!isAdmin(chatId)) return;
  await sendMessage(chatId,
    `*ADMIN — Info Mada Live*\n\n` +
    `*Dashboard :*\n` +
    `/dashboard - Vue d'ensemble\n` +
    `/paiementsattente - Paiements a valider\n` +
    `/revenudetail - Revenus par mois\n\n` +
    `*Clients :*\n` +
    `/clients - Liste des clients\n` +
    `/addclient Nom | Contact | Service | Prix\n` +
    `/deleteclient Numero\n\n` +
    `*Sponsorise & Promo :*\n` +
    `/sponsor - Posts sponsorises\n` +
    `/addsponsor Client | Texte\n` +
    `/diffusersponsor - Envoyer a tous\n` +
    `/promo Texte - Envoyer une promo flash\n\n` +
    `*VIP :*\n` +
    `/validerpaiement ChatID | plan\n` +
    `/listevip - Liste des VIP\n\n` +
    `*Parrainage :*\n` +
    `/statsparrainage - Stats des parrainages\n\n` +
    `*Contenu :*\n` +
    `/addcoupure Zone | Date | Duree\n` +
    `/addbonplan Titre | Description | Lieu\n` +
    `/addjob Poste | Entreprise | Contact\n` +
    `/broadcast Message\n` +
    `/listeabonnes`
  );
}

async function handleListeVip(chatId) {
  if (!isAdmin(chatId)) return;

  const db = await loadDB();
  const now = new Date();
  const actifs = db.vip.filter(v => new Date(v.expiration) > now);

  if (actifs.length === 0) {
    await sendMessage(chatId, `⭐ Aucun VIP actif.`);
    return;
  }

  let texte = `⭐ *VIP ACTIFS (${actifs.length})*\n\n`;
  actifs.forEach((v, i) => {
    const exp = new Date(v.expiration).toLocaleDateString('fr-FR');
    texte += `${i + 1}. ID: \`${v.chatId}\` — ${v.plan} — expire ${exp}\n`;
  });

  await sendMessage(chatId, texte);
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
    } catch {}
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
//  PARRAINAGE
// ============================================

async function handleParrainer(chatId) {
  const db = await loadDB();
  const nbFilleuls = (db.parrainages || []).filter(p => p.parrainId === chatId).length;

  await sendMessage(chatId,
    `*PARRAINAGE — Info Mada Live*\n\n` +
    `Invite tes amis et gagne du *VIP GRATUIT* !\n\n` +
    `*Ton lien personnel :*\n` +
    `https://t.me/InfoMadaLiveBot?start=ref\\_${chatId}\n\n` +
    `*Tes filleuls :* ${nbFilleuls}\n` +
    `*Objectif :* 5 filleuls = *1 semaine VIP gratuite*\n\n` +
    `${nbFilleuls < 5 ? `Encore *${5 - nbFilleuls}* pour gagner !` : `BRAVO tu as atteint l'objectif !`}\n\n` +
    `_Copie le lien et envoie-le a tes amis !_`
  );
}

async function handleMesFilleuls(chatId) {
  const db = await loadDB();
  const filleuls = (db.parrainages || []).filter(p => p.parrainId === chatId);

  if (filleuls.length === 0) {
    await sendMessage(chatId,
      `Tu n'as pas encore de filleuls.\n\nTape /parrainer pour obtenir ton lien !`
    );
    return;
  }

  let texte = `*TES FILLEULS (${filleuls.length})*\n\n`;
  filleuls.forEach((f, i) => {
    texte += `${i + 1}. ${f.filleulNom} — ${f.date.split('T')[0]}\n`;
  });
  texte += `\n${filleuls.length >= 5 ? 'VIP gratuit gagne !' : `Encore ${5 - filleuls.length} pour le VIP gratuit`}`;

  await sendMessage(chatId, texte);
}

// ============================================
//  ADMIN — PROMO FLASH
// ============================================

async function handlePromo(chatId, args) {
  if (!isAdmin(chatId)) return;

  const db = await loadDB();
  const message =
    `*PROMO FLASH — Info Mada Live*\n\n` +
    `${args}\n\n` +
    `/vip pour en profiter MAINTENANT\n` +
    `_Offre limitee !_`;

  let envoyes = 0;
  for (const ab of db.abonnes) {
    try {
      await sendMessage(ab.chatId, message);
      envoyes++;
    } catch {}
  }
  await sendMessage(chatId, `Promo envoyee a ${envoyes}/${db.abonnes.length} abonnes`);
}

async function handleStatsParrainage(chatId) {
  if (!isAdmin(chatId)) return;

  const db = await loadDB();
  const parrainages = db.parrainages || [];

  if (parrainages.length === 0) {
    await sendMessage(chatId, `Aucun parrainage enregistre.`);
    return;
  }

  const compteur = {};
  parrainages.forEach(p => {
    compteur[p.parrainId] = (compteur[p.parrainId] || 0) + 1;
  });

  const top = Object.entries(compteur)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  let texte = `*STATS PARRAINAGE*\n\n`;
  texte += `Total parrainages : ${parrainages.length}\n\n`;
  texte += `*Top parrains :*\n`;
  top.forEach(([id, count], i) => {
    const parrain = db.abonnes.find(a => a.chatId === parseInt(id));
    texte += `${i + 1}. ${parrain ? parrain.nom : id} — ${count} filleul(s)\n`;
  });

  await sendMessage(chatId, texte);
}

// ============================================
//  WEBHOOK HANDLER (point d'entrée Vercel)
// ============================================

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(200).send('Info Mada Live Bot v3.0 — VIP + Sponsors + Parrainage + Cron');
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

    // Utilisateur — /start avec payload de parrainage
    if (text === '/start') await handleStart(chatId, nom, null);
    else if (text.startsWith('/start ')) await handleStart(chatId, nom, text.substring(7));
    else if (text === '/menu') await handleMenu(chatId);
    else if (text === '/coupures') await handleCoupures(chatId);
    else if (text === '/bonsplans') await handleBonsPlans(chatId);
    else if (text === '/jobs') await handleJobs(chatId);
    else if (text === '/stats') await handleStats(chatId);
    else if (text === '/partager') await handlePartager(chatId);
    else if (text === '/monid') await handleMonId(chatId);
    else if (text === '/signaler') await handleSignaler(chatId);
    else if (text.startsWith('/signal ')) await handleSignal(chatId, nom, text.substring(8));

    // Parrainage
    else if (text === '/parrainer') await handleParrainer(chatId);
    else if (text === '/mesfilleuls') await handleMesFilleuls(chatId);

    // VIP & Paiement
    else if (text === '/vip') await handleVip(chatId);
    else if (text === '/payer') await handlePayer(chatId);
    else if (text.startsWith('/confirmer ')) await handleConfirmer(chatId, nom, text.substring(11));
    else if (text === '/vipcontent') await handleVipContent(chatId);

    // Admin — Dashboard
    else if (text === '/admin') await handleAdmin(chatId);
    else if (text === '/dashboard') await handleDashboard(chatId);
    else if (text === '/paiementsattente') await handlePaiementsAttente(chatId);
    else if (text === '/revenudetail') await handleRevenuDetail(chatId);
    else if (text.startsWith('/validerpaiement ')) await handleValiderPaiement(chatId, text.substring(17));
    else if (text === '/listevip') await handleListeVip(chatId);
    else if (text === '/statsparrainage') await handleStatsParrainage(chatId);

    // Admin — Clients
    else if (text === '/clients') await handleClients(chatId);
    else if (text.startsWith('/addclient ')) await handleAddClient(chatId, text.substring(11));
    else if (text.startsWith('/deleteclient ')) await handleDeleteClient(chatId, text.substring(14));

    // Admin — Sponsors & Promo
    else if (text === '/sponsor') await handleSponsor(chatId);
    else if (text.startsWith('/addsponsor ')) await handleAddSponsor(chatId, text.substring(12));
    else if (text === '/diffusersponsor') await handleDiffuserSponsor(chatId);
    else if (text === '/historiquesp') await handleHistoriqueSp(chatId);
    else if (text.startsWith('/promo ')) await handlePromo(chatId, text.substring(7));

    // Admin — Contenu
    else if (text.startsWith('/addcoupure ')) await handleAddCoupure(chatId, text.substring(12));
    else if (text.startsWith('/addbonplan ')) await handleAddBonPlan(chatId, text.substring(12));
    else if (text.startsWith('/addjob ')) await handleAddJob(chatId, text.substring(8));
    else if (text.startsWith('/broadcast ')) await handleBroadcast(chatId, text.substring(11));
    else if (text === '/listeabonnes') await handleListeAbonnes(chatId);

    // Mot-clé
    else if (text.toUpperCase().trim() === 'INFO') await handleInfo(chatId);

    res.status(200).send('ok');
  } catch (error) {
    console.error('Erreur webhook:', error);
    res.status(200).send('ok');
  }
};
