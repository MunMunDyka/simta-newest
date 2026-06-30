# Audit Struktur Database SIMTA untuk Bab 4

Dokumen ini merangkum struktur database SIMTA berdasarkan schema Mongoose yang ada di folder `backend/models`.

Tujuan dokumen:

- memastikan tabel database Bab 4 sesuai dengan kode backend sebenarnya;
- menghindari penulisan field yang tidak ada di schema;
- membedakan field inti, field relasi, enum/status, dan field internal;
- menjadi bahan penjelasan struktur database pada Bab 4 skripsi.

Catatan: draft tabel Bab 4 belum dibandingkan langsung baris per baris karena tidak dilampirkan di prompt. Bagian "Kesesuaian Bab 4" di bawah dibuat sebagai checklist: field yang sebaiknya ditulis, field yang opsional, dan field yang tidak perlu ditonjolkan.

## Ringkasan Model

| Model Mongoose | Perkiraan Collection MongoDB | Fungsi Utama | Timestamps |
|---|---|---|---|
| `User` | `users` | Menyimpan data mahasiswa, dosen, dan admin | Ya |
| `Bimbingan` | `bimbingans` | Menyimpan pengajuan/upload dokumen bimbingan dan feedback dosen | Ya |
| `Reply` | `replies` | Menyimpan komentar/balasan pada thread bimbingan | Ya |
| `Jadwal` | `jadwals` | Menyimpan jadwal sidang proposal/skripsi | Ya |

Mongoose tidak mendefinisikan nama collection secara eksplisit, sehingga nama collection mengikuti default Mongoose, yaitu bentuk lowercase plural dari nama model.

## 1. Model User

File schema: `backend/models/User.js`

Collection: `users`

Fungsi: menyimpan seluruh akun pengguna sistem, yaitu mahasiswa, dosen, dan admin.

### Field User

| Field | Tipe Data | Required | Default | Keterangan |
|---|---|---:|---|---|
| `_id` | ObjectId | Ya | otomatis | Primary key MongoDB |
| `nim_nip` | String | Ya | - | Username/NIM/NIP unik untuk login |
| `password` | String | Ya | - | Password yang sudah di-hash, tidak ikut query default |
| `plainPassword` | String | Tidak | - | Field demo/internal, tidak ikut query default |
| `name` | String | Ya | - | Nama lengkap user |
| `email` | String | Tidak | - | Email user, lowercase, validasi format email |
| `role` | String | Ya | - | Role user |
| `prodi` | String | Tidak | `null` | Program studi, terutama untuk mahasiswa |
| `semester` | String | Tidak | `null` | Semester mahasiswa |
| `judulTA` | String | Tidak | `null` | Judul tugas akhir mahasiswa |
| `currentProgress` | String | Tidak | `BAB I` | Progress tugas akhir mahasiswa |
| `dospem_1` | ObjectId | Tidak | `null` | Dosen pembimbing 1 |
| `dospem_2` | ObjectId | Tidak | `null` | Dosen pembimbing 2 |
| `status` | String | Tidak | `aktif` | Status aktif/nonaktif user |
| `avatar` | String | Tidak | `null` | Path/url avatar user |
| `whatsapp` | String | Tidak | `null` | Nomor WhatsApp user |
| `createdAt` | Date | Otomatis | otomatis | Dibuat oleh `timestamps` |
| `updatedAt` | Date | Otomatis | otomatis | Dibuat oleh `timestamps` |

### Relasi ObjectId

| Field | Ref Model | Keterangan |
|---|---|---|
| `dospem_1` | `User` | Mengarah ke user dengan role dosen |
| `dospem_2` | `User` | Mengarah ke user dengan role dosen |

### Enum User

| Field | Nilai Enum |
|---|---|
| `role` | `mahasiswa`, `dosen`, `admin` |
| `currentProgress` | `BAB I`, `BAB II`, `BAB III`, `BAB IV`, `BAB V`, `Selesai` |
| `status` | `aktif`, `nonaktif` |

### Index User

| Index | Fungsi |
|---|---|
| `role` | Mempercepat query berdasarkan role |
| `status` | Mempercepat query berdasarkan status |
| `dospem_1` | Mempercepat pencarian mahasiswa bimbingan dospem 1 |
| `dospem_2` | Mempercepat pencarian mahasiswa bimbingan dospem 2 |
| `name: text` | Mendukung pencarian berdasarkan nama |

