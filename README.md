# 🏥 TeleClinic — Production Telemedicine Showcase Platform

**TeleClinic** is a full-stack, AI-augmented telemedicine and healthcare SaaS showcase application engineered with modern React, Node.js, WebRTC, Socket.IO, Groq AI, and MongoDB.

---

## 🌟 Key Architecture & Modules

### 1. 👤 Patient Portal
- **Authentication**: Secure JWT registration, login, email verification via Resend, and password reset workflows.
- **Doctor Discovery**: Real-time search, category filtering (Cardiology, Dermatology, etc.), detailed doctor profiles, and live slot booking.
- **Consultation Room**: P2P WebRTC video calls, live real-time Socket.IO chat with persistence, and interactive drawers.
- **Digital Prescriptions**: Access structured prescriptions with dosages, schedules, and clinical advice.
- **Medical Records**: Centralized electronic health record containing vitals, allergies, conditions, and consultation history.
- **AI Receptionist**: Conversational intake assessment for symptoms, preliminary triage level, and specialist matching.
- **Online Pharmacy**: Medicine store, category filtering, cart management, and Vrio CRM checkout integration.

### 2. 👨‍⚕️ Doctor Portal
- **Consultation Management**: Review today's schedule, accept appointments, and access patient history.
- **Availability Management**: Configure day-by-day availability slots and consultation fees.
- **Prescription Builder**: Issue multi-item digital prescriptions with dosages, frequencies, instructions, and follow-up dates.
- **AI Consultation Summary**: Instant synthesis of chat transcripts and notes into structured clinical SOAP reports.
- **Patient Roster**: Dynamically tracks all unique patients treated across consultation history.

### 3. 🛡️ Admin Portal
- **Dashboard Analytics**: Real-time metrics on registered patients, verified doctors, and appointment breakdowns.
- **User Oversight**: Full management and status moderation for Patient and Doctor accounts.
- **Appointment Registry**: Global oversight of all scheduled, completed, and pending consultations.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS 4, shadcn/ui (Radix UI), Lucide Icons, Axios, React Router 7, Sonner |
| **Backend** | Node.js (ESM), Express 5, Mongoose 9, MongoDB Atlas, JWT, bcrypt, Zod, Helmet, Morgan |
| **Real-time & Video** | WebRTC (P2P Mesh with STUN signaling), Socket.IO (Chat & Presence) |
| **AI Integration** | Groq API (`llama-3.3-70b-versatile`) with robust clinical fallback heuristics |
| **Transactional Email** | Resend API / SMTP (Brevo) |
| **E-Commerce & CRM** | Embedded Pharmacy Store with Vrio CRM integration interface |

---

## 🚀 Getting Started

### 1. Clone & Configure

```bash
# Copy example environment files
cp .env.example server/.env
```

### 2. Backend Setup & Admin Seed

```bash
cd server
npm install

# Seed the initial SuperAdmin account
npm run seed:admin

# Start development API server
npm run dev
```

*Default Admin Credentials:*
- **Email:** `admin@teleclinic.com`
- **Password:** `Admin@2026`

### 3. Frontend Setup

```bash
cd client
npm install

# Start development client server
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 📁 Repository Structure

```
TeleMed/
├── client/                     # React 19 Frontend
│   ├── src/
│   │   ├── api/                # Role-specific Axios instances (patient, doctor, admin)
│   │   ├── components/         # Reusable UI & role-based components
│   │   ├── hooks/              # useWebRTC and custom hooks
│   │   ├── layouts/            # PatientLayout, DoctorLayout, AdminLayout
│   │   ├── pages/              # Home, Patient, Doctor, Admin, Consultation
│   │   ├── routes/             # AppRoutes with role protection guards
│   │   └── socket/             # Socket.IO client instance
├── server/                     # Express 5 Backend
│   ├── src/
│   │   ├── admin/              # Admin module (model, service, controller, routes)
│   │   ├── ai/                 # Groq AI module & triage engine
│   │   ├── appointments/       # Appointment booking & status management
│   │   ├── doctors/            # Doctor profile & availability module
│   │   ├── mail/               # Resend transactional email services
│   │   ├── modules/chat/       # Real-time chat model & persistence
│   │   ├── notifications/      # Notification dispatch & Socket.IO events
│   │   ├── patients/           # Patient auth & health records module
│   │   ├── pharmacy/           # Medicine catalogue & order services
│   │   ├── prescriptions/      # Digital prescription module
│   │   ├── shared/             # Errors, DB connection, middleware, utilities
│   │   └── socket/             # WebRTC signaling & chat socket handlers
│   └── scripts/                # Database migration and seed scripts
└── docs/                       # PRD and architecture specifications
```

---

## 🔒 Security & Medical Data Guidelines

- All passwords are encrypted with `bcrypt` (10 rounds).
- Sensitive credentials, API keys, and JWT secrets are strictly managed via environment variables.
- AI clinical recommendations include mandatory non-diagnostic disclaimers for patient safety.
- Profile images and uploads use portable, environment-independent filenames.