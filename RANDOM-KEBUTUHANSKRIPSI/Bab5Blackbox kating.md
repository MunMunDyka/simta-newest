5.2 Pengujian Sistem
5.2.1 Perancangan Pengujian Sistem

Sebelum melakukan tahap pengujian sistem, penulis terlebih dahulu
menyusun perancangan pengujian untuk memastikan bahwa seluruh
komponen dan fungsi sistem yang telah dikembangkan berjalan sesuai
dengan spesifikasi kebutuhan yang telah ditetapkan. Tujuan dari
perancangan ini adalah agar proses pengujian dapat dilakukan secara
sistematis dan terstruktur, serta membantu menghindari pengujian yang
berulang-ulang atau tidak diperlukan.

Tabel 5. 1 Perancangan Pengujian Sistem

Kelas Uji Detail Pengujian Jenis Pengujian
Registrasi User Uji registrasi dengan
memasukkan beberapa data

Black Box

117

untuk pengguna yang baru
pertama kali menggunakan
aplikasi.

Login User Uji login dengan memasukkan
username dan passwoard, dan
memastikan pengguna dapat
masuk ke halaman dashboard
atau home.

Black Box

Kelola Wisata Menambah Wisata Black Box
Mengedit Wisata Black Box
Menghapus Wisata Black Box
Kelola Kategori Menambah Kategori Black Box
Mengedit Kategori Black Box
Menghapus Kategori Black Box
Kelola Testimoni Menghaspus Testimoni Black Box
Kelola Pengguna Hapus Pengguna Black Box
Nonaktifkan Pengguna Black Box
Aktifkan Pengguna Black Box

Beri Testimoni Pengujian dilakukan untuk
memastikan pengguna dapat
memberikan testimoni terhadap
pengalaman berwisata mereka,
serta memastikan input
tersimpan dan ditampilkan
dengan benar.

Black Box

Edit Profile Pengujian dilakukan untuk
memastikan bahwa pengguna
dapat mengedit data pribadi
mereka, serta memastikan data
tersimpan dan ditampilkan
dengan benar.

Black Box

Logout user Memastikan button log out dapat
berfungsi dengan baik.

Black Box

118

Evaluasi Sistem
terhadap kepuasan
pengguna.

Mengukur tingkat kepuasan
pengguna terhadap sistem dan
memastikan sistem sudah sesuai
dengan kebutuhan pengguna.

User Satisfaction
Index (USI)

Evaluasi sistem
terhadap usability
pengguna.

Mengukur tingkat usability
sistem saat digunakan oleh
pengguna akhir.

System Usability
Scale (SUS)

5.2.2 Hasil Pengujian Sistem Menggunakan Metode Black Box
5.2.2.1 Hasil Pengujian Sistem Menggunakan Metode Black Box
Hasil pengujian fungsionalitas sistem menggunakan metode Black Box
menunjukkan bahwa semua fitur telah berjalan sesuai dengan yang
diharapkan berdasarkan kebutuhan sistem. Pengujian dilakukan dengan
memberikan berbagai input pada setiap fitur dan memastikan output yang
dihasilkan sesuai dengan perancangan yang telah ditetapkan. Hasil pengujian
disajikan dalam tabel berikut:

Tabel 5. 2 Pengujian Sistem Halaman Registrasi User
Black Box Testing Halaman Registrasi User

Skenario Test Case

Hasil yang
Diharapkan

Hasil yang
Didapatkan

Keterangan

Mengkosongkan
semua data
registrasi, lalu
klik button
"Daftar"

Registrasi Menampilkan
"Mohon
lengkapi semua
data"

Menampilkan
"Mohon
lengkapi
semua data"

Valid

Mengisi semua
data registrasi,
lalu klik tombol
"Daftar"

Registrasi Menampilkan
"Registrasi
Berhasil" dan
akan diarahkan
ke Halaman
Login

Menampilkan
"Registrasi
Berhasil" dan
akan diarahkan
ke Halaman
Login

Valid

119

Tabel 5. 3 Pengujian Sistem Halaman Login User
Black Box Testing Halaman Login User

Skenario Test Case

Hasil yang
Diharapkan

Hasil yang
Didapatkan

Keterangan

Kosongkan
email dan
password, lalu
klik tombol
"Login"

Login Menampilkan
"Mohon
lengkapi email
dan password"

Menampilkan
"Mohon
lengkapi email
dan password"

Valid

Mengisi email
dan password,
lalu klik
tombol
"Login"

