# CATATAN: Versi Lama - Jangan Dipakai untuk Simbol Final

File ini adalah versi awal yang masih memuat istilah decision/database. Untuk acuan final sesuai koreksi simbol ASI/SAI flowmap, gunakan:

`ASI_SAI_USULAN_SIMTA_FLOWMAP_SIMBOL_BENAR.md`

File draw.io yang sesuai koreksi simbol:

`ASI_Sistem_Diusulkan_SIMTA_Flowmap_Simbol_Benar.drawio`

# Acuan Diagram ASI/SAI Sistem yang Diusulkan SIMTA

Dokumen ini disusun sebagai acuan menggambar ulang diagram ASI/SAI "Sistem yang Diusulkan" pada BAB IV. Bentuk diagram yang dimaksud adalah **flowmap/swimlane Aliran Sistem Informasi**, bukan activity diagram UML. Oleh karena itu, simbol yang digunakan dibatasi pada terminator, process, document, database, decision, dan flowline.

Judul penelitian:

**Pengembangan Sistem Manajemen Tugas Akhir Terintegrasi Berbasis Web untuk Optimalisasi Proses Bimbingan (Studi Kasus: Fakultas Teknologi Informasi)**

## 1. Swimlane yang Digunakan

1. Mahasiswa
2. Sistem SIMTA
3. Dosen Pembimbing
4. Koordinator Tugas Akhir/Admin
5. Dosen Penguji

## 2. Ketentuan Simbol ASI/SAI

| Simbol | Penggunaan pada diagram |
| --- | --- |
| Terminator / oval | Untuk awal dan akhir alur, misalnya "Mulai" dan "Selesai". |
| Process / kotak proses | Untuk aktivitas pengguna atau sistem, misalnya login, validasi akun, upload dokumen, memberi feedback, membuat jadwal, dan verifikasi berkas. |
| Document / dokumen | Untuk data atau dokumen digital yang mengalir, misalnya dokumen bimbingan PDF, data feedback, surat persetujuan sempro, data jadwal, dan berkas wisuda. |
| Database / silinder | Untuk penyimpanan data SIMTA, misalnya data user, data bimbingan, data jadwal, dan data berkas wisuda. |
| Decision / diamond | Untuk validasi atau percabangan, misalnya akun valid, perlu revisi, syarat sidang terpenuhi, ada revisi pasca sidang, dan berkas wisuda valid. |
| Flowline / panah | Untuk aliran proses dan perpindahan data antar swimlane. |

Catatan: jangan gunakan simbol manual operation, initial/final node UML, fork/join, atau simbol activity diagram UML.

## 3. Mapping Fitur Source Code ke Proses ASI/SAI

