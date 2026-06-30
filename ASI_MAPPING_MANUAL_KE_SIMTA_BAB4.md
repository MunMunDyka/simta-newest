# Analisis Mapping ASI Sistem Berjalan ke SIMTA untuk BAB IV

Dokumen ini berisi hasil analisis source code SIMTA untuk mendukung penyusunan BAB IV bagian "Aliran Sistem Informasi Sistem yang Diusulkan". Analisis ini hanya menggunakan fitur yang ditemukan pada source code frontend dan backend, sehingga fitur yang belum ditemukan tidak dimasukkan sebagai kemampuan penuh sistem.

Judul penelitian:

**Pengembangan Sistem Manajemen Tugas Akhir Terintegrasi Berbasis Web untuk Optimalisasi Proses Bimbingan (Studi Kasus: Fakultas Teknologi Informasi)**

## 1. Ruang Lingkup Analisis Source Code

Analisis dilakukan pada komponen utama berikut:

| Area | Source code bukti |
| --- | --- |
| Routing dan proteksi halaman | `frontend/src/App.tsx`, `frontend/src/components/ProtectedRoute.tsx` |
| API client dan token | `frontend/src/lib/api.ts` |
| Autentikasi dan role user | `backend/router/authRoutes.js`, `backend/controller/authController.js`, `backend/middleware/authMiddleware.js`, `backend/middleware/roleMiddleware.js`, `backend/models/User.js` |
| Dashboard mahasiswa | `frontend/src/pages/Dashboard/Mahasiswa/DashboardMhs.tsx` |
| Dashboard dosen | `frontend/src/pages/Dashboard/Dosen/DashboardDosen.tsx` |
| Dashboard admin | `frontend/src/pages/Admin/DashboardAdmin.tsx` |
| Bimbingan mahasiswa dan dosen | `frontend/src/pages/Bimbingan/Mahasiswa/BimbinganMahasiswa.tsx`, `frontend/src/pages/Bimbingan/Dosen/BimbinganDosen.tsx`, `frontend/src/pages/Bimbingan/Dosen/ListMahasiswaBimbingan.tsx` |
| API bimbingan | `frontend/src/services/bimbinganService.ts`, `backend/router/bimbinganRoutes.js`, `backend/controller/bimbinganController.js`, `backend/models/Bimbingan.js`, `backend/models/Reply.js` |
| Manajemen user dan plotting dosen | `frontend/src/pages/Admin/ManajemenUser.tsx`, `frontend/src/pages/Admin/ManajemenUserMahasiswa.tsx`, `frontend/src/pages/Admin/ManajemenUserDosen.tsx`, `backend/router/userRoutes.js`, `backend/controller/userController.js` |
| Kelola jadwal sidang | `frontend/src/pages/Admin/KelolaJadwal.tsx`, `frontend/src/pages/Jadwal/JadwalSidang.tsx`, `frontend/src/pages/Dosen/JadwalPenguji.tsx`, `backend/router/jadwalRoutes.js`, `backend/controller/jadwalController.js`, `backend/models/Jadwal.js` |
| Surat persetujuan sempro | `backend/controller/bimbinganController.js`, `backend/services/documentService.js` |
| Wisuda/kelulusan | `frontend/src/pages/Admin/VerifikasiWisuda.tsx`, `frontend/src/services/wisudaService.ts`, `backend/router/userRoutes.js`, `backend/controller/userController.js`, `backend/models/User.js` |
| Notifikasi email/WhatsApp | `backend/services/emailService.js`, `backend/services/whatsappService.js`, pemanggilan pada `backend/controller/bimbinganController.js` dan `backend/controller/jadwalController.js` |

## 2. Ringkasan Penilaian

Secara umum, SIMTA sudah mengomputerisasi proses inti tugas akhir yang berkaitan dengan login berbasis role, bimbingan digital, unggah dokumen PDF, feedback dosen, riwayat bimbingan, reply/komentar, status bimbingan, plotting dosen pembimbing dan penguji, penjadwalan sidang, input hasil sidang oleh admin, revisi pasca sidang ke penguji, serta upload dan verifikasi berkas wisuda.

Bagian yang masih bersifat sebagian adalah proses pengajuan seminar proposal, seminar hasil, dan sidang akhir sebagai "form pendaftaran berkas" khusus oleh mahasiswa. Pada source code, kelayakan mahasiswa lebih banyak ditentukan dari status bimbingan, status akademik, ACC dosen, dan jadwal yang dibuat admin. Modul khusus "pendaftaran sidang oleh mahasiswa" atau "aktivasi link pendaftaran sidang akhir" tidak ditemukan sebagai fitur tersendiri.

## 3. Tabel Mapping ASI Sistem Berjalan ke SIMTA

