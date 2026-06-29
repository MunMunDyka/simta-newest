# ASI Sistem yang Diusulkan SIMTA

## 1. Tujuan ASI Sistem yang Diusulkan

ASI (Aliran Sistem Informasi) sistem yang diusulkan menggambarkan aliran informasi, proses bisnis, dan dokumen digital yang mengalir di antara para aktor akademik setelah seluruh tata kelola proses bimbingan, pelaksanaan ujian (Seminar Proposal, Seminar Hasil, Sidang Akhir), manajemen revisi tim penguji, dan verifikasi berkas kelulusan/wisuda diintegrasikan secara terpusat melalui Sistem SIMTA. Dokumen ini berfungsi sebagai spesifikasi alur formal untuk memudahkan penyusunan diagram alir (flowmap) yang rapi pada aplikasi pemodelan seperti Draw.io.

## 2. Daftar Lane

| Lane | Peran |
| :--- | :--- |
| Mahasiswa | Melakukan login, mengunggah draf bimbingan PDF (Bab 1–3, naskah TA Bab 1–6, atau dokumen tugas akhir sesuai tahap akademik), melihat feedback, mengunduh surat persetujuan Seminar Proposal (ACC), melihat jadwal, mengunggah draf revisi pascasidang ke penguji, serta mengunggah berkas persyaratan kelulusan/wisuda. |
| Dosen Pembimbing | Melakukan login, memantau daftar mahasiswa bimbingan aktif, menelaah dokumen bimbingan PDF mahasiswa, memberikan catatan ulasan (feedback), serta menetapkan status bimbingan (revisi, lanjut bab, atau ACC). |
| Sistem SIMTA | Melakukan validasi autentikasi, memvalidasi aturan bisnis (seperti antrean bimbingan pending dan minimal kuota bimbingan), melakukan penomoran versi dokumen otomatis (V1, V2, dst.), mengirim notifikasi email sistem, mengunci/membuka akses bimbingan sesuai status akademik, menyinkronkan data dosen penguji ke data mahasiswa, dan meng-generate berkas persetujuan (.docx). |
| Koordinator Tugas Akhir | Melakukan login sebagai Administrator, mengelola data master pengguna, melakukan plotting Dosen Pembimbing 1 & 2, menyusun jadwal sidang melalui sistem berdasarkan kelayakan mahasiswa (tanggal, waktu, ruangan, dan penguji), menginput nilai dan status hasil sidang, serta memverifikasi berkas kelulusan/wisuda mahasiswa. |
| Dosen Penguji | Melakukan login, melihat daftar jadwal menguji, menguji jalannya sidang, memberikan ulasan revisi pascasidang, memeriksa dokumen perbaikan (revisi) mahasiswa, dan memberikan status persetujuan revisi (ACC Penguji). |

## 3. Dokumen/Data yang Mengalir

Berikut adalah dokumen dan data utama yang mengalir dalam rancangan ASI sistem yang diusulkan:

*   **Dokumen bimbingan PDF**: Berkas draf laporan Tugas Akhir (laporan Bab 1–3, naskah TA Bab 1–6, atau dokumen tugas akhir sesuai tahap akademik) yang diunggah mahasiswa untuk direview dosen pembimbing.
*   **Feedback/status bimbingan**: Ulasan tertulis dosen pembimbing beserta status kelayakan dokumen (seperti revisi, lanjut bab, acc, acc_sempro).
*   **Riwayat bimbingan**: Log data interaksi bimbingan, nomor versi berkas, dan utas diskusi (reply) antara mahasiswa dan dosen.
*   **Form/surat persetujuan Seminar Proposal jika relevan**: Dokumen resmi kelayakan sidang (.docx) yang dihasilkan otomatis oleh sistem ketika mahasiswa disetujui dospem.
*   **Berkas pendaftaran sidang**: Formulir elektronik pendaftaran sidang yang diajukan oleh mahasiswa setelah memenuhi syarat kelayakan.
*   **Jadwal sidang**: Data pelaksanaan ujian yang meliputi nama mahasiswa, waktu pelaksanaan, ruangan, serta plotting Dosen Penguji 1 & 2.
*   **Hasil sidang/catatan revisi**: Nilai sidang angka (0-100), keputusan kelulusan (lulus, lulus revisi, tidak lulus), dan berkas catatan perbaikan dari sidang.
*   **Dokumen revisi penguji**: Berkas PDF perbaikan naskah tugas akhir yang diunggah mahasiswa khusus untuk ditinjau oleh Dosen Penguji.
*   **Berkas kelulusan/wisuda**: Kumpulan 4 dokumen wajib mahasiswa (Skripsi Lengkap naskah TA Bab 1–6, PPT Presentasi, Halaman Pengesahan TTD, Logbook/Form Bimbingan Fisik).
*   **Status verifikasi berkas wisuda**: Keputusan admin (disetujui/ditolak) setelah memeriksa kelengkapan berkas kelulusan/wisuda.

