# BAB V
## PENGUJIAN SISTEM

## 5.2 Pengujian Sistem

Pengujian sistem dilakukan untuk memastikan bahwa Sistem Informasi Manajemen Tugas Akhir (SIMTA) berjalan sesuai dengan kebutuhan fungsional yang telah dirancang pada Bab IV. Metode yang digunakan adalah **Black Box Testing**, yaitu pengujian yang berfokus pada masukan dan keluaran sistem tanpa membahas struktur internal kode program.

Isi pengujian ini disusun berdasarkan hasil audit kode aplikasi pada frontend dan backend, terutama modul autentikasi, manajemen user, bimbingan, review dosen, kesiapan seminar proposal, laporan, jadwal sidang, profil, notifikasi, serta pembatasan akses berdasarkan role. Dengan demikian, hasil yang diharapkan pada tabel berikut mengikuti perilaku sistem yang benar-benar tersedia pada aplikasi.

### 5.2.1 Perancangan Pengujian Sistem

Sebelum pengujian dilakukan, penulis menyusun rancangan pengujian untuk menentukan fitur yang akan diuji, detail pengujian, jenis pengujian, dan acuan rancangan pada Bab IV.

**Tabel 5.1 Perancangan Pengujian Sistem**

| Kelas Uji | Detail Pengujian | Jenis Pengujian | Acuan Bab IV |
|-----------|------------------|-----------------|--------------|
| Login User | Menguji proses login Admin, Dosen, dan Mahasiswa menggunakan NIM/NIP dan password. | Black Box | Activity Diagram Login, Sequence Diagram Login, Flowchart Login |
| Hak Akses Role | Menguji pembatasan halaman berdasarkan role pengguna. | Black Box | Use Case Diagram SIMTA, Kebutuhan Non-Fungsional Security |
| Dashboard | Menguji tampilan informasi utama sesuai role pengguna. | Black Box | Use Case Diagram, Wireframe Dashboard |
| Manajemen User | Menguji tambah, ubah, nonaktifkan, hapus permanen, dan reset password user oleh Admin. | Black Box | Activity Diagram Pengelolaan Data Pengguna, Sequence Diagram Admin Kelola User, Koleksi Users |
| Plotting Dosen Pembimbing | Menguji penentuan Dosen Pembimbing 1 dan Dosen Pembimbing 2 oleh Admin. | Black Box | Activity Diagram Penentuan Dosen Pembimbing, Sequence Diagram Plotting Dosen, Flowchart Plotting Dospem |
| Bimbingan Mahasiswa | Menguji upload dokumen bimbingan PDF, validasi dokumen, antrian bimbingan, riwayat, download, dan reply. | Black Box | Activity Diagram Pengajuan Bimbingan, Sequence Diagram Upload Bimbingan, Flowchart Upload Bimbingan, Koleksi Bimbingans dan Replies |
| Review Bimbingan Dosen | Menguji review dosen melalui status Revisi, ACC, Lanjut BAB, dan ACC Sempro. | Black Box | Activity Diagram Evaluasi Dosen, Sequence Diagram Review Bimbingan, Koleksi Bimbingans |
| Kesiapan Seminar Proposal | Menguji status kesiapan sempro berdasarkan minimal 5 bimbingan dan ACC Sempro dari masing-masing dosen pembimbing. | Black Box | Kebutuhan Fungsional Bimbingan, Koleksi Bimbingans |
| Kelola Bimbingan Admin | Menguji pemantauan riwayat bimbingan mahasiswa dan pembersihan riwayat bimbingan oleh Admin. | Black Box | Kebutuhan Fungsional Administrator, Koleksi Users, Bimbingans, Replies |
| Laporan Progress | Menguji laporan progress bimbingan, status kecukupan bimbingan, ACC Sempro, dan download surat sempro oleh Admin. | Black Box | Kebutuhan Fungsional Administrator, Koleksi Users dan Bimbingans |
| Kelola Jadwal Sidang | Menguji tambah, ubah, selesai, batal, jadwal ulang, dan hapus permanen jadwal sidang oleh Admin. | Black Box | Activity Diagram Kelola Jadwal Sidang, Sequence Diagram Kelola Jadwal Sidang, Koleksi Jadwals |
| Lihat Jadwal Sidang | Menguji tampilan jadwal sidang pada halaman Mahasiswa dan Dosen. | Black Box | Activity Diagram Lihat Jadwal Sidang, Sequence Diagram Lihat Jadwal Sidang |
| Profil dan Logout | Menguji tampilan profil, update nomor WhatsApp, upload avatar dosen, dan logout. | Black Box | Use Case Diagram dan kebutuhan pengguna |
| Notifikasi WhatsApp | Menguji pemicu notifikasi saat upload bimbingan, feedback bimbingan, dan pembuatan jadwal sidang. | Black Box | Kebutuhan Fungsional Notifikasi |

