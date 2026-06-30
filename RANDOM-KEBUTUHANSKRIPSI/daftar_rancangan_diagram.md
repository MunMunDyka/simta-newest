# Rancangan Spesifikasi Diagram SIMTA Bab IV (Revisi Final)

Dokumen ini berisi draf final spesifikasi diagram SIMTA Bab IV, yang terdiri dari **8 Activity Diagram (Gambar 4.3 s.d. Gambar 4.10)** dan **8 Sequence Diagram (Gambar 4.11 s.d. Gambar 4.18)**. Alur ini direvisi untuk menyerap proses revisi penguji dan dosen multiple role secara wajar tanpa menambah diagram terpisah, menggunakan istilah akademik non-teknis, serta meniadakan WhatsApp (menggunakan Email Notifikasi Otomatis).

---

## I. DAFTAR ACTIVITY DIAGRAM (Gambar 4.3 - Gambar 4.10)
*Aturan: Swimlane hanya menggunakan pihak yang bertanggung jawab (Aktor & Sistem). Tidak ada swimlane View/Controller/Model.*

### Gambar 4.3: Activity Diagram Login
- **Swimlane**: Pengguna, Sistem
- **Alur Langkah**:
  1. Mulai (Initial Node).
  2. Pengguna mengakses website SIMTA.
  3. Sistem menampilkan halaman login.
  4. Pengguna memasukkan NIM/NIP dan password, lalu menekan tombol login.
  5. Sistem memvalidasi kredensial.
  6. **Decision**: Apakah kredensial valid?
     - *Jika Tidak*: Sistem menampilkan pesan autentikasi gagal, lalu kembali ke halaman login.
     - *Jika Ya*: Lanjut ke pengecekan status akun.
  7. **Decision**: Apakah status akun aktif?
     - *Jika Tidak*: Sistem menampilkan pesan akun nonaktif, lalu kembali ke halaman login.
     - *Jika Ya*: Sistem mengidentifikasi peran (role) pengguna dan hak aksesnya.
  8. Sistem mengarahkan pengguna ke dashboard sesuai perannya (Mahasiswa / Dosen / Admin).
  9. Selesai (Final Node).

### Gambar 4.4: Activity Diagram Kelola User
- **Swimlane**: Admin, Sistem
- **Alur Langkah**:
  1. Mulai.
  2. Admin memilih menu Kelola Pengguna.
  3. Sistem menampilkan daftar pengguna dan tombol "Tambah Pengguna".
  4. Admin menekan tombol "Tambah Pengguna".
  5. Sistem menampilkan form Tambah Pengguna.
  6. Admin memasukkan data pengguna (NIM/NIP, Nama, Email, Peran) dan menekan tombol Simpan.
  7. Sistem memvalidasi input.
  8. **Decision**: Apakah NIM/NIP sudah terdaftar?
     - *Jika Ya*: Sistem menampilkan pesan error "NIM/NIP sudah terdaftar", lalu kembali ke form.
     - *Jika Tidak*: Sistem menyimpan data pengguna ke basis data dengan status aktif dan melakukan enkripsi kata sandi default.
  9. Sistem menampilkan pesan sukses dan memperbarui daftar pengguna pada layar.
  10. Selesai.

### Gambar 4.5: Activity Diagram Plotting Dosen Pembimbing
- **Swimlane**: Admin, Sistem
- **Alur Langkah**:
  1. Mulai.
  2. Admin memilih menu Plotting Dospem.
  3. Sistem menampilkan daftar mahasiswa dan pilihan dosen pembimbing.
  4. Admin memilih mahasiswa dan menentukan Dosen Pembimbing 1 serta Dosen Pembimbing 2.
  5. Admin menekan tombol Simpan.
  6. Sistem memvalidasi input.
  7. **Decision**: Apakah Dospem 1 sama dengan Dospem 2?
     - *Jika Ya*: Sistem menampilkan pesan error "Dosen Pembimbing 1 dan 2 tidak boleh sama", lalu kembali ke form.
     - *Jika Tidak*: Sistem menyimpan relasi dosen pembimbing untuk mahasiswa tersebut di basis data.
  8. Sistem menampilkan pesan sukses plotting dospem.
  9. Selesai.