Login Menampilkan
"Login Berhasil"
dan akan
diarahkan ke
Halaman Home

Menampilkan
"Login Berhasil"
dan akan
diarahkan ke
Halaman Home

Valid

Tabel 5. 4 Pengujian Sistem Halaman Kelola Wisata
Black Box Testing Halaman Kelola Wisata

Skenario Test Case

Hasil yang
Diharapkan

Hasil yang
Didapatkan

Keterangan

Klik Button
Tambah Wisata

Button
Tambah
Wisata

Menampilkan
form Tambah
Wisata

Menampilkan
form Tambah
Wisata

Valid

Mengkosongkan
form Tambah
Wisata

Form
Tambah,
Button
Simpan

Menampilkan
alert "Mohon
Lengkapi Data
Wisata"

Menampilkan
alert "Mohon
Lengkapi Data
Wisata"

Valid

Mengisi form
Tambah Wisata

Form
Tambah,
Button
Simpan

Menampilkan
alert "Wisata
berhasil
ditambahkan!"

Menampilkan
alert "Wisata
berhasil
ditambahkan!"

Valid

Klik Button Edit Button Edit Menampilan
form Edit
Wisata

Menampilan
form Edit
Wisata

Valid

120

Melakukan
perubahan Data
Wisata

Form Edit,
Button
Simpan

Menampilkan
alert "Wisata
berhasil
diperbarui!"

Menampilkan
alert "Wisata
berhasil
diperbarui!"

Valid

Form Edit
Wisata, Klik
Button Batal

Form Edit,
Button
Batal

Kembali ke
halaman Data
Wisata

Kembali ke
halaman Data
Wisata

Valid

Klik Button
Hapus

Button
Hapus

Menampilkan
Pop-up
Konfirmasi

Menampilkan
Pop-up
Konfirmasi

Valid

Pop-up
Konfirmasi,
Klik Button
Hapus

Pop-up
Konfirmasi,
Button
Hapus

Menampilkan
alert "Wisata
berhasil
dihapus!"

Menampilkan
alert "Wisata
berhasil
dihapus!"

Valid

Pop-up
Konfirmasi,
Klik Button
Batal

Pop-up
Konfirmasi,
Button
Batal

Kembali ke
halaman Data
Wisata

Kembali ke
halaman Data
Wisata

Valid

Tabel 5. 5 Pengujian Sistem Halaman Kelola Kategori
Black Box Testing Halaman Kelola Kategori

Skenario Test Case

Hasil yang
Diharapkan

Hasil yang
Didapatkan

Keterangan

Klik Button
Tambah
Kategori

Button
Tambah
Kategori

Menampilkan
form Tambah
Kategori

Menampilkan
form Tambah
Kategori

Valid

Mengkosongkan
form Tambah
Wisata

Form
Tambah,
Button
Simpan

Menampilkan
alert "Mohon
Lengkapi Data
Kategori"

Menampilkan
alert "Mohon
Lengkapi Data
Kategori"

Valid

Mengisi form
Tambah Wisata

Form
Tambah,

Menampilkan
alert "Kategori

Menampilkan
alert "Kategori
Valid

121

Button
Simpan

berhasil
ditambahkan!"

berhasil
ditambahkan!"

Klik Button Edit Button Edit Menampilan
form Edit
Kategori

Menampilan
form Edit
Kategori

Valid

Melakukan
perubahan Data
Kategori

Form Edit,
Button
Simpan

Menampilkan
alert "Kategori
berhasil
diperbarui!"

Menampilkan
alert "Kategori
berhasil
diperbarui!"

Valid

Form Edit
Kategori, Klik
Button Batal

Form Edit,
Button
Batal

Kembali ke
halaman Data
Kategori

Kembali ke
halaman Data
Kategori

Valid

Klik Button
Hapus

Button
Hapus

Menampilkan
Pop-up
Konfirmasi

Menampilkan
Pop-up
Konfirmasi

Valid

Pop-up
Konfirmasi,
Klik Button
Hapus

Pop-up
Konfirmasi,
Button
Hapus

Menampilkan
alert "Kategori
berhasil
dihapus!"

Menampilkan
alert "Kategori
berhasil
dihapus!"

Valid

Pop-up
Konfirmasi,
Klik Button
Batal

Pop-up
Konfirmasi,
Button
Batal

Kembali ke
halaman Data
Kategori

Kembali ke
halaman Data
Kategori

Valid