### 5.2.2 Hasil Pengujian Sistem Menggunakan Metode Black Box

Hasil pengujian sistem disajikan dalam bentuk tabel berdasarkan modul yang diuji. Kolom **Hasil yang Didapatkan** diisi setelah pengujian dilakukan langsung pada aplikasi, sedangkan kolom **Keterangan** diisi dengan **Valid** apabila hasil aktual sesuai dengan hasil yang diharapkan.

#### 5.2.2.1 Pengujian Halaman Login dan Hak Akses

**Tabel 5.2 Pengujian Sistem Halaman Login dan Hak Akses**

| Skenario | Test Case | Hasil yang Diharapkan | Hasil yang Didapatkan | Keterangan |
|----------|-----------|-----------------------|-----------------------|------------|
| Mengosongkan NIM/NIP atau password lalu klik Login. | Login kosong | Sistem tetap berada pada halaman login dan proses login tidak dikirim. | | |
| Mengisi NIM/NIP dan password Admin yang benar. | Login Admin | Sistem menampilkan pesan login berhasil dan mengarahkan user ke dashboard Admin. | | |
| Mengisi NIM/NIP dan password Dosen yang benar. | Login Dosen | Sistem menampilkan pesan login berhasil dan mengarahkan user ke dashboard Dosen. | | |
| Mengisi NIM/NIP dan password Mahasiswa yang benar. | Login Mahasiswa | Sistem menampilkan pesan login berhasil dan mengarahkan user ke dashboard Mahasiswa. | | |
| Mengisi NIM/NIP yang tidak terdaftar. | User tidak ditemukan | Sistem menolak login dan menampilkan pesan bahwa user dengan NIM/NIP tersebut tidak ditemukan. | | |
| Mengisi password yang salah pada akun terdaftar. | Password salah | Sistem menolak login dan menampilkan pesan bahwa password salah. | | |
| Login menggunakan akun nonaktif. | Akun nonaktif | Sistem menolak login dan menampilkan pesan bahwa akun tidak aktif. | | |
| Mahasiswa membuka URL halaman Admin. | Hak akses role | Sistem mengarahkan user ke halaman yang sesuai dengan role Mahasiswa. | | |
| User belum login membuka halaman yang dilindungi. | Protected route | Sistem mengarahkan user ke halaman login. | | |

#### 5.2.2.2 Pengujian Halaman Dashboard

**Tabel 5.3 Pengujian Sistem Halaman Dashboard**

| Skenario | Test Case | Hasil yang Diharapkan | Hasil yang Didapatkan | Keterangan |
|----------|-----------|-----------------------|-----------------------|------------|
| Admin membuka dashboard. | Dashboard Admin | Sistem menampilkan ringkasan jumlah user, bimbingan, jadwal, dan aktivitas sistem. | | |
| Dosen membuka dashboard. | Dashboard Dosen | Sistem menampilkan daftar mahasiswa bimbingan dan status bimbingan yang perlu direview. | | |
| Mahasiswa membuka dashboard. | Dashboard Mahasiswa | Sistem menampilkan data tugas akhir, dosen pembimbing, progress BAB, status bimbingan terakhir, jumlah sesi bimbingan, dan status persiapan sempro. | | |

