# Alur Review/Feedback Bimbingan Dosen - Bab 4 SIMTA

Dokumen ini merangkum alur fitur Review/Feedback Bimbingan Dosen berdasarkan kode frontend dan backend SIMTA saat ini. Fokusnya adalah logika sistem yang layak dijadikan tambahan flowchart Bab 4, bukan fitur internal/testing.

## Sumber Kode Yang Dicek

- Frontend halaman daftar mahasiswa bimbingan: `frontend/src/pages/Bimbingan/Dosen/ListMahasiswaBimbingan.tsx`
- Frontend halaman review bimbingan: `frontend/src/pages/Bimbingan/Dosen/BimbinganDosen.tsx`
- Frontend service bimbingan: `frontend/src/services/bimbinganService.ts`
- Backend route bimbingan: `backend/router/bimbinganRoutes.js`
- Backend controller bimbingan: `backend/controller/bimbinganController.js`
- Backend model bimbingan: `backend/models/Bimbingan.js`
- Backend validasi request: `backend/middleware/validationMiddleware.js`
- Backend notifikasi: `backend/services/emailService.js` dan `backend/services/whatsappService.js`

## 1. Ringkasan Alur Proses

Fitur Review/Feedback Bimbingan Dosen dimulai ketika dosen membuka daftar mahasiswa bimbingan. Sistem mengambil data bimbingan yang ditujukan kepada dosen tersebut, lalu menampilkan mahasiswa yang memiliki riwayat bimbingan. Dosen memilih salah satu mahasiswa untuk membuka halaman detail review.

Pada halaman review, sistem mengambil seluruh riwayat bimbingan mahasiswa tersebut untuk dosen yang sedang login. Data terbaru dijadikan bimbingan aktif yang akan direview. Dosen dapat melihat identitas mahasiswa, judul tugas akhir, progress, detail dokumen yang dikirim, catatan mahasiswa, dan riwayat bimbingan sebelumnya.

Jika status bimbingan terbaru masih `menunggu`, frontend menampilkan form feedback. Dosen memilih status hasil review, menulis feedback, dan dapat mengunggah lampiran file feedback dalam format PDF. Jika status bimbingan sudah bukan `menunggu`, form feedback tidak ditampilkan dan sistem menampilkan keterangan bahwa bimbingan sudah direview.

Ketika dosen mengirim feedback, frontend melakukan validasi awal. Setelah lolos validasi, data dikirim ke backend melalui endpoint feedback. Backend memvalidasi token, role dosen, ID bimbingan, hak akses dosen, status bimbingan, status feedback, isi feedback, dan syarat minimal bimbingan jika status yang dipilih adalah `acc_sempro`.

Jika validasi berhasil, backend menyimpan status baru, feedback, tanggal feedback, dan file feedback jika ada. Jika status adalah `lanjut_bab`, sistem menaikkan `currentProgress` mahasiswa ke BAB berikutnya. Setelah itu sistem memicu notifikasi WhatsApp dan email kepada mahasiswa jika kontak tersedia dan konfigurasi notifikasi aktif. Notifikasi bersifat non-blocking, sehingga kegagalan email/WhatsApp tidak menggagalkan proses feedback utama.

## 2. Urutan Langkah Flowchart

1. Dosen login ke sistem.
2. Dosen membuka menu Mahasiswa Bimbingan.
3. Sistem mengambil daftar bimbingan berdasarkan dosen yang login.
4. Dosen memilih mahasiswa yang akan direview.
5. Sistem mengambil detail dan riwayat bimbingan mahasiswa tersebut.
6. Sistem menentukan bimbingan terbaru sebagai data review aktif.
7. Dosen melihat dokumen, catatan mahasiswa, dan riwayat bimbingan.
8. Dosen dapat mengunduh dokumen bimbingan.
9. Sistem mengecek status bimbingan terbaru.
10. Jika status masih `menunggu`, sistem menampilkan form feedback.
11. Dosen memilih status review.
12. Dosen mengisi komentar/feedback.
13. Dosen dapat menambahkan file feedback PDF secara opsional.
14. Sistem melakukan validasi form di frontend.
15. Frontend mengirim data feedback ke backend.
16. Backend melakukan validasi autentikasi, role, akses, status, dan data input.
17. Backend menyimpan hasil feedback.
18. Jika status `lanjut_bab`, backend memperbarui progress mahasiswa.
19. Backend memicu notifikasi email/WhatsApp jika tersedia.
20. Sistem mengembalikan response sukses.
21. Frontend mengarahkan dosen kembali ke daftar mahasiswa bimbingan.
22. Selesai.

