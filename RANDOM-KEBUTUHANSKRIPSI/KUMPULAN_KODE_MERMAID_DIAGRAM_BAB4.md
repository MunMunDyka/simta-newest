# Kumpulan Kode Mermaid Diagram Bab IV (Skripsi SIMTA)

Dokumen ini berisi seluruh kode Mermaid.js yang telah disesuaikan dan dikoreksi 100% sesuai dengan kode program riil (frontend, backend, Mongoose schema, dan controllers) pada repositori SIMTA.

Anda dapat menyalin kode-kode di bawah ini dan langsung menempelkannya ke **[mermaid.live](https://mermaid.live)** untuk merender diagram dalam format gambar (PNG/SVG) berkualitas tinggi.

---

## 1. Class Diagram (Gambar 4.19) - MongoDB/Mongoose Skema

```mermaid
classDiagram
  class User {
    +ObjectId _id
    +String nim_nip
    +String password
    +String name
    +String email
    +String role
    +String prodi
    +String semester
    +String judulTA
    +String currentProgress
    +String statusMahasiswa
    +ObjectId dospem_1
    +ObjectId dospem_2
    +ObjectId penguji_1
    +ObjectId penguji_2
    +String status
    +String whatsapp
    +Boolean canAccessAdmin
    +Date createdAt
    +Date updatedAt
  }

  class Bimbingan {
    +ObjectId _id
    +ObjectId mahasiswa
    +ObjectId dosen
    +String dosenType
    +String kategoriBimbingan
    +String version
    +String judul
    +String catatan
    +String fileName
    +String filePath
    +String fileSize
    +String fileOriginalName
    +String status
    +String feedback
    +Date feedbackDate
    +String feedbackFile
    +String feedbackFileName
    +String draftFeedback
    +String draftStatus
    +Boolean hasDraft
    +Date createdAt
    +Date updatedAt
  }

  class Reply {
    +ObjectId _id
    +ObjectId bimbingan
    +ObjectId sender
    +String senderRole
    +String message
    +Date createdAt
    +Date updatedAt
  }

  class Jadwal {
    +ObjectId _id
    +ObjectId mahasiswa
    +String jenisJadwal
    +Date tanggal
    +String waktuMulai
    +String waktuSelesai
    +String ruangan
    +Array penguji
    +String status
    +String hasil
    +Number nilaiSidang
    +String catatan
    +ObjectId createdBy
    +Date createdAt
    +Date updatedAt
  }

  User "1" --> "*" Bimbingan : mengirim bimbingan (Mahasiswa)
  User "1" --> "*" Bimbingan : mereview bimbingan (Dosen)
  User "1" --> "*" Reply : memposting reply
  Bimbingan "1" --> "*" Reply : memiliki komentar
  User "1" --> "*" Jadwal : mengikuti sidang (Mahasiswa)
  User "*" --> "*" Jadwal : menguji sidang (Dosen Penguji)
  Jadwal "*" --> "1" User : dibuat oleh (Admin)
```

---

## 2. Use Case Diagram (Gambar 4.2) - Penggabungan Aktor Dosen

```mermaid
graph LR
  ActorAdmin["Admin (Koordinator)"]
  ActorMhs["Mahasiswa"]
  ActorDsn["Dosen (Pembimbing/Penguji)"]

  subgraph Batasan Sistem SIMTA
    UC_Login(((Login)))
    UC_Dash(((Melihat Dashboard)))
    UC_Users(((Kelola Data User)))
    UC_Plot(((Assign Dosen Pembimbing)))
    UC_Jadwal(((Kelola Jadwal Sidang)))
    UC_Hasil(((Input Hasil & Nilai Sidang)))
    UC_Upload(((Kirim PDF Bimbingan Dospem)))
    UC_History(((Lihat Riwayat & Feedback)))
    UC_Reply(((Diskusi / Reply Komentar)))
    UC_Surat(((Unduh Surat Persetujuan Sempro)))
    UC_Revisi(((Kirim PDF Revisi ke Penguji)))
    UC_ReviewDospem(((Review Bimbingan Dospem)))
    UC_ReviewPenguji(((Review Revisi Penguji)))
    UC_AccSempro(((ACC Kesiapan Sempro)))
    UC_AccRevisi(((ACC Kelulusan Revisi Ujian)))
    UC_ViewJadwal(((Lihat Jadwal Sidang)))
  end

  ActorAdmin --- UC_Login
  ActorAdmin --- UC_Dash
  ActorAdmin --- UC_Users
  ActorAdmin --- UC_Plot
  ActorAdmin --- UC_Jadwal
  ActorAdmin --- UC_Hasil
  ActorAdmin --- UC_ViewJadwal

  ActorMhs --- UC_Login
  ActorMhs --- UC_Dash
  ActorMhs --- UC_Upload
  ActorMhs --- UC_History
  ActorMhs --- UC_Reply
  ActorMhs --- UC_Surat
  ActorMhs --- UC_Revisi
  ActorMhs --- UC_ViewJadwal

  ActorDsn --- UC_Login
  ActorDsn --- UC_Dash
  ActorDsn --- UC_History
  ActorDsn --- UC_Reply
  ActorDsn --- UC_ReviewDospem
  ActorDsn --- UC_ReviewPenguji
  ActorDsn --- UC_AccSempro
  ActorDsn --- UC_AccRevisi
  ActorDsn --- UC_ViewJadwal
```

---

## 3. Activity Diagram - Pengajuan Bimbingan Mahasiswa (Gambar 4.7)

```mermaid
graph TD
  Start([Mulai]) --> Login[Login ke Sistem]
  Login --> CheckStatus{Apakah Mahasiswa<br/>dalam Fase Revisi?}
  
  %% Jalur Fase Revisi Ujian
  CheckStatus -- Ya --> ChoosePenguji[Pilih Dosen Penguji <br/> penguji_1 / penguji_2]
  ChoosePenguji --> UploadRevisi[Unggah PDF Revisi <br/> kategoriBimbingan: revisi_sempro/semhas/sidang]
  
  %% Jalur Fase Bimbingan Biasa
  CheckStatus -- Tidak --> CheckPending{Apakah ada bimbingan<br/>status 'menunggu' di dosen ybs?}
  CheckPending -- Ya --> Block[Blokir Pengajuan Baru<br/>Tampilkan pesan antrean]
  Block --> End([Selesai])
  
  CheckPending -- Tidak --> ChooseDospem[Pilih Dosen Pembimbing <br/> dospem_1 / dospem_2]
  ChooseDospem --> UploadBimbingan[Unggah PDF Bimbingan <br/> kategoriBimbingan: bimbingan_dospem]
  
  %% Penggabungan Alur Simpan
  UploadRevisi --> SaveDoc[Sistem menyimpan berkas &<br/>generate version V1, V2, dst]
  UploadBimbingan --> SaveDoc
  SaveDoc --> SendEmail[Kirim Notifikasi Email ke Dosen]
  SendEmail --> ShowSuccess[Tampilkan Pesan Sukses]
  ShowSuccess --> End
```

---

## 4. Activity Diagram - Dosen Review Bimbingan (Gambar 4.8)

```mermaid
graph TD
  Start([Mulai]) --> OpenList[Buka Daftar Mahasiswa Bimbingan]
  OpenList --> SelectStudent[Pilih Mahasiswa & Buka Dokumen]
  SelectStudent --> CheckStatus{Apakah Status == 'menunggu'?}
  
  CheckStatus -- Tidak --> ReadOnly[Tampilkan Feedback Lama <br/> Mode View Only]
  ReadOnly --> End([Selesai])
  
  CheckStatus -- Ya --> InputFeedback[Isi Form Catatan Feedback]
  InputFeedback --> SelectReviewStatus{Pilih Status Review}
  
  SelectReviewStatus -- 'revisi' / 'acc' --> SaveFeedback[Simpan Feedback ke DB]
  
  SelectReviewStatus -- 'lanjut_bab' --> AutoProgress[Sistem otomatis menaikkan<br/>currentProgress Mahasiswa]
  AutoProgress --> SaveFeedback
  
  SelectReviewStatus -- 'acc_sempro' --> CheckMin{Apakah Jumlah Bimbingan<br/>dengan dosen ybs >= 5?}
  CheckMin -- Ya --> SaveFeedback
  CheckMin -- Tidak --> ShowError[Tampilkan Validasi Error<br/> ACC Dibatalkan]
  ShowError --> InputFeedback
  
  SaveFeedback --> SendNotification[Kirim Notifikasi Email ke Mahasiswa]
  SendNotification --> ShowSuccess[Tampilkan Sukses Review]
  ShowSuccess --> End
```

---

## 5. Sequence Diagram - Mahasiswa Upload Bimbingan (Gambar 4.15) - Lapis MVC

```mermaid
sequenceDiagram
  autonumber
  actor Mahasiswa
  participant View as BimbinganMahasiswaView
  participant Ctrl as bimbinganController.js
  participant ModelUser as User (Model)
  participant ModelBim as Bimbingan (Model)
  participant Email as emailService.js

  Mahasiswa->>View: Mengunggah berkas bimbingan PDF
  View->>Ctrl: POST /api/bimbingan (judul, dosenType, file)
  Ctrl->>ModelUser: findById(mahasiswaId)
  ModelUser-->>Ctrl: Data Mahasiswa (dospem_1, dospem_2, statusMahasiswa)
  Ctrl->>Ctrl: Pengecekan status bimbingan / revisi
  Ctrl->>ModelBim: Bimbingan.hasPendingBimbingan(mahasiswaId, dosenType)
  ModelBim-->>Ctrl: true / false (Pencegahan antrean ganda)
  alt Ada dokumen berstatus 'menunggu'
      Ctrl-->>View: 400 Bad Request (Tampilkan pesan antrean)
      View-->>Mahasiswa: Pesan error antrean ganda
  else Tidak ada antrean
      Ctrl->>ModelBim: Bimbingan.getNextVersion(mahasiswaId, dosenId)
      ModelBim-->>Ctrl: Nomor Versi Baru (V1, V2, dst)
      Ctrl->>ModelBim: create({ mahasiswaId, dosenId, version, file, status: 'menunggu' })
      ModelBim-->>Ctrl: Dokumen tersimpan
      Ctrl->>Email: notifyDosenBimbinganBaruEmail(dosenEmail, mahasiswaName, judul)
      Email-->>Ctrl: Email terkirim (non-blocking)
      Ctrl-->>View: 201 Created (Bimbingan berhasil dikirim)
      View-->>Mahasiswa: Tampilkan notifikasi sukses pengunggahan
  end
```

---

## 6. Sequence Diagram - Dosen Review Bimbingan (Gambar 4.16) - Lapis MVC

```mermaid
sequenceDiagram
  autonumber
  actor Dosen
  participant View as BimbinganDosenView
  participant Ctrl as bimbinganController.js
  participant ModelBim as Bimbingan (Model)
  participant ModelUser as User (Model)
  participant Email as emailService.js

  Dosen->>View: Membuka draf mahasiswa, mengisi feedback & status
  View->>Ctrl: PUT /api/bimbingan/:id/feedback (status, feedback, file)
  Ctrl->>ModelBim: findById(bimbinganId)
  ModelBim-->>Ctrl: Data Bimbingan
  Ctrl->>Ctrl: Verifikasi status bimbingan masih 'menunggu'
  alt Status yang dipilih adalah 'acc_sempro'
      Ctrl->>ModelBim: Bimbingan.countDocuments({ mahasiswa, dosenType })
      ModelBim-->>Ctrl: Total bimbingan (misal: 6 kali)
      Ctrl->>Ctrl: Cek total bimbingan >= 5 (lolos)
  end
  Ctrl->>ModelBim: save({ status, feedback, feedbackDate })
  ModelBim-->>Ctrl: Feedback tersimpan
  alt Status yang dipilih adalah 'lanjut_bab'
      Ctrl->>ModelUser: findByIdAndUpdate(mahasiswaId, { currentProgress: nextProgress })
      ModelUser-->>Ctrl: Progress Mahasiswa diperbarui
  end
  Ctrl->>Email: notifyMahasiswaFeedbackEmail(mahasiswaEmail, dosenName, statusText, feedback)
  Email-->>Ctrl: Email terkirim (non-blocking)
  Ctrl-->>View: 200 OK (Feedback berhasil diberikan)
  View-->>Dosen: Tampilkan konfirmasi sukses review
```