#### 5.2.2.3 Pengujian Manajemen User dan Plotting Dosen Pembimbing

**Tabel 5.4 Pengujian Sistem Manajemen User dan Plotting Dosen**

| Skenario | Test Case | Hasil yang Diharapkan | Hasil yang Didapatkan | Keterangan |
|----------|-----------|-----------------------|-----------------------|------------|
| Admin menambahkan user Mahasiswa dengan data lengkap. | Tambah Mahasiswa | Sistem menyimpan user Mahasiswa dan menampilkan pesan user berhasil ditambahkan. | | |
| Admin menambahkan user Dosen dengan data lengkap. | Tambah Dosen | Sistem menyimpan user Dosen dan menampilkan pesan user berhasil ditambahkan. | | |
| Admin menambahkan user dengan field wajib kosong. | Validasi field | Sistem menolak data dan menampilkan pesan gagal menambahkan user. | | |
| Admin menambahkan user dengan password kurang dari 6 karakter. | Validasi password | Sistem menolak data karena password minimal 6 karakter. | | |
| Admin menambahkan user dengan NIM/NIP yang sudah terdaftar. | Validasi duplikat | Sistem menolak data dan menampilkan pesan NIM/NIP sudah terdaftar. | | |
| Admin mencari user berdasarkan nama atau NIM/NIP. | Pencarian user | Sistem menampilkan daftar user yang sesuai dengan kata kunci pencarian. | | |
| Admin memfilter user berdasarkan role. | Filter role | Sistem menampilkan daftar user sesuai role yang dipilih. | | |
| Admin mengubah data user melalui halaman edit. | Edit user | Sistem menyimpan perubahan data dan menampilkan pesan data berhasil disimpan. | | |
| Admin menentukan dua dosen pembimbing yang berbeda untuk Mahasiswa. | Assign dospem | Sistem menyimpan Dosen Pembimbing 1 dan Dosen Pembimbing 2 pada data Mahasiswa. | | |
| Admin memilih dosen pembimbing 1 dan 2 dengan dosen yang sama. | Validasi dospem sama | Sistem menolak penyimpanan dan menampilkan pesan bahwa dosen pembimbing tidak boleh sama. | | |
| Admin reset password Mahasiswa atau Dosen dari halaman detail. | Reset password | Sistem menyimpan password baru dan menampilkan pesan password berhasil direset. | | |
| Admin menonaktifkan user. | Nonaktifkan user | Sistem mengubah status user menjadi nonaktif dan user tidak dapat login. | | |
| Admin menghapus permanen user non-admin. | Hapus permanen user | Sistem menghapus data user secara permanen setelah konfirmasi. | | |

#### 5.2.2.4 Pengujian Halaman Bimbingan Mahasiswa

**Tabel 5.5 Pengujian Sistem Halaman Bimbingan Mahasiswa**

| Skenario | Test Case | Hasil yang Diharapkan | Hasil yang Didapatkan | Keterangan |
|----------|-----------|-----------------------|-----------------------|------------|
| Mahasiswa mengunggah bimbingan PDF dengan judul yang valid. | Upload bimbingan | Sistem menyimpan bimbingan dengan status Menunggu dan menampilkannya pada riwayat. | | |
| Mahasiswa mengosongkan judul atau file saat submit. | Validasi form upload | Sistem menampilkan pesan bahwa judul dan file harus dilengkapi. | | |
| Mahasiswa memilih file selain PDF. | Validasi tipe file | Sistem menolak file dan menampilkan pesan bahwa hanya file PDF yang diperbolehkan. | | |
| Mahasiswa mengunggah file PDF lebih dari 10MB. | Validasi ukuran file | Sistem menolak upload karena ukuran file melebihi batas maksimal. | | |
| Mahasiswa mengirim bimbingan baru pada dosen yang sama ketika status terakhir masih Menunggu. | Validasi antrian | Sistem menonaktifkan form atau menolak upload sampai bimbingan sebelumnya direview dosen. | | |
| Mahasiswa berpindah tab Dospem 1 dan Dospem 2. | Riwayat per dospem | Sistem menampilkan riwayat bimbingan sesuai dosen pembimbing yang dipilih. | | |
| Mahasiswa mengunduh file bimbingan dari riwayat. | Download file | Sistem mengunduh file PDF bimbingan yang pernah diunggah. | | |
| Mahasiswa mengirim reply pada bimbingan yang sudah direview. | Reply mahasiswa | Sistem menyimpan reply dan menampilkan reply pada riwayat diskusi bimbingan. | | |

