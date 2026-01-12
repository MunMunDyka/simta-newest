# DOKUMEN BLACK BOX TESTING
## Sistem Informasi Manajemen Tugas Akhir (SIMTA)
### Institut Teknologi Batam

---

## 1. PENDAHULUAN

### 1.1 Tujuan
Dokumen ini berisi hasil pengujian Black Box Testing pada Sistem Informasi Manajemen Tugas Akhir (SIMTA). Pengujian dilakukan untuk memvalidasi bahwa setiap fungsi pada aplikasi berjalan sesuai dengan kebutuhan yang telah didefinisikan.

### 1.2 Metode Pengujian
**Black Box Testing** adalah metode pengujian perangkat lunak yang berfokus pada fungsionalitas sistem tanpa memperhatikan struktur internal kode program. Pengujian dilakukan dari perspektif pengguna akhir (end-user).

### 1.3 Ruang Lingkup
Pengujian mencakup seluruh modul dalam aplikasi SIMTA:
- Modul Autentikasi
- Modul Dashboard
- Modul Bimbingan (Mahasiswa & Dosen)
- Modul Jadwal Sidang
- Modul Manajemen User (Admin)
- Modul Profile

---

## 2. PENGUJIAN MODUL AUTENTIKASI

### 2.1 Login

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 1 | AUTH-001 | Login Mahasiswa Valid | Halaman login terbuka | 1. Input NIM pada field username<br>2. Input password<br>3. Klik tombol Login | NIM: 2321053<br>Password: 123456 | Sistem menampilkan dashboard mahasiswa dan menampilkan nama user | | |
| 2 | AUTH-002 | Login Dosen Valid | Halaman login terbuka | 1. Input NIP pada field username<br>2. Input password<br>3. Klik tombol Login | NIP: DOSEN001<br>Password: 123456 | Sistem menampilkan dashboard dosen dan menampilkan nama user | | |
| 3 | AUTH-003 | Login Admin Valid | Halaman login terbuka | 1. Input username admin<br>2. Input password<br>3. Klik tombol Login | Username: admin<br>Password: admin123 | Sistem menampilkan dashboard admin | | |
| 4 | AUTH-004 | Login dengan Password Salah | Halaman login terbuka | 1. Input NIM yang valid<br>2. Input password yang salah<br>3. Klik tombol Login | NIM: 2321053<br>Password: wrongpass | Sistem menampilkan pesan error "Password salah" | | |
| 5 | AUTH-005 | Login dengan Username Tidak Terdaftar | Halaman login terbuka | 1. Input NIM yang tidak terdaftar<br>2. Input password<br>3. Klik tombol Login | NIM: 9999999<br>Password: 123456 | Sistem menampilkan pesan error "User tidak ditemukan" | | |
| 6 | AUTH-006 | Login dengan Field Kosong | Halaman login terbuka | 1. Biarkan field username kosong<br>2. Biarkan field password kosong<br>3. Klik tombol Login | Username: (kosong)<br>Password: (kosong) | Sistem menampilkan validasi field wajib diisi | | |
| 7 | AUTH-007 | Login User Nonaktif | Halaman login terbuka | 1. Input NIM user nonaktif<br>2. Input password<br>3. Klik tombol Login | NIM: (user nonaktif)<br>Password: 123456 | Sistem menampilkan pesan "Akun tidak aktif" | | |

### 2.2 Logout

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 8 | AUTH-008 | Logout dari Sistem | User sudah login | 1. Klik menu profile<br>2. Klik tombol Logout | - | Sistem kembali ke halaman login dan session terhapus | | |
| 9 | AUTH-009 | Akses Halaman Terproteksi Tanpa Login | Belum login | 1. Akses URL dashboard langsung via browser | URL: /mahasiswa/dashboard | Sistem redirect ke halaman login | | |

---

## 3. PENGUJIAN MODUL BIMBINGAN (MAHASISWA)

