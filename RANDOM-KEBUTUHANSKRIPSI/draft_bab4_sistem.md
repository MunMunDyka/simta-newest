BAB IV
ANALISIS DAN PERANCANGAN

Analisis Sistem
Sistem yang Sedang Berjalan

Gambar 4.1 Aliran Sistem yang Sedang Berjalan
Sistem bimbingan tugas akhir yang saat ini diterapkan di Program Studi Sistem Informasi, Fakultas Teknologi Informasi, Institut Teknologi Batam (ITEBA) masih dikelola secara konvensional. Alur bimbingan ini melibatkan interaksi antara tiga pihak, yakni Mahasiswa, Dosen Pembimbing, dan Koordinator TA.
Pada proses bimbingan, alur dimulai setelah mahasiswa mendapatkan persetujuan judul dan penetapan Dosen Pembimbing. Mahasiswa menyiapkan dokumen skripsi dan mengirimkannya kepada dosen pembimbing melalui WhatsApp atau mencetak dokumen hardcopy. Dosen pembimbing bertugas menerima dan membaca dokumen tersebut. Apabila dokumen belum sesuai, dosen akan memberikan catatan revisi baik secara lisan maupun melalui pesan WhatsApp, dan mahasiswa wajib melakukan perbaikan dokumen.
Selama proses perbaikan, mahasiswa wajib mencatat riwayat bimbingan ke dalam lembar "Form Bimbingan" fisik secara manual. Terdapat aturan bahwa mahasiswa harus melakukan bimbingan minimal 5 kali untuk masing-masing dosen pembimbing. Apabila dokumen telah sesuai dan syarat minimal bimbingan terpenuhi, dosen pembimbing akan memberikan persetujuan (ACC) dan menandatangani form bimbingan tersebut sebagai bukti kelayakan.
Pada tahap akhir, mahasiswa mencetak lembar persetujuan dan menyerahkan seluruh berkas pendaftaran beserta form bimbingan fisik kepada Koordinator TA atau pihak akademik. Pihak akademik kemudian memeriksa kelengkapan berkas untuk menentukan apakah mahasiswa dapat lanjut ke tahap penjadwalan sidang.Proses bimbingan yang masih bergantung pada pencatatan form fisik yang rentan hilang, serta komunikasi revisi via WhatsApp yang sering tertumpuk ini kerap menghambat kelancaran tugas akhir. Oleh karena itu, diperlukan sebuah pengembangan sistem manajemen tugas akhir berbasis web yang terintegrasi untuk optimalisasi proses bimbingan.

Sistem yang diusulkan
Use Case Diagram
Use Case Diagram digunakan untuk merepresentasikan fungsionalitas sistem dari sudut pandang pengguna. Diagram ini mendefinisikan batasan sistem (system boundary) serta interaksi antara aktor dengan fitur-fitur yang tersedia. Pada sistem SIMTA, teridentifikasi tiga aktor utama:
Administrator: Mengelola data induk (master data) pengguna dan melakukan plotting dosen pembimbing.
Dosen Pembimbing: Melakukan verifikasi bimbingan, mengunduh dokumen, dan memberikan umpan balik (feedback).
Mahasiswa: Melakukan pengajuan bimbingan, mengunggah dokumen revisi, dan melihat riwayat progres.

Gambar 4.1 Use Case Diagram SI Manajemen Tugas Akhir (SIMTA)
Activity Diagram
Activity Diagram menggambarkan aliran kerja (workflow) atau aktivitas operasional sistem secara prosedural. Diagram ini digunakan untuk memodelkan logika bisnis dan urutan proses yang terjadi antara pengguna dan sistem.
Activity Diagram Autentikasi Pengguna (Login) Proses autentikasi berlaku seragam untuk seluruh aktor (Administrator, Dosen, dan Mahasiswa). Pengguna diwajibkan memasukkan kredensial identitas pada halaman login. Sistem akan memvalidasi data tersebut ke basis data Users. Jika valid, sistem akan mengidentifikasi peran (role) pengguna dan mengarahkannya ke halaman dashboard yang sesuai.

Gambar 4.2 Activity Diagram Login user (Admin/Mahasiswa/Dosen)

