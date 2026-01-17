#!/usr/bin/env python3
"""
TEBA Dental Center - Admin Features Testing
Testing specific admin functionality as requested:
1. Offers CRUD Operations
2. Appointments Status Updates
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"❌ Error reading backend URL: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("❌ Could not determine backend URL")
    sys.exit(1)

API_URL = f"{BASE_URL}/api"
print(f"🔗 Testing against: {API_URL}")

def test_offers_crud():
    """Test Offers CRUD Operations"""
    print("\n" + "="*50)
    print("🎯 TESTING OFFERS CRUD OPERATIONS")
    print("="*50)
    
    # Test 1: GET /api/offers - Should return current offers
    print("\n1️⃣ Testing GET /api/offers...")
    try:
        response = requests.get(f"{API_URL}/offers", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            offers = response.json()
            print(f"   ✅ GET offers successful - Found {len(offers)} offers")
            initial_count = len(offers)
        else:
            print(f"   ❌ GET offers failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ GET offers error: {e}")
        return False
    
    # Test 2: POST /api/offers - Create a test offer
    print("\n2️⃣ Testing POST /api/offers...")
    test_offer = {
        "title": "Admin Test Offer - Teeth Cleaning Special",
        "description": "Professional teeth cleaning with 30% discount for new patients",
        "discount": "30%",
        "valid_until": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
    }
    
    try:
        response = requests.post(
            f"{API_URL}/offers", 
            json=test_offer,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            created_offer = response.json()
            offer_id = created_offer.get("id")
            print(f"   ✅ POST offer successful - Created offer ID: {offer_id}")
            print(f"   📋 Offer title: {created_offer.get('title')}")
        else:
            print(f"   ❌ POST offer failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ POST offer error: {e}")
        return False
    
    # Test 3: GET /api/offers again - Verify offer was created
    print("\n3️⃣ Testing GET /api/offers (verify creation)...")
    try:
        response = requests.get(f"{API_URL}/offers", timeout=10)
        if response.status_code == 200:
            offers = response.json()
            new_count = len(offers)
            print(f"   ✅ GET offers successful - Now {new_count} offers (was {initial_count})")
            if new_count > initial_count:
                print(f"   ✅ Offer creation verified")
            else:
                print(f"   ⚠️  Offer count didn't increase")
        else:
            print(f"   ❌ GET offers verification failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ GET offers verification error: {e}")
        return False
    
    # Test 4: DELETE /api/offers/{offer_id} - Delete the test offer
    print(f"\n4️⃣ Testing DELETE /api/offers/{offer_id}...")
    try:
        response = requests.delete(f"{API_URL}/offers/{offer_id}", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✅ DELETE offer successful")
        else:
            print(f"   ❌ DELETE offer failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ DELETE offer error: {e}")
        return False
    
    # Test 5: GET /api/offers final - Verify deletion
    print("\n5️⃣ Testing GET /api/offers (verify deletion)...")
    try:
        response = requests.get(f"{API_URL}/offers", timeout=10)
        if response.status_code == 200:
            offers = response.json()
            final_count = len(offers)
            print(f"   ✅ GET offers successful - Back to {final_count} offers")
            if final_count == initial_count:
                print(f"   ✅ Offer deletion verified")
            else:
                print(f"   ⚠️  Offer count mismatch after deletion")
        else:
            print(f"   ❌ GET offers final verification failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ GET offers final verification error: {e}")
        return False
    
    print("\n🎉 OFFERS CRUD OPERATIONS - ALL TESTS PASSED")
    return True

def test_appointments_admin():
    """Test Appointments Admin Operations"""
    print("\n" + "="*50)
    print("🎯 TESTING APPOINTMENTS ADMIN OPERATIONS")
    print("="*50)
    
    # First, create a test appointment to work with
    print("\n0️⃣ Creating test appointment for admin operations...")
    test_appointment = {
        "patient_id": "test_patient_admin",
        "patient_name": "Admin Test Patient",
        "patient_email": "admin.test@example.com",
        "patient_phone": "+974-5555-0123",
        "doctor_id": "doctor_1",
        "doctor_name": "Dr. Louai Khalil",
        "date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "time": "14:00",
        "notes": "Admin test appointment for status updates"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/appointments",
            json=test_appointment,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        if response.status_code == 200:
            created_appointment = response.json()
            appointment_id = created_appointment.get("id")
            print(f"   ✅ Test appointment created - ID: {appointment_id}")
        else:
            print(f"   ❌ Failed to create test appointment: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Error creating test appointment: {e}")
        return False
    
    # Test 1: GET /api/appointments - Should return all appointments
    print("\n1️⃣ Testing GET /api/appointments...")
    try:
        response = requests.get(f"{API_URL}/appointments", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            appointments = response.json()
            print(f"   ✅ GET appointments successful - Found {len(appointments)} appointments")
            
            # Verify our test appointment is in the list
            test_found = any(apt.get("id") == appointment_id for apt in appointments)
            if test_found:
                print(f"   ✅ Test appointment found in list")
            else:
                print(f"   ⚠️  Test appointment not found in list")
        else:
            print(f"   ❌ GET appointments failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ GET appointments error: {e}")
        return False
    
    # Test 2: PATCH /api/appointments/{appointment_id}/status?status=completed
    print(f"\n2️⃣ Testing PATCH /api/appointments/{appointment_id}/status...")
    try:
        response = requests.patch(
            f"{API_URL}/appointments/{appointment_id}/status?status=completed",
            timeout=10
        )
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ PATCH appointment status successful")
            print(f"   📋 Message: {result.get('message')}")
        else:
            print(f"   ❌ PATCH appointment status failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ PATCH appointment status error: {e}")
        return False
    
    # Test 3: Verify status update by getting appointments again
    print("\n3️⃣ Testing status update verification...")
    try:
        response = requests.get(f"{API_URL}/appointments", timeout=10)
        if response.status_code == 200:
            appointments = response.json()
            test_appointment = next((apt for apt in appointments if apt.get("id") == appointment_id), None)
            if test_appointment and test_appointment.get("status") == "completed":
                print(f"   ✅ Status update verified - Appointment status is 'completed'")
            else:
                print(f"   ❌ Status update not verified - Status: {test_appointment.get('status') if test_appointment else 'Not found'}")
                return False
        else:
            print(f"   ❌ Status verification failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Status verification error: {e}")
        return False
    
    # Test 4: DELETE /api/appointments/{appointment_id}
    print(f"\n4️⃣ Testing DELETE /api/appointments/{appointment_id}...")
    try:
        response = requests.delete(f"{API_URL}/appointments/{appointment_id}", timeout=10)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ DELETE appointment successful")
            print(f"   📋 Message: {result.get('message')}")
        else:
            print(f"   ❌ DELETE appointment failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ DELETE appointment error: {e}")
        return False
    
    # Test 5: Verify deletion
    print("\n5️⃣ Testing deletion verification...")
    try:
        response = requests.get(f"{API_URL}/appointments", timeout=10)
        if response.status_code == 200:
            appointments = response.json()
            test_found = any(apt.get("id") == appointment_id for apt in appointments)
            if not test_found:
                print(f"   ✅ Deletion verified - Appointment no longer in list")
            else:
                print(f"   ❌ Deletion not verified - Appointment still exists")
                return False
        else:
            print(f"   ❌ Deletion verification failed: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Deletion verification error: {e}")
        return False
    
    print("\n🎉 APPOINTMENTS ADMIN OPERATIONS - ALL TESTS PASSED")
    return True

def main():
    """Run all admin feature tests"""
    print("🏥 TEBA Dental Center - Admin Features Testing")
    print("=" * 60)
    
    results = []
    
    # Test Offers CRUD
    offers_result = test_offers_crud()
    results.append(("Offers CRUD Operations", offers_result))
    
    # Test Appointments Admin Operations
    appointments_result = test_appointments_admin()
    results.append(("Appointments Admin Operations", appointments_result))
    
    # Summary
    print("\n" + "="*60)
    print("📊 ADMIN FEATURES TESTING SUMMARY")
    print("="*60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall Result: {passed}/{total} test suites passed")
    
    if passed == total:
        print("🎉 ALL ADMIN FEATURES WORKING CORRECTLY!")
        return True
    else:
        print("⚠️  SOME ADMIN FEATURES HAVE ISSUES")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)