#!/usr/bin/env python3
"""
Test different login scenarios for teba.s.d.center@gmail.com
"""

import requests
import json

BACKEND_URL = "https://taiba-clinic.preview.emergentagent.com/api"

def test_login(password, expected_role):
    login_data = {
        "email": "teba.s.d.center@gmail.com",
        "password": password
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            user_data = response.json()
            role = user_data.get("role", "")
            name = user_data.get("name", "")
            print(f"✅ Password '{password}' -> {name} (role: {role})")
            return True
        else:
            print(f"❌ Password '{password}' -> Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Password '{password}' -> Error: {str(e)}")
        return False

print("Testing different passwords for teba.s.d.center@gmail.com:")
print("=" * 60)

# Test different passwords
passwords_to_test = [
    ("doctor123", "doctor"),
    ("nurse123", "nurse"), 
    ("reception123", "receptionist"),
    ("admin123", "admin")
]

for password, expected_role in passwords_to_test:
    test_login(password, expected_role)