### 3.1 Upload Bimbingan

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 10 | BIM-001 | Upload Bimbingan ke Dosen Pembimbing 1 | Login sebagai mahasiswa, dospem sudah di-assign | 1. Pilih tab Dosen Pembimbing 1<br>2. Upload file PDF<br>3. Isi catatan<br>4. Klik Upload | File: bab1.pdf<br>Catatan: "Revisi BAB I" | File terupload, muncul notifikasi sukses, bimbingan tampil di riwayat | | |
| 11 | BIM-002 | Upload Bimbingan ke Dosen Pembimbing 2 | Login sebagai mahasiswa, dospem sudah di-assign | 1. Pilih tab Dosen Pembimbing 2<br>2. Upload file PDF<br>3. Isi catatan<br>4. Klik Upload | File: bab2.pdf<br>Catatan: "Draft BAB II" | File terupload, muncul notifikasi sukses | | |
| 12 | BIM-003 | Upload File Bukan PDF | Login sebagai mahasiswa | 1. Pilih file dengan format .docx<br>2. Klik Upload | File: document.docx | Sistem menampilkan error "Hanya file PDF yang diizinkan" | | |
| 13 | BIM-004 | Upload File Melebihi Batas Ukuran | Login sebagai mahasiswa | 1. Pilih file PDF > 10MB<br>2. Klik Upload | File: large_file.pdf (15MB) | Sistem menampilkan error "Ukuran file maksimal 10MB" | | |
| 14 | BIM-005 | Upload Tanpa Mengisi Catatan | Login sebagai mahasiswa | 1. Upload file PDF<br>2. Biarkan catatan kosong<br>3. Klik Upload | File: bab1.pdf<br>Catatan: (kosong) | File tetap terupload (catatan opsional) | | |
| 15 | BIM-006 | Upload Saat Status Menunggu Review | Status bimbingan terakhir = Menunggu Review | 1. Coba upload file baru | File: new_file.pdf | Tombol upload disabled / tampil pesan tunggu review | | |

### 3.2 Riwayat Bimbingan

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 16 | BIM-007 | Lihat Riwayat Bimbingan | Login sebagai mahasiswa, ada riwayat bimbingan | 1. Buka halaman Bimbingan<br>2. Scroll ke bagian riwayat | - | Tampil daftar bimbingan dengan tanggal, status, dan feedback | | |
| 17 | BIM-008 | Download File Bimbingan | Ada bimbingan di riwayat | 1. Klik tombol download pada salah satu bimbingan | - | File PDF terunduh ke komputer | | |
| 18 | BIM-009 | Lihat Detail Feedback | Ada bimbingan dengan feedback | 1. Klik salah satu bimbingan di riwayat<br>2. Expand detail | - | Tampil feedback dari dosen, status, dan file attachment (jika ada) | | |
| 19 | BIM-010 | Balas Feedback Dosen | Ada bimbingan dengan status revisi | 1. Klik tombol balas pada feedback<br>2. Tulis balasan<br>3. Klik kirim | Balasan: "Sudah saya perbaiki pak" | Balasan tersimpan dan tampil di riwayat | | |

---

## 4. PENGUJIAN MODUL BIMBINGAN (DOSEN)

### 4.1 Dashboard Bimbingan Dosen

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 20 | DOS-001 | Lihat Daftar Mahasiswa Bimbingan | Login sebagai dosen yang sudah di-assign ke mahasiswa | 1. Buka dashboard dosen | - | Tampil daftar mahasiswa bimbingan dengan nama, NIM, progress, dan jumlah bimbingan | | |
| 21 | DOS-002 | Filter/Search Mahasiswa | Ada beberapa mahasiswa bimbingan | 1. Ketik nama mahasiswa di search box | Keyword: "Andhika" | Tampil hanya mahasiswa yang nama mengandung "Andhika" | | |
| 22 | DOS-003 | Lihat Detail Mahasiswa | Ada mahasiswa bimbingan | 1. Klik salah satu mahasiswa | - | Tampil detail mahasiswa: info, judul TA, progress, riwayat bimbingan | | |

