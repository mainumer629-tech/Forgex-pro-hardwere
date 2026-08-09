import requests

# Jaise hi Car ya Plate detect ho:
plate_number = "LG598"  # Wo variable jahan plate saved hai

# 🚀 Automation Request:
requests.post('http://localhost:8080/api/log', json={
    'device': 'Car-Detection-App',
    'status': f'DETECTED: {plate_number}'
})