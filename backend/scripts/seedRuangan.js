/**
 * ====================================================================
 * Seed Ruangan
 * ====================================================================
 * Mengisi koleksi Ruangan dengan daftar ruangan yang sebelumnya hardcode
 * di frontend, agar data lama tetap valid setelah pindah ke database.
 *
 * Idempoten: ruangan yang sudah ada tidak diduplikasi.
 *
 * Usage:
 *   node scripts/seedRuangan.js            # dry-run
 *   node scripts/seedRuangan.js --confirm  # terapkan
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Ruangan = require('../models/Ruangan');

const MONGODB_URI = process.env.MONGODB_URI;
const isConfirmed = process.argv.slice(2).includes('--confirm');

const RUANGAN = [
    'A301', 'A302', 'A303', 'A304', 'A305', 'A306', 'A307', 'A308', 'A309',
    'A310', 'A311', 'A312', 'A313', 'A314', 'A315',
    'A401', 'A402', 'A403', 'A404', 'A405', 'A406', 'A407', 'A408', 'A409',
    'A410', 'A411', 'A412', 'A413', 'A414',
    'B301', 'B302', 'B303', 'B304', 'B305', 'B306', 'B307', 'B308', 'B309'
];

async function run() {
    console.log(isConfirmed
        ? '⚠️  MODE: CONFIRM - data akan ditulis'
        : '🔍 MODE: DRY-RUN (tambahkan --confirm untuk menerapkan)');
    console.log('');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB\n');

    const existing = new Set((await Ruangan.find().select('nama')).map(r => r.nama));
    const perluTambah = RUANGAN.filter(n => !existing.has(n));

    console.log(`Total ruangan target: ${RUANGAN.length} | sudah ada: ${existing.size} | akan ditambah: ${perluTambah.length}`);
    if (perluTambah.length) console.log(`Ditambahkan: ${perluTambah.join(', ')}`);

    if (isConfirmed && perluTambah.length) {
        await Ruangan.insertMany(perluTambah.map(nama => ({ nama })));
        console.log('\n🚀 Selesai.');
    } else if (!perluTambah.length) {
        console.log('\n✅ Semua ruangan sudah ada.');
    } else {
        console.log('\n🔍 Dry-run selesai.');
    }
}

run()
    .catch((e) => console.error('❌ Error:', e))
    .finally(async () => {
        await mongoose.disconnect();
        console.log('🔌 Koneksi ditutup.');
    });