## 4. Alur Utama Sistem yang Diusulkan

1. **Mahasiswa** - Melakukan login ke Sistem SIMTA dengan memasukkan kredensial NIM dan password.
2. **Sistem SIMTA** - Memverifikasi kredensial di basis data, mengidentifikasi peran, dan menampilkan dashboard mahasiswa.
3. **Mahasiswa** - Mengunggah dokumen bimbingan PDF sesuai dengan tahapan akademik yang sedang ditempuh (Bab 1–3 pada pra-sempro, naskah TA Bab 1–6 pada bimbingan lanjut, atau dokumen tugas akhir sesuai tahap akademik pada bimbingan akhir).
4. **Sistem SIMTA** - Memvalidasi ketersediaan antrean (memastikan tidak ada ulasan pending pada dosen yang sama), mengunggah file, menyimpan data ke database, secara otomatis menambahkan nomor versi dokumen (V1, V2, dst.), dan mengubah status berkas menjadi menunggu review.
5. **Sistem SIMTA** - Mengirimkan notifikasi email sistem secara otomatis kepada dosen terkait bahwa ada dokumen bimbingan baru yang masuk.
6. **Dosen Pembimbing** - Melakukan login dan membuka halaman daftar mahasiswa bimbingan pada dashboard.
7. **Dosen Pembimbing** - Membuka detail riwayat mahasiswa, mengunduh file draf PDF, menulis catatan feedback, dan menentukan status kelayakan bimbingan (revisi, lanjut bab, acc, atau acc_sempro).
8. **Sistem SIMTA** - Menyimpan tanggapan dosen, memperbarui status di basis data, mengirimkan notifikasi ke mahasiswa, dan menampilkan hasil review pada tabel riwayat bimbingan mahasiswa.
9. **Mahasiswa** - Jika batas minimal kuota bimbingan terpenuhi (minimal 5 kali) dan kedua dosen pembimbing telah memberikan ACC untuk Seminar Proposal, mahasiswa mengunduh surat persetujuan Seminar Proposal (.docx) yang digenerate otomatis oleh sistem. Koordinator Tugas Akhir menyusun jadwal sidang melalui sistem berdasarkan kelayakan mahasiswa tersebut.
10. **Koordinator Tugas Akhir** - Mengakses modul penjadwalan sidang, memeriksa daftar mahasiswa yang eligible, lalu menyusun jadwal sidang melalui sistem berdasarkan kelayakan mahasiswa dengan menetapkan tanggal, waktu, ruangan, dan menunjuk Dosen Penguji 1 & 2.
11. **Sistem SIMTA** - Memvalidasi ketersediaan slot ruangan agar tidak bentrok, menyimpan jadwal sidang, menyinkronkan data dosen penguji ke data mahasiswa (field `penguji_1` & `penguji_2`), mengubah status akademik mahasiswa menjadi menunggu sidang, serta menampilkan jadwal sidang di panel terkait.
12. **Dosen Penguji** - Melakukan login, membuka menu jadwal menguji, melihat detail jadwal sidang mahasiswa, dan mengakses draf dokumen mahasiswa.
13. **Dosen Penguji** - Melaksanakan ujian sidang secara offline, lalu Koordinator Tugas Akhir menginput nilai sidang (0-100) dan hasil kelulusan (lulus, lulus revisi, tidak lulus) ke Sistem SIMTA, yang akan memicu pencatatan catatan revisi sidang.
14. **Sistem SIMTA** - Jika mahasiswa dinyatakan lulus revisi dan berada pada fase revisi (status akademik berubah menjadi `revisi_sempro`, `revisi_semhas`, atau `revisi_sidang`), sistem secara otomatis mengunci menu bimbingan dospem dan mengarahkan menu unggahan dokumen revisi mahasiswa ke Dosen Penguji (bukan Dosen Pembimbing).
15. **Dosen Penguji** - Mengakses berkas revisi PDF yang dikirim mahasiswa, memeriksa perbaikan sesuai catatan sidang, memberikan catatan masukan tambahan, dan submit persetujuan revisi.
16. **Sistem SIMTA** - Jika revisi telah disetujui oleh kedua penguji (Double ACC Penguji), sistem membuka kembali akses bimbingan pembimbing, mengatur bab awal bimbingan tahap berikutnya, dan memperbarui status akademik mahasiswa ke tahapan selanjutnya (misalnya dari `revisi_sempro` naik ke `bimbingan_lanjut`).
17. **Mahasiswa, Dosen Pembimbing, Dosen Penguji, Koordinator Tugas Akhir** - Untuk Seminar Hasil (Semhas) dan Sidang Akhir, alur bimbingan naskah TA Bab 1–6, penilaian penguji, dan revisi menggunakan pola terstruktur yang sama dengan fase proposal di atas. Koordinator Tugas Akhir menyusun jadwal sidang melalui sistem berdasarkan kelayakan mahasiswa tersebut.
18. **Mahasiswa** - Setelah Sidang Akhir selesai dan status akademik dinaikkan menjadi `persiapan_wisuda`, mahasiswa masuk ke menu wisuda untuk mengunggah 4 berkas kelulusan/wisuda wajib dalam format PDF (Skripsi lengkap naskah TA Bab 1–6, PPT presentasi, halaman pengesahan bertanda tangan, dan logbook).
19. **Koordinator Tugas Akhir** - Membuka menu verifikasi berkas kelulusan wisuda dan memeriksa kesesuaian berkas satu per satu.
20. **Mahasiswa** - Jika berkas belum sesuai atau ditolak oleh Koordinator Tugas Akhir, mahasiswa membaca catatan penolakan pada dashboard lalu mengunggah ulang berkas perbaikan.
21. **Sistem SIMTA** - Jika berkas wisuda dinyatakan sesuai dan disetujui (Approved) oleh Koordinator Tugas Akhir, sistem memperbarui status akademik mahasiswa menjadi selesai (lulus sepenuhnya) dan menampilkan ucapan selamat di dashboard mahasiswa.

