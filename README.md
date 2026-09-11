# 🏥 TeleClinic — Production Telemedicine & Healthcare Platform

**TeleClinic (TeleMed)** is a full-stack, enterprise-grade, AI-augmented telemedicine and digital healthcare platform built with React 19, Node.js, Express, WebRTC, Socket.IO, and MongoDB.

The platform provides a unified ecosystem connecting patients, verified medical practitioners, and platform administrators, complete with real-time video consultations, multi-provider AI triage, an online pharmacy with multi-CRM billing gateways, lab diagnostics, and comprehensive practice management.

---

## 🌟 Core Modules & Architecture

### 1. 👤 Patient Portal
- **Authentication & Security**: Secure JWT registration, login, email verification, and password reset flows.
- **Doctor Discovery & Booking**: Real-time doctor search by specialty, rating, and fee; interactive calendar booking and instant rescheduling.
- **Video Consultation Room**: Ultra-low-latency peer-to-peer WebRTC video/audio calls, persistent live chat, and clinical drawer.
- **Digital Prescriptions**: Instant access to doctor-issued prescriptions with dosages, frequencies, and instructions.
- **Electronic Health Records (EHR)**: Centralized health profile tracking vitals, allergies, medical history, and past consultation summaries.
- **AI Health Assistant & Receptionist**: Conversational symptom intake, urgency assessment (Low / Medium / High / Emergency), and automated specialist recommendations.
- **Online Pharmacy**: E-commerce medicine store with category filtering, cart management, and seamless CRM checkout integration.
- **Diagnostic Lab Reports**: Browse and book laboratory diagnostic tests, track status, and view digital lab results.
- **Gift Cards & Rewards**: Purchase, gift, and redeem digital health credit cards and coupon codes.

### 2. 👨‍⚕️ Doctor Portal
- **Consultation Queue**: Manage daily appointments, initiate video calls, and access patient medical history with a single click.
- **Availability Management**: Configure weekly schedule slots, break times, and consultation rates.
- **Interactive Prescription Builder**: Issue structured multi-item digital prescriptions directly within the consultation interface.
- **AI Consultation Summaries (SOAP)**: One-click synthesis of in-call chat transcripts and clinical notes into structured clinical SOAP reports.
- **Patient Roster**: Maintain dynamic records of all treated patients and consultation logs.
- **Earnings & Payouts**: Real-time tracking of consultation revenue, platform fees, and withdrawal requests.

### 3. 🛡️ Admin Control Center
- **System Analytics Dashboard**: Real-time overview of active consultations, revenue, registered patients, and doctor verification requests.
- **User & Doctor Moderation**: Verify medical credentials, manage account statuses, and moderate users.
- **Appointment Registry**: Global oversight, filtering, and manual rescheduling of all consultations.
- **Settings & Integration Hub (`/admin/settings`)**:
  - **Multi-CRM Gateways**: Dynamically switch between **Vrio CRM**, **sticky.io**, and **CheckoutChamp**. Configure campaign IDs, prepaid decline fallback campaigns, and dedicated Telemedicine Consultation Product routing.
  - **Multi-AI Engine**: Dynamically select and input API credentials for **Groq** (`llama-3.3-70b-versatile`), **OpenAI** (`gpt-4o`), or **Google Gemini** (`gemini-1.5-flash` / `gemini-2.0-flash`).
  - **Multi-Email Service**: Dynamically configure transactional email dispatch via **Resend**, **SendGrid**, **Postmark**, or **SMTP (Brevo)**.
- **Pharmacy & Lab Management**: Manage pharmacy stock, orders, and diagnostic test catalogs.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, shadcn/ui, Lucide Icons, Axios, React Router 7, Sonner |
| **Backend** | Node.js (ESM), Express 5, Mongoose 9, MongoDB Atlas, JWT, bcrypt, Zod, Helmet, Morgan |
| **Real-time & Video** | WebRTC (P2P Mesh with STUN signaling), Socket.IO (Signaling & Synchronized Chat) |
| **Multi-AI Engine** | Dynamic provider router: **Groq**, **OpenAI ChatGPT**, **Google Gemini**, with automated clinical heuristic fallback |
| **Multi-CRM & E-Commerce** | **Vrio CRM**, **sticky.io**, **CheckoutChamp** with dedicated Telemedicine Consultation product routing & prepaid retry cascades |
| **Transactional Email** | Dynamic provider router: **Resend**, **SendGrid**, **Postmark**, **Brevo / SMTP** |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (Node.js 20+ recommended)
- **MongoDB**: Local MongoDB instance or MongoDB Atlas connection URI

