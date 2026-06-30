# ASI/SAI Sistem yang Diusulkan SIMTA - Versi Flowmap

Dokumen ini adalah acuan untuk menggambar ulang **Aliran Sistem Informasi (ASI/SAI) Sistem yang Diusulkan** pada BAB IV. Bentuk diagram mengikuti gaya **flowmap/swimlane**, bukan activity diagram UML.

Koreksi penting: proses validasi pada SIMTA tidak digambar memakai decision diamond dan tidak diberi cabang "Ya/Tidak". Validasi ditulis sebagai **aktivitas proses sistem**, misalnya "Memvalidasi akun dan role pengguna" atau "Memvalidasi jadwal, ruangan, dan dosen penguji".

## Aturan Simbol yang Dipakai

| Simbol | Penggunaan dalam diagram usulan |
|---|---|
| Proses / kotak | Aktivitas yang dilakukan pengguna atau sistem, misalnya mengelola user, memvalidasi akun, mengunggah dokumen, memberi feedback, membuat jadwal, menginput hasil sidang, dan memverifikasi berkas wisuda. |
| Alternative / kotak rounded | Akses/menu/tampilan sistem, misalnya mengakses SIMTA, menampilkan halaman login, dan menampilkan dashboard sesuai role. |
| Dokumen | Data atau keluaran digital tunggal, misalnya data kredensial login, dokumen bimbingan PDF, data feedback, surat persetujuan sempro, data jadwal, dan status selesai. |
| Multi dokumen | Kumpulan dokumen digital, misalnya berkas wisuda yang terdiri dari skripsi lengkap, PPT, halaman pengesahan, dan form/logbook bimbingan. |
| Penghubung / lingkaran | Dipakai hanya bila diagram terlalu panjang dan perlu dilanjutkan ke bagian lain. |
| Flowline / panah | Aliran proses atau perpindahan data antar swimlane. |

Simbol yang **tidak digunakan** pada diagram usulan: simbol kegiatan manual/trapesium, decision diamond, database silinder, initial/final node UML, fork/join UML, dan label cabang "Ya/Tidak". Karena simbol referensi yang dipakai tidak memuat database, data yang tersimpan di SIMTA direpresentasikan sebagai dokumen/data sistem.

## Mapping Proses Sistem Berjalan ke SIMTA

