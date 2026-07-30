# 📱 **Video Data Collection & Multi-Role Platform**
### *Comprehensive Master Project Documentation*

---

## 📄 **1. Executive Summary**

The **Video Data Collection & Vendor Management Platform** is a production-ready, end-to-end software ecosystem engineered for crowd-sourced video dataset acquisition, vendor management, multi-stage quality assurance, and dataset distribution. 

The entire user-facing system is consolidated into **ONE unified Flutter mobile/web application**, backed by a high-scalability **Node.js REST API** and a cloud-hosted **Neon PostgreSQL Database**.

---

## 🏗️ **2. Architecture Overview & Folder Structure**

```
video-platform/
├── mobile-app/         # 📱 Unified Cross-Platform Flutter App (Android / iOS / Web)
│   ├── lib/
│   │   ├── config/     # Dynamic App Routes & Theme Settings
│   │   ├── core/       # Constants, Color Tokens & Utilities
│   │   ├── screens/    # Onboarding, Auth, Candidate, Vendor, QC Team & Admin Screens
│   │   ├── services/   # Camera, Voice Commands, Location, Auth & API Services
│   │   └── widgets/    # Reusable UI Components & Footers
│   └── web/            # Viewport & Web Renderer Config
├── backend/            # ⚡ Node.js + Express.js REST API Server
│   ├── src/
│   │   ├── controllers/# API Route Handlers
│   │   ├── database/   # Neon PostgreSQL Connection Pool
│   │   ├── middleware/ # JWT Auth, RBAC & Multer Video Uploads
│   │   ├── routes/     # Express API Endpoint Directory & Portal Gateway
│   │   └── services/   # Business Logic & Data Access Layer
│   └── uploads/        # Local Server Video File Storage Directory
├── database/           # 🗄️ PostgreSQL Database Schemas & Migrations
└── docs/               # 📚 Project & API Documentation
```

---

## 👥 **3. Multi-Role Capability & Access Matrix**

The platform supports **4 distinct user roles** seamlessly within a single Flutter application:

| Role | Access Level | Primary Capabilities | Default Credentials |
| :--- | :--- | :--- | :--- |
| 🔵 **Candidate** | Candidate Portal | Live HD camera recording, voice control (`start`, `stop`, `upload`), environment tagging, location metadata, uploads history, and earnings. | **`anji@gmail.com`** / `anji123` |
| 🌐 **Vendor** | Vendor Portal | Onboard candidate teams, assign collection tasks, track vendor earnings, and view submission metrics. | **`vendor@acmevideos.com`** / `vendor123` |
| 🟣 **QC Team** | Quality Control Hub | Dedicated QC Queue (`pending_qc`), rate 4 quality sliders (Audio, Lighting, Framing, Env Match), 1-Click **QC Approve** / **QC Reject** with reason feedback. | **`qc.reviewer@videoplatform.com`** / `qc1234` |
| 👑 **Admin** | Master Admin Portal | Review QC-approved dataset queue, final dataset sign-off (`approved`), task distribution, candidate store, vendor management, and financial graphs. | **`admin@videoplatform.com`** / `password123` |

---

## 🔄 **4. Two-Stage Video Verification Workflow**

Videos undergo a rigorous two-tier verification pipeline before dataset release:

```mermaid
flowchart TD
    A[Candidate Records & Uploads Video] -->|Status: PENDING_QC| B[QC Team Review Queue]
    B -->|Rates Audio, Lighting, Framing| C{QC Specialist Decision}
    C -->|QC Reject| D[Status: QC_REJECTED<br/>Feedback Sent to Candidate & Vendor]
    C -->|QC Approve| E[Status: QC_APPROVED<br/>Forwarded to Admin Queue]
    E --> F[Admin Master Dashboard Queue]
    F -->|Admin Final Approve| G[Status: APPROVED / RELEASED<br/>Triggers Vendor Payout Credit]
    F -->|Admin Reject| H[Status: REJECTED]
```

### **Status Lifecycle Breakdown:**
1. **`pending_qc`**: Freshly recorded video clip uploaded by Candidate awaiting initial Quality Control.
2. **`qc_approved`**: Passed QC Team inspection (Audio, Lighting, Framing) and forwarded to Admin.
3. **`qc_rejected`**: Rejected during initial QC inspection; specific defect reason sent to Candidate.
4. **`approved`**: Final sign-off by Admin; video dataset released and vendor payment credited.
5. **`rejected`**: Final rejection by Admin.

---

## 📲 **5. Application Launch & Startup Sequence**

When the Flutter application opens, it executes the following sequence:

```mermaid
flowchart LR
    A[1. Royal Blue Branding Splash Screen] -->|1.5s Load| B[2. Onboarding Slide 1: Record Videos Easily]
    B -->|Next| C[3. Onboarding Slide 2: Secure Upload & Storage]
    C -->|Next| D[4. Onboarding Slide 3: Earn More with Transparency]
    D -->|Get Started / Skip| E[5. Login Screen with Quick Role Switcher]
```

---

## 🗄️ **6. Database & Cloud Infrastructure**

* **Database System**: PostgreSQL 15+
* **Cloud Host**: **Neon AWS PostgreSQL Cloud Database**
* **Connection String**: `postgresql://neondb_owner:***@ep-young-leaf-axv340na-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require`
* **Security & SSL**: SSL-encrypted pooling (`ssl: { rejectUnauthorized: false }`)
* **Tables Created & Seeded**:
  * `admins` (Platform administrators)
  * `vendors` (Partner vendors)
  * `candidates` (Video collection candidates)
  * `videos` (Recorded video metadata, duration, tags, status)
  * `qc_reviews` (QC review scores, status, defect notes)
  * `payments` (Vendor payout ledger)
  * `notifications` (Real-time user alerts)
  * `refresh_tokens` (JWT auth persistence)

---

## 🛠️ **7. Execution & Deployment Guide**

### **A. How to Run Locally**

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   *Runs backend server on `http://localhost:5000` (Connected to Neon DB).*

2. **Start Flutter App**:
   ```bash
   cd mobile-app
   flutter run --release -d web-server --web-port 8080
   ```
   *Access Flutter App on `http://localhost:8080`.*

---

### **B. How to Build Android APK (`.apk`)**

To generate a standalone APK file to send to mobile devices:

```bash
cd mobile-app
flutter build apk --release
```
* **Output File Path**: `mobile-app/build/app/outputs/flutter-apk/app-release.apk`  
* *Send this `.apk` file via WhatsApp, Drive, or Email for direct mobile installation.*

---

### **C. How to Deploy Web Version**

```bash
cd mobile-app
flutter build web --release
```
* **Output Web Directory**: `mobile-app/build/web`  
* *Deploy this folder to Vercel, Netlify, Firebase, or AWS S3.*

---

## 🎯 **8. Summary & Current Status**

* ✅ **Single Deployable App**: All 4 role dashboards (Candidate, Vendor, QC Team, Admin) consolidated inside `mobile-app/`.
* ✅ **QC Team Workflow**: Full 4-criteria rating sliders, QC Approve/Reject mechanisms, and two-stage status pipeline.
* ✅ **Live Cloud Database**: Connected to Neon Cloud PostgreSQL DB with active schema & seeds.
* ✅ **Production Ready**: Tested and ready for Android APK compilation or Web hosting.