### 2. Environment Configuration

```bash
# Copy example environment file for server
cp .env.example server/.env
```

Configure `server/.env` with your database URI, JWT secret, and API credentials:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/teleclinic
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

*(AI keys, CRM credentials, and Mail API keys can be provided via `.env` or configured directly in the Admin Settings UI).*

### 3. Backend Setup & Admin Seeding

```bash
cd server
npm install

# Seed the initial SuperAdmin account
npm run seed:admin

# Start the API server in development mode
npm run dev
```

*Default Admin Credentials:*
- **Email:** `admin@teleclinic.com`
- **Password:** `Admin@2026`

### 4. Frontend Setup

```bash
cd client
npm install

# Start the client development server
npm run dev
```

The web application will be running at `http://localhost:5173`.

---

## 📁 Repository Structure

```
TeleMed/
├── client/                     # React 19 Frontend Application
│   ├── src/
│   │   ├── api/                # Role-specific Axios client instances (patient, doctor, admin)
│   │   ├── components/         # Reusable UI components & role-specific modals
│   │   ├── hooks/              # useWebRTC, useAuth, and custom state hooks
│   │   ├── layouts/            # PatientLayout, DoctorLayout, AdminLayout
│   │   ├── pages/              # Patient, Doctor, Admin, Consultation, and Store views
│   │   ├── routes/             # AppRoutes with role-based route protection guards
│   │   └── socket/             # Socket.IO client connection & event listeners
├── server/                     # Express 5 REST API Backend
│   ├── src/
│   │   ├── admin/              # Admin analytics, user moderation, and settings controller
│   │   ├── ai/                 # Multi-AI engine (Groq, OpenAI, Gemini) & triage
│   │   ├── appointments/       # Booking, scheduling, and consultation lifecycle
│   │   ├── auth/               # JWT authentication, verification, and password reset
│   │   ├── chat/               # Persistent in-call messaging
│   │   ├── coupons/            # Discount codes & promo engine
│   │   ├── doctors/            # Doctor profile, availability slots, and ratings
│   │   ├── giftcards/          # Gift card generation and balance redemption
│   │   ├── lab-reports/        # Diagnostic laboratory testing & report files
│   │   ├── mail/               # Multi-provider email dispatch (Resend, SendGrid, Postmark, SMTP)
│   │   ├── notifications/      # Real-time and in-app notifications
│   │   ├── patients/           # Patient health records (EHR), allergies, vitals
│   │   ├── payouts/            # Doctor earnings & financial payout requests
│   │   ├── pharmacy/           # Medicine catalog, cart, and Multi-CRM integration
│   │   ├── prescriptions/      # Structured digital prescription authoring
│   │   ├── reviews/            # Doctor ratings and patient feedback
│   │   ├── shared/             # Errors, DB connection, middleware, utilities
│   │   ├── socket/             # WebRTC signaling and real-time chat handlers
│   │   └── specializations/    # Medical specialties and departments
│   └── scripts/                # Database migrations and seed scripts
└── docs/                       # Product Requirements Document (PRD) & documentation
```

---

## 🔒 Security & Medical Compliance

- **Authentication & RBAC**: Stateless JWT authentication with strict role-based access control guards on both frontend and backend.
- **Credential Protection**: Passwords securely hashed with `bcrypt` (10 rounds); all environment variables and secrets excluded from version control.
- **Safe Fallbacks**: Automated heuristics safeguard all AI endpoints against rate limits or external API interruptions.
- **Medical Disclaimer**: AI intake and triage services prominently feature non-diagnostic clinical advisory warnings.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.