## 5. Decision / Percabangan Penting

*   **Apakah login berhasil?**
    *   *Jika YA*: Sistem SIMTA mengarahkan pengguna masuk ke halaman dashboard sesuai role masing-masing (Mahasiswa, Dosen, Admin).
    *   *Jika TIDAK*: Sistem menampilkan pesan error kredensial tidak valid dan mengembalikan pengguna ke halaman Login.
*   **Apakah ada bimbingan yang masih menunggu review?**
    *   *Jika YA*: Sistem menolak pengiriman dokumen bimbingan baru untuk dosen yang sama (concurrency lock) dan menampilkan error.
    *   *Jika TIDAK*: Sistem mengizinkan mahasiswa mengunggah dokumen draf bimbingan baru.
*   **Apakah dokumen bimbingan disetujui dosen?**
    *   *Jika YA*: Dosen memberikan status "acc" atau "lanjut_bab". Alur berlanjut ke update bab baru atau persiapan sidang.
    *   *Jika TIDAK*: Dosen memberikan status "revisi". Alur kembali ke mahasiswa untuk melakukan perbaikan berkas bimbingan.
*   **Apakah syarat bimbingan dan ACC dosen pembimbing untuk Sempro terpenuhi?**
    *   *Jika YA*: Sistem mengaktifkan tombol unduh surat persetujuan Seminar Proposal dan mahasiswa dapat mengunduhnya.
    *   *Jika TIDAK*: Tombol pendaftaran/unduh dikunci oleh sistem, alur kembali ke proses bimbingan rutin dengan dosen pembimbing.
