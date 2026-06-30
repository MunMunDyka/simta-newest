# Analisis Flowchart Aktor SIMTA

Dokumen ini dibuat untuk membantu revisi Bab 4 skripsi SIMTA. Analisis diambil dari struktur kode frontend dan backend yang ada saat ini, dengan fokus pada alur kerja tiga aktor utama: Mahasiswa, Dosen Pembimbing, dan Admin.

Catatan penting: dokumen ini tidak membahas fitur internal/testing sebagai flowchart utama. Fitur seperti refresh token, reset password, upload avatar, health check, dan fitur teknis lain cukup dianggap sebagai pendukung sistem.

## 1. Ringkasan Tujuan

Flowchart Bab 4 sebaiknya tidak dibuat terlalu kecil per fitur seperti login, upload bimbingan, plotting dospem, dan review bimbingan secara terpisah. Berdasarkan kode SIMTA saat ini, flowchart lebih cocok disusun berdasarkan alur kerja aktor utama.

Tiga flowchart utama yang direkomendasikan:

1. Flowchart Alur Kerja Mahasiswa
2. Flowchart Alur Kerja Dosen Pembimbing
3. Flowchart Alur Kerja Admin

Login tetap dimasukkan ke dalam masing-masing alur aktor, karena semua aktor memulai proses melalui autentikasi yang sama tetapi diarahkan ke dashboard berbeda sesuai role.

## 2. Aktor dan Hak Akses

| Aktor | Hak Akses Utama | Modul Yang Digunakan | File Frontend Relevan | Endpoint/Backend Relevan |
|---|---|---|---|---|
| Mahasiswa | Login, melihat dashboard progress, upload bimbingan, memilih Dospem 1/2, melihat riwayat bimbingan, melihat feedback, membalas komentar, melihat jadwal sidang, generate surat sempro jika syarat terpenuhi | Login, Dashboard Mahasiswa, Bimbingan Mahasiswa, Jadwal Sidang | `Login.tsx`, `DashboardMhs.tsx`, `BimbinganMahasiswa.tsx`, `JadwalSidang.tsx` | `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/bimbingan`, `POST /api/bimbingan`, `POST /api/bimbingan/:id/reply`, `GET /api/bimbingan/download/:id`, `GET /api/bimbingan/sempro-status/:mahasiswaId`, `GET /api/bimbingan/generate-surat-sempro/:mahasiswaId`, `GET /api/jadwal` |
| Dosen Pembimbing | Login, melihat dashboard/ringkasan mahasiswa bimbingan, melihat daftar mahasiswa bimbingan, membuka detail bimbingan, download dokumen, memberi feedback/status, upload file feedback, membalas komentar, melihat jadwal sidang | Login, Dashboard Dosen, Mahasiswa Bimbingan, Review Bimbingan, Jadwal Sidang | `Login.tsx`, `DashboardDosen.tsx`, `ListMahasiswaBimbingan.tsx`, `BimbinganDosen.tsx`, `JadwalSidang.tsx` | `POST /api/auth/login`, `GET /api/bimbingan`, `GET /api/bimbingan/download/:id`, `PUT /api/bimbingan/:id/feedback`, `POST /api/bimbingan/:id/reply`, `GET /api/bimbingan/pending-count`, `GET /api/jadwal` |
| Admin | Login, melihat dashboard admin, mengelola data user, tambah/edit/nonaktif user, assign Dospem 1/2, melihat/kelola bimbingan, mengelola jadwal sidang, melihat laporan/progress | Login, Dashboard Admin, Manajemen User, Edit User, Kelola Bimbingan, Kelola Jadwal, Laporan | `Login.tsx`, `DashboardAdmin.tsx`, `ManajemenUser.tsx`, `EditUser.tsx`, `KelolaBimbingan.tsx`, `KelolaJadwal.tsx`, `Laporan.tsx` | `POST /api/auth/login`, `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id`, `PUT /api/users/:id/assign-dospem`, `GET /api/users/dosen`, `GET /api/bimbingan/admin/progress-report`, `GET /api/bimbingan/admin/mahasiswa/:mahasiswaId`, `GET /api/jadwal`, `POST /api/jadwal`, `PUT /api/jadwal/:id`, `DELETE /api/jadwal/:id` |

Model MongoDB yang berkaitan:

- `User`: data mahasiswa, dosen, admin, dospem, progress, kontak.
- `Bimbingan`: data upload bimbingan, file, status, feedback, file feedback.
- `Reply`: data komentar/balasan pada bimbingan.
- `Jadwal`: data jadwal sidang proposal/skripsi.

## 3. Flowchart Alur Kerja Mahasiswa

### Narasi Alur Singkat