| No | Proses pada Sistem yang Sedang Berjalan | Aktor Manual | Apakah Sudah Terkomputerisasi? | Fitur/Halaman/API pada SIMTA | Aktor pada Sistem Usulan | Penjelasan Singkat Perubahan Proses |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Mahasiswa menyusun draft Bab 1-3. | Mahasiswa | Sebagian | `User.currentProgress` pada `backend/models/User.js`, tampilan progress pada `frontend/src/pages/Dashboard/Mahasiswa/DashboardMhs.tsx` | Mahasiswa, Sistem SIMTA | Sistem mencatat progress bab mahasiswa, tetapi proses penulisan draft tetap dilakukan di luar sistem. SIMTA berperan sebagai pencatat tahap dan media unggah dokumen. |
| 2 | Mahasiswa menyerahkan dokumen bimbingan dan form bimbingan kepada dosen pembimbing. | Mahasiswa, Dosen Pembimbing | Ya | `frontend/src/pages/Bimbingan/Mahasiswa/BimbinganMahasiswa.tsx`, `POST /api/bimbingan`, `backend/controller/bimbinganController.js`, `backend/models/Bimbingan.js` | Mahasiswa, Sistem SIMTA, Dosen Pembimbing | Penyerahan dokumen berubah dari fisik/manual menjadi unggah PDF ke sistem. Sistem menyimpan file, judul, catatan, dosen tujuan, dan versi dokumen. |
| 3 | Dosen pembimbing memeriksa dokumen, memberi catatan revisi, dan menyetujui dokumen jika sudah sesuai. | Dosen Pembimbing | Ya | `frontend/src/pages/Bimbingan/Dosen/BimbinganDosen.tsx`, `PUT /api/bimbingan/:id/feedback`, `backend/controller/bimbinganController.js` | Dosen Pembimbing, Sistem SIMTA | Review dilakukan melalui sistem dengan status `revisi`, `acc`, `lanjut_bab`, atau `acc_sempro`, disertai feedback teks dan lampiran PDF opsional. |
| 4 | Mahasiswa mengajukan seminar proposal dengan melengkapi berkas. | Mahasiswa | Sebagian | `GET /api/bimbingan/sempro-status/:mahasiswaId`, `GET /api/bimbingan/generate-surat-sempro/:mahasiswaId`, `frontend/src/pages/Dashboard/Mahasiswa/DashboardMhs.tsx` | Mahasiswa, Sistem SIMTA | Sistem memeriksa kesiapan sempro berdasarkan jumlah bimbingan dan ACC dospem. Namun, form pengajuan sempro dan upload berkas pendaftaran sempro khusus belum ditemukan sebagai modul tersendiri. |
| 5 | Koordinator Tugas Akhir memeriksa kelengkapan berkas seminar proposal. | Koordinator TA | Sebagian | `frontend/src/pages/Admin/KelolaBimbingan.tsx`, `backend/controller/bimbinganController.js`, `backend/services/documentService.js` | Admin/Koordinator TA, Sistem SIMTA | Admin dapat melihat status bimbingan dan data kesiapan. Pemeriksaan kelengkapan berkas sempro secara khusus belum ditemukan sebagai workflow verifikasi terpisah. |
| 6 | Koordinator Tugas Akhir menentukan jadwal seminar proposal dan dosen penguji. | Koordinator TA | Ya | `frontend/src/pages/Admin/KelolaJadwal.tsx`, `POST /api/jadwal`, `backend/controller/jadwalController.js`, `backend/models/Jadwal.js` | Admin/Koordinator TA, Sistem SIMTA | Admin membuat jadwal `sidang_proposal`, menetapkan tanggal, waktu, ruangan, dan penguji. Sistem memvalidasi dosen penguji, bentrok jadwal, dan ruangan. |
| 7 | Mahasiswa, dosen pembimbing, dan dosen penguji menerima informasi jadwal seminar proposal. | Mahasiswa, Dosen Pembimbing, Dosen Penguji | Sebagian | `frontend/src/pages/Jadwal/JadwalSidang.tsx`, `frontend/src/pages/Dosen/JadwalPenguji.tsx`, `backend/services/emailService.js`, `backend/services/whatsappService.js` | Mahasiswa, Dosen, Sistem SIMTA | Jadwal dapat dilihat melalui halaman jadwal. Notifikasi email/WhatsApp tersedia pada backend, tetapi pengiriman bergantung konfigurasi. Tampilan khusus dosen penguji ada; dosen pembimbing dapat melihat jadwal melalui jadwal global. |
| 8 | Dosen penguji memberi hasil/catatan revisi seminar proposal. | Dosen Penguji | Sebagian | `PUT /api/jadwal/:id` untuk hasil sidang, `frontend/src/pages/Admin/KelolaJadwal.tsx`, revisi melalui `PUT /api/bimbingan/:id/feedback` | Admin/Koordinator TA, Dosen Penguji, Sistem SIMTA | Hasil/nilai/catatan sidang diinput oleh admin pada jadwal. Penguji memberi feedback revisi melalui modul bimbingan revisi setelah status mahasiswa masuk fase revisi. Tidak ditemukan form input hasil sidang langsung oleh penguji. |
| 9 | Mahasiswa melakukan revisi seminar proposal. | Mahasiswa | Ya | `frontend/src/pages/Bimbingan/Mahasiswa/BimbinganMahasiswa.tsx`, `backend/controller/bimbinganController.js`, status `revisi_sempro` pada `backend/models/User.js` | Mahasiswa, Dosen Penguji, Sistem SIMTA | Setelah sempro selesai dengan revisi, sistem mengarahkan unggahan revisi ke penguji melalui `dosenType` `penguji_1` atau `penguji_2`. |
| 10 | Setelah disetujui, mahasiswa melanjutkan penyusunan Bab 4-6. | Mahasiswa, Dosen Penguji | Ya | Logic double ACC penguji pada `backend/controller/bimbinganController.js`, `User.statusMahasiswa`, `User.currentProgress` | Sistem SIMTA, Mahasiswa | Jika kedua penguji memberi ACC revisi sempro, status mahasiswa berubah ke `bimbingan_lanjut` dan progress dapat berubah ke `BAB IV`. |
| 11 | Mahasiswa kembali melakukan bimbingan dengan dosen pembimbing. | Mahasiswa, Dosen Pembimbing | Ya | `POST /api/bimbingan`, status `bimbingan_lanjut`, `dospem_1`, `dospem_2` | Mahasiswa, Dosen Pembimbing, Sistem SIMTA | Setelah revisi penguji selesai, sistem membuka kembali bimbingan ke dosen pembimbing. |
| 12 | Mahasiswa mengajukan seminar hasil. | Mahasiswa | Sebagian | Status `menunggu_semhas` pada `backend/models/User.js`, ACC dospem pada `backend/controller/bimbinganController.js`, jadwal `sidang_semhas` | Mahasiswa, Sistem SIMTA, Admin | Sistem mendukung status siap semhas dan jadwal semhas, tetapi tidak ditemukan form pengajuan semhas khusus oleh mahasiswa. |
| 13 | Koordinator Tugas Akhir memeriksa berkas seminar hasil dan menentukan jadwal seminar hasil. | Koordinator TA | Sebagian | `frontend/src/pages/Admin/KelolaJadwal.tsx`, `backend/controller/jadwalController.js` | Admin/Koordinator TA, Sistem SIMTA | Penjadwalan semhas sudah ada melalui jenis jadwal `sidang_semhas`. Pemeriksaan berkas semhas khusus belum ditemukan sebagai modul verifikasi tersendiri. |
| 14 | Dosen penguji menerima jadwal, melakukan penilaian, dan memberikan catatan revisi seminar hasil. | Dosen Penguji | Sebagian | `frontend/src/pages/Dosen/JadwalPenguji.tsx`, `frontend/src/pages/Admin/KelolaJadwal.tsx`, `frontend/src/pages/Bimbingan/Dosen/BimbinganDosen.tsx` | Dosen Penguji, Admin/Koordinator TA, Sistem SIMTA | Penguji melihat jadwal. Nilai/hasil diinput admin. Revisi semhas ditangani melalui modul bimbingan revisi ke penguji. |
| 15 | Mahasiswa memperbaiki revisi seminar hasil. | Mahasiswa | Ya | Status `revisi_semhas`, `POST /api/bimbingan`, `PUT /api/bimbingan/:id/feedback` | Mahasiswa, Dosen Penguji, Sistem SIMTA | Mahasiswa mengunggah file revisi ke penguji. Jika kedua penguji ACC, status naik ke `bimbingan_akhir`. |
| 16 | Setelah disetujui, Koordinator Tugas Akhir mengaktifkan link pendaftaran sidang akhir. | Koordinator TA | Belum | Tidak ditemukan modul aktivasi link pendaftaran sidang akhir | Admin/Koordinator TA | Source code tidak menunjukkan fitur aktivasi link pendaftaran. Alur yang ada adalah status akademik dan pembuatan jadwal oleh admin. |
| 17 | Mahasiswa mengisi pendaftaran sidang akhir. | Mahasiswa | Belum | Tidak ditemukan form pendaftaran sidang akhir oleh mahasiswa | Mahasiswa | SIMTA belum memiliki modul pendaftaran sidang akhir yang diisi mahasiswa. Untuk ASI usulan, bagian ini sebaiknya tidak digambarkan sebagai fitur penuh. |
| 18 | Koordinator Tugas Akhir menentukan jadwal sidang akhir. | Koordinator TA | Ya | Jenis jadwal `sidang_skripsi`, `frontend/src/pages/Admin/KelolaJadwal.tsx`, `POST /api/jadwal` | Admin/Koordinator TA, Sistem SIMTA | Admin membuat jadwal sidang akhir, menentukan ruangan, waktu, dan penguji. |
| 19 | Mahasiswa, dosen pembimbing, dan dosen penguji menerima jadwal sidang akhir. | Mahasiswa, Dosen Pembimbing, Dosen Penguji | Sebagian | `frontend/src/pages/Jadwal/JadwalSidang.tsx`, `frontend/src/pages/Dosen/JadwalPenguji.tsx`, `backend/services/emailService.js`, `backend/services/whatsappService.js` | Mahasiswa, Dosen, Sistem SIMTA | Jadwal ditampilkan di sistem. Notifikasi tersedia secara backend tetapi bergantung konfigurasi layanan. |
| 20 | Mahasiswa melaksanakan sidang akhir. | Mahasiswa, Dosen Penguji | Sebagian | `Jadwal.status`, `hasil`, `nilaiSidang`, `catatan` pada `backend/models/Jadwal.js` dan `frontend/src/pages/Admin/KelolaJadwal.tsx` | Admin/Koordinator TA, Mahasiswa, Dosen Penguji | Pelaksanaan sidang tetap kegiatan akademik offline. Sistem mencatat jadwal, status, hasil, nilai, dan catatan. |
| 21 | Dosen penguji memberikan hasil sidang akhir. | Dosen Penguji | Sebagian | `PUT /api/jadwal/:id`, `frontend/src/pages/Admin/KelolaJadwal.tsx`, `PUT /api/bimbingan/:id/feedback` | Admin/Koordinator TA, Dosen Penguji, Sistem SIMTA | Hasil sidang akhir dicatat oleh admin pada jadwal. Feedback revisi penguji tersedia melalui modul bimbingan revisi, bukan form hasil sidang langsung milik penguji. |
| 22 | Mahasiswa menyelesaikan revisi akhir dan memenuhi berkas kelulusan/yudisium. | Mahasiswa | Ya | Status `revisi_sidang`, `persiapan_wisuda`, `selesai`; `POST /api/users/upload-wisuda`; `PUT /api/users/:id/verifikasi-wisuda`; `frontend/src/pages/Admin/VerifikasiWisuda.tsx` | Mahasiswa, Dosen Penguji, Admin/Koordinator TA, Sistem SIMTA | Revisi akhir dilakukan melalui bimbingan penguji. Setelah selesai, mahasiswa mengunggah 4 berkas wisuda dan admin memverifikasi. Jika disetujui, status mahasiswa menjadi `selesai`. |

