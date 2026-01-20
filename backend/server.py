from fastapi import FastAPI, APIRouter, HTTPException, status, BackgroundTasks
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
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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

# Push Notification Models
class PushTokenCreate(BaseModel):
    token: str
    user_id: str
    user_role: str
    platform: str

class PushNotificationSend(BaseModel):
    title: str
    body: str
    data: Optional[dict] = None
    target_role: Optional[str] = None  # admin, doctor, patient, all
    target_user_id: Optional[str] = None

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
    # Exclude password field for security with proper limit
    doctors = await db.doctors.find({}, {'password': 0}).limit(100).to_list(100)
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

# Email Configuration
SMTP_EMAIL = os.environ.get('SMTP_EMAIL', 'teba.s.d.center@gmail.com')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')

# Helper function to send email notification
def send_email_sync(to_email: str, subject: str, html_body: str):
    """Send email using Gmail SMTP (synchronous)"""
    try:
        if not SMTP_PASSWORD:
            logger.warning("⚠️ SMTP_PASSWORD not configured, skipping email")
            return False
            
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = SMTP_EMAIL
        msg['To'] = to_email
        msg.attach(MIMEText(html_body, 'html'))
        
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"✅ Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error sending email: {e}")
        return False

async def send_appointment_email(appointment_data: dict, email_type: str = "new"):
    """Send email notification about appointment"""
    try:
        clinic_email = "teba.s.d.center@gmail.com"
        patient_email = appointment_data.get('patient_email', '')
        
        if email_type == "new":
            # Email to clinic about new appointment
            subject = f"🦷 حجز موعد جديد - {appointment_data['patient_name']}"
            body = f"""
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px; direction: rtl; text-align: right;">
                    <h2 style="color: #0891B2;">📅 طلب حجز موعد جديد</h2>
                    
                    <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #0891B2;">
                        <h3>👤 معلومات المريض:</h3>
                        <p><strong>الاسم:</strong> {appointment_data['patient_name']}</p>
                        <p><strong>البريد:</strong> {appointment_data['patient_email']}</p>
                        <p><strong>الهاتف:</strong> {appointment_data['patient_phone']}</p>
                    </div>
                    
                    <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #10B981;">
                        <h3>🏥 تفاصيل الموعد:</h3>
                        <p><strong>الطبيب:</strong> {appointment_data['doctor_name']}</p>
                        <p><strong>التاريخ:</strong> {appointment_data['date']}</p>
                        <p><strong>الوقت:</strong> {appointment_data['time']}</p>
                        {f"<p><strong>ملاحظات:</strong> {appointment_data['notes']}</p>" if appointment_data.get('notes') else ""}
                    </div>
                    
                    <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
                        تم إرسال هذا البريد تلقائياً من نظام حجز مواعيد مجمع طيبة التخصصي للأسنان
                    </p>
                </body>
            </html>
            """
            send_email_sync(clinic_email, subject, body)
            
            # Also send confirmation to patient
            if patient_email:
                patient_subject = "✅ تم استلام طلب حجزك - مجمع طيبة للأسنان"
                patient_body = f"""
                <html>
                    <body style="font-family: Arial, sans-serif; padding: 20px; direction: rtl; text-align: right;">
                        <h2 style="color: #0891B2;">مرحباً {appointment_data['patient_name']} 👋</h2>
                        
                        <p style="font-size: 16px;">تم استلام طلب حجزك بنجاح وسيتم التواصل معك قريباً للتأكيد.</p>
                        
                        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #0891B2;">
                            <h3>📋 تفاصيل الموعد:</h3>
                            <p><strong>الطبيب:</strong> {appointment_data['doctor_name']}</p>
                            <p><strong>التاريخ:</strong> {appointment_data['date']}</p>
                            <p><strong>الوقت:</strong> {appointment_data['time']}</p>
                            <p><strong>الحالة:</strong> <span style="color: #F59E0B;">⏳ قيد الانتظار</span></p>
                        </div>
                        
                        <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p>📞 للاستفسار: <strong>44163344</strong></p>
                            <p>📱 واتساب: <strong>66868388</strong></p>
                        </div>
                        
                        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
                            مجمع طيبة التخصصي للأسنان - رضاكم هدفنا وابتسامتكم أولويتنا 😊
                        </p>
                    </body>
                </html>
                """
                send_email_sync(patient_email, patient_subject, patient_body)
                
        elif email_type == "confirmed":
            # Email to patient when appointment is confirmed
            if patient_email:
                subject = "✅ تم تأكيد موعدك - مجمع طيبة للأسنان"
                body = f"""
                <html>
                    <body style="font-family: Arial, sans-serif; padding: 20px; direction: rtl; text-align: right;">
                        <h2 style="color: #10B981;">🎉 تم تأكيد موعدك!</h2>
                        
                        <p style="font-size: 16px;">مرحباً {appointment_data['patient_name']}،</p>
                        <p>يسعدنا إبلاغك بأنه تم تأكيد موعدك.</p>
                        
                        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #10B981;">
                            <h3>📋 تفاصيل الموعد المؤكد:</h3>
                            <p><strong>الطبيب:</strong> {appointment_data['doctor_name']}</p>
                            <p><strong>التاريخ:</strong> {appointment_data['date']}</p>
                            <p><strong>الوقت:</strong> {appointment_data['time']}</p>
                            <p><strong>الحالة:</strong> <span style="color: #10B981;">✅ مؤكد</span></p>
                        </div>
                        
                        <div style="background-color: #DBEAFE; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p>📍 <strong>العنوان:</strong> أبو هامور، الدوحة، قطر</p>
                            <p>⏰ يرجى الحضور قبل الموعد بـ 10 دقائق</p>
                        </div>
                        
                        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
                            مجمع طيبة التخصصي للأسنان - نتطلع لرؤيتك! 😊
                        </p>
                    </body>
                </html>
                """
                send_email_sync(patient_email, subject, body)
                
        elif email_type == "cancelled":
            # Email to patient when appointment is cancelled
            if patient_email:
                subject = "❌ تم إلغاء موعدك - مجمع طيبة للأسنان"
                body = f"""
                <html>
                    <body style="font-family: Arial, sans-serif; padding: 20px; direction: rtl; text-align: right;">
                        <h2 style="color: #EF4444;">تم إلغاء الموعد</h2>
                        
                        <p style="font-size: 16px;">مرحباً {appointment_data['patient_name']}،</p>
                        <p>نأسف لإبلاغك بأنه تم إلغاء موعدك.</p>
                        
                        <div style="background-color: #FEF2F2; padding: 15px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #EF4444;">
                            <h3>📋 تفاصيل الموعد الملغي:</h3>
                            <p><strong>الطبيب:</strong> {appointment_data['doctor_name']}</p>
                            <p><strong>التاريخ:</strong> {appointment_data['date']}</p>
                            <p><strong>الوقت:</strong> {appointment_data['time']}</p>
                        </div>
                        
                        <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p>📞 للحجز مرة أخرى: <strong>44163344</strong></p>
                            <p>📱 واتساب: <strong>66868388</strong></p>
                        </div>
                        
                        <p style="color: #64748b; font-size: 12px; margin-top: 30px;">
                            مجمع طيبة التخصصي للأسنان - نأمل رؤيتك قريباً
                        </p>
                    </body>
                </html>
                """
                send_email_sync(patient_email, subject, body)
        
        logger.info(f"📧 Email notification ({email_type}): {appointment_data['patient_name']}")
        
    except Exception as e:
        logger.error(f"Error sending email: {e}")