Mahasiswa memulai proses dengan login menggunakan username/NIM dan password. Jika berhasil, sistem mengarahkan mahasiswa ke dashboard mahasiswa. Dashboard menampilkan data identitas, judul tugas akhir, progress, status dosen pembimbing, total bimbingan, dan status kesiapan sempro/sidang jika tersedia.

Mahasiswa kemudian masuk ke halaman Bimbingan. Pada halaman ini mahasiswa memilih tab Dospem 1 atau Dospem 2 sebagai tujuan bimbingan. Sistem menampilkan riwayat bimbingan berdasarkan dosen yang dipilih. Jika belum ada bimbingan atau tidak ada bimbingan berstatus `menunggu`, mahasiswa dapat membuka form kirim bimbingan baru.

Mahasiswa mengisi judul bimbingan, mengunggah file PDF, dan menambahkan catatan opsional. Sistem melakukan validasi judul, file PDF, dosen pembimbing, dan catatan. Backend juga mengecek apakah mahasiswa masih memiliki bimbingan berstatus `menunggu` pada dosen yang sama. Jika valid, sistem menyimpan bimbingan baru, membuat nomor versi dokumen, dan memberi status awal `menunggu`.

Setelah dosen memberi feedback, mahasiswa dapat melihat status seperti `revisi`, `acc`, `lanjut_bab`, atau `acc_sempro`, membaca catatan feedback dosen, membalas komentar jika diperlukan, dan mengirim revisi baru jika tidak ada bimbingan yang masih menunggu review.

Mahasiswa juga dapat melihat halaman Jadwal Sidang. Pada kode frontend, halaman jadwal mengambil data jadwal dengan parameter `viewAll=true`, sehingga data yang ditampilkan bersifat umum. Backend sebenarnya mendukung filter jadwal berdasarkan role mahasiswa. Perlu dikonfirmasi apakah pada Bab 4 jadwal ingin ditulis sebagai jadwal umum atau jadwal milik mahasiswa.

### Urutan Langkah Flowchart

1. Mahasiswa membuka aplikasi SIMTA.
2. Mahasiswa mengisi username/NIM dan password.
3. Sistem memvalidasi kredensial login.
4. Jika login berhasil, sistem mengarahkan ke Dashboard Mahasiswa.
5. Mahasiswa melihat data progress, dospem, status bimbingan, dan total bimbingan.
6. Mahasiswa membuka menu Bimbingan.
7. Mahasiswa memilih Dospem 1 atau Dospem 2.
8. Sistem mengambil riwayat bimbingan sesuai dospem yang dipilih.
9. Sistem mengecek apakah ada bimbingan terbaru berstatus `menunggu`.
10. Jika ada bimbingan menunggu, form upload dinonaktifkan sementara.
11. Jika tidak ada bimbingan menunggu, mahasiswa dapat membuka form kirim bimbingan.
12. Mahasiswa mengisi judul, memilih file PDF, dan mengisi catatan opsional.
13. Sistem memvalidasi input dan file.
14. Backend mengecek dosen pembimbing yang dituju sudah di-assign atau belum.
15. Backend mengecek apakah masih ada bimbingan menunggu untuk dospem tersebut.
16. Backend membuat versi bimbingan baru dan menyimpan file.
17. Sistem menyimpan data bimbingan dengan status `menunggu`.
18. Sistem memicu notifikasi ke dosen jika email/WhatsApp tersedia.
19. Mahasiswa melihat riwayat bimbingan dan status terbaru.
20. Jika feedback sudah diberikan, mahasiswa membaca feedback dan dapat membalas komentar.
21. Mahasiswa dapat membuka menu Jadwal Sidang untuk melihat jadwal.
22. Selesai.

### Decision/Percabangan Penting

| Decision | Ya | Tidak |
|---|---|---|
| Login valid? | Masuk Dashboard Mahasiswa | Tampilkan pesan login gagal |
| Dospem tujuan dipilih? | Lanjut ke riwayat/upload | Tampilkan validasi pilihan dospem |
| Dosen pembimbing sudah di-assign? | Lanjut upload | Tampilkan pesan dospem belum di-assign |
| File bimbingan tersedia? | Validasi tipe file | Tampilkan pesan file wajib diunggah |
| File berformat PDF? | Lanjut simpan | Tampilkan pesan hanya PDF yang diperbolehkan |
| Judul bimbingan valid? | Lanjut submit | Tampilkan pesan judul wajib/minimal/maksimal |
| Masih ada bimbingan berstatus `menunggu`? | Form kirim baru dinonaktifkan | Form kirim baru bisa digunakan |
| Submit berhasil? | Bimbingan tersimpan dan riwayat diperbarui | Tampilkan pesan gagal |
| Feedback dari dosen sudah ada? | Mahasiswa bisa membaca feedback dan reply | Status tetap menunggu review |

