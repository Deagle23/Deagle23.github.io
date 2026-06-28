const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

let waitingPlayers = [];

const dataFile = path.join(__dirname, 'waiting.json');
if (fs.existsSync(dataFile)) {
  waitingPlayers = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
}

app.post('/webhook', (req, res) => {
  const { server, room, playerName, timestamp } = req.body;
  
  waitingPlayers.push({
    server,
    room,
    playerName: playerName || 'Anonymous',
    timestamp: timestamp || new Date().toISOString(),
    status: 'waiting'
  });

  if (waitingPlayers.length > 100) {
    waitingPlayers = waitingPlayers.slice(-100);
  }

  fs.writeFileSync(dataFile, JSON.stringify(waitingPlayers, null, 2));
  
  console.log(`📢 ${playerName} is waiting in ${server}:${room}`);
  res.status(200).json({ success: true });
});

app.post('/clear', (req, res) => {
  const { playerName } = req.body;
  waitingPlayers = waitingPlayers.filter(p => p.playerName !== playerName);
  fs.writeFileSync(dataFile, JSON.stringify(waitingPlayers, null, 2));
  res.status(200).json({ success: true });
});

app.listen(3000, () => console.log('Webhook server running on port 3000'));
