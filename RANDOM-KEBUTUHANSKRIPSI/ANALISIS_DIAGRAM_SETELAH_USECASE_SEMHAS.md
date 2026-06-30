# Analisis Detail Diagram Setelah Use Case (Bab IV) - Draft Semhas

Dokumen ini membedah secara rinci kesalahan, kekurangan, dan ketidakcocokan logika pada **Activity Diagrams, Sequence Diagrams, Class Diagram, dan Flowcharts** yang ada di draf Semhas Anda (`DraftSemhas_AndhikaLaksmana_2321053.docx`) jika dibandingkan dengan **kode program nyata** frontend, backend, dan database Mongoose pada sistem SIMTA.

---

## 1. ANALYSIS OF ACTIVITY DIAGRAMS (GAMBAR 4.3 - 4.10)

Activity Diagram di draf Anda menggambarkan alur kerja sistem secara umum, tetapi melewatkan aturan bisnis (*business rules*) penting yang diimplementasikan di kode backend untuk menjaga validitas data.

### Gambar 4.3: Activity Diagram Login User
*   **Kesalahan / Celah pada Draf:** Hanya memvalidasi kecocokan username (NIM/NIP) dan password.
*   **Kenyataan Kode (`authController.js`):** Sistem memeriksa status akun pengguna di model `User.js` (atribut `status: 'aktif'` atau `'nonaktif'`). Jika admin menonaktifkan akun tersebut, login akan ditolak meskipun kredensialnya benar.
*   **Perbaikan Detail:** Tambahkan *decision node* setelah pemeriksaan kredensial: `"Apakah status akun == aktif?"`. Jika `Ya`, masuk ke dashboard; jika `Tidak`, tampilkan pesan "Akun dinonaktifkan" dan kembalikan ke Halaman Login.

### Gambar 4.4: Activity Diagram Pengelolaan Data Pengguna (Admin)
*   **Kesalahan / Celah pada Draf:** Hanya berfokus pada alur input dan simpan data user baru.
*   **Kenyataan Kode (`userController.js`):** Admin dapat melakukan:
    1.  *Soft Delete / Nonaktifkan Akun:* Mengubah status user menjadi `'nonaktif'` agar tidak bisa login, tetapi datanya tetap tersimpan di database untuk menjaga integritas relasi tugas akhir (`PUT /api/users/:id`).
    2.  *Hard Delete / Hapus Permanen:* Menghapus dokumen user secara fisik dari database (`DELETE /api/users/:id/permanent`).
    3.  *Reset Password:* Mengatur ulang kata sandi user ke nilai default.
    4.  *Enkripsi:* Sandi di-hash menggunakan `bcrypt` sebelum disimpan secara fisik.
*   **Perbaikan Detail:** Tunjukkan percabangan pilihan aksi Admin setelah memilih user (Tambah, Edit, Nonaktifkan, Hapus Permanen, Reset Password). Tambahkan proses enkripsi sandi sebelum penyimpanan di database.

### Gambar 4.5: Activity Diagram Penentuan Dosen Pembimbing (Admin)
*   **Kesalahan / Celah pada Draf:** Memperbolehkan Admin memilih dosen pembimbing tanpa pembatasan.
*   **Kenyataan Kode (`userController.js`):** Terdapat validasi bisnis yang mematikan: **Dosen Pembimbing 1 tidak boleh sama dengan Dosen Pembimbing 2**. Jika Admin memilih dosen yang sama untuk kedua posisi, sistem akan menolak pengajuan.
*   **Perbaikan Detail:** Tambahkan *decision node* sebelum penyimpanan data: `"Apakah Dospem 1 == Dospem 2?"`. Jika `Ya`, tampilkan pesan error dan batalkan; jika `Tidak`, simpan data.

