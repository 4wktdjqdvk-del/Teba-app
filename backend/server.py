from fastapi import FastAPI, APIRouter, HTTPException, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Helper function to hash passwords
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Pydantic Models
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str

class DoctorInfo(BaseModel):
    id: str
    name: str
    specialization: str
    description: str
    image: Optional[str] = None

class AppointmentCreate(BaseModel):
    patient_id: str
    patient_name: str
    patient_email: str
    patient_phone: str
    doctor_id: str
    doctor_name: str
    date: str
    time: str
    notes: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    patient_email: str
    patient_phone: str
    doctor_id: str
    doctor_name: str
    date: str
    time: str
    notes: Optional[str] = None
    status: str
    created_at: str

class OfferCreate(BaseModel):
    title: str
    description: str
    discount: str
    valid_until: str

class OfferResponse(BaseModel):
    id: str
    title: str
    description: str
    discount: str
    valid_until: str

# Initialize default data
async def init_default_data():
    # Check if doctors already exist
    doctors_count = await db.doctors.count_documents({})
    if doctors_count == 0:
        doctors = [
            {
                "_id": "doctor_1",
                "name": "Dr. Louai Khalil",
                "specialization": "Oral Surgery & Implantation",
                "description": "Consultant in Oral Surgery and Dental Implantation",
                "image": None,
                "email": "teba.s.d.center@gmail.com",
                "password": hash_password("doctor123"),
                "role": "doctor"
            },
            {
                "_id": "doctor_2",
                "name": "Dr. Mona",
                "specialization": "Prosthodontics",
                "description": "Specialist in Crowns, Veneers, and Dentures (Mobile & Fixed)",
                "image": None,
                "email": "teba.s.d.center@gmail.com",
                "password": hash_password("doctor123"),
                "role": "doctor"
            },
            {
                "_id": "doctor_3",
                "name": "Dr. Bassem Nourdean",
                "specialization": "Orthodontics",
                "description": "Prosthodontist specializing in Orthodontic Treatments",
                "image": None,
                "email": "teba.s.d.center@gmail.com",
                "password": hash_password("doctor123"),
                "role": "doctor"
            }
        ]
        await db.doctors.insert_many(doctors)
    
    # Check if staff already exists
    staff_count = await db.users.count_documents({"role": {"$in": ["nurse", "receptionist", "admin"]}})
    if staff_count == 0:
        staff = [
            {
                "name": "Nurse 1",
                "email": "teba.s.d.center@gmail.com",
                "password": hash_password("nurse123"),
                "role": "nurse",
                "phone": None
            },
            {
                "name": "Nurse 2",
                "email": "teba.s.d.center@gmail.com",
                "password": hash_password("nurse123"),
                "role": "nurse",
                "phone": None
            },
            {
                "name": "Nurse 3",
                "email": "teba.s.d.center@gmail.com",
                "password": hash_password("nurse123"),
                "role": "nurse",
                "phone": None
            },
            {
                "name": "Receptionist",
                "email": "teba.s.d.center@gmail.com",
                "password": hash_password("reception123"),
                "role": "receptionist",
                "phone": "66868388"
            },
            {
                "name": "Admin",
                "email": "admin@tebadental.com",
                "password": hash_password("admin123"),
                "role": "admin",
                "phone": None
            }
        ]
        await db.users.insert_many(staff)

@app.on_event("startup")
async def startup_event():
    await init_default_data()

# Auth Routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user: UserRegister):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "phone": user.phone,
        "role": "patient",
        "created_at": datetime.utcnow().isoformat()
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["id"] = str(result.inserted_id)
    
    return UserResponse(
        id=user_dict["id"],
        name=user_dict["name"],
        email=user_dict["email"],
        phone=user_dict.get("phone"),
        role=user_dict["role"]
    )

@api_router.post("/auth/login", response_model=UserResponse)
async def login(credentials: UserLogin):
    # Check in users collection
    user = await db.users.find_one({"email": credentials.email})
    
    # Check in doctors collection if not found in users
    if not user:
        user = await db.doctors.find_one({"email": credentials.email})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if user["password"] != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user_id = str(user.get("_id", ""))
    
    return UserResponse(
        id=user_id,
        name=user["name"],
        email=user["email"],
        phone=user.get("phone"),
        role=user["role"]
    )

# Doctor Routes
@api_router.get("/doctors", response_model=List[DoctorInfo])
async def get_doctors():
    doctors = await db.doctors.find().to_list(100)
    return [
        DoctorInfo(
            id=str(doc["_id"]),
            name=doc["name"],
            specialization=doc["specialization"],
            description=doc["description"],
            image=doc.get("image")
        )
        for doc in doctors
    ]

