# 🚀 SIMTA Deployment Guide & Project Summary

> **Dokumen ini berisi ringkasan lengkap project SIMTA untuk deployment dan referensi AI di workspace lain.**

---

## 📋 Project Overview

**SIMTA** = Sistem Informasi Manajemen Tugas Akhir

Aplikasi web untuk mengelola proses bimbingan skripsi/tugas akhir di Institut Teknologi Batam (ITEBA).

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + Shadcn/ui |
| **State** | Redux Toolkit |
| **Animation** | Framer Motion |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (Atlas) |
| **Auth** | JWT (Access + Refresh Token) |
| **File Upload** | Multer |
| **WhatsApp** | Fonnte API |

---

## 👥 User Roles

| Role | Capabilities |
|------|--------------|
| **Admin** | CRUD users, create jadwal sidang, view all data |
| **Dosen** | Review bimbingan, give feedback, view mahasiswa bimbingan |
| **Mahasiswa** | Upload bimbingan, view feedback, view jadwal sidang |

---

## 📂 Project Structure

```
Program_Website/
├── frontend/                    # React Frontend (Vite)
│   ├── src/
│   │   ├── components/ui/       # Shadcn UI components
│   │   ├── pages/               # Page components
│   │   │   ├── Login/
│   │   │   ├── Dashboard/       # Mahasiswa, Dosen, Admin
│   │   │   ├── Bimbingan/       # Mahasiswa & Dosen views
│   │   │   ├── Profile/
│   │   │   ├── Jadwal/
│   │   │   └── Admin/           # ManajemenUser, KelolaJadwal
│   │   ├── store/               # Redux store & slices
│   │   ├── services/            # API service functions
│   │   ├── lib/                 # Utilities (api.ts = axios instance)
│   │   └── config/              # App configurations
│   ├── public/                  # Static assets (logos)
│   ├── .env                     # Environment variables
│   └── package.json
│
├── backend/                     # Express Backend
│   ├── controller/              # Route handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── bimbinganController.js
│   │   └── jadwalController.js
│   ├── models/                  # Mongoose schemas
│   │   ├── User.js
│   │   ├── Bimbingan.js
│   │   ├── Reply.js
│   │   └── Jadwal.js
│   ├── middleware/              # Express middlewares
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorMiddleware.js
│   ├── router/                  # API routes
│   ├── services/                # External services
│   │   └── whatsappService.js   # Fonnte integration
│   ├── utils/                   # Helpers
│   ├── scripts/                 # Database scripts
│   │   ├── seed.js              # Create admin account
│   │   └── testWhatsapp.js      # Test WhatsApp notification
│   ├── uploads/                 # Uploaded files (bimbingan PDFs)
│   ├── .env                     # Environment variables
│   └── package.json
│
└── Z_Diagram/                   # Documentation & diagrams
```

---

## 🔐 Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
# Production:
# VITE_API_URL=https://your-backend-url.com/api
```

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/simta_db?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_min_32_characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here_min_32_characters
JWT_REFRESH_EXPIRES_IN=30d

# CORS
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=10
UPLOAD_DIR=uploads

# WhatsApp (Fonnte)
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=fonnte
WHATSAPP_API_TOKEN=your_fonnte_token
```

---

## 🚀 Deployment Strategy

### Recommended Free Stack

| Component | Platform | Notes |
|-----------|----------|-------|
| **Frontend** | Vercel | Auto-deploy from GitHub, perfect for React/Vite |
| **Backend** | Railway or Cyclic | Node.js hosting, free tier available |
| **Database** | MongoDB Atlas | Free 512MB cluster |
| **File Storage** | Railway/Cyclic | Or Cloudinary for files |

---

## 📋 Deployment Steps

### Step 1: Prepare Repository

1. Push to GitHub (already done: `ClimaxTimes/simta`)
2. Ensure `.gitignore` excludes:
   - `node_modules/`
   - `.env`
   - `uploads/*`

### Step 2: Deploy MongoDB Atlas

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free M0 cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all for cloud hosting)
5. Get connection string

### Step 3: Deploy Backend (Railway)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `ClimaxTimes/simta` repo
4. Set root directory: `backend`
5. Add environment variables (from .env)
6. Deploy → Get public URL (e.g., `https://simta-backend.railway.app`)

### Step 4: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Set root directory: `frontend`
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   ```
7. Deploy

### Step 5: Update CORS

In backend `.env` or Railway env vars:
```
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🔧 Important Configurations

### CORS Setup (backend/app.js)

```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
```

### API Base URL (frontend/src/lib/api.ts)

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

---

## 📱 WhatsApp Notification

### Provider: Fonnte (fonnte.com)

- Free tier: 500 messages/month
- Token stored in: `WHATSAPP_API_TOKEN`
- Test script: `node backend/scripts/testWhatsapp.js 08xxxx`

### Notification Triggers

| Event | Recipient |
|-------|-----------|
| Mahasiswa upload bimbingan | Dosen Pembimbing |
| Dosen give feedback | Mahasiswa |
| Admin create jadwal sidang | Mahasiswa + Penguji |

---

## 🔑 Default Credentials

| Role | NIM/NIP | Password |
|------|---------|----------|
| Admin | admin001 | Ebt9BRADR6YGT7bniRETd0 |

> Run `node backend/scripts/seed.js` to create admin account

---

## 🐛 Known Issues & Solutions

### 1. Login Refresh Issue
- **Fixed**: Added `handleUsernameChange` and `handlePasswordChange` to clear error on typing

### 2. PDF Download
- **Implemented**: `generatePDF()` function in JadwalSidang.tsx using browser print

### 3. CORS Error on Deploy
- **Solution**: Set `FRONTEND_URL` in backend to Vercel URL

### 4. File Upload 404
- **Solution**: Ensure `uploads/` folder exists and has `.gitkeep`

---

## 📊 API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users` - List users (with filters)
- `POST /api/users` - Create user (admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/profile` - Update own profile

### Bimbingan
- `GET /api/bimbingan` - List bimbingan
- `POST /api/bimbingan` - Create bimbingan (mahasiswa)
- `PUT /api/bimbingan/:id/feedback` - Give feedback (dosen)
- `POST /api/bimbingan/:id/reply` - Add reply

### Jadwal
- `GET /api/jadwal` - List jadwal
- `POST /api/jadwal` - Create jadwal (admin)
- `PUT /api/jadwal/:id` - Update jadwal
- `DELETE /api/jadwal/:id` - Cancel jadwal

---

## ✅ Features Completed

- [x] Authentication (JWT)
- [x] Role-based access control
- [x] Dashboard (Mahasiswa, Dosen, Admin)
- [x] User Management (CRUD)
- [x] Bimbingan System (upload, review, feedback)
- [x] Reply/Discussion on bimbingan
- [x] Jadwal Sidang Management
- [x] PDF Download for Jadwal
- [x] WhatsApp Notification (Fonnte)
- [x] Profile Management (including WhatsApp number)

---

## 📝 Notes for AI in Program_Deploy

1. **Repository**: `https://github.com/ClimaxTimes/simta`
2. **Frontend build**: `npm run build` → output to `dist/`
3. **Backend start**: `npm start` (production) or `npm run dev` (development)
4. **Database**: MongoDB Atlas (cloud)
5. **Key files to check**:
   - `frontend/.env` - API URL
   - `backend/.env` - All secrets
   - `backend/app.js` - CORS config

---

**Last Updated**: January 2026
**Author**: Andhika Laksmana Putra Alka (2321053)
