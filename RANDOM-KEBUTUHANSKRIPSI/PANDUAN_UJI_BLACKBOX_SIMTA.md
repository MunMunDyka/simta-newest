# Panduan Uji Black Box SIMTA

Dokumen ini dibuat sebagai panduan uji manual untuk memastikan isi `BLACKBOX_TESTING.md` sesuai dengan perilaku website SIMTA yang ada pada kode. Struktur tabel mengikuti pola Bab 5 kating: **Skenario**, **Test Case**, **Hasil yang Diharapkan**, **Hasil yang Didapatkan**, dan **Keterangan**.

## 1. Dasar Audit

Panduan ini disusun dari audit kode berikut:

| Modul | File Acuan |
|-------|------------|
| Routing aplikasi | `frontend/src/App.tsx` |
| Login dan token | `frontend/src/pages/Login/Login.tsx`, `frontend/src/store/slices/authSlice.ts`, `backend/controller/authController.js` |
| Hak akses role | `frontend/src/components/ProtectedRoute.tsx`, `backend/middleware/authMiddleware.js`, `backend/middleware/roleMiddleware.js` |
| Manajemen user | `frontend/src/pages/Admin/ManajemenUser.tsx`, `frontend/src/pages/Admin/EditUser.tsx`, `backend/controller/userController.js`, `backend/models/User.js` |
| Bimbingan mahasiswa | `frontend/src/pages/Bimbingan/Mahasiswa/BimbinganMahasiswa.tsx`, `frontend/src/services/bimbinganService.ts`, `backend/controller/bimbinganController.js`, `backend/models/Bimbingan.js` |
| Review dosen | `frontend/src/pages/Bimbingan/Dosen/BimbinganDosen.tsx`, `frontend/src/pages/Bimbingan/Dosen/ListMahasiswaBimbingan.tsx` |
| Sempro dan surat | `frontend/src/pages/Dashboard/Mahasiswa/DashboardMhs.tsx`, `frontend/src/pages/Admin/Laporan.tsx`, `backend/controller/bimbinganController.js` |
| Kelola bimbingan admin | `frontend/src/pages/Admin/KelolaBimbingan.tsx`, `backend/controller/bimbinganController.js` |
| Jadwal sidang | `frontend/src/pages/Admin/KelolaJadwal.tsx`, `frontend/src/pages/Jadwal/JadwalSidang.tsx`, `backend/controller/jadwalController.js`, `backend/models/Jadwal.js` |
| Profil | `frontend/src/pages/Profile/ProfileMahasiswa.tsx`, `frontend/src/pages/Profile/ProfileDosen.tsx`, `backend/controller/userController.js` |

## 2. Data Uji Minimal

Siapkan data berikut sebelum pengujian:

| Data Uji | Keterangan |
|----------|------------|
| Akun Admin aktif | Digunakan untuk manajemen user, plotting dospem, laporan, dan jadwal. |
| Akun Mahasiswa aktif | Wajib memiliki NIM, nama, prodi, judul TA, dan dua dosen pembimbing. |
| Akun Dosen Pembimbing 1 aktif | Digunakan untuk review bimbingan dospem 1. |
| Akun Dosen Pembimbing 2 aktif | Digunakan untuk review bimbingan dospem 2. |
| Akun nonaktif | Digunakan untuk menguji login akun nonaktif. |
| File PDF valid kurang dari 10MB | Digunakan untuk upload bimbingan. |
| File selain PDF | Digunakan untuk validasi tipe file upload. |
| File PDF lebih dari 10MB | Digunakan untuk validasi ukuran file upload. |
| Jadwal sidang aktif | Digunakan untuk validasi bentrok ruangan, duplikat jadwal, batal, dan selesai. |

## 3. Catatan Penting Sebelum Testing

