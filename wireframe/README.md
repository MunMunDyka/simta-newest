# SIMTA Wireframe Bab 4

Project ini adalah versi wireframe low-fidelity dari beberapa halaman utama SIMTA untuk kebutuhan dokumentasi Bab 4 skripsi.

Wireframe ini berdiri sendiri dan terpisah dari aplikasi utama.

## Tujuan

Wireframe dibuat untuk membantu dokumentasi analisis dan perancangan sistem pada Bab 4, terutama untuk menjelaskan struktur UI dari alur utama SIMTA:

- Login.
- Dashboard Mahasiswa.
- Upload dan riwayat bimbingan Mahasiswa.
- Dashboard Dosen.
- Review bimbingan oleh Dosen.
- Manajemen user oleh Admin.
- Manajemen dosen dan monitoring beban kerja.
- Edit mahasiswa, status akademik, dosen pembimbing, dan dosen penguji.
- Kelola riwayat bimbingan oleh Admin.
- Laporan progress bimbingan.
- Kelola dan lihat jadwal sidang.

## Catatan Penting

- Project ini tidak memanggil API backend.
- Project ini tidak memakai data asli.
- Semua data yang tampil adalah dummy/static data.
- Tampilan sengaja dibuat hitam-putih/grayscale.
- Logo, avatar, gambar, ikon, dan area visual diganti placeholder kotak silang diagonal.
- Project ini hanya untuk kebutuhan screenshot/dokumentasi Bab 4, bukan aplikasi produksi.

## Struktur Folder

```txt
wireframe/
├── package.json
├── package-lock.json
├── index.html
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles.css
│   ├── components/
│   │   ├── PlaceholderBox.tsx
│   │   ├── WireframeCard.tsx
│   │   ├── WireframeLayout.tsx
│   │   ├── WireframeSidebar.tsx
│   │   └── WireframeTable.tsx
│   └── pages/
│       ├── WireframeDashboard.tsx
│       ├── WireframeLogin.tsx
│       ├── WireframeDashboardMahasiswa.tsx
│       ├── WireframeBimbinganMahasiswa.tsx
│       ├── WireframeDashboardDosen.tsx
│       ├── WireframeListMahasiswaBimbingan.tsx
│       ├── WireframeReviewBimbinganDosen.tsx
│       ├── WireframeDashboardAdmin.tsx
│       ├── WireframeManajemenUserAdmin.tsx
│       ├── WireframeAssignDospemAdmin.tsx
│       ├── WireframeKelolaJadwalAdmin.tsx
│       └── WireframeJadwalSidang.tsx
```

## Cara Install

Masuk ke folder project utama SIMTA, lalu masuk ke folder `wireframe`.

```bash
cd wireframe
npm install
```

## Cara Menjalankan

```bash
npm run dev
```

Setelah itu buka URL yang muncul di terminal, biasanya:

```txt
http://localhost:5173
```

Jika port `5173` sudah dipakai, Vite akan memberi port lain, misalnya `5174`.

## Cara Build

Untuk memastikan project bisa di-build:

```bash
npm run build
```

Hasil build akan masuk ke folder:

```txt
wireframe/dist/
```

Folder `dist/` tidak ikut di-commit karena hanya hasil build.

## Daftar URL Halaman Wireframe

| URL | Halaman |
|---|---|
| `/` | Dashboard Wireframe SIMTA |
| `/login` | Wireframe Login |
| `/mahasiswa/dashboard` | Wireframe Dashboard Mahasiswa |
| `/mahasiswa/bimbingan` | Wireframe Bimbingan Mahasiswa |
| `/dosen/dashboard` | Wireframe Dashboard Dosen |
| `/dosen/list-mahasiswa` | Wireframe List Mahasiswa Bimbingan |
| `/dosen/review` | Wireframe Review Bimbingan Dosen |
| `/admin/dashboard` | Wireframe Dashboard Admin |
| `/admin/manajemen-user` | Wireframe Manajemen User Admin |
| `/admin/manajemen-dosen` | Wireframe Manajemen Dosen Admin |
| `/admin/assign-dospem` | Wireframe Edit Mahasiswa & Plotting Dosen |
| `/admin/kelola-bimbingan` | Wireframe Kelola Bimbingan Admin |
| `/admin/kelola-jadwal` | Wireframe Kelola Jadwal Admin |
| `/admin/laporan` | Wireframe Laporan Progress Bimbingan |
| `/jadwal` | Wireframe Jadwal Sidang |