| No | Proses manual pada sistem berjalan | Proses terkomputerisasi pada SIMTA | Aktor/Swimlane | Simbol diagram | Source code bukti | Aman dimasukkan? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Pengguna mengakses layanan secara manual/terpisah. | Pengguna login ke SIMTA dan sistem memvalidasi role. | Mahasiswa, Dosen Pembimbing, Admin, Dosen Penguji, Sistem SIMTA | Process, Decision | `frontend/src/App.tsx`, `frontend/src/components/ProtectedRoute.tsx`, `backend/router/authRoutes.js`, `backend/controller/authController.js`, `backend/middleware/authMiddleware.js` | Ya |
| 2 | Informasi proses tugas akhir dilihat melalui komunikasi manual. | Dashboard ditampilkan sesuai role pengguna. | Sistem SIMTA | Process | `frontend/src/pages/Dashboard/Mahasiswa/DashboardMhs.tsx`, `frontend/src/pages/Dashboard/Dosen/DashboardDosen.tsx`, `frontend/src/pages/Admin/DashboardAdmin.tsx` | Ya |
| 3 | Data mahasiswa dan dosen dikelola manual. | Admin mengelola user mahasiswa/dosen/admin. | Koordinator TA/Admin, Sistem SIMTA | Process, Database | `frontend/src/pages/Admin/ManajemenUser.tsx`, `backend/router/userRoutes.js`, `backend/controller/userController.js`, `backend/models/User.js` | Ya |
| 4 | Penentuan dosen pembimbing dilakukan di luar sistem. | Admin melakukan plotting Dosen Pembimbing 1 dan 2. | Koordinator TA/Admin, Sistem SIMTA | Process, Database | `PUT /api/users/:id/assign-dospem`, `backend/controller/userController.js`, `frontend/src/pages/Admin/ManajemenUser.tsx` | Ya |
| 5 | Penentuan dosen penguji dilakukan saat penjadwalan atau secara manual. | Admin menentukan/menyinkronkan Dosen Penguji 1 dan 2. | Koordinator TA/Admin, Sistem SIMTA | Process, Database | `backend/models/Jadwal.js`, `backend/controller/jadwalController.js`, `backend/controller/userController.js` | Ya |
| 6 | Mahasiswa menyerahkan dokumen bimbingan secara fisik/manual. | Mahasiswa upload dokumen bimbingan PDF ke dosen tujuan. | Mahasiswa, Sistem SIMTA | Process, Document | `frontend/src/pages/Bimbingan/Mahasiswa/BimbinganMahasiswa.tsx`, `frontend/src/services/bimbinganService.ts`, `backend/router/bimbinganRoutes.js`, `backend/controller/bimbinganController.js` | Ya |
| 7 | Kelengkapan dokumen dan dosen tujuan dicek manual. | Sistem memvalidasi file PDF, dosen tujuan, status akademik, dan pending review. | Sistem SIMTA | Process, Decision | `backend/controller/bimbinganController.js`, `backend/router/bimbinganRoutes.js`, `backend/middleware/validationMiddleware.js` | Ya |
| 8 | Riwayat revisi tersimpan pada dokumen/form fisik. | Sistem menyimpan riwayat bimbingan dan nomor versi otomatis. | Sistem SIMTA | Process, Database | `backend/models/Bimbingan.js` field `version`, method `getNextVersion()` | Ya |
| 9 | Dosen memberi catatan revisi pada dokumen/form. | Dosen memberi feedback, status, dan lampiran feedback melalui SIMTA. | Dosen Pembimbing, Sistem SIMTA | Process, Document | `frontend/src/pages/Bimbingan/Dosen/BimbinganDosen.tsx`, `PUT /api/bimbingan/:id/feedback`, `backend/controller/bimbinganController.js` | Ya |
| 10 | Status bimbingan diketahui lewat komunikasi manual. | Sistem menampilkan status `menunggu`, `revisi`, `acc`, `lanjut_bab`, dan `acc_sempro`. | Sistem SIMTA, Mahasiswa, Dosen Pembimbing | Document, Database | `backend/models/Bimbingan.js`, `frontend/src/pages/Bimbingan/Mahasiswa/BimbinganMahasiswa.tsx` | Ya |
| 11 | Diskusi bimbingan dilakukan lewat chat luar sistem. | Mahasiswa/dosen dapat reply/komentar pada bimbingan. | Mahasiswa, Dosen Pembimbing, Sistem SIMTA | Process, Document | `backend/models/Reply.js`, `POST /api/bimbingan/:id/reply`, `frontend/src/services/bimbinganService.ts` | Ya |
| 12 | Surat persetujuan sempro dibuat manual. | Sistem generate surat persetujuan sempro jika syarat terpenuhi. | Sistem SIMTA, Mahasiswa | Decision, Document | `GET /api/bimbingan/sempro-status/:mahasiswaId`, `GET /api/bimbingan/generate-surat-sempro/:mahasiswaId`, `backend/services/documentService.js` | Ya |
| 13 | Jadwal seminar/sidang disusun manual. | Admin membuat jadwal sempro, semhas, dan sidang akhir. | Koordinator TA/Admin, Sistem SIMTA | Process, Database | `frontend/src/pages/Admin/KelolaJadwal.tsx`, `backend/router/jadwalRoutes.js`, `backend/controller/jadwalController.js`, `backend/models/Jadwal.js` | Ya |
| 14 | Bentrok jadwal/ruangan dicek manual. | Sistem memvalidasi bentrok mahasiswa, waktu, ruangan, dan penguji. | Sistem SIMTA | Process, Decision | `backend/controller/jadwalController.js`, `backend/models/Jadwal.js` method `isSlotAvailable()` | Ya |
| 15 | Informasi jadwal disampaikan lewat chat/pengumuman manual. | Jadwal ditampilkan pada halaman jadwal dan jadwal penguji. | Mahasiswa, Dosen Penguji, Sistem SIMTA | Document | `frontend/src/pages/Jadwal/JadwalSidang.tsx`, `frontend/src/pages/Dosen/JadwalPenguji.tsx`, `GET /api/jadwal` | Ya |
| 16 | Hasil, nilai, dan catatan sidang dicatat manual. | Admin menginput hasil, nilai, dan catatan sidang. | Koordinator TA/Admin, Sistem SIMTA | Process, Document | `frontend/src/pages/Admin/KelolaJadwal.tsx`, `PUT /api/jadwal/:id`, `backend/models/Jadwal.js` | Ya |
| 17 | Revisi pasca sidang diarahkan manual ke penguji. | Sistem membuka bimbingan revisi ke Dosen Penguji sesuai status `revisi_sempro`, `revisi_semhas`, atau `revisi_sidang`. | Mahasiswa, Dosen Penguji, Sistem SIMTA | Process, Decision | `backend/controller/bimbinganController.js`, `backend/models/User.js`, `backend/models/Bimbingan.js` | Ya |
| 18 | Persetujuan revisi penguji dicek manual. | Sistem mengecek double ACC dari Penguji 1 dan Penguji 2 untuk naik tahap. | Sistem SIMTA, Dosen Penguji | Decision, Database | `backend/controller/bimbinganController.js` bagian Examiner ACC Resolution Logic | Ya |
| 19 | Berkas kelulusan/wisuda dikumpulkan manual. | Mahasiswa upload 4 berkas wisuda PDF. | Mahasiswa, Sistem SIMTA | Process, Document | `frontend/src/pages/Dashboard/Mahasiswa/DashboardMhs.tsx`, `frontend/src/services/wisudaService.ts`, `POST /api/users/upload-wisuda` | Ya |
| 20 | Admin memeriksa berkas kelulusan secara manual. | Admin memverifikasi berkas wisuda dan memberi status disetujui/ditolak. | Koordinator TA/Admin, Sistem SIMTA | Process, Decision | `frontend/src/pages/Admin/VerifikasiWisuda.tsx`, `PUT /api/users/:id/verifikasi-wisuda`, `backend/controller/userController.js` | Ya |
| 21 | Status kelulusan diperbarui manual. | Jika berkas wisuda disetujui, sistem mengubah status mahasiswa menjadi `selesai`. | Sistem SIMTA, Mahasiswa | Process, Document | `backend/controller/userController.js`, `backend/models/User.js` | Ya |
| 22 | Pendaftaran sempro/semhas/sidang akhir diisi manual. | Tidak ditemukan form pendaftaran sidang oleh mahasiswa. | Mahasiswa | - | Tidak ditemukan modul khusus pada frontend/backend | Jangan dimasukkan sebagai fitur penuh |

