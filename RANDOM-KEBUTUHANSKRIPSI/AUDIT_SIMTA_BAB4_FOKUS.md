# Audit Fokus Bab 4 SIMTA

Tanggal audit: 4 Juni 2026  
Judul penelitian: Pengembangan Sistem Manajemen Tugas Akhir Terintegrasi Berbasis Web untuk Optimalisasi Proses Bimbingan  
Scope: fitur utama yang relevan untuk Bab 4 berdasarkan alur pengguna, bukan seluruh detail teknis backend.

> Dokumen ini hanya memuat fitur yang layak ditonjolkan dalam Bab 4. Fitur internal, testing, atau fitur teknis pendukung tidak dijadikan fokus utama.

## Daftar Isi

1. [A. Daftar Fitur Utama yang Layak Masuk Bab 4](#a-daftar-fitur-utama-yang-layak-masuk-bab-4)
2. [B. Fitur Pendukung atau Internal yang Tidak Perlu Ditonjolkan](#b-fitur-pendukung-atau-internal-yang-tidak-perlu-ditonjolkan)
3. [C. Rekomendasi Kebutuhan Fungsional Per Role](#c-rekomendasi-kebutuhan-fungsional-per-role)
4. [D. Rekomendasi Flowchart](#d-rekomendasi-flowchart)
5. [E. Rekomendasi Desain UI yang Dilampirkan](#e-rekomendasi-desain-ui-yang-dilampirkan)
6. [F. Struktur Database atau Collection](#f-struktur-database-atau-collection)
7. [G. Catatan Konsistensi Istilah](#g-catatan-konsistensi-istilah)
8. [Kesimpulan](#kesimpulan)

---

## A. Daftar Fitur Utama yang Layak Masuk Bab 4

Fitur utama Bab 4 sebaiknya difokuskan pada proses bimbingan tugas akhir antara Mahasiswa dan Dosen, dengan Admin sebagai pengelola data dasar.

### 1. Fitur Utama Mahasiswa

| Fitur | Halaman/UI | Backend Terkait | Model | Status Bab 4 | Catatan |
|---|---|---|---|---|---|
| Login mahasiswa | Login | `POST /api/auth/login` | `User` | Layak masuk | Awal alur akses sistem |
| Melihat dashboard progress | Dashboard Mahasiswa | `GET /api/auth/me`, `GET /api/bimbingan`, `GET /api/bimbingan/sempro-status/:mahasiswaId` | `User`, `Bimbingan` | Layak masuk | Menampilkan progress TA, dospem, total bimbingan, dan status kesiapan |
| Memilih dosen pembimbing tujuan | Bimbingan Mahasiswa | `GET /api/bimbingan`, `POST /api/bimbingan` | `User`, `Bimbingan` | Layak masuk | Mahasiswa memilih Dospem 1 atau Dospem 2 |
| Upload dokumen bimbingan | Bimbingan Mahasiswa | `POST /api/bimbingan` | `Bimbingan` | Layak masuk | Upload file PDF sebagai inti proses bimbingan |
| Melihat riwayat bimbingan | Bimbingan Mahasiswa | `GET /api/bimbingan` | `Bimbingan` | Layak masuk | Riwayat dipisahkan berdasarkan dosen pembimbing |
| Melihat feedback/status dosen | Bimbingan Mahasiswa | `GET /api/bimbingan`, `GET /api/bimbingan/:id` | `Bimbingan`, `Reply` | Layak masuk | Mahasiswa mengetahui hasil review: menunggu, revisi, ACC, dan status lain |
| Membalas feedback | Bimbingan Mahasiswa | `POST /api/bimbingan/:id/reply` | `Reply` | Layak masuk | Mendukung komunikasi setelah feedback |
| Download file bimbingan/feedback | Bimbingan Mahasiswa | `GET /api/bimbingan/download/:id` | `Bimbingan` | Layak masuk sebagai pendukung | Relevan untuk melihat dokumen hasil bimbingan |
| Generate surat persetujuan sempro | Dashboard Mahasiswa | `GET /api/bimbingan/generate-surat-sempro/:mahasiswaId` | `User`, `Bimbingan` | Layak masuk jika membahas kelayakan sempro | Format dokumen adalah DOCX |

### 2. Fitur Utama Dosen

| Fitur | Halaman/UI | Backend Terkait | Model | Status Bab 4 | Catatan |
|---|---|---|---|---|---|
| Login dosen | Login | `POST /api/auth/login` | `User` | Layak masuk | Awal alur dosen |
| Melihat dashboard dosen | Dashboard Dosen | `GET /api/users/mahasiswa-bimbingan` | `User`, `Bimbingan` | Layak masuk | Ringkasan mahasiswa bimbingan dan status review |
| Melihat daftar mahasiswa bimbingan | Dashboard/List Mahasiswa Bimbingan | `GET /api/users/mahasiswa-bimbingan`, `GET /api/bimbingan` | `User`, `Bimbingan` | Layak masuk | Dosen melihat mahasiswa yang menjadi bimbingannya |
| Membuka detail/riwayat bimbingan mahasiswa | Review Bimbingan Dosen | `GET /api/bimbingan?mahasiswaId=...` | `Bimbingan` | Layak masuk | Dosen melihat riwayat bimbingan mahasiswa |
| Download dokumen bimbingan | Review Bimbingan Dosen | `GET /api/bimbingan/download/:id` | `Bimbingan` | Layak masuk | Dosen membaca dokumen mahasiswa |
| Memberi feedback/status | Review Bimbingan Dosen | `PUT /api/bimbingan/:id/feedback` | `Bimbingan` | Layak masuk | Inti proses review dosen |
| Upload file feedback | Review Bimbingan Dosen | `PUT /api/bimbingan/:id/feedback` | `Bimbingan` | Layak masuk jika digunakan di demo | File feedback PDF bersifat opsional |
| Melihat status bimbingan mahasiswa | Dashboard/Review Dosen | `GET /api/users/mahasiswa-bimbingan`, `GET /api/bimbingan` | `User`, `Bimbingan` | Layak masuk | Fokus pada status bimbingan, bukan detail teknis |
| Melihat kelayakan sempro/sidang | Backend tersedia, UI dosen tidak sekuat mahasiswa | `GET /api/bimbingan/sempro-status/:mahasiswaId` | `Bimbingan` | Sebagian ada | Lebih aman ditulis sebagai informasi status bimbingan/kelayakan jika ditampilkan |

### 3. Fitur Utama Admin

| Fitur | Halaman/UI | Backend Terkait | Model | Status Bab 4 | Catatan |
|---|---|---|---|---|---|
| Login admin | Login | `POST /api/auth/login` | `User` | Layak masuk | Awal alur admin |
| Mengelola data mahasiswa | Manajemen User | `GET /api/users`, `POST /api/users`, `PUT /api/users/:id`, `DELETE /api/users/:id` | `User` | Layak masuk | Data dasar untuk proses bimbingan |
| Mengelola data dosen | Manajemen User | `GET /api/users`, `POST /api/users`, `PUT /api/users/:id` | `User` | Layak masuk | Data dosen dibutuhkan untuk assign pembimbing |
| Assign dosen pembimbing 1 dan 2 | Manajemen User/Edit User | `PUT /api/users/:id/assign-dospem` | `User` | Layak masuk | Fitur admin paling relevan dengan bimbingan |
| Melihat data/progress bimbingan umum | Dashboard/Admin detail mahasiswa | `GET /api/users/mahasiswa-bimbingan`, `GET /api/bimbingan`, `GET /api/bimbingan/admin/mahasiswa/:mahasiswaId` | `User`, `Bimbingan` | Layak masuk sebagai monitoring | Admin memantau proses, bukan aktor utama bimbingan |
| Kelola jadwal sempro/sidang | Kelola Jadwal | `GET /api/jadwal`, `POST /api/jadwal`, `PUT /api/jadwal/:id`, `DELETE /api/jadwal/:id` | `Jadwal` | Masuk jika Bab 4 mencakup tahap setelah bimbingan | Jangan jadikan inti jika fokus hanya bimbingan |

---

## B. Fitur Pendukung atau Internal yang Tidak Perlu Ditonjolkan

Fitur berikut ada di kode atau tampilan, tetapi sebaiknya tidak dijadikan fitur utama Bab 4 karena sifatnya pendukung, teknis, internal, atau belum menjadi alur utama penelitian.

| Fitur | Alasan Tidak Ditonjolkan |
|---|---|
| Reset progress mahasiswa | Lebih cocok sebagai fitur admin/debug data, bukan alur utama bimbingan |
| Reset password user | Fitur administratif pendukung, tidak langsung mempengaruhi proses bimbingan |
| Upload avatar | Fitur personalisasi, bukan bagian inti manajemen bimbingan |
| Change password | Fitur keamanan akun, bukan inti penelitian |
| Profil user | Cukup disebut pendukung jika perlu, tidak perlu jadi subbab utama |
| Refresh token | Detail teknis autentikasi, cukup disebut pada aspek keamanan/JWT |
| Laporan admin yang belum benar-benar digunakan | Jangan ditonjolkan jika tidak menjadi flow utama demo |
| Scheduler/reminder sidang | Belum jelas berjalan sebagai job otomatis |
| Export PDF jadwal | Jangan ditulis sebagai fitur utama jika belum ada endpoint backend yang kuat |
| Hapus permanen user/jadwal | Fitur maintenance admin, bukan alur utama penelitian |
| Health check API | Fitur teknis deployment |
| Wireframe pages | Untuk dokumentasi, bukan fitur aplikasi operasional |
| Plain password/demo password | Jangan ditulis sebagai fitur sistem produksi |

---

## C. Rekomendasi Kebutuhan Fungsional Per Role

Bagian kebutuhan fungsional di Bab 4 sebaiknya ringkas, akademik, dan langsung mengikuti alur pengguna.

### 1. Kebutuhan Fungsional Mahasiswa

Mahasiswa dapat:

1. Melakukan login ke sistem.
2. Melihat dashboard progress tugas akhir.
3. Melihat informasi dosen pembimbing 1 dan dosen pembimbing 2.
4. Memilih dosen pembimbing tujuan saat mengirim bimbingan.
5. Mengunggah dokumen bimbingan dalam format PDF.
6. Melihat riwayat bimbingan berdasarkan dosen pembimbing.
7. Melihat status dan feedback dari dosen pembimbing.
8. Membalas feedback bimbingan.
9. Mengunduh dokumen bimbingan atau feedback jika tersedia.
10. Menghasilkan surat persetujuan sempro apabila syarat bimbingan terpenuhi.

### 2. Kebutuhan Fungsional Dosen

Dosen dapat:

1. Melakukan login ke sistem.
2. Melihat daftar mahasiswa bimbingan.
3. Melihat status bimbingan mahasiswa.
4. Membuka riwayat dan detail bimbingan mahasiswa.
5. Mengunduh dokumen bimbingan mahasiswa.
6. Memberikan feedback terhadap dokumen bimbingan.
7. Menentukan status bimbingan, seperti revisi, ACC, lanjut bab, atau ACC sempro.
8. Mengunggah file feedback apabila diperlukan.

### 3. Kebutuhan Fungsional Admin

Admin dapat:

1. Melakukan login ke sistem.
2. Mengelola data mahasiswa.
3. Mengelola data dosen pembimbing.
4. Mengatur dosen pembimbing 1 dan dosen pembimbing 2 untuk mahasiswa.
5. Melihat data bimbingan mahasiswa secara umum.
6. Mengelola jadwal sempro atau sidang apabila fitur jadwal dimasukkan dalam ruang lingkup Bab 4.

---

## D. Rekomendasi Flowchart

Jumlah flowchart sebaiknya tidak terlalu banyak. Untuk Bab 4, cukup 6 sampai 7 flowchart utama berikut.

| No | Flowchart | Alasan |
|---|---|---|
| 1 | Flowchart Login dan Hak Akses Role | Menjelaskan awal akses sistem dan pemisahan role |
| 2 | Flowchart Upload Bimbingan Mahasiswa | Menjelaskan inti alur mahasiswa mengirim dokumen |
| 3 | Flowchart Review Bimbingan Dosen | Menjelaskan alur dosen membuka dokumen dan memberi feedback |
| 4 | Flowchart Riwayat dan Reply Feedback | Menjelaskan interaksi lanjutan mahasiswa setelah menerima feedback |
| 5 | Flowchart Admin Mengelola User dan Assign Dospem | Menjelaskan peran admin sebagai pengelola data dasar |
| 6 | Flowchart Generate Surat Persetujuan Sempro | Menjelaskan syarat minimal bimbingan dan ACC |
| 7 | Flowchart Kelola Jadwal Sempro/Sidang | Opsional, hanya jika jadwal dimasukkan sebagai fitur utama |

Rekomendasi paling aman:

- Jika Bab 4 ingin fokus ketat pada bimbingan, gunakan flowchart 1 sampai 6.
- Jika jadwal sidang ingin ikut dibahas, tambahkan flowchart ke-7.

---

## E. Rekomendasi Desain UI yang Dilampirkan

Tampilan UI yang dilampirkan sebaiknya hanya halaman utama yang mendukung flow bimbingan. Maksimal 8 sampai 9 halaman.

| No | Halaman UI | Role | Alasan Dilampirkan |
|---|---|---|---|
| 1 | Login | Semua role | Awal akses sistem |
| 2 | Dashboard Mahasiswa | Mahasiswa | Menampilkan progress, dospem, status bimbingan |
| 3 | Halaman Bimbingan Mahasiswa | Mahasiswa | Upload dokumen, riwayat, feedback, reply |
| 4 | Dashboard Dosen | Dosen | Ringkasan mahasiswa bimbingan |
| 5 | Halaman Review Bimbingan Dosen | Dosen | Download dokumen dan pemberian feedback |
| 6 | Manajemen User Admin | Admin | Admin mengelola mahasiswa dan dosen |
| 7 | Form/Edit Assign Dospem | Admin | Menghubungkan mahasiswa dengan dosen pembimbing |
| 8 | Jadwal Sempro/Sidang | Admin/Mahasiswa/Dosen | Dilampirkan jika jadwal masuk ruang lingkup |
| 9 | Generate Surat Persetujuan Sempro | Mahasiswa/Admin | Dilampirkan jika fitur surat sempro dibahas |

Jika ingin lebih ringkas, UI yang wajib minimal:

1. Login.
2. Dashboard Mahasiswa.
3. Bimbingan Mahasiswa.
4. Dashboard Dosen.
5. Review Bimbingan Dosen.
6. Manajemen User Admin.
7. Assign Dospem Admin.

---

## F. Struktur Database atau Collection

Struktur database yang perlu dijelaskan cukup empat collection utama. Tidak perlu menjelaskan field teknis terlalu detail.

### 1. Collection `users`

Digunakan untuk menyimpan data akun pengguna.

Data penting:

- NIM/NIP.
- Nama.
- Email.
- Role.
- Program studi.
- Semester.
- Judul tugas akhir.
- Progress tugas akhir.
- Dosen pembimbing 1.
- Dosen pembimbing 2.
- Status akun.

Relasi penting:

- Mahasiswa memiliki relasi ke dosen pembimbing 1 dan dosen pembimbing 2.

### 2. Collection `bimbingans`

Digunakan untuk menyimpan data pengajuan bimbingan.

Data penting:

- Mahasiswa.
- Dosen pembimbing tujuan.
- Jenis dosen pembimbing: dospem 1 atau dospem 2.
- Versi bimbingan.
- Judul bimbingan.
- Catatan mahasiswa.
- File dokumen bimbingan.
- Status bimbingan.
- Feedback dosen.
- File feedback dosen jika ada.

Relasi penting:

- Satu bimbingan terhubung ke satu mahasiswa dan satu dosen pembimbing.

### 3. Collection `replies`

Digunakan untuk menyimpan balasan atau diskusi pada bimbingan.

Data penting:

- Bimbingan terkait.
- Pengirim.
- Role pengirim.
- Isi pesan.
- Waktu pengiriman.

Relasi penting:

- Reply terhubung ke satu data bimbingan.

### 4. Collection `jadwals`

Digunakan untuk menyimpan jadwal sempro atau sidang.

Data penting:

- Mahasiswa.
- Jenis jadwal.
- Tanggal.
- Waktu mulai.
- Waktu selesai.
- Ruangan.
- Penguji.
- Status jadwal.
- Hasil jika sudah selesai.

Catatan:

- Collection ini dijelaskan jika fitur jadwal sempro/sidang dimasukkan ke Bab 4.

---

## G. Catatan Konsistensi Istilah

Bagian ini penting agar Bab 4 tidak terlihat campur aduk antara istilah sistem, UI, dan backend.

### 1. Sempro atau Sidang

Di kode masih ditemukan istilah sempro, misalnya:

- `sempro-status`
- `generate-surat-sempro`
- `acc_sempro`

Namun UI dan kebutuhan pengguna mulai mengarah ke istilah sidang.

Rekomendasi penulisan:

- Jika yang dimaksud adalah seminar proposal, gunakan istilah "Sempro" secara konsisten.
- Jika yang dimaksud adalah sidang akhir, gunakan istilah "Sidang" secara konsisten.
- Jika sistem mendukung keduanya, tulis:
  - "Sempro/Sidang" hanya pada bagian umum.
  - Gunakan istilah spesifik pada fitur tertentu, misalnya "Surat Persetujuan Sempro".

Untuk fitur generate surat, istilah yang paling aman:

> Generate Surat Persetujuan Sempro

Karena endpoint dan dokumen backend masih menggunakan istilah sempro.

### 2. Feedback, Revisi, dan ACC

Rekomendasi istilah:

- Feedback: komentar atau arahan dari dosen.
- Revisi: status ketika dokumen perlu diperbaiki mahasiswa.
- ACC: status ketika dosen menyetujui bimbingan.
- Lanjut Bab: status ketika mahasiswa diperbolehkan melanjutkan ke bab berikutnya.
- ACC Sempro: status ketika dosen menyetujui mahasiswa untuk maju sempro.

Jangan mencampur:

- "feedback" sebagai status.
- "revisi" sebagai catatan.

Gunakan pola:

> Dosen memberikan feedback dan menentukan status bimbingan.

### 3. Generate Surat DOCX

Fitur surat persetujuan sempro menghasilkan dokumen DOCX, bukan PDF.

Rekomendasi penulisan:

> Sistem menyediakan fitur generate surat persetujuan sempro dalam format DOCX apabila mahasiswa telah memenuhi syarat bimbingan.

Hindari menulis:

> Sistem mencetak PDF surat sempro.

Kecuali memang sudah ada endpoint PDF yang jelas.

### 4. Jadwal Sempro/Sidang

Fitur jadwal dapat dibahas sebagai fitur pendukung setelah proses bimbingan.

Rekomendasi:

- Jika Bab 4 fokus pada bimbingan, jadwal cukup dijelaskan singkat.
- Jika Bab 4 mencakup proses tugas akhir sampai sidang, jadwal dapat dimasukkan sebagai fitur utama tambahan.
- Jangan memasukkan export PDF jadwal sebagai fitur utama jika endpoint backend belum kuat.

### 5. Notifikasi Email dan WhatsApp

Notifikasi sebaiknya ditulis sebagai fitur pendukung.

Rekomendasi penulisan:

> Sistem mendukung pengiriman notifikasi email/WhatsApp berdasarkan konfigurasi provider pada backend.

Jangan menulis:

> Sistem pasti mengirim WhatsApp dan email pada setiap proses.

Karena pengiriman bergantung pada konfigurasi environment dan provider.

---

## Kesimpulan

Untuk Bab 4, fitur SIMTA yang paling layak ditonjolkan adalah alur bimbingan tugas akhir:

1. Mahasiswa mengirim dokumen bimbingan.
2. Dosen membuka dan mereview dokumen.
3. Dosen memberikan feedback dan status.
4. Mahasiswa melihat hasil review dan membalas feedback.
5. Admin mengelola data mahasiswa, dosen, dan dosen pembimbing.

Fitur jadwal sempro/sidang dan generate surat persetujuan sempro dapat dimasukkan sebagai fitur pendukung yang memperkuat proses tugas akhir, tetapi jangan sampai menggeser fokus utama penelitian, yaitu optimalisasi proses bimbingan.

Fitur teknis seperti refresh token, reset password, upload avatar, change password, scheduler, dan export PDF jadwal tidak perlu ditonjolkan sebagai fitur utama Bab 4.
