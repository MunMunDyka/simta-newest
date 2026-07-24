/**
 * ====================================================================
 * Normalisasi Nilai Ruangan pada Jadwal
 * ====================================================================
 * Menyeragamkan field `ruangan` pada seluruh dokumen Jadwal agar sesuai
 * dengan daftar ruangan resmi pada dropdown Kelola Jadwal
 * (frontend/src/pages/Admin/KelolaJadwal.tsx -> ruanganOptions).
 *
 * Aturan normalisasi:
 *   "Ruang A301"          -> "A301"   (buang prefiks "Ruang ")
 *   "A3 - 15" / "A3-15"   -> "A315"   (rapatkan blok + nomor)
 *   "B3-05"               -> "B305"
 *   "A3 - 16"             -> "A315"   (A316 tidak ada di dropdown)
 *   "Ruang Sidang Utama"  -> "A401"   (tidak ada padanan di dropdown)
 *   nilai kosong/null     -> dibiarkan
 *
 * Nilai yang sudah valid tidak disentuh.
 *
 * Usage:
 *   node scripts/normalizeJadwalRuangan.js            # dry-run
 *   node scripts/normalizeJadwalRuangan.js --confirm  # terapkan
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
require('../models/User'); // wajib didaftarkan agar populate('mahasiswa') bekerja
const Jadwal = require('../models/Jadwal');

const MONGODB_URI = process.env.MONGODB_URI;
const isConfirmed = process.argv.slice(2).includes('--confirm');

// Daftar ruangan resmi (harus sama dengan ruanganOptions di KelolaJadwal.tsx)
const VALID_ROOMS = [
    'A301', 'A302', 'A303', 'A304', 'A305', 'A306', 'A307', 'A308', 'A309',
    'A310', 'A311', 'A312', 'A313', 'A314', 'A315',
    'A401', 'A402', 'A403', 'A404', 'A405', 'A406', 'A407', 'A408', 'A409',
    'A410', 'A411', 'A412', 'A413', 'A414',
    'B301', 'B302', 'B303', 'B304', 'B305', 'B306', 'B307', 'B308', 'B309'
];

// Pemetaan khusus untuk nilai yang tidak punya padanan langsung
const SPECIAL_MAP = {
    'RUANG SIDANG UTAMA': 'A401',
    'A316': 'A315'   // dropdown hanya sampai A315
};

/**
 * Ubah satu nilai ruangan menjadi bentuk yang valid.
 * Mengembalikan null bila tidak dapat dinormalisasi.
 */
function normalize(raw) {
    if (raw == null) return null;

    let v = String(raw).trim();
    if (!v) return null;

    // Sudah valid
    if (VALID_ROOMS.includes(v)) return v;

    const upper = v.toUpperCase();

    // Nilai khusus (dicek sebelum & sesudah perapatan)
    if (SPECIAL_MAP[upper]) return SPECIAL_MAP[upper];

    // Buang prefiks "Ruang "
    let s = upper.replace(/^RUANG\s+/, '');

    // Rapatkan pola blok + nomor: "A3 - 15", "A3-15", "A3 15" -> "A315"
    s = s.replace(/^([AB])\s*(\d)\s*[-–]?\s*(\d{1,2})$/, (m, blok, lantai, no) => {
        return `${blok}${lantai}${no.padStart(2, '0')}`;
    });

    // Buang seluruh spasi/strip sisa
    s = s.replace(/[\s-]/g, '');

    if (SPECIAL_MAP[s]) return SPECIAL_MAP[s];
    if (VALID_ROOMS.includes(s)) return s;

    return null;
}

async function run() {
    console.log(isConfirmed
        ? '⚠️  MODE: CONFIRM - data akan benar-benar diubah'
        : '🔍 MODE: DRY-RUN - tidak ada data yang diubah (tambahkan --confirm)');
    console.log('');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB\n');

    const semua = await Jadwal.find({}).populate('mahasiswa', 'nim_nip name');

    const rencana = [];      // { id, dari, ke }
    const sudahValid = [];
    const gagal = [];        // tidak bisa dinormalisasi

    for (const j of semua) {
        const asal = j.ruangan;

        if (asal == null || String(asal).trim() === '') {
            gagal.push({ j, alasan: 'ruangan kosong' });
            continue;
        }
        if (VALID_ROOMS.includes(String(asal).trim())) {
            sudahValid.push(j);
            continue;
        }

        const hasil = normalize(asal);
        if (hasil) rencana.push({ j, dari: asal, ke: hasil });
        else gagal.push({ j, alasan: 'tidak dikenali' });
    }

    // Ringkasan perubahan per pola
    const ringkas = {};
    rencana.forEach((r) => {
        const key = `${r.dari}  ->  ${r.ke}`;
        ringkas[key] = (ringkas[key] || 0) + 1;
    });

    console.log('RENCANA PERUBAHAN');
    console.log('-'.repeat(56));
    Object.entries(ringkas)
        .sort((a, b) => b[1] - a[1])
        .forEach(([k, n]) => console.log(`${String(n).padStart(3)} jadwal | ${k}`));
    console.log('-'.repeat(56));
    console.log(`Akan diubah      : ${rencana.length} jadwal`);
    console.log(`Sudah valid      : ${sudahValid.length} jadwal`);
    console.log(`Tidak dikenali   : ${gagal.length} jadwal`);

    if (gagal.length) {
        console.log('\n⚠️  Tidak dapat dinormalisasi (dibiarkan apa adanya):');
        gagal.forEach(({ j, alasan }) => {
            console.log(`   - "${j.ruangan}" (${alasan}) | ${j.mahasiswa?.nim_nip || '-'} ${j.mahasiswa?.name || ''}`);
        });
    }

    if (!isConfirmed) {
        console.log('\n🔍 Dry-run selesai. Jalankan ulang dengan --confirm untuk menerapkan.');
        return;
    }

    let n = 0;
    for (const r of rencana) {
        await Jadwal.updateOne({ _id: r.j._id }, { $set: { ruangan: r.ke } });
        n++;
    }

    console.log(`\n🚀 Selesai. ${n} jadwal diperbarui.`);

    // Verifikasi ulang
    const cek = await Jadwal.find({}).select('ruangan');
    const masihSalah = cek.filter((j) => {
        const v = j.ruangan == null ? '' : String(j.ruangan).trim();
        return v !== '' && !VALID_ROOMS.includes(v);
    });
    console.log(`Verifikasi: ${cek.length - masihSalah.length}/${cek.length} jadwal memakai ruangan valid.`);
    if (masihSalah.length) {
        const sisa = [...new Set(masihSalah.map((j) => j.ruangan))];
        console.log(`Masih di luar dropdown: ${sisa.join(', ')}`);
    }
}

run()
    .catch((e) => console.error('❌ Error:', e))
    .finally(async () => {
        await mongoose.disconnect();
        console.log('🔌 Koneksi MongoDB ditutup.');
    });