## 4. Rancangan Aktivitas per Swimlane

| Swimlane | Nama aktivitas | Simbol | Keterangan singkat |
| --- | --- | --- | --- |
| Mahasiswa | Mulai | Terminator | Awal alur ASI/SAI sistem usulan. |
| Mahasiswa | Mengakses/Login ke SIMTA | Process | Mahasiswa masuk menggunakan akun yang sudah terdaftar. |
| Sistem SIMTA | Memvalidasi akun dan role | Process | Sistem memeriksa token/kredensial dan role pengguna. |
| Sistem SIMTA | Akun valid? | Decision | Jika valid, pengguna diarahkan ke dashboard. Jika tidak valid, kembali ke login. |
| Sistem SIMTA | Menampilkan dashboard sesuai role | Process | Dashboard mahasiswa, dosen, atau admin ditampilkan sesuai hak akses. |
| Koordinator TA/Admin | Mengelola data user | Process | Admin membuat, mengubah, menonaktifkan, atau menghapus user. |
| Koordinator TA/Admin | Plotting dosen pembimbing dan penguji | Process | Admin menetapkan dospem dan penguji pada data mahasiswa. |
| Sistem SIMTA | Menyimpan data user dan plotting | Process | Sistem menyimpan data ke database user. |
| Sistem SIMTA | Data user/plotting | Database | Data mahasiswa, dosen, dospem, dan penguji tersimpan. |
| Mahasiswa | Mengunggah dokumen bimbingan PDF | Process | Mahasiswa mengirim dokumen ke dospem/penguji sesuai tahap. |
| Mahasiswa | Dokumen bimbingan PDF | Document | Dokumen digital yang dikirim ke sistem. |
| Sistem SIMTA | Validasi file dan dosen tujuan | Process | Sistem memeriksa format PDF, dosen tujuan, status akademik, dan pending review. |
| Sistem SIMTA | Data valid? | Decision | Jika tidak valid, unggahan ditolak dan mahasiswa memperbaiki input. |
| Sistem SIMTA | Menyimpan bimbingan dan nomor versi | Process | Sistem membuat versi V1, V2, dan seterusnya. |
| Sistem SIMTA | Data bimbingan | Database | Riwayat bimbingan, file, versi, dan status tersimpan. |
| Dosen Pembimbing | Membuka daftar mahasiswa bimbingan | Process | Dosen melihat mahasiswa yang menjadi bimbingannya. |
| Dosen Pembimbing | Review dokumen bimbingan | Process | Dosen meninjau file PDF yang dikirim mahasiswa. |
| Dosen Pembimbing | Memberikan feedback dan status | Process | Dosen memberi status revisi/acc/lanjut bab/acc sempro. |
| Sistem SIMTA | Menyimpan feedback/status/reply | Process | Sistem menyimpan feedback dan komentar pada riwayat. |
| Mahasiswa | Data feedback bimbingan | Document | Mahasiswa menerima hasil review bimbingan. |
| Sistem SIMTA | Perlu revisi? | Decision | Jika revisi, mahasiswa mengunggah ulang dokumen bimbingan. |
| Sistem SIMTA | Syarat seminar/sidang terpenuhi? | Decision | Sistem memeriksa jumlah bimbingan dan ACC dosen. |
| Sistem SIMTA | Generate surat persetujuan sempro | Process | Surat dibuat otomatis jika syarat terpenuhi. |
| Mahasiswa | Surat persetujuan seminar proposal | Document | Mahasiswa mengunduh dokumen persetujuan. |
| Koordinator TA/Admin | Membuat jadwal seminar/sidang | Process | Admin menentukan mahasiswa, jenis sidang, waktu, ruangan, dan penguji. |
| Sistem SIMTA | Validasi jadwal dan penguji | Process | Sistem memeriksa bentrok jadwal/ruangan dan validitas penguji. |
| Sistem SIMTA | Jadwal valid? | Decision | Jika bentrok/tidak valid, admin memperbaiki jadwal. |
| Sistem SIMTA | Data jadwal sidang | Database | Jadwal tersimpan dan penguji disinkronkan ke data mahasiswa. |
| Mahasiswa | Informasi jadwal sidang | Document | Mahasiswa melihat jadwal sidang. |
| Dosen Penguji | Jadwal menguji | Document | Dosen penguji melihat jadwal menguji. |
| Dosen Penguji | Melaksanakan pengujian | Process | Sidang berjalan secara akademik/offline. |
| Koordinator TA/Admin | Menginput hasil, nilai, dan catatan sidang | Process | Admin mencatat hasil sidang di SIMTA. |
| Sistem SIMTA | Memperbarui status akademik | Process | Status mahasiswa berubah sesuai hasil sidang. |
| Sistem SIMTA | Ada revisi pasca sidang? | Decision | Jika ada revisi, alur lanjut ke penguji. Jika tidak, naik tahap. |
| Mahasiswa | Mengunggah dokumen revisi ke penguji | Process | Mahasiswa mengirim revisi pasca sidang. |
| Dosen Penguji | Review revisi dan memberi ACC | Process | Penguji memberi feedback atau ACC revisi. |
| Sistem SIMTA | Kedua penguji ACC? | Decision | Jika kedua penguji ACC, status mahasiswa naik tahap. |
| Sistem SIMTA | Membuka tahap persiapan wisuda | Process | Tahap ini aktif setelah sidang akhir/revisi akhir selesai. |
| Mahasiswa | Mengunggah berkas kelulusan/wisuda | Process | Mahasiswa upload skripsi lengkap, PPT, halaman pengesahan, dan form bimbingan. |
| Sistem SIMTA | Data berkas kelulusan/wisuda | Database | Sistem menyimpan file dan status verifikasi. |
| Koordinator TA/Admin | Memverifikasi berkas wisuda | Process | Admin menyetujui atau menolak berkas. |
| Sistem SIMTA | Berkas kelulusan valid? | Decision | Jika ditolak, mahasiswa upload ulang. Jika disetujui, status selesai. |
| Mahasiswa | Informasi status tugas akhir selesai | Document | Mahasiswa melihat status selesai. |
| Mahasiswa | Selesai | Terminator | Akhir alur ASI/SAI sistem usulan. |