### Gambar 4.6: Activity Diagram Pengelolaan Jadwal Sidang (Admin)
*   **Kesalahan / Celah pada Draf:** Admin menginput detail sidang (mahasiswa, penguji, ruangan, tanggal) dan langsung disimpan.
*   **Kenyataan Kode (`jadwalController.js`):** Ada serangkaian pengecekan konflik ketat:
    1.  *Conflict Ruangan:* Memastikan ruangan tidak dipakai jadwal lain pada waktu yang sama (`Jadwal.isSlotAvailable`).
    2.  *Conflict Peran Dosen:* Dosen yang ditunjuk sebagai Penguji 1 atau Penguji 2 **tidak boleh** merupakan Dosen Pembimbing 1 atau Dospem 2 mahasiswa tersebut.
    3.  *Conflict Mahasiswa:* Mahasiswa tidak boleh dijadwalkan pada slot waktu yang bentrok dengan jadwalnya sendiri.
    4.  *Otomatisasi:* Saat jadwal sukses disimpan, ID Penguji otomatis dimasukkan ke record mahasiswa (`penguji_1` & `penguji_2`) di koleksi `Users` dan `statusMahasiswa` berubah menjadi fase menunggu sidang.
*   **Perbaikan Detail:** Tambahkan keputusan bertingkat: *"Apakah ruangan bentrok?"*, *"Apakah Penguji merangkap Dospem?"*. Tambahkan proses otomatisasi backend *"Sinkronisasi data penguji ke record mahasiswa"*.

### Gambar 4.7: Activity Diagram Pengajuan Bimbingan Mahasiswa
*   **Kesalahan / Celah pada Draf:** Mahasiswa langsung mengunggah berkas PDF dan sistem menyimpannya.
*   **Kenyataan Kode (`bimbinganController.js`):**
    1.  *Concurrency Check (Antrean):* Mahasiswa dilarang mengunggah draf baru ke dosen tertentu jika draf bimbingan sebelumnya untuk dosen tersebut masih berstatus `'menunggu'` review.
    2.  *Status Check (Fase Revisi Ujian):* Sistem mengecek `statusMahasiswa`. Jika mahasiswa berada dalam fase revisi ujian (`revisi_sempro/semhas/sidang`), sistem mengunci bimbingan ke dospem. Mahasiswa **wajib** mengunggah berkas revisi tersebut ke Dosen Penguji (`penguji_1` / `penguji_2`).
*   **Perbaikan Detail:** Tambahkan *decision node* di awal: `"Apakah ada bimbingan berstatus 'menunggu'?"` dan `"Apakah mahasiswa sedang dalam fase revisi?"`.

### Gambar 4.8: Activity Diagram Dosen Review Bimbingan
*   **Kesalahan / Celah pada Draf:** Dosen mengisi feedback, menentukan status, dan menyimpan.
*   **Kenyataan Kode (`bimbinganController.js`):**
    1.  *Pengecekan ACC Sempro:* Jika dosen memilih status `'acc_sempro'`, sistem mengecek jumlah sesi bimbingan mahasiswa dengan dospem terkait. Jika kurang dari 5 kali, pemberian ACC ditolak.
    2.  *Otomatisasi Progres:* Jika dosen memberikan status `'lanjut_bab'`, sistem secara otomatis meng-update progres akademik mahasiswa (`currentProgress` di-update ke BAB selanjutnya, misal BAB I -> BAB II).
*   **Perbaikan Detail:** Tambahkan keputusan: `"Apakah status == ACC Sempro?"` $\rightarrow$ `"Apakah bimbingan >= 5 kali?"`. Serta tambahkan proses: `"Sistem memperbarui currentProgress Mahasiswa ke BAB selanjutnya"` di jalur status Lanjut Bab.

### Gambar 4.9: Activity Diagram Diskusi Bimbingan (Reply Komentar)
*   **Kesalahan / Celah pada Draf:** Semua user dapat mengirim komentar.
*   **Kenyataan Kode (`Reply.js`):** Sistem memvalidasi hak akses. Hanya Mahasiswa pemilik dokumen bimbingan dan Dosen terkait (Dospem/Penguji) yang diperbolehkan menulis komentar di thread tersebut.
*   **Perbaikan Detail:** Tambahkan keputusan: `"Apakah user terlibat dalam dokumen bimbingan?"` sebelum pesan disimpan ke database.

### Gambar 4.10: Activity Diagram Lihat Jadwal Sidang
*   **Kesalahan / Celah pada Draf:** User mengakses menu jadwal dan melihat seluruh daftar data.
*   **Kenyataan Kode (`jadwalController.js`):**
    *   Mahasiswa hanya dapat melihat jadwal miliknya sendiri.
    *   Dosen hanya dapat melihat jadwal dimana ia ditunjuk sebagai penguji.
    *   Admin dapat melihat semua jadwal.