*   **Apakah berkas pendaftaran sidang lengkap?**
    *   *Jika YA*: Jadwal sidang disimpan oleh sistem dengan status "dijadwalkan" dan penguji terplot.
    *   *Jika TIDAK*: Pendaftaran ditangguhkan oleh Koordinator Tugas Akhir dan dikembalikan ke mahasiswa untuk dilengkapi.
*   **Apakah hasil sidang disetujui?**
    *   *Jika YA*: Mahasiswa lulus murni atau lulus revisi. Alur berlanjut ke tahap revisi pascasidang dengan penguji.
    *   *Jika TIDAK*: Mahasiswa dinyatakan tidak lulus, dan alur pengerjaan naskah dikembalikan ke pembimbing (mengulang pengerjaan).
*   **Apakah revisi penguji disetujui?**
    *   *Jika YA*: Dosen Penguji memberikan ACC. Jika kedua penguji (Penguji 1 & 2) telah memberikan ACC, status akademik naik ke tahap berikutnya.
    *   *Jika TIDAK*: Penguji memberikan catatan revisi tambahan, alur kembali ke mahasiswa untuk mengunggah ulang draf revisi.
*   **Apakah tahap yang berjalan adalah Sidang Akhir?**
    *   *If YA*: Setelah revisi disetujui oleh kedua penguji, status akademik mahasiswa berubah menjadi `persiapan_wisuda`.
    *   *Jika TIDAK*: Status akademik mahasiswa berubah menjadi status bimbingan untuk bab berikutnya (`bimbingan_lanjut` atau `bimbingan_akhir`).
*   **Apakah berkas kelulusan/wisuda lengkap dan sesuai?**
    *   *Jika YA*: Koordinator Tugas Akhir menyetujui berkas, status mahasiswa diperbarui oleh sistem menjadi `selesai` (lulus/alumni).
    *   *Jika TIDAK*: Koordinator Tugas Akhir menolak berkas dengan catatan koreksi, alur kembali ke mahasiswa untuk mengunggah ulang dokumen wisuda.

## 6. Alur Ringkas untuk Diagram