### Output Sukses dan Output Error

Output sukses:

- Mahasiswa berhasil login.
- Dashboard menampilkan data mahasiswa dan progress.
- Bimbingan berhasil dikirim dengan status `menunggu`.
- Riwayat bimbingan diperbarui.
- Feedback dan status dosen dapat dilihat.
- Balasan komentar berhasil dikirim.
- Jadwal sidang dapat ditampilkan jika data tersedia.

Output error:

- Login gagal.
- Dosen pembimbing belum di-assign.
- File tidak diunggah.
- File bukan PDF.
- Judul bimbingan tidak valid.
- Catatan melebihi batas.
- Masih ada bimbingan yang menunggu feedback.
- Gagal memuat riwayat bimbingan.
- Gagal mengirim balasan.

### Catatan Fitur Yang Ada di Kode

- Pemilihan Dospem 1 dan Dospem 2 ada di UI mahasiswa melalui tab.
- Upload dokumen bimbingan ada di frontend dan backend.
- Validasi PDF ada di frontend dan backend.
- Cegah upload baru ketika masih ada status `menunggu` ada di frontend dan backend.
- Versi dokumen dibuat otomatis pada model/controller bimbingan.
- Riwayat bimbingan dan feedback dosen tampil di UI.
- Reply komentar ada di model `Reply`, endpoint backend, service frontend, dan UI mahasiswa.
- Generate surat sempro/sidang ada melalui endpoint DOCX jika syarat terpenuhi.
- Jadwal sidang ada, tetapi UI saat ini memakai `viewAll=true`; perlu dikonfirmasi jika ingin ditulis sebagai jadwal personal mahasiswa.

## 4. Flowchart Alur Kerja Dosen Pembimbing

### Narasi Alur Singkat

Dosen pembimbing login ke SIMTA dan diarahkan ke Dashboard Dosen. Dashboard menampilkan ringkasan mahasiswa bimbingan, jumlah mahasiswa aktif, jumlah yang memenuhi syarat, dan jumlah bimbingan yang perlu direview. Dosen dapat membuka daftar Mahasiswa Bimbingan untuk melihat mahasiswa yang berada dalam bimbingannya.

Dosen memilih mahasiswa untuk membuka halaman Review Bimbingan. Sistem mengambil bimbingan milik mahasiswa tersebut yang ditujukan kepada dosen yang sedang login. Halaman review menampilkan identitas mahasiswa, judul tugas akhir, progress, dokumen yang dikirim, catatan mahasiswa, dan riwayat bimbingan.

Jika bimbingan terbaru masih berstatus `menunggu`, dosen dapat mengisi form feedback. Dosen memilih status hasil review, yaitu `revisi`, `acc`, `lanjut_bab`, atau `acc_sempro`. Dosen wajib mengisi feedback dan dapat mengunggah file feedback PDF secara opsional.

Backend memvalidasi apakah bimbingan ditemukan, apakah dosen tersebut berhak memberi feedback, apakah status masih `menunggu`, apakah status dan feedback valid, dan apakah syarat minimal bimbingan terpenuhi jika status `acc_sempro`. Jika berhasil, sistem menyimpan feedback, mengubah status bimbingan, menyimpan tanggal feedback, menyimpan file feedback jika ada, dan memperbarui progress mahasiswa jika status `lanjut_bab`.

Setelah feedback tersimpan, sistem mencoba mengirim notifikasi email/WhatsApp kepada mahasiswa jika data kontak tersedia dan fitur notifikasi aktif. Notifikasi bersifat pendukung, sehingga kegagalan notifikasi tidak menggagalkan penyimpanan feedback.

### Urutan Langkah Flowchart

1. Dosen membuka aplikasi SIMTA.
2. Dosen mengisi username/NIP dan password.
3. Sistem memvalidasi login.
4. Jika berhasil, sistem mengarahkan ke Dashboard Dosen.
5. Dosen melihat ringkasan mahasiswa bimbingan.
6. Dosen membuka menu Mahasiswa Bimbingan.
7. Sistem menampilkan daftar mahasiswa yang dibimbing dosen.
8. Dosen memilih mahasiswa.
9. Sistem mengambil detail dan riwayat bimbingan mahasiswa tersebut.
10. Dosen melihat dokumen, catatan mahasiswa, dan riwayat.
11. Dosen dapat menekan Download File.
12. Sistem mengecek file tersedia dan mengunduh dokumen.
13. Sistem mengecek status bimbingan terbaru.
14. Jika status `menunggu`, sistem menampilkan form feedback.
15. Dosen memilih status review.
16. Dosen mengisi feedback.
17. Dosen dapat mengunggah file feedback PDF opsional.
18. Sistem memvalidasi status, feedback, dan file.
19. Backend memvalidasi hak akses dosen dan status bimbingan.
20. Backend menyimpan feedback dan status baru.
21. Jika status `lanjut_bab`, backend menaikkan progress mahasiswa.
22. Jika status `acc_sempro`, backend memastikan minimal 5 kali bimbingan pada dospem terkait.
23. Sistem memicu notifikasi kepada mahasiswa jika kontak tersedia.
24. Frontend mengarahkan dosen kembali ke daftar mahasiswa bimbingan.
25. Dosen dapat membuka menu Jadwal Sidang untuk melihat jadwal sebagai penguji atau jadwal yang ditampilkan sistem.
26. Selesai.