Tabel 5. 6 Pengujian Sistem Halaman Kelola Testimoni
Black Box Testing Halaman Kelola Testimoni

Skenario Test Case

Hasil yang
Diharapkan

Hasil yang
Didapatkan

Keterangan

Klik Button
Hapus

Button
Hapus

Menampilkan
Pop-up
Konfirmasi

Menampilkan
Pop-up
Konfirmasi

Valid

Pop-up
Konfirmasi,

Pop-up
Konfirmasi,

Menampilkan
alert "Testimoni

Menampilkan
alert "Testimoni

Valid

122

Klik Button
Hapus

Button
Hapus

berhasil
dihapus!"

berhasil
dihapus!"

Pop-up
Konfirmasi,
Klik Button
Batal

Pop-up
Konfirmasi,
Button
Batal

Kembali ke
halaman Data
Testimoni

Kembali ke
halaman Data
Testimoni

Valid

Tabel 5. 7 Pengujian Sistem Halaman Kelola Pengguna
Black Box Testing Halaman Kelola Pengguna

Skenario Test Case

Hasil yang
Diharapkan

Hasil yang
Didapatkan

Keterangan

Klik Button
Nonaktifkan
Pengguna

Button
Nonaktifkan
Pengguna

Menampilkan
Pop-up
Konfirmasi

Menampilkan
Pop-up
Konfirmasi

Valid

Pop-up
Konfirmasi,
Klik Button
Nonaktifkan

Pop-up
Konfirmasi,
Button
Nonaktifkan

Menampilkan
alert "Akun
pengguna
berhasil
dinonaktifkan!
"

Menampilkan
alert "Akun
pengguna
berhasil
dinonaktifkan!"

Valid

Klik Button
Aktifkan
Pengguna

Button
Aktifkan
Pengguna

Menampilkan
Pop-up
Konfirmasi

Menampilkan
Pop-up
Konfirmasi

Valid

Pop-up
Konfirmasi,
Klik Button
Aktifkan

Pop-up
Konfirmasi,
Button
Aktifkan

Menampilkan
alert "Akun
pengguna
berhasil
diaktifkan
kembali!"

Menampilkan
alert "Akun
pengguna
berhasil
diaktifkan
kembali!"

Valid

Klik Button
Hapus

Button
Hapus

Menampilkan
Pop-up
Konfirmasi

Menampilkan
Pop-up
Konfirmasi

Valid

123

Pop-up
Konfirmasi,
Klik Button
Hapus

Pop-up
Konfirmasi,
Button
Hapus

Menampilkan
alert
"Pengguna
berhasil
dihapus!"

Menampilkan
alert "Pengguna
berhasil
dihapus!"

Valid

Pop-up
Konfirmasi,
Klik Button
Batal

Pop-up
Konfirmasi,
Button Batal

Kembali ke
halaman Data
Testimoni

Kembali ke
halaman Data
Testimoni

Valid

Tabel 5. 8 Pengujian Sistem Halaman Beri Testimoni

Black Box Testing Beri Testimoni

Skenario Test Case

Hasil yang
Diharapkan

Hasil yang
Didapatkan

Keterangan

Klik Button
Beri
Testimoni

Button Beri
Testimoni

Menampilkan
form Testimoni

Menampilkan
form Testimoni Valid

Mengkosong
kan form
Testimoni

Form
Testimoni,
Button
Simpan

Menampilkan
alert "Mohon
lengkapi rating
dan ulasan"

Menampilkan
alert "Mohon
lengkapi rating
dan ulasan"

Valid

Mengisi form
Testimoni

Form
Testimoni,
Button
Simpan

Menampilkan
alert "Testimoni
berhasil
dikirim!"

Menampilkan
alert "Testimoni
berhasil
dikirim!"

Valid

Tabel 5. 9 Pengujian Sistem Halaman Edit Profile

Black Box Testing Edit Profile

Skenario Test Case

Hasil yang
Diharapkan

Hasil yang
Didapatkan

Keterangan

Klik Button
Edit Profile

Button Edit
Profile

Menampilkan
form Edit
Profile

Menampilkan
form Edit
Profile

Valid

124

Melakukan
perubahan
Data Profile

Form Edit
Profile,
Button
Simpan

Menampilkan
alert "Profile
berhasil
diperbarui!"

Menampilkan
alert "Profile
berhasil
diperbarui!"

Valid

Tabel 5. 10 Pengujian Sistem Halaman Logout User