Activity Diagram Pengelolaan Data Pengguna (Admin) Administrator memiliki wewenang penuh dalam manajemen data induk pengguna, baik pendaftaran akun baru maupun pembaruan data. Proses dimulai dengan Administrator mengisi atribut data pengguna seperti Nomor Induk (NIM/NIP), nama, dan peran (role) pada menu Kelola User. Sistem melakukan validasi integritas data untuk memastikan Nomor Induk belum terdaftar sebelumnya. Data yang valid akan disimpan ke dalam sistem dengan keamanan tambahan berupa enkripsi pada kata sandi (password encryption), sedangkan data duplikat akan ditolak oleh sistem.

Gambar 4.3 Activity Diagram Pengelolaan Data Pengguna (User)

Activity Diagram Penentuan (Plotting) Dosen Pembimbing Fitur ini memfasilitasi Administrator untuk memetakan hubungan akademik antara mahasiswa dan dosen pembimbing. Administrator memilih data mahasiswa target dan menentukan dua dosen pembimbing. Sistem menerapkan logika validasi bisnis bertingkat: memastikan target berstatus mahasiswa, pembimbing berstatus dosen, dan mencegah duplikasi personil di mana Dosen Pembimbing 1 tidak boleh sama dengan Dosen Pembimbing 2. Jika seluruh syarat terpenuhi, sistem akan memperbarui relasi data pembimbing pada record mahasiswa terkait.

Gambar 4.4 Activity Diagram Penentuan Dosen Pembimbing


Activity Diagram Pengelolaan Jadwal Sidang (Admin) Manajemen jadwal sidang tugas akhir dikelola sepenuhnya oleh Administrator melalui operasi tambah, ubah, dan hapus data. Administrator memasukkan detail pelaksanaan sidang yang meliputi identitas mahasiswa, waktu, lokasi, dan dosen penguji. Data yang tersimpan akan terdistribusi secara otomatis dan dapat diakses oleh pengguna terkait sesuai dengan batasan hak akses masing-masing.


Gambar 4.5 Activity Diagram Pengelolaan Jadwal Sidang

Activity Diagram Pengajuan Bimbingan (Mahasiswa) Mahasiswa melakukan pengajuan bimbingan dengan mengunggah dokumen skripsi (format PDF) kepada dosen yang dituju. Sistem melakukan serangkaian validasi sebelum penyimpanan: memastikan format berkas sesuai, memverifikasi status afiliasi dosen, dan melakukan pengecekan antrean (concurrency check). Sistem akan menolak pengajuan baru apabila masih terdapat dokumen dengan status "Menunggu" pada dosen yang sama. Dokumen yang lolos validasi akan disimpan dengan mekanisme penomoran versi otomatis (auto-versioning) untuk merekam riwayat revisi.

Gambar 4.6 Activity Diagram Pengajuan Bimbingan Mahasiswa
Activity Diagram Evaluasi dan Review (Dosen) Dosen pembimbing melakukan evaluasi terhadap dokumen yang diajukan dengan memberikan status kelulusan tahap (Revisi, ACC, atau Lanjut Bab) serta catatan perbaikan. Sistem memvalidasi bahwa dokumen yang dinilai berstatus "Menunggu". Fitur ini terintegrasi dengan otomatisasi progres akademik: apabila dosen memberikan status "Lanjut Bab", indikator progres mahasiswa pada basis data akan diperbarui secara otomatis ke tahapan selanjutnya (misalnya dari Bab I ke Bab II).

Gambar 4.7 Activity Diagram Evaluasi Dosen

Activity Diagram Diskusi Terstruktur (Reply) Interaksi kontekstual antara mahasiswa dan dosen difasilitasi melalui fitur komentar balasan pada setiap topik bimbingan. Sistem memvalidasi otorisasi pengirim untuk memastikan hanya pihak yang terlibat (pemilik dokumen dan pembimbing) yang dapat berdiskusi. Pesan yang dikirimkan akan disimpan dan direlasikan secara spesifik dengan ID dokumen bimbingan (One-to-Many relationship) untuk menjaga konteks percakapan.

Gambar 4.8 Activity Diagram Diskusi Bimbingan

Activity Diagram Lihat Jadwal Sidang Fitur ini menyediakan akses informasi jadwal sidang bagi Dosen dan Mahasiswa. Pengguna dapat melihat detail jadwal yang mencakup waktu, lokasi, dan penguji dalam format tabel atau kalender. Hak akses pada modul ini dibatasi hanya untuk melihat data (view only) tanpa izin untuk melakukan modifikasi data.