### Decision/Percabangan Penting

| Decision | Ya | Tidak |
|---|---|---|
| Login valid? | Masuk Dashboard Dosen | Tampilkan pesan login gagal |
| Ada mahasiswa bimbingan? | Tampilkan daftar mahasiswa | Tampilkan data kosong |
| Data bimbingan ditemukan? | Tampilkan detail review | Tampilkan pesan bimbingan tidak ditemukan |
| Dosen berhak mereview? | Lanjut ke form/status | Tampilkan akses ditolak |
| File dokumen tersedia? | Download file | Tampilkan pesan file tidak ditemukan |
| Status bimbingan masih `menunggu`? | Tampilkan form feedback | Tampilkan keterangan sudah direview |
| Status feedback valid? | Lanjut validasi feedback | Tampilkan pesan status wajib/tidak valid |
| Feedback diisi 5-2000 karakter? | Lanjut submit | Tampilkan pesan validasi feedback |
| File feedback ada? | Validasi PDF | Lewati upload file feedback |
| File feedback PDF? | Lanjut simpan | Tampilkan pesan lampiran harus PDF |
| Status `acc_sempro` dipilih? | Cek minimal 5 bimbingan | Langsung simpan feedback |
| Minimal 5 bimbingan terpenuhi? | Simpan status `acc_sempro` | Tampilkan pesan syarat belum terpenuhi |
| Status `lanjut_bab` dipilih? | Update progress mahasiswa | Progress tidak berubah |
| Notifikasi terkirim? | Catat sukses | Catat gagal, feedback tetap tersimpan |

### Output Sukses dan Output Error

Output sukses:

- Dosen berhasil login.
- Daftar mahasiswa bimbingan tampil.
- Detail bimbingan dan dokumen mahasiswa tampil.
- File dokumen berhasil diunduh.
- Feedback berhasil disimpan.
- Status bimbingan berubah.
- Progress mahasiswa naik jika status `lanjut_bab`.
- Notifikasi email/WhatsApp dipicu jika kontak tersedia.
- Riwayat bimbingan menampilkan status dan feedback terbaru.

Output error:

- Login gagal.
- Data bimbingan tidak ditemukan.
- Dosen tidak memiliki akses ke bimbingan.
- File dokumen tidak ditemukan di server.
- Bimbingan sudah direview sehingga feedback tidak bisa diubah.
- Status feedback tidak valid.
- Feedback kosong/terlalu pendek/terlalu panjang.
- Lampiran feedback bukan PDF.
- Syarat `acc_sempro` belum terpenuhi.
- Gagal memuat daftar mahasiswa atau detail bimbingan.

### Catatan Fitur Yang Ada di Kode

- Dashboard dosen dan daftar mahasiswa bimbingan ada di frontend.
- Detail review dosen ada di `BimbinganDosen.tsx`.
- Download dokumen bimbingan ada di frontend dan backend.
- Feedback dosen ada di UI dan backend.
- Upload file feedback opsional ada di UI dan backend melalui `feedbackFile`.
- Status review yang tersedia: `revisi`, `acc`, `lanjut_bab`, `acc_sempro`.
- Status `lanjut_bab` memperbarui `currentProgress` mahasiswa.
- Status `acc_sempro` mensyaratkan minimal 5 kali bimbingan pada dospem terkait.
- Notifikasi email/WhatsApp setelah feedback ada di backend.
- Reply komentar tersedia di backend dan service; pada UI dosen, riwayat feedback tampil, tetapi form reply utama yang terlihat paling jelas ada di UI mahasiswa. Jika ingin menonjolkan diskusi dua arah pada flow dosen, perlu dicek lagi tampilan UI dosen yang digunakan saat demo.

## 5. Flowchart Alur Kerja Admin

### Narasi Alur Singkat

Admin login ke SIMTA dan diarahkan ke Dashboard Admin. Admin dapat melihat ringkasan data sistem seperti jumlah mahasiswa, dosen, user aktif, dan data jadwal. Admin kemudian dapat membuka modul Manajemen User untuk mengelola data mahasiswa dan dosen.

