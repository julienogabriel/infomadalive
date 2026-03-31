// ============================================
//  Script pour activer le webhook Telegram
//  Lance UNE SEULE FOIS après le déploiement
// ============================================
//
//  Usage :
//  node setup-webhook.js TON_TOKEN TON_URL_VERCEL
//
//  Exemple :
//  node setup-webhook.js 7123456:AAHxxx https://infomadalive.vercel.app
//

const token = process.argv[2];
const url = process.argv[3];

if (!token || !url) {
  console.log('Usage : node setup-webhook.js <TOKEN> <URL_VERCEL>');
  console.log('Exemple : node setup-webhook.js 7123456:AAHxxx https://infomadalive.vercel.app');
  process.exit(1);
}

const webhookUrl = `${url}/api/webhook`;

async function setup() {
  console.log(`\nConfiguration du webhook...`);
  console.log(`Token : ${token.substring(0, 10)}...`);
  console.log(`Webhook : ${webhookUrl}\n`);

  // Supprimer l'ancien webhook
  await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);

  // Configurer le nouveau
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl })
  });

  const data = await res.json();

  if (data.ok) {
    console.log('✅ Webhook configuré avec succès !');
    console.log(`\nTon bot écoute sur : ${webhookUrl}`);
    console.log('\nVa sur Telegram et tape /start pour tester !');
  } else {
    console.log('❌ Erreur :', data.description);
  }

  // Vérifier
  const info = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
  const infoData = await info.json();
  console.log('\nInfo webhook :', JSON.stringify(infoData.result, null, 2));
}

setup().catch(console.error);