*   Mahasiswa $\rightarrow$ Sistem SIMTA: Input kredensial login (NIM & Password)
*   Sistem SIMTA $\rightarrow$ Mahasiswa: Menampilkan dashboard dan info progres akademik
*   Mahasiswa $\rightarrow$ Sistem SIMTA: Mengunggah dokumen bimbingan PDF, memilih dosen target, dan menyertakan catatan
*   Sistem SIMTA $\rightarrow$ Dosen Pembimbing: Menyimpan dokumen, menambahkan nomor versi berkas, dan mengirim notifikasi ulasan masuk
*   Dosen Pembimbing $\rightarrow$ Sistem SIMTA: Mengunduh draf PDF, menginput catatan feedback ulasan, dan mengirimkan status kelayakan bimbingan
*   Sistem SIMTA $\rightarrow$ Mahasiswa: Memperbarui status bimbingan, merekam logs riwayat bimbingan, dan menampilkan catatan ulasan dosen
*   Mahasiswa $\leftrightarrow$ Dosen Pembimbing (via Sistem SIMTA): Melakukan diskusi tanya jawab (reply) secara kontekstual pada thread bimbingan
*   Mahasiswa $\rightarrow$ Sistem SIMTA: Mengunduh surat persetujuan Seminar Proposal yang digenerate otomatis (setelah kuota minimal 5 bimbingan dan ACC Sempro terpenuhi)
*   Sistem SIMTA $\rightarrow$ Mahasiswa: Mengunduh berkas surat persetujuan Seminar Proposal (.docx) otomatis
*   Koordinator Tugas Akhir $\rightarrow$ Sistem SIMTA: Menyusun jadwal sidang melalui sistem berdasarkan kelayakan mahasiswa (memasukkan jenis sidang, tanggal/waktu, ruangan, dan Dosen Penguji 1 & 2)
*   Sistem SIMTA $\rightarrow$ Sistem SIMTA: Memvalidasi bentrok ruang/waktu, mengunci pasangan penguji, dan menyinkronkan data dosen penguji ke data mahasiswa
*   Sistem SIMTA $\rightarrow$ Dosen Penguji: Menampilkan penugasan menguji pada menu jadwal dosen penguji
*   Sistem SIMTA $\rightarrow$ Mahasiswa: Menampilkan info jadwal pelaksanaan ujian di dashboard mahasiswa
*   Koordinator Tugas Akhir $\rightarrow$ Sistem SIMTA: Menginput hasil penilaian angka (0-100) dan keputusan kelulusan sidang
*   Sistem SIMTA $\rightarrow$ Mahasiswa: Memperbarui status akademik menjadi fase revisi (`revisi_sempro`, `revisi_semhas`, atau `revisi_sidang`)
*   Mahasiswa $\rightarrow$ Sistem SIMTA: Mengunggah draf dokumen revisi PDF khusus untuk dosen penguji
*   Sistem SIMTA $\rightarrow$ Dosen Penguji: Mengunci akses bimbingan dospem dan menampilkan notifikasi dokumen revisi masuk ke penguji
*   Dosen Penguji $\rightarrow$ Sistem SIMTA: Mengunduh berkas revisi, meninjau perbaikan, dan mengirimkan persetujuan ACC Penguji
*   Sistem SIMTA $\rightarrow$ Mahasiswa: Mengubah status akademik ke tingkat lanjutan (setelah Double ACC Penguji) dan membuka kembali akses bimbingan dospem
*   Mahasiswa $\rightarrow$ Sistem SIMTA: Mengunggah 4 berkas kelulusan/wisuda PDF (skripsi lengkap naskah TA Bab 1–6, PPT, halaman pengesahan, logbook) saat status `persiapan_wisuda`
*   Koordinator Tugas Akhir $\rightarrow$ Sistem SIMTA: Meninjau berkas wisuda, menginput catatan verifikasi, dan mengirim keputusan (setujui/tolak)
*   Sistem SIMTA $\rightarrow$ Mahasiswa: Memperbarui status akhir menjadi `selesai` (lulus) dan menampilkan ucapan selamat kelulusan

## 7. Catatan Penyederhanaan Diagram

Untuk menjaga keterbacaan diagram alir (flowmap) agar tidak terlalu rumit, proses Seminar Hasil (Semhas) dan Sidang Akhir disederhanakan dalam bentuk siklus pengulangan lanjutan (looping) karena memiliki pola proses bisnis yang identik dengan Seminar Proposal. Pola siklus tersebut meliputi: bimbingan naskah Tugas Akhir $\rightarrow$ persetujuan ACC dospem $\rightarrow$ penyusunan jadwal sidang oleh Koordinator Tugas Akhir berdasarkan kelayakan $\rightarrow$ pelaksanaan sidang offline $\rightarrow$ input keputusan kelulusan sidang $\rightarrow$ bimbingan revisi dengan Dosen Penguji $\rightarrow$ persetujuan ACC Penguji $\rightarrow$ transisi ke tahap akademik berikutnya. Jalur alur hanya akan berlanjut ke tahap pengunggahan berkas kelulusan/wisuda setelah mahasiswa berhasil menyelesaikan revisi pascasidang akhir.