Pada Manajemen User, admin dapat melihat daftar user, melakukan pencarian/filter, menambah user baru, membuka detail user, mengedit data user, menonaktifkan user, dan melakukan assign dosen pembimbing. Untuk mahasiswa, admin dapat mengatur informasi akademik seperti program studi, semester, judul tugas akhir, progress, serta Dospem 1 dan Dospem 2. Backend memastikan user yang di-assign adalah mahasiswa, dosen pembimbing yang dipilih benar-benar role dosen, dan Dospem 1 tidak sama dengan Dospem 2.

Admin juga dapat membuka Kelola Jadwal untuk membuat, mengedit, membatalkan, menyelesaikan, dan menghapus jadwal sidang sesuai status. Backend memvalidasi mahasiswa, penguji, ruangan, jadwal yang sudah ada, serta status jadwal. Jika jadwal berhasil dibuat, sistem memicu notifikasi email/WhatsApp kepada mahasiswa dan penguji jika kontak tersedia.

Modul Kelola Bimbingan dan Laporan juga ada di UI admin. Kelola Bimbingan digunakan untuk melihat/kelola riwayat bimbingan mahasiswa, sedangkan Laporan membaca progress report bimbingan. Untuk flowchart utama Bab 4, kedua modul ini bisa masuk sebagai bagian monitoring admin, bukan flow terpisah.

### Urutan Langkah Flowchart

1. Admin membuka aplikasi SIMTA.
2. Admin mengisi username dan password.
3. Sistem memvalidasi login.
4. Jika berhasil, sistem mengarahkan ke Dashboard Admin.
5. Admin melihat ringkasan data sistem.
6. Admin membuka Manajemen User.
7. Sistem menampilkan daftar mahasiswa, dosen, dan admin.
8. Admin memilih aksi: tambah user, edit user, assign dospem, nonaktifkan user, atau lihat detail.
9. Jika tambah user, admin mengisi data user baru.
10. Sistem memvalidasi NIM/NIP, password, nama, email, dan role.
11. Backend mengecek apakah NIM/NIP sudah terdaftar.
12. Jika valid, backend menyimpan user baru.
13. Jika edit user, admin mengubah data umum/akademik.
14. Backend menyimpan perubahan data user.
15. Jika assign dospem, admin memilih Dospem 1 dan Dospem 2.
16. Backend memvalidasi mahasiswa dan dosen pembimbing.
17. Backend memastikan Dospem 1 dan Dospem 2 tidak sama.
18. Backend menyimpan plotting dosen pembimbing.
19. Admin membuka Kelola Jadwal.
20. Sistem menampilkan daftar jadwal.
21. Admin memilih aksi: buat, edit, batalkan, selesaikan, atau hapus jadwal.
22. Jika membuat jadwal, admin memilih mahasiswa, jenis sidang, tanggal, waktu, ruangan, dan penguji.
23. Backend memvalidasi mahasiswa, penguji, slot ruangan, dan jadwal duplikat.
24. Backend menyimpan jadwal sidang.
25. Sistem memicu notifikasi kepada mahasiswa/penguji jika kontak tersedia.
26. Admin dapat membuka Kelola Bimbingan/Laporan untuk monitoring progress.
27. Selesai.

### Decision/Percabangan Penting

| Decision | Ya | Tidak |
|---|---|---|
| Login valid? | Masuk Dashboard Admin | Tampilkan pesan login gagal |
| Data user tersedia? | Tampilkan daftar user | Tampilkan data kosong |
| NIM/NIP sudah terdaftar? | Tampilkan pesan duplikat | Lanjut simpan user baru |
| Role user valid? | Lanjut simpan | Tampilkan pesan role tidak valid |
| User yang di-assign adalah mahasiswa? | Lanjut validasi dosen | Tampilkan pesan hanya mahasiswa dapat di-assign |
| Dospem yang dipilih valid dan role dosen? | Lanjut simpan dospem | Tampilkan pesan dosen pembimbing tidak valid |
| Dospem 1 dan Dospem 2 sama? | Tampilkan pesan tidak boleh sama | Simpan plotting dospem |
| Admin menonaktifkan akun sendiri? | Tampilkan pesan tidak boleh | Lanjut nonaktifkan user |
| Mahasiswa jadwal valid? | Lanjut validasi penguji | Tampilkan pesan mahasiswa tidak valid |
| Penguji valid dan role dosen? | Lanjut cek slot | Tampilkan pesan penguji tidak valid |
| Slot ruangan tersedia? | Lanjut cek jadwal mahasiswa | Tampilkan konflik ruangan |
| Mahasiswa sudah punya jadwal jenis yang sama? | Tampilkan pesan jadwal sudah ada | Simpan jadwal baru |
| Jadwal sudah selesai? | Tidak boleh diubah/dihapus biasa | Jadwal dapat diedit/dibatalkan |
| Notifikasi jadwal terkirim? | Catat sukses | Catat gagal, jadwal tetap tersimpan |

