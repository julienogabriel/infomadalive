// ============================================
//  Script pour créer ta base de données JSONBin
//  Lance UNE SEULE FOIS
// ============================================
//
//  1. Va sur jsonbin.io → crée un compte GRATUIT
//  2. Va dans API Keys → copie ta Master Key
//  3. Lance : node setup-jsonbin.js TA_MASTER_KEY
//

const masterKey = process.argv[2];

if (!masterKey) {
  console.log('Usage : node setup-jsonbin.js <MASTER_KEY>');
  console.log('\n1. Va sur https://jsonbin.io → crée un compte gratuit');
  console.log('2. Va dans API Keys → copie ta Master Key');
  console.log('3. Relance cette commande avec ta clé');
  process.exit(1);
}

async function setup() {
  console.log('Création de la base de données...\n');

  const initialData = {
    coupures: [],
    bonsPlans: [],
    jobs: [],
    abonnes: []
  };

  const res = await fetch('https://api.jsonbin.io/v3/b', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': masterKey,
      'X-Bin-Name': 'infomadalive-db',
      'X-Bin-Private': 'true'
    },
    body: JSON.stringify(initialData)
  });

  const data = await res.json();

  if (data.metadata) {
    const binId = data.metadata.id;
    console.log('✅ Base de données créée !\n');
    console.log('='.repeat(50));
    console.log('IMPORTANT — Garde ces valeurs :');
    console.log('='.repeat(50));
    console.log(`\nJSONBIN_ID = ${binId}`);
    console.log(`JSONBIN_KEY = ${masterKey}`);
    console.log('\nAjoute ces 2 variables dans Vercel :');
    console.log('→ Settings → Environment Variables');
    console.log('='.repeat(50));
  } else {
    console.log('❌ Erreur :', JSON.stringify(data));
  }
}

setup().catch(console.error);
