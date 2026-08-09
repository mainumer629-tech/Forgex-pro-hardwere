const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());
app.use(express.static('public'));

// SQLite Database Setup
const db = new sqlite3.Database('./hardware_history.db', (err) => {
  if (err) console.error('❌ DB Error:', err.message);
  else console.log('📦 Connected to SQLite Database.');
});

// Table Setup
db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device TEXT,
    status TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Fetch History API
app.get('/api/history', (req, res) => {
  db.all('SELECT * FROM logs ORDER BY id DESC LIMIT 50', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 🚀 NAYA API: Refresh par Aakhri Status Pucho
app.get('/api/latest-status', (req, res) => {
  db.get('SELECT status FROM logs ORDER BY id DESC LIMIT 1', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: row ? row.status : 'OFF' });
  });
});

// External App Logging API
app.post('/api/log', (req, res) => {
  const { device, status } = req.body;
  if (!device || !status) return res.status(400).json({ error: 'Device and Status required' });

  const stmt = db.prepare('INSERT INTO logs (device, status) VALUES (?, ?)');
  stmt.run(device, status, function(err) {
    if (err) return res.status(500).json({ error: err.message });

    const newLog = { id: this.lastID, device, status };
    io.emit('hardware-status', newLog);
    res.json({ message: 'Success', log: newLog });
  });
  stmt.finalize();
});

io.on('connection', (socket) => {
  socket.on('toggle-relay', (data) => {
    const stmt = db.prepare('INSERT INTO logs (device, status) VALUES (?, ?)');
    stmt.run(data.device || 'Relay1', data.status);
    stmt.finalize();

    io.emit('hardware-status', data);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});