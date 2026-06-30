# Audit Fitur Real SIMTA untuk Bab 4

Tanggal audit: 3 Juni 2026  
Project: SIMTA - Sistem Informasi Manajemen Tugas Akhir  
Scope audit: frontend React TypeScript, backend Node.js/Express, MongoDB/Mongoose, autentikasi JWT, upload file, notifikasi, dan role-based access.

> Catatan: dokumen ini dibuat berdasarkan struktur kode yang ada. Audit ini tidak mengarang fitur yang tidak ditemukan di kode.

## Daftar Isi

1. [A. Ringkasan Fitur Real Sistem](#a-ringkasan-fitur-real-sistem)
2. [B. Tabel Fitur Per Role](#b-tabel-fitur-per-role)
3. [C. Tabel Endpoint API](#c-tabel-endpoint-api)
4. [D. Tabel Model/Collection Database](#d-tabel-modelcollection-database)
5. [E. Flow Utama Sistem](#e-flow-utama-sistem)
6. [F. Fitur yang Belum Konsisten atau Belum Lengkap](#f-fitur-yang-belum-konsisten-atau-belum-lengkap)
7. [G. Rekomendasi Revisi Bab 4](#g-rekomendasi-revisi-bab-4)
8. [H. Prioritas Revisi](#h-prioritas-revisi)

---

## A. Ringkasan Fitur Real Sistem

SIMTA adalah aplikasi web manajemen tugas akhir dengan tiga role utama:

- Admin
- Dosen Pembimbing
- Mahasiswa

Berdasarkan kode yang ada, fitur utama yang sudah tersedia adalah:

- Login dan autentikasi menggunakan JWT.
- Role-based access control untuk Admin, Dosen, dan Mahasiswa.
- Manajemen user oleh Admin.
- Assign dosen pembimbing 1 dan dosen pembimbing 2.
- Dashboard Mahasiswa untuk melihat progress, status dospem, total bimbingan, dan syarat maju.
- Upload dokumen bimbingan PDF oleh Mahasiswa.
- Riwayat bimbingan per dosen pembimbing.
- Review bimbingan oleh Dosen.
- Feedback/status bimbingan oleh Dosen.
- Reply atau balasan bimbingan.
- Dashboard Dosen untuk melihat mahasiswa bimbingan.
- Manajemen jadwal sidang oleh Admin.
- Jadwal sidang dapat dilihat sesuai role.
- Laporan progress bimbingan untuk Admin.
- Generate surat persetujuan sempro dalam format DOCX.
- Profil user untuk mengubah email/WhatsApp.
- Notifikasi email dan WhatsApp melalui service backend, tergantung konfigurasi environment.

Catatan penting:

- Export PDF jadwal sidang belum ditemukan sebagai endpoint backend khusus.
- Yang tersedia jelas di backend adalah generate surat sempro dalam format DOCX.
- Email dan WhatsApp bersifat opsional/terkonfigurasi dan tidak menghentikan proses utama jika gagal.
- Istilah "Sempro" dan "Sidang" masih belum sepenuhnya konsisten antara UI dan backend.

---

## B. Tabel Fitur Per Role

| Nama Fitur | Role | Halaman Frontend | Endpoint Backend | Model/Collection | Status | Catatan |
|---|---|---|---|---|---|---|
| Login | Admin, Dosen, Mahasiswa | `Login.tsx` | `POST /api/auth/login` | `User` | Sudah ada | Login menggunakan username/NIM/NIP dan password |
| Logout | Admin, Dosen, Mahasiswa | Auth service | `POST /api/auth/logout` | - | Sudah ada | Token dibersihkan di sisi client |
| Ambil data user login | Admin, Dosen, Mahasiswa | Protected route/store | `GET /api/auth/me` | `User` | Sudah ada | Dipakai validasi session |
| Refresh token | Admin, Dosen, Mahasiswa | Auth service | `POST /api/auth/refresh` | `User` | Sudah ada | Untuk memperpanjang access token |
| Ganti password | Admin, Dosen, Mahasiswa | Service tersedia | `PUT /api/auth/change-password` | `User` | Backend ada, UI belum jelas | Endpoint tersedia di backend |
| Update profil | Dosen, Mahasiswa | `ProfileDosen`, `ProfileMahasiswa` | `PUT /api/users/profile` | `User` | Sudah ada | Update nama/email/WhatsApp |
| Upload avatar | Dosen | `ProfileDosen` | `POST /api/users/upload-avatar` | `User` | Sebagian ada | Endpoint bisa untuk user login, UI mahasiswa belum jelas |
| Dashboard Mahasiswa | Mahasiswa | `DashboardMhs.tsx` | `GET /api/auth/me`, `GET /api/bimbingan`, `GET /api/bimbingan/sempro-status/:mahasiswaId` | `User`, `Bimbingan` | Sudah ada | Menampilkan progress, status dospem, dan total bimbingan |
| Upload bimbingan PDF | Mahasiswa | `BimbinganMahasiswa.tsx` | `POST /api/bimbingan` | `Bimbingan` | Sudah ada | Upload ke dospem 1 atau dospem 2 |
| Riwayat bimbingan | Mahasiswa, Dosen, Admin | Halaman bimbingan | `GET /api/bimbingan` | `Bimbingan` | Sudah ada | Filter sesuai role dan dosenType |
| Detail bimbingan | Mahasiswa, Dosen, Admin | Halaman bimbingan/detail | `GET /api/bimbingan/:id` | `Bimbingan`, `Reply` | Sudah ada | Mengambil detail bimbingan dan reply |
| Download file bimbingan | Mahasiswa, Dosen, Admin | Halaman bimbingan/review | `GET /api/bimbingan/download/:id` | `Bimbingan` | Sudah ada | Berhasil jika file masih tersedia di server |
| Feedback bimbingan | Dosen | `BimbinganDosen.tsx` | `PUT /api/bimbingan/:id/feedback` | `Bimbingan` | Sudah ada | Status: revisi, acc, lanjut bab, acc sempro |
| Upload file feedback | Dosen | `BimbinganDosen.tsx` | `PUT /api/bimbingan/:id/feedback` | `Bimbingan` | Sudah ada | File feedback PDF opsional |
| Reply bimbingan | Mahasiswa, Dosen | `BimbinganMahasiswa.tsx` | `POST /api/bimbingan/:id/reply` | `Reply` | Sebagian ada | UI mahasiswa jelas, UI reply dosen belum jelas |
| Daftar mahasiswa bimbingan | Dosen | Dashboard/List Dosen | `GET /api/users/mahasiswa-bimbingan` | `User`, `Bimbingan` | Sudah ada | Menampilkan mahasiswa yang dibimbing dosen |
| Dashboard Dosen | Dosen | `DashboardDosen.tsx` | `GET /api/users/mahasiswa-bimbingan` | `User`, `Bimbingan` | Sudah ada | Menampilkan ringkasan mahasiswa bimbingan |
| Manajemen user | Admin | `ManajemenUser` | `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id` | `User` | Sudah ada | CRUD user oleh admin |
| Hapus user permanen | Admin | Detail user admin | `DELETE /api/users/:id/permanent` | `User` | Sudah ada | Hard delete user |
| Assign dospem | Admin | Admin user pages | `PUT /api/users/:id/assign-dospem` | `User` | Sudah ada | Assign dospem 1 dan dospem 2 |
| Reset password user | Admin | Detail user admin | `PUT /api/users/:id/reset-password` | `User` | Sudah ada | Admin dapat reset password |
| Kelola riwayat bimbingan | Admin | `KelolaBimbingan` | `GET /api/bimbingan/admin/mahasiswa/:mahasiswaId`, `DELETE /api/bimbingan/admin/clear/:mahasiswaId` | `Bimbingan`, `Reply`, `User` | Sudah ada | Termasuk reset progress |
| Laporan progress | Admin | `Laporan.tsx` | `GET /api/bimbingan/admin/progress-report` | `User`, `Bimbingan` | Sudah ada | Laporan progress bimbingan mahasiswa |
| Generate surat sempro | Mahasiswa, Admin | Dashboard/Laporan | `GET /api/bimbingan/generate-surat-sempro/:mahasiswaId` | `User`, `Bimbingan` | Sudah ada | Format DOCX |
| Kelola jadwal sidang | Admin | `KelolaJadwal` | `POST /api/jadwal`, `PUT /api/jadwal/:id`, `DELETE /api/jadwal/:id` | `Jadwal` | Sudah ada | CRUD jadwal oleh admin |
| Lihat jadwal sidang | Admin, Dosen, Mahasiswa | `JadwalSidang` | `GET /api/jadwal` | `Jadwal` | Sudah ada | Data difilter sesuai role |
| Statistik jadwal | Admin | Dashboard/Kelola Jadwal | `GET /api/jadwal/statistics` | `Jadwal` | Sudah ada | Statistik jadwal admin |
| Export PDF jadwal | Admin/User | UI jadwal | Tidak ditemukan endpoint khusus | `Jadwal` | Sebagian ada | Backend PDF export jadwal belum ditemukan |
| Notifikasi email | Backend | Tidak ada halaman konfigurasi khusus | Service dipanggil controller | `User` | Sudah ada | Provider: Resend, SMTP, Gmail API |
| Notifikasi WhatsApp | Backend | Tidak ada halaman konfigurasi khusus | Service dipanggil controller | `User` | Sudah ada | Provider tergantung environment |

---

## C. Tabel Endpoint API

### Auth

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| POST | `/api/auth/login` | Login user dan menghasilkan token | Public |
| POST | `/api/auth/logout` | Logout user | Authenticated |
| GET | `/api/auth/me` | Ambil data user yang sedang login | Authenticated |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| PUT | `/api/auth/change-password` | Ganti password user | Authenticated |

### Users

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| GET | `/api/users/statistics` | Statistik jumlah user | Admin |
| GET | `/api/users/dosen` | Ambil daftar dosen | Admin |
| GET | `/api/users/mahasiswa-bimbingan` | Ambil mahasiswa bimbingan | Dosen, Admin |
| POST | `/api/users/upload-avatar` | Upload avatar user login | Authenticated |
| PUT | `/api/users/profile` | Update profil user login | Authenticated |
| GET | `/api/users` | List user dengan filter/pagination | Admin |
| GET | `/api/users/:id` | Detail user | Admin/Self/Dosen terkait |
| POST | `/api/users` | Tambah user baru | Admin |
| PUT | `/api/users/:id` | Update user | Admin/Self terbatas |
| DELETE | `/api/users/:id` | Nonaktifkan user | Admin |
| DELETE | `/api/users/:id/permanent` | Hapus user permanen | Admin |
| PUT | `/api/users/:id/assign-dospem` | Assign dospem ke mahasiswa | Admin |
| PUT | `/api/users/:id/reset-password` | Reset password user | Admin |

### Bimbingan

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| GET | `/api/bimbingan` | List bimbingan sesuai role/filter | Authenticated |
| GET | `/api/bimbingan/:id` | Detail bimbingan dan replies | Authenticated sesuai akses |
| POST | `/api/bimbingan` | Upload bimbingan baru | Mahasiswa |
| PUT | `/api/bimbingan/:id/feedback` | Beri feedback/status bimbingan | Dosen |
| POST | `/api/bimbingan/:id/reply` | Tambah reply pada bimbingan | Mahasiswa/Dosen terkait |
| GET | `/api/bimbingan/download/:id` | Download file bimbingan | Mahasiswa/Dosen/Admin terkait |
| GET | `/api/bimbingan/pending-count` | Hitung bimbingan menunggu review | Dosen |
| GET | `/api/bimbingan/sempro-status/:mahasiswaId` | Cek syarat minimal bimbingan dan ACC | Mahasiswa/Dosen/Admin terkait |
| GET | `/api/bimbingan/generate-surat-sempro/:mahasiswaId` | Generate surat persetujuan sempro DOCX | Mahasiswa/Admin |
| GET | `/api/bimbingan/admin/progress-report` | Laporan progress bimbingan | Admin |
| GET | `/api/bimbingan/admin/mahasiswa/:mahasiswaId` | Summary bimbingan per mahasiswa | Admin |
| DELETE | `/api/bimbingan/admin/clear/:mahasiswaId` | Hapus riwayat bimbingan dan opsional reset progress | Admin |

### Jadwal

| Method | Endpoint | Fungsi | Role |
|---|---|---|---|
| GET | `/api/jadwal` | List jadwal sesuai role | Authenticated |
| GET | `/api/jadwal/:id` | Detail jadwal | Authenticated sesuai akses |
| GET | `/api/jadwal/statistics` | Statistik jadwal | Admin |
| GET | `/api/jadwal/upcoming` | Jadwal mendatang | Authenticated |
| POST | `/api/jadwal` | Buat jadwal sidang | Admin |
| PUT | `/api/jadwal/:id` | Update jadwal, status, hasil, nilai | Admin |
| DELETE | `/api/jadwal/:id` | Batalkan jadwal | Admin |
| DELETE | `/api/jadwal/:id/permanent` | Hapus jadwal permanen | Admin |

---

## D. Tabel Model/Collection Database

| Collection | Model | Field Utama | Relasi | Catatan |
|---|---|---|---|---|
| `users` | `User` | `nim_nip`, `password`, `name`, `email`, `role`, `prodi`, `semester`, `judulTA`, `currentProgress`, `dospem_1`, `dospem_2`, `status`, `avatar`, `whatsapp` | `dospem_1` dan `dospem_2` refer ke `User` role dosen | Password di-hash dengan bcrypt |
| `bimbingans` | `Bimbingan` | `mahasiswa`, `dosen`, `dosenType`, `version`, `judul`, `catatan`, `fileName`, `filePath`, `fileSize`, `status`, `feedback`, `feedbackFile` | Refer ke `User` mahasiswa dan dosen | Status: `menunggu`, `revisi`, `acc`, `lanjut_bab`, `acc_sempro` |
| `replies` | `Reply` | `bimbingan`, `sender`, `senderRole`, `message` | Refer ke `Bimbingan` dan `User` | Untuk diskusi/balasan bimbingan |
| `jadwals` | `Jadwal` | `mahasiswa`, `jenisJadwal`, `tanggal`, `waktuMulai`, `waktuSelesai`, `ruangan`, `penguji`, `status`, `hasil`, `nilaiSidang`, `catatan`, `createdBy` | Mahasiswa dan penguji refer ke `User` | Untuk jadwal sidang proposal/skripsi |

---

## E. Flow Utama Sistem

### 1. Login dan Autentikasi

1. User membuka halaman login.
2. User memasukkan username/NIM/NIP dan password.
3. Frontend mengirim request ke `POST /api/auth/login`.
4. Backend mencari user berdasarkan `nim_nip`.
5. Backend membandingkan password dengan bcrypt.
6. Jika valid, backend mengirim data user, access token, dan refresh token.
7. Frontend menyimpan token dan mengarahkan user sesuai role:
   - Admin ke dashboard admin.
   - Dosen ke dashboard dosen.
   - Mahasiswa ke dashboard mahasiswa.

### 2. Mahasiswa Mengajukan Bimbingan

1. Mahasiswa membuka halaman bimbingan.
2. Mahasiswa memilih dosen pembimbing 1 atau 2.
3. Mahasiswa mengisi judul, catatan opsional, dan upload file PDF.
4. Frontend mengirim `POST /api/bimbingan`.
5. Backend memvalidasi role mahasiswa, dosenType, judul, dan file.
6. Backend membuat data bimbingan baru dengan versi berikutnya.
7. Backend mencoba mengirim notifikasi email/WhatsApp ke dosen.

### 3. Dosen Mereview Bimbingan

1. Dosen membuka dashboard/list mahasiswa bimbingan.
2. Dosen memilih mahasiswa.
3. Frontend mengambil list bimbingan melalui `GET /api/bimbingan?mahasiswaId=...`.
4. Dosen membuka dokumen bimbingan melalui endpoint download.
5. Dosen memberi feedback dan status melalui `PUT /api/bimbingan/:id/feedback`.
6. Backend menyimpan feedback, status, dan file feedback opsional.
7. Backend mencoba mengirim notifikasi email/WhatsApp ke mahasiswa.

### 4. Mahasiswa Membalas Feedback

1. Mahasiswa membuka riwayat bimbingan.
2. Mahasiswa melihat feedback dosen.
3. Mahasiswa mengirim reply melalui `POST /api/bimbingan/:id/reply`.
4. Backend menyimpan reply pada collection `replies`.

### 5. Admin Mengelola User

1. Admin membuka halaman manajemen user.
2. Admin dapat membuat, mengedit, menonaktifkan, menghapus permanen, dan reset password user.
3. Admin dapat assign dospem 1 dan dospem 2 untuk mahasiswa.
4. Backend memproses melalui endpoint `/api/users`.

### 6. Admin Mengelola Jadwal Sidang

1. Admin membuka halaman kelola jadwal.
2. Admin memilih mahasiswa, jenis sidang, tanggal, waktu, ruangan, dan penguji.
3. Frontend mengirim data ke `POST /api/jadwal`.
4. Backend menyimpan jadwal ke collection `jadwals`.
5. Backend mencoba mengirim notifikasi jadwal ke mahasiswa dan penguji.

### 7. Export/Generate Dokumen

- Generate surat persetujuan sempro tersedia melalui `GET /api/bimbingan/generate-surat-sempro/:mahasiswaId`.
- Format dokumen yang ditemukan adalah DOCX.
- Endpoint khusus export PDF jadwal sidang belum ditemukan di backend.

### 8. Profil Pengguna

1. Dosen/Mahasiswa membuka halaman profil.
2. User dapat mengubah data profil seperti nama, email, dan WhatsApp.
3. Dosen memiliki UI upload avatar.
4. Backend menyimpan perubahan di collection `users`.

### 9. Notifikasi Email/WhatsApp

Notifikasi dikirim pada beberapa event:

- Mahasiswa upload bimbingan baru -> notifikasi ke dosen.
- Dosen memberi feedback -> notifikasi ke mahasiswa.
- Admin membuat jadwal sidang -> notifikasi ke mahasiswa dan dosen penguji.

Jenis notifikasi:

- Email melalui service backend dengan provider Resend, SMTP, atau Gmail API.
- WhatsApp melalui service backend jika konfigurasi aktif.

Notifikasi bersifat non-blocking:

- Jika email/WhatsApp gagal, proses utama tetap disimpan di database.

---

## F. Fitur yang Belum Konsisten atau Belum Lengkap

| Fitur/Area | Kondisi | Dampak | Rekomendasi |
|---|---|---|---|
| Istilah Sempro vs Sidang | Backend masih banyak memakai istilah `sempro`, UI beberapa bagian memakai `sidang` | Bisa membingungkan saat penulisan Bab 4 | Pilih istilah konsisten atau jelaskan bahwa fitur awal bernama sempro |
| Export PDF jadwal | UI mengarah ke download/export, endpoint backend PDF jadwal tidak ditemukan | Jangan ditulis sebagai fitur backend penuh | Tulis sebagai fitur sebagian ada jika hanya client-side |
| Generate surat | Backend generate DOCX, bukan PDF | Bab 4 harus akurat | Tulis sebagai generate surat persetujuan sempro format DOCX |
| Reply dosen | Backend mendukung role dosen, UI dosen reply belum jelas | Fitur diskusi belum simetris | Tulis sebagian ada, atau lengkapi UI jika diperlukan |
| WhatsApp reminder sidang | Service memiliki fungsi reminder, tetapi route/job belum terlihat | Belum bisa disebut fitur berjalan otomatis | Tulis sebagai service tersedia, belum ada scheduler |
| Notifikasi email/WA | Tergantung konfigurasi environment dan provider | Tidak selalu terkirim di deploy | Tulis sebagai notifikasi opsional/terkonfigurasi |
| Penyimpanan file upload | File disimpan di server | Pada hosting tertentu file lokal bisa hilang | Jelaskan kebutuhan storage persistent jika deploy produksi |
| `plainPassword` di model User | Ada field demo untuk password asli | Risiko keamanan jika produksi | Jangan ditonjolkan sebagai fitur produksi |
| Profile upload avatar | Endpoint umum, UI jelas di dosen | UI mahasiswa belum jelas | Tulis sebagian ada |
| Change password | Endpoint backend ada | UI belum jelas | Tulis backend ada, UI belum jelas |

---

## G. Rekomendasi Revisi Bab 4

### Kebutuhan Fungsional Admin

Admin dapat:

1. Login ke sistem.
2. Melihat dashboard admin.
3. Mengelola data mahasiswa, dosen, dan admin.
4. Menambahkan user baru.
5. Mengubah data user.
6. Menonaktifkan user.
7. Menghapus user secara permanen.
8. Reset password user.
9. Assign dosen pembimbing 1 dan dosen pembimbing 2.
10. Melihat detail mahasiswa dan dosen.
11. Mengelola riwayat bimbingan mahasiswa.
12. Menghapus riwayat bimbingan mahasiswa.
13. Reset progress mahasiswa ke BAB tertentu.
14. Mengelola jadwal sidang.
15. Melihat laporan progress bimbingan.
16. Generate surat persetujuan sempro dalam format DOCX.

### Kebutuhan Fungsional Dosen

Dosen dapat:

1. Login ke sistem.
2. Melihat dashboard dosen.
3. Melihat daftar mahasiswa bimbingan.
4. Melihat detail mahasiswa bimbingan.
5. Melihat riwayat bimbingan mahasiswa.
6. Download dokumen bimbingan mahasiswa.
7. Memberikan feedback bimbingan.
8. Memberikan status bimbingan.
9. Upload file feedback PDF.
10. Melihat jadwal sidang yang terkait.
11. Mengubah profil, email, dan nomor WhatsApp.

### Kebutuhan Fungsional Mahasiswa

Mahasiswa dapat:

1. Login ke sistem.
2. Melihat dashboard mahasiswa.
3. Melihat progress tugas akhir.
4. Melihat status bimbingan dospem 1 dan dospem 2.
5. Upload dokumen bimbingan PDF.
6. Memilih dosen pembimbing tujuan upload.
7. Melihat riwayat bimbingan.
8. Melihat feedback dari dosen.
9. Membalas feedback bimbingan.
10. Melihat jadwal sidang.
11. Mengubah profil, email, dan nomor WhatsApp.
12. Generate surat persetujuan sempro jika syarat terpenuhi.

### Kebutuhan Non-Fungsional

1. Sistem menggunakan autentikasi JWT.
2. Sistem menerapkan role-based access control.
3. Password disimpan menggunakan hashing bcrypt.
4. Sistem menggunakan MongoDB sebagai database.
5. Backend menggunakan Express dan Mongoose.
6. Frontend menggunakan React TypeScript.
7. Upload file hanya menerima PDF.
8. Sistem melakukan validasi input di frontend dan backend.
9. Sistem menampilkan pesan error ketika input tidak valid.
10. Sistem mendukung notifikasi email/WhatsApp berdasarkan konfigurasi.
11. Sistem memiliki UI responsif.
12. Sistem membatasi akses data berdasarkan role.

### Diagram yang Perlu Ada di Bab 4

Diagram yang disarankan:

1. Use Case Diagram SIMTA.
2. Activity Diagram Login.
3. Activity Diagram Upload Bimbingan.
4. Activity Diagram Review Bimbingan Dosen.
5. Activity Diagram Kelola User Admin.
6. Activity Diagram Kelola Jadwal Sidang.
7. Sequence Diagram Upload Bimbingan sampai Notifikasi.
8. Sequence Diagram Review/Feedback Bimbingan.
9. Class Diagram atau struktur model.
10. ERD/struktur collection MongoDB.

### Struktur Database yang Perlu Dijelaskan

Collection yang wajib dijelaskan:

1. `users`
2. `bimbingans`
3. `replies`
4. `jadwals`

### Desain UI yang Wajib Dilampirkan

Tampilan UI yang sebaiknya masuk Bab 4:

1. Halaman Login.
2. Dashboard Mahasiswa.
3. Halaman Bimbingan Mahasiswa.
4. Dashboard Dosen.
5. Halaman Review Bimbingan Dosen.
6. Dashboard Admin.
7. Halaman Manajemen User Admin.
8. Halaman Kelola Bimbingan Admin.
9. Halaman Kelola Jadwal Sidang.
10. Halaman Laporan Progress.
11. Halaman Profil User.

---

## H. Prioritas Revisi

| Prioritas | Revisi | Alasan |
|---|---|---|
| 1 | Konsistenkan istilah Sempro/Sidang | Ini paling terlihat di UI, endpoint, dan narasi Bab 4 |
| 2 | Pastikan Bab 4 tidak menyebut export PDF jadwal sebagai backend penuh | Endpoint backend khusus PDF jadwal belum ditemukan |
| 3 | Jelaskan generate surat sebagai DOCX, bukan PDF | Sesuai kode backend saat ini |
| 4 | Jelaskan notifikasi email/WhatsApp sebagai fitur opsional/terkonfigurasi | Pengiriman tergantung provider dan environment |
| 5 | Tulis keterbatasan file upload pada deployment | File lokal bisa hilang jika hosting tidak persistent |
| 6 | Rapikan narasi reply bimbingan | Backend mendukung, tetapi UI dosen reply belum jelas |
| 7 | Jangan menonjolkan `plainPassword` sebagai fitur produksi | Berisiko secara keamanan |
| 8 | Jika waktu cukup, tambahkan UI change password | Backend sudah ada |
| 9 | Jika ingin fitur jadwal lebih kuat, buat export PDF jadwal backend | Saat ini belum terlihat endpointnya |
| 10 | Tambahkan scheduler reminder sidang jika ingin notifikasi otomatis | Service ada, scheduler belum terlihat |

---

## Kesimpulan Audit

Secara keseluruhan, SIMTA sudah memiliki fitur utama yang cukup untuk dijelaskan sebagai sistem manajemen tugas akhir berbasis web pada Bab 4. Fitur paling kuat dan nyata berdasarkan kode adalah:

- Autentikasi dan role-based access.
- Manajemen user oleh admin.
- Proses bimbingan mahasiswa dan dosen.
- Feedback bimbingan.
- Jadwal sidang.
- Laporan progress.
- Notifikasi email/WhatsApp berbasis konfigurasi.

Bagian yang perlu hati-hati saat penulisan Bab 4 adalah penyebutan fitur yang belum penuh, terutama export PDF jadwal, istilah sempro/sidang, notifikasi yang bergantung environment, dan penyimpanan file upload pada deployment.