## 5. Alur Lengkap Diagram ASI/SAI Sistem yang Diusulkan

1. **Mahasiswa - Terminator:** Mulai.
2. **Mahasiswa - Process:** Mengakses/Login ke SIMTA.
3. **Sistem SIMTA - Process:** Memvalidasi akun dan role pengguna.
4. **Sistem SIMTA - Decision:** Akun valid?
5. **Sistem SIMTA - Process:** Menampilkan dashboard sesuai role.
6. **Koordinator TA/Admin - Process:** Mengelola data user mahasiswa dan dosen.
7. **Koordinator TA/Admin - Process:** Melakukan plotting dosen pembimbing dan penguji.
8. **Sistem SIMTA - Database:** Menyimpan data user, dospem, dan penguji ke database.
9. **Mahasiswa - Process:** Mengunggah dokumen bimbingan PDF sesuai tahap akademik.
10. **Mahasiswa - Document:** Dokumen bimbingan PDF.
11. **Sistem SIMTA - Process:** Memvalidasi format PDF, dosen tujuan, status akademik, dan antrean review.
12. **Sistem SIMTA - Decision:** Data upload valid?
13. **Sistem SIMTA - Process:** Menyimpan dokumen bimbingan dan membuat versi otomatis.
14. **Sistem SIMTA - Database:** Data bimbingan tersimpan.
15. **Dosen Pembimbing - Process:** Membuka daftar mahasiswa bimbingan.
16. **Dosen Pembimbing - Process:** Meninjau dokumen bimbingan.
17. **Dosen Pembimbing - Process:** Memberikan feedback dan status bimbingan.
18. **Sistem SIMTA - Database:** Menyimpan feedback, status, dan reply/komentar bimbingan.
19. **Mahasiswa - Document:** Menerima data feedback dan riwayat bimbingan.
20. **Sistem SIMTA - Decision:** Perlu revisi?
21. **Mahasiswa - Process:** Jika perlu revisi, mahasiswa memperbaiki dokumen dan mengunggah ulang.
22. **Sistem SIMTA - Decision:** Syarat seminar/sidang terpenuhi?
23. **Sistem SIMTA - Process:** Generate surat persetujuan seminar proposal.
24. **Mahasiswa - Document:** Surat persetujuan seminar proposal.
25. **Koordinator TA/Admin - Process:** Membuat jadwal seminar proposal, seminar hasil, atau sidang akhir.
26. **Sistem SIMTA - Process:** Memvalidasi jadwal, ruangan, dan dosen penguji.
27. **Sistem SIMTA - Decision:** Jadwal valid?
28. **Sistem SIMTA - Database:** Menyimpan data jadwal dan sinkronisasi dosen penguji.
29. **Mahasiswa - Document:** Menerima/menampilkan informasi jadwal sidang.
30. **Dosen Penguji - Document:** Melihat jadwal menguji.
31. **Dosen Penguji - Process:** Melaksanakan pengujian secara akademik/offline.
32. **Koordinator TA/Admin - Process:** Menginput hasil, nilai, dan catatan sidang.
33. **Sistem SIMTA - Process:** Memperbarui status akademik mahasiswa.
34. **Sistem SIMTA - Decision:** Ada revisi pasca sidang?
35. **Mahasiswa - Process:** Jika ada revisi, mahasiswa mengunggah dokumen revisi ke dosen penguji.
36. **Dosen Penguji - Process:** Dosen penguji meninjau revisi dan memberi feedback/ACC.
37. **Sistem SIMTA - Decision:** Kedua dosen penguji sudah ACC?
38. **Sistem SIMTA - Process:** Sistem menaikkan status mahasiswa ke tahap berikutnya.
39. **Sistem SIMTA - Decision:** Mahasiswa berada pada tahap persiapan wisuda?
40. **Mahasiswa - Process:** Mahasiswa mengunggah berkas kelulusan/wisuda.
41. **Mahasiswa - Document:** Berkas kelulusan/wisuda.
42. **Sistem SIMTA - Database:** Data berkas kelulusan/wisuda tersimpan.
43. **Koordinator TA/Admin - Process:** Memverifikasi berkas kelulusan/wisuda.
44. **Sistem SIMTA - Decision:** Berkas kelulusan valid?
45. **Mahasiswa - Document:** Jika ditolak, mahasiswa menerima catatan penolakan dan mengunggah ulang.
46. **Sistem SIMTA - Process:** Jika disetujui, sistem mengubah status mahasiswa menjadi selesai.
47. **Mahasiswa - Document:** Informasi status tugas akhir selesai.
48. **Mahasiswa - Terminator:** Selesai.