### 4.2 Review & Feedback

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 23 | DOS-004 | Download File Bimbingan Mahasiswa | Ada bimbingan dari mahasiswa | 1. Klik tombol download file | - | File PDF dari mahasiswa terunduh | | |
| 24 | DOS-005 | Beri Feedback dengan Status Revisi | Ada bimbingan menunggu review | 1. Pilih status "Revisi"<br>2. Isi feedback<br>3. Klik Simpan | Status: Revisi<br>Feedback: "Perbaiki metodologi" | Feedback tersimpan, notifikasi dikirim ke mahasiswa | | |
| 25 | DOS-006 | Beri Feedback dengan Status ACC | Ada bimbingan menunggu review | 1. Pilih status "ACC"<br>2. Isi feedback<br>3. Klik Simpan | Status: ACC<br>Feedback: "Bagus, lanjut BAB berikutnya" | Feedback tersimpan, progress mahasiswa terupdate | | |
| 26 | DOS-007 | Beri Feedback dengan Status Lanjut Bab | Ada bimbingan menunggu review | 1. Pilih status "Lanjut Bab"<br>2. Isi feedback<br>3. Klik Simpan | Status: Lanjut Bab<br>Feedback: "Silakan lanjut BAB II" | Feedback tersimpan, currentProgress mahasiswa naik ke BAB berikutnya | | |
| 27 | DOS-008 | Beri Feedback dengan File Attachment | Ada bimbingan menunggu review | 1. Pilih status<br>2. Isi feedback<br>3. Upload file PDF<br>4. Klik Simpan | File: revisi_notes.pdf | Feedback tersimpan dengan file attachment | | |
| 28 | DOS-009 | Beri Feedback Tanpa Mengisi Keterangan | Ada bimbingan menunggu review | 1. Pilih status<br>2. Biarkan feedback kosong<br>3. Klik Simpan | Feedback: (kosong) | Sistem menampilkan validasi "Feedback wajib diisi" | | |

---

## 5. PENGUJIAN MODUL JADWAL SIDANG

### 5.1 Jadwal Sidang (Mahasiswa)

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 29 | JDW-001 | Lihat Jadwal Sidang Sendiri | Login sebagai mahasiswa, sudah ada jadwal | 1. Buka halaman Jadwal Sidang | - | Tampil jadwal sidang: tanggal, waktu, ruangan, penguji | | |
| 30 | JDW-002 | Tidak Ada Jadwal Sidang | Login sebagai mahasiswa, belum ada jadwal | 1. Buka halaman Jadwal Sidang | - | Tampil pesan "Belum ada jadwal sidang" | | |
| 31 | JDW-003 | Download Jadwal Sidang PDF | Ada jadwal sidang | 1. Klik tombol Download PDF | - | File PDF jadwal sidang terunduh | | |

### 5.2 Kelola Jadwal Sidang (Admin)

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 32 | JDW-004 | Tambah Jadwal Sidang Baru | Login sebagai admin | 1. Klik tombol Tambah Jadwal<br>2. Isi form lengkap<br>3. Klik Simpan | Mahasiswa: Andhika<br>Tanggal: 15-01-2026<br>Waktu: 09:00<br>Ruangan: Lab 1<br>Penguji 1: Dr. A<br>Penguji 2: Dr. B | Jadwal tersimpan, muncul di daftar | | |
| 33 | JDW-005 | Tambah Jadwal dengan Data Tidak Lengkap | Login sebagai admin | 1. Klik Tambah Jadwal<br>2. Isi sebagian form<br>3. Klik Simpan | Mahasiswa: (kosong) | Sistem menampilkan validasi field wajib | | |
| 34 | JDW-006 | Edit Jadwal Sidang | Ada jadwal sidang | 1. Klik tombol Edit<br>2. Ubah data<br>3. Klik Simpan | Ruangan: Lab 2 (diubah) | Data jadwal terupdate | | |
| 35 | JDW-007 | Hapus Jadwal Sidang | Ada jadwal sidang | 1. Klik tombol Hapus<br>2. Konfirmasi hapus | - | Jadwal terhapus dari daftar | | |
| 36 | JDW-008 | Lihat Semua Jadwal Sidang | Login sebagai admin | 1. Buka halaman Kelola Jadwal | - | Tampil daftar semua jadwal sidang dengan pagination | | |

---

## 6. PENGUJIAN MODUL MANAJEMEN USER (ADMIN)