## 4. Fitur yang Sudah Terkomputerisasi dan Layak Masuk ASI Usulan

Fitur berikut layak dimasukkan ke ASI Sistem yang Diusulkan karena ditemukan implementasinya pada source code:

1. Login pengguna dan pembatasan akses berbasis role.
   - Bukti: `frontend/src/App.tsx`, `frontend/src/components/ProtectedRoute.tsx`, `backend/router/authRoutes.js`, `backend/controller/authController.js`, `backend/middleware/authMiddleware.js`.

2. Dashboard sesuai role mahasiswa, dosen, dan admin.
   - Bukti: `frontend/src/pages/Dashboard/Mahasiswa/DashboardMhs.tsx`, `frontend/src/pages/Dashboard/Dosen/DashboardDosen.tsx`, `frontend/src/pages/Admin/DashboardAdmin.tsx`.

3. Upload dokumen bimbingan PDF oleh mahasiswa.
   - Bukti: `frontend/src/pages/Bimbingan/Mahasiswa/BimbinganMahasiswa.tsx`, `frontend/src/services/bimbinganService.ts`, `backend/router/bimbinganRoutes.js`, `backend/controller/bimbinganController.js`.

4. Pemilihan dosen tujuan bimbingan berdasarkan dosen pembimbing atau dosen penguji.
   - Bukti: `dosenType` pada `backend/models/Bimbingan.js`, pemetaan `dospem_1`, `dospem_2`, `penguji_1`, `penguji_2` pada `backend/controller/bimbinganController.js`.