Gambar 4.9 Activity Diagram Lihat Jadwal Sidang

Sequence Diagram
Sequence Diagram memodelkan interaksi antar objek di dalam sistem berdasarkan urutan waktu. Diagram ini memvisualisasikan bagaimana pesan (message) dikirimkan dari satu objek ke objek lain (seperti View, Controller, dan Model) untuk menyelesaikan sebuah skenario fungsional. Berikut adalah penjabaran diagram urutan untuk fitur-fitur utama sistem:
Sequence Diagram Autentikasi Pengguna (Login) Diagram ini menggambarkan alur proses masuk ke dalam aplikasi. Aktor memulai dengan memasukkan NIP/NIM dan kata sandi pada Halaman Login. Data tersebut kemudian dikirimkan ke Sistem untuk diproses. Sistem melakukan pengecekan ketersediaan akun dan kecocokan data pada Database. Setelah data terkonfirmasi valid, Sistem memberikan hak akses dan mengarahkan pengguna ke halaman utama (Dashboard).

Gambar 4.10 Sequence Diagram Autentikasi Pengguna
Sequence Diagram Admin Kelola Data User Diagram ini memodelkan proses pendaftaran pengguna baru oleh Administrator. Administrator memasukkan data diri pengguna pada Halaman User. Sistem menerima data tersebut, melakukan enkripsi pada kata sandi demi keamanan, lalu menyimpannya ke Database. Setelah Database mengonfirmasi penyimpanan berhasil, Sistem mengirimkan notifikasi sukses yang ditampilkan kembali kepada Administrator.

Gambar 4.11 Sequence Diagram Admin Kelola Data User

Sequence Diagram Admin Plotting Dosen Pembimbing Diagram ini menunjukkan alur penetapan dosen pembimbing untuk mahasiswa. Administrator memilih data mahasiswa dan dosen pada Halaman Plotting. Sistem memproses permintaan tersebut dengan memverifikasi data mahasiswa dan dosen yang dipilih di Database. Selanjutnya, Sistem memperbarui data pembimbing pada data mahasiswa terkait di Database dan memberikan konfirmasi keberhasilan proses plotting.

Gambar 4.12 Sequence Diagram Admin Plotting Dosen Pembimbing
Sequence Diagram Admin Kelola Jadwal Sidang Diagram ini menjelaskan mekanisme penjadwalan sidang tugas akhir. Administrator memasukkan detail sidang (mahasiswa, waktu, penguji) pada Halaman Jadwal. Sistem memvalidasi data mahasiswa tersebut ke Database. Setelah validasi selesai, Sistem menyimpan data jadwal sidang baru ke Database dan menampilkan pesan sukses kepada Administrator.


Gambar 4.13 Sequence Diagram Admin Kelola Jadwal Sidang
Sequence Diagram Mahasiswa Upload Bimbingan Diagram ini memvisualisasikan pengajuan dokumen skripsi oleh mahasiswa. Mahasiswa mengisi formulir dan mengunggah berkas PDF pada Halaman Bimbingan. Sistem menerima berkas tersebut dan memastikan tidak ada antrean bimbingan sebelumnya di Database. Setelah pengecekan selesai, Sistem menyimpan data bimbingan baru dan memberikan notifikasi bahwa pengajuan berhasil dikirim.

Gambar 4.14 Sequence Diagram Mahasiswa Upload Bimbingan
Sequence Diagram Dosen Review Bimbingan Diagram ini merepresentasikan proses pemberian evaluasi oleh dosen. Dosen memilih bimbingan dan memberikan catatan perbaikan pada Halaman Review. Sistem memproses data tersebut dengan memperbarui status bimbingan serta progres akademik mahasiswa di Database. Setelah pembaruan data tersimpan, Sistem menampilkan pesan konfirmasi kepada Dosen.

Gambar 4.15 Sequence Diagram Dosen Review Bimbingan

Sequence Diagram Diskusi Reply Komentar Diagram ini menggambarkan alur komunikasi antara pengguna dalam fitur diskusi. Pengguna mengetik dan mengirimkan pesan melalui Halaman Detail. Sistem memproses pesan tersebut dan menyimpannya ke dalam Database. Setelah data tersimpan, Sistem memperbarui tampilan pada Halaman Detail sehingga pesan baru dapat dilihat oleh pengguna.



