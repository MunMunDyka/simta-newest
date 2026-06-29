# Analisis Black Box Testing SIMTA untuk Bab 5

Dokumen ini disusun berdasarkan struktur kode frontend dan backend SIMTA saat ini. Fokus pengujian adalah fitur yang benar-benar tersedia di aplikasi dan relevan untuk Bab 5, terutama alur bimbingan tugas akhir berbasis role Admin, Dosen Pembimbing, dan Mahasiswa.

## 1. Daftar Fitur Utama yang Ada di Sistem

| No | Fitur | Role | UI Frontend | API Backend | Status untuk Black Box |
|---|---|---|---|---|---|
| 1 | Login dan role-based dashboard | Admin, Dosen, Mahasiswa | `Login.tsx`, `ProtectedRoute`, dashboard tiap role | `POST /api/auth/login`, `GET /api/auth/me` | Wajib |
| 2 | Dashboard Mahasiswa | Mahasiswa | `DashboardMhs.tsx` | `GET /api/bimbingan`, `GET /api/bimbingan/sempro-status/:mahasiswaId` | Wajib |
| 3 | Upload dokumen bimbingan | Mahasiswa | `BimbinganMahasiswa.tsx` | `POST /api/bimbingan` | Wajib |
| 4 | Pilih Dospem 1/Dospem 2 saat upload | Mahasiswa | `BimbinganMahasiswa.tsx` | `POST /api/bimbingan` dengan `dosenType` | Wajib |
| 5 | Riwayat bimbingan mahasiswa | Mahasiswa | `BimbinganMahasiswa.tsx` | `GET /api/bimbingan` | Wajib |
| 6 | Download file bimbingan | Mahasiswa, Dosen, Admin | `BimbinganMahasiswa.tsx`, `BimbinganDosen.tsx` | `GET /api/bimbingan/download/:id` | Wajib |
| 7 | Review/feedback bimbingan | Dosen | `BimbinganDosen.tsx` | `PUT /api/bimbingan/:id/feedback` | Wajib |
| 8 | Upload file feedback dosen | Dosen | `BimbinganDosen.tsx` | `PUT /api/bimbingan/:id/feedback` dengan `feedbackFile` | Opsional |
| 9 | Reply/diskusi komentar | Mahasiswa, Dosen | `BimbinganMahasiswa.tsx`, `BimbinganDosen.tsx` | `POST /api/bimbingan/:id/reply` | Wajib |
| 10 | Dashboard Dosen | Dosen | `DashboardDosen.tsx` | `GET /api/users/mahasiswa-bimbingan`, `GET /api/bimbingan/pending-count` | Wajib |
| 11 | Daftar mahasiswa bimbingan dosen | Dosen | `ListMahasiswaBimbingan.tsx` | `GET /api/users/mahasiswa-bimbingan` | Wajib |
| 12 | Manajemen user | Admin | `ManajemenUser.tsx`, detail/edit user | `GET/POST/PUT/DELETE /api/users` | Wajib |
| 13 | Assign Dosen Pembimbing | Admin | `ManajemenUser.tsx`, `EditUser.tsx` | `PUT /api/users/:id/assign-dospem` | Wajib |
| 14 | Kelola bimbingan mahasiswa | Admin | `KelolaBimbingan.tsx` | `GET /api/bimbingan/admin/mahasiswa/:mahasiswaId` | Wajib |
| 15 | Setting syarat sidang per mahasiswa | Admin | `KelolaBimbingan.tsx` | `GET/PUT /api/bimbingan/admin/settings/:mahasiswaId` | Opsional/demo |
| 16 | Kelola jadwal sidang | Admin | `KelolaJadwal.tsx` | `GET/POST/PUT/DELETE /api/jadwal` | Wajib |
| 17 | Lihat jadwal sidang | Admin, Dosen, Mahasiswa | `JadwalSidang.tsx` | `GET /api/jadwal`, `GET /api/jadwal/upcoming` | Wajib |
| 18 | Generate surat persetujuan sempro/sidang | Mahasiswa, Admin | `DashboardMhs.tsx`, `Laporan.tsx` | `GET /api/bimbingan/generate-surat-sempro/:mahasiswaId` | Wajib jika masuk Bab 5 |
| 19 | Laporan progres bimbingan | Admin | `Laporan.tsx` | `GET /api/bimbingan/admin/progress-report` | Opsional |
| 20 | Notifikasi email | Sistem | Tidak berupa halaman khusus | Email service dipanggil saat bimbingan, feedback, jadwal | Opsional |