*   **Perbaikan Detail:** Tunjukkan percabangan alur filter data berdasarkan peran (*role*) user yang masuk saat sistem query ke database.

---

## 2. ANALYSIS OF SEQUENCE DIAGRAMS (GAMBAR 4.11 - 4.18)

Sequence diagram Anda di draf tidak membedakan objek lapis program backend dengan database model. Terdapat pencampuran logika frontend dan database secara ad-hoc.

### Rekomendasi Struktur Lifeline yang Tepat (MVC/REST):
Gunakan penamaan objek yang mencerminkan struktur kode SIMTA:
*   `Boundary/View (Frontend):` Halaman Login, DashboardView, BimbinganView, KelolaUserView, KelolaJadwalView.
*   `Controller (Backend API):` `authController.js`, `userController.js`, `bimbinganController.js`, `jadwalController.js`.
*   `Entity/Model (Database):` `User`, `Bimbingan`, `Jadwal`, `Reply`.

### Perbaikan Detail per Diagram:

1.  **Sequence Diagram Autentikasi Pengguna (Gambar 4.11):**
    *   *Pesan yang Hilang:* `authController` mengirim pesan `findOne({ nim_nip })` ke model `User`. Setelah itu, memverifikasi kecocokan password (`bcrypt.compare`) dan memeriksa field `status == "aktif"`. Jika valid, token dikirim kembali ke `LoginView`.
2.  **Sequence Diagram Admin Kelola Data User (Gambar 4.12):**
    *   *Pesan yang Hilang:* `userController` memanggil `User.create()`. Model `User` melakukan enkripsi kata sandi menggunakan hash bcrypt di *pre-save hook* sebelum disimpan di DB.
3.  **Sequence Diagram Admin Plotting Dospem (Gambar 4.13):**
    *   *Pesan yang Hilang:* `userController` mengecek apakah ID `dospem_1` == `dospem_2`. Jika tidak sama, memanggil `User.findByIdAndUpdate()` untuk memperbarui record mahasiswa.
4.  **Sequence Diagram Admin Kelola Jadwal Sidang (Gambar 4.14):**
    *   *Pesan yang Hilang:* `jadwalController` memanggil `Jadwal.isSlotAvailable()` untuk validasi ruangan. Setelah jadwal sukses dibuat, `jadwalController` memanggil `User.findByIdAndUpdate()` untuk menuliskan ID penguji ke field `penguji_1` dan `penguji_2` pada record mahasiswa.
5.  **Sequence Diagram Mahasiswa Upload Bimbingan (Gambar 4.15):**
    *   *Pesan yang Hilang:* `bimbinganController` memanggil `Bimbingan.hasPendingBimbingan()` untuk mengecek antrean aktif. Memeriksa `statusMahasiswa` di model `User`. Mengambil nomor versi terakhir menggunakan `Bimbingan.getNextVersion()`. Jika semua valid, simpan bimbingan ke model `Bimbingan`.
6.  **Sequence Diagram Dosen Review Bimbingan (Gambar 4.16):**
    *   *Pesan yang Hilang:* `bimbinganController` mengecek minimal bimbingan jika status = `acc_sempro`. Jika status = `lanjut_bab`, `bimbinganController` memanggil `User.findByIdAndUpdate` untuk menaikkan progres akademik mahasiswa ke BAB selanjutnya.
7.  **Sequence Diagram Diskusi Reply Komentar (Gambar 4.17):**
    *   *Pesan yang Hilang:* `bimbinganController` memvalidasi authorisasi token pengirim, mencocokkannya dengan field `mahasiswa`/`dosen` pada dokumen bimbingan, lalu menyimpan data di model `Reply`.
8.  **Sequence Diagram Lihat Jadwal Sidang (Gambar 4.18):**
    *   *Pesan yang Hilang:* `jadwalController` mengecek role dari token pengguna. Jika mahasiswa, memanggil `Jadwal.find({ mahasiswa: userId })`. Jika dosen, memanggil `Jadwal.find({ penguji: dosenId })`.

---

## 3. ANALYSIS OF CLASS DIAGRAM (GAMBAR 4.19)