## 3. Percabangan Validasi Flowchart

| Percabangan | Kondisi Ya | Kondisi Tidak |
|---|---|---|
| Data bimbingan ditemukan? | Lanjut tampilkan detail bimbingan | Tampilkan pesan bimbingan tidak ditemukan |
| Dosen berhak mereview? | Lanjut ke pengecekan status | Tampilkan pesan akses ditolak |
| Status bimbingan masih `menunggu`? | Tampilkan form feedback | Tampilkan status sudah direview |
| Status feedback dipilih? | Lanjut validasi feedback | Tampilkan error status wajib dipilih |
| Status termasuk enum valid? | Lanjut validasi feedback | Tampilkan error status tidak valid |
| Feedback diisi? | Lanjut validasi panjang feedback | Tampilkan error feedback wajib diisi |
| Feedback 5 sampai 2000 karakter? | Lanjut validasi file | Tampilkan error panjang feedback |
| Ada file feedback? | Validasi tipe file PDF | Lewati validasi file |
| File feedback valid PDF? | Lanjut submit | Tampilkan error lampiran harus PDF |
| Status `acc_sempro` dipilih? | Cek minimal 5 kali bimbingan pada dospem terkait | Lewati pengecekan minimal bimbingan |
| Minimal 5 kali bimbingan terpenuhi? | Lanjut simpan feedback | Tampilkan error belum memenuhi syarat ACC Maju Sempro |
| Simpan feedback berhasil? | Kirim response sukses dan trigger notifikasi | Tampilkan error gagal menyimpan feedback |
| Notifikasi berhasil terkirim? | Catat sukses di log | Jika gagal, proses feedback tetap sukses dan error dicatat di log |

## 4. Status Yang Digunakan Sistem

| Status Kode | Label Sistem | Makna Dalam Flow |
|---|---|---|
| `menunggu` | Menunggu Review | Dokumen mahasiswa sudah dikirim dan menunggu feedback dosen |
| `revisi` | Revisi | Dosen meminta mahasiswa memperbaiki dokumen |
| `acc` | ACC | Dosen menyetujui dokumen bimbingan |
| `lanjut_bab` | Lanjut BAB | Dosen menyetujui mahasiswa untuk lanjut ke BAB berikutnya |
| `acc_sempro` | ACC Maju Sempro / Sidang | Dosen memberi persetujuan maju sempro/sidang setelah syarat minimal bimbingan terpenuhi |

Catatan istilah: di kode enum backend masih bernama `acc_sempro`. Di beberapa tampilan/teks notifikasi ada campuran istilah "Sempro" dan "Sidang". Untuk Bab 4, sebaiknya pilih satu istilah yang konsisten, misalnya "ACC Maju Sidang" jika revisi terbaru memang menggunakan istilah sidang.

## 5. Output Akhir Proses

Jika proses berhasil, output sistem adalah:

- Data bimbingan tersimpan dengan status baru.
- Field `feedback` terisi dengan komentar dosen.
- Field `feedbackDate` terisi waktu pemberian feedback.
- Field `feedbackFile` dan `feedbackFileName` terisi jika dosen mengunggah lampiran PDF.
- Jika status `lanjut_bab`, field `currentProgress` pada data mahasiswa dinaikkan ke BAB berikutnya.
- Jika mahasiswa memiliki email, sistem mencoba mengirim email notifikasi feedback.
- Jika mahasiswa memiliki nomor WhatsApp dan WhatsApp aktif, sistem mencoba mengirim WhatsApp notifikasi feedback.
- Frontend menampilkan proses berhasil dan mengarahkan dosen kembali ke daftar mahasiswa bimbingan.

Jika proses gagal, output sistem berupa pesan error sesuai sumber masalah, misalnya:

- Bimbingan tidak ditemukan.
- Dosen tidak memiliki akses ke bimbingan tersebut.
- Bimbingan sudah pernah direview.
- Status feedback tidak valid.
- Feedback kosong atau terlalu pendek/panjang.
- File lampiran bukan PDF.
- Syarat minimal bimbingan untuk `acc_sempro` belum terpenuhi.

## 6. Rancangan Flowchart Teks

