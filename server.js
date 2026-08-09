const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// JSON data read karne ke liye middleware
app.use(express.json());
app.use(express.static('public'));

// SQLite Database Setup
const db = new sqlite3.Database('./hardware_history.db', (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('📦 Connected to SQLite Database.');
  }
});

// Table Setup
db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device TEXT,
    status TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// History Fetch API
app.get('/api/history', (req, res) => {
  db.all('SELECT * FROM logs ORDER BY id DESC LIMIT 50', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 🚀 NAYA API ENDPOINT: Kisi bhi doosre software se data receive karne ke liye
app.post('/api/log', (req, res) => {
  const { device, status } = req.body;

  if (!device || !status) {
    return res.status(400).json({ error: 'Device and Status are required' });
  }

  // Database mein save karein
  const stmt = db.prepare('INSERT INTO logs (device, status) VALUES (?, ?)');
  stmt.run(device, status, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const newLog = { id: this.lastID, device, status };
    
    // Live UI Dashboard ko update karein
    io.emit('hardware-status', newLog);

    res.json({ message: 'Data logged successfully!', log: newLog });
  });
  stmt.finalize();
});

io.on('connection', (socket) => {
  console.log('⚡ Client Connected:', socket.id);

  socket.on('toggle-relay', (data) => {
    console.log('Control Command Received:', data);

    const stmt = db.prepare('INSERT INTO logs (device, status) VALUES (?, ?)');
    stmt.run(data.device || 'Relay1', data.status);
    stmt.finalize();

    io.emit('hardware-status', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client Disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});