| Temuan Aktual dari Kode | Cara Memperlakukan Saat Testing |
|-------------------------|---------------------------------|
| Login dengan field kosong tidak menampilkan pesan validasi khusus. | Catat hasil valid jika sistem tetap di halaman login dan tidak memproses login. |
| ACC Sempro hanya boleh setelah minimal 5 bimbingan pada dosen pembimbing terkait. | Untuk menguji sampai siap sempro, ulangi siklus upload dan review minimal 5 kali untuk Dospem 1 dan 5 kali untuk Dospem 2. |
| Syarat siap sempro adalah minimal 5 bimbingan dan ACC Sempro dari masing-masing dosen pembimbing. | Jangan pakai aturan "cukup 5 ACC biasa"; kode memakai ACC Sempro khusus. |
| Halaman Jadwal Sidang Mahasiswa dan Dosen memakai `viewAll=true`. | Jadwal yang tampil adalah semua jadwal berstatus Terjadwal, bukan hanya jadwal user terkait. |
| Tombol Preview dan Download PDF di halaman Jadwal Sidang belum memiliki aksi klik. | Jangan diklaim sebagai fitur valid, kecuali nanti tombolnya diimplementasikan. |
| Ubah nama/email dan password pada halaman profil masih alert lokal. | Jangan diklaim tersimpan ke database; yang benar-benar tersimpan dari UI profil adalah nomor WhatsApp, dan avatar khusus halaman Dosen. |
| Reply dari UI yang jelas tersedia ada pada halaman Bimbingan Mahasiswa setelah bimbingan direview. | Jangan klaim reply Dosen dari UI kecuali sudah ada form khusus di halaman Dosen. |

## 4. Format Pengisian Hasil

Gunakan format berikut saat mengisi kolom hasil:

| Keterangan | Arti |
|------------|------|
| Valid | Hasil aktual sama dengan hasil yang diharapkan. |
| Tidak Valid | Hasil aktual berbeda dari hasil yang diharapkan. |
| Perlu Perbaikan | Fitur ada, tetapi masih tidak sesuai rancangan Bab IV atau belum lengkap di UI. |
| Tidak Diuji | Skenario belum sempat diuji atau data uji belum tersedia. |

## 5. Checklist Pengujian Manual

### 5.1 Login dan Hak Akses

| No | Skenario | Test Case | Langkah Uji | Hasil yang Diharapkan Berdasarkan Kode | Hasil yang Didapatkan | Keterangan |
|----|----------|-----------|-------------|----------------------------------------|-----------------------|------------|
| 1 | Login field kosong. | Login kosong | Buka halaman login, kosongkan NIM/NIP atau password, klik Login. | Sistem tetap di halaman login dan tidak memproses login. | | |
| 2 | Login Admin berhasil. | Login Admin | Isi kredensial Admin aktif, klik Login. | Muncul pesan login berhasil dan diarahkan ke `/admin/dashboard`. | | |
| 3 | Login Dosen berhasil. | Login Dosen | Isi kredensial Dosen aktif, klik Login. | Muncul pesan login berhasil dan diarahkan ke `/dashboard/dosen`. | | |
| 4 | Login Mahasiswa berhasil. | Login Mahasiswa | Isi kredensial Mahasiswa aktif, klik Login. | Muncul pesan login berhasil dan diarahkan ke `/dashboard/mahasiswa`. | | |
| 5 | NIM/NIP tidak terdaftar. | Login gagal user | Isi NIM/NIP tidak terdaftar dan password bebas. | Sistem menampilkan pesan user tidak ditemukan. | | |
| 6 | Password salah. | Login gagal password | Isi NIM/NIP terdaftar dengan password salah. | Sistem menampilkan pesan password salah. | | |
| 7 | Akun nonaktif login. | Login akun nonaktif | Login memakai akun yang sudah dinonaktifkan Admin. | Sistem menampilkan pesan akun tidak aktif. | | |
| 8 | User belum login membuka halaman terlindungi. | Protected route | Logout, lalu akses `/admin/dashboard` langsung dari URL. | Sistem mengarahkan ke halaman login. | | |
| 9 | Mahasiswa membuka URL Admin. | Role redirect | Login Mahasiswa, lalu akses `/admin/users`. | Sistem mengarahkan Mahasiswa ke dashboard role-nya. | | |

### 5.2 Manajemen User dan Plotting Dosen

