// Smart Switch Hub Auto-Logger Test Script
const plateNumber = "NVE598"; // Yahan koi bhi plate number likhein

fetch('http://localhost:8080/api/log', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    device: 'Car-Detection-App',
    status: 'DETECTED: ' + plateNumber
  })
})
.then(res => res.json())
.then(data => console.log('✅ Status successfully sent to Smart Switch Hub:', data))
.catch(err => console.error('❌ Error sending data:', err));