#### 5.2.2.5 Pengujian Review Bimbingan Dosen

**Tabel 5.6 Pengujian Sistem Review Bimbingan Dosen**

| Skenario | Test Case | Hasil yang Diharapkan | Hasil yang Didapatkan | Keterangan |
|----------|-----------|-----------------------|-----------------------|------------|
| Dosen membuka daftar mahasiswa bimbingan. | Daftar mahasiswa bimbingan | Sistem menampilkan mahasiswa yang memiliki bimbingan dengan dosen tersebut. | | |
| Dosen membuka detail bimbingan Mahasiswa. | Detail bimbingan | Sistem menampilkan data Mahasiswa, dokumen bimbingan, status, dan riwayat bimbingan. | | |
| Dosen mengunduh dokumen bimbingan Mahasiswa. | Download dokumen | Sistem mengunduh dokumen PDF yang dikirim Mahasiswa. | | |
| Dosen submit feedback tanpa memilih status. | Validasi status | Sistem menampilkan pesan bahwa status harus dipilih. | | |
| Dosen submit feedback tanpa mengisi feedback. | Validasi feedback | Sistem menampilkan pesan bahwa feedback harus diisi. | | |
| Dosen memberi feedback dengan status Revisi. | Feedback revisi | Sistem menyimpan feedback dan mengubah status bimbingan menjadi Revisi. | | |
| Dosen memberi feedback dengan status ACC. | Feedback ACC | Sistem menyimpan feedback dan mengubah status bimbingan menjadi ACC. | | |
| Dosen memberi feedback dengan status Lanjut BAB. | Feedback lanjut BAB | Sistem menyimpan feedback dan memperbarui progress BAB Mahasiswa ke tahap berikutnya. | | |
| Dosen memilih ACC Sempro sebelum Mahasiswa memiliki minimal 5 bimbingan dengan dosen tersebut. | Validasi ACC Sempro | Opsi ACC Sempro tidak dapat dipilih atau backend menolak karena syarat minimal 5 bimbingan belum terpenuhi. | | |
| Dosen memilih ACC Sempro setelah Mahasiswa memiliki minimal 5 bimbingan dengan dosen tersebut. | ACC Sempro | Sistem menyimpan status ACC Sempro pada bimbingan tersebut. | | |
| Dosen membuka bimbingan yang sudah direview. | Review satu kali | Sistem menampilkan status sudah direview dan form feedback tidak ditampilkan lagi. | | |

#### 5.2.2.6 Pengujian Kesiapan Seminar Proposal dan Surat Sempro

**Tabel 5.7 Pengujian Sistem Kesiapan Seminar Proposal**