### Gambar 4.6: Activity Diagram Kelola Jadwal Sidang
- **Swimlane**: Admin, Sistem
- **Alur Langkah**:
  1. Mulai.
  2. Admin mengakses menu Kelola Jadwal.
  3. Sistem menampilkan halaman kelola jadwal dan tombol "Tambah Jadwal".
  4. Admin menekan tombol "Tambah Jadwal".
  5. Sistem menampilkan form Tambah Jadwal.
  6. Admin mengisi data jadwal (Mahasiswa, Jenis Jadwal, Tanggal, Waktu Mulai/Selesai, Ruangan, Dosen Penguji 1 & 2) dan menekan tombol Simpan.
  7. Sistem memvalidasi bentrok ruangan dan peran dosen.
  8. **Decision**: Apakah ruangan bentrok pada waktu yang sama?
     - *Jika Ya*: Sistem menampilkan pesan error bentrok ruangan, lalu kembali ke form.
     - *Jika Tidak*: Lanjut ke pengecekan peran dosen.
  9. **Decision**: Apakah Dosen Penguji merangkap sebagai Dosen Pembimbing mahasiswa tersebut?
     - *Jika Ya*: Sistem menampilkan pesan error peran dilarang merangkap, lalu kembali ke form.
     - *Jika Tidak*: Sistem menyimpan jadwal sidang ke basis data.
  10. Sistem menyinkronkan penguji_1 dan penguji_2 ke data mahasiswa di basis data secara otomatis.
  11. Sistem memperbarui status akademik mahasiswa sesuai tahap jadwal sidang yang dibuat (misalnya: "Terjadwal Sidang Sempro" / "Terjadwal Sidang Akhir").
  12. Sistem mengirimkan Email Notifikasi Otomatis jadwal sidang ke Mahasiswa, Pembimbing, dan Penguji.
  13. Sistem menampilkan notifikasi sukses pembuatan jadwal di layar.
  14. Selesai.

### Gambar 4.7: Activity Diagram Pengajuan Bimbingan
- **Swimlane**: Mahasiswa, Sistem
- **Alur Langkah**:
  1. Mulai.
  2. Mahasiswa mengakses menu Bimbingan.
  3. Sistem menampilkan halaman riwayat bimbingan dan tombol "Pengajuan Baru".
  4. Mahasiswa menekan tombol "Pengajuan Baru".
  5. Sistem memeriksa status antrean dokumen mahasiswa.
  6. **Decision**: Apakah ada dokumen bimbingan berstatus Menunggu Review?
     - *Jika Ya*: Sistem menampilkan pesan error "Ada bimbingan dalam antrean", lalu kembali ke riwayat bimbingan.
     - *Jika Tidak*: Lanjut ke pengecekan fase akademik.
  7. **Decision**: Apakah mahasiswa sedang dalam fase revisi (Sempro/Semhas/Sidang Akhir)?
     - *Jika Ya (Fase Revisi)*: Sistem menampilkan form pengisian dosen penguji, kolom revisi, dan input unggah PDF revisi (dokumen diarahkan ke Dosen Penguji).
     - *Jika Tidak (Bimbingan Normal)*: Sistem menampilkan form pengisian dosen pembimbing, kolom bimbingan, dan input unggah PDF bimbingan (dokumen diarahkan ke Dosen Pembimbing).
  8. Mahasiswa melengkapi data pengajuan, mengunggah dokumen PDF, lalu menekan tombol Kirim.
  9. Sistem menyimpan berkas bimbingan/revisi ke basis data dengan status "Menunggu Review" dan membuat nomor versi baru otomatis.
  10. Sistem mengirimkan Email Notifikasi Otomatis pengajuan dokumen ke Dosen terkait (Pembimbing atau Penguji).
  11. Sistem menampilkan notifikasi sukses pengajuan di layar.
  12. Selesai.