Black Box Testing Logout User

Skenario Test Case

Hasil yang
Diharapkan

Hasil yang
Didapatkan

Keterangan

Klik Button
Logout

Button
Logout

Menampilkan
pop-up
konfirmasi

Menampilkan
pop-up
konfirmasi

Valid

Pop-up
Konfirmasi,
klik Button
Keluar

Pop-up
Konfirmasi,
Button
Keluar

Pengguna akan
diarahkan ke
Halaman Login

Pengguna akan
diarahkan ke
Halaman Login

Valid

5.2.2.2 Bukti Hasil Pengujian Sistem Menggunakan Metode Black Box
Sebagai pelengkap dari hasil pengujian yang telah disajikan
sebelumnya, pada bagian ini disajikan bukti dokumentasi visual dari proses
pengujian sistem menggunakan metode Black Box. Bukti ini bertujuan untuk
memperkuat validitas hasil pengujian dengan menunjukkan bahwa setiap
fitur telah diuji secara langsung dan menghasilkan keluaran sesuai dengan
spesifikasi sistem. Dokumentasi pengujian ditampilkan pada tabel berikut:
Tabel 5. 11 Bukti Hasil Pengujian Sistem Halaman Registrasi User

Black Box Testing Halaman Registrasi User

Skenario Test Case

Hasil yang
Diharapkan

Bukti

Mengkosongkan
semua data
registrasi, lalu

Registrasi Menampilkan
"Mohon

125

klik button
"Daftar"

lengkapi
semua data"

Mengisi semua
data registrasi,
lalu klik tombol
"Daftar"

Registrasi Menampilkan
"Registrasi
Berhasil" dan
akan diarahkan
ke Halaman
Login

Tabel 5. 12 Bukti Hasil Pengujian Sistem Halaman Login User

Black Box Testing Halaman Login User

Skenario Test Case

Hasil yang
Diharapkan

Bukti

Kosongkan
email dan
password, lalu
klik tombol
"Login"

Login Menampilkan
"Mohon isi
email dan
password"

Mengisi email
dan password,
lalu klik
tombol
"Login"

Login Menampilkan
"Login Berhasil"
dan akan
diarahkan ke
Halaman Home
/Dashboard

Tabel 5. 13 Bukti Hasil Pengujian Sistem Halaman Kelola Wisata

Black Box Testing Halaman Kelola Wisata

Skenario Test Case

Hasil yang
Diharapkan

Bukti

126

Klik Button
Tambah Wisata

Button
Tambah
Wisata

Menampilkan
form Tambah
Wisata

Mengkosongkan
form Tambah
Wisata

Form
Tambah,
Button
Simpan

Menampilkan
alert "Mohon
Lengkapi Data
Wisata"

Mengisi form
Tambah Wisata

Form
Tambah,
Button
Simpan

Menampilkan
alert "Wisata
berhasil
ditambahkan!"
Klik Button Edit Button Edit Menampilan
form Edit
Wisata

Melakukan
perubahan Data
Wisata

Form Edit,
Button
Simpan

Menampilkan
alert "Wisata
berhasil
diperbarui!"

Form Edit
Wisata, Klik
Button Batal

Form Edit,
Button
Batal

Kembali ke
halaman Data
Wisata

Klik Button
Hapus

Button
Hapus

Menampilkan
Pop-up
Konfirmasi

127

Pop-up
Konfirmasi,
Klik Button
Hapus

Pop-up
Konfirmasi,
Button
Hapus

Menampilkan
alert "Wisata
berhasil
dihapus!"

Pop-up
Konfirmasi,
Klik Button
Batal

Pop-up
Konfirmasi,
Button
Batal

Kembali ke
halaman Data
Wisata

Tabel 5. 14 Bukti Hasil Pengujian Sistem Halaman Kelola Kategori

Black Box Testing Halaman Kelola Kategori

Skenario Test Case

Hasil yang
Diharapkan

Bukti

Klik Button
Tambah
Kategori

Button
Tambah
Kategori

Menampilkan
form Tambah
Kategori

Mengkosongkan
form Tambah
Wisata

Form
Tambah,
Button
Simpan

Menampilkan
alert "Mohon
Lengkapi Data
Kategori"

Mengisi form
Tambah Wisata

Form
Tambah,
Button
Simpan

Menampilkan
alert "Kategori
berhasil
ditambahkan!"
Klik Button Edit Button Edit Menampilan
form Edit
Kategori

128

