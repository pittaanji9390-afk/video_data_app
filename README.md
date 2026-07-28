# Video Data Collection & Vendor Management Platform

A production-ready platform designed for managing video data collection workflows, vendor operations, task allocation, quality control, and dataset distribution.

---

## Technology Stack

- **Mobile App**: Flutter (Android/iOS)
- **Backend API**: Node.js + Express.js
- **Database**: PostgreSQL (Local Dev / AWS RDS Production)
- **Admin Dashboard**: React + Vite
- **Vendor Dashboard**: React + Vite
- **Storage**: AWS S3 (Integration phase)
- **Version Control**: Git

---

## Folder Structure

```
video-platform/
├── backend/            # Express.js REST API server & business logic (Node.js)
├── mobile-app/         # Cross-platform mobile app (Flutter)
├── admin-dashboard/    # Administration panel (React + Vite)
├── vendor-dashboard/   # Vendor management portal (React + Vite)
├── database/           # DB migrations, seeds, schema files
├── docs/               # Architecture & API documentation
├── scripts/            # Automation & deployment scripts
├── docker/             # Containerization files
├── .gitignore          # Repository gitignore settings
└── README.md           # Master project documentation
```

---

## Sub-Project Details & How to Run Locally

### 1. Backend (`backend/`)
Built with Node.js and Express.js.

```bash
cd backend
npm install       # Install dependencies
npm run dev       # Start development server with nodemon (Port 5000)
```
- **Health Check Endpoint**: `GET http://localhost:5000/health`

---

### 2. Mobile App (`mobile-app/`)
Built with Flutter.

```bash
cd mobile-app
flutter pub get   # Install Flutter packages
flutter run       # Launch on emulator/device
```

---

### 3. Admin Dashboard (`admin-dashboard/`)
Built with React and Vite.

```bash
cd admin-dashboard
npm install       # Install dependencies
npm run dev       # Start Vite dev server (Port 5173)
```
- Access at: `http://localhost:5173`

---

### 4. Vendor Dashboard (`vendor-dashboard/`)
Built with React and Vite.

```bash
cd vendor-dashboard
npm install       # Install dependencies
npm run dev       # Start Vite dev server (Port 5174 or next available port)
```
- Access at: `http://localhost:5174`

---

### 5. Database (`database/`)
Contains PostgreSQL migrations, seeds, and schema definitions. See [`database/README.md`](database/README.md) for database workflow guidelines.