| No | Proses pada sistem berjalan | Proses terkomputerisasi pada SIMTA | Aktor/Swimlane | Simbol diagram usulan | Source code bukti | Aman dimasukkan? |
|---|---|---|---|---|---|---|
| 1 | Pengguna mengakses informasi tugas akhir melalui proses terpisah. | Pengguna mengakses SIMTA, login, lalu sistem memvalidasi akun dan role. | Mahasiswa, Sistem SIMTA, Dosen Pembimbing, Admin, Dosen Penguji | Alternative, Dokumen, Proses | `frontend/src/App.tsx`, `frontend/src/components/ProtectedRoute.tsx`, `backend/router/authRoutes.js`, `backend/controller/authController.js`, `backend/middleware/authMiddleware.js` | Aman. |
| 2 | Informasi tugas akhir dipantau melalui komunikasi manual. | Sistem menampilkan dashboard sesuai role pengguna. | Sistem SIMTA | Alternative | `frontend/src/pages/Dashboard/Mahasiswa/DashboardMhs.tsx`, `frontend/src/pages/Dashboard/Dosen/DashboardDosen.tsx`, `frontend/src/pages/Admin/DashboardAdmin.tsx` | Aman. |
| 3 | Data mahasiswa dan dosen dikelola di luar sistem. | Admin mengelola data user mahasiswa, dosen, dan admin. | Koordinator TA/Admin, Sistem SIMTA | Proses, Dokumen | `frontend/src/pages/Admin/ManajemenUser.tsx`, `backend/router/userRoutes.js`, `backend/controller/userController.js`, `backend/models/User.js` | Aman. |
| 4 | Plotting dosen pembimbing dilakukan di luar sistem. | Admin melakukan plotting dosen pembimbing 1 dan 2. | Koordinator TA/Admin, Sistem SIMTA | Proses, Dokumen | `PUT /api/users/:id/assign-dospem`, `backend/controller/userController.js`, `frontend/src/pages/Admin/ManajemenUser.tsx` | Aman. |
| 5 | Penentuan dosen penguji dilakukan saat penjadwalan atau secara manual. | Admin menentukan dosen penguji melalui data mahasiswa atau jadwal sidang. | Koordinator TA/Admin, Sistem SIMTA | Proses, Dokumen | `backend/controller/userController.js`, `backend/controller/jadwalController.js`, `backend/models/Jadwal.js` | Aman. |
| 6 | Dokumen bimbingan dan form bimbingan diserahkan secara fisik/manual. | Mahasiswa mengunggah dokumen bimbingan PDF ke dosen tujuan. | Mahasiswa, Sistem SIMTA | Proses, Dokumen | `frontend/src/pages/Bimbingan/Mahasiswa/BimbinganMahasiswa.tsx`, `frontend/src/services/bimbinganService.ts`, `backend/router/bimbinganRoutes.js`, `backend/controller/bimbinganController.js` | Aman. |
| 7 | Kelengkapan dokumen dan dosen tujuan diperiksa manual. | Sistem memvalidasi file, dosen tujuan, status akademik, dan kondisi bimbingan. | Sistem SIMTA | Proses | `backend/controller/bimbinganController.js`, `backend/middleware/validationMiddleware.js` | Aman, digambar sebagai proses validasi tanpa diamond. |
| 8 | Catatan revisi diberikan melalui form atau komunikasi manual. | Dosen pembimbing memberikan feedback, status bimbingan, dan reply/komentar. | Dosen Pembimbing, Sistem SIMTA, Mahasiswa | Proses, Dokumen | `frontend/src/pages/Bimbingan/Dosen/BimbinganDosen.tsx`, `PUT /api/bimbingan/:id/draft-feedback`, `POST /api/bimbingan/:id/reply`, `backend/models/Reply.js` | Aman. |
| 9 | Riwayat revisi tersebar di dokumen/form. | Sistem menyimpan riwayat bimbingan dan versioning dokumen. | Sistem SIMTA | Proses, Dokumen | `backend/models/Bimbingan.js` field `version`, method `getNextVersion()` | Aman. |
| 10 | Persetujuan seminar proposal dibuat manual. | Sistem memeriksa kesiapan sempro dan generate surat persetujuan seminar proposal. | Sistem SIMTA, Mahasiswa | Proses, Dokumen | `GET /api/bimbingan/sempro-status/:mahasiswaId`, `GET /api/bimbingan/generate-surat-sempro/:mahasiswaId`, `backend/services/documentService.js` | Aman. |
| 11 | Jadwal seminar/sidang disusun manual. | Admin membuat jadwal sempro, semhas, dan sidang akhir. | Koordinator TA/Admin, Sistem SIMTA | Proses, Dokumen | `frontend/src/pages/Admin/KelolaJadwal.tsx`, `backend/router/jadwalRoutes.js`, `backend/controller/jadwalController.js`, `backend/models/Jadwal.js` | Aman. |
| 12 | Informasi jadwal disampaikan lewat chat/pengumuman manual. | Jadwal ditampilkan pada halaman jadwal mahasiswa dan jadwal dosen penguji. | Mahasiswa, Dosen Penguji, Sistem SIMTA | Dokumen | `frontend/src/pages/Jadwal/JadwalSidang.tsx`, `frontend/src/pages/Dosen/JadwalPenguji.tsx`, `GET /api/jadwal` | Aman. |
| 13 | Hasil, nilai, dan catatan sidang dicatat manual. | Admin menginput hasil, nilai, dan catatan sidang pada Kelola Jadwal. | Koordinator TA/Admin, Sistem SIMTA | Proses, Dokumen | `frontend/src/pages/Admin/KelolaJadwal.tsx`, `PUT /api/jadwal/:id`, `backend/models/Jadwal.js` | Aman. Jangan ditulis sebagai input langsung oleh dosen penguji. |
| 14 | Revisi pasca sidang diarahkan manual ke dosen penguji. | Mahasiswa mengunggah revisi pasca sidang ke dosen penguji melalui modul bimbingan. | Mahasiswa, Sistem SIMTA, Dosen Penguji | Proses, Dokumen | `backend/controller/bimbinganController.js`, `backend/models/User.js`, `backend/models/Bimbingan.js` | Aman. |
| 15 | ACC revisi penguji diperiksa manual. | Dosen penguji memberi feedback/ACC revisi dan sistem menaikkan status tahap. | Dosen Penguji, Sistem SIMTA | Proses, Dokumen | `backend/controller/bimbinganController.js` bagian penguji ACC, status `revisi_sempro`, `revisi_semhas`, `revisi_sidang`, `persiapan_wisuda` | Aman, digambar sebagai proses tanpa diamond. |
| 16 | Berkas kelulusan/wisuda dikumpulkan manual. | Mahasiswa mengunggah berkas wisuda PDF. | Mahasiswa, Sistem SIMTA | Multi dokumen, Proses | `POST /api/users/upload-wisuda`, `frontend/src/services/wisudaService.ts`, `frontend/src/pages/Dashboard/Mahasiswa/DashboardMhs.tsx` | Aman. |
| 17 | Admin memeriksa berkas kelulusan secara manual. | Admin memverifikasi berkas wisuda melalui sistem. | Koordinator TA/Admin, Sistem SIMTA | Proses, Dokumen | `frontend/src/pages/Admin/VerifikasiWisuda.tsx`, `PUT /api/users/:id/verifikasi-wisuda`, `backend/controller/userController.js` | Aman. |
| 18 | Status mahasiswa selesai diperbarui manual. | Sistem mengubah status mahasiswa menjadi `selesai` setelah berkas wisuda disetujui. | Sistem SIMTA, Mahasiswa | Proses, Dokumen | `backend/controller/userController.js`, `backend/models/User.js` | Aman. |