## 2. Fitur Berdasarkan Role

### Admin

- Login dan masuk Dashboard Admin.
- Melihat ringkasan data user.
- Mengelola data user mahasiswa, dosen, dan admin.
- Menambah user baru.
- Mengedit data user.
- Menonaktifkan/menghapus user.
- Assign Dosen Pembimbing 1 dan Dosen Pembimbing 2.
- Melihat data bimbingan mahasiswa.
- Melihat statistik status bimbingan per dospem.
- Mengatur syarat minimal bimbingan per mahasiswa untuk kebutuhan demo.
- Mengelola jadwal sidang.
- Melihat laporan progres bimbingan.
- Generate surat persetujuan jika syarat terpenuhi.

### Dosen Pembimbing

- Login dan masuk Dashboard Dosen.
- Melihat daftar mahasiswa bimbingan.
- Melihat status/progres mahasiswa bimbingan.
- Membuka detail review bimbingan mahasiswa.
- Download dokumen bimbingan mahasiswa.
- Memberikan feedback dengan status `revisi`, `acc`, `lanjut_bab`, atau `acc_sempro`.
- Upload file feedback jika diperlukan.
- Membalas diskusi/komentar bimbingan.
- Melihat jadwal sidang yang berkaitan sebagai penguji.

### Mahasiswa

- Login dan masuk Dashboard Mahasiswa.
- Melihat progress tugas akhir.
- Melihat status bimbingan Dospem 1 dan Dospem 2.
- Memilih tujuan upload ke Dospem 1 atau Dospem 2.
- Upload dokumen PDF bimbingan.
- Melihat riwayat bimbingan.
- Melihat feedback/status dari dosen.
- Download dokumen bimbingan.
- Membalas feedback melalui fitur reply.
- Melihat jadwal sidang.
- Generate surat persetujuan sempro/sidang jika syarat terpenuhi.

## 3. Skenario Black Box Testing Per Fitur

### 3.1 Autentikasi dan Role-Based Dashboard

| Nama Fitur | Skenario Pengujian | Test Case / Aksi Pengguna | Hasil yang Diharapkan | Validasi/Error yang Mungkin Muncul | Data Dummy |
|---|---|---|---|---|---|
| Login | Login berhasil sebagai mahasiswa | Masukkan username mahasiswa dan password benar, klik Login | Sistem masuk ke Dashboard Mahasiswa | - | `2321053 / mahasiswa123` |
| Login | Login berhasil sebagai dosen | Masukkan username dosen dan password benar, klik Login | Sistem masuk ke Dashboard Dosen | - | `DOSEN001 / dosen123` |
| Login | Login berhasil sebagai admin | Masukkan username admin dan password benar, klik Login | Sistem masuk ke Dashboard Admin | - | `admin001 / admin123` |
| Login | Password salah | Masukkan username benar dan password salah | Sistem menampilkan pesan gagal login | `Login gagal. Password yang Anda masukkan salah` atau pesan dari API | User valid + password salah |
| Login | Username tidak ditemukan | Masukkan username yang tidak terdaftar | Sistem menampilkan pesan user tidak ditemukan | `User dengan username ... tidak ditemukan` | `999999 / bebas` |
| Login | Field kosong | Klik Login tanpa isi username/password | Sistem menampilkan validasi pada form | `Username wajib diisi`, `Password wajib diisi` | - |
| Role access | Mahasiswa akses halaman admin | Login mahasiswa lalu akses `/admin/dashboard` | Sistem menolak akses atau redirect | Unauthorized/redirect | Akun mahasiswa |
| Logout | Logout dari akun aktif | Klik menu logout | Token/session dihapus dan kembali ke login | - | Akun aktif |

### 3.2 Dashboard Mahasiswa