### Kesesuaian Bab 4 untuk User

Sebaiknya ditulis di Bab 4:

- `nim_nip`
- `name`
- `email`
- `role`
- `prodi`
- `semester`
- `judulTA`
- `currentProgress`
- `dospem_1`
- `dospem_2`
- `status`
- `whatsapp`
- `createdAt`
- `updatedAt`

Opsional ditulis:

- `avatar`, jika Bab 4 membahas tampilan/profil user.

Sebaiknya tidak ditonjolkan:

- `plainPassword`, karena field ini bersifat demo/internal dan sensitif.
- `password` tidak perlu ditulis sebagai password biasa. Jika ditulis, jelaskan sebagai "password terenkripsi/hashed".
- virtual `initials`, karena bukan field database tersimpan.
- method seperti `comparePassword`, `findByRole`, `findMahasiswaByDosen`, karena itu logika model, bukan struktur tabel database.

## 2. Model Bimbingan

File schema: `backend/models/Bimbingan.js`

Collection: `bimbingans`

Fungsi: menyimpan data upload/pengajuan bimbingan mahasiswa ke dosen pembimbing, termasuk dokumen, status, feedback, dan lampiran feedback.

### Field Bimbingan

| Field | Tipe Data | Required | Default | Keterangan |
|---|---|---:|---|---|
| `_id` | ObjectId | Ya | otomatis | Primary key MongoDB |
| `mahasiswa` | ObjectId | Ya | - | Mahasiswa pemilik bimbingan |
| `dosen` | ObjectId | Ya | - | Dosen pembimbing tujuan |
| `dosenType` | String | Ya | - | Menentukan dospem 1 atau dospem 2 |
| `version` | String | Ya | - | Versi dokumen, contoh `V1`, `V2` |
| `judul` | String | Ya | - | Judul bimbingan |
| `catatan` | String | Tidak | `null` | Catatan tambahan dari mahasiswa |
| `fileName` | String | Ya | - | Nama file yang disimpan server |
| `filePath` | String | Ya | - | Path lokasi file |
| `fileSize` | String | Tidak | `null` | Ukuran file |
| `fileOriginalName` | String | Tidak | `null` | Nama asli file ketika diupload |
| `status` | String | Tidak | `menunggu` | Status proses bimbingan |
| `feedback` | String | Tidak | `null` | Feedback/catatan dari dosen |
| `feedbackDate` | Date | Tidak | `null` | Tanggal dosen memberi feedback |
| `feedbackFile` | String | Tidak | `null` | Path file lampiran feedback dari dosen |
| `feedbackFileName` | String | Tidak | `null` | Nama file lampiran feedback |
| `createdAt` | Date | Otomatis | otomatis | Dibuat oleh `timestamps` |
| `updatedAt` | Date | Otomatis | otomatis | Dibuat oleh `timestamps` |

### Relasi ObjectId

| Field | Ref Model | Keterangan |
|---|---|---|
| `mahasiswa` | `User` | User dengan role mahasiswa |
| `dosen` | `User` | User dengan role dosen |

### Enum Bimbingan

| Field | Nilai Enum |
|---|---|
| `dosenType` | `dospem_1`, `dospem_2` |
| `status` | `menunggu`, `revisi`, `acc`, `lanjut_bab`, `acc_sempro` |

### Index Bimbingan

| Index | Fungsi |
|---|---|
| `mahasiswa`, `dosen`, `createdAt` | Query riwayat bimbingan mahasiswa dengan dosen tertentu |
| `mahasiswa`, `dosenType`, `createdAt` | Query riwayat berdasarkan dospem 1/dospem 2 |
| `dosen`, `status`, `createdAt` | Query daftar review dosen berdasarkan status |
| `status` | Filter status bimbingan |
| `createdAt` | Sorting bimbingan terbaru |

### Virtual Bimbingan

| Virtual | Keterangan |
|---|---|
| `replies` | Relasi virtual ke model `Reply` berdasarkan field `bimbingan` |
| `statusColor` | Warna status untuk tampilan UI |
| `fileSizeFormatted` | Format ukuran file untuk tampilan |