## Rancangan Aktivitas ASI/SAI Usulan

| No | Swimlane | Aktivitas | Simbol | Keterangan singkat |
|---|---|---|---|---|
| 1 | Mahasiswa | Mengakses SIMTA | Alternative | Mahasiswa membuka sistem berbasis web. |
| 2 | Sistem SIMTA | Menampilkan halaman login | Alternative | Sistem menampilkan halaman login. |
| 3 | Mahasiswa | Data kredensial login | Dokumen | Email/NIM dan password menjadi data input login. |
| 4 | Sistem SIMTA | Memvalidasi akun dan role pengguna | Proses | Validasi digambar sebagai proses sistem, bukan decision. |
| 5 | Sistem SIMTA | Menampilkan dashboard sesuai role | Alternative | Tampilan diarahkan berdasarkan role. |
| 6 | Koordinator TA/Admin | Mengelola data user mahasiswa dan dosen | Proses | Admin mengelola data pengguna SIMTA. |
| 7 | Koordinator TA/Admin | Plotting dosen pembimbing dan penguji | Proses | Admin mengatur relasi dosen dengan mahasiswa. |
| 8 | Sistem SIMTA | Menyimpan data user, dospem, dan penguji | Proses | Sistem menyimpan hasil pengelolaan data. |
| 9 | Sistem SIMTA | Data user dan plotting dosen tersimpan | Dokumen | Representasi data digital tersimpan. |
| 10 | Mahasiswa | Mengunggah dokumen bimbingan PDF ke dosen tujuan | Proses | Mahasiswa memilih dosen tujuan dan mengunggah PDF. |
| 11 | Mahasiswa | Dokumen bimbingan PDF | Dokumen | Dokumen bimbingan sebagai input digital. |
| 12 | Sistem SIMTA | Memvalidasi file, dosen tujuan, dan status akademik | Proses | Sistem menolak input yang tidak sesuai melalui mekanisme validasi. |
| 13 | Sistem SIMTA | Membuat versi dokumen dan menyimpan riwayat bimbingan | Proses | Sistem memberi versioning dan mencatat riwayat. |
| 14 | Sistem SIMTA | Data bimbingan dan versi dokumen | Dokumen | Data bimbingan terdokumentasi. |
| 15 | Dosen Pembimbing | Mengakses dashboard dosen | Alternative | Dosen membuka halaman kerja sesuai role. |
| 16 | Dosen Pembimbing | Membuka data bimbingan mahasiswa | Proses | Dosen melihat detail dokumen bimbingan. |
| 17 | Dosen Pembimbing | Memberikan feedback dan status bimbingan | Proses | Dosen memberi catatan, status, dan arahan. |
| 18 | Sistem SIMTA | Menyimpan feedback, status, dan reply | Proses | Sistem menyimpan hasil review bimbingan. |
| 19 | Mahasiswa | Data feedback, status, dan riwayat bimbingan | Dokumen | Mahasiswa melihat hasil feedback. |
| 20 | Mahasiswa | Mengunggah dokumen revisi bimbingan | Proses | Aktivitas dilakukan pada tahap revisi tanpa digambar cabang. |
| 21 | Sistem SIMTA | Memeriksa kesiapan seminar/sidang berdasarkan ACC | Proses | Pemeriksaan syarat tetap ditulis sebagai proses sistem. |
| 22 | Sistem SIMTA | Generate surat persetujuan Seminar Proposal | Proses | Sistem menghasilkan dokumen persetujuan sempro. |
| 23 | Mahasiswa | Surat persetujuan Seminar Proposal | Dokumen | Surat dapat digunakan sebagai bukti persetujuan. |
| 24 | Koordinator TA/Admin | Membuat jadwal seminar/sidang dan memilih penguji | Proses | Admin mengatur tanggal, waktu, ruangan, dan penguji. |
| 25 | Sistem SIMTA | Memvalidasi jadwal, ruangan, dan dosen penguji | Proses | Validasi bentrok jadwal dan penguji digambar sebagai proses. |
| 26 | Sistem SIMTA | Data jadwal sidang dan data penguji tersimpan | Dokumen | Jadwal dan penguji tersimpan di sistem. |
| 27 | Mahasiswa | Informasi jadwal seminar/sidang | Dokumen | Mahasiswa melihat jadwal sidang. |
| 28 | Dosen Penguji | Jadwal menguji mahasiswa | Dokumen | Dosen penguji melihat jadwal pengujian. |
| 29 | Koordinator TA/Admin | Menginput hasil, nilai, dan catatan sidang | Proses | Source code menunjukkan input hasil dilakukan admin. |
| 30 | Sistem SIMTA | Memperbarui status akademik mahasiswa dan tahap revisi | Proses | Sistem memperbarui status mahasiswa sesuai hasil. |
| 31 | Mahasiswa | Mengunggah dokumen revisi pasca sidang ke dosen penguji | Proses | Revisi pasca sidang dikirim melalui modul bimbingan. |
| 32 | Dosen Penguji | Memberikan feedback dan ACC revisi pasca sidang | Proses | Penguji mereview revisi melalui sistem. |
| 33 | Sistem SIMTA | Menyimpan ACC penguji dan menaikkan status tahap | Proses | Sistem memproses status setelah ACC penguji. |
| 34 | Mahasiswa | Berkas wisuda PDF | Multi dokumen | Berkas terdiri dari skripsi lengkap, PPT, halaman pengesahan, dan form/logbook bimbingan. |
| 35 | Sistem SIMTA | Data berkas wisuda menunggu verifikasi | Dokumen | Berkas masuk ke antrean verifikasi admin. |
| 36 | Koordinator TA/Admin | Memverifikasi berkas wisuda | Proses | Admin menyetujui atau menolak berkas melalui sistem. |
| 37 | Sistem SIMTA | Mengubah status mahasiswa menjadi selesai | Proses | Sistem memperbarui status akhir mahasiswa. |
| 38 | Mahasiswa | Informasi status tugas akhir selesai | Dokumen | Mahasiswa melihat status akhir. |