Gambar 4.16 Sequence Diagram Diskusi Reply Komentar
Sequence Diagram Lihat Jadwal Sidang Diagram terakhir ini menunjukkan mekanisme pengambilan informasi jadwal sidang. Pengguna mengakses menu pada Halaman Jadwal, yang kemudian mengirimkan permintaan data ke Sistem. Sistem mengambil daftar jadwal sidang yang tersimpan di Database. Data yang diperoleh kemudian dikirimkan kembali oleh Sistem untuk ditampilkan dalam bentuk tabel informasi kepada pengguna.

Gambar 4.17 Sequence Diagram Lihat Jadwal Sidang
Class Diagram
Class Diagram menggambarkan struktur statis sistem dengan mendefinisikan kelas-kelas yang akan dibuat, atribut yang dimiliki, serta hubungan (relationship) antar kelas tersebut. Diagram ini memetakan struktur data yang digunakan dalam aplikasi untuk mendukung seluruh fungsionalitas sistem. Berikut adalah rancangan Class Diagram untuk sistem yang diusulkan:

Gambar 4.18 Class Diagram SIMTA

Analisis Kebutuhan Sistem
Analisis Kebutuhan Fungsional
Analisis kebutuhan fungsional mendeskripsikan spesifikasi layanan, proses, dan fungsi operasional yang wajib disediakan oleh sistem untuk mendukung aktivitas pengguna. Identifikasi kebutuhan ini disusun guna memastikan bahwa setiap interaksi sistem selaras dengan tujuan pengembangan aplikasi. Berdasarkan perancangan fitur yang telah dilakukan, rincian kebutuhan fungsional dikelompokkan secara spesifik berdasarkan hak akses aktor sebagai berikut:
Kebutuhan Fungsional Administrator Tabel berikut menjabarkan kebutuhan fungsional untuk pengguna dengan hak akses Administrator.

Tabel 4.1 Kebutuhan Fungsional Administrator
Kode Kebutuhan
Deskripsi Fungsionalitas
REQ-ADM-01
Sistem harus memfasilitasi Admin untuk melakukan autentikasi login yang aman.
REQ-ADM-02
Sistem harus memfasilitasi Admin untuk mengelola data induk (Master Data) pengguna, meliputi penambahan, perubahan, dan penonaktifan akun Dosen serta Mahasiswa.
REQ-ADM-03
Sistem harus memfasilitasi Admin untuk melakukan pemetaan (plotting) Dosen Pembimbing 1 dan Dosen Pembimbing 2 bagi setiap mahasiswa.
REQ-ADM-04
Sistem harus mampu menampilkan rekapitulasi data mahasiswa dan statistik progres bimbingan secara keseluruhan.


Kebutuhan Fungsional Dosen Pembimbing Tabel berikut menjabarkan kebutuhan fungsional untuk pengguna dengan peran Dosen Pembimbing.
Tabel 4.2 Kebutuhan Fungsional Dosen Pembimbing
Kode Kebutuhan
Deskripsi Fungsionalitas
REQ-DSN-01
Sistem harus mampu menampilkan daftar mahasiswa bimbingan beserta indikator progres (Bab) dan status terakhir (Revisi/ACC).
REQ-DSN-02
Sistem harus memfasilitasi Dosen untuk mengunduh dokumen skripsi digital (format PDF) yang diunggah mahasiswa.
REQ-DSN-03
Sistem harus menyediakan formulir evaluasi bagi Dosen untuk memberikan status keputusan (Menunggu, Revisi, ACC, Lanjut Bab) serta catatan perbaikan.
REQ-DSN-04
Sistem harus memfasilitasi Dosen untuk berinteraksi melalui kolom komentar (reply) pada setiap sesi revisi.
REQ-DSN-05
Sistem harus mengirimkan pemicu (trigger) notifikasi WhatsApp ke mahasiswa setelah Dosen mengirimkan evaluasi.