### 6.1 Daftar User

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 37 | USR-001 | Lihat Semua User | Login sebagai admin | 1. Buka halaman Manajemen User | - | Tampil daftar semua user dengan pagination | | |
| 38 | USR-002 | Filter User Berdasarkan Role | Ada user dengan berbagai role | 1. Pilih filter "Mahasiswa" | Filter: Mahasiswa | Tampil hanya user dengan role mahasiswa | | |
| 39 | USR-003 | Filter User Berdasarkan Status | Ada user aktif dan nonaktif | 1. Pilih filter "Nonaktif" | Filter: Nonaktif | Tampil hanya user dengan status nonaktif | | |
| 40 | USR-004 | Search User Berdasarkan Nama | Ada beberapa user | 1. Ketik nama di search box | Keyword: "Andhika" | Tampil user yang nama mengandung keyword | | |

### 6.2 Tambah User

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 41 | USR-005 | Tambah Mahasiswa Baru | Login sebagai admin | 1. Klik Tambah User<br>2. Pilih role Mahasiswa<br>3. Isi form lengkap<br>4. Klik Simpan | Nama: Test User<br>NIM: 2399999<br>Email: test@iteba.ac.id<br>Prodi: Sistem Informasi<br>Password: 123456 | User tersimpan, muncul di daftar | | |
| 42 | USR-006 | Tambah Dosen Baru | Login sebagai admin | 1. Klik Tambah User<br>2. Pilih role Dosen<br>3. Isi form lengkap<br>4. Klik Simpan | Nama: Dr. Test<br>NIP: DOSEN999<br>Email: dosen@iteba.ac.id<br>Password: 123456 | User tersimpan, muncul di daftar | | |
| 43 | USR-007 | Tambah User dengan NIM/NIP Duplikat | Ada user dengan NIM 2321053 | 1. Tambah user baru dengan NIM yang sama | NIM: 2321053 | Sistem menampilkan error "NIM/NIP sudah terdaftar" | | |
| 44 | USR-008 | Tambah User dengan Email Duplikat | Ada user dengan email tertentu | 1. Tambah user baru dengan email yang sama | Email: existing@iteba.ac.id | Sistem menampilkan error "Email sudah terdaftar" | | |

### 6.3 Edit User

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 45 | USR-009 | Edit Data Mahasiswa | Ada user mahasiswa | 1. Klik detail user<br>2. Klik Edit Data<br>3. Ubah nama<br>4. Klik Simpan | Nama: "Updated Name" | Data user terupdate | | |
| 46 | USR-010 | Assign Dosen Pembimbing ke Mahasiswa | Ada mahasiswa tanpa dospem | 1. Buka Edit Mahasiswa<br>2. Pilih Dosen Pembimbing 1<br>3. Pilih Dosen Pembimbing 2<br>4. Klik Simpan | Dospem 1: Alvendo<br>Dospem 2: Rifa'atul | Dosen pembimbing ter-assign | | |
| 47 | USR-011 | Ubah Status User | Ada user aktif | 1. Buka Edit User<br>2. Ubah status ke Nonaktif<br>3. Klik Simpan | Status: Nonaktif | Status user berubah menjadi nonaktif | | |

### 6.4 Hapus User

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 48 | USR-012 | Nonaktifkan User (Soft Delete) | Ada user aktif | 1. Klik tombol Hapus<br>2. Pilih "Nonaktifkan" | - | User status menjadi nonaktif, data tetap ada | | |
| 49 | USR-013 | Hapus User Permanen (Hard Delete) | Ada user | 1. Klik tombol Hapus<br>2. Pilih "Hapus Permanen"<br>3. Konfirmasi | - | User terhapus dari database secara permanen | | |
| 50 | USR-014 | Hapus Diri Sendiri | Login sebagai admin | 1. Coba hapus akun admin sendiri | - | Sistem mencegah dan menampilkan error | | |

---