5. Versioning dokumen bimbingan.
   - Bukti: field `version` dan method `getNextVersion()` pada `backend/models/Bimbingan.js`.

6. Riwayat bimbingan, feedback, status bimbingan, dan lampiran feedback.
   - Bukti: `frontend/src/pages/Bimbingan/Mahasiswa/BimbinganMahasiswa.tsx`, `frontend/src/pages/Bimbingan/Dosen/BimbinganDosen.tsx`, `backend/models/Bimbingan.js`.

7. Reply atau komentar pada bimbingan.
   - Bukti: `backend/models/Reply.js`, `POST /api/bimbingan/:id/reply` pada `backend/router/bimbinganRoutes.js`.

8. Draft feedback dosen.
   - Bukti: `PUT /api/bimbingan/:id/draft-feedback`, field `draftFeedback`, `draftStatus`, dan `hasDraft` pada `backend/models/Bimbingan.js`.

9. Status akademik mahasiswa dari pra sempro sampai selesai.
   - Bukti: field `statusMahasiswa` pada `backend/models/User.js`.

10. Manajemen user.
    - Bukti: `frontend/src/pages/Admin/ManajemenUser.tsx`, `backend/router/userRoutes.js`, `backend/controller/userController.js`.

11. Assign dosen pembimbing dan penguji.
    - Bukti: `PUT /api/users/:id/assign-dospem`, `backend/controller/userController.js`, `frontend/src/pages/Admin/ManajemenUser.tsx`.