| No | Skenario | Test Case | Langkah Uji | Hasil yang Diharapkan Berdasarkan Kode | Hasil yang Didapatkan | Keterangan |
|----|----------|-----------|-------------|----------------------------------------|-----------------------|------------|
| 10 | Tambah Mahasiswa valid. | Create Mahasiswa | Login Admin, buka Manajemen User, tambah user role Mahasiswa dengan data lengkap. | User tersimpan dan muncul alert `User berhasil ditambahkan!`. | | |
| 11 | Tambah Dosen valid. | Create Dosen | Tambah user role Dosen dengan NIM/NIP, nama, email, dan password valid. | User tersimpan dan muncul alert berhasil. | | |
| 12 | Tambah user field wajib kosong. | Validasi form user | Kosongkan NIM/NIP, nama, atau password, lalu simpan. | Sistem menolak dan menampilkan alert gagal menambahkan user. | | |
| 13 | Password kurang dari 6 karakter. | Validasi password | Isi password kurang dari 6 karakter, lalu simpan. | Sistem menolak karena password minimal 6 karakter. | | |
| 14 | NIM/NIP duplikat. | Validasi duplikat | Tambah user dengan NIM/NIP yang sudah ada. | Sistem menolak dan menampilkan pesan NIM/NIP sudah terdaftar. | | |
| 15 | Pencarian user. | Search user | Masukkan nama atau NIM/NIP pada kolom pencarian. | Daftar user terfilter sesuai kata kunci. | | |
| 16 | Filter role user. | Filter role | Pilih filter Mahasiswa, Dosen, atau Admin. | Daftar user tampil sesuai role yang dipilih. | | |
| 17 | Edit data user. | Edit user | Buka detail user, klik edit, ubah data, lalu simpan. | Sistem menyimpan perubahan dan menampilkan alert `Data berhasil disimpan!`. | | |
| 18 | Assign dua dosen berbeda. | Assign dospem valid | Pilih Dospem 1 dan Dospem 2 yang berbeda untuk Mahasiswa. | Sistem menyimpan dospem dan menampilkan alert berhasil. | | |
| 19 | Assign dospem sama. | Validasi dospem sama | Pilih dosen yang sama untuk Dospem 1 dan Dospem 2. | Sistem menolak dan menampilkan pesan dosen pembimbing tidak boleh sama. | | |
| 20 | Reset password user. | Reset password | Buka detail Mahasiswa atau Dosen, isi password baru, klik Reset. | Sistem menyimpan password baru dan menampilkan alert password berhasil direset. | | |
| 21 | Nonaktifkan user. | Soft delete | Klik opsi nonaktifkan pada user non-admin. | Status user menjadi nonaktif dan user tidak dapat login. | | |
| 22 | Hapus permanen user. | Permanent delete | Klik hapus permanen pada user non-admin. | User terhapus permanen dari daftar. | | |

### 5.3 Bimbingan Mahasiswa

| No | Skenario | Test Case | Langkah Uji | Hasil yang Diharapkan Berdasarkan Kode | Hasil yang Didapatkan | Keterangan |
|----|----------|-----------|-------------|----------------------------------------|-----------------------|------------|
| 23 | Upload PDF valid ke Dospem 1. | Upload bimbingan | Login Mahasiswa, buka Bimbingan, pilih Dospem 1, isi judul, pilih PDF, submit. | Bimbingan tersimpan dengan status Menunggu dan tampil di riwayat. | | |
| 24 | Upload PDF valid ke Dospem 2. | Upload bimbingan dospem 2 | Pilih tab Dospem 2, isi judul, pilih PDF, submit. | Bimbingan tersimpan untuk Dospem 2 dengan status Menunggu. | | |
| 25 | Form upload kosong. | Validasi form | Kosongkan judul atau file, klik submit. | Sistem menampilkan pesan bahwa judul dan file harus dilengkapi. | | |
| 26 | File selain PDF. | Validasi tipe file | Pilih file `.docx`, `.png`, atau selain PDF. | Sistem menolak file dan menampilkan pesan hanya PDF yang diperbolehkan. | | |
| 27 | File PDF lebih dari 10MB. | Validasi ukuran | Upload PDF lebih dari 10MB. | Sistem menolak upload karena ukuran file terlalu besar. | | |
| 28 | Upload lagi saat status terakhir Menunggu. | Validasi antrian | Setelah upload ke dosen yang sama, coba submit bimbingan baru sebelum direview. | Form dinonaktifkan atau sistem menolak karena masih ada bimbingan menunggu review. | | |
| 29 | Riwayat per dospem. | Tab riwayat | Pindah tab Dospem 1 dan Dospem 2. | Riwayat berubah sesuai dosen pembimbing yang dipilih. | | |
| 30 | Download file bimbingan. | Download dokumen | Klik download pada riwayat bimbingan. | File PDF bimbingan terunduh. | | |
| 31 | Reply setelah bimbingan direview. | Reply mahasiswa | Setelah dosen memberi feedback, isi reply pada riwayat, lalu kirim. | Reply tersimpan dan muncul pada diskusi bimbingan. | | |

