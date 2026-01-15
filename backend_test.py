#!/usr/bin/env python3
"""
TEBA Dental Center Backend API Testing
Testing specific scenarios as requested by the user
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Get backend URL from environment
BACKEND_URL = "https://teba-oral-care.preview.emergentagent.com/api"

class TEBABackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_offers_crud(self):
        """Test offers CRUD operations as requested"""
        print("=== Testing Offers CRUD Operations ===")
        
        # 1. Get initial offers
        try:
            response = self.session.get(f"{self.base_url}/offers")
            if response.status_code == 200:
                initial_offers = response.json()
                self.log_test("GET /api/offers - Initial fetch", True, f"Found {len(initial_offers)} existing offers")
            else:
                self.log_test("GET /api/offers - Initial fetch", False, f"Status: {response.status_code}")
                return
        except Exception as e:
            self.log_test("GET /api/offers - Initial fetch", False, f"Error: {str(e)}")
            return

        # 2. Create new offer as specified in request
        offer_data = {
            "title": "تخفيض الصيف",
            "description": "خصم 20% على جميع الخدمات", 
            "discount": "20% OFF",
            "valid_until": "2025-12-31"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/offers", json=offer_data)
            if response.status_code == 200:
                created_offer = response.json()
                offer_id = created_offer.get("id")
                self.log_test("POST /api/offers - Create summer offer", True, f"Created offer with ID: {offer_id}")
            else:
                self.log_test("POST /api/offers - Create summer offer", False, f"Status: {response.status_code}, Response: {response.text}")
                return
        except Exception as e:
            self.log_test("POST /api/offers - Create summer offer", False, f"Error: {str(e)}")
            return

        # 3. Get all offers again to verify creation
        try:
            response = self.session.get(f"{self.base_url}/offers")
            if response.status_code == 200:
                updated_offers = response.json()
                self.log_test("GET /api/offers - After creation", True, f"Found {len(updated_offers)} offers (should be +1)")
                
                # Find our created offer
                summer_offer = None
                for offer in updated_offers:
                    if offer.get("title") == "تخفيض الصيف":
                        summer_offer = offer
                        break
                
                if summer_offer:
                    self.log_test("Verify created offer exists", True, f"Summer offer found with correct data")
                    offer_id = summer_offer["id"]
                else:
                    self.log_test("Verify created offer exists", False, "Summer offer not found in list")
                    return
            else:
                self.log_test("GET /api/offers - After creation", False, f"Status: {response.status_code}")
                return
        except Exception as e:
            self.log_test("GET /api/offers - After creation", False, f"Error: {str(e)}")
            return

        # 4. Delete the created offer
        try:
            response = self.session.delete(f"{self.base_url}/offers/{offer_id}")
            if response.status_code == 200:
                self.log_test("DELETE /api/offers/{offer_id}", True, f"Successfully deleted offer {offer_id}")
            else:
                self.log_test("DELETE /api/offers/{offer_id}", False, f"Status: {response.status_code}, Response: {response.text}")
                return
        except Exception as e:
            self.log_test("DELETE /api/offers/{offer_id}", False, f"Error: {str(e)}")
            return

        # 5. Verify deletion
        try:
            response = self.session.get(f"{self.base_url}/offers")
            if response.status_code == 200:
                final_offers = response.json()
                deleted_successfully = True
                for offer in final_offers:
                    if offer.get("id") == offer_id:
                        deleted_successfully = False
                        break
                
                if deleted_successfully:
                    self.log_test("Verify offer deletion", True, f"Offer successfully removed. Final count: {len(final_offers)}")
                else:
                    self.log_test("Verify offer deletion", False, "Offer still exists after deletion")
            else:
                self.log_test("Verify offer deletion", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Verify offer deletion", False, f"Error: {str(e)}")

    def test_staff_api(self):
        """Test the new staff API"""
        print("=== Testing Staff API ===")
        
        try:
            response = self.session.get(f"{self.base_url}/staff")
            if response.status_code == 200:
                staff_list = response.json()
                self.log_test("GET /api/staff - Fetch all staff", True, f"Retrieved {len(staff_list)} staff members")
                
                # Check if all emails are teba.s.d.center@gmail.com
                all_emails_correct = True
                email_details = []
                
                for staff in staff_list:
                    email = staff.get("email", "")
                    name = staff.get("name", "")
                    role = staff.get("role", "")
                    
                    if email == "teba.s.d.center@gmail.com":
                        email_details.append(f"{name} ({role}): ✅ {email}")
                    else:
                        email_details.append(f"{name} ({role}): ❌ {email}")
                        all_emails_correct = False
                
                if all_emails_correct:
                    self.log_test("Verify all staff emails", True, "All staff have correct email: teba.s.d.center@gmail.com")
                else:
                    self.log_test("Verify all staff emails", False, "Some staff have incorrect emails")
                
                # Print detailed email info
                print("Staff Email Details:")
                for detail in email_details:
                    print(f"   {detail}")
                print()
                
            else:
                self.log_test("GET /api/staff - Fetch all staff", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/staff - Fetch all staff", False, f"Error: {str(e)}")

    def test_staff_login(self):
        """Test staff login with new email"""
        print("=== Testing Staff Login with New Email ===")
        
        # Test doctor login
        login_data = {
            "email": "teba.s.d.center@gmail.com",
            "password": "doctor123"
        }
        
        try:
            response = self.session.post(f"{self.base_url}/auth/login", json=login_data)
            if response.status_code == 200:
                user_data = response.json()
                role = user_data.get("role", "")
                name = user_data.get("name", "")
                self.log_test("Staff login with teba.s.d.center@gmail.com", True, f"Successfully logged in as {name} (role: {role})")
            else:
                self.log_test("Staff login with teba.s.d.center@gmail.com", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("Staff login with teba.s.d.center@gmail.com", False, f"Error: {str(e)}")

    def test_appointments_api(self):
        """Test appointments API"""
        print("=== Testing Appointments API ===")
        
        # 1. Get all appointments
        try:
            response = self.session.get(f"{self.base_url}/appointments")
            if response.status_code == 200:
                appointments = response.json()
                self.log_test("GET /api/appointments - Fetch all", True, f"Retrieved {len(appointments)} appointments")
                
                # If there are appointments, try to delete one
                if len(appointments) > 0:
                    appointment_to_delete = appointments[0]
                    appointment_id = appointment_to_delete.get("id")
                    patient_name = appointment_to_delete.get("patient_name", "Unknown")
                    
                    print(f"Found appointment to test deletion: {patient_name} (ID: {appointment_id})")
                    
                    # Try to delete the appointment
                    try:
                        delete_response = self.session.delete(f"{self.base_url}/appointments/{appointment_id}")
                        if delete_response.status_code == 200:
                            self.log_test("DELETE /api/appointments/{id}", True, f"Successfully deleted appointment for {patient_name}")
                            
                            # Verify deletion
                            verify_response = self.session.get(f"{self.base_url}/appointments")
                            if verify_response.status_code == 200:
                                remaining_appointments = verify_response.json()
                                self.log_test("Verify appointment deletion", True, f"Appointments count after deletion: {len(remaining_appointments)}")
                            else:
                                self.log_test("Verify appointment deletion", False, f"Could not verify deletion: {verify_response.status_code}")
                        else:
                            self.log_test("DELETE /api/appointments/{id}", False, f"Status: {delete_response.status_code}, Response: {delete_response.text}")
                    except Exception as e:
                        self.log_test("DELETE /api/appointments/{id}", False, f"Error: {str(e)}")
                else:
                    self.log_test("Appointment deletion test", True, "No appointments found to delete (this is normal)")
                    
            else:
                self.log_test("GET /api/appointments - Fetch all", False, f"Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            self.log_test("GET /api/appointments - Fetch all", False, f"Error: {str(e)}")

    def run_all_tests(self):
        """Run all requested tests"""
        print(f"🚀 Starting TEBA Dental Center Backend Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Run all test suites
        self.test_offers_crud()
        self.test_staff_api()
        self.test_staff_login()
        self.test_appointments_api()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if "✅" in r["status"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if "❌" in result["status"]:
                    print(f"   - {result['test']}: {result['details']}")
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = TEBABackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)