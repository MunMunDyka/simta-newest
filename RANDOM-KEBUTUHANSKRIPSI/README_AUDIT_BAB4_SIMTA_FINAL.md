# README Audit Bab 4 SIMTA

Tanggal audit: 4 Juni 2026  
Tujuan dokumen: pegangan ringkas untuk menjelaskan fitur SIMTA yang layak masuk Bab 4 skripsi kepada AI lain atau saat menyusun naskah.

## Konteks Penelitian

Judul penelitian:

> Pengembangan Sistem Manajemen Tugas Akhir Terintegrasi Berbasis Web untuk Optimalisasi Proses Bimbingan

Fokus Bab 4:

- Alur bimbingan tugas akhir antara Mahasiswa dan Dosen.
- Admin sebagai pengelola data dasar, terutama data user dan plotting dosen pembimbing.
- Fitur yang ditonjolkan adalah fitur yang terlihat di alur pengguna, bukan semua endpoint teknis backend.

Flow utama yang paling aman untuk Bab 4:

> Mahasiswa upload bimbingan -> Dosen review dan memberi feedback -> Mahasiswa melihat/membalas feedback -> Admin mengelola user dan assign dospem.

---

## Ringkasan Kesimpulan

Fitur paling kuat dan layak dijadikan inti Bab 4 adalah:

1. Login dan dashboard berdasarkan role.
2. Dashboard Mahasiswa.
3. Upload dokumen bimbingan oleh Mahasiswa.
4. Pemilihan Dospem 1 atau Dospem 2 saat upload.
5. Riwayat bimbingan Mahasiswa.
6. Feedback/status dari Dosen.
7. Review bimbingan oleh Dosen.
8. Download dokumen bimbingan oleh Dosen.
9. Dashboard Dosen.
10. Admin kelola data Mahasiswa dan Dosen.
11. Admin assign Dospem 1 dan Dospem 2.

Fitur yang boleh masuk sebagai pendukung:

- Reply/diskusi komentar.
- Upload file feedback oleh Dosen.
- Jadwal sidang.
- Generate surat persetujuan sempro.
- Notifikasi email/WhatsApp.

Fitur yang jangan ditonjolkan:

- Reset password.
- Reset progress.
- Upload avatar.
- Change password.
- Refresh token.
- Health check API.
- Wireframe pages.
- Hard delete.
- Scheduler/reminder yang belum jelas berjalan.
- Export PDF jadwal jika endpoint backend belum kuat.
- Detail provider email seperti SMTP/Gmail API/Resend.

---

## Tabel Audit Fitur Bab 4

| No | Nama Fitur | Ada UI Frontend? | Ada Endpoint Backend? | Ada Model/Database? | Dipakai Flow Utama Bab 4? | Rekomendasi Penulisan Bab 4 | Catatan |
|---|---|---|---|---|---|---|---|
| 1 | Login dan role-based dashboard | Ya | Ya | Ya | Ya | Fitur utama | Login mengarahkan user ke dashboard sesuai role |
| 2 | Dashboard Mahasiswa | Ya | Ya | Ya | Ya | Fitur utama | Menampilkan progress, dospem, status bimbingan, total bimbingan |
| 3 | Upload dokumen bimbingan Mahasiswa | Ya | Ya | Ya | Ya | Fitur utama | Inti proses bimbingan tugas akhir |
| 4 | Pemilihan Dospem 1 / Dospem 2 saat upload | Ya | Ya | Ya | Ya | Fitur utama | Mahasiswa memilih tujuan bimbingan melalui tab dospem |
| 5 | Riwayat bimbingan Mahasiswa | Ya | Ya | Ya | Ya | Fitur utama | Riwayat ditampilkan per dosen pembimbing |
| 6 | Feedback/status dari Dosen | Ya | Ya | Ya | Ya | Fitur utama | Status meliputi menunggu, revisi, ACC, lanjut bab, ACC sempro |
| 7 | Reply/diskusi komentar Mahasiswa-Dosen | Sebagian | Ya | Ya | Ya | Fitur pendukung | UI mahasiswa jelas, backend mendukung dosen, UI reply dosen belum kuat |
| 8 | Dashboard Dosen | Ya | Ya | Ya | Ya | Fitur utama | Menampilkan mahasiswa bimbingan dan status review |
| 9 | Review bimbingan oleh Dosen | Ya | Ya | Ya | Ya | Fitur utama | Dosen membuka detail bimbingan dan memberi feedback |
| 10 | Download dokumen bimbingan oleh Dosen | Ya | Ya | Ya | Ya | Fitur utama | Bagian dari proses review dosen |
| 11 | Upload file feedback oleh Dosen | Ya | Ya | Ya | Opsional | Fitur pendukung | Ada lampiran feedback PDF, tetapi tidak wajib dalam flow |
| 12 | Admin kelola data user | Ya | Ya | Ya | Ya | Fitur utama | Admin mengelola data mahasiswa dan dosen |
| 13 | Admin plotting/assign Dospem | Ya | Ya | Ya | Ya | Fitur utama | Fitur admin paling relevan dengan alur bimbingan |
| 14 | Admin kelola jadwal sidang | Ya | Ya | Ya | Opsional | Fitur pendukung | Masuk jika Bab 4 mencakup tahap sidang |
| 15 | Mahasiswa/Dosen lihat jadwal sidang | Ya | Ya | Ya | Opsional | Fitur pendukung | Relevan setelah proses bimbingan, bukan inti utama |
| 16 | Generate surat persetujuan sempro | Ya | Ya | Ya | Opsional | Fitur pendukung | Format dokumen adalah DOCX, bukan PDF |
| 17 | Notifikasi email/WhatsApp | Sebagian | Sebagian | Sebagian | Opsional | Fitur pendukung | Service backend ada, tergantung konfigurasi environment |

