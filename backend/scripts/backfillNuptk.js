/**
 * ====================================================================
 * Backfill NUPTK Dosen
 * ====================================================================
 * Mengisi field nuptk untuk seluruh dosen yang belum memilikinya dengan
 * nomor acak 16 digit (sementara, sampai data NUPTK resmi tersedia).
 *
 * Dosen yang sudah punya nuptk TIDAK diubah. Hanya menyentuh role dosen.
 *
 * Usage:
 *   node scripts/backfillNuptk.js            # dry-run
 *   node scripts/backfillNuptk.js --confirm  # terapkan
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;
const isConfirmed = process.argv.slice(2).includes('--confirm');

const generateRandomNuptk = () => {
    let nuptk = '';
    for (let i = 0; i < 16; i++) {
        nuptk += Math.floor(Math.random() * 10);
    }
    return nuptk;
};

async function run() {
    console.log(isConfirmed
        ? '⚠️  MODE: CONFIRM - data akan diubah'
        : '🔍 MODE: DRY-RUN - tidak ada data yang diubah (tambahkan --confirm)');
    console.log('');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB\n');

    const dosenList = await User.find({ role: 'dosen' }).select('nim_nip name nuptk');
    const perluIsi = dosenList.filter(d => !d.nuptk);

    console.log(`Total dosen: ${dosenList.length} | belum punya NUPTK: ${perluIsi.length}\n`);
    console.log('NIP        | Nama                                   | NUPTK');
    console.log('-'.repeat(72));

    for (const d of perluIsi) {
        const nuptk = generateRandomNuptk();
        console.log(`${d.nim_nip.padEnd(10)} | ${(d.name || '').slice(0, 38).padEnd(38)} | ${nuptk}`);
        if (isConfirmed) {
            d.nuptk = nuptk;
            await d.save();
        }
    }

    console.log('-'.repeat(72));
    if (perluIsi.length === 0) {
        console.log('✅ Semua dosen sudah memiliki NUPTK.');
    } else if (isConfirmed) {
        console.log(`🚀 Selesai. ${perluIsi.length} dosen diberi NUPTK acak.`);
    } else {
        console.log('🔍 Dry-run selesai. Jalankan ulang dengan --confirm untuk menerapkan.');
    }
}

run()
    .catch((e) => console.error('❌ Error:', e))
    .finally(async () => {
        await mongoose.disconnect();
        console.log('🔌 Koneksi MongoDB ditutup.');
    });