### Gambar 4.8: Activity Diagram Dosen Review Bimbingan
- **Swimlane**: Dosen (Pembimbing/Penguji), Sistem
- **Alur Langkah**:
  1. Mulai.
  2. Dosen mengakses menu Review Bimbingan.
  3. Sistem menampilkan daftar dokumen masuk (bimbingan atau revisi) yang berstatus Menunggu Review.
  4. Dosen memilih dokumen mahasiswa, sistem memuat berkas PDF (mode baca) dan form evaluasi.
  5. Dosen mengisi catatan evaluasi, memilih status persetujuan, dan menekan tombol Simpan.
     - *Keterangan Pilihan Status*:
       - Jika Dosen bertindak sebagai Pembimbing: **Revisi**, **Lanjut Bab**, **ACC**, **ACC Sempro**.
       - Jika Dosen bertindak sebagai Penguji: **Revisi**, **ACC**.
  6. Sistem memvalidasi pilihan status dosen.
  7. **Decision**: Apakah status yang dipilih Dosen adalah "ACC Sempro"?
     - *Jika Ya*: Sistem memeriksa total sesi bimbingan yang telah diselesaikan mahasiswa dengan pembimbing terkait.
       - **Decision**: Apakah total sesi bimbingan >= 5?
         - *Jika Tidak*: Sistem membatalkan penyimpanan, menampilkan pesan error "Syarat bimbingan minimal 5 kali belum terpenuhi", lalu kembali ke form evaluasi.
         - *Jika Ya*: Lanjut ke penyimpanan.
     - *Jika Tidak*: Lanjut ke penyimpanan.
  8. Sistem menyimpan catatan evaluasi dan mengubah status dokumen menjadi Ter-review (ACC / Revisi) di basis data.
  9. **Decision**: Apakah status yang dipilih Dosen adalah "Lanjut Bab"?
     - *Jika Ya*: Sistem memperbarui progress akademik mahasiswa ke bab berikutnya (misal: Bab I -> Bab II) secara otomatis di basis data.
     - *Jika Tidak*: Status progress tetap.
  10. Sistem mengirimkan Email Notifikasi Otomatis umpan balik (feedback) hasil evaluasi ke Mahasiswa.
  11. Sistem menampilkan notifikasi sukses simpan review di layar.
  12. Selesai.

### Gambar 4.9: Activity Diagram Diskusi Reply Komentar
- **Swimlane**: Pengguna (Mahasiswa/Dosen), Sistem
- **Alur Langkah**:
  1. Mulai.
  2. Pengguna membuka halaman detail riwayat bimbingan tertentu.
  3. Sistem menampilkan thread diskusi dokumen dan form komentar balasan.
  4. Pengguna memasukkan komentar balasan pada kolom, lalu menekan tombol Kirim.
  5. Sistem memvalidasi keterlibatan pengguna dalam dokumen bimbingan tersebut.
  6. **Decision**: Apakah pengguna terlibat langsung dalam dokumen bimbingan ini?
     - *Jika Tidak*: Sistem menolak akses dan menampilkan pesan error.
     - *Jika Ya*: Sistem menyimpan data komentar balasan ke basis data.
  7. Sistem memperbarui tampilan thread diskusi dokumen secara real-time.
  8. Selesai.

### Gambar 4.10: Activity Diagram Lihat Jadwal Sidang
- **Swimlane**: Pengguna, Sistem
- **Alur Langkah**:
  1. Mulai.
  2. Pengguna mengakses menu Jadwal Sidang.
  3. Sistem mengidentifikasi peran aktif pengguna.
  4. **Decision**: Berdasarkan Peran Pengguna:
     - *Admin*: Sistem mengambil seluruh data jadwal sidang di basis data.
     - *Dosen*: Sistem mengambil jadwal sidang di mana NIP dosen terdaftar sebagai Penguji 1 atau Penguji 2.
     - *Mahasiswa*: Sistem mengambil jadwal sidang di mana NIM mahasiswa terdaftar sebagai peserta sidang.
  5. Sistem menampilkan daftar jadwal sidang yang sesuai dalam bentuk tabel informasi di layar.
  6. Selesai.

---

## II. DAFTAR SEQUENCE DIAGRAM (Gambar 4.11 - Gambar 4.18)
*Aturan: Urutan lifeline dari kiri ke kanan adalah Aktor -> View (Boundary) -> Controller -> Model/Database (terletak paling kanan).*

### Gambar 4.11: Sequence Diagram Login
- **Lifeline**:
  - `Pengguna` (Aktor)
  - `LoginView` (View)
  - `authController` (Controller)
  - `User(Model)` (Model/Database)
- **Alur Langkah**:
  1. Pengguna -> LoginView: Mengakses website SIMTA.
  2. LoginView -> Pengguna: Menampilkan form login.
  3. Pengguna -> LoginView: Memasukkan NIM/NIP dan password, lalu menekan tombol login.
  4. LoginView -> authController: Mengirim request login berisi NIM/NIP dan password.
  5. authController -> User(Model): Mencari data user berdasarkan NIM/NIP.
  6. User(Model) -> authController: Mengembalikan data user atau null.
  7. authController -> authController: Memverifikasi password dan memeriksa status akun (aktif/nonaktif).
  8. **Combined Fragment (alt)**:
     - *[Kredensial salah atau akun nonaktif]*:
       - authController -> LoginView: Mengembalikan pesan gagal login.
       - LoginView -> Pengguna: Menampilkan pesan error di layar.
     - *[Login berhasil]*:
       - authController -> LoginView: Mengembalikan token, role, dan data user.
       - LoginView -> Pengguna: Mengarahkan ke dashboard utama sesuai role.