## 6. Versi Ringkas Diagram untuk BAB IV

Versi ringkas ini disarankan jika diagram lengkap terlalu panjang pada halaman BAB IV.

| No | Swimlane | Aktivitas | Simbol |
| --- | --- | --- | --- |
| 1 | Mahasiswa | Mulai dan login ke SIMTA | Terminator, Process |
| 2 | Sistem SIMTA | Validasi akun dan tampilkan dashboard sesuai role | Process, Decision |
| 3 | Admin | Kelola user dan plotting dosen pembimbing/penguji | Process |
| 4 | Sistem SIMTA | Simpan data user dan plotting dosen | Database |
| 5 | Mahasiswa | Upload dokumen bimbingan PDF | Process, Document |
| 6 | Sistem SIMTA | Validasi file, dosen tujuan, status akademik, dan simpan versi bimbingan | Process, Database |
| 7 | Dosen Pembimbing | Review dokumen dan beri feedback/status | Process |
| 8 | Mahasiswa | Terima feedback dan upload revisi jika diperlukan | Document, Process |
| 9 | Sistem SIMTA | Cek syarat sidang dan generate surat persetujuan sempro | Decision, Process, Document |
| 10 | Admin | Buat jadwal seminar/sidang dan pilih penguji | Process |
| 11 | Sistem SIMTA | Validasi dan simpan data jadwal sidang | Process, Database |
| 12 | Mahasiswa/Dosen Penguji | Melihat informasi jadwal sidang | Document |
| 13 | Admin | Input hasil, nilai, dan catatan sidang | Process |
| 14 | Mahasiswa/Dosen Penguji | Upload dan review revisi pasca sidang sampai ACC penguji | Process, Decision |
| 15 | Mahasiswa/Admin/Sistem | Upload, verifikasi berkas wisuda, dan status mahasiswa selesai | Process, Decision, Database, Terminator |

