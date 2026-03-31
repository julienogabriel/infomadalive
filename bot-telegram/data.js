// ============================================
// BASE DE DONNÉES SIMPLE (fichier JSON)
// Plus tard → remplacer par PostgreSQL
// ============================================

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      coupures: [],
      bonsPlans: [],
      jobs: [],
      abonnes: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- COUPURES JIRAMA ---

function ajouterCoupure(zone, date, duree) {
  const db = loadDB();
  db.coupures.push({ zone, date, duree, creeLe: new Date().toISOString() });
  // Garder seulement les 50 dernières
  if (db.coupures.length > 50) db.coupures = db.coupures.slice(-50);
  saveDB(db);
}

function getCoupures() {
  const db = loadDB();
  // Retourner les 5 plus récentes
  return db.coupures.slice(-5);
}

// --- BONS PLANS ---

function ajouterBonPlan(titre, description, lieu) {
  const db = loadDB();
  db.bonsPlans.push({ titre, description, lieu, creeLe: new Date().toISOString() });
  if (db.bonsPlans.length > 50) db.bonsPlans = db.bonsPlans.slice(-50);
  saveDB(db);
}

function getBonsPlans() {
  const db = loadDB();
  return db.bonsPlans.slice(-5);
}

// --- JOBS ---

function ajouterJob(poste, entreprise, contact) {
  const db = loadDB();
  db.jobs.push({ poste, entreprise, contact, creeLe: new Date().toISOString() });
  if (db.jobs.length > 50) db.jobs = db.jobs.slice(-50);
  saveDB(db);
}

function getJobs() {
  const db = loadDB();
  return db.jobs.slice(-5);
}

// --- ABONNÉS ---

function ajouterAbonne(chatId, nom) {
  const db = loadDB();
  if (!db.abonnes.find(a => a.chatId === chatId)) {
    db.abonnes.push({ chatId, nom, date: new Date().toISOString() });
    saveDB(db);
    return true;
  }
  return false;
}

function getAbonnes() {
  const db = loadDB();
  return db.abonnes;
}

function getNombreAbonnes() {
  const db = loadDB();
  return db.abonnes.length;
}

module.exports = {
  ajouterCoupure, getCoupures,
  ajouterBonPlan, getBonsPlans,
  ajouterJob, getJobs,
  ajouterAbonne, getAbonnes, getNombreAbonnes
};
