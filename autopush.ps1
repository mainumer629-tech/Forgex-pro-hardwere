<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Smart Switch Hub</title>
  <script src="/socket.io/socket.io.js"></script>
  <style>
    body {
      background-color: #1a1a1a;
      color: #ffffff;
      font-family: Arial, sans-serif;
      text-align: center;
      padding: 30px;
    }
    .card {
      background: #282828;
      border-radius: 10px;
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    }
    .status-text {
      font-size: 24px;
      font-weight: bold;
      color: #2196F3;
      margin: 20px 0;
    }
    .btn {
      padding: 12px 25px;
      font-size: 16px;
      font-weight: bold;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin: 5px;
    }
    .btn-on { background-color: #2e7d32; color: white; }
    .btn-off { background-color: #c62828; color: white; }
    .btn:hover { opacity: 0.8; }
    table {
      width: 100%;
      margin-top: 20px;
      border-collapse: collapse;
    }
    th, td {
      padding: 10px;
      border-bottom: 1px solid #444;
    }
    th { color: #2196F3; }
    .status-green { color: #4CAF50; font-weight: bold; }
  </style>
</head>
<body>

  <div class="card">
    <h2>🎛️ Smart Switch Hub</h2>
    <div class="status-text">Status: <span id="currentStatus">Loading...</span></div>

    <button class="btn btn-on" onclick="sendSwitchCommand('ON')">Turn ON</button>
    <button class="btn btn-off" onclick="sendSwitchCommand('OFF')">Turn OFF</button>

    <h3>📜 History Log (SQLite Records)</h3>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Device</th>
          <th>Status</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody id="logsTable">
        </tbody>
    </table>
  </div>

  <script>
    const socket = io();

    // 1. Load initial logs from Server
    function loadLogs() {
      fetch('/api/logs')
        .then(res => res.json())
        .then(data => {
          const tbody = document.getElementById('logsTable');
          tbody.innerHTML = '';
          
          if (data.length > 0) {
            document.getElementById('currentStatus').innerText = data[0].status;
            data.forEach(log => addLogRow(log));
          } else {
            document.getElementById('currentStatus').innerText = 'OFF';
          }
        });
    }

    // 2. Add row to HTML Table
    function addLogRow(log) {
      const tbody = document.getElementById('logsTable');
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${log.id || '-'}</td>
        <td>${log.device || '-'}</td>
        <td class="status-green">${log.status || '-'}</td>
        <td>${log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
      `;
      tbody.insertBefore(row, tbody.firstChild);
    }

    // 3. Send Button Click to Backend Server
    function sendSwitchCommand(status) {
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device: 'Relay1',
          status: status
        })
      });
    }

    // 4. Real-time updates via Socket.IO
    socket.on('hardware-status', (data) => {
      if (data.status) {
        document.getElementById('currentStatus').innerText = data.status;
      }
      if (data.id) {
        addLogRow(data);
      }
    });

    // Run on page load
    loadLogs();
  </script>

</body>
</html>