# Appointment Routes
@api_router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentCreate, background_tasks: BackgroundTasks):
    appointment_dict = appointment.dict()
    appointment_dict["status"] = "pending"
    appointment_dict["created_at"] = datetime.utcnow().isoformat()
    
    result = await db.appointments.insert_one(appointment_dict)
    appointment_dict["id"] = str(result.inserted_id)
    
    # Send email notification in background
    background_tasks.add_task(send_appointment_email, appointment_dict)
    
    # Send push notification to clinic staff
    background_tasks.add_task(
        send_notification_to_admins,
        f"📅 حجز جديد: {appointment.patient_name}",
        f"موعد مع {appointment.doctor_name} - {appointment.date} الساعة {appointment.time}",
        {"type": "new_appointment", "appointment_id": appointment_dict["id"], "screen": "appointments"}
    )
    
    return AppointmentResponse(**appointment_dict)

@api_router.get("/appointments/patient/{patient_id}", response_model=List[AppointmentResponse])
async def get_patient_appointments(patient_id: str):
    # Sort by date descending for better UX with proper limit
    appointments = await db.appointments.find({"patient_id": patient_id}).sort("created_at", -1).limit(100).to_list(100)
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
    # Sort by date descending for better UX with proper limit
    appointments = await db.appointments.find({"doctor_id": doctor_id}).sort("created_at", -1).limit(100).to_list(100)
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
async def get_all_appointments(limit: int = 100, skip: int = 0):
    # Sort by date descending with pagination
    appointments = await db.appointments.find().sort("created_at", -1).skip(skip).limit(min(limit, 500)).to_list(min(limit, 500))
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
async def update_appointment_status(appointment_id: str, status: str, background_tasks: BackgroundTasks):
    # First get the appointment data for email
    appointment = await db.appointments.find_one({"_id": ObjectId(appointment_id)})
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    result = await db.appointments.update_one(
        {"_id": ObjectId(appointment_id)},
        {"$set": {"status": status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Send email notification based on status change
    appointment_data = {
        "patient_name": appointment.get("patient_name", ""),
        "patient_email": appointment.get("patient_email", ""),
        "patient_id": appointment.get("patient_id", ""),
        "doctor_name": appointment.get("doctor_name", ""),
        "date": appointment.get("date", ""),
        "time": appointment.get("time", "")
    }
    
    if status == "confirmed":
        background_tasks.add_task(send_appointment_email, appointment_data, "confirmed")
        # Send push notification to patient
        background_tasks.add_task(
            send_notification_to_user,
            appointment_data["patient_id"],
            "✅ تم تأكيد موعدك!",
            f"موعدك مع {appointment_data['doctor_name']} يوم {appointment_data['date']} الساعة {appointment_data['time']} مؤكد",
            {"type": "appointment_confirmed", "appointment_id": appointment_id, "screen": "appointments"}
        )
    elif status == "cancelled":
        background_tasks.add_task(send_appointment_email, appointment_data, "cancelled")
        # Send push notification to patient
        background_tasks.add_task(
            send_notification_to_user,
            appointment_data["patient_id"],
            "❌ تم إلغاء موعدك",
            f"تم إلغاء موعدك مع {appointment_data['doctor_name']} يوم {appointment_data['date']}",
            {"type": "appointment_cancelled", "appointment_id": appointment_id, "screen": "appointments"}
        )
    
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
    # Sort by creation date descending with proper limit
    offers = await db.offers.find().sort("created_at", -1).limit(100).to_list(100)
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
async def create_offer(offer: OfferCreate, background_tasks: BackgroundTasks):
    offer_dict = offer.dict()
    offer_dict["created_at"] = datetime.utcnow().isoformat()
    
    result = await db.offers.insert_one(offer_dict)
    offer_dict["id"] = str(result.inserted_id)
    
    # Send push notification to all patients about new offer
    async def notify_patients_about_offer():
        try:
            tokens = await db.push_tokens.find({"user_role": "patient"}).to_list(500)
            token_list = [t["token"] for t in tokens]
            await send_push_notification(
                token_list,
                f"🎁 عرض جديد: {offer.title}",
                f"{offer.description}\n💰 {offer.discount}",
                {"type": "new_offer", "offer_id": offer_dict["id"], "screen": "home"}
            )
        except Exception as e:
            logger.error(f"Error notifying patients about offer: {e}")
    
    background_tasks.add_task(notify_patients_about_offer)
    
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
        "name_ar": "مجمع طيبة التخصصي للأسنان",
        "address": "6GM2+RRV, Abu Hamour, Doha, Qatar",
        "address_ar": "أبو هامور، الدوحة، قطر",
        "phone": "44163344",
        "fax": "44691699",
        "mobile": "66868388",
        "whatsapp": "66868388",
        "email": "teba.s.d.center@gmail.com",
        "instagram": "https://www.instagram.com/teba_dental_center/?__pwa=1",
        "facebook": "https://www.facebook.com/teba.dental/",
        "google_maps": "https://share.google/wTB9uO7YXo7f0Zq66",
        "description": "The best dental clinic in Doha, Qatar. Specialized in oral surgery, implantation, prosthodontics, and orthodontics.",
        "description_ar": "مجمع طيبة التخصصي للأسنان - نقدم أفضل خدمات طب الأسنان بأحدث التقنيات وفريق طبي متخصص. رضاكم هدفنا وابتسامتكم أولويتنا."
    }

# Staff Management APIs
@api_router.get("/staff")
async def get_all_staff():
    # Get all doctors - exclude password for security with proper limit
    doctors = await db.doctors.find({}, {'password': 0}).limit(100).to_list(100)
    # Get all nurses and receptionist - exclude password for security with proper limit
    staff = await db.users.find({"role": {"$in": ["nurse", "receptionist"]}}, {'password': 0}).limit(100).to_list(100)
    
    all_staff = []
    
    # Add doctors
    for doc in doctors:
        all_staff.append({
            "id": str(doc["_id"]),
            "name": doc["name"],
            "email": doc["email"],
            "role": doc["role"],
            "phone": doc.get("phone"),
            "specialization": doc.get("specialization")
        })
    
    # Add other staff
    for s in staff:
        all_staff.append({
            "id": str(s["_id"]),
            "name": s["name"],
            "email": s["email"],
            "role": s["role"],
            "phone": s.get("phone")
        })
    
    return all_staff

@api_router.put("/staff/doctor/{doctor_id}")
async def update_doctor(doctor_id: str, name: str, specialization: str, phone: str = None):
    result = await db.doctors.update_one(
        {"_id": doctor_id},
        {"$set": {"name": name, "specialization": specialization, "phone": phone}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    return {"message": "Doctor updated successfully"}

@api_router.put("/staff/user/{user_id}")
async def update_staff_user(user_id: str, name: str, phone: str = None):
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"name": name, "phone": phone}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Staff member not found")
    
    return {"message": "Staff member updated successfully"}

@api_router.delete("/staff/doctor/{doctor_id}")
async def delete_doctor(doctor_id: str):
    result = await db.doctors.delete_one({"_id": doctor_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    return {"message": "Doctor deleted successfully"}

@api_router.delete("/staff/user/{user_id}")
async def delete_staff_user(user_id: str):
    result = await db.users.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Staff member not found")
    
    return {"message": "Staff member deleted successfully"}

# ============ Push Notifications APIs ============

# Helper function to send push notification via Expo
import httpx

async def send_push_notification(tokens: List[str], title: str, body: str, data: dict = None):
    """Send push notification via Expo Push API"""
    try:
        if not tokens:
            logger.info("No push tokens to send to")
            return
        
        messages = []
        for token in tokens:
            if token.startswith('ExponentPushToken'):
                message = {
                    "to": token,
                    "sound": "default",
                    "title": title,
                    "body": body,
                    "data": data or {},
                }
                messages.append(message)
        
        if not messages:
            logger.info("No valid Expo push tokens found")
            return
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://exp.host/--/api/v2/push/send",
                json=messages,
                headers={
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip, deflate",
                    "Content-Type": "application/json",
                }
            )
            
            if response.status_code == 200:
                logger.info(f"🔔 Push notifications sent successfully to {len(messages)} devices")
            else:
                logger.error(f"Push notification failed: {response.text}")
                
    except Exception as e:
        logger.error(f"Error sending push notification: {e}")

async def send_notification_to_role(role: str, title: str, body: str, data: dict = None):
    """Send push notification to all users with a specific role"""
    try:
        tokens = await db.push_tokens.find({"user_role": role}).to_list(100)
        token_list = [t["token"] for t in tokens]
        await send_push_notification(token_list, title, body, data)
    except Exception as e:
        logger.error(f"Error sending notification to role {role}: {e}")

async def send_notification_to_user(user_id: str, title: str, body: str, data: dict = None):
    """Send push notification to a specific user"""
    try:
        tokens = await db.push_tokens.find({"user_id": user_id}).to_list(10)
        token_list = [t["token"] for t in tokens]
        await send_push_notification(token_list, title, body, data)
    except Exception as e:
        logger.error(f"Error sending notification to user {user_id}: {e}")

async def send_notification_to_admins(title: str, body: str, data: dict = None):
    """Send push notification to all admins and receptionists"""
    try:
        tokens = await db.push_tokens.find({
            "user_role": {"$in": ["admin", "receptionist", "doctor"]}
        }).to_list(100)
        token_list = [t["token"] for t in tokens]
        await send_push_notification(token_list, title, body, data)
    except Exception as e:
        logger.error(f"Error sending notification to admins: {e}")

# Register push token
@api_router.post("/push-tokens")
async def register_push_token(token_data: PushTokenCreate):
    try:
        # Check if token already exists
        existing = await db.push_tokens.find_one({"token": token_data.token})
        
        if existing:
            # Update existing token
            await db.push_tokens.update_one(
                {"token": token_data.token},
                {"$set": {
                    "user_id": token_data.user_id,
                    "user_role": token_data.user_role,
                    "platform": token_data.platform,
                    "updated_at": datetime.utcnow().isoformat()
                }}
            )
            return {"message": "Push token updated successfully"}
        else:
            # Insert new token
            await db.push_tokens.insert_one({
                "token": token_data.token,
                "user_id": token_data.user_id,
                "user_role": token_data.user_role,
                "platform": token_data.platform,
                "created_at": datetime.utcnow().isoformat()
            })
            return {"message": "Push token registered successfully"}
            
    except Exception as e:
        logger.error(f"Error registering push token: {e}")
        raise HTTPException(status_code=500, detail="Failed to register push token")

# Delete push token (on logout)
@api_router.delete("/push-tokens/{token}")
async def delete_push_token(token: str):
    try:
        result = await db.push_tokens.delete_one({"token": token})
        if result.deleted_count > 0:
            return {"message": "Push token deleted successfully"}
        return {"message": "Token not found"}
    except Exception as e:
        logger.error(f"Error deleting push token: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete push token")

# Send notification (admin only)
@api_router.post("/notifications/send")
async def send_notification(notification: PushNotificationSend, background_tasks: BackgroundTasks):
    try:
        if notification.target_user_id:
            # Send to specific user
            background_tasks.add_task(
                send_notification_to_user,
                notification.target_user_id,
                notification.title,
                notification.body,
                notification.data
            )
        elif notification.target_role:
            if notification.target_role == "all":
                # Send to everyone
                tokens = await db.push_tokens.find().to_list(500)
                token_list = [t["token"] for t in tokens]
                background_tasks.add_task(
                    send_push_notification,
                    token_list,
                    notification.title,
                    notification.body,
                    notification.data
                )
            else:
                # Send to specific role
                background_tasks.add_task(
                    send_notification_to_role,
                    notification.target_role,
                    notification.title,
                    notification.body,
                    notification.data
                )
        
        return {"message": "Notification queued for sending"}
        
    except Exception as e:
        logger.error(f"Error sending notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to send notification")

# Send new offer notification to all patients
@api_router.post("/notifications/new-offer")
async def notify_new_offer(title: str, description: str, discount: str, background_tasks: BackgroundTasks):
    try:
        notification_title = f"🎁 عرض جديد: {title}"
        notification_body = f"{description}\n{discount}"
        
        # Get all patient tokens
        tokens = await db.push_tokens.find({"user_role": "patient"}).to_list(500)
        token_list = [t["token"] for t in tokens]
        
        background_tasks.add_task(
            send_push_notification,
            token_list,
            notification_title,
            notification_body,
            {"type": "new_offer", "screen": "home"}
        )
        
        return {"message": "Offer notification queued for sending"}
        
    except Exception as e:
        logger.error(f"Error sending offer notification: {e}")
        raise HTTPException(status_code=500, detail="Failed to send notification")

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