Kebutuhan Fungsional Mahasiswa Tabel berikut menjabarkan kebutuhan fungsional untuk pengguna dengan peran Mahasiswa.
Tabel 4.3 Kebutuhan Fungsional Mahasiswa
Kode Kebutuhan
Deskripsi Fungsionalitas
REQ-MHS-01
Sistem harus menampilkan informasi Dosen Pembimbing dan statistik progres akademik pada halaman Dashboard.
REQ-MHS-02
Sistem harus memfasilitasi Mahasiswa untuk mengunggah dokumen revisi, dengan validasi sistem yang mencegah pengunggahan ganda jika status sebelumnya belum diperiksa.
REQ-MHS-03
Sistem harus menampilkan riwayat (history) bimbingan secara kronologis berdasarkan versi dokumen.
REQ-MHS-04
Sistem harus memfasilitasi Mahasiswa untuk merespons umpan balik dosen melalui fitur diskusi terstruktur.


Analisis Kebutuhan Non-Fungsional
Kebutuhan non-fungsional mendefinisikan batasan layanan dan atribut kualitas sistem.
Tabel 4.4 Kebutuhan Non-Fungsional
Aspek
Deskripsi Kebutuhan
Availability
Sistem harus dapat diakses 24 jam sehari, 7 hari seminggu melalui jaringan internet untuk mendukung komunikasi asinkron.
Reliability
Sistem harus memiliki validasi input yang ketat (khususnya format file PDF) dan mencegah kegagalan integritas data saat diakses secara bersamaan.
Security
Password pengguna wajib dienkripsi menggunakan algoritma hashing (Bcrypt) dan hak akses API dibatasi menggunakan token otorisasi (JWT).
Usability
Antarmuka pengguna (User Interface) harus responsif (mobile-friendly) dan mudah dipahami oleh pengguna awam.


Perancangan Sistem
Desain Sistem
Tahapan ini memvisualisasikan rancangan antarmuka pengguna (user interface) sistem yang diusulkan. Desain disajikan dalam bentuk wireframe (low-fidelity mockup) yang berfokus pada struktur tata letak (layout), navigasi, dan interaksi elemen. Tujuan utama dari perancangan visual ini adalah untuk memastikan alur pengalaman pengguna (user experience) yang logis dan intuitif sebelum melangkah ke detail estetika grafis yang lebih mendalam.
Desain Halaman Login

Gambar 4.19 Desain Wireframe Halaman Login
Gambar 4.19 merepresentasikan rancangan antarmuka halaman autentikasi. Tata letak halaman menggunakan pendekatan split-screen, di mana sisi kiri didedikasikan untuk elemen visual identitas sistem dan pesan sambutan, sedangkan sisi kanan difokuskan pada fungsionalitas formulir.
Pengguna diwajibkan memasukkan kredensial berupa Username (NIM/NIP) dan kata sandi pada kolom yang tersedia. Desain ini juga menyertakan fitur visibility toggle pada kolom kata sandi untuk kenyamanan pengguna, opsi "Remember me" untuk menyimpan sesi login, serta tautan pemulihan akun jika pengguna lupa kata sandi. Tombol "Login" ditempatkan secara prominen di bagian bawah formulir sebagai aksi utama.
Desain Halaman Dashboard Mahasiswa

Gambar 4.20 Desain Wireframe Dashboard Mahasiswa
Gambar 4.20 menampilkan rancangan halaman dashboard utama yang diakses mahasiswa setelah berhasil masuk ke sistem. Antarmuka ini menerapkan navigasi berbasis sidebar di sebelah kiri yang memuat menu utama (Dashboard, Bimbingan, Jadwal Sidang) agar mudah diakses dari halaman mana pun.
Pada area konten utama, informasi disajikan dalam bentuk kartu-kartu (cards) informatif untuk memudahkan pembacaan sekilas. Baris atas menampilkan statistik akademik krusial seperti progres bab terakhir, status revisi, dan hitung mundur tenggat waktu (deadline). Bagian tengah memuat identitas lengkap mahasiswa dan judul Tugas Akhir yang sedang dikerjakan. Selain itu, terdapat kartu informasi Dosen Pembimbing 1 dan 2 yang dilengkapi tombol akses cepat untuk komunikasi, serta tombol aksi (Call to Action) untuk mengunggah bimbingan baru.
Desain Halaman Upload Bimbingan