## 7. Fitur yang Jangan Dimasukkan sebagai Fitur Penuh

Fitur berikut sebaiknya tidak digambar sebagai proses terkomputerisasi penuh karena tidak ditemukan implementasi modul khusus pada source code:

1. Form pendaftaran seminar proposal oleh mahasiswa.
2. Form pendaftaran seminar hasil oleh mahasiswa.
3. Form pendaftaran sidang akhir oleh mahasiswa.
4. Aktivasi link pendaftaran sidang akhir oleh Koordinator TA/Admin.
5. Input hasil sidang langsung oleh dosen penguji.
6. Pelaksanaan sidang online di dalam SIMTA.
7. Modul verifikasi berkas sempro/semhas dengan checklist khusus.
8. Modul yudisium tersendiri. Yang ditemukan adalah upload dan verifikasi berkas wisuda/kelulusan.

Jika proses tersebut tetap ingin disebutkan dalam naskah, gunakan kalimat hati-hati seperti "proses pengajuan sidang dibantu melalui status kesiapan dan penjadwalan oleh admin", bukan "mahasiswa mengisi form pendaftaran sidang melalui SIMTA".

## 8. Saran Caption Gambar BAB IV

Caption utama yang disarankan:

**Gambar 4.x Aliran Sistem Informasi Sistem yang Diusulkan pada SIMTA**