### Gambar 4.12: Sequence Diagram Admin Kelola Data User
- **Lifeline**:
  - `Admin` (Aktor)
  - `ManajemenUserView` (View)
  - `userController` (Controller)
  - `User(Model)` (Model/Database)
- **Alur Langkah**:
  1. Admin -> ManajemenUserView: Mengakses menu Kelola Pengguna.
  2. ManajemenUserView -> Admin: Menampilkan halaman kelola pengguna.
  3. Admin -> ManajemenUserView: Memasukkan data pengguna baru (NIM/NIP, Nama, Email, Peran) dan menekan Simpan.
  4. ManajemenUserView -> userController: Mengirim request pembuatan pengguna baru.
  5. userController -> User(Model): Mencari data user berdasarkan NIM/NIP.
  6. User(Model) -> userController: Mengembalikan data user atau null.
  7. **Combined Fragment (alt)**:
     - *[NIM/NIP belum terdaftar]*:
       - userController -> userController: Melakukan enkripsi kata sandi default.
       - userController -> User(Model): Menyimpan data pengguna baru.
       - User(Model) -> userController: Mengembalikan konfirmasi penyimpanan berhasil.
       - userController -> ManajemenUserView: Mengembalikan pesan sukses pembuatan user.
       - ManajemenUserView -> Admin: Menampilkan notifikasi sukses di layar.
     - *[NIM/NIP sudah terdaftar]*:
       - userController -> ManajemenUserView: Mengembalikan pesan error "Akun sudah terdaftar".
       - ManajemenUserView -> Admin: Menampilkan pesan kesalahan di layar.

### Gambar 4.13: Sequence Diagram Admin Plotting Dosen Pembimbing
- **Lifeline**:
  - `Admin` (Aktor)
  - `PlottingDospemView` (View)
  - `userController` (Controller)
  - `User(Model)` (Model/Database)
- **Alur Langkah**:
  1. Admin -> PlottingDospemView: Mengakses menu Plotting Dospem.
  2. PlottingDospemView -> Admin: Menampilkan halaman plotting dan daftar dospem.
  3. Admin -> PlottingDospemView: Memilih mahasiswa dan menentukan Dospem 1 & Dospem 2.
  4. PlottingDospemView -> userController: Mengirim request plotting dospem.
  5. userController -> userController: Memvalidasi dospem 1 dan dospem 2 tidak sama.
  6. **Combined Fragment (alt)**:
     - *[Dospem 1 != Dospem 2]*:
       - userController -> User(Model): Memperbarui field dospem_1 dan dospem_2 mahasiswa.
       - User(Model) -> userController: Mengembalikan konfirmasi pembaruan sukses.
       - userController -> PlottingDospemView: Mengembalikan pesan sukses plotting.
       - PlottingDospemView -> Admin: Menampilkan notifikasi sukses.
     - *[Dospem 1 == Dospem 2]*:
       - userController -> PlottingDospemView: Mengembalikan pesan error "Dosen pembimbing tidak boleh sama".
       - PlottingDospemView -> Admin: Menampilkan pesan kesalahan di layar.

### Gambar 4.14: Sequence Diagram Admin Kelola Jadwal Sidang
- **Lifeline**:
  - `Admin` (Aktor)
  - `KelolaJadwalView` (View)
  - `jadwalController` (Controller)
  - `Jadwal(Model)` (Model/Database)
  - `User(Model)` (Model/Database)
  - `emailService` (Controller/Layanan)