### Output Sukses dan Output Error

Output sukses:

- Admin berhasil login.
- Dashboard admin menampilkan ringkasan data.
- Daftar user tampil.
- User baru berhasil ditambahkan.
- Data user berhasil diperbarui.
- User berhasil dinonaktifkan.
- Dosen pembimbing berhasil di-assign.
- Jadwal sidang berhasil dibuat.
- Jadwal berhasil diedit, dibatalkan, diselesaikan, atau dihapus sesuai aturan.
- Laporan/progress bimbingan dapat ditampilkan jika data tersedia.

Output error:

- Login gagal.
- NIM/NIP duplikat.
- Data user tidak ditemukan.
- Role tidak valid.
- Email tidak valid.
- Dosen pembimbing tidak valid.
- Dospem 1 dan 2 sama.
- Tidak bisa menghapus akun sendiri.
- Tidak bisa menghapus akun admin tertentu.
- Mahasiswa/penguji jadwal tidak valid.
- Slot ruangan bentrok.
- Mahasiswa sudah memiliki jadwal untuk jenis sidang yang sama.
- Jadwal selesai tidak dapat diubah/dihapus biasa.

### Catatan Fitur Yang Ada di Kode

- Dashboard admin ada di frontend.
- Manajemen User ada di frontend dan backend.
- Tambah user ada di UI dan endpoint `POST /api/users`.
- Edit user ada di UI `EditUser.tsx` dan endpoint `PUT /api/users/:id`.
- Nonaktif user ada di UI dan backend melalui soft delete `DELETE /api/users/:id`.
- Assign dospem ada di UI dan backend melalui `PUT /api/users/:id/assign-dospem`.
- Validasi Dospem 1 dan Dospem 2 tidak boleh sama ada di backend.
- Kelola Jadwal ada di UI dan backend.
- Create, update, cancel, hard delete jadwal ada di backend dan dipakai UI admin.
- Notifikasi jadwal ke mahasiswa/penguji ada di backend.
- Kelola Bimbingan dan Laporan ada, tetapi lebih tepat sebagai monitoring admin dibanding flowchart utama yang berdiri sendiri.

## 6. Rekomendasi Flowchart Final Bab 4

### Apakah cukup 3 flowchart aktor?

Ya, untuk Bab 4 cukup menggunakan 3 flowchart utama berdasarkan aktor:

1. Flowchart Mahasiswa
2. Flowchart Dosen Pembimbing
3. Flowchart Admin

Tiga flowchart ini sudah mencakup fitur utama sistem tanpa membuat diagram terlalu banyak dan terpecah-pecah.

### Apakah flowchart login perlu berdiri sendiri?

Tidak wajib. Login lebih baik digabung ke awal masing-masing flowchart aktor. Alasannya, semua aktor melewati login yang sama, tetapi hasil akhirnya berbeda berdasarkan role:

- Mahasiswa diarahkan ke Dashboard Mahasiswa.
- Dosen diarahkan ke Dashboard Dosen.
- Admin diarahkan ke Dashboard Admin.

Jika dosen meminta diagram autentikasi khusus, login bisa dibuat sebagai activity diagram pendukung, bukan flowchart utama.

### Flowchart fitur lama yang sebaiknya digabung

- Flowchart Login digabung ke semua flowchart aktor.
- Flowchart Upload Bimbingan digabung ke Flowchart Mahasiswa.
- Flowchart Riwayat Bimbingan digabung ke Flowchart Mahasiswa.
- Flowchart Review/Feedback Bimbingan digabung ke Flowchart Dosen.
- Flowchart Download Dokumen digabung ke Flowchart Dosen.
- Flowchart Reply Komentar digabung ke Flowchart Mahasiswa dan Dosen sebagai proses diskusi/komentar.
- Flowchart Plotting Dospem digabung ke Flowchart Admin.
- Flowchart Kelola Jadwal digabung ke Flowchart Admin.
- Flowchart Lihat Jadwal digabung ke Flowchart Mahasiswa/Dosen sebagai proses melihat informasi jadwal.

### Flowchart yang wajib masuk Bab 4

1. Flowchart Alur Kerja Mahasiswa
2. Flowchart Alur Kerja Dosen Pembimbing
3. Flowchart Alur Kerja Admin

Flowchart opsional jika Bab 4 masih membutuhkan detail tambahan:

- Flowchart proses bimbingan end-to-end: Mahasiswa upload - Dosen review - Mahasiswa revisi.
- Flowchart kelola jadwal sidang, jika jadwal sidang menjadi fitur yang ditonjolkan.