## Alur Diagram Urut

1. Mahasiswa mengakses SIMTA.
2. Sistem menampilkan halaman login.
3. Mahasiswa mengirim data kredensial login.
4. Sistem memvalidasi akun dan role pengguna.
5. Sistem menampilkan dashboard sesuai role.
6. Admin mengelola data user mahasiswa dan dosen.
7. Admin melakukan plotting dosen pembimbing dan dosen penguji.
8. Sistem menyimpan data user dan plotting dosen.
9. Mahasiswa mengunggah dokumen bimbingan PDF ke dosen tujuan.
10. Sistem memvalidasi file, dosen tujuan, dan status akademik.
11. Sistem membuat versi dokumen dan menyimpan riwayat bimbingan.
12. Dosen pembimbing membuka data bimbingan mahasiswa.
13. Dosen pembimbing memberi feedback, status bimbingan, dan reply.
14. Sistem menyimpan feedback, status, dan riwayat bimbingan.
15. Mahasiswa melihat feedback dan mengunggah dokumen revisi pada tahap revisi.
16. Sistem memeriksa kesiapan seminar/sidang berdasarkan status dan ACC.
17. Sistem generate surat persetujuan Seminar Proposal.
18. Admin membuat jadwal seminar/sidang dan memilih dosen penguji.
19. Sistem memvalidasi jadwal, ruangan, dan dosen penguji.
20. Sistem menyimpan data jadwal sidang dan data penguji.
21. Mahasiswa melihat informasi jadwal seminar/sidang.
22. Dosen penguji melihat jadwal menguji mahasiswa.
23. Admin menginput hasil, nilai, dan catatan sidang.
24. Sistem memperbarui status akademik dan membuka tahap revisi pasca sidang.
25. Mahasiswa mengunggah dokumen revisi pasca sidang ke dosen penguji.
26. Dosen penguji memberikan feedback dan ACC revisi.
27. Sistem menyimpan ACC penguji dan menaikkan status tahap.
28. Mahasiswa mengunggah berkas wisuda PDF.
29. Sistem menyimpan data berkas wisuda menunggu verifikasi.
30. Admin memverifikasi berkas wisuda.
31. Sistem mengubah status mahasiswa menjadi selesai.
32. Mahasiswa melihat informasi status tugas akhir selesai.