12. Kelola jadwal seminar proposal, seminar hasil, dan sidang akhir.
    - Bukti: `frontend/src/pages/Admin/KelolaJadwal.tsx`, `backend/router/jadwalRoutes.js`, `backend/controller/jadwalController.js`, `backend/models/Jadwal.js`.

13. Penentuan dosen penguji pada jadwal.
    - Bukti: field `penguji` pada `backend/models/Jadwal.js`, sinkronisasi `penguji_1` dan `penguji_2` pada `backend/controller/jadwalController.js`.

14. Tampilan jadwal sidang untuk mahasiswa/dosen/admin dan halaman khusus jadwal penguji.
    - Bukti: `frontend/src/pages/Jadwal/JadwalSidang.tsx`, `frontend/src/pages/Dosen/JadwalPenguji.tsx`, `GET /api/jadwal`.

15. Input hasil sidang oleh admin.
    - Bukti: `hasil`, `nilaiSidang`, `catatan` pada `backend/models/Jadwal.js`, modal selesai jadwal pada `frontend/src/pages/Admin/KelolaJadwal.tsx`, `PUT /api/jadwal/:id`.

16. Generate surat persetujuan seminar proposal.
    - Bukti: `GET /api/bimbingan/generate-surat-sempro/:mahasiswaId`, `backend/controller/bimbinganController.js`, `backend/services/documentService.js`.

17. Upload dan verifikasi berkas wisuda/kelulusan.
    - Bukti: `POST /api/users/upload-wisuda`, `PUT /api/users/:id/verifikasi-wisuda`, `frontend/src/pages/Admin/VerifikasiWisuda.tsx`, `frontend/src/services/wisudaService.ts`.

18. Notifikasi email dan WhatsApp untuk bimbingan dan jadwal.
    - Bukti: `backend/services/emailService.js`, `backend/services/whatsappService.js`, pemanggilan pada `backend/controller/bimbinganController.js` dan `backend/controller/jadwalController.js`.
    - Catatan: layanan ini bergantung pada konfigurasi environment, sehingga di ASI sebaiknya disebut sebagai "notifikasi sistem apabila data/kredensial tersedia".

## 5. Fitur yang Sebagian Terkomputerisasi

| Fitur/Proses | Status | Catatan |
| --- | --- | --- |
| Pengajuan seminar proposal oleh mahasiswa | Sebagian | Sistem menghitung kesiapan sempro dan generate surat, tetapi tidak ditemukan form pengajuan sempro beserta verifikasi berkas khusus. |
| Pemeriksaan berkas seminar proposal oleh koordinator | Sebagian | Admin bisa memantau bimbingan dan status kesiapan, tetapi tidak ada modul checklist/verifikasi berkas sempro khusus. |
| Pengajuan seminar hasil oleh mahasiswa | Sebagian | Status `menunggu_semhas` dan jadwal semhas tersedia, tetapi tidak ada form pendaftaran semhas khusus oleh mahasiswa. |
| Pemeriksaan berkas seminar hasil | Sebagian | Jadwal semhas tersedia, tetapi checklist/verifikasi berkas semhas belum ditemukan. |
| Penerimaan jadwal oleh dosen pembimbing | Sebagian | Jadwal global bisa dilihat semua role yang diizinkan, tetapi halaman khusus dosen pembimbing untuk jadwal mahasiswa bimbingannya tidak terlihat sebagai modul terpisah. |
| Dosen penguji memberi hasil sidang langsung | Sebagian | Penguji dapat melihat jadwal dan memberi feedback revisi, tetapi input hasil/nilai/catatan sidang dilakukan oleh admin. |
| Pelaksanaan sidang online | Sebagian | Sistem mencatat jadwal dan hasil, tetapi pelaksanaan sidang tetap di luar sistem. |
| Notifikasi WhatsApp/email | Sebagian | Service tersedia, tetapi pengiriman bergantung konfigurasi provider dan data kontak. |