```text
MULAI

Dosen login ke SIMTA

Dosen membuka menu Mahasiswa Bimbingan

Sistem mengambil daftar mahasiswa bimbingan milik dosen

Dosen memilih salah satu mahasiswa

Sistem mengambil detail bimbingan dan riwayat bimbingan mahasiswa

[Decision] Data bimbingan ditemukan?
    Tidak:
        Sistem menampilkan pesan "Bimbingan tidak ditemukan"
        SELESAI
    Ya:
        Sistem menampilkan detail mahasiswa, dokumen, catatan, dan riwayat bimbingan

Dosen dapat menekan tombol Download File

[Decision] File dokumen tersedia di server?
    Tidak:
        Sistem menampilkan pesan "File tidak ditemukan"
        Kembali ke halaman review
    Ya:
        Sistem mengunduh file bimbingan
        Kembali ke halaman review

[Decision] Status bimbingan terbaru = menunggu?
    Tidak:
        Sistem menampilkan informasi "Sudah Direview"
        SELESAI
    Ya:
        Sistem menampilkan form feedback

Dosen memilih status review
Dosen mengisi komentar/feedback
Dosen mengunggah file feedback PDF jika diperlukan
Dosen menekan tombol Kirim Feedback

Sistem validasi form di frontend

[Decision] Status dan feedback valid?
    Tidak:
        Sistem menampilkan pesan validasi pada field terkait
        Kembali ke form feedback
    Ya:
        Frontend mengirim data feedback ke backend

Backend memvalidasi token dan role dosen

[Decision] User adalah dosen?
    Tidak:
        Sistem menolak akses
        SELESAI
    Ya:
        Backend mencari data bimbingan

[Decision] Dosen adalah pembimbing pada bimbingan tersebut?
    Tidak:
        Sistem menampilkan pesan akses ditolak
        SELESAI
    Ya:
        Backend mengecek status bimbingan

[Decision] Status bimbingan masih menunggu?
    Tidak:
        Sistem menampilkan pesan bahwa bimbingan sudah direview
        SELESAI
    Ya:
        Backend memvalidasi data feedback

[Decision] Status yang dipilih adalah acc_sempro?
    Tidak:
        Lanjut simpan feedback
    Ya:
        Backend mengecek jumlah bimbingan pada dospem terkait

        [Decision] Minimal 5 kali bimbingan terpenuhi?
            Tidak:
                Sistem menampilkan pesan syarat belum terpenuhi
                SELESAI
            Ya:
                Lanjut simpan feedback

Backend menyimpan status, feedback, tanggal feedback, dan file feedback jika ada

[Decision] Status = lanjut_bab?
    Ya:
        Backend memperbarui progress mahasiswa ke BAB berikutnya
    Tidak:
        Progress mahasiswa tidak diubah

Backend memicu notifikasi email/WhatsApp jika data kontak tersedia

[Decision] Notifikasi berhasil dikirim?
    Ya:
        Sistem mencatat notifikasi berhasil
    Tidak:
        Sistem mencatat kegagalan notifikasi, tetapi feedback tetap berhasil

Sistem mengembalikan pesan "Feedback berhasil diberikan"

Frontend mengarahkan dosen kembali ke daftar mahasiswa bimbingan

SELESAI
```

## 7. Catatan Untuk Penulisan Bab 4

- Fitur ini layak masuk sebagai flowchart terpisah karena merupakan proses inti antara dosen dan mahasiswa.
- Aktor utama pada flowchart adalah Dosen, Sistem, dan Mahasiswa sebagai penerima hasil feedback.
- Endpoint detail tidak perlu ditulis di flowchart, cukup dijelaskan bahwa sistem menyimpan feedback melalui API bimbingan.
- Upload file feedback dapat ditulis sebagai opsional karena form dan backend mendukung `feedbackFile`.
- Notifikasi email/WhatsApp dapat ditulis sebagai proses tambahan setelah feedback tersimpan, bukan syarat utama keberhasilan feedback.
- Status `lanjut_bab` perlu dijelaskan karena berdampak langsung pada progress mahasiswa.
- Status `acc_sempro` perlu dijelaskan sebagai persetujuan akhir dengan syarat minimal 5 kali bimbingan pada dosen pembimbing terkait.
- Hindari memasukkan fitur internal/testing seperti reset progress, reset password, refresh token, dan health check pada flowchart ini.