Melakukan
perubahan Data
Kategori

Form Edit,
Button
Simpan

Menampilkan
alert "Kategori
berhasil
diperbarui!"

Form Edit
Kategori, Klik
Button Batal

Form Edit,
Button
Batal

Kembali ke
halaman Data
Kategori

Klik Button
Hapus

Button
Hapus

Menampilkan
Pop-up
Konfirmasi

Pop-up
Konfirmasi,
Klik Button
Hapus

Pop-up
Konfirmasi,
Button
Hapus

Menampilkan
alert "Kategori
berhasil
dihapus!"

Pop-up
Konfirmasi,
Klik Button
Batal

Pop-up
Konfirmasi,
Button
Batal

Kembali ke
halaman Data
Kategori

Tabel 5. 15 Bukti Hasil Pengujian Sistem Halaman Kelola Testimoni

Black Box Testing Halaman Kelola Testimoni

Skenario Test Case

Hasil yang
Diharapkan

Hasil yang Didapatkan

Klik Button
Hapus

Button
Hapus

Menampilkan
Pop-up
Konfirmasi

129

Pop-up
Konfirmasi,
Klik Button
Hapus

Pop-up
Konfirmasi,
Button
Hapus

Menampilkan
alert "Testimoni
berhasil
dihapus!"

Pop-up
Konfirmasi,
Klik Button
Batal

Pop-up
Konfirmasi,
Button
Batal

Kembali ke
halaman Data
Testimoni

Tabel 5. 16 Bukti Hasil Pengujian Sistem Halaman Kelola Pengguna

Black Box Testing Halaman Kelola Pengguna

Skenario Test Case

Hasil yang
Diharapkan

Bukti

Klik Button
Nonaktifkan
Pengguna

Button
Nonaktifkan
Pengguna

Menampilkan
Pop-up
Konfirmasi

Pop-up
Konfirmasi,
Klik Button
Nonaktifkan

Pop-up
Konfirmasi,
Button
Nonaktifkan

Menampilkan
alert "Akun
pengguna
berhasil
dinonaktifkan!
"

Klik Button
Aktifkan
Pengguna

Button
Aktifkan
Pengguna

Menampilkan
Pop-up
Konfirmasi

Pop-up
Konfirmasi,

Pop-up
Konfirmasi,

Menampilkan
alert "Akun
pengguna

130

Klik Button
Aktifkan

Button
Aktifkan

berhasil
diaktifkan
kembali!"

Klik Button
Hapus

Button
Hapus

Menampilkan
Pop-up
Konfirmasi

Pop-up
Konfirmasi,
Klik Button
Hapus

Pop-up
Konfirmasi,
Button
Hapus

Menampilkan
alert
"Pengguna
berhasil
dihapus!"

Pop-up
Konfirmasi,
Klik Button
Batal

Pop-up
Konfirmasi,
Button Batal

Kembali ke
halaman Data
Pengguna

Tabel 5. 17 Bukti Hasil Pengujian Sistem Halaman Beri Testimoni

Black Box Testing Beri Testimoni

Skenario Test Case

Hasil yang
Diharapkan

Bukti

Klik Button
Beri
Testimoni

Button Beri
Testimoni

Menampilkan
form Testimoni

131

Mengkosong
kan form
Testimoni

Form
Testimoni,
Button
Simpan

Menampilkan
alert "Mohon
lengkapi rating
dan ulasan"

Mengisi form
Testimoni

Form
Testimoni,
Button
Simpan

Menampilkan
alert "Testimoni
berhasil
dikirim!"

Tabel 5. 18 Bukti Hasil Pengujian Sistem Halaman Edit Profile

Black Box Testing Edit Profile

Skenario Test Case

Hasil yang
Diharapkan

Bukti

Klik Button
Edit Profile

Button Edit
Profile

Menampilkan
form Edit
Profile

Melakukan
perubahan
Data Profile

Form Edit
Profile,
Button
Simpan

Menampilkan
alert "Profile
berhasil
diperbarui!"

Tabel 5. 19 Bukti Hasil Pengujian Sistem Halaman Logout User

Black Box Testing Logout User

Skenario Test Case

Hasil yang
Diharapkan

Bukti

132

Klik Button
Logout

Button
Logout

Menampilkan
pop-up
konfirmasi

Pop-up
Konfirmasi,
klik Button
Keluar

Pop-up
Konfirmasi,
Button
Keluar

Pengguna akan
diarahkan ke
Halaman Login