Class diagram di Gambar 4.19 melewatkan banyak field database riil yang ada pada repositori backend (`backend/models`).

### Atribut Kelas yang Kurang / Salah:

1.  **Class `User` (File model: `User.js`):**
    *   *Kekurangan Field Status Akademik:* Tambahkan atribut `statusMahasiswa: String` (enum alur sidang: `pra_sempro`, `menunggu_sempro`, `revisi_sempro`, `bimbingan_lanjut`, dst). Ini sangat vital untuk mengontrol perpindahan status bimbingan.
    *   *Kekurangan Referensi Penguji:* Tambahkan field `penguji_1: ObjectId` dan `penguji_2: ObjectId` (referensi ke model `User` dengan role dosen). Ini digunakan oleh dosen penguji untuk me-review revisi mahasiswa pascasidang.
    *   *Kekurangan Hak Akses:* Tambahkan field `canAccessAdmin: Boolean` yang membedakan dosen pembimbing biasa dengan dosen yang merangkap sebagai admin/koordinator TA.
2.  **Class `Bimbingan` (File model: `Bimbingan.js`):**
    *   *Tipe Data Dosen Salah:* `dosenType` harusnya bertipe String (enum: `dospem_1`, `dospem_2`, `penguji_1`, `penguji_2`), bukan bertipe Dosen.
    *   *Kekurangan Kategori Dokumen:* Tambahkan field `kategoriBimbingan: String` (enum: `bimbingan_dospem`, `revisi_sempro`, `revisi_semhas`, `revisi_sidang`). Atribut ini membedakan bimbingan biasa dengan draf revisi pascasidang yang ditujukan untuk penguji.
    *   *Kekurangan Metadata File:* Tambahkan `fileOriginalName: String` dan `fileSize: String`.
    *   *Kekurangan Fitur Draft Dosen:* Tambahkan field `draftFeedback: String`, `draftStatus: String`, dan `hasDraft: Boolean`. Sistem SIMTA memiliki fitur simpan draf feedback dosen sebelum dipublikasikan.
3.  **Class `Jadwal` (File model: `Jadwal.js`):**
    *   *Kekurangan Hasil Sidang:* Tambahkan field `hasil: String` (enum: `lulus`, `lulus_revisi`, `tidak_lulus`) dan `nilaiSidang: Number`. Atribut ini digunakan Admin untuk menginput hasil penilaian sidang mahasiswa yang otomatis memicu perubahan status akademik.

---

## 4. ANALYSIS OF FLOWCHARTS (GAMBAR 4.29 - 4.31)

### Flowchart Alur Kerja Mahasiswa (Gambar 4.29):
*   *Kesalahan Logika:* Flowchart menggambarkan mahasiswa langsung mengunggah dokumen PDF ke Dospem.
*   *Koreksi Alur:* Flowchart mahasiswa harus memiliki percabangan pengecekan status akademik di awal. Jika statusnya adalah fase revisi (`revisi_sempro`, `revisi_semhas`, atau `revisi_sidang`), mahasiswa harus mengunggah file revisi ke **Dosen Penguji**, bukan ke Dosen Pembimbing.

### Flowchart Alur Kerja Dosen Pembimbing (Gambar 4.30):
*   *Kesalahan Notifikasi & Syarat:*
    1.  Terdapat keterangan notifikasi terkirim via WhatsApp. Karena draf disepakati menggunakan email, ubah keterangan menjadi **"Kirim Notifikasi Email"**.
    2.  Flowchart harus menggambarkan pemeriksaan syarat minimal bimbingan (total bimbingan >= 5) saat dosen memilih status `acc_sempro`. Jika bimbingan kurang dari 5 kali, proses feedback ditolak dan kembali ke halaman review.

### Flowchart Alur Kerja Admin (Gambar 4.31):
*   *Kesalahan Alur:* Alur pembuatan jadwal sidang langsung selesai setelah input jadwal.
*   *Koreksi Alur:* Harus menggambarkan bahwa setelah jadwal disimpan, sistem otomatis melakukan sinkronisasi data: mengubah status akademik mahasiswa menjadi menunggu sidang dan memetakan dosen penguji tersebut ke field `penguji_1` dan `penguji_2` pada record mahasiswa terkait.