## 6. Fitur yang Belum Aman Dimasukkan sebagai Fitur Penuh ASI

Fitur berikut tidak ditemukan sebagai modul yang jelas di source code. Jika tetap ingin digambarkan pada ASI, sebaiknya ditulis sebagai proses manual/eksternal atau sebagai proses yang dibantu admin, bukan sebagai fitur penuh SIMTA.

1. Form pendaftaran seminar proposal oleh mahasiswa.
2. Form pendaftaran seminar hasil oleh mahasiswa.
3. Form pendaftaran sidang akhir oleh mahasiswa.
4. Aktivasi link pendaftaran sidang akhir oleh koordinator.
5. Modul verifikasi berkas sempro/semhas terpisah dengan checklist khusus.
6. Input hasil sidang langsung oleh dosen penguji.
7. Pelaksanaan sidang secara online di dalam SIMTA.
8. Modul yudisium sebagai proses terpisah. Yang ditemukan adalah upload dan verifikasi dokumen wisuda/kelulusan.

## 7. Rekomendasi Alur ASI Sistem yang Diusulkan

Alur ASI Sistem yang Diusulkan sebaiknya tidak dibuat terlalu umum. Alur berikut masih berhubungan langsung dengan ASI manual, tetapi disesuaikan dengan fitur nyata yang ditemukan pada SIMTA.

1. Pengguna melakukan login ke SIMTA.
2. Sistem memvalidasi akun dan menampilkan dashboard sesuai role: mahasiswa, dosen, atau admin.
3. Admin/Koordinator TA mengelola data pengguna dan melakukan plotting dosen pembimbing serta dosen penguji.
4. Mahasiswa mengunggah dokumen bimbingan PDF ke dosen pembimbing sesuai tahap akademik.
5. Sistem memvalidasi file PDF, dosen tujuan, status akademik, dan antrean bimbingan yang masih menunggu review.
6. Sistem menyimpan dokumen bimbingan, membuat nomor versi otomatis, dan menampilkan riwayat bimbingan.
7. Dosen pembimbing membuka daftar mahasiswa bimbingan, mengunduh dokumen, memberikan feedback, dan menentukan status bimbingan.
8. Mahasiswa melihat feedback dan melakukan revisi jika status masih revisi.
9. Jika syarat bimbingan dan ACC dospem terpenuhi, sistem menampilkan kesiapan sidang dan menyediakan surat persetujuan seminar proposal.
10. Admin/Koordinator TA membuat jadwal sidang proposal, seminar hasil, atau sidang akhir melalui SIMTA dengan menentukan mahasiswa, waktu, ruangan, dan penguji.
11. Sistem memvalidasi bentrok jadwal, menyimpan jadwal, menyinkronkan penguji ke data mahasiswa, dan menampilkan jadwal pada halaman jadwal.
12. Dosen penguji melihat jadwal menguji melalui halaman jadwal penguji.
13. Setelah sidang dilaksanakan secara akademik/offline, admin menginput status selesai, hasil sidang, nilai, dan catatan.
14. Jika sidang menghasilkan revisi, sistem mengubah status mahasiswa ke tahap revisi dan mengarahkan unggahan revisi kepada dosen penguji.
15. Mahasiswa mengunggah dokumen revisi pasca sidang kepada penguji.
16. Dosen penguji memberikan feedback dan ACC revisi melalui SIMTA.
17. Jika kedua penguji menyetujui revisi, sistem menaikkan status mahasiswa ke tahap berikutnya.
18. Setelah sidang akhir dan revisi akhir selesai, sistem membuka tahap persiapan wisuda.
19. Mahasiswa mengunggah berkas wisuda PDF yang terdiri dari skripsi lengkap, PPT skripsi, halaman pengesahan, dan form/logbook bimbingan.
20. Admin memverifikasi berkas wisuda. Jika disetujui, sistem mengubah status mahasiswa menjadi selesai.

## 8. Struktur Swimlane untuk Diagram Draw.io

### Swimlane: Mahasiswa

- Login ke SIMTA.
- Melihat dashboard dan status akademik.
- Mengunggah dokumen bimbingan PDF ke Dosen Pembimbing 1 atau 2.
- Melihat riwayat bimbingan, status, feedback, dan komentar.
- Mengirim reply/komentar pada bimbingan jika diperlukan.
- Melakukan revisi dokumen berdasarkan feedback dosen.
- Mengunduh surat persetujuan seminar proposal jika syarat terpenuhi.
- Melihat jadwal seminar proposal, seminar hasil, atau sidang akhir.
- Mengunggah dokumen revisi pasca sidang ke Dosen Penguji 1 atau 2.
- Mengunggah berkas wisuda pada tahap persiapan wisuda.
- Melihat status verifikasi berkas wisuda.