## Versi Ringkas untuk Gambar BAB IV

| No | Swimlane | Aktivitas ringkas | Simbol |
|---|---|---|---|
| 1 | Mahasiswa/Sistem SIMTA | Login, validasi akun, dan dashboard sesuai role | Alternative, Dokumen, Proses |
| 2 | Admin/Sistem SIMTA | Kelola user serta plotting dosen pembimbing dan penguji | Proses, Dokumen |
| 3 | Mahasiswa/Sistem SIMTA | Upload dokumen bimbingan PDF dan validasi data | Proses, Dokumen |
| 4 | Sistem SIMTA | Simpan versioning dan riwayat bimbingan | Proses, Dokumen |
| 5 | Dosen Pembimbing/Sistem SIMTA | Review dokumen, feedback, status, dan reply bimbingan | Proses, Dokumen |
| 6 | Mahasiswa/Sistem SIMTA | Upload revisi dan pemeriksaan kesiapan seminar/sidang | Proses |
| 7 | Sistem SIMTA/Mahasiswa | Generate surat persetujuan Seminar Proposal | Proses, Dokumen |
| 8 | Admin/Sistem SIMTA | Buat jadwal seminar/sidang, validasi ruangan, dan pilih penguji | Proses, Dokumen |
| 9 | Mahasiswa/Dosen Penguji | Melihat informasi jadwal seminar/sidang | Dokumen |
| 10 | Admin/Sistem SIMTA | Input hasil/nilai/catatan sidang dan update status mahasiswa | Proses, Dokumen |
| 11 | Mahasiswa/Dosen Penguji/Sistem SIMTA | Revisi pasca sidang, feedback penguji, dan ACC revisi | Proses, Dokumen |
| 12 | Mahasiswa/Admin/Sistem SIMTA | Upload berkas wisuda, verifikasi admin, dan status selesai | Multi dokumen, Proses, Dokumen |

## Fitur yang Jangan Dimasukkan sebagai Fitur Penuh

| Fitur | Catatan |
|---|---|
| Form pendaftaran seminar proposal oleh mahasiswa | Tidak ditemukan sebagai modul pendaftaran khusus. Yang ada adalah pemeriksaan kesiapan sempro dan generate surat persetujuan. |
| Form pendaftaran seminar hasil oleh mahasiswa | Tidak ditemukan sebagai modul khusus. Yang ada adalah status tahap, bimbingan, dan jadwal semhas oleh admin. |
| Form pendaftaran sidang akhir oleh mahasiswa | Tidak ditemukan sebagai modul khusus. Jadwal sidang akhir dibuat oleh admin. |
| Aktivasi link pendaftaran sidang akhir | Tidak ditemukan sebagai fitur sistem. |
| Input hasil sidang langsung oleh dosen penguji | Source code menunjukkan hasil/nilai/catatan sidang diinput dari Kelola Jadwal milik admin. |
| Pelaksanaan sidang online di dalam SIMTA | Tidak ditemukan fitur sidang online. SIMTA mencatat jadwal, penguji, hasil, nilai, catatan, dan status. |
| Verifikasi berkas sempro/semhas lengkap sebagai checklist admin | Belum ditemukan modul verifikasi berkas sempro/semhas tersendiri. |
| Simbol kegiatan manual pada sistem usulan | Jangan digunakan, karena diagram usulan menggambarkan proses yang sudah dikomputerisasi SIMTA. |
| Decision diamond dan cabang Ya/Tidak | Jangan digunakan pada versi flowmap ini. Validasi cukup ditulis sebagai proses sistem. |
| Database silinder | Jangan digunakan bila mengikuti simbol referensi yang diberikan. Data sistem digambar sebagai dokumen/data digital. |