Gambar 4.21 Desain Wireframe Halaman Upload Bimbingan
Gambar 4.21 mengilustrasikan antarmuka fitur inti sistem, yaitu pengajuan dokumen bimbingan. Halaman ini dirancang untuk memfasilitasi pengiriman revisi skripsi kepada dosen pembimbing.
Di bagian atas, terdapat tab selector yang memungkinkan mahasiswa memilih tujuan pengiriman dokumen, apakah untuk Dosen Pembimbing 1 atau Pembimbing 2. Formulir pengajuan terdiri dari kolom input judul bimbingan, area pengunggahan berkas (file upload) yang mendukung fitur drag-and-drop untuk dokumen PDF, serta kolom catatan tambahan opsional. Di bagian bawah halaman, disediakan tabel "Riwayat Bimbingan" yang menampilkan daftar historis pengajuan sebelumnya beserta status validasi (Menunggu, Revisi, atau ACC) untuk memudahkan pemantauan progres.

Database
Perancangan Sistem ini menggunakan basis data MongoDB yang berorientasi dokumen. Berbeda dengan basis data relasional yang menggunakan tabel, data disimpan dalam bentuk dokumen (collections) yang saling terhubung melalui referensi ObjectId. Berikut adalah spesifikasi struktur data untuk setiap koleksi:
Spesifikasi Koleksi Users Koleksi Users digunakan untuk menyimpan seluruh data pengguna aplikasi. Data Mahasiswa, Dosen, dan Admin disimpan dalam satu koleksi yang dibedakan berdasarkan atribut role.
Tabel 4.1 Spesifikasi Koleksi Users
No
Nama Field
Tipe Data
Deskripsi
1
_id
ObjectId
ID unik dokumen (Primary Key).
2
nim_nip
String
Nomor Induk (NIM/NIP) pengguna.
3
password
String
Kata sandi yang telah dienkripsi.
4
name
String
Nama lengkap pengguna.
5
email
String
Alamat email pengguna.
6
role
String
Peran akun (mahasiswa/dosen/admin).
7
prodi
String
Program studi mahasiswa.
8
semester
String
Semester aktif mahasiswa.
9
judulTA
String
Judul Tugas Akhir mahasiswa.
10
currentProgress
String
Status progres akademik terakhir.
11
dospem_1
ObjectId
ID referensi ke Dosen Pembimbing 1.
12
dospem_2
ObjectId
ID referensi ke Dosen Pembimbing 2.
13
status
String
Status aktif akun.
14
whatsapp
String
Nomor telepon pengguna.


Spesifikasi Koleksi Bimbingans Koleksi Bimbingans menyimpan data riwayat pengajuan bimbingan skripsi. Dokumen ini menghubungkan mahasiswa dengan dosen pembimbing serta menyimpan detail revisi dan fail lampiran.

Tabel 4.2 Spesifikasi Koleksi Bimbingan
No
Nama Field
Tipe Data
Deskripsi
1
_id
ObjectId
ID unik dokumen.
2
mahasiswa
ObjectId
ID referensi ke pengirim (Mahasiswa).
3
dosen
ObjectId
ID referensi ke penerima (Dosen).
4
dosenType
String
Tipe dosen (Pembimbing 1/2).
5
version
String
Versi revisi (V1, V2, dst).
6
judul
String
Judul bimbingan.
7
catatan
String
Pesan dari mahasiswa.
8
fileName
String
Nama fail dokumen.
9
filePath
String
Lokasi penyimpanan fail.
10
status
String
Status (Menunggu/Revisi/ACC).
11
feedback
String
Catatan revisi dari dosen.
12
feedbackFile
String
Fail balasan dari dosen (opsional).


Spesifikasi Koleksi Replies Koleksi Replies menyimpan data percakapan atau komentar diskusi yang terjadi di dalam sebuah sesi bimbingan tertentu.
Tabel 4.3 Spesifikasi Koleksi Replies
No
Nama Field
Tipe Data
Deskripsi
1
_id
ObjectId
ID unik dokumen.
2
bimbingan
ObjectId
ID referensi ke dokumen Bimbingan induk.
3
sender
ObjectId
ID referensi ke pengirim pesan.
4
senderRole
String
Peran pengirim (Dosen/Mahasiswa).
5
message
String
Isi pesan diskusi.