### 5.4 Review Bimbingan Dosen

| No | Skenario | Test Case | Langkah Uji | Hasil yang Diharapkan Berdasarkan Kode | Hasil yang Didapatkan | Keterangan |
|----|----------|-----------|-------------|----------------------------------------|-----------------------|------------|
| 32 | Dosen melihat daftar mahasiswa. | List mahasiswa bimbingan | Login sebagai dosen pembimbing, buka Mahasiswa Bimbingan. | Sistem menampilkan mahasiswa yang memiliki bimbingan dengan dosen tersebut. | | |
| 33 | Dosen membuka detail bimbingan. | Detail review | Pilih salah satu mahasiswa pada daftar. | Sistem menampilkan dokumen, status, feedback, dan riwayat bimbingan. | | |
| 34 | Dosen download dokumen. | Download dokumen | Klik tombol download dokumen bimbingan. | File PDF yang dikirim mahasiswa terunduh. | | |
| 35 | Submit tanpa status. | Validasi status | Kosongkan status, isi feedback, lalu submit. | Sistem menampilkan alert bahwa status harus dipilih. | | |
| 36 | Submit tanpa feedback. | Validasi feedback | Pilih status, kosongkan feedback, lalu submit. | Sistem menampilkan alert bahwa feedback harus diisi. | | |
| 37 | Feedback Revisi. | Review revisi | Pilih status Revisi, isi feedback, lalu submit. | Status bimbingan berubah menjadi Revisi. | | |
| 38 | Feedback ACC. | Review ACC | Pilih status ACC, isi feedback, lalu submit. | Status bimbingan berubah menjadi ACC. | | |
| 39 | Feedback Lanjut BAB. | Review lanjut BAB | Pilih status Lanjut BAB, isi feedback, lalu submit. | Status berubah menjadi Lanjut BAB dan progress mahasiswa naik ke BAB berikutnya. | | |
| 40 | ACC Sempro sebelum 5 bimbingan. | Validasi ACC Sempro | Pada riwayat kurang dari 5 bimbingan, coba pilih ACC Sempro. | Opsi ACC Sempro tidak dapat dipilih atau backend menolak proses. | | |
| 41 | ACC Sempro setelah 5 bimbingan. | Review ACC Sempro | Setelah minimal 5 bimbingan pada dosen tersebut, pilih ACC Sempro dan submit. | Status bimbingan berubah menjadi ACC Sempro. | | |
| 42 | Bimbingan sudah direview. | Review satu kali | Buka kembali detail bimbingan yang sudah direview. | Sistem menampilkan status sudah direview dan form feedback tidak muncul lagi. | | |

### 5.5 Kesiapan Sempro dan Laporan

| No | Skenario | Test Case | Langkah Uji | Hasil yang Diharapkan Berdasarkan Kode | Hasil yang Didapatkan | Keterangan |
|----|----------|-----------|-------------|----------------------------------------|-----------------------|------------|
| 43 | Belum 5 bimbingan. | Sempro belum cukup | Login Mahasiswa dengan total bimbingan salah satu dospem kurang dari 5. | Dashboard menampilkan butuh sejumlah bimbingan lagi. | | |
| 44 | Sudah 5 bimbingan tetapi belum ACC Sempro. | Sempro belum ACC | Pastikan minimal 5 bimbingan terpenuhi, tetapi salah satu dospem belum memberi ACC Sempro. | Dashboard menampilkan belum siap karena menunggu ACC Sempro. | | |
| 45 | Siap sempro. | Sempro siap | Pastikan Dospem 1 dan 2 masing-masing punya minimal 5 bimbingan dan ACC Sempro. | Dashboard menampilkan status siap sempro. | | |
| 46 | Tombol surat sebelum siap. | Surat belum tampil | Buka dashboard Mahasiswa sebelum syarat sempro lengkap. | Tombol download surat persetujuan sempro tidak tampil. | | |
| 47 | Download surat setelah siap. | Surat mahasiswa | Buka dashboard Mahasiswa setelah siap sempro, klik download surat. | File DOCX surat persetujuan sempro terunduh. | | |
| 48 | Admin melihat laporan progress. | Laporan admin | Login Admin, buka halaman Laporan. | Sistem menampilkan progress tiap mahasiswa, jumlah bimbingan per dospem, dan status ACC Sempro. | | |
| 49 | Filter laporan. | Filter laporan | Gunakan filter Semua, Cukup, Sebagian, atau Belum Cukup. | Data laporan berubah sesuai filter. | | |
| 50 | Admin download surat sempro. | Surat admin | Pada mahasiswa yang siap sempro, klik tombol Surat. | File DOCX surat persetujuan sempro terunduh. | | |