## 7. Mapping Flowchart Lama ke Flowchart Baru

| Flowchart Lama | Digabung Ke Flowchart Baru | Alasan |
|---|---|---|
| Login | Mahasiswa, Dosen, Admin | Semua aktor melewati login, tetapi output diarahkan berdasarkan role |
| Dashboard Mahasiswa | Flowchart Mahasiswa | Menjadi langkah awal setelah mahasiswa login |
| Upload Bimbingan | Flowchart Mahasiswa | Upload bimbingan adalah proses utama mahasiswa |
| Pilih Dospem 1/2 | Flowchart Mahasiswa | Termasuk bagian dari upload bimbingan |
| Riwayat Bimbingan | Flowchart Mahasiswa | Mahasiswa melihat status/feedback dari proses bimbingan |
| Reply Komentar | Flowchart Mahasiswa dan Dosen | Fitur diskusi terjadi pada data bimbingan yang sama |
| Dashboard Dosen | Flowchart Dosen | Menjadi langkah awal setelah dosen login |
| List Mahasiswa Bimbingan | Flowchart Dosen | Bagian dari proses dosen memilih mahasiswa yang akan direview |
| Review Bimbingan | Flowchart Dosen | Proses utama dosen pembimbing |
| Download Dokumen | Flowchart Dosen | Bagian dari proses review |
| Upload File Feedback | Flowchart Dosen | Bagian opsional dari proses feedback |
| Dashboard Admin | Flowchart Admin | Menjadi langkah awal setelah admin login |
| Manajemen User | Flowchart Admin | Bagian utama pengelolaan data dasar |
| Tambah/Edit User | Flowchart Admin | Termasuk proses manajemen user |
| Plotting/Assign Dospem | Flowchart Admin | Bagian dari pengaturan data mahasiswa |
| Kelola Jadwal Sidang | Flowchart Admin | Bagian dari administrasi jadwal |
| Lihat Jadwal Sidang | Flowchart Mahasiswa dan Dosen | Aktor melihat jadwal yang tersedia |
| Laporan Progress | Flowchart Admin | Lebih tepat sebagai monitoring admin, bukan flow terpisah |

## 8. Rancangan Simbol Flowchart

Bagian ini berisi rancangan teks singkat yang bisa langsung diterjemahkan menjadi simbol flowchart.

### 8.1 Rancangan Flowchart Mahasiswa

```text
MULAI

Input username dan password

Proses validasi login

Decision: Login valid?
    Tidak -> Output pesan login gagal -> SELESAI
    Ya -> Proses masuk Dashboard Mahasiswa

Output dashboard progress, dospem, dan status bimbingan

Input pilih menu Bimbingan

Input pilih Dospem 1 atau Dospem 2

Proses ambil riwayat bimbingan sesuai dospem

Decision: Ada bimbingan menunggu review?
    Ya -> Output form upload dinonaktifkan sementara
          Output riwayat dan status menunggu review
    Tidak -> Input buka form kirim bimbingan

Input judul bimbingan, file PDF, dan catatan opsional

Proses validasi judul, file, dan catatan

Decision: Data valid?
    Tidak -> Output pesan validasi -> Kembali ke form
    Ya -> Proses cek dosen pembimbing

Decision: Dosen pembimbing sudah di-assign?
    Tidak -> Output dospem belum di-assign -> SELESAI
    Ya -> Proses cek bimbingan menunggu pada dospem terkait

Decision: Masih ada bimbingan menunggu?
    Ya -> Output tunggu feedback dosen -> SELESAI
    Tidak -> Proses simpan bimbingan dan file

Proses buat versi dokumen

Output bimbingan tersimpan dengan status menunggu

Proses notifikasi ke dosen jika kontak tersedia

Output riwayat bimbingan diperbarui

Decision: Feedback dosen tersedia?
    Ya -> Output status dan feedback dosen
          Input balasan komentar jika diperlukan
          Proses simpan reply
          Output balasan berhasil dikirim
    Tidak -> Output menunggu review dosen

Input buka Jadwal Sidang jika diperlukan

Proses ambil data jadwal

Output jadwal sidang

SELESAI
```

### 8.2 Rancangan Flowchart Dosen Pembimbing