| Nama Fitur | Skenario Pengujian | Test Case / Aksi Pengguna | Hasil yang Diharapkan | Validasi/Error yang Mungkin Muncul | Data Dummy |
|---|---|---|---|---|---|
| Dashboard Mahasiswa | Menampilkan data mahasiswa | Login mahasiswa, buka dashboard | Nama, NIM, prodi, semester, judul TA, progress tampil | Gagal memuat data jika API error | Mahasiswa aktif |
| Status bimbingan | Menampilkan status Dospem 1 dan 2 | Buka Dashboard Mahasiswa | Kartu Dospem 1/Dospem 2 menampilkan jumlah bimbingan dan status | Status kosong jika belum ada bimbingan | Mahasiswa dengan dospem |
| Status syarat sidang | Syarat belum terpenuhi | Mahasiswa belum memenuhi minimal bimbingan/ACC | Sistem menampilkan belum siap maju sidang | - | Mahasiswa dengan bimbingan kurang |
| Status syarat sidang | Syarat terpenuhi | Mahasiswa punya minimal bimbingan dan ACC dari kedua dospem | Tombol generate surat tampil | - | Mahasiswa siap sidang |

### 3.3 Upload Dokumen Bimbingan Mahasiswa

| Nama Fitur | Skenario Pengujian | Test Case / Aksi Pengguna | Hasil yang Diharapkan | Validasi/Error yang Mungkin Muncul | Data Dummy |
|---|---|---|---|---|---|
| Upload bimbingan | Upload berhasil ke Dospem 1 | Pilih tab Dospem 1, isi judul, upload PDF, klik Kirim | Data bimbingan tersimpan, status `menunggu`, riwayat bertambah | - | File PDF < 10 MB |
| Upload bimbingan | Upload berhasil ke Dospem 2 | Pilih tab Dospem 2, isi judul, upload PDF, klik Kirim | Data masuk ke riwayat Dospem 2 | - | File PDF < 10 MB |
| Validasi judul | Judul kosong | Kosongkan judul, upload PDF, klik Kirim | Sistem menolak submit | `Judul bimbingan wajib diisi` / `Mohon lengkapi judul dan file` | PDF valid |
| Validasi judul | Judul terlalu pendek | Isi judul kurang dari 5 karakter | Sistem menolak submit | `Judul harus 5-200 karakter` | Judul `BAB` |
| Validasi file | Tidak upload file | Isi judul tanpa memilih file | Sistem menolak submit | `File PDF wajib diunggah` | Judul valid |
| Validasi file | Upload non-PDF | Pilih file `.docx`/gambar | Sistem menolak file | `File harus berformat PDF` / `Hanya file PDF yang diperbolehkan` | File non-PDF |
| Validasi file | File terlalu besar | Upload PDF melebihi batas | Sistem menolak upload | Batas file dari backend `MAX_FILE_SIZE`, default 10 MB | PDF > 10 MB |
| Pending bimbingan | Mengirim saat masih ada status menunggu | Upload lagi ke dospem yang sama saat bimbingan terakhir masih menunggu | Sistem menolak atau mencegah pengiriman baru sesuai logic backend/UI | Pesan pending bimbingan jika ada | Mahasiswa dengan status menunggu |

### 3.4 Riwayat Bimbingan Mahasiswa

| Nama Fitur | Skenario Pengujian | Test Case / Aksi Pengguna | Hasil yang Diharapkan | Validasi/Error yang Mungkin Muncul | Data Dummy |
|---|---|---|---|---|---|
| Riwayat bimbingan | Riwayat tampil | Buka halaman Bimbingan Mahasiswa | List versi V1, V2, judul, file, status tampil | Data kosong jika belum pernah upload | Mahasiswa dengan riwayat |
| Filter Dospem | Pindah tab Dospem 1/Dospem 2 | Klik tab masing-masing dospem | Riwayat yang tampil sesuai dospem yang dipilih | - | Riwayat di dua dospem |
| Detail feedback | Melihat detail feedback | Buka/expand item riwayat | Feedback dosen, status, dan reply tampil | - | Bimbingan sudah direview |
| Download file | Download file dari riwayat | Klik download file | File PDF terunduh | `File tidak ditemukan di server` jika file tidak ada di storage | Bimbingan dengan file valid |

### 3.5 Review dan Feedback Bimbingan Dosen