| Skenario | Test Case | Hasil yang Diharapkan | Hasil yang Didapatkan | Keterangan |
|----------|-----------|-----------------------|-----------------------|------------|
| Mahasiswa belum memiliki minimal 5 bimbingan pada salah satu dosen pembimbing. | Status sempro kurang bimbingan | Sistem menampilkan status belum siap dan jumlah bimbingan yang masih dibutuhkan. | | |
| Mahasiswa sudah memiliki minimal 5 bimbingan tetapi belum mendapat ACC Sempro dari salah satu dosen. | Status sempro belum ACC | Sistem menampilkan status belum siap karena ACC Sempro belum lengkap. | | |
| Mahasiswa sudah memiliki minimal 5 bimbingan dan ACC Sempro dari masing-masing dosen pembimbing. | Status sempro siap | Sistem menampilkan status siap seminar proposal. | | |
| Mahasiswa belum memenuhi syarat sempro. | Tombol surat belum tampil | Tombol download surat persetujuan sempro tidak ditampilkan pada dashboard Mahasiswa. | | |
| Mahasiswa sudah memenuhi syarat sempro. | Download surat mahasiswa | Sistem menampilkan tombol download dan mengunduh file surat persetujuan sempro berformat DOCX. | | |
| Admin membuka halaman Laporan. | Laporan progress | Sistem menampilkan total bimbingan per dosen pembimbing, status minimal bimbingan, dan status ACC Sempro. | | |
| Admin mengunduh surat sempro pada Mahasiswa yang sudah siap. | Download surat admin | Sistem mengunduh file surat persetujuan sempro berformat DOCX. | | |

#### 5.2.2.7 Pengujian Kelola Bimbingan Admin

**Tabel 5.8 Pengujian Sistem Kelola Bimbingan Admin**

| Skenario | Test Case | Hasil yang Diharapkan | Hasil yang Didapatkan | Keterangan |
|----------|-----------|-----------------------|-----------------------|------------|
| Admin membuka halaman Kelola Bimbingan. | Daftar mahasiswa | Sistem menampilkan daftar Mahasiswa yang dapat dipilih. | | |
| Admin memilih salah satu Mahasiswa. | Ringkasan bimbingan | Sistem menampilkan data Mahasiswa, dosen pembimbing, statistik status, dan riwayat bimbingan per dospem. | | |
| Admin menghapus riwayat bimbingan salah satu dospem. | Hapus riwayat dospem | Sistem menghapus riwayat bimbingan, reply, dan file pada dospem yang dipilih. | | |
| Admin menghapus semua riwayat bimbingan dan memilih reset progress. | Hapus riwayat dan reset progress | Sistem menghapus semua riwayat bimbingan Mahasiswa dan mengembalikan progress ke BAB I. | | |

#### 5.2.2.8 Pengujian Kelola Jadwal Sidang Admin

**Tabel 5.9 Pengujian Sistem Kelola Jadwal Sidang Admin**

| Skenario | Test Case | Hasil yang Diharapkan | Hasil yang Didapatkan | Keterangan |
|----------|-----------|-----------------------|-----------------------|------------|
| Admin membuat jadwal sidang dengan data wajib lengkap. | Tambah jadwal | Sistem menyimpan jadwal dengan status Terjadwal. | | |
| Admin mengosongkan Mahasiswa, tanggal, waktu mulai, atau ruangan. | Validasi form jadwal | Sistem menampilkan pesan bahwa field wajib harus dilengkapi. | | |
| Admin membuat jadwal pada ruangan dan waktu yang sudah digunakan. | Validasi bentrok ruangan | Sistem menolak jadwal dan menampilkan pesan bahwa ruangan sudah digunakan pada waktu tersebut. | | |
| Admin membuat jadwal aktif dengan jenis yang sama untuk Mahasiswa yang sudah memiliki jadwal aktif. | Validasi duplikat jadwal | Sistem menolak jadwal karena Mahasiswa sudah memiliki jadwal aktif dengan jenis yang sama. | | |
| Admin mengubah tanggal, waktu, ruangan, atau penguji jadwal aktif. | Edit jadwal | Sistem menyimpan perubahan dan menampilkan pesan jadwal berhasil diupdate. | | |
| Admin menyelesaikan jadwal tanpa memilih hasil sidang. | Validasi hasil sidang | Sistem menampilkan pesan bahwa hasil sidang harus dipilih. | | |
| Admin menyelesaikan jadwal dengan hasil sidang. | Selesai jadwal | Sistem mengubah status jadwal menjadi Selesai. | | |
| Admin membatalkan jadwal tanpa alasan. | Validasi alasan batal | Sistem menampilkan pesan bahwa alasan pembatalan harus diisi. | | |
| Admin membatalkan jadwal dengan alasan. | Batal jadwal | Sistem mengubah status jadwal menjadi Dibatalkan. | | |
| Admin menjadwalkan ulang jadwal yang dibatalkan. | Jadwal ulang | Sistem mengubah status jadwal menjadi Terjadwal kembali. | | |
| Admin menghapus permanen jadwal aktif. | Validasi hapus aktif | Sistem menolak hapus permanen dan meminta jadwal dibatalkan terlebih dahulu. | | |
| Admin menghapus permanen jadwal yang dibatalkan atau selesai. | Hapus permanen jadwal | Sistem menghapus jadwal secara permanen. | | |