```text
MULAI

Input username dan password

Proses validasi login

Decision: Login valid?
    Tidak -> Output pesan login gagal -> SELESAI
    Ya -> Proses masuk Dashboard Dosen

Output ringkasan mahasiswa bimbingan

Input buka menu Mahasiswa Bimbingan

Proses ambil daftar mahasiswa bimbingan

Decision: Ada mahasiswa bimbingan?
    Tidak -> Output daftar kosong -> SELESAI
    Ya -> Output daftar mahasiswa bimbingan

Input pilih mahasiswa

Proses ambil detail dan riwayat bimbingan mahasiswa

Decision: Data bimbingan ditemukan?
    Tidak -> Output bimbingan tidak ditemukan -> SELESAI
    Ya -> Output detail dokumen dan catatan mahasiswa

Input download dokumen jika diperlukan

Decision: File tersedia?
    Tidak -> Output file tidak ditemukan
    Ya -> Proses download file

Decision: Status bimbingan menunggu?
    Tidak -> Output bimbingan sudah direview -> SELESAI
    Ya -> Output form feedback

Input pilih status review

Input isi feedback

Input upload file feedback PDF opsional

Proses validasi status, feedback, dan file

Decision: Data feedback valid?
    Tidak -> Output pesan validasi -> Kembali ke form feedback
    Ya -> Proses cek hak akses dosen

Decision: Dosen berhak mereview?
    Tidak -> Output akses ditolak -> SELESAI
    Ya -> Proses cek syarat status

Decision: Status ACC Sempro/Sidang?
    Ya -> Proses cek minimal 5 kali bimbingan
          Decision: Syarat terpenuhi?
              Tidak -> Output syarat belum terpenuhi -> SELESAI
              Ya -> Proses simpan feedback
    Tidak -> Proses simpan feedback

Proses ubah status bimbingan

Decision: Status Lanjut BAB?
    Ya -> Proses update progress mahasiswa
    Tidak -> Lewati update progress

Proses kirim notifikasi ke mahasiswa jika kontak tersedia

Output feedback berhasil diberikan

SELESAI
```

### 8.3 Rancangan Flowchart Admin

```text
MULAI

Input username dan password

Proses validasi login

Decision: Login valid?
    Tidak -> Output pesan login gagal -> SELESAI
    Ya -> Proses masuk Dashboard Admin

Output ringkasan data sistem

Input pilih modul Manajemen User

Proses ambil daftar user

Output daftar mahasiswa dan dosen

Decision: Aksi admin?
    Tambah user -> Input data user baru
    Edit user -> Input perubahan data user
    Assign dospem -> Input dospem 1 dan dospem 2
    Nonaktifkan user -> Input konfirmasi nonaktif

Proses validasi data user

Decision: Data user valid?
    Tidak -> Output pesan validasi -> Kembali ke form
    Ya -> Proses simpan data user

Decision: Aksi assign dospem?
    Tidak -> Lanjut output hasil aksi user
    Ya -> Proses validasi mahasiswa dan dosen

Decision: User adalah mahasiswa?
    Tidak -> Output hanya mahasiswa dapat di-assign -> SELESAI
    Ya -> Proses validasi dospem

Decision: Dospem valid dan tidak sama?
    Tidak -> Output pesan dospem tidak valid -> Kembali ke form
    Ya -> Proses simpan dospem

Output data user/dospem berhasil disimpan

Input pilih modul Kelola Jadwal

Proses ambil daftar jadwal

Output daftar jadwal sidang

Decision: Aksi jadwal?
    Buat jadwal -> Input data jadwal baru
    Edit jadwal -> Input perubahan jadwal
    Batalkan jadwal -> Input alasan pembatalan
    Selesaikan jadwal -> Input hasil sidang

Proses validasi mahasiswa, penguji, waktu, dan ruangan

Decision: Data jadwal valid?
    Tidak -> Output pesan validasi/konflik -> Kembali ke form jadwal
    Ya -> Proses simpan jadwal

Proses kirim notifikasi jadwal jika kontak tersedia

Output jadwal berhasil diproses

Input buka Kelola Bimbingan/Laporan jika diperlukan

Proses ambil data progress bimbingan

Output data monitoring bimbingan

SELESAI
```

## Catatan Akhir Untuk Bab 4

- Untuk Bab 4, gunakan istilah yang konsisten: `bimbingan`, `feedback`, `revisi`, `ACC`, `Lanjut BAB`, dan `ACC Maju Sidang/Sempro`.
- Di kode, enum masih menggunakan `acc_sempro`; jika narasi skripsi memakai "sidang", jelaskan sebagai label tampilan atau sesuaikan istilah di narasi.
- Notifikasi email dan WhatsApp ada di backend, tetapi sebaiknya ditulis sebagai fitur pendukung, bukan inti flowchart.
- Jadwal sidang ada di UI dan backend. Namun UI bersama `JadwalSidang.tsx` memakai `viewAll=true`, sehingga perlu dikonfirmasi apakah jadwal ditampilkan umum atau berdasarkan role.
- Tiga flowchart aktor sudah cukup untuk menjelaskan sistem tanpa membuat Bab 4 terlalu penuh diagram fitur kecil.