### 5.6 Kelola Bimbingan Admin

| No | Skenario | Test Case | Langkah Uji | Hasil yang Diharapkan Berdasarkan Kode | Hasil yang Didapatkan | Keterangan |
|----|----------|-----------|-------------|----------------------------------------|-----------------------|------------|
| 51 | Admin membuka Kelola Bimbingan. | Daftar mahasiswa | Login Admin, buka Kelola Bimbingan. | Sistem menampilkan daftar mahasiswa. | | |
| 52 | Admin memilih mahasiswa. | Ringkasan bimbingan | Pilih mahasiswa dari daftar. | Sistem menampilkan data mahasiswa, dospem, statistik status, dan riwayat bimbingan. | | |
| 53 | Admin hapus riwayat salah satu dospem. | Hapus riwayat dospem | Pilih scope Dospem 1 atau Dospem 2, konfirmasi hapus. | Sistem menghapus bimbingan, reply, dan file sesuai scope. | | |
| 54 | Admin hapus semua riwayat dan reset progress. | Hapus dan reset | Pilih semua dospem dan centang reset progress. | Semua riwayat bimbingan terhapus dan progress kembali ke BAB I. | | |

### 5.7 Kelola Jadwal Sidang Admin

| No | Skenario | Test Case | Langkah Uji | Hasil yang Diharapkan Berdasarkan Kode | Hasil yang Didapatkan | Keterangan |
|----|----------|-----------|-------------|----------------------------------------|-----------------------|------------|
| 55 | Buat jadwal valid. | Tambah jadwal | Login Admin, buka Kelola Jadwal, isi mahasiswa, jenis, tanggal, waktu mulai, ruangan, dan penguji, lalu simpan. | Jadwal tersimpan dengan status Terjadwal. | | |
| 56 | Field wajib kosong. | Validasi jadwal | Kosongkan mahasiswa, tanggal, waktu mulai, atau ruangan. | Sistem menampilkan pesan field wajib harus dilengkapi. | | |
| 57 | Bentrok ruangan dan waktu. | Validasi bentrok | Buat jadwal kedua dengan ruangan, tanggal, dan waktu mulai yang sama. | Sistem menolak karena ruangan sudah digunakan. | | |
| 58 | Mahasiswa sudah punya jadwal aktif jenis sama. | Validasi duplikat jadwal | Buat jadwal baru dengan jenis yang sama untuk mahasiswa yang sudah punya jadwal aktif. | Sistem menolak karena mahasiswa sudah memiliki jadwal aktif. | | |
| 59 | Edit jadwal. | Edit jadwal | Ubah tanggal, waktu, ruangan, atau penguji jadwal aktif. | Sistem menyimpan perubahan dan menampilkan pesan berhasil diupdate. | | |
| 60 | Selesaikan tanpa hasil. | Validasi hasil | Klik selesai, kosongkan hasil sidang, lalu simpan. | Sistem menampilkan pesan hasil sidang harus dipilih. | | |
| 61 | Selesaikan dengan hasil. | Selesai jadwal | Pilih hasil sidang dan simpan. | Status jadwal berubah menjadi Selesai. | | |
| 62 | Batalkan tanpa alasan. | Validasi alasan | Klik batal dan kosongkan alasan. | Sistem menampilkan pesan alasan pembatalan harus diisi. | | |
| 63 | Batalkan dengan alasan. | Batal jadwal | Isi alasan pembatalan dan simpan. | Status jadwal berubah menjadi Dibatalkan. | | |
| 64 | Jadwalkan ulang jadwal batal. | Jadwal ulang | Pada jadwal dibatalkan, klik jadwalkan ulang. | Status berubah menjadi Terjadwal. | | |
| 65 | Hapus permanen jadwal aktif. | Validasi hapus aktif | Coba hapus permanen jadwal berstatus Terjadwal. | Sistem menolak dan meminta jadwal dibatalkan terlebih dahulu. | | |
| 66 | Hapus permanen jadwal batal atau selesai. | Hapus permanen | Hapus permanen jadwal Dibatalkan atau Selesai. | Jadwal terhapus permanen. | | |