## 7. PENGUJIAN MODUL PROFILE

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 51 | PRF-001 | Lihat Profile Sendiri | User sudah login | 1. Klik menu Profile | - | Tampil data profile user | | |
| 52 | PRF-002 | Edit Nama | User sudah login | 1. Klik Edit Profile<br>2. Ubah nama<br>3. Klik Simpan | Nama: "New Name" | Nama terupdate | | |
| 53 | PRF-003 | Edit Nomor WhatsApp | User sudah login | 1. Klik Edit Profile<br>2. Ubah nomor WA<br>3. Klik Simpan | WhatsApp: 081234567890 | Nomor WA terupdate | | |
| 54 | PRF-004 | Ganti Password | User sudah login | 1. Klik Ganti Password<br>2. Isi password lama<br>3. Isi password baru<br>4. Klik Simpan | Old: 123456<br>New: newpass123 | Password berhasil diganti | | |
| 55 | PRF-005 | Ganti Password dengan Password Lama Salah | User sudah login | 1. Isi password lama yang salah<br>2. Isi password baru<br>3. Klik Simpan | Old: wrongpass<br>New: newpass123 | Sistem menampilkan error "Password lama salah" | | |
| 56 | PRF-006 | Upload Avatar | User sudah login | 1. Klik foto profile<br>2. Pilih gambar baru<br>3. Upload | File: avatar.jpg | Avatar berhasil diupload dan tampil | | |

---

## 8. PENGUJIAN NOTIFIKASI WHATSAPP

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 57 | WA-001 | Notifikasi ke Dosen Saat Upload Bimbingan | WhatsApp enabled, dosen punya nomor WA | 1. Mahasiswa upload bimbingan | - | Dosen menerima notifikasi WhatsApp | | |
| 58 | WA-002 | Notifikasi ke Mahasiswa Saat Feedback | WhatsApp enabled, mahasiswa punya nomor WA | 1. Dosen beri feedback | - | Mahasiswa menerima notifikasi WhatsApp | | |
| 59 | WA-003 | Notifikasi Jadwal Sidang | WhatsApp enabled | 1. Admin buat jadwal sidang baru | - | Mahasiswa dan penguji menerima notifikasi | | |
| 60 | WA-004 | WhatsApp Disabled | WHATSAPP_ENABLED=false | 1. Lakukan aksi yang trigger notifikasi | - | Log menampilkan "Disabled - skipping notification" | | |

---

## 9. PENGUJIAN RESPONSIF (MOBILE)

| No | Kode Test | Deskripsi | Kondisi Awal | Langkah Pengujian | Data Input | Expected Result | Actual Result | Status |
|----|-----------|-----------|--------------|-------------------|------------|-----------------|---------------|--------|
| 61 | RSP-001 | Tampilan Login di Mobile | Buka di smartphone/resize browser | 1. Akses halaman login | - | Layout menyesuaikan layar mobile | | |
| 62 | RSP-002 | Tampilan Dashboard di Mobile | Login di mobile | 1. Buka dashboard | - | Sidebar collapse/hamburger menu, konten menyesuaikan | | |
| 63 | RSP-003 | Upload Bimbingan di Mobile | Login di mobile | 1. Upload file dari mobile | - | Fitur upload berfungsi normal | | |
| 64 | RSP-004 | Tabel Data di Mobile | Ada tabel dengan banyak kolom | 1. Lihat tabel di mobile | - | Tabel scrollable horizontal / card view | | |

---

## 10. RINGKASAN HASIL PENGUJIAN

### 10.1 Statistik Pengujian

| Kategori | Jumlah Test Case | Pass | Fail | Persentase Keberhasilan |
|----------|------------------|------|------|------------------------|
| Autentikasi | 9 | | | |
| Bimbingan Mahasiswa | 10 | | | |
| Bimbingan Dosen | 9 | | | |
| Jadwal Sidang | 8 | | | |
| Manajemen User | 14 | | | |
| Profile | 6 | | | |
| WhatsApp | 4 | | | |
| Responsif | 4 | | | |
| **TOTAL** | **64** | | | |

### 10.2 Kesimpulan
(Diisi setelah pengujian selesai)

---

## 11. CATATAN PENGUJIAN

### 11.1 Lingkungan Pengujian
- **Browser:** Google Chrome versi xxx
- **Sistem Operasi:** Windows 11
- **Resolusi Desktop:** 1920 x 1080
- **Resolusi Mobile:** 375 x 667 (iPhone SE)
- **Tanggal Pengujian:** xx-xx-2026

### 11.2 Tester
- Nama: [Nama Anda]
- NIM: [NIM Anda]

---

*Dokumen ini dibuat sebagai bagian dari Tugas Akhir*
*Program Studi Sistem Informasi - Institut Teknologi Batam*