---

## Rekomendasi Use Case Diagram

Use Case Diagram wajib memasukkan:

1. Login.
2. Melihat dashboard sesuai role.
3. Upload bimbingan.
4. Memilih dosen pembimbing tujuan.
5. Melihat riwayat bimbingan.
6. Melihat feedback/status bimbingan.
7. Membalas feedback.
8. Review bimbingan.
9. Download dokumen bimbingan.
10. Memberi feedback/status.
11. Mengelola data mahasiswa dan dosen.
12. Assign dosen pembimbing.

Use case opsional:

- Kelola jadwal sidang.
- Lihat jadwal sidang.
- Generate surat persetujuan sempro.
- Notifikasi email/WhatsApp.

Jangan masukkan sebagai use case utama:

- Refresh token.
- Reset password.
- Reset progress.
- Upload avatar.
- Health check.
- Hard delete.

---

## Rekomendasi Activity Diagram

Activity Diagram yang wajib dibuat:

1. Login dan redirect berdasarkan role.
2. Mahasiswa upload dokumen bimbingan.
3. Dosen review bimbingan dan memberi feedback/status.
4. Mahasiswa melihat feedback dan membalas komentar.
5. Admin mengelola user dan assign dospem.
6. Generate surat persetujuan sempro jika syarat terpenuhi.

Activity Diagram opsional:

7. Admin mengelola jadwal sidang.

---

## Rekomendasi Sequence Diagram

Sequence Diagram yang paling relevan:

1. Sequence login user.
2. Sequence upload bimbingan mahasiswa.
3. Sequence review dan feedback dosen.
4. Sequence reply feedback mahasiswa.
5. Sequence admin assign dospem.
6. Sequence generate surat persetujuan sempro.

Catatan:

- Notifikasi email/WhatsApp cukup dimasukkan sebagai bagian kecil pada sequence upload bimbingan atau feedback dosen.
- Tidak perlu membuat sequence khusus untuk refresh token, reset password, upload avatar, atau health check.

---

## Rekomendasi Screenshot UI Bab 4

UI/screenshot yang wajib dilampirkan:

1. Halaman Login.
2. Dashboard Mahasiswa.
3. Halaman Bimbingan Mahasiswa.
4. Dashboard Dosen.
5. Halaman Review Bimbingan Dosen.
6. Halaman Manajemen User Admin.
7. Halaman Assign Dospem Admin.

UI/screenshot opsional:

8. Halaman Jadwal Sidang.
9. Tombol/area Generate Surat Persetujuan Sempro.

Tidak perlu ditonjolkan:

- Profile.
- Upload avatar.
- Reset password.
- Reset progress.
- Wireframe pages.
- Halaman teknis/internal.

---

## Fitur yang Cukup Disebut di Kebutuhan Fungsional

Fitur berikut cukup disebut di kebutuhan fungsional atau bagian pendukung, tidak perlu dijadikan subbab besar:

1. Upload file feedback oleh dosen.
2. Download dokumen bimbingan.
3. Lihat jadwal sidang.
4. Generate surat persetujuan sempro.
5. Notifikasi email/WhatsApp.
6. Melihat status kelayakan sempro/sidang.
7. Update email/WhatsApp user untuk kebutuhan notifikasi.