# Appointment Routes
@api_router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentCreate):
    appointment_dict = appointment.dict()
    appointment_dict["status"] = "pending"
    appointment_dict["created_at"] = datetime.utcnow().isoformat()
    
    result = await db.appointments.insert_one(appointment_dict)
    appointment_dict["id"] = str(result.inserted_id)
    
    return AppointmentResponse(**appointment_dict)

@api_router.get("/appointments/patient/{patient_id}", response_model=List[AppointmentResponse])
async def get_patient_appointments(patient_id: str):
    appointments = await db.appointments.find({"patient_id": patient_id}).to_list(100)
    return [
        AppointmentResponse(
            id=str(apt["_id"]),
            patient_id=apt["patient_id"],
            patient_name=apt["patient_name"],
            patient_email=apt["patient_email"],
            patient_phone=apt["patient_phone"],
            doctor_id=apt["doctor_id"],
            doctor_name=apt["doctor_name"],
            date=apt["date"],
            time=apt["time"],
            notes=apt.get("notes"),
            status=apt["status"],
            created_at=apt["created_at"]
        )
        for apt in appointments
    ]

@api_router.get("/appointments/doctor/{doctor_id}", response_model=List[AppointmentResponse])
async def get_doctor_appointments(doctor_id: str):
    appointments = await db.appointments.find({"doctor_id": doctor_id}).to_list(100)
    return [
        AppointmentResponse(
            id=str(apt["_id"]),
            patient_id=apt["patient_id"],
            patient_name=apt["patient_name"],
            patient_email=apt["patient_email"],
            patient_phone=apt["patient_phone"],
            doctor_id=apt["doctor_id"],
            doctor_name=apt["doctor_name"],
            date=apt["date"],
            time=apt["time"],
            notes=apt.get("notes"),
            status=apt["status"],
            created_at=apt["created_at"]
        )
        for apt in appointments
    ]

@api_router.get("/appointments", response_model=List[AppointmentResponse])
async def get_all_appointments():
    appointments = await db.appointments.find().to_list(1000)
    return [
        AppointmentResponse(
            id=str(apt["_id"]),
            patient_id=apt["patient_id"],
            patient_name=apt["patient_name"],
            patient_email=apt["patient_email"],
            patient_phone=apt["patient_phone"],
            doctor_id=apt["doctor_id"],
            doctor_name=apt["doctor_name"],
            date=apt["date"],
            time=apt["time"],
            notes=apt.get("notes"),
            status=apt["status"],
            created_at=apt["created_at"]
        )
        for apt in appointments
    ]

@api_router.patch("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status: str):
    result = await db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"message": "Appointment status updated successfully"}

@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str):
    result = await db.appointments.delete_one({"_id": ObjectId(appointment_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"message": "Appointment deleted successfully"}

# Offers Routes
@api_router.get("/offers", response_model=List[OfferResponse])
async def get_offers():
    offers = await db.offers.find().to_list(100)
    return [
        OfferResponse(
            id=str(offer["_id"]),
            title=offer["title"],
            description=offer["description"],
            discount=offer["discount"],
            valid_until=offer["valid_until"]
        )
        for offer in offers
    ]

@api_router.post("/offers", response_model=OfferResponse)
async def create_offer(offer: OfferCreate):
    offer_dict = offer.dict()
    offer_dict["created_at"] = datetime.utcnow().isoformat()
    
    result = await db.offers.insert_one(offer_dict)
    offer_dict["id"] = str(result.inserted_id)
    
    return OfferResponse(**offer_dict)

@api_router.delete("/offers/{offer_id}")
async def delete_offer(offer_id: str):
    result = await db.offers.delete_one({"_id": ObjectId(offer_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    return {"message": "Offer deleted successfully"}

# Clinic Info
@api_router.get("/clinic-info")
async def get_clinic_info():
    return {
        "name": "TEBA SPECIALIZED DENTAL CENTER",
        "address": "6GM2+RRV, Abu Hamour, Doha, Qatar",
        "phone": "44163344",
        "fax": "44691699",
        "mobile": "66868388",
        "whatsapp": "66868388",
        "email": "teba.s.d.center@gmail.com",
        "instagram": "https://www.instagram.com/teba_dental_center/?__pwa=1",
        "facebook": "https://www.facebook.com/teba.dental/",
        "google_maps": "https://share.google/wTB9uO7YXo7f0Zq66",
        "description": "The best dental clinic in Doha, Qatar. Specialized in oral surgery, implantation, prosthodontics, and orthodontics."
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