- **Alur Langkah**:
  1. Admin -> KelolaJadwalView: Mengakses menu Kelola Jadwal.
  2. KelolaJadwalView -> Admin: Menampilkan halaman kelola jadwal & form input.
  3. Admin -> KelolaJadwalView: Memasukkan data jadwal sidang baru (peserta, ruangan, penguji 1 & 2).
  4. KelolaJadwalView -> jadwalController: Mengirim request pembuatan jadwal sidang.
  5. jadwalController -> Jadwal(Model): Memeriksa ketersediaan ruangan dan waktu.
  6. Jadwal(Model) -> jadwalController: Mengembalikan data jadwal bentrok atau kosong.
  7. jadwalController -> jadwalController: Memeriksa apakah dosen penguji merangkap sebagai dospem mahasiswa.
  8. **Combined Fragment (alt)**:
     - *[Ruangan bentrok atau dosen merangkap]*:
       - jadwalController -> KelolaJadwalView: Mengembalikan pesan error konflik penjadwalan.
       - KelolaJadwalView -> Admin: Menampilkan pesan error di layar.
     - *[Valid / Bebas konflik]*:
       - jadwalController -> Jadwal(Model): Menyimpan jadwal sidang baru.
       - Jadwal(Model) -> jadwalController: Mengembalikan konfirmasi penyimpanan sukses.
       - jadwalController -> User(Model): Sinkronisasi data penguji_1 dan penguji_2, serta perbarui status akademik mahasiswa.
       - User(Model) -> jadwalController: Mengembalikan konfirmasi sinkronisasi sukses.
       - jadwalController -> emailService: Mengirim Email Notifikasi Otomatis jadwal ke mahasiswa & dosen.
       - jadwalController -> KelolaJadwalView: Mengembalikan pesan sukses penjadwalan.
       - KelolaJadwalView -> Admin: Menampilkan notifikasi sukses.

### Gambar 4.15: Sequence Diagram Mahasiswa Upload Bimbingan
- **Lifeline**:
  - `Mahasiswa` (Aktor)
  - `BimbinganView` (View)
  - `bimbinganController` (Controller)
  - `User(Model)` (Model/Database)
  - `Bimbingan(Model)` (Model/Database)
- **Alur Langkah**:
  1. Mahasiswa -> BimbinganView: Mengakses menu bimbingan.
  2. BimbinganView -> Mahasiswa: Menampilkan Halaman Bimbingan & Form Unggah.
  3. Mahasiswa -> BimbinganView: Mengunggah dokumen PDF bimbingan/revisi (sesuai fase revisi/normal).
  4. BimbinganView -> bimbinganController: Mengirim file PDF dan detail pengajuan (target dosen pembimbing atau penguji).
  5. bimbinganController -> User(Model): Mencari data profil & status akademis mahasiswa.
  6. User(Model) -> bimbinganController: Mengembalikan data mahasiswa.
  7. bimbinganController -> Bimbingan(Model): Memeriksa keberadaan bimbingan/revisi berstatus Menunggu Review.
  8. Bimbingan(Model) -> bimbinganController: Mengembalikan data antrean bimbingan (ada/tidak).
  9. **Combined Fragment (alt)**:
     - *[Tidak ada antrean bimbingan menunggu]*:
       - bimbinganController -> Bimbingan(Model): Menyimpan berkas bimbingan/revisi baru & generate versi otomatis.
       - Bimbingan(Model) -> bimbinganController: Mengembalikan konfirmasi penyimpanan sukses.
       - bimbinganController -> BimbinganView: Mengembalikan pesan sukses unggah.
       - BimbinganView -> Mahasiswa: Menampilkan notifikasi sukses di layar.
     - *[Ada antrean bimbingan menunggu]*:
       - bimbinganController -> BimbinganView: Mengembalikan pesan error "Bimbingan sebelumnya belum direview".
       - BimbinganView -> Mahasiswa: Menampilkan pesan error di layar.

### Gambar 4.16: Sequence Diagram Dosen Review Bimbingan
- **Lifeline**:
  - `Dosen` (Aktor)
  - `ReviewView` (View)
  - `bimbinganController` (Controller)
  - `Bimbingan(Model)` (Model/Database)
  - `User(Model)` (Model/Database)
  - `emailService` (Controller/Layanan)
