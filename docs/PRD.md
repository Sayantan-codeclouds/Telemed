# TeleClinic (TeleMed AI)
## Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Implemented / Production Ready  
**Last Updated:** September 2026  

---

# 1. Overview

**TeleClinic (TeleMed)** is a full-stack, enterprise-grade, AI-augmented digital health and telemedicine platform. It bridges patients, healthcare practitioners, and platform administrators within a secure, high-performance ecosystem. 

The platform supports end-to-end clinical and operational workflows: online doctor discovery, real-time WebRTC audio/video consultations, live chat, multi-provider AI diagnostic assistance, electronic health records (EHR), multi-item digital prescriptions, lab test orders, gift cards/credits, and e-pharmacy checkout powered by a flexible multi-CRM fulfillment engine.

---

# 2. Vision

To build a secure, intelligent, and scalable digital health platform that combines real-time teleconsultations, dynamic multi-model AI clinical assistance, and unified multi-CRM eCommerce into a frictionless healthcare experience.

---

# 3. Core Goals & Objectives

- **Frictionless Appointment Scheduling**: Real-time calendar availability, slot booking, instant rescheduling, and consultation fee processing.
- **High-Definition Video Consultations**: Low-latency peer-to-peer WebRTC video/audio calls with synchronized in-call chat.
- **Multi-Provider Clinical AI Engine**: Instant patient triage, symptom analysis, and clinical SOAP summary generation supporting Groq (LLaMA 3.3), OpenAI (ChatGPT), and Google Gemini.
- **Structured Digital Prescriptions**: Multi-item medication builder with custom dosage, frequency, instructions, and pharmacy handoff.
- **Enterprise Multi-CRM eCommerce**: Integrated pharmacy store with live switching between Vrio CRM, sticky.io, and CheckoutChamp, featuring dedicated consultation product routing and prepaid card fallback cascades.
- **Comprehensive Electronic Health Records (EHR)**: Centralized patient medical history, allergies, vitals, lab reports, and consultation logs.
- **Multi-Channel Transactional Notifications**: Resilient transactional email engine supporting Resend, SendGrid, Postmark, and SMTP.
- **Security & Compliance**: Role-based access control (RBAC), bcrypt encryption, token-based authentication, and medical disclaimer safeguards.

---

# 4. User Roles & Access Control

| Role | Permissions & Responsibilities |
|---|---|
| **Patient** | Profile management, medical history, appointment booking, WebRTC consultations, pharmacy orders, lab test orders, prescription access, AI intake chat, gift card redemption. |
| **Doctor** | Professional verification, availability slot management, consultation queue, live video/audio calls, digital prescription authoring, AI consultation summaries, earnings & payout tracking. |
| **Admin** | Full system oversight: user moderation (doctors/patients), appointment registry, order management, lab report diagnostics, gift card management, and system integrations (`/admin/settings`). |

---

# 5. Core Application Modules

### 5.1 Authentication & User Management
- JWT token authentication with role-based routing (`/auth/login`, `/auth/register`, `/auth/verify-email`, `/auth/forgot-password`).
- Doctor onboarding workflow with clinical credentials, license verification, and admin approval.

### 5.2 Patient Portal
- Doctor search by specialization, fees, and rating.
- Interactive booking calendar with automatic conflict prevention.
- Patient health dashboard: upcoming visits, past records, prescriptions, and lab test results.
- Built-in pharmacy storefront with category navigation, cart, and multi-gateway checkout.

### 5.3 Doctor Portal
- Real-time consultation dashboard with schedule overview and quick action triggers.
- In-call clinical tools: live patient medical record review, chat drawer, and digital prescription builder.
- Post-consultation workflow: AI-assisted clinical SOAP notes synthesis.
- Financial analytics: Earnings dashboard and payout tracking.

### 5.4 Video Consultation & Real-time Mesh
- WebRTC P2P mesh architecture with STUN server configuration for low-latency calls.
- Socket.IO signaling server for connection handshake, call initiation, acceptance, rejection, and termination.
- Persistent in-call messaging with timestamps and read states.

### 5.5 Pharmacy & E-Commerce
- Full medication catalog with categorized products, stock management, and prescription requirements.
- Cart and checkout pipeline supporting credit card transactions and direct CRM gateway sync.
- Telemedicine Consultation pay-to-consult product routing through CRM billing engines.

### 5.6 Diagnostics & Lab Reports
- Lab test service directory and booking workflow.
- Sample collection status tracking and diagnostic report PDF upload/download.

### 5.7 Financials, Gift Cards & Promotions
- Gift card generation, gifting to other users, and balance redemption.
- Coupon and promo code checkout validation engine.
- Doctor consultation earnings breakdown and payout request pipeline.

### 5.8 Admin Control Center & Settings
- Overview analytics: revenue, active consultations, doctor verification requests.
- Integrated Settings Hub (`/admin/settings`) with live configuration cards for:
  - **CRM Selection & Gateways**: Vrio CRM, sticky.io, CheckoutChamp.
  - **AI Engine**: Groq, OpenAI ChatGPT, Google Gemini.
  - **Email Service**: Resend, SendGrid, Postmark, SMTP.

---

# 6. AI Intelligence Modules

- **AI Receptionist & Intake Triage**: Conversational intake evaluating symptoms, urgency level (Low / Medium / High / Emergency), and recommended doctor specialization.
- **AI Consultation Summarizer (SOAP)**: Real-time synthesis of consultation transcripts and doctor notes into structured clinical SOAP reports (Subjective, Objective, Assessment, Plan).
- **Multi-Provider AI Architecture**:
  - **Groq API**: High-throughput inference via `llama-3.3-70b-versatile`.
  - **OpenAI API**: Advanced conversational reasoning via `gpt-4o`.
  - **Google Gemini API**: Multimodal and structured clinical reasoning via `gemini-1.5-flash` / `gemini-2.0-flash`.
  - **Clinical Heuristic Fallback**: Deterministic fallback engine ensuring zero downtime even during API rate limits or network degradation.

---

# 7. Enterprise Third-Party Integrations

| Domain | Integration / Provider | Description |
|---|---|---|
| **AI LLM Services** | Groq, OpenAI, Google Gemini | Dynamic multi-model AI provider selection via Admin Settings. |
| **CRM & Payment Gateways** | Vrio CRM, sticky.io, CheckoutChamp | Multi-CRM orders, consultation products, and prepaid decline retry cascades. |
| **Transactional Email** | Resend, SendGrid, Postmark, Brevo SMTP | Password resets, appointment confirmations, and email verifications. |
| **Real-time & Video** | WebRTC & Socket.IO | P2P video/audio streaming, socket signaling, and persistent chat. |
| **Storage & Database** | MongoDB Atlas & Local Uploads | Document-oriented data modeling with Mongoose 9 ODM and secure uploads. |

---

# 8. Non-Functional & Security Requirements

- **Medical Disclaimers**: Explicit mandatory warnings that AI assistants provide informative triage and not definitive diagnoses.
- **Credential Protection**: Absolute exclusion of environment files (`.env`), credentials, and private keys from version control.
- **Input Validation & Sanitization**: Strict schema validation using Zod and Express middleware.
- **Data Protection**: Passwords securely hashed with bcrypt; JWT tokens signed with SHA-256 secrets.