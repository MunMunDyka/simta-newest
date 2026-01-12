# 📂 Folder Templates

Folder ini untuk menyimpan template Word (.docx) yang akan digunakan untuk generate dokumen.

---

## 📄 File yang Dibutuhkan:

| Nama File | Deskripsi |
|-----------|-----------|
| `kartu_kendali_bimbingan.docx` | Template Kartu Kendali Bimbingan |

---

## 🏷️ Placeholder yang Harus Ada di Template:

Ganti data di template dengan placeholder berikut (PERSIS seperti ini, termasuk kurung kurawal):

### Header Info:
| Placeholder | Data yang Diisi |
|-------------|-----------------|
| `{nama}` | Nama Mahasiswa |
| `{nim}` | NIM Mahasiswa |
| `{judul}` | Judul Tugas Akhir |
| `{prodi}` | Program Studi |
| `{dospem1}` | Nama Dosen Pembimbing 1 |
| `{dospem2}` | Nama Dosen Pembimbing 2 |

### Tabel Bimbingan:
Untuk tabel yang berulang (setiap baris = 1 bimbingan), gunakan format ini:

```
{#bimbingan}
| {no} | {tanggal} | {permasalahan} | {saran} | {paraf} |
{/bimbingan}
```

**Keterangan:**
- `{#bimbingan}` = Awal loop (taruh di baris pertama tabel data)
- `{/bimbingan}` = Akhir loop (taruh di baris terakhir tabel data)
- `{no}` = Nomor urut bimbingan
- `{tanggal}` = Tanggal bimbingan
- `{permasalahan}` = Catatan/masalah dari mahasiswa
- `{saran}` = Feedback/saran dari dosen
- `{paraf}` = Inisial nama dosen

---

## 📝 Contoh Template:

```
╔═══════════════════════════════════════════════════════════════╗
║  [LOGO ITEBA]                                                 ║
║                                                               ║
║         KARTU KENDALI BIMBINGAN SEMINAR PROPOSAL              ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Nama Mahasiswa      : {nama}                                 ║
║  NIM                 : {nim}                                  ║
║  Program Studi       : {prodi}                                ║
║  Judul Tugas Akhir   : {judul}                                ║
║  Dosen Pembimbing 1  : {dospem1}                              ║
║  Dosen Pembimbing 2  : {dospem2}                              ║
║                                                               ║
╠════╤════════════════╤════════════════╤════════════════╤═══════╣
║ No │ Hari/Tanggal   │ Permasalahan   │ Saran          │ Paraf ║
╠════╪════════════════╪════════════════╪════════════════╪═══════╣
║ {#bimbingan}                                                  ║
║ {no}│ {tanggal}     │ {permasalahan} │ {saran}        │{paraf}║
║ {/bimbingan}                                                  ║
╚════╧════════════════╧════════════════╧════════════════╧═══════╝

Catatan:
1. Bimbingan skripsi minimal dilaksanakan 5 kali.
2. Kartu bimbingan wajib ditanda tangani oleh dosen pembimbing.
```

---

## ⚠️ Penting:

1. **Jangan ubah placeholder** - Harus persis seperti di atas
2. **Logo boleh tetap** - Tidak perlu diganti placeholder
3. **Format tabel** - Bisa pakai tabel Word biasa
4. **Save as .docx** - Jangan .doc (versi lama)

---

## 🚀 Setelah Template Siap:

1. Simpan file dengan nama `kartu_kendali_bimbingan.docx`
2. Taruh di folder ini (`backend/templates/`)
3. Jalankan sistem untuk test generate