Spesifikasi Koleksi Jadwals Koleksi Jadwals menyimpan data pelaksanaan sidang tugas akhir, termasuk waktu, tempat, penguji, dan hasil penilaian sidang.
Tabel 4.4 Spesifikasi Koleksi Jadwal
No
Nama Field
Tipe Data
Deskripsi
1
_id
ObjectId
ID unik dokumen.
2
mahasiswa
ObjectId
ID referensi ke peserta sidang.
3
jenisJadwal
String
Jenis sidang (Proposal/Skripsi).
4
tanggal
Date
Tanggal pelaksanaan.
5
waktuMulai
String
Jam mulai sidang.
6
waktuSelesai
String
Jam selesai sidang.
7
ruangan
String
Tempat pelaksanaan.
8
penguji
Array
List ID Dosen Penguji.
9
status
String
Status jadwal (Dijadwalkan/Selesai).
10
hasil
String
Keputusan sidang (Lulus/Revisi).
11
nilaiSidang
Number
Nilai akhir sidang.


Flowchart
Diagram alur (Flowchart) digunakan untuk menggambarkan urutan logis dari algoritma program yang berjalan di sisi backend (server). Berbeda dengan Activity Diagram yang berfokus pada aktivitas pengguna, Flowchart menitikberatkan pada langkah-langkah prosedural, validasi data, dan percabangan logika yang dieksekusi oleh sistem menggunakan runtime Node.js dan basis data MongoDB.
Berikut adalah penjabaran algoritma untuk tiga proses krusial dalam sistem:

Flowchart Proses Login

Gambar 4.30 Flowchart Logika Validasi Login
Gambar 4.30 memvisualisasikan algoritma autentikasi pengguna. Proses dimulai saat sistem menerima input kredensial (NIM/NIP dan kata sandi). Logika validasi dilakukan secara bertingkat untuk memastikan keamanan:
Pengecekan Ketersediaan Akun: Sistem melakukan query ke koleksi Users di MongoDB. Jika data tidak ditemukan, proses dihentikan.
Validasi Status: Sistem memeriksa field status akun. Hanya akun dengan status "aktif" yang diizinkan masuk.
Verifikasi Keamanan: Jika akun valid, sistem melakukan komparasi kata sandi menggunakan algoritma hashing (bcrypt) untuk mencocokkan input dengan data terenkripsi di basis data.
Jika seluruh validasi terpenuhi, sistem akan membangkitkan JSON Web Token (JWT) sebagai kunci sesi dan mengarahkan pengguna ke halaman dashboard sesuai dengan hak akses (role) masing-masing.
Flowchart Proses Upload Bimbingan

Gambar 4.31 Flowchart Logika Upload dan Versioning Bimbingan
Gambar 4.31 menjelaskan mekanisme pengajuan bimbingan oleh mahasiswa. Alur ini dirancang dengan validasi ketat untuk menjaga integritas data akademik. Sistem melakukan validasi format berkas untuk memastikan hanya fail berekstensi PDF yang dapat diproses. Selanjutnya, sistem memeriksa relasi data untuk memastikan mahasiswa telah memiliki dosen pembimbing yang sah.
Poin krusial dalam algoritma ini adalah logika Pencegahan Redundansi. Sistem akan mengecek apakah terdapat dokumen bimbingan sebelumnya yang masih berstatus "Menunggu" (pending) pada dosen yang sama. Jika ada, sistem akan menolak pengajuan baru untuk mencegah penumpukan antrean (spamming). Apabila lolos validasi, sistem secara otomatis menghitung nomor versi dokumen (misalnya dari V1 ke V2) dan menyimpannya ke basis data.
Flowchart Proses Plotting Dosen Pembimbing

Gambar 4.32 Flowchart Logika Penetapan Dosen Pembimbing
Gambar 4.32 menggambarkan logika administratif dalam penetapan dosen pembimbing. Proses ini melibatkan validasi integritas data relasional. Saat administrator memilih mahasiswa dan dua orang dosen, sistem terlebih dahulu memverifikasi keberadaan data mahasiswa dan validitas peran (role) dari dosen yang dipilih.
Logika utama pada proses ini adalah Validasi Duplikasi, di mana sistem membandingkan ID dari Dosen Pembimbing 1 dan Dosen Pembimbing 2. Sistem akan menolak proses jika kedua pembimbing adalah orang yang sama. Jika seluruh logika terpenuhi, sistem melakukan operasi pembaruan (update) pada dokumen mahasiswa di MongoDB untuk menyimpan referensi kedua dosen pembimbing tersebut.
