#!/usr/bin/env python3
"""
TEBA Dental Center Backend API Test Suite
Tests all backend endpoints systematically
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Backend URL from frontend .env
BASE_URL = "https://teba-oral-care.preview.emergentagent.com/api"

class TEBADentalTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.patient_id = None
        self.appointment_id = None
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_auth_register_valid(self):
        """Test patient registration with valid data"""
        try:
            payload = {
                "name": "John Smith",
                "email": "johnsmith@example.com",
                "password": "test123",
                "phone": "12345678"
            }
            
            response = self.session.post(f"{self.base_url}/auth/register", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                self.patient_id = data.get("id")
                self.log_test("Patient Registration", True, f"Successfully registered patient: {data.get('name')}")
                return True
            else:
                self.log_test("Patient Registration", False, f"Registration failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Patient Registration", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_auth_register_duplicate(self):
        """Test duplicate email registration (should fail)"""
        try:
            payload = {
                "name": "John Smith Duplicate",
                "email": "johnsmith@example.com",  # Same email as previous test
                "password": "test123",
                "phone": "87654321"
            }
            
            response = self.session.post(f"{self.base_url}/auth/register", json=payload)
            
            if response.status_code == 400:
                self.log_test("Duplicate Email Registration", True, "Correctly rejected duplicate email registration")
                return True
            else:
                self.log_test("Duplicate Email Registration", False, f"Should have failed but got status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Duplicate Email Registration", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_auth_login_patient(self):
        """Test login with registered patient credentials"""
        try:
            payload = {
                "email": "johnsmith@example.com",
                "password": "test123"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("role") == "patient":
                    self.log_test("Patient Login", True, f"Successfully logged in patient: {data.get('name')}")
                    return True
                else:
                    self.log_test("Patient Login", False, f"Wrong role returned: {data.get('role')}")
                    return False
            else:
                self.log_test("Patient Login", False, f"Login failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Patient Login", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_auth_login_doctor(self):
        """Test login with doctor credentials"""
        try:
            payload = {
                "email": "louai@tebadental.com",
                "password": "doctor123"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("role") == "doctor":
                    self.log_test("Doctor Login", True, f"Successfully logged in doctor: {data.get('name')}")
                    return True
                else:
                    self.log_test("Doctor Login", False, f"Wrong role returned: {data.get('role')}")
                    return False
            else:
                self.log_test("Doctor Login", False, f"Login failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Doctor Login", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_auth_login_receptionist(self):
        """Test login with receptionist credentials"""
        try:
            payload = {
                "email": "reception@tebadental.com",
                "password": "reception123"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("role") == "receptionist":
                    self.log_test("Receptionist Login", True, f"Successfully logged in receptionist: {data.get('name')}")
                    return True
                else:
                    self.log_test("Receptionist Login", False, f"Wrong role returned: {data.get('role')}")
                    return False
            else:
                self.log_test("Receptionist Login", False, f"Login failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Receptionist Login", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_auth_login_admin(self):
        """Test login with admin credentials"""
        try:
            payload = {
                "email": "admin@tebadental.com",
                "password": "admin123"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("role") == "admin":
                    self.log_test("Admin Login", True, f"Successfully logged in admin: {data.get('name')}")
                    return True
                else:
                    self.log_test("Admin Login", False, f"Wrong role returned: {data.get('role')}")
                    return False
            else:
                self.log_test("Admin Login", False, f"Login failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Admin Login", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_auth_login_invalid(self):
        """Test login with invalid credentials (should fail)"""
        try:
            payload = {
                "email": "invalid@example.com",
                "password": "wrongpassword"
            }
            
            response = self.session.post(f"{self.base_url}/auth/login", json=payload)
            
            if response.status_code == 401:
                self.log_test("Invalid Login", True, "Correctly rejected invalid credentials")
                return True
            else:
                self.log_test("Invalid Login", False, f"Should have failed but got status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Invalid Login", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_doctors_api(self):
        """Test GET /api/doctors - should return 3 doctors"""
        try:
            response = self.session.get(f"{self.base_url}/doctors")
            
            if response.status_code == 200:
                doctors = response.json()
                if len(doctors) == 3:
                    expected_names = ["Dr. Louai Khalil", "Dr. Mona", "Dr. Bassem Nourdean"]
                    actual_names = [doc.get("name") for doc in doctors]
                    
                    if all(name in actual_names for name in expected_names):
                        # Check if each doctor has required fields
                        all_valid = True
                        for doc in doctors:
                            if not all(field in doc for field in ["id", "name", "specialization", "description"]):
                                all_valid = False
                                break
                        
                        if all_valid:
                            self.log_test("Doctors API", True, f"Successfully retrieved {len(doctors)} doctors with all required fields")
                            return True
                        else:
                            self.log_test("Doctors API", False, "Some doctors missing required fields")
                            return False
                    else:
                        self.log_test("Doctors API", False, f"Expected doctors not found. Got: {actual_names}")
                        return False
                else:
                    self.log_test("Doctors API", False, f"Expected 3 doctors, got {len(doctors)}")
                    return False
            else:
                self.log_test("Doctors API", False, f"Request failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Doctors API", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_create_appointment(self):
        """Create appointment for patient with doctor_1"""
        try:
            if not self.patient_id:
                self.log_test("Create Appointment", False, "No patient ID available from registration")
                return False
            
            payload = {
                "patient_id": self.patient_id,
                "patient_name": "John Smith",
                "patient_email": "johnsmith@example.com",
                "patient_phone": "12345678",
                "doctor_id": "doctor_1",
                "doctor_name": "Dr. Louai Khalil",
                "date": "2025-02-15",
                "time": "10:00 AM",
                "notes": "Regular checkup"
            }
            
            response = self.session.post(f"{self.base_url}/appointments", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                self.appointment_id = data.get("id")
                if data.get("status") == "pending":
                    self.log_test("Create Appointment", True, f"Successfully created appointment with ID: {self.appointment_id}")
                    return True
                else:
                    self.log_test("Create Appointment", False, f"Unexpected status: {data.get('status')}")
                    return False
            else:
                self.log_test("Create Appointment", False, f"Request failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create Appointment", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_get_patient_appointments(self):
        """GET appointments by patient ID"""
        try:
            if not self.patient_id:
                self.log_test("Get Patient Appointments", False, "No patient ID available")
                return False
            
            response = self.session.get(f"{self.base_url}/appointments/patient/{self.patient_id}")
            
            if response.status_code == 200:
                appointments = response.json()
                if len(appointments) > 0:
                    self.log_test("Get Patient Appointments", True, f"Successfully retrieved {len(appointments)} appointments for patient")
                    return True
                else:
                    self.log_test("Get Patient Appointments", False, "No appointments found for patient")
                    return False
            else:
                self.log_test("Get Patient Appointments", False, f"Request failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Patient Appointments", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_get_doctor_appointments(self):
        """GET appointments by doctor ID"""
        try:
            response = self.session.get(f"{self.base_url}/appointments/doctor/doctor_1")
            
            if response.status_code == 200:
                appointments = response.json()
                self.log_test("Get Doctor Appointments", True, f"Successfully retrieved {len(appointments)} appointments for doctor")
                return True
            else:
                self.log_test("Get Doctor Appointments", False, f"Request failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Doctor Appointments", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_get_all_appointments(self):
        """GET all appointments (for admin/receptionist)"""
        try:
            response = self.session.get(f"{self.base_url}/appointments")
            
            if response.status_code == 200:
                appointments = response.json()
                self.log_test("Get All Appointments", True, f"Successfully retrieved {len(appointments)} total appointments")
                return True
            else:
                self.log_test("Get All Appointments", False, f"Request failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get All Appointments", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_update_appointment_status(self):
        """Update appointment status from 'pending' to 'confirmed'"""
        try:
            if not self.appointment_id:
                self.log_test("Update Appointment Status", False, "No appointment ID available")
                return False
            
            # Update to confirmed
            response = self.session.patch(f"{self.base_url}/appointments/{self.appointment_id}/status?status=confirmed")
            
            if response.status_code == 200:
                # Update to completed
                response2 = self.session.patch(f"{self.base_url}/appointments/{self.appointment_id}/status?status=completed")
                
                if response2.status_code == 200:
                    self.log_test("Update Appointment Status", True, "Successfully updated appointment status: pending -> confirmed -> completed")
                    return True
                else:
                    self.log_test("Update Appointment Status", False, f"Failed to update to completed: {response2.status_code}", response2.text)
                    return False
            else:
                self.log_test("Update Appointment Status", False, f"Failed to update to confirmed: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Update Appointment Status", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_clinic_info(self):
        """Test GET /api/clinic-info"""
        try:
            response = self.session.get(f"{self.base_url}/clinic-info")
            
            if response.status_code == 200:
                info = response.json()
                required_fields = ["name", "address", "phone", "email"]
                
                if all(field in info for field in required_fields):
                    if "TEBA" in info.get("name", ""):
                        self.log_test("Clinic Info API", True, f"Successfully retrieved clinic info for: {info.get('name')}")
                        return True
                    else:
                        self.log_test("Clinic Info API", False, f"Unexpected clinic name: {info.get('name')}")
                        return False
                else:
                    self.log_test("Clinic Info API", False, "Missing required fields in clinic info")
                    return False
            else:
                self.log_test("Clinic Info API", False, f"Request failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Clinic Info API", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_offers_empty(self):
        """Test GET /api/offers - initially empty"""
        try:
            response = self.session.get(f"{self.base_url}/offers")
            
            if response.status_code == 200:
                offers = response.json()
                self.log_test("Get Offers (Empty)", True, f"Successfully retrieved offers list (count: {len(offers)})")
                return True
            else:
                self.log_test("Get Offers (Empty)", False, f"Request failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Offers (Empty)", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_create_offer(self):
        """Test POST create new offer"""
        try:
            payload = {
                "title": "New Patient Special",
                "description": "50% off first consultation for new patients",
                "discount": "50%",
                "valid_until": "2025-12-31"
            }
            
            response = self.session.post(f"{self.base_url}/offers", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("title") == payload["title"]:
                    self.log_test("Create Offer", True, f"Successfully created offer: {data.get('title')}")
                    return True
                else:
                    self.log_test("Create Offer", False, "Offer data mismatch")
                    return False
            else:
                self.log_test("Create Offer", False, f"Request failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Create Offer", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_offers_with_data(self):
        """Test GET /api/offers - should return created offer"""
        try:
            response = self.session.get(f"{self.base_url}/offers")
            
            if response.status_code == 200:
                offers = response.json()
                if len(offers) > 0:
                    self.log_test("Get Offers (With Data)", True, f"Successfully retrieved {len(offers)} offers")
                    return True
                else:
                    self.log_test("Get Offers (With Data)", False, "No offers found after creation")
                    return False
            else:
                self.log_test("Get Offers (With Data)", False, f"Request failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Get Offers (With Data)", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_delete_appointment(self):
        """Test DELETE appointment"""
        try:
            if not self.appointment_id:
                self.log_test("Delete Appointment", False, "No appointment ID available")
                return False
            
            response = self.session.delete(f"{self.base_url}/appointments/{self.appointment_id}")
            
            if response.status_code == 200:
                self.log_test("Delete Appointment", True, "Successfully deleted appointment")
                return True
            else:
                self.log_test("Delete Appointment", False, f"Request failed with status {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Delete Appointment", False, f"Exception occurred: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print(f"\n🏥 TEBA Dental Center Backend API Test Suite")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Authentication Tests
        print("\n📋 AUTHENTICATION TESTS")
        self.test_auth_register_valid()
        self.test_auth_register_duplicate()
        self.test_auth_login_patient()
        self.test_auth_login_doctor()
        self.test_auth_login_receptionist()
        self.test_auth_login_admin()
        self.test_auth_login_invalid()
        
        # Doctors API Tests
        print("\n👨‍⚕️ DOCTORS API TESTS")
        self.test_doctors_api()
        
        # Appointments API Tests
        print("\n📅 APPOINTMENTS API TESTS")
        self.test_create_appointment()
        self.test_get_patient_appointments()
        self.test_get_doctor_appointments()
        self.test_get_all_appointments()
        self.test_update_appointment_status()
        
        # Clinic Info Tests
        print("\n🏥 CLINIC INFO TESTS")
        self.test_clinic_info()
        
        # Offers API Tests
        print("\n🎁 OFFERS API TESTS")
        self.test_offers_empty()
        self.test_create_offer()
        self.test_offers_with_data()
        
        # Cleanup Tests
        print("\n🗑️ CLEANUP TESTS")
        self.test_delete_appointment()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['message']}")
        
        return passed, failed

if __name__ == "__main__":
    tester = TEBADentalTester()
    passed, failed = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)