## Catatan Perbandingan dengan Sistem Sedang Berjalan

Pada ASI/SAI sistem yang sedang berjalan, beberapa aktivitas masih tampak sebagai pekerjaan manual, seperti penyerahan dokumen bimbingan, pencatatan revisi, pemeriksaan berkas, penyusunan jadwal, penyampaian jadwal, pencatatan hasil sidang, dan pengumpulan berkas kelulusan. Pada ASI/SAI sistem yang diusulkan, aktivitas tersebut tidak lagi digambar menggunakan simbol kegiatan manual. Seluruhnya dialihkan menjadi proses komputerisasi di SIMTA, dokumen digital, atau data yang tersimpan di sistem.

Dengan demikian, bagian usulan sebaiknya menonjolkan perubahan utama berikut:

1. Dokumen fisik menjadi upload PDF.
2. Catatan revisi manual menjadi feedback, status, dan reply di sistem.
3. Riwayat bimbingan manual menjadi versioning dan riwayat digital.
4. Pemeriksaan kesiapan sempro/sidang menjadi proses validasi sistem.
5. Surat persetujuan sempro dibuat oleh sistem.
6. Jadwal sidang dibuat dan divalidasi oleh SIMTA.
7. Jadwal dapat dilihat mahasiswa dan dosen penguji melalui sistem.
8. Hasil/nilai/catatan sidang dicatat admin pada SIMTA.
9. Revisi pasca sidang dikirim ke dosen penguji melalui modul bimbingan.
10. Berkas wisuda diunggah dan diverifikasi melalui SIMTA.

## Caption Gambar

**Gambar 4.x Aliran Sistem Informasi Sistem yang Diusulkan pada SIMTA**

Alternatif caption yang lebih spesifik:

**Gambar 4.x Aliran Sistem Informasi Sistem yang Diusulkan pada Sistem Informasi Manajemen Tugas Akhir (SIMTA)**

## Narasi Sebelum Gambar

Aliran Sistem Informasi sistem yang diusulkan menggambarkan proses manajemen tugas akhir setelah diterapkannya SIMTA sebagai sistem berbasis web. Diagram ini disusun dalam bentuk flowmap dengan lima swimlane, yaitu Mahasiswa, Sistem SIMTA, Dosen Pembimbing, Koordinator Tugas Akhir/Admin, dan Dosen Penguji. Proses yang sebelumnya dilakukan secara manual, seperti pengiriman dokumen bimbingan, pemberian feedback, penjadwalan sidang, pencatatan hasil sidang, serta verifikasi berkas kelulusan, dialihkan menjadi proses terkomputerisasi yang tersimpan di dalam sistem.

## Narasi Sesudah Gambar

Berdasarkan aliran sistem informasi yang diusulkan, SIMTA mengintegrasikan proses bimbingan, pengelolaan dokumen, pemberian feedback, penjadwalan seminar/sidang, revisi pasca sidang, serta verifikasi berkas wisuda dalam satu sistem. Setiap aktor memiliki peran sesuai hak aksesnya, sehingga mahasiswa, dosen pembimbing, admin/koordinator tugas akhir, dan dosen penguji dapat menggunakan fitur yang relevan dengan tugas masing-masing. Dengan adanya alur terkomputerisasi tersebut, proses manajemen tugas akhir menjadi lebih terdokumentasi, terstruktur, dan mudah dipantau.

## File Draw.io Acuan

File draw.io yang sudah disesuaikan dengan koreksi simbol ini:

`ASI_Sistem_Diusulkan_SIMTA_Flowmap_Simbol_Benar.drawio`

Catatan: file draw.io tersebut dibuat tanpa simbol manual, tanpa decision diamond, tanpa database silinder, dan tanpa label cabang "Ya/Tidak".
