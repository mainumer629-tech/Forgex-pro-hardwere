const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// SQLite Database Setup
const db = new sqlite3.Database('./hardware_history.db', (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('📦 Connected to SQLite Database.');
  }
});

// Create Table for Logs
db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device TEXT,
    status TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.use(express.static('public'));

// API Route to see history
app.get('/api/history', (req, res) => {
  db.all('SELECT * FROM logs ORDER BY id DESC LIMIT 50', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

io.on('connection', (socket) => {
  console.log('⚡ Client Connected:', socket.id);

  socket.on('toggle-relay', (data) => {
    console.log('Control Command Received:', data);

    // Save action to Database
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
  console.log(`🚀 Server running with Database on http://localhost:${PORT}`);
});