#### 5.2.2.9 Pengujian Halaman Lihat Jadwal Sidang

**Tabel 5.10 Pengujian Sistem Halaman Lihat Jadwal Sidang**

| Skenario | Test Case | Hasil yang Diharapkan | Hasil yang Didapatkan | Keterangan |
|----------|-----------|-----------------------|-----------------------|------------|
| Mahasiswa membuka halaman Jadwal Sidang. | Lihat jadwal Mahasiswa | Sistem menampilkan semua jadwal dengan status Terjadwal yang telah dibuat Admin. | | |
| Dosen membuka halaman Jadwal Sidang. | Lihat jadwal Dosen | Sistem menampilkan semua jadwal dengan status Terjadwal yang telah dibuat Admin. | | |
| Tidak ada jadwal dengan status Terjadwal. | Empty state jadwal | Sistem menampilkan pesan belum ada jadwal sidang. | | |
| User mengubah pilihan tahun, gelombang, atau periode. | Label periode jadwal | Sistem mengubah label periode pada tampilan jadwal. Data jadwal tetap berasal dari daftar jadwal Terjadwal. | | |

Catatan: Pada kode saat ini, halaman Jadwal Sidang untuk Mahasiswa dan Dosen mengambil data dengan parameter `viewAll=true` dan `status=dijadwalkan`, sehingga data yang tampil adalah semua jadwal terjadwal, bukan hanya jadwal milik Mahasiswa atau jadwal yang mengikutsertakan Dosen sebagai penguji.

#### 5.2.2.10 Pengujian Halaman Profil dan Logout

**Tabel 5.11 Pengujian Sistem Halaman Profil dan Logout**

| Skenario | Test Case | Hasil yang Diharapkan | Hasil yang Didapatkan | Keterangan |
|----------|-----------|-----------------------|-----------------------|------------|
| User membuka halaman profil sesuai role. | Lihat profil | Sistem menampilkan nama, NIM/NIP, email, dan data profil user. | | |
| User mengosongkan nomor WhatsApp lalu menyimpan. | Validasi WhatsApp | Sistem menampilkan pesan bahwa nomor WhatsApp tidak boleh kosong. | | |
| User mengisi nomor WhatsApp lalu menyimpan. | Update WhatsApp | Sistem menyimpan nomor WhatsApp melalui API profil dan menampilkan pesan berhasil. | | |
| Dosen mengunggah avatar dengan file gambar valid. | Upload avatar dosen | Sistem mengunggah avatar dan menampilkan foto profil terbaru. | | |
| Dosen mengunggah avatar dengan file selain gambar atau lebih dari 5MB. | Validasi avatar dosen | Sistem menolak file dan menampilkan pesan validasi file avatar. | | |
| User melakukan logout. | Logout | Sistem menghapus sesi login dan mengarahkan user ke halaman login. | | |

Catatan: Form ubah nama/email dan ubah password pada halaman profil Mahasiswa dan Dosen saat ini masih menampilkan alert lokal dan belum mengirim perubahan ke API. Oleh karena itu, fitur tersebut tidak dijadikan skenario valid utama pada pengujian Bab V sampai implementasinya disambungkan ke backend.

#### 5.2.2.11 Pengujian Notifikasi WhatsApp

**Tabel 5.12 Pengujian Sistem Notifikasi WhatsApp**

