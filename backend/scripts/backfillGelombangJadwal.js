/**
 * ====================================================================
 * Backfill Gelombang pada Jadwal (sementara)
 * ====================================================================
 * Mengisi field `gelombang` (dan `tahunAjaran`) pada Jadwal lama yang masih
 * kosong, dengan mencocokkan `tanggal` sidang ke periode Gelombang yang sudah
 * didefinisikan admin di modul Kelola Gelombang.
 *
 * Aturan: gelombang = periode (jenis sesuai) yang window tanggalnya memuat
 * tanggal sidang; bila beberapa cocok, ambil nomor terkecil.
 * Sidang Akhir (sidang_skripsi) dilewati — tidak memakai gelombang.
 * Jadwal yang tanggalnya tidak jatuh di window mana pun dibiarkan kosong.
 *
 * Usage:
 *   node scripts/backfillGelombangJadwal.js            # dry-run
 *   node scripts/backfillGelombangJadwal.js --confirm  # terapkan
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
require('../models/User'); // agar populate('mahasiswa') bekerja
const Jadwal = require('../models/Jadwal');
const Gelombang = require('../models/Gelombang');

const MONGODB_URI = process.env.MONGODB_URI;
const isConfirmed = process.argv.slice(2).includes('--confirm');

const jenisJadwalToGelombang = (jj) =>
    jj === 'sidang_proposal' ? 'seminar_proposal'
        : jj === 'sidang_semhas' ? 'seminar_hasil'
            : null;

// Cari gelombang yang cocok untuk tanggal sidang.
function matchGelombang(periods, jenisJadwal, tanggal) {
    const jenis = jenisJadwalToGelombang(jenisJadwal);
    if (!jenis || !tanggal) return null;
    const d = new Date(tanggal).getTime();
    return periods
        .filter(g => g.jenis === jenis
            && new Date(g.tanggalMulai).getTime() <= d
            && d <= new Date(g.tanggalSelesai).getTime())
        .sort((a, b) => a.nomor - b.nomor)[0] || null;
}

async function run() {
    console.log(isConfirmed
        ? '⚠️  MODE: CONFIRM - data akan benar-benar diubah'
        : '🔍 MODE: DRY-RUN - tidak ada data yang diubah (tambahkan --confirm)');
    console.log('');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB\n');

    const periods = await Gelombang.find({ isActive: true });
    console.log(`Periode gelombang aktif: ${periods.length}`);
    if (periods.length === 0) {
        console.log('⚠️  Belum ada periode gelombang. Definisikan dulu di modul Kelola Gelombang, lalu jalankan ulang.');
        return;
    }

    // Hanya jadwal seminar yang gelombangnya masih kosong.
    const semua = await Jadwal.find({
        jenisJadwal: { $in: ['sidang_proposal', 'sidang_semhas'] },
        $or: [{ gelombang: null }, { gelombang: '' }, { gelombang: { $exists: false } }]
    }).populate('mahasiswa', 'nim_nip name');

    const rencana = [];
    const tidakCocok = [];

    for (const j of semua) {
        const g = matchGelombang(periods, j.jenisJadwal, j.tanggal);
        if (g) rencana.push({ j, nomor: g.nomor, tahunAjaran: g.tahunAjaran });
        else tidakCocok.push(j);
    }

    console.log('\nRENCANA PENGISIAN');
    console.log('-'.repeat(56));
    rencana.forEach(({ j, nomor, tahunAjaran }) => {
        const tgl = new Date(j.tanggal).toISOString().slice(0, 10);
        console.log(`  ${j.jenisJadwal} ${tgl} | ${j.mahasiswa?.nim_nip || '-'} -> Gel ${nomor} (${tahunAjaran})`);
    });
    console.log('-'.repeat(56));
    console.log(`Akan diisi       : ${rencana.length} jadwal`);
    console.log(`Tidak ada window : ${tidakCocok.length} jadwal (dibiarkan kosong)`);

    if (tidakCocok.length) {
        console.log('\n⚠️  Tanggal di luar semua window gelombang (dibiarkan):');
        tidakCocok.forEach((j) => {
            const tgl = new Date(j.tanggal).toISOString().slice(0, 10);
            console.log(`   - ${j.jenisJadwal} ${tgl} | ${j.mahasiswa?.nim_nip || '-'} ${j.mahasiswa?.name || ''}`);
        });
    }

    if (!isConfirmed) {
        console.log('\n🔍 Dry-run selesai. Jalankan ulang dengan --confirm untuk menerapkan.');
        return;
    }

    let n = 0;
    for (const r of rencana) {
        await Jadwal.updateOne(
            { _id: r.j._id },
            { $set: { gelombang: String(r.nomor), tahunAjaran: r.tahunAjaran } }
        );
        n++;
    }
    console.log(`\n🚀 Selesai. ${n} jadwal diperbarui.`);
}

run()
    .catch((e) => console.error('❌ Error:', e))
    .finally(async () => {
        await mongoose.disconnect();
        console.log('🔌 Koneksi MongoDB ditutup.');
    });
