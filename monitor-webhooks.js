const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const logFile = path.join(__dirname, 'webhook-monitor.log');

// Create a simple server to receive webhooks
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/groupme-webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      const timestamp = new Date().toISOString();
      console.log(`\n[${timestamp}] Webhook received!`);
      
      try {
        const data = JSON.parse(body);
        console.log('Sender:', data.name);
        console.log('Text:', data.text);
        console.log('Group ID:', data.group_id);
        
        // Log to file
        const logEntry = `${timestamp} | ${data.name}: ${data.text}\n`;
        fs.appendFileSync(logFile, logEntry);
        
      } catch (error) {
        console.error('Failed to parse webhook data:', error);
      }
      
      // Always return 200 to GroupMe
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Webhook received' }));
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('GroupMe Webhook Monitor\n\nPOST to /api/groupme-webhook to test');
  }
});

server.listen(PORT, () => {
  console.log(`
🔍 GroupMe Webhook Monitor Started
===================================
Listening on: http://localhost:${PORT}/api/groupme-webhook

To use this monitor:
1. Install ngrok: brew install ngrok (or download from ngrok.com)
2. Run: ngrok http ${PORT}
3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
4. Update webhook: node update-webhook-url.js https://abc123.ngrok.io/api/groupme-webhook

Logs will be saved to: ${logFile}
Press Ctrl+C to stop monitoring.
`);
});