Virtual bukan field yang tersimpan di MongoDB, jadi jangan dimasukkan sebagai kolom fisik database.

### Kesesuaian Bab 4 untuk Bimbingan

Sebaiknya ditulis di Bab 4:

- `mahasiswa`
- `dosen`
- `dosenType`
- `version`
- `judul`
- `catatan`
- `fileName`
- `filePath`
- `fileSize`
- `fileOriginalName`
- `status`
- `feedback`
- `feedbackDate`
- `feedbackFile`
- `feedbackFileName`
- `createdAt`
- `updatedAt`

Catatan penting untuk Bab 4:

- Komentar/reply tidak disimpan langsung dalam collection `Bimbingan`.
- Diskusi lanjutan disimpan di collection `Reply`.
- Status `acc_sempro` di schema masih bernama sempro, walaupun di UI bisa ditampilkan sebagai ACC Sidang. Untuk Bab 4, konsistenkan istilah. Jika menggunakan istilah sidang, beri catatan bahwa nilai database yang digunakan adalah `acc_sempro`.

Sebaiknya tidak ditulis sebagai field database:

- `replies`
- `statusColor`
- `fileSizeFormatted`
- method seperti `giveFeedback`, `getPendingReviews`, `hasPendingBimbingan`, karena bukan field database.

## 3. Model Reply

File schema: `backend/models/Reply.js`

Collection: `replies`

Fungsi: menyimpan balasan atau komentar dalam diskusi bimbingan antara mahasiswa dan dosen.

### Field Reply

| Field | Tipe Data | Required | Default | Keterangan |
|---|---|---:|---|---|
| `_id` | ObjectId | Ya | otomatis | Primary key MongoDB |
| `bimbingan` | ObjectId | Ya | - | ID bimbingan yang dikomentari |
| `sender` | ObjectId | Ya | - | User pengirim komentar |
| `senderRole` | String | Ya | - | Role pengirim |
| `message` | String | Ya | - | Isi pesan/balasan |
| `createdAt` | Date | Otomatis | otomatis | Dibuat oleh `timestamps` |
| `updatedAt` | Date | Otomatis | otomatis | Dibuat oleh `timestamps` |

### Relasi ObjectId

| Field | Ref Model | Keterangan |
|---|---|---|
| `bimbingan` | `Bimbingan` | Bimbingan yang memiliki reply |
| `sender` | `User` | Pengirim reply, bisa mahasiswa atau dosen |

### Enum Reply

| Field | Nilai Enum |
|---|---|
| `senderRole` | `mahasiswa`, `dosen` |

### Index Reply

| Index | Fungsi |
|---|---|
| `bimbingan`, `createdAt` | Mengambil reply berdasarkan bimbingan secara kronologis |
| `sender` | Mengambil reply berdasarkan pengirim |

### Virtual Reply

| Virtual | Keterangan |
|---|---|
| `formattedTime` | Format waktu untuk tampilan UI |

Virtual bukan field tersimpan di database.

### Kesesuaian Bab 4 untuk Reply

Sebaiknya ditulis di Bab 4:

- `bimbingan`
- `sender`
- `senderRole`
- `message`
- `createdAt`
- `updatedAt`

Sebaiknya tidak ditulis:

- `receiver`, karena tidak ada di schema.
- `isRead`, karena tidak ada di schema.
- `attachment`, karena reply saat ini hanya menyimpan teks.
- `formattedTime`, karena virtual untuk tampilan.

## 4. Model Jadwal

File schema: `backend/models/Jadwal.js`

Collection: `jadwals`

Fungsi: menyimpan jadwal sidang proposal atau sidang skripsi yang dikelola admin.

### Field Jadwal