Alternatif caption:

1. **Gambar 4.x Flowmap Sistem yang Diusulkan pada SIMTA**
2. **Gambar 4.x SAI Sistem yang Diusulkan untuk Proses Manajemen Tugas Akhir**
3. **Gambar 4.x Aliran Sistem Informasi Terkomputerisasi pada SIMTA**
4. **Gambar 4.x Swimlane Proses Bimbingan, Penjadwalan Sidang, dan Verifikasi Wisuda pada SIMTA**

## 9. Narasi Sebelum Gambar

Berikut narasi yang dapat diletakkan sebelum gambar:

Aliran Sistem Informasi sistem yang diusulkan menggambarkan proses manajemen tugas akhir setelah diterapkan SIMTA sebagai sistem berbasis web. Pada alur ini, proses yang sebelumnya dilakukan secara manual, seperti pengiriman dokumen bimbingan, pemberian feedback, pencatatan status bimbingan, penjadwalan sidang, dan verifikasi berkas kelulusan, dialihkan menjadi proses yang tersimpan dan terdokumentasi di dalam sistem. Diagram ini menggunakan lima swimlane, yaitu Mahasiswa, Sistem SIMTA, Dosen Pembimbing, Koordinator Tugas Akhir/Admin, dan Dosen Penguji.

## 10. Narasi Sesudah Gambar

Berikut narasi yang dapat diletakkan setelah gambar:

Berdasarkan diagram ASI/SAI sistem yang diusulkan, SIMTA berperan sebagai pusat pengelolaan data dan aliran dokumen tugas akhir. Mahasiswa dapat mengunggah dokumen bimbingan dalam format PDF, melihat feedback, serta mengirim revisi sesuai status akademik. Dosen pembimbing dan dosen penguji dapat meninjau dokumen yang berkaitan dengan perannya dan memberikan feedback atau persetujuan. Koordinator Tugas Akhir/Admin mengelola data pengguna, melakukan plotting dosen, membuat jadwal sidang, menginput hasil sidang, dan memverifikasi berkas wisuda. Dengan demikian, proses tugas akhir menjadi lebih terstruktur, terdokumentasi, dan dapat dipantau melalui sistem.

## 11. Catatan untuk Menggambar Ulang di Draw.io

1. Gunakan lima swimlane horizontal atau vertikal sesuai format kampus.
2. Letakkan `Sistem SIMTA` sebagai lane kedua agar aliran data dari aktor ke sistem mudah dibaca.
3. Gunakan kotak proses biasa untuk aktivitas, bukan simbol manual operation.
4. Gunakan document untuk output data yang terlihat oleh aktor, seperti feedback, surat persetujuan, data jadwal, dan berkas wisuda.
5. Gunakan database silinder hanya pada lane Sistem SIMTA.
6. Gunakan decision hanya untuk percabangan yang benar-benar terjadi, seperti validasi akun, revisi, syarat sidang, double ACC penguji, dan validasi berkas wisuda.
7. Untuk sidang, gambarkan pelaksanaan sidang sebagai proses akademik/offline, sedangkan SIMTA mencatat jadwal dan hasilnya.
