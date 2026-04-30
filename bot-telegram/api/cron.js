// ============================================
//  INFO MADA LIVE - Cron Job (Vercel)
//  Broadcasts auto + relances VIP + rappels
// ============================================

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_IDS = process.env.ADMIN_IDS
  ? process.env.ADMIN_IDS.split(',').map(Number)
  : [];
const JSONBIN_ID = process.env.JSONBIN_ID || '';
const JSONBIN_KEY = process.env.JSONBIN_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  });
}

async function loadDB() {
  if (!JSONBIN_ID || !JSONBIN_KEY) return null;
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_KEY }
    });
    const json = await res.json();
    return json.record || {};
  } catch {
    return null;
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

module.exports = async (req, res) => {
  // Vercel cron auth
  if (CRON_SECRET && req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    res.status(401).send('Unauthorized');
    return;
  }

  const db = await loadDB();
  if (!db || !db.abonnes || db.abonnes.length === 0) {
    res.status(200).send('No data or no subscribers');
    return;
  }

  const now = new Date();
  const mgHour = (now.getUTCHours() + 3) % 24;

  let message = null;

  // --- BROADCAST MATIN (7h) : Coupures ---
  if (mgHour >= 6 && mgHour <= 8) {
    const coupures = (db.coupures || []).slice(-3);
    if (coupures.length > 0) {
      message = `*BONJOUR MADA ! Coupures du jour :*\n\n`;
      coupures.forEach((c, i) => {
        message += `${i + 1}. ${c.zone} - ${c.date} (${c.duree})\n`;
      });
      message += `\n/coupures pour plus de details`;
    }
  }

  // --- BROADCAST MIDI (12h) : Bons plans ---
  if (mgHour >= 11 && mgHour <= 13) {
    const plans = (db.bonsPlans || []).slice(-3);
    if (plans.length > 0) {
      message = `*BONS PLANS DU MIDI*\n\n`;
      plans.forEach((p, i) => {
        message += `${i + 1}. *${p.titre}* - ${p.description} (${p.lieu})\n`;
      });
      message += `\n/bonsplans pour tout voir`;
    }
  }

  // --- BROADCAST SOIR (19h) : Jobs ---
  if (mgHour >= 18 && mgHour <= 20) {
    const jobs = (db.jobs || []).slice(-3);
    if (jobs.length > 0) {
      message = `*OFFRES D'EMPLOI DU SOIR*\n\n`;
      jobs.forEach((j, i) => {
        message += `${i + 1}. *${j.poste}* - ${j.entreprise} (${j.contact})\n`;
      });
      message += `\n/jobs pour tout voir`;
    }
  }

  let envoyesBroadcast = 0;

  // Envoyer le broadcast
  if (message) {
    for (const ab of db.abonnes) {
      try {
        await sendMessage(ab.chatId, message);
        envoyesBroadcast++;
      } catch {}
    }
  }

  // --- RELANCES VIP (tous les jours) ---
  let relancesEnvoyees = 0;
  const vipList = db.vip || [];

  for (const membre of vipList) {
    const expiration = new Date(membre.expiration);
    const joursRestants = Math.ceil((expiration - now) / (1000 * 60 * 60 * 24));

    // Relance 2 jours avant expiration
    if (joursRestants === 2 || joursRestants === 1) {
      try {
        await sendMessage(membre.chatId,
          `*Ton abonnement VIP expire ${joursRestants === 1 ? 'DEMAIN' : 'dans 2 jours'} !*\n\n` +
          `Renouvelle maintenant pour ne rien perdre :\n\n` +
          `Mensuel : 5 000 Ar\nPro : 15 000 Ar\n\n` +
          `/payer pour renouveler`
        );
        relancesEnvoyees++;
      } catch {}
    }

    // Relance le jour de l'expiration
    if (joursRestants === 0) {
      try {
        await sendMessage(membre.chatId,
          `*Ton VIP expire AUJOURD'HUI !*\n\n` +
          `Renouvelle maintenant :\n` +
          `/payer\n\n` +
          `_-50% si tu renouvelles aujourd'hui !_\n` +
          `Mensuel : ~~5 000~~ *2 500 Ar*`
        );
        relancesEnvoyees++;
      } catch {}
    }
  }

  // --- RELANCE NON-VIP (une fois par semaine, le lundi midi) ---
  let promosEnvoyees = 0;
  const dayOfWeek = now.getUTCDay(); // 0=dimanche, 1=lundi

  if (dayOfWeek === 1 && mgHour >= 11 && mgHour <= 13) {
    const nonVip = db.abonnes.filter(ab => {
      const isVip = vipList.some(v => v.chatId === ab.chatId && new Date(v.expiration) > now);
      return !isVip;
    });

    // Envoyer la promo VIP aux non-VIP (max 50 par cron pour eviter timeout)
    const batch = nonVip.slice(0, 50);
    for (const ab of batch) {
      try {
        await sendMessage(ab.chatId,
          `*OFFRE SPECIALE cette semaine !*\n\n` +
          `Deviens VIP et recois les bons plans AVANT tout le monde :\n\n` +
          `Mensuel : *5 000 Ar/mois*\n` +
          `Hebdo : *2 000 Ar/semaine*\n\n` +
          `/vip pour en savoir plus`
        );
        promosEnvoyees++;
      } catch {}
    }
  }

  // --- RAPPORT ADMIN (soir) ---
  if (mgHour >= 18 && mgHour <= 20) {
    const moisKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const revenuMois = (db.revenus && db.revenus.mois && db.revenus.mois[moisKey]) || 0;
    const vipActifs = vipList.filter(v => new Date(v.expiration) > now).length;
    const paiementsAttente = (db.paiements || []).filter(p => p.statut === 'en_attente').length;

    for (const adminId of ADMIN_IDS) {
      try {
        await sendMessage(adminId,
          `*RAPPORT DU JOUR*\n\n` +
          `Abonnes : ${db.abonnes.length}\n` +
          `VIP actifs : ${vipActifs}\n` +
          `Paiements en attente : ${paiementsAttente}\n` +
          `Revenu du mois : ${revenuMois.toLocaleString()} Ar\n\n` +
          `Broadcast : ${envoyesBroadcast} envoyes\n` +
          `Relances VIP : ${relancesEnvoyees}\n` +
          `Promos : ${promosEnvoyees}`
        );
      } catch {}
    }
  }

  res.status(200).send(`Cron OK — broadcast:${envoyesBroadcast} relances:${relancesEnvoyees} promos:${promosEnvoyees}`);
};