| Nama Fitur | Skenario Pengujian | Test Case / Aksi Pengguna | Hasil yang Diharapkan | Validasi/Error yang Mungkin Muncul | Data Dummy |
|---|---|---|---|---|---|
| Dashboard Dosen | Menampilkan daftar mahasiswa | Login dosen, buka dashboard | Statistik dan tabel mahasiswa bimbingan tampil | Data kosong jika belum ada mahasiswa | Dosen dengan mahasiswa bimbingan |
| List mahasiswa | Mencari mahasiswa bimbingan | Ketik nama/NIM pada halaman mahasiswa bimbingan | List terfilter sesuai keyword | - | Beberapa mahasiswa |
| Detail review | Membuka detail bimbingan | Klik Detail/Lihat pada mahasiswa | Halaman Review Bimbingan tampil | Mahasiswa tidak ditemukan jika ID salah | Mahasiswa punya bimbingan |
| Download dokumen | Dosen download dokumen mahasiswa | Klik Download File | Dokumen PDF terunduh | `File tidak ditemukan di server` jika file hilang | Bimbingan dengan file valid |
| Feedback revisi | Dosen memberi status Revisi | Isi feedback minimal 5 karakter, pilih Revisi, submit | Status berubah menjadi `revisi`, feedback tersimpan | `Feedback wajib diisi`, `Feedback harus 5-2000 karakter` | Bimbingan status menunggu |
| Feedback ACC | Dosen memberi status ACC | Isi feedback, pilih ACC, submit | Status berubah menjadi `acc` | Validasi feedback jika kosong/pendek | Bimbingan status menunggu |
| Feedback lanjut BAB | Dosen pilih Lanjut BAB | Isi feedback, pilih Lanjut BAB, submit | Status berubah `lanjut_bab`, progress mahasiswa naik jika sesuai logic backend | Validasi status/feedback | Bimbingan menunggu |
| Feedback ACC Sempro | Dosen pilih ACC Sempro | Isi feedback, pilih ACC Sempro, submit | Status berubah `acc_sempro` jika syarat minimal bimbingan terpenuhi | Jika belum cukup bimbingan, sistem menolak | Mahasiswa cukup bimbingan |
| Upload file feedback | Dosen upload lampiran feedback | Pilih file saat feedback, submit | File feedback tersimpan di data bimbingan | File harus PDF dan ukuran sesuai batas multer | PDF feedback |
| Hak akses review | Dosen membuka bimbingan bukan miliknya | Akses detail mahasiswa bukan bimbingannya | Sistem menolak akses | Forbidden/unauthorized | Dosen berbeda |

### 3.6 Reply/Diskusi Komentar

| Nama Fitur | Skenario Pengujian | Test Case / Aksi Pengguna | Hasil yang Diharapkan | Validasi/Error yang Mungkin Muncul | Data Dummy |
|---|---|---|---|---|---|
| Reply mahasiswa | Mahasiswa membalas feedback | Isi kolom balasan, klik Kirim | Reply tersimpan dan tampil pada thread | `Pesan wajib diisi` jika kosong | Bimbingan dengan feedback |
| Reply dosen | Dosen membalas mahasiswa | Isi reply di halaman review dosen | Reply tersimpan dengan role dosen | `Pesan maksimal 2000 karakter` | Bimbingan aktif |
| Validasi reply | Pesan kosong | Klik kirim tanpa isi pesan | Sistem menolak input | `Pesan wajib diisi` | - |
| Hak akses reply | User tidak terkait membalas bimbingan | Pakai akun lain untuk reply | Sistem menolak akses | Unauthorized/forbidden | Akun tidak terkait |

### 3.7 Manajemen User Admin