### Swimlane: Sistem SIMTA

- Memvalidasi login dan role pengguna.
- Menampilkan dashboard sesuai role.
- Memvalidasi file PDF, dosen tujuan, dan status akademik mahasiswa.
- Menolak unggahan baru jika masih ada bimbingan yang menunggu review pada dosen yang sama.
- Menyimpan dokumen bimbingan dan membuat nomor versi otomatis.
- Menyimpan riwayat bimbingan, feedback, status, dan reply.
- Menghitung kesiapan sempro berdasarkan jumlah bimbingan dan ACC dospem.
- Menghasilkan surat persetujuan seminar proposal.
- Memvalidasi jadwal agar tidak bentrok pada mahasiswa dan ruangan.
- Menyimpan jadwal sidang dan menyinkronkan dosen penguji ke data mahasiswa.
- Menampilkan jadwal kepada pengguna terkait.
- Mengubah status mahasiswa setelah sidang selesai atau setelah revisi disetujui penguji.
- Mengunci/membuka tujuan bimbingan berdasarkan status akademik.
- Menyimpan berkas wisuda dan status verifikasinya.
- Mengubah status mahasiswa menjadi selesai jika berkas wisuda disetujui admin.

### Swimlane: Dosen Pembimbing

- Login ke SIMTA.
- Melihat dashboard dosen dan daftar mahasiswa bimbingan.
- Membuka detail bimbingan mahasiswa.
- Mengunduh atau meninjau dokumen bimbingan PDF.
- Menulis feedback atau catatan revisi.
- Menyimpan draft feedback jika diperlukan.
- Menentukan status bimbingan: revisi, acc, lanjut bab, atau acc sempro.
- Melihat riwayat feedback yang pernah diberikan.

### Swimlane: Koordinator Tugas Akhir/Admin

- Login sebagai admin.
- Mengelola akun mahasiswa, dosen, dan admin.
- Melakukan plotting Dosen Pembimbing 1 dan 2.
- Melakukan plotting atau sinkronisasi Dosen Penguji 1 dan 2.
- Memantau data bimbingan dan status akademik mahasiswa.
- Membuat jadwal seminar proposal, seminar hasil, dan sidang akhir.
- Menentukan tanggal, waktu, ruangan, dan dosen penguji.
- Mengubah atau membatalkan jadwal jika diperlukan.
- Menginput hasil sidang, nilai, dan catatan.
- Memverifikasi berkas wisuda mahasiswa.
- Menolak berkas wisuda dengan catatan atau menyetujui berkas wisuda.

### Swimlane: Dosen Penguji

- Login ke SIMTA.
- Melihat daftar jadwal menguji.
- Melihat informasi mahasiswa, judul tugas akhir, waktu, dan ruangan sidang.
- Melaksanakan pengujian secara akademik/offline.
- Membuka bimbingan revisi pasca sidang.
- Mengunduh dokumen revisi mahasiswa.
- Memberikan feedback revisi.
- Memberikan ACC revisi jika dokumen sudah sesuai.

## 9. Alur Ringkas untuk Diagram ASI BAB IV

### A. Proses Bimbingan

1. Mahasiswa login ke SIMTA.
2. Mahasiswa mengunggah dokumen bimbingan PDF ke dosen pembimbing.
3. Sistem memvalidasi file, dosen tujuan, dan status bimbingan.
4. Sistem menyimpan dokumen sebagai riwayat bimbingan dengan nomor versi.
5. Dosen pembimbing membuka dokumen bimbingan.
6. Dosen pembimbing memberikan feedback dan status bimbingan.
7. Mahasiswa melihat feedback dan mengunggah revisi jika diperlukan.
8. Jika memenuhi syarat, dosen memberi ACC untuk maju sidang.

### B. Proses Pengajuan dan Penjadwalan Sidang

1. Sistem menghitung kesiapan sidang berdasarkan bimbingan dan ACC dosen.
2. Mahasiswa mengunduh surat persetujuan sempro jika memenuhi syarat.
3. Admin membuat jadwal sidang melalui SIMTA.
4. Admin menentukan mahasiswa, jenis sidang, tanggal, waktu, ruangan, dan dosen penguji.
5. Sistem memvalidasi bentrok jadwal dan menyimpan jadwal.
6. Sistem menampilkan jadwal kepada mahasiswa, admin, dan dosen.
7. Dosen penguji melihat jadwal menguji.

### C. Proses Revisi/Pasca Sidang dan Berkas Kelulusan