---

## Fitur yang Sebaiknya Tidak Dimasukkan

Fitur berikut terlalu teknis, internal, atau tidak berpengaruh langsung pada flow utama Bab 4:

1. Reset password.
2. Reset progress.
3. Upload avatar.
4. Change password.
5. Refresh token.
6. Health check API.
7. Wireframe pages.
8. Hard delete user/jadwal.
9. Scheduler/reminder yang belum jelas berjalan.
10. Export PDF jadwal jika belum ada endpoint backend yang kuat.
11. Detail teknis provider email seperti SMTP, Gmail API, atau Resend.
12. Plain password/demo password.

---

## Catatan Istilah untuk Bab 4

### Sempro atau Sidang

Kode backend masih memakai istilah sempro pada beberapa bagian:

- `sempro-status`
- `generate-surat-sempro`
- `acc_sempro`

Rekomendasi:

- Gunakan "Sempro" untuk fitur surat persetujuan sempro.
- Gunakan "Sidang" untuk jadwal sidang.
- Jangan mencampur "ACC Maju Sempro" dan "ACC Maju Sidang" dalam satu konteks yang sama.

### Feedback, Revisi, dan ACC

Gunakan pola kalimat:

> Dosen memberikan feedback dan menentukan status bimbingan.

Arti istilah:

- Feedback: catatan/masukan dari dosen.
- Revisi: dokumen perlu diperbaiki.
- ACC: dokumen disetujui.
- Lanjut Bab: mahasiswa dapat lanjut ke bab berikutnya.
- ACC Sempro: mahasiswa disetujui untuk maju sempro.

### Generate Surat

Fitur generate surat menghasilkan DOCX, bukan PDF.

Kalimat yang aman:

> Sistem menyediakan fitur generate surat persetujuan sempro dalam format DOCX apabila mahasiswa telah memenuhi syarat bimbingan.

### Notifikasi

Notifikasi email/WhatsApp adalah fitur pendukung dan bergantung konfigurasi environment.

Kalimat yang aman:

> Sistem mendukung pengiriman notifikasi email/WhatsApp berdasarkan konfigurasi backend.

Jangan menulis bahwa notifikasi pasti selalu terkirim.

---

## Struktur Database yang Perlu Dijelaskan

Database yang perlu dijelaskan cukup empat collection utama:

### 1. `users`

Menyimpan data akun Mahasiswa, Dosen, dan Admin.

Field penting:

- NIM/NIP.
- Nama.
- Email.
- Role.
- Program studi.
- Semester.
- Judul tugas akhir.
- Progress tugas akhir.
- Dospem 1.
- Dospem 2.
- Status akun.

### 2. `bimbingans`

Menyimpan data pengajuan bimbingan.

Field penting:

- Mahasiswa.
- Dosen tujuan.
- Tipe dosen pembimbing: dospem 1 atau dospem 2.
- Versi bimbingan.
- Judul.
- Catatan mahasiswa.
- File dokumen.
- Status bimbingan.
- Feedback dosen.
- File feedback dosen jika ada.

### 3. `replies`

Menyimpan komentar atau balasan pada bimbingan.

Field penting:

- Bimbingan terkait.
- Pengirim.
- Role pengirim.
- Isi pesan.
- Waktu pesan.

### 4. `jadwals`

Menyimpan jadwal sempro/sidang.

Field penting:

- Mahasiswa.
- Jenis jadwal.
- Tanggal.
- Waktu.
- Ruangan.
- Penguji.
- Status jadwal.
- Hasil sidang jika sudah selesai.

---

## Narasi Final yang Bisa Dipakai

SIMTA berfokus pada optimalisasi proses bimbingan tugas akhir dengan menyediakan alur terintegrasi antara Mahasiswa, Dosen Pembimbing, dan Admin. Mahasiswa dapat mengunggah dokumen bimbingan kepada Dospem 1 atau Dospem 2, melihat riwayat bimbingan, menerima feedback, serta membalas komentar. Dosen dapat melihat mahasiswa bimbingan, mengunduh dokumen, memberikan feedback, serta menentukan status bimbingan. Admin berperan mengelola data mahasiswa dan dosen serta melakukan plotting dosen pembimbing.

Fitur jadwal sidang, generate surat persetujuan sempro, dan notifikasi email/WhatsApp dapat dijelaskan sebagai fitur pendukung karena membantu kelanjutan proses tugas akhir, tetapi bukan inti utama dari flow bimbingan.