| Nama Fitur | Skenario Pengujian | Test Case / Aksi Pengguna | Hasil yang Diharapkan | Validasi/Error yang Mungkin Muncul | Data Dummy |
|---|---|---|---|---|---|
| List user | Admin melihat data user | Buka Manajemen User | Tabel user tampil dengan nama, NIM/NIDN, email, role, status | Gagal memuat data jika API error | Akun admin |
| Filter/search user | Cari user | Ketik nama/NIM/email | Tabel menampilkan data sesuai pencarian | - | Beberapa user |
| Tambah mahasiswa | Tambah user role mahasiswa | Klik Tambah User, isi data valid, simpan | User mahasiswa baru tersimpan | `NIM/NIP wajib diisi`, `Password minimal 6 karakter`, `Format email tidak valid` | Data mahasiswa baru |
| Tambah dosen | Tambah user role dosen | Pilih role dosen, isi data valid | User dosen tersimpan | Role tidak valid jika salah | Data dosen baru |
| Duplikasi NIM/NIP | Tambah user dengan NIM/NIP sudah ada | Isi NIM/NIP existing | Sistem menolak data | Pesan NIM/NIP sudah digunakan | NIM/NIP existing |
| Edit user | Ubah data mahasiswa | Buka detail/edit, ubah nama/email/prodi/progress | Data berhasil diperbarui | Format email tidak valid | User existing |
| Assign dospem | Assign Dospem 1 dan 2 | Pilih mahasiswa, pilih dosen pembimbing, simpan | Dospem mahasiswa berubah | Format ID dosen tidak valid jika data salah | Mahasiswa + dosen aktif |
| Nonaktif user | Nonaktifkan user | Pilih aksi hapus/nonaktif | Status user menjadi nonaktif | Hanya admin yang boleh | User aktif |
| Hapus permanen | Hapus user permanen | Pilih hapus permanen | User terhapus dari database | Konfirmasi/permission error | User dummy |

### 3.8 Kelola Bimbingan Admin

| Nama Fitur | Skenario Pengujian | Test Case / Aksi Pengguna | Hasil yang Diharapkan | Validasi/Error yang Mungkin Muncul | Data Dummy |
|---|---|---|---|---|---|
| Pilih mahasiswa | Admin mencari mahasiswa | Buka Kelola Bimbingan, ketik nama/NIM | Dropdown hasil pencarian tampil | Mahasiswa tidak ditemukan | Beberapa mahasiswa |
| Ringkasan bimbingan | Melihat riwayat mahasiswa | Pilih mahasiswa | Profil mahasiswa, dospem, statistik, riwayat tampil | Data kosong jika belum ada bimbingan | Mahasiswa dengan riwayat |
| Tab dospem | Pindah Dospem 1/2 | Klik tab Dospem 1 atau Dospem 2 | Riwayat sesuai dospem tampil | - | Riwayat dua dospem |
| Setting syarat sidang | Ubah minimal bimbingan Dospem 1/2 | Isi angka minimal, klik Simpan Target | Setting tersimpan dan dipakai pada status sidang | Angka tidak valid jika kurang dari 1/lebih batas | Mahasiswa terpilih |
| Clear riwayat | Hapus riwayat per dospem | Klik Clear Dospem 1/2, konfirmasi | Riwayat dospem terpilih terhapus | Aksi tidak dapat dibatalkan | Data dummy bimbingan |
| Clear semua | Hapus semua riwayat | Klik Clear Semua Bimbingan | Semua riwayat bimbingan mahasiswa terhapus | - | Data dummy |

### 3.9 Kelola Jadwal Sidang Admin

| Nama Fitur | Skenario Pengujian | Test Case / Aksi Pengguna | Hasil yang Diharapkan | Validasi/Error yang Mungkin Muncul | Data Dummy |
|---|---|---|---|---|---|
| List jadwal | Melihat jadwal | Buka Kelola Jadwal | Tabel jadwal dan statistik tampil | Data kosong jika belum ada jadwal | Akun admin |
| Buat jadwal | Jadwal berhasil dibuat | Pilih mahasiswa, jenis sidang, tanggal, waktu, ruangan, penguji, klik Buat Jadwal | Jadwal tersimpan status `dijadwalkan` | - | Mahasiswa + dosen penguji |
| Validasi mahasiswa | Mahasiswa belum dipilih | Klik buat jadwal tanpa mahasiswa | Sistem menolak | `ID mahasiswa wajib diisi` | - |
| Validasi jenis sidang | Jenis sidang kosong/salah | Submit jenis tidak valid | Sistem menolak | `Jenis jadwal harus sidang_proposal atau sidang_skripsi` | - |
| Validasi tanggal | Tanggal kosong/tidak valid | Submit tanpa tanggal | Sistem menolak | `Tanggal wajib diisi` / `Format tanggal tidak valid` | - |
| Validasi waktu | Format waktu salah | Isi waktu selain HH:MM | Sistem menolak | `Format waktu harus HH:MM` | - |
| Edit jadwal | Ubah jadwal terjadwal | Klik edit, ubah tanggal/waktu/ruangan | Jadwal berhasil diperbarui | Tidak boleh update jadwal selesai sesuai logic backend | Jadwal aktif |
| Selesaikan jadwal | Tandai jadwal selesai | Pilih hasil sidang dan nilai | Status menjadi `selesai`, hasil/nilai tersimpan | `Hasil tidak valid`, `Nilai harus 0-100` | Jadwal terjadwal |
| Batalkan jadwal | Batalkan jadwal | Isi alasan, konfirmasi batal | Status menjadi `dibatalkan` | Alasan kosong dari validasi UI | Jadwal aktif |
| Hapus permanen | Hapus jadwal cancelled/completed | Klik hapus permanen | Jadwal dihapus dari database | Error jika status tidak sesuai logic | Jadwal dibatalkan/selesai |

