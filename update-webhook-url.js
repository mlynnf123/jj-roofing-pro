const https = require('https');

// Configuration
const BOT_ID = '56cc13682b3403ff3c51f8d387';
const ACCESS_TOKEN = process.env.GROUPME_ACCESS_TOKEN || 'HukO47m1FGKKpCj9RjA79H1G716Mmh8OzaNHCkrZ';
const NEW_WEBHOOK_URL = process.argv[2];

if (!NEW_WEBHOOK_URL) {
  console.log(`
Usage: node update-webhook-url.js <webhook-url>

Examples:
  - Production: node update-webhook-url.js https://jj-roofing-pro.vercel.app/api/groupme-webhook
  - ngrok:      node update-webhook-url.js https://abc123.ngrok.io/api/groupme-webhook
  - Local test: node update-webhook-url.js https://webhook.site/your-unique-url

Current bot webhook: https://jj-roofing-pro.vercel.app/api/groupme-webhook
`);
  process.exit(1);
}

// Update bot webhook
const updateData = JSON.stringify({
  bot: {
    bot_id: BOT_ID,
    callback_url: NEW_WEBHOOK_URL
  }
});

const options = {
  hostname: 'api.groupme.com',
  port: 443,
  path: `/v3/bots/${BOT_ID}?token=${ACCESS_TOKEN}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': updateData.length
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Webhook updated successfully!');
      console.log(`New webhook URL: ${NEW_WEBHOOK_URL}`);
      console.log('\nNote: For local testing, you need to:');
      console.log('1. Use ngrok or similar to expose your local server');
      console.log('2. Or deploy to Vercel/production for real-time testing');
    } else {
      console.error('❌ Failed to update webhook');
      console.error(`Status: ${res.statusCode}`);
      console.error(`Response: ${data}`);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error);
});

req.write(updateData);
req.end();