## Halaman yang Direkomendasikan untuk Screenshot Bab 4

Halaman utama yang paling relevan untuk dilampirkan:

1. `/login`
2. `/mahasiswa/dashboard`
3. `/mahasiswa/bimbingan`
4. `/dosen/dashboard`
5. `/dosen/review`
6. `/admin/manajemen-user`
7. `/admin/manajemen-dosen`
8. `/admin/assign-dospem`
9. `/admin/kelola-bimbingan`
10. `/admin/kelola-jadwal`
11. `/admin/laporan`
12. `/jadwal`

## Penjelasan Singkat Per Halaman

### Dashboard Wireframe

Halaman navigasi khusus untuk membuka seluruh halaman wireframe.

### Login

Menampilkan struktur login split screen seperti aplikasi SIMTA utama, dengan form username dan password.

### Dashboard Mahasiswa

Menampilkan informasi mahasiswa, judul tugas akhir, progress, status dospem 1 dan 2, total bimbingan, serta tombol menuju halaman bimbingan.

### Bimbingan Mahasiswa

Menampilkan tab Dospem 1 dan Dospem 2, riwayat bimbingan, feedback dosen, reply komentar, dan form upload dokumen bimbingan.

### Dashboard Dosen

Menampilkan greeting dosen, card ringkasan mahasiswa bimbingan, status review, dan tabel mahasiswa bimbingan.

### List Mahasiswa Bimbingan

Menampilkan daftar mahasiswa bimbingan dalam bentuk list/card, dilengkapi search dan ringkasan total mahasiswa/perlu review.

### Review Bimbingan Dosen

Menampilkan informasi mahasiswa, detail dokumen bimbingan, tombol download file, form feedback, pilihan status, upload file feedback, dan riwayat bimbingan.

### Dashboard Admin

Menampilkan ringkasan data utama seperti total mahasiswa, total dosen, data bimbingan, dan jadwal sidang.

### Manajemen User Admin

Menampilkan struktur manajemen user: filter role, search, tombol tambah user, tabel user, dan ringkasan modal tambah/edit dospem.

### Manajemen Dosen Admin

Menampilkan monitoring beban kerja dosen sebagai pembimbing dan penguji.

### Edit Mahasiswa & Plotting Dosen

Menampilkan form edit mahasiswa: informasi umum, WhatsApp, informasi akademik, progress, status akademik, dosen pembimbing, dan dosen penguji.

### Kelola Bimbingan Admin

Menampilkan pencarian mahasiswa, pengaturan target minimal bimbingan per dospem, ringkasan riwayat bimbingan, tab Dospem 1 dan Dospem 2, serta modal clear riwayat.

### Kelola Jadwal Admin

Menampilkan card statistik jadwal, filter/search, tabel jadwal, tombol hapus seluruh jadwal, form/modal pembuatan jadwal, dan modal selesai/batal/hapus jadwal.

### Laporan Progress Bimbingan

Menampilkan laporan seluruh mahasiswa berdasarkan kecukupan bimbingan per dospem, status syarat sidang, dan tombol unduh surat jika syarat terpenuhi.

### Jadwal Sidang

Menampilkan jadwal sidang dalam mode view-only dengan filter tahun, gelombang, periode, info cards, dan tabel jadwal.

## Perbedaan dengan Aplikasi Utama

| Aplikasi Utama | Project Wireframe |
|---|---|
| Menggunakan API backend | Tidak menggunakan API |
| Menggunakan data asli/database | Menggunakan dummy data |
| UI final dengan warna brand | UI low-fidelity hitam-putih |
| Ada autentikasi real | Tidak ada autentikasi |
| Untuk operasional sistem | Untuk dokumentasi Bab 4 |

## Troubleshooting

Jika `npm run dev` gagal karena dependency belum ada:

```bash
npm install
```

Jika port sudah dipakai:

```bash
npm run dev -- --port 5174
```

Jika build ingin dicek:

```bash
npm run build
```

## Ringkasan

Project `wireframe/` ini dibuat supaya halaman-halaman utama SIMTA dapat di-screenshot dalam bentuk low-fidelity wireframe untuk Bab 4. Struktur halaman mengikuti UI asli di folder `frontend/src/pages`, tetapi visualnya disederhanakan menjadi grayscale, outline, dan placeholder.