### 3.10 Jadwal Sidang untuk Mahasiswa/Dosen

| Nama Fitur | Skenario Pengujian | Test Case / Aksi Pengguna | Hasil yang Diharapkan | Validasi/Error yang Mungkin Muncul | Data Dummy |
|---|---|---|---|---|---|
| Lihat jadwal mahasiswa | Mahasiswa membuka Jadwal Sidang | Buka `/jadwal-sidang` sebagai mahasiswa | Jadwal milik mahasiswa tampil | Data kosong jika belum dijadwalkan | Mahasiswa punya jadwal |
| Lihat jadwal dosen | Dosen membuka Jadwal Sidang | Buka `/jadwal-sidang` sebagai dosen | Jadwal dosen sebagai penguji tampil | Data kosong jika tidak jadi penguji | Dosen penguji |
| Filter jadwal | Filter tahun/gelombang/periode | Pilih filter di halaman jadwal | Data jadwal mengikuti filter UI | - | Jadwal beberapa periode |
| Preview/download PDF | Klik Preview/Download PDF jika tersedia di UI | Dokumen jadwal ditampilkan/diunduh sesuai implementasi frontend | Jika tidak ada data, tetap tampil tabel kosong | Jadwal tersedia |

### 3.11 Generate Surat Persetujuan Sempro/Sidang

| Nama Fitur | Skenario Pengujian | Test Case / Aksi Pengguna | Hasil yang Diharapkan | Validasi/Error yang Mungkin Muncul | Data Dummy |
|---|---|---|---|---|---|
| Generate surat | Syarat terpenuhi | Mahasiswa memenuhi minimal bimbingan dan `acc_sempro` dari kedua dospem, klik generate | File DOCX surat persetujuan terunduh | - | Mahasiswa siap sidang |
| Generate surat | Syarat belum terpenuhi | Klik generate saat belum cukup bimbingan/ACC | Sistem menolak generate atau tombol tidak muncul | Pesan syarat belum terpenuhi | Mahasiswa belum siap |
| Generate dari admin | Admin generate dari laporan | Buka Laporan, klik download surat pada mahasiswa eligible | DOCX terunduh | Error jika syarat belum terpenuhi | Mahasiswa eligible |
| Tanda tangan sample | Cek output surat | Buka DOCX hasil generate | Surat berisi data mahasiswa/dosen dan tanda tangan sample | Asset tanda tangan hilang jika file tidak ada | Asset `sample-ttd.png` |

### 3.12 Notifikasi Email

| Nama Fitur | Skenario Pengujian | Test Case / Aksi Pengguna | Hasil yang Diharapkan | Validasi/Error yang Mungkin Muncul | Data Dummy |
|---|---|---|---|---|---|
| Email bimbingan baru | Mahasiswa upload bimbingan | Upload bimbingan ke dosen dengan email aktif | Sistem mencoba mengirim email ke dosen | Email disabled, credential kosong, SMTP timeout | Email dosen valid |
| Email feedback | Dosen memberi feedback | Submit feedback ke mahasiswa dengan email aktif | Sistem mencoba mengirim email ke mahasiswa | Email service gagal tidak boleh menggagalkan feedback | Email mahasiswa valid |
| Email jadwal | Admin membuat jadwal | Buat jadwal dengan mahasiswa/penguji punya email | Sistem mencoba mengirim email jadwal | Provider/SMTP error di log backend | Email mahasiswa/dosen valid |
| Email disabled | EMAIL_ENABLED tidak aktif | Jalankan aksi pemicu email | Aksi utama tetap berhasil, email dilewati | Log `Email Disabled` | Env email disabled |

