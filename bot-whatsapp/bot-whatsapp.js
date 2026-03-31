// ============================================
//  INFO MADA LIVE - Bot WhatsApp
//  Utilise whatsapp-web.js (gratuit, pas besoin d'API Business)
// ============================================

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// --- Base de données simple ---
const DB_FILE = path.join(__dirname, 'db.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { coupures: [], bonsPlans: [], jobs: [], abonnes: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- Lancement du client ---
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ['--no-sandbox'] }
});

client.on('qr', (qr) => {
  console.log('📱 Scanne ce QR code avec WhatsApp :');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('🟢 Info Mada Live WhatsApp Bot est connecté !');
});

// --- Gestion des messages ---
client.on('message', async (msg) => {
  const texte = msg.body.toUpperCase().trim();
  const contact = await msg.getContact();
  const nom = contact.pushname || 'ami(e)';

  // Inscription automatique
  const db = loadDB();
  const chatId = msg.from;
  if (!db.abonnes.find(a => a.chatId === chatId)) {
    db.abonnes.push({ chatId, nom, date: new Date().toISOString() });
    saveDB(db);
  }

  // --- COMMANDES ---

  if (texte === 'MENU' || texte === 'SALUT' || texte === 'BONJOUR') {
    await msg.reply(
      `🇲🇬 *Info Mada Live*\n\n` +
      `Bienvenue ${nom} !\n\n` +
      `Tape un mot-clé :\n\n` +
      `⚡ *COUPURE* → Alertes JIRAMA\n` +
      `🔥 *BONPLAN* → Bons plans du jour\n` +
      `💼 *JOB* → Offres d'emploi\n` +
      `📋 *INFO* → Résumé rapide\n` +
      `📢 *PARTAGER* → Lien du bot\n\n` +
      `_Envoie un mot-clé pour commencer !_`
    );
    return;
  }

  if (texte === 'COUPURE' || texte === 'COUPURES' || texte === 'JIRAMA') {
    const coupures = loadDB().coupures.slice(-5);
    if (coupures.length === 0) {
      await msg.reply('⚡ *Coupures JIRAMA*\n\nAucune coupure signalée. On te prévient dès qu\'il y en a !');
      return;
    }
    let rep = '⚡ *COUPURES JIRAMA*\n\n';
    coupures.forEach((c, i) => {
      rep += `${i + 1}. 📍 *${c.zone}*\n   📅 ${c.date}\n   ⏱ ${c.duree}\n\n`;
    });
    rep += '_Partage ce message pour prévenir tes proches !_';
    await msg.reply(rep);
    return;
  }

  if (texte === 'BONPLAN' || texte === 'BONSPLANS' || texte === 'BON PLAN') {
    const plans = loadDB().bonsPlans.slice(-5);
    if (plans.length === 0) {
      await msg.reply('🔥 *Bons Plans*\n\nAucun bon plan pour le moment. Reviens bientôt !');
      return;
    }
    let rep = '🔥 *BONS PLANS DU MOMENT*\n\n';
    plans.forEach((p, i) => {
      rep += `${i + 1}. *${p.titre}*\n   ${p.description}\n   📍 ${p.lieu}\n\n`;
    });
    await msg.reply(rep);
    return;
  }

  if (texte === 'JOB' || texte === 'JOBS' || texte === 'EMPLOI' || texte === 'TRAVAIL') {
    const jobs = loadDB().jobs.slice(-5);
    if (jobs.length === 0) {
      await msg.reply('💼 *Offres d\'emploi*\n\nAucune offre pour le moment. On publie dès qu\'on en a !');
      return;
    }
    let rep = '💼 *OFFRES D\'EMPLOI*\n\n';
    jobs.forEach((j, i) => {
      rep += `${i + 1}. *${j.poste}*\n   🏢 ${j.entreprise}\n   📞 ${j.contact}\n\n`;
    });
    await msg.reply(rep);
    return;
  }

  if (texte === 'INFO') {
    const db2 = loadDB();
    await msg.reply(
      `🇲🇬 *RÉSUMÉ INFO MADA LIVE*\n\n` +
      `⚡ Coupures : ${db2.coupures.length > 0 ? db2.coupures.length + ' signalée(s)' : 'Aucune'}\n` +
      `🔥 Bons plans : ${db2.bonsPlans.length > 0 ? db2.bonsPlans.length + ' dispo' : 'Aucun'}\n` +
      `💼 Jobs : ${db2.jobs.length > 0 ? db2.jobs.length + ' offre(s)' : 'Aucun'}\n\n` +
      `Tape COUPURE, BONPLAN ou JOB pour les détails.`
    );
    return;
  }

  if (texte === 'PARTAGER') {
    await msg.reply(
      `📢 *Partage Info Mada Live !*\n\n` +
      `Envoie ce message à tes groupes WhatsApp :\n\n` +
      `"🇲🇬 Info Mada Live - Reçois chaque jour les coupures JIRAMA, bons plans et offres d\'emploi GRATUITEMENT sur WhatsApp ! Envoie MENU au [ton numéro] pour commencer."\n\n` +
      `_Plus on est nombreux, meilleures sont les infos !_`
    );
    return;
  }

  // --- COMMANDES ADMIN (ton numéro uniquement) ---
  // Configure ton numéro ici (format: 261XXXXXXXXX@c.us)
  const ADMIN_NUMBER = process.env.ADMIN_WHATSAPP || '';

  if (chatId === ADMIN_NUMBER) {
    // !coupure Zone | Date | Durée
    if (texte.startsWith('!COUPURE ')) {
      const parts = msg.body.substring(9).split('|').map(s => s.trim());
      if (parts.length >= 3) {
        const db3 = loadDB();
        db3.coupures.push({ zone: parts[0], date: parts[1], duree: parts[2], creeLe: new Date().toISOString() });
        if (db3.coupures.length > 50) db3.coupures = db3.coupures.slice(-50);
        saveDB(db3);
        await msg.reply(`✅ Coupure ajoutée : ${parts[0]}`);
      } else {
        await msg.reply('Format : !coupure Zone | Date | Durée');
      }
      return;
    }

    // !bonplan Titre | Desc | Lieu
    if (texte.startsWith('!BONPLAN ')) {
      const parts = msg.body.substring(9).split('|').map(s => s.trim());
      if (parts.length >= 3) {
        const db3 = loadDB();
        db3.bonsPlans.push({ titre: parts[0], description: parts[1], lieu: parts[2], creeLe: new Date().toISOString() });
        if (db3.bonsPlans.length > 50) db3.bonsPlans = db3.bonsPlans.slice(-50);
        saveDB(db3);
        await msg.reply(`✅ Bon plan ajouté : ${parts[0]}`);
      } else {
        await msg.reply('Format : !bonplan Titre | Description | Lieu');
      }
      return;
    }

    // !job Poste | Entreprise | Contact
    if (texte.startsWith('!JOB ')) {
      const parts = msg.body.substring(5).split('|').map(s => s.trim());
      if (parts.length >= 3) {
        const db3 = loadDB();
        db3.jobs.push({ poste: parts[0], entreprise: parts[1], contact: parts[2], creeLe: new Date().toISOString() });
        if (db3.jobs.length > 50) db3.jobs = db3.jobs.slice(-50);
        saveDB(db3);
        await msg.reply(`✅ Job ajouté : ${parts[0]}`);
      } else {
        await msg.reply('Format : !job Poste | Entreprise | Contact');
      }
      return;
    }

    // !broadcast Message
    if (texte.startsWith('!BROADCAST ')) {
      const message = msg.body.substring(11);
      const abonnes = loadDB().abonnes;
      let envoyes = 0;
      for (const ab of abonnes) {
        try {
          await client.sendMessage(ab.chatId, `📢 *Info Mada Live*\n\n${message}`);
          envoyes++;
          // Pause pour éviter le ban WhatsApp
          await new Promise(r => setTimeout(r, 1000));
        } catch { /* skip */ }
      }
      await msg.reply(`✅ Broadcast envoyé à ${envoyes}/${abonnes.length} abonnés`);
      return;
    }
  }
});

client.initialize();