| Field | Tipe Data | Required | Default | Keterangan |
|---|---|---:|---|---|
| `_id` | ObjectId | Ya | otomatis | Primary key MongoDB |
| `mahasiswa` | ObjectId | Ya | - | Mahasiswa yang dijadwalkan sidang |
| `jenisJadwal` | String | Ya | - | Jenis sidang |
| `tanggal` | Date | Ya | - | Tanggal sidang |
| `waktuMulai` | String | Ya | - | Waktu mulai format `HH:MM` |
| `waktuSelesai` | String | Tidak | `null` | Waktu selesai format `HH:MM` |
| `ruangan` | String | Tidak | `null` | Ruangan sidang |
| `penguji` | Array ObjectId | Tidak | `[]` | Daftar dosen penguji |
| `status` | String | Tidak | `dijadwalkan` | Status jadwal sidang |
| `hasil` | String | Tidak | `null` | Hasil sidang |
| `nilaiSidang` | Number | Tidak | `null` | Nilai sidang, 0 sampai 100 |
| `catatan` | String | Tidak | `null` | Catatan hasil/pembatalan |
| `createdBy` | ObjectId | Tidak | - | Admin pembuat jadwal |
| `createdAt` | Date | Otomatis | otomatis | Dibuat oleh `timestamps` |
| `updatedAt` | Date | Otomatis | otomatis | Dibuat oleh `timestamps` |

### Relasi ObjectId

| Field | Ref Model | Keterangan |
|---|---|---|
| `mahasiswa` | `User` | User dengan role mahasiswa |
| `penguji` | `User` | Array user dengan role dosen |
| `createdBy` | `User` | Admin pembuat jadwal |

### Enum Jadwal

| Field | Nilai Enum |
|---|---|
| `jenisJadwal` | `sidang_proposal`, `sidang_skripsi` |
| `status` | `dijadwalkan`, `berlangsung`, `selesai`, `dibatalkan` |
| `hasil` | `lulus`, `lulus_revisi`, `tidak_lulus`, `null` |

### Index Jadwal

| Index | Fungsi |
|---|---|
| `mahasiswa`, `jenisJadwal` | Query jadwal mahasiswa berdasarkan jenis sidang |
| `tanggal`, `status` | Query jadwal berdasarkan tanggal dan status |
| `status` | Filter status jadwal |
| `penguji` | Query jadwal berdasarkan dosen penguji |

### Virtual Jadwal

| Virtual | Keterangan |
|---|---|
| `tanggalFormatted` | Format tanggal Indonesia untuk tampilan |
| `statusColor` | Warna status untuk tampilan UI |
| `jenisJadwalDisplay` | Label jenis sidang untuk UI |

Virtual bukan field tersimpan di database.

### Kesesuaian Bab 4 untuk Jadwal

Sebaiknya ditulis di Bab 4:

- `mahasiswa`
- `jenisJadwal`
- `tanggal`
- `waktuMulai`
- `waktuSelesai`
- `ruangan`
- `penguji`
- `status`
- `hasil`
- `nilaiSidang`
- `catatan`
- `createdBy`
- `createdAt`
- `updatedAt`

Catatan:

- Jika Bab 4 fokus pada optimalisasi bimbingan, model `Jadwal` dapat dijelaskan sebagai fitur pendukung.
- Jangan menulis field seperti `periode`, `gelombang`, atau `tahunAkademik` sebagai field collection jika tidak benar-benar ada di schema `Jadwal`.

## Relasi Antar Collection

| Relasi | Bentuk Relasi | Penjelasan |
|---|---|---|
| `User.dospem_1` -> `User._id` | Many-to-one | Mahasiswa memiliki dosen pembimbing 1 |
| `User.dospem_2` -> `User._id` | Many-to-one | Mahasiswa memiliki dosen pembimbing 2 |
| `Bimbingan.mahasiswa` -> `User._id` | Many-to-one | Bimbingan dimiliki mahasiswa |
| `Bimbingan.dosen` -> `User._id` | Many-to-one | Bimbingan ditujukan ke dosen |
| `Reply.bimbingan` -> `Bimbingan._id` | Many-to-one | Banyak reply dapat berada dalam satu bimbingan |
| `Reply.sender` -> `User._id` | Many-to-one | Reply dikirim oleh user |
| `Jadwal.mahasiswa` -> `User._id` | Many-to-one | Jadwal sidang untuk mahasiswa |
| `Jadwal.penguji` -> `User._id` | Many-to-many via array | Jadwal memiliki satu atau lebih dosen penguji |
| `Jadwal.createdBy` -> `User._id` | Many-to-one | Jadwal dibuat oleh admin |