## 4. Data Dummy yang Dibutuhkan

| Kebutuhan Data | Contoh Data |
|---|---|
| Admin aktif | `admin001 / admin123` |
| Dosen Pembimbing 1 | `DOSEN001 / dosen123` |
| Dosen Pembimbing 2 | `DOSEN002 / dosen123` |
| Mahasiswa aktif | `2321053 / mahasiswa123` |
| Mahasiswa tanpa riwayat | Mahasiswa baru yang sudah punya dospem tetapi belum upload bimbingan |
| Mahasiswa dengan riwayat Dospem 1 | Minimal 1 data bimbingan ke `dospem_1` |
| Mahasiswa dengan riwayat Dospem 2 | Minimal 1 data bimbingan ke `dospem_2` |
| Mahasiswa siap sidang | Minimal bimbingan terpenuhi di kedua dospem dan status `acc_sempro` dari kedua dospem |
| File upload valid | PDF ukuran kurang dari batas upload |
| File upload tidak valid | File `.docx`, `.jpg`, atau PDF lebih dari 10 MB |
| Jadwal dummy | Mahasiswa, jenis sidang, tanggal, waktu, ruangan, dan penguji |
| Email dummy | Email aktif untuk mahasiswa dan dosen jika notifikasi diuji |

## 5. Bukti Screenshot yang Perlu Diambil untuk Bab 5

### Screenshot Wajib

1. Halaman login.
2. Login gagal karena password salah.
3. Dashboard Mahasiswa.
4. Halaman Bimbingan Mahasiswa dengan tab Dospem 1/Dospem 2.
5. Validasi upload bimbingan saat judul/file kosong.
6. Upload bimbingan berhasil dan riwayat bertambah.
7. Dashboard Dosen.
8. Daftar mahasiswa bimbingan dosen.
9. Detail Review Bimbingan Dosen.
10. Feedback dosen berhasil, status berubah menjadi Revisi/ACC/Lanjut BAB/ACC Sempro.
11. Reply/diskusi komentar tampil.
12. Manajemen User Admin.
13. Modal Tambah User Admin.
14. Assign Dosen Pembimbing.
15. Kelola Jadwal Sidang Admin.
16. Modal Buat Jadwal Sidang.
17. Halaman Jadwal Sidang.
18. Status syarat sidang mahasiswa.
19. Generate surat persetujuan berhasil.

### Screenshot Opsional

1. Halaman Laporan Admin.
2. Setting syarat sidang per mahasiswa di Kelola Bimbingan.
3. Clear riwayat bimbingan admin.
4. Email masuk ke inbox setelah upload bimbingan/feedback/jadwal.
5. Profile user jika ingin menunjukkan update email/WhatsApp.

## 6. Rekomendasi Fitur yang Wajib dan Opsional Masuk Tabel Black Box

### Wajib Masuk Tabel Black Box

| Fitur | Alasan |
|---|---|
| Login dan role-based dashboard | Gerbang utama sistem dan pembeda role |
| Dashboard Mahasiswa | Menampilkan progress dan status bimbingan |
| Upload dokumen bimbingan | Inti proses bimbingan tugas akhir |
| Pilih Dospem 1/Dospem 2 | Menunjukkan bimbingan diarahkan ke dosen tertentu |
| Riwayat bimbingan | Bukti tracking proses bimbingan |
| Review/feedback dosen | Inti interaksi dosen terhadap dokumen mahasiswa |
| Status bimbingan | Menunjukkan hasil review: menunggu, revisi, ACC, lanjut BAB, ACC Sempro |
| Reply/diskusi komentar | Mendukung komunikasi setelah feedback |
| Download file bimbingan | Bagian penting proses review dokumen |
| Manajemen user admin | Admin sebagai pengelola data dasar |
| Assign dospem | Menentukan relasi mahasiswa dengan dosen pembimbing |
| Kelola jadwal sidang | Fitur utama pendukung proses akhir |
| Lihat jadwal sidang | Digunakan semua role sesuai hak akses |
| Generate surat persetujuan | Output dokumen saat syarat terpenuhi |

### Opsional Masuk Tabel Black Box