1. Sidang dilaksanakan secara akademik/offline.
2. Admin menginput hasil sidang, nilai, dan catatan ke SIMTA.
3. Jika terdapat revisi, sistem mengubah status mahasiswa ke tahap revisi.
4. Mahasiswa mengunggah dokumen revisi ke dosen penguji.
5. Dosen penguji memberikan feedback atau ACC revisi.
6. Jika kedua penguji ACC, sistem menaikkan status mahasiswa ke tahap berikutnya.
7. Setelah sidang akhir selesai, mahasiswa mengunggah berkas wisuda.
8. Admin memverifikasi berkas wisuda.
9. Jika disetujui, sistem mengubah status mahasiswa menjadi selesai.

## 10. Saran Caption Gambar

Beberapa caption yang dapat digunakan pada BAB IV:

1. **Gambar 4.x Aliran Sistem Informasi Sistem yang Diusulkan pada SIMTA**
2. **Gambar 4.x Swimlane Proses Bimbingan Tugas Akhir pada SIMTA**
3. **Gambar 4.x Swimlane Proses Penjadwalan Sidang Tugas Akhir pada SIMTA**
4. **Gambar 4.x Swimlane Proses Revisi Pasca Sidang dan Verifikasi Berkas Wisuda**
5. **Gambar 4.x Alur Terkomputerisasi Proses Manajemen Tugas Akhir pada SIMTA**

Caption yang paling aman untuk diagram gabungan:

**Gambar 4.x Aliran Sistem Informasi Sistem yang Diusulkan pada SIMTA**

## 11. Narasi Singkat untuk BAB IV

Berikut narasi yang dapat digunakan atau disesuaikan:

Aliran Sistem Informasi sistem yang diusulkan menggambarkan perubahan proses manajemen tugas akhir dari mekanisme manual menjadi proses terintegrasi melalui SIMTA. Pada sistem yang diusulkan, mahasiswa, dosen pembimbing, dosen penguji, dan Koordinator Tugas Akhir/Admin terhubung melalui satu sistem berbasis web. Mahasiswa dapat mengunggah dokumen bimbingan dalam format PDF, memilih dosen tujuan sesuai tahap akademik, melihat riwayat bimbingan, serta menerima feedback dari dosen secara terdokumentasi.

Dosen pembimbing dan dosen penguji dapat mengakses dokumen mahasiswa yang berkaitan dengan perannya, memberikan feedback, serta menetapkan status bimbingan atau revisi. Sistem menyimpan setiap unggahan sebagai riwayat bimbingan dengan nomor versi, sehingga proses perbaikan dokumen dapat ditelusuri. Admin berperan dalam mengelola data pengguna, melakukan plotting dosen pembimbing dan penguji, serta mengatur jadwal seminar proposal, seminar hasil, dan sidang akhir.

Pada tahap penjadwalan, SIMTA menyimpan data jadwal sidang yang meliputi jenis sidang, mahasiswa, tanggal, waktu, ruangan, dan dosen penguji. Setelah sidang selesai, Admin dapat mencatat hasil, nilai, dan catatan sidang. Jika mahasiswa harus melakukan revisi, sistem mengarahkan proses revisi kepada dosen penguji. Setelah revisi disetujui oleh penguji sesuai ketentuan, status akademik mahasiswa dinaikkan ke tahap berikutnya.

Pada tahap akhir, mahasiswa yang telah menyelesaikan sidang akhir dan revisinya dapat mengunggah berkas persiapan wisuda melalui SIMTA. Admin kemudian melakukan verifikasi terhadap berkas tersebut. Apabila berkas disetujui, sistem memperbarui status mahasiswa menjadi selesai. Dengan demikian, SIMTA membantu proses tugas akhir menjadi lebih terdokumentasi, terstruktur, dan mudah dipantau oleh pihak yang berkepentingan.

## 12. Catatan Revisi untuk Diagram ASI

Catatan berikut penting agar diagram ASI tidak melebihi fitur nyata source code:

1. Hindari menggambar "mahasiswa mengisi form pendaftaran sidang" sebagai fitur sistem penuh, karena source code belum menunjukkan modul tersebut.
2. Hindari menggambar "koordinator mengaktifkan link pendaftaran sidang akhir", karena tidak ditemukan implementasinya.
3. Untuk pengajuan sempro/semhas/sidang, gunakan istilah yang lebih aman: "sistem memeriksa kesiapan berdasarkan status bimbingan dan ACC", lalu "admin membuat jadwal sidang".
4. Untuk hasil sidang, tuliskan "Admin menginput hasil/nilai/catatan sidang", bukan "Dosen penguji menginput hasil sidang", karena source code menunjukkan input hasil berada pada halaman Kelola Jadwal milik admin.
5. Untuk dosen penguji, gambarkan aktivitas "melihat jadwal", "meninjau revisi", dan "memberikan feedback/ACC revisi".
6. Untuk wisuda/yudisium, gunakan istilah "berkas wisuda/kelulusan", karena modul yang ditemukan adalah upload dan verifikasi dokumen wisuda.