### 5.8 Lihat Jadwal Sidang Mahasiswa dan Dosen

| No | Skenario | Test Case | Langkah Uji | Hasil yang Diharapkan Berdasarkan Kode | Hasil yang Didapatkan | Keterangan |
|----|----------|-----------|-------------|----------------------------------------|-----------------------|------------|
| 67 | Mahasiswa membuka Jadwal Sidang. | Lihat jadwal mahasiswa | Login Mahasiswa, buka menu Jadwal Sidang. | Sistem menampilkan semua jadwal berstatus Terjadwal yang dibuat Admin. | | |
| 68 | Dosen membuka Jadwal Sidang. | Lihat jadwal dosen | Login Dosen, buka menu Jadwal Sidang. | Sistem menampilkan semua jadwal berstatus Terjadwal yang dibuat Admin. | | |
| 69 | Tidak ada jadwal terjadwal. | Empty state jadwal | Pastikan tidak ada jadwal berstatus Terjadwal. | Sistem menampilkan pesan belum ada jadwal sidang. | | |
| 70 | Ubah tahun, gelombang, periode. | Label periode | Ubah dropdown tahun, gelombang, atau periode. | Label periode pada tampilan berubah, tetapi data tetap berasal dari jadwal Terjadwal. | | |
| 71 | Klik Preview atau Download PDF. | Tombol belum aktif | Klik tombol Preview atau Download PDF pada halaman Jadwal Sidang. | Tidak ada proses preview atau download karena tombol belum memiliki handler. Catat sebagai Perlu Perbaikan bila fitur diklaim. | | |

### 5.9 Profil dan Logout

| No | Skenario | Test Case | Langkah Uji | Hasil yang Diharapkan Berdasarkan Kode | Hasil yang Didapatkan | Keterangan |
|----|----------|-----------|-------------|----------------------------------------|-----------------------|------------|
| 72 | User membuka profil. | Lihat profil | Login Mahasiswa atau Dosen, buka halaman Profile. | Sistem menampilkan data profil user. | | |
| 73 | Update WhatsApp kosong. | Validasi WhatsApp | Kosongkan nomor WhatsApp dan klik Update WhatsApp. | Sistem menampilkan pesan nomor WhatsApp tidak boleh kosong. | | |
| 74 | Update WhatsApp valid. | Update WhatsApp | Isi nomor WhatsApp, klik Update WhatsApp, lalu refresh data. | Nomor WhatsApp tersimpan melalui API profil. | | |
| 75 | Dosen upload avatar valid. | Upload avatar | Login Dosen, buka Profile, upload file gambar valid kurang dari 5MB. | Avatar terupload dan foto profil berubah. | | |
| 76 | Dosen upload avatar invalid. | Validasi avatar | Upload file bukan gambar atau file gambar lebih dari 5MB. | Sistem menolak file dan menampilkan pesan validasi. | | |
| 77 | Mahasiswa klik tombol kamera avatar. | Avatar mahasiswa | Login Mahasiswa, buka Profile, klik tombol kamera avatar. | Tidak ada upload berjalan karena input upload belum tersambung pada halaman Mahasiswa. | | |
| 78 | Ubah nama/email profil. | Info profil belum persist | Ubah nama atau email lalu simpan, kemudian refresh atau login ulang. | Alert berhasil muncul, tetapi perubahan tidak terverifikasi tersimpan ke API. Catat sebagai Perlu Perbaikan bila fitur diklaim. | | |
| 79 | Ubah password profil. | Password profil belum persist | Isi password lama, password baru, konfirmasi, lalu simpan. | Alert berhasil muncul jika konfirmasi cocok, tetapi perubahan belum dikirim ke API. Catat sebagai Perlu Perbaikan bila fitur diklaim. | | |
| 80 | Logout. | Logout | Klik Logout dari menu user. | Sesi dihapus dan user diarahkan ke halaman login. | | |