| Fitur | Alasan |
|---|---|
| Upload file feedback dosen | Ada di backend dan service, tetapi bukan inti minimal jika demo terbatas |
| Notifikasi email | Berjalan sebagai proses non-blocking, bergantung konfigurasi env/provider |
| Laporan progres admin | Berguna untuk Bab 5, tetapi bukan alur inti upload-review |
| Setting syarat sidang per mahasiswa | Berguna untuk demo, tetapi lebih sebagai konfigurasi admin |
| Clear riwayat bimbingan | Lebih dekat ke fitur admin/testing/demo |
| Profile user | Pendukung data email/WhatsApp, bukan inti bimbingan |
| Reset password/upload avatar/change password | Tidak perlu ditonjolkan di Black Box utama |

## 7. Catatan Validasi Penting

### Login

- Username wajib diisi.
- Username harus 5-20 karakter.
- Password wajib diisi.
- Login gagal harus menampilkan pesan error pada UI.

### User

- NIM/NIP wajib diisi.
- NIM/NIP harus 5-20 karakter.
- Password minimal 6 karakter.
- Nama wajib diisi dan 2-100 karakter.
- Email harus valid jika diisi.
- Role hanya boleh `mahasiswa`, `dosen`, atau `admin`.
- Status hanya boleh `aktif` atau `nonaktif`.

### Bimbingan

- Judul wajib diisi.
- Judul harus 5-200 karakter.
- Dosen type wajib dipilih: `dospem_1` atau `dospem_2`.
- Catatan maksimal 1000 karakter.
- File upload harus PDF.
- Ukuran file default maksimal 10 MB, tergantung `MAX_FILE_SIZE`.

### Feedback Dosen

- Status wajib diisi.
- Status valid: `revisi`, `acc`, `lanjut_bab`, `acc_sempro`.
- Feedback wajib diisi.
- Feedback harus 5-2000 karakter.
- File feedback bersifat opsional dan menggunakan upload PDF.

### Reply

- Pesan wajib diisi.
- Pesan maksimal 2000 karakter.

### Jadwal Sidang

- Mahasiswa wajib dipilih.
- Jenis jadwal wajib: `sidang_proposal` atau `sidang_skripsi`.
- Tanggal wajib valid.
- Waktu mulai wajib format `HH:MM`.
- Waktu selesai jika diisi harus format `HH:MM`.
- Ruangan maksimal 100 karakter.
- Penguji berupa array ObjectId dosen.
- Status jadwal valid: `dijadwalkan`, `berlangsung`, `selesai`, `dibatalkan`.
- Hasil sidang valid: `lulus`, `lulus_revisi`, `tidak_lulus`.
- Nilai sidang 0-100.

## 8. Prioritas Pengujian

### Prioritas 1 - Paling Wajib

1. Login semua role.
2. Upload bimbingan mahasiswa.
3. Riwayat bimbingan mahasiswa.
4. Review/feedback dosen.
5. Status bimbingan berubah sesuai feedback.
6. Reply/diskusi komentar.
7. Admin tambah user dan assign dospem.
8. Admin buat jadwal sidang.

### Prioritas 2 - Penting

1. Dashboard Mahasiswa.
2. Dashboard Dosen.
3. Download dokumen bimbingan.
4. Lihat jadwal sidang.
5. Generate surat persetujuan.
6. Validasi error form penting.

### Prioritas 3 - Opsional

1. Email notification.
2. Upload file feedback.
3. Laporan progres admin.
4. Setting minimal bimbingan per mahasiswa.
5. Clear riwayat bimbingan.
6. Profile user.

## 9. Catatan Akhir untuk Bab 5

Untuk Bab 5, tabel Black Box sebaiknya tidak terlalu banyak memasukkan fitur internal seperti refresh token, health check, reset password, upload avatar, dan clear data demo. Fokuskan pengujian pada alur utama:

1. Mahasiswa login.
2. Mahasiswa upload dokumen bimbingan ke dospem.
3. Dosen melihat mahasiswa bimbingan.
4. Dosen download dokumen.
5. Dosen memberi feedback/status.
6. Mahasiswa melihat hasil feedback.
7. Mahasiswa membalas feedback.
8. Admin mengelola user dan assign dospem.
9. Admin mengelola jadwal sidang.
10. Mahasiswa/Dosen melihat jadwal sidang.
11. Mahasiswa/Admin generate surat persetujuan saat syarat terpenuhi.