## Field yang Wajib Ada dalam Tabel Database Bab 4

Prioritas tinggi untuk Bab 4:

1. `User`
   - data akun;
   - role pengguna;
   - data akademik mahasiswa;
   - relasi dosen pembimbing.

2. `Bimbingan`
   - relasi mahasiswa dan dosen;
   - dokumen bimbingan;
   - status bimbingan;
   - feedback dosen.

3. `Reply`
   - diskusi atau balasan antara mahasiswa dan dosen.

4. `Jadwal`
   - jadwal sidang sebagai fitur pendukung.

## Field yang Sebaiknya Tidak Ditulis sebagai Kolom Database

Berikut field/fitur yang ada di kode tetapi bukan field tersimpan di database:

| Nama | Lokasi | Alasan |
|---|---|---|
| `initials` | virtual User | Hanya nilai turunan untuk avatar |
| `replies` | virtual Bimbingan | Relasi virtual, bukan field tersimpan |
| `statusColor` | virtual Bimbingan/Jadwal | Kebutuhan tampilan UI |
| `fileSizeFormatted` | virtual Bimbingan | Format tampilan ukuran file |
| `formattedTime` | virtual Reply | Format tampilan waktu |
| `tanggalFormatted` | virtual Jadwal | Format tampilan tanggal |
| `jenisJadwalDisplay` | virtual Jadwal | Label tampilan |
| `comparePassword` | method User | Fungsi model, bukan field |
| `giveFeedback` | method Bimbingan | Fungsi model, bukan field |
| `complete` / `cancel` | method Jadwal | Fungsi model, bukan field |

## Catatan Istilah untuk Bab 4

Gunakan istilah secara konsisten:

| Istilah UI/Bab 4 | Nilai Database | Catatan |
|---|---|---|
| Mahasiswa | `role: mahasiswa` | Disimpan di collection `users` |
| Dosen | `role: dosen` | Disimpan di collection `users` |
| Admin | `role: admin` | Disimpan di collection `users` |
| Dospem 1 | `dospem_1` | Ref ke `User` |
| Dospem 2 | `dospem_2` | Ref ke `User` |
| Menunggu Review | `status: menunggu` | Pada `Bimbingan` |
| Revisi | `status: revisi` | Pada `Bimbingan` |
| ACC | `status: acc` | Pada `Bimbingan` |
| Lanjut BAB | `status: lanjut_bab` | Pada `Bimbingan` |
| ACC Sempro / ACC Sidang | `status: acc_sempro` | Schema masih memakai nama `acc_sempro` |
| Sidang Proposal | `jenisJadwal: sidang_proposal` | Pada `Jadwal` |
| Sidang Skripsi | `jenisJadwal: sidang_skripsi` | Pada `Jadwal` |

## Rekomendasi Penulisan Bab 4

Untuk bagian desain database Bab 4, susunan yang disarankan:

1. Jelaskan bahwa SIMTA menggunakan MongoDB dengan Mongoose.
2. Jelaskan collection utama:
   - `users`
   - `bimbingans`
   - `replies`
   - `jadwals`
3. Tampilkan tabel struktur masing-masing collection.
4. Tampilkan relasi antar collection:
   - mahasiswa ke dospem;
   - bimbingan ke mahasiswa dan dosen;
   - reply ke bimbingan;
   - jadwal ke mahasiswa, penguji, dan admin.
5. Jangan memasukkan virtual, method, static method, index, atau field internal sebagai kolom utama database.

## Kesimpulan Audit

Struktur database SIMTA sudah mendukung alur utama sistem:

- login dan role user melalui collection `users`;
- plotting dosen pembimbing melalui `dospem_1` dan `dospem_2`;
- upload bimbingan melalui collection `bimbingans`;
- feedback/status dosen melalui field `status`, `feedback`, dan `feedbackDate`;
- diskusi lanjutan melalui collection `replies`;
- jadwal sidang melalui collection `jadwals`.

Untuk Bab 4, model paling penting adalah `User`, `Bimbingan`, dan `Reply`. Model `Jadwal` dapat dijelaskan sebagai fitur pendukung jika pembahasan utama skripsi tetap difokuskan pada optimalisasi proses bimbingan tugas akhir.