| Skenario | Test Case | Hasil yang Diharapkan | Hasil yang Didapatkan | Keterangan |
|----------|-----------|-----------------------|-----------------------|------------|
| Mahasiswa mengunggah bimbingan baru. | Notifikasi upload | Sistem tetap menyimpan bimbingan dan memicu pengiriman notifikasi ke dosen apabila konfigurasi WhatsApp aktif. | | |
| Dosen memberikan feedback bimbingan. | Notifikasi feedback | Sistem tetap menyimpan feedback dan memicu pengiriman notifikasi ke Mahasiswa apabila konfigurasi WhatsApp aktif. | | |
| Admin membuat jadwal sidang. | Notifikasi jadwal | Sistem tetap menyimpan jadwal dan memicu pengiriman notifikasi ke pihak terkait apabila konfigurasi WhatsApp aktif. | | |
| Konfigurasi WhatsApp tidak aktif atau gagal mengirim. | Fallback notifikasi | Proses utama tetap berhasil walaupun notifikasi WhatsApp tidak terkirim. | | |

#### 5.2.2.12 Pengujian Responsif

**Tabel 5.13 Pengujian Sistem Responsif**

| Skenario | Test Case | Hasil yang Diharapkan | Hasil yang Didapatkan | Keterangan |
|----------|-----------|-----------------------|-----------------------|------------|
| Halaman login dibuka pada layar mobile. | Responsif login | Tampilan login menyesuaikan layar dan form tetap dapat digunakan. | | |
| Dashboard dibuka pada layar mobile. | Responsif dashboard | Konten dashboard tetap terbaca dan navigasi dapat digunakan. | | |
| Tabel jadwal atau user dibuka pada layar mobile. | Responsif tabel | Tabel tetap dapat dibaca melalui scroll atau penyesuaian layout. | | |
| Form upload bimbingan dibuka pada layar mobile. | Responsif bimbingan | Form upload dan riwayat bimbingan tetap dapat digunakan. | | |

### 5.2.3 Bukti Hasil Pengujian Sistem Menggunakan Metode Black Box

Sebagai pelengkap hasil pengujian, penulis perlu menyertakan bukti dokumentasi visual berupa screenshot dari fitur utama yang diuji.

**Tabel 5.14 Bukti Hasil Pengujian Sistem**

| No | Modul | Skenario yang Dibuktikan | Bukti Screenshot |
|----|-------|--------------------------|------------------|
| 1 | Login dan Hak Akses | Login berhasil, login gagal, akun nonaktif, dan redirect role. | [isi nama gambar] |
| 2 | Dashboard | Dashboard Admin, Dosen, dan Mahasiswa. | [isi nama gambar] |
| 3 | Manajemen User | Tambah user, edit user, assign dospem, reset password, nonaktifkan user. | [isi nama gambar] |
| 4 | Bimbingan Mahasiswa | Upload PDF, validasi file, status menunggu, riwayat, download, dan reply. | [isi nama gambar] |
| 5 | Review Bimbingan Dosen | Feedback Revisi, ACC, Lanjut BAB, ACC Sempro, dan form review satu kali. | [isi nama gambar] |
| 6 | Kesiapan Sempro | Status belum siap, siap sempro, dan download surat DOCX. | [isi nama gambar] |
| 7 | Kelola Bimbingan Admin | Detail riwayat bimbingan, statistik status, dan hapus riwayat. | [isi nama gambar] |
| 8 | Laporan Progress | Rekap progress, filter status, status ACC Sempro, dan tombol surat. | [isi nama gambar] |
| 9 | Kelola Jadwal Admin | Buat, edit, selesai, batal, jadwal ulang, dan hapus permanen jadwal. | [isi nama gambar] |
| 10 | Lihat Jadwal Sidang | Jadwal tampil pada halaman Mahasiswa dan Dosen, serta empty state. | [isi nama gambar] |
| 11 | Profil dan Logout | Update WhatsApp, upload avatar dosen, dan logout. | [isi nama gambar] |
| 12 | Notifikasi WhatsApp | Bukti pesan WhatsApp atau log pengiriman notifikasi. | [isi nama gambar] |
| 13 | Responsif | Tampilan mobile login, dashboard, tabel, dan bimbingan. | [isi nama gambar] |

