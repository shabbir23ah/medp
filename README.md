# 💊 MedPrescription

**Your complete healthcare ecosystem** — prescriptions, doctors, telemedicine, online pharmacy, and treatment plans, all in one platform.

## ✨ Features

### 👤 For Patients
- **📱 Phone OTP login** — no passwords to remember
- **📋 Health Timeline** — all prescriptions, reports, and records chronologically organized
- **📸 Prescription Upload** — snap a photo, add doctor + medicine details
- **👨‍⚕️ Find a Doctor** — browse specialists, view ratings & reviews, book appointments
- **💬 Telemedicine** — real-time chat with doctors, audio/video calls
- **🛒 Online Pharmacy** — browse medicine catalog, add to cart, checkout with delivery address
- **⏰ Smart Reminders** — medicine, appointment, revisit reminders with notifications
- **📋 Treatment Plans** — track care journey milestones set by your doctor
- **🌐 4 Languages** — English, Bengali, Spanish, French
- **🌙 Dark Mode** — toggle anytime

### 👨‍⚕️ For Doctors
- **📊 Dashboard** — today's schedule, pending requests, patient list
- **💊 Quick Rx Builder** — add medicines with real-time **drug interaction checking**
- **📅 Appointment Management** — confirm/decline, view all bookings
- **💬 Patient Chat + Video Calls** — WebRTC-powered, doctor-controlled
- **📤 Prescription Push** — send digital prescriptions directly to patient's app
- **📋 Treatment Plans** — create care journeys with milestones

### 💊 For Pharmacies
- **📦 Medicine Catalog** — add products with name, category, price, stock
- **📋 Order Management** — confirm → shipped → delivered status flow
- **🏪 Store Dashboard** — product counts, pending orders

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3, Vite, Pinia, Vue Router, vue-i18n |
| Backend | Node.js, Express, TypeScript, Socket.io |
| Database | PostgreSQL |
| Real-time | Socket.io (chat), WebRTC (calls) |
| Auth | Phone OTP + JWT |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm 9+

### 1. Setup Database

```bash
createdb medprescription
cd server && npm run migrate
```

### 2. Start Backend

```bash
cd server && npm run dev
```

### 3. Start Frontend

```bash
cd client && npm install && npm run dev
```

### 4. Seed Demo Data (optional)

```bash
cd server && npm run seed
```

### 5. Open

Visit [http://localhost:5173](http://localhost:5173)

## 🔑 Demo Accounts

| Role | Phone | OTP |
|------|-------|-----|
| 👤 Patient | `+8801000000001` | `123456` |
| 👨‍⚕️ Doctor | `+8801000000002` | `123456` |
| 💊 Pharmacy | `+8801000000003` | `123456` |

## 📁 Project Structure

```
medprescription/
├── client/                 # Vue 3 + Vite frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── composables/    # Vue composables (auth, theme, api)
│       ├── locales/        # i18n (en, bn, es, fr)
│       ├── pages/          # Route pages
│       ├── router/         # Route config + guards
│       └── stores/         # Pinia stores
├── server/                 # Express + TypeScript backend
│   └── src/
│       ├── db/             # Migrations + seeds
│       ├── middleware/     # Auth, upload, error handling
│       ├── routes/         # API endpoints
│       ├── services/       # Business logic
│       └── socket.ts       # WebSocket server
├── uploads/                # Uploaded images (gitignored)
└── docs/                   # Specs and plans
```

## 🔌 API Overview

| Module | Endpoints |
|--------|-----------|
| Auth | `/api/auth/*` — send-otp, verify-otp, register |
| User | `/api/user/*` — profile CRUD |
| Prescriptions | `/api/prescriptions/*` — upload, list, detail, push |
| Doctors | `/api/doctors/*` — search, profile |
| Appointments | `/api/appointments/*` — book, list, status |
| Chat | `/api/chat/*` + WebSocket — messaging |
| Pharmacy | `/api/pharmacy/*` — catalog, orders |
| Enhancements | `/api/enhancements/*` — reviews, drug-check, plans |
| Reports | `/api/reports/*` — upload, list |
| Reminders | `/api/reminders/*` — CRUD + push subscribe |

## 📜 License

© 2026 MedPrescription. All rights reserved.
