# 🎓 SIMTA - Sistem Informasi Manajemen Tugas Akhir

<div align="center">

![SIMTA Banner](https://img.shields.io/badge/SIMTA-Thesis%20Management-purple?style=for-the-badge&logo=graduation-cap)

**Aplikasi web untuk mengelola proses bimbingan dan sidang tugas akhir mahasiswa**

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 📋 Deskripsi

**SIMTA** adalah aplikasi berbasis web yang dirancang untuk membantu proses manajemen tugas akhir (skripsi) di lingkungan akademik. Aplikasi ini memfasilitasi interaksi antara mahasiswa, dosen pembimbing, dan admin dalam proses bimbingan dan penjadwalan sidang.

### 🎯 Tujuan
- Mempermudah proses bimbingan skripsi antara mahasiswa dan dosen
- Mengelola jadwal sidang tugas akhir secara terstruktur
- Menyediakan dokumentasi riwayat bimbingan yang terorganisir
- Meningkatkan efisiensi administrasi tugas akhir

---

## ✨ Fitur Utama

### 👨‍🎓 Mahasiswa
- 📊 **Dashboard** - Melihat ringkasan status tugas akhir dan timeline progres (Sempro, Semhas, Sidang).
- 📝 **Bimbingan & Revisi Dinamis** - Upload progres skripsi ke Dosen Pembimbing (fase pengerjaan) atau Dosen Penguji (fase revisi ujian) sesuai dengan status akademik yang aktif.
- 💬 **Feedback & Balasan** - Menerima feedback dari dosen serta mengirimkan komentar balasan secara interaktif.
- 📅 **Jadwal Sidang** - Melihat jadwal pelaksanaan ujian secara riil.

### 👨‍🏫 Dosen
- 📊 **Dashboard & List Mahasiswa** - Melihat daftar bimbingan (sebagai pembimbing) dan pengujian (sebagai penguji) dengan pemetaan progres bimbingan/revisi yang adaptif.
- ✅ **Review & Feedback** - Memberikan feedback dengan status keputusan (Revisi, ACC, Lanjut BAB, ACC Sidang).
- 📅 **Jadwal Sidang & Pengujian** - Melihat jadwal sidang mahasiswa bimbingan maupun mahasiswa yang diuji.

### 👨‍💼 Admin
- 👥 **Manajemen User & Plotting** - CRUD data mahasiswa & dosen, serta atur plotting Dosen Pembimbing & Penguji secara terpusat melalui detail profil.
- 📊 **Monitoring Beban Kerja Dosen** - Memantau distribusi beban bimbingan dan pengujian setiap dosen untuk menjaga keseimbangan beban kerja.
- 📅 **Kelola Jadwal & Ruangan** - Penjadwalan sidang proposal, seminar hasil, dan sidang akhir mahasiswa dengan pembatasan tinggi dropdown ruangan yang bersih.
- 📥 **Export PDF** - Mengunduh berkas rekap jadwal sidang.

---

## 🔄 Alur Status Akademik & Bimbingan

Sistem mengadopsi transisi status otomatis untuk memandu mahasiswa melalui tahapan skripsi secara terstruktur:

1. **Bimbingan Awal (Pra-Sempro)**: Mahasiswa melakukan bimbingan dengan Dosen Pembimbing 1 & 2 untuk menyelesaikan proposal skripsi (BAB I - III).
2. **Penjadwalan Sidang**: Penginputan jadwal sidang oleh admin otomatis mensinkronisasikan Dosen Penguji 1 & 2 ke dalam rekam data mahasiswa.
3. **Fase Revisi (revisi_sempro / revisi_semhas / revisi_sidang)**: 
   - Akses bimbingan dengan Dosen Pembimbing dikunci sementara.
   - Mahasiswa melakukan bimbingan revisi khusus dengan Dosen Penguji 1 & 2.
   - Setelah **kedua** penguji memberikan ACC pada bimbingan revisi, status mahasiswa otomatis naik (contoh: dari `revisi_sempro` ke `bimbingan_lanjut`) dan akses bimbingan dengan Dosen Pembimbing terbuka kembali untuk bab berikutnya.
4. **Bimbingan Lanjut & Akhir**: Mahasiswa melanjutkan penyusunan tugas akhir (BAB IV - V untuk Semhas, BAB VI/Selesai untuk Sidang Akhir).

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| React | 19.2 | Library UI |
| TypeScript | 5.9 | Type-safe JavaScript |
| Vite | 7.2.5 | Build tool |
| TailwindCSS | 4.1 | Utility-first CSS |
| Redux Toolkit | 2.11 | State management |
| React Router | 7.10 | Client-side routing |
| Framer Motion | 12.23 | Animations |
| Axios | 1.13 | HTTP client |

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| Node.js | - | Runtime environment |
| Express | 5.2 | Web framework |
| MongoDB | - | NoSQL database |
| Mongoose | 9.0 | ODM for MongoDB |
| JWT | 9.0 | Authentication |
| Multer | 1.4 | File upload |
| Bcrypt | 3.0 | Password hashing |

---

## 📁 Struktur Project

```
Program_Deploy/
├── 📂 backend/
│   ├── 📂 config/         # Database configuration
│   ├── 📂 controller/     # Request handlers
│   ├── 📂 middleware/     # Auth & validation middleware
│   ├── 📂 models/         # Mongoose schemas
│   │   ├── User.js        # User model (Mahasiswa, Dosen, Admin)
│   │   ├── Bimbingan.js   # Bimbingan model
│   │   ├── Jadwal.js      # Jadwal sidang model
│   │   └── Reply.js       # Reply/feedback model
│   ├── 📂 router/         # API routes
│   ├── 📂 scripts/        # Seeder & utility scripts
│   ├── 📂 services/       # Business logic
│   ├── 📂 uploads/        # Uploaded files storage
│   ├── 📂 utils/          # Helper functions
│   ├── app.js             # Express app entry point
│   └── package.json
│
├── 📂 frontend/
│   ├── 📂 public/         # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/ # Reusable UI components
│   │   ├── 📂 pages/      # Page components
│   │   │   ├── Admin/     # Admin pages
│   │   │   ├── Bimbingan/ # Bimbingan pages
│   │   │   ├── Dashboard/ # Dashboard pages
│   │   │   ├── Jadwal/    # Jadwal pages
│   │   │   ├── Login/     # Login page
│   │   │   └── Profile/   # Profile pages
│   │   ├── 📂 store/      # Redux store & slices
│   │   ├── 📂 lib/        # Utilities
│   │   ├── App.tsx        # Main App component
│   │   └── main.tsx       # Entry point
│   └── package.json
│
├── BLACKBOX_TESTING.md    # Testing documentation
├── DEPLOYMENT_GUIDE.md    # Deployment guide
└── README.md              # This file
```

---

## 🚀 Instalasi & Menjalankan

### Prerequisites
- Node.js (v18+)
- MongoDB (local atau MongoDB Atlas)
- npm atau yarn

### 1️⃣ Clone Repository
```bash
git clone https://github.com/MunMunDyka/simta-newest.git
cd simta-newest
```

### 2️⃣ Setup Backend
```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env sesuai konfigurasi anda
# - MONGODB_URI
# - JWT_SECRET
# - PORT

# Jalankan seeder (optional)
npm run seed

# Jalankan backend
npm run dev
```

### 3️⃣ Setup Frontend
```bash
# Masuk ke folder frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env (atur VITE_API_URL)

# Jalankan frontend
npm run dev
```

### 4️⃣ Akses Aplikasi
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 🔐 Default Credentials

Setelah menjalankan seeder (`npm run seed`), gunakan kredensial berikut untuk login:

| Role | NIM/NIP | Password |
|------|---------|----------|
| Admin | `admin001` | `Ebt9BRADR6YGT7bniRETd0` |

> ⚠️ **Catatan**: 
> - Akun Dosen dan Mahasiswa harus dibuat melalui menu Admin → Manajemen User
> - Ubah password default setelah login pertama kali!

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Bimbingan
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bimbingan` | Get bimbingan list |
| POST | `/api/bimbingan` | Create bimbingan |
| PUT | `/api/bimbingan/:id` | Update bimbingan |
| POST | `/api/bimbingan/:id/reply` | Add reply |

### Jadwal
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jadwal` | Get jadwal list |
| POST | `/api/jadwal` | Create jadwal |
| PUT | `/api/jadwal/:id` | Update jadwal |
| DELETE | `/api/jadwal/:id` | Delete jadwal |

---

## 🐳 Docker Deployment

```bash
# Build dan jalankan dengan Docker Compose
docker-compose up -d

# Atau build manual
docker build -t simta-backend ./backend
docker build -t simta-frontend ./frontend
```

---

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/simta
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Testing

Lihat dokumentasi testing di file `BLACKBOX_TESTING.md` untuk detail skenario pengujian.

---

## 📖 Dokumentasi Tambahan

- 📘 [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Panduan deployment ke production
- 🧪 [Blackbox Testing](./BLACKBOX_TESTING.md) - Dokumentasi pengujian

---

## 👨‍💻 Author

**Dikembangkan untuk Tugas Akhir**

Institut Teknologi Batam (ITEBA)

---

## 📄 License

This project is licensed under the ISC License.

---

<div align="center">

**⭐ Star this repository if you find it helpful! ⭐**

Made with ❤️ for academic purposes

</div>