### 5.2.4 Ringkasan Hasil Pengujian

Setelah seluruh skenario pengujian dilakukan, hasil pengujian dirangkum untuk mengetahui tingkat keberhasilan sistem. Persentase keberhasilan dihitung menggunakan rumus berikut:

```text
Persentase Keberhasilan = (Jumlah Valid / Total Skenario Pengujian) x 100%
```

**Tabel 5.15 Ringkasan Hasil Pengujian Sistem**

| Modul Pengujian | Jumlah Skenario | Valid | Tidak Valid | Persentase Keberhasilan |
|-----------------|-----------------|-------|-------------|-------------------------|
| Login dan Hak Akses | 9 | | | |
| Dashboard | 3 | | | |
| Manajemen User dan Plotting Dosen | 13 | | | |
| Bimbingan Mahasiswa | 8 | | | |
| Review Bimbingan Dosen | 11 | | | |
| Kesiapan Seminar Proposal | 7 | | | |
| Kelola Bimbingan Admin | 4 | | | |
| Kelola Jadwal Sidang Admin | 12 | | | |
| Lihat Jadwal Sidang | 4 | | | |
| Profil dan Logout | 6 | | | |
| Notifikasi WhatsApp | 4 | | | |
| Responsif | 4 | | | |
| **Total** | **85** | | | |

### 5.2.5 Kesimpulan Pengujian

Berdasarkan hasil pengujian Black Box yang telah dilakukan, sistem dapat dinyatakan:

```text
[Layak / Belum Layak] digunakan karena [isi berdasarkan jumlah skenario valid dan tidak valid].
```

Apabila seluruh skenario utama menghasilkan keluaran sesuai dengan hasil yang diharapkan, maka SIMTA dapat dinyatakan telah memenuhi kebutuhan fungsional utama yang dirancang pada Bab IV.

### 5.2.6 Catatan Keterkaitan Bab IV dan Bab V

Agar Bab V konsisten dengan Bab IV, beberapa bagian Bab IV perlu diperhatikan kembali:

| Temuan dari Kode Aplikasi | Dampak ke Dokumen Bab IV |
|---------------------------|---------------------------|
| Status bimbingan pada kode terdiri dari `menunggu`, `revisi`, `acc`, `lanjut_bab`, dan `acc_sempro`. | Bab IV sebaiknya menambahkan status `acc_sempro` pada activity evaluasi dosen, sequence review bimbingan, dan rancangan koleksi Bimbingans. |
| Syarat siap sempro pada kode adalah minimal 5 bimbingan dan ACC Sempro dari masing-masing dosen pembimbing. | Bab IV sebaiknya menambahkan aturan kesiapan sempro pada kebutuhan fungsional dan alur evaluasi dosen. |
| Sistem memiliki fitur generate surat persetujuan sempro berformat DOCX. | Jika fitur ini dibahas di Bab V, Bab IV sebaiknya mencantumkan use case atau kebutuhan fungsional generate surat sempro. |
| Status jadwal pada kode mencakup `dijadwalkan`, `selesai`, dan `dibatalkan`; terdapat juga proses jadwal ulang. | Bab IV sebaiknya menyebutkan status batal dan proses jadwal ulang pada activity kelola jadwal sidang. |
| Halaman Jadwal Sidang Mahasiswa dan Dosen menampilkan semua jadwal dengan status Terjadwal melalui parameter `viewAll=true`. | Jika rancangan Bab IV menyatakan jadwal hanya tampil untuk user terkait, maka implementasi atau narasi Bab IV perlu disesuaikan. |
| Form ubah nama/email dan password pada halaman profil belum tersambung ke API. | Fitur ini sebaiknya tidak diklaim sebagai fitur utama yang berhasil diuji, kecuali implementasinya diperbaiki terlebih dahulu. |