- **Alur Langkah**:
  1. Dosen -> ReviewView: Mengakses menu Review Bimbingan.
  2. ReviewView -> Dosen: Menampilkan daftar bimbingan mahasiswa.
  3. Dosen -> ReviewView: Memasukkan catatan evaluasi, memilih status persetujuan, dan menekan Simpan.
  4. ReviewView -> bimbinganController: Mengirim catatan evaluasi & status review.
  5. bimbinganController -> Bimbingan(Model): Mencari data dokumen bimbingan terkait.
  6. Bimbingan(Model) -> bimbinganController: Mengembalikan data bimbingan.
  7. bimbinganController -> Bimbingan(Model): Menghitung total bimbingan diselesaikan mahasiswa (jika status == ACC Sempro).
  8. Bimbingan(Model) -> bimbinganController: Mengembalikan jumlah sesi.
  9. **Combined Fragment (alt)**:
     - *[Jumlah bimbingan < 5 untuk ACC Sempro]*:
       - bimbinganController -> ReviewView: Mengembalikan pesan error syarat minimal bimbingan kurang.
       - ReviewView -> Dosen: Menampilkan pesan kesalahan di layar.
     - *[Memenuhi syarat (sesi >= 5 atau status bukan ACC Sempro)]*:
       - bimbinganController -> Bimbingan(Model): Menyimpan umpan balik dan memperbarui status dokumen.
       - Bimbingan(Model) -> bimbinganController: Mengembalikan konfirmasi sukses update.
       - **Combined Fragment (opt)** `[Jika status == Lanjut Bab]`:
         - bimbinganController -> User(Model): Memperbarui progress akademik mahasiswa ke bab berikutnya di database.
         - User(Model) -> bimbinganController: Mengembalikan konfirmasi update progress.
       - bimbinganController -> emailService: Mengirimkan Email Notifikasi Otomatis umpan balik ke Mahasiswa.
       - bimbinganController -> ReviewView: Mengembalikan pesan sukses review.
       - ReviewView -> Dosen: Menampilkan notifikasi sukses di layar.

### Gambar 4.17: Sequence Diagram Diskusi Reply Komentar
- **Lifeline**:
  - `Pengguna` (Aktor)
  - `DetailBimbinganView` (View)
  - `bimbinganController` (Controller)
  - `Bimbingan(Model)` (Model/Database)
  - `Reply(Model)` (Model/Database)
- **Alur Langkah**:
  1. Pengguna -> DetailBimbinganView: Membuka detail dokumen bimbingan.
  2. DetailBimbinganView -> Pengguna: Menampilkan thread diskusi bimbingan.
  3. Pengguna -> DetailBimbinganView: Menulis balasan komentar baru dan menekan tombol Kirim.
  4. DetailBimbinganView -> bimbinganController: Mengirim data balasan komentar.
  5. bimbinganController -> Bimbingan(Model): Mencari data dokumen bimbingan terkait.
  6. Bimbingan(Model) -> bimbinganController: Mengembalikan data dokumen bimbingan.
  7. bimbinganController -> bimbinganController: Memvalidasi keterlibatan pengguna dalam bimbingan.
  8. **Combined Fragment (alt)**:
     - *[Pengguna Terlibat / Valid]*:
       - bimbinganController -> Reply(Model): Menyimpan data komentar balasan baru ke basis data.
       - Reply(Model) -> bimbinganController: Mengembalikan konfirmasi penyimpanan.
       - bimbinganController -> DetailBimbinganView: Memperbarui thread diskusi bimbingan.
       - DetailBimbinganView -> Pengguna: Menampilkan balasan komentar baru di UI.
     - *[Akses Ditolak]*:
       - bimbinganController -> DetailBimbinganView: Mengembalikan pesan error "Akses ditolak".
       - DetailBimbinganView -> Pengguna: Menampilkan pesan kesalahan di layar.

### Gambar 4.18: Sequence Diagram Lihat Jadwal Sidang
- **Lifeline**:
  - `Pengguna` (Aktor)
  - `JadwalSidangView` (View)
  - `jadwalController` (Controller)
  - `Jadwal(Model)` (Model/Database)
- **Alur Langkah**:
  1. Pengguna -> JadwalSidangView: Mengakses halaman jadwal sidang.
  2. JadwalSidangView -> Pengguna: Menampilkan halaman jadwal sidang.
  3. Pengguna -> JadwalSidangView: Memilih menu untuk melihat jadwal sidang.
  4. JadwalSidangView -> jadwalController: Meminta data jadwal sidang sesuai peran aktif pengguna.
  5. jadwalController -> Jadwal(Model): Mengambil data jadwal sidang berdasarkan parameter filter peran dari basis data.
  6. Jadwal(Model) -> jadwalController: Mengembalikan daftar data jadwal sidang.
  7. jadwalController -> JadwalSidangView: Mengirimkan daftar data jadwal sidang.
  8. JadwalSidangView -> Pengguna: Menampilkan daftar jadwal sidang pada tabel.
