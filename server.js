const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database Setup
const db = new sqlite3.Database('./hardware_history.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to SQLite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device TEXT,
  status TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// API Endpoints
app.get('/api/logs', (req, res) => {
  db.all('SELECT * FROM logs ORDER BY id DESC LIMIT 20', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/log', (req, res) => {
  const { device, status } = req.body;
  db.run('INSERT INTO logs (device, status) VALUES (?, ?)', [device, status], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    const logEntry = { id: this.lastID, device, status, timestamp: new Date() };
    io.emit('hardware-status', logEntry);
    res.json({ message: 'Success', log: logEntry });
  });
});

// 🗑️ Delete All History Logs API
app.delete('/api/clear-history', (req, res) => {
  db.run('DELETE FROM logs', [], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    io.emit('hardware-status', { status: 'OFF' });
    res.json({ message: 'All history logs cleared successfully!' });
  });
});

server.listen(8080, () => {
  console.log('Server running on http://localhost:8080');
});