### 5.10 Notifikasi WhatsApp dan Responsif

| No | Skenario | Test Case | Langkah Uji | Hasil yang Diharapkan Berdasarkan Kode | Hasil yang Didapatkan | Keterangan |
|----|----------|-----------|-------------|----------------------------------------|-----------------------|------------|
| 81 | Upload bimbingan memicu notifikasi. | Notifikasi upload | Mahasiswa upload bimbingan baru. | Bimbingan tetap tersimpan; jika konfigurasi WhatsApp aktif, dosen menerima notifikasi. | | |
| 82 | Feedback dosen memicu notifikasi. | Notifikasi feedback | Dosen memberi feedback bimbingan. | Feedback tetap tersimpan; jika konfigurasi WhatsApp aktif, mahasiswa menerima notifikasi. | | |
| 83 | Buat jadwal memicu notifikasi. | Notifikasi jadwal | Admin membuat jadwal sidang. | Jadwal tetap tersimpan; jika konfigurasi WhatsApp aktif, pihak terkait menerima notifikasi. | | |
| 84 | WhatsApp gagal atau nonaktif. | Fallback notifikasi | Matikan konfigurasi WhatsApp atau gunakan nomor tidak valid, lalu jalankan proses utama. | Proses utama tetap berhasil walaupun notifikasi gagal. | | |
| 85 | Tampilan mobile login dan dashboard. | Responsif halaman utama | Buka aplikasi pada viewport mobile. | Login dan dashboard tetap dapat digunakan. | | |
| 86 | Tampilan mobile tabel dan bimbingan. | Responsif tabel dan form | Buka tabel user, jadwal, laporan, dan form bimbingan pada viewport mobile. | Konten tetap terbaca melalui layout responsif atau scroll. | | |

## 6. Ringkasan Hasil Manual

Isi tabel ini setelah semua skenario diuji.

| Modul | Jumlah Skenario | Valid | Tidak Valid | Perlu Perbaikan | Tidak Diuji |
|-------|-----------------|-------|-------------|-----------------|------------|
| Login dan Hak Akses | 9 | | | | |
| Manajemen User dan Plotting Dosen | 13 | | | | |
| Bimbingan Mahasiswa | 9 | | | | |
| Review Bimbingan Dosen | 11 | | | | |
| Kesiapan Sempro dan Laporan | 8 | | | | |
| Kelola Bimbingan Admin | 4 | | | | |
| Kelola Jadwal Sidang Admin | 12 | | | | |
| Lihat Jadwal Sidang | 5 | | | | |
| Profil dan Logout | 9 | | | | |
| Notifikasi WhatsApp dan Responsif | 6 | | | | |
| **Total** | **86** | | | | |

## 7. Catatan Sinkronisasi Bab IV

Gunakan catatan berikut saat menyesuaikan Bab IV dan Bab V:

| Bagian | Catatan |
|--------|---------|
| Status bimbingan | Bab IV perlu menyebut status `acc_sempro` karena kode sudah memakainya untuk kelayakan sempro. |
| Aturan sempro | Bab IV perlu menyebut minimal 5 bimbingan dan ACC Sempro dari masing-masing dosen pembimbing. |
| Surat sempro | Jika dimasukkan ke Bab V, Bab IV perlu menambahkan generate surat sempro pada kebutuhan fungsional atau use case. |
| Jadwal sidang | Bab IV perlu menyebut status `dibatalkan` dan proses jadwal ulang jika fitur ini tetap diuji. |
| Jadwal untuk Mahasiswa dan Dosen | Implementasi saat ini menampilkan semua jadwal terjadwal, bukan jadwal personal. Sesuaikan narasi Bab IV atau ubah implementasi jika rancangan harus personal. |
| Profil | Jangan jadikan ubah nama/email dan password sebagai fitur valid utama sebelum UI disambungkan ke API. |
