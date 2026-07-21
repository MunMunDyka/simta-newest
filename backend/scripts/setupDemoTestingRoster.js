/**
 * ====================================================================
 * Setup Demo Testing Roster
 * ====================================================================
 * Menyiapkan roster akun testing SIMTA: satu mahasiswa mewakili tiap
 * fase akademik, semuanya diplot ke SATU set dosen yang sama supaya
 * pengujian cukup memakai 4 akun dosen + 1 admin.
 *
 * Untuk setiap mahasiswa roster:
 * - Set statusMahasiswa & currentProgress sesuai fase target
 * - Set dospem_1 / dospem_2 ke dosen roster
 * - Set penguji_1 / penguji_2 ke dosen roster (hanya untuk fase yang
 *   memang sudah melewati sidang; fase awal dikosongkan)
 * - REMAP riwayat: field `dosen` pada Bimbingan disesuaikan mengikuti
 *   `dosenType`, dan array `penguji` pada Jadwal disesuaikan, agar
 *   riwayat lama tetap konsisten dengan plotting baru
 *
 * TIDAK diubah: nama, NIM, email, password, judul TA, dan seluruh
 * mahasiswa di luar roster.
 *
 * Usage:
 *   node scripts/setupDemoTestingRoster.js            # dry-run (aman)
 *   node scripts/setupDemoTestingRoster.js --confirm  # eksekusi
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Bimbingan = require('../models/Bimbingan');
const Jadwal = require('../models/Jadwal');

const MONGODB_URI = process.env.MONGODB_URI;

const isConfirmed = process.argv.slice(2).includes('--confirm');

// ===== Dosen roster (NIP) =====
const DOSEN_ROSTER = {
    dospem1: 'DOSEN003',  // Ririt Dwiputri Permatasari
    dospem2: 'DOSEN002',  // Rifa'atul Mahmudah Burhan
    penguji1: 'DOSEN005', // Refli Noviardi
    penguji2: 'DOSEN008'  // Sasa Ani Arnomo
};

// Fase yang sudah melewati sidang -> penguji wajib terisi
const PHASES_WITH_PENGUJI = new Set([
    'revisi_sempro',
    'bimbingan_lanjut',
    'menunggu_semhas',
    'revisi_semhas',
    'bimbingan_akhir',
    'menunggu_sidang',
    'persiapan_wisuda',
    'selesai'
]);

// Progress bab yang wajar untuk tiap fase
const PROGRESS_BY_PHASE = {
    pra_sempro: 'BAB II',
    menunggu_sempro: 'BAB III',
    revisi_sempro: 'BAB III',
    bimbingan_lanjut: 'BAB IV',
    menunggu_semhas: 'BAB V',
    revisi_semhas: 'BAB V',
    bimbingan_akhir: 'BAB VI',
    menunggu_sidang: 'BAB VI',
    persiapan_wisuda: 'Selesai',
    selesai: 'Selesai'
};

// ===== Roster mahasiswa: 1 wakil per fase =====
const ROSTER = [
    { no: 1, nim: '2321053', status: 'pra_sempro', catatan: 'Flow awal, sebelum sempro' },
    { no: 2, nim: '2221015', status: 'menunggu_sempro', catatan: 'Fase pengumpulan berkas sempro' },
    { no: 3, nim: '2221057', status: 'revisi_sempro', catatan: 'Setelah sempro, revisi ke penguji' },
    { no: 4, nim: '2221064', status: 'bimbingan_lanjut', catatan: 'Lolos revisi sempro, bimbingan BAB IV-V' },
    { no: 5, nim: '2221011', status: 'menunggu_semhas', catatan: 'Fase pengumpulan berkas semhas' },
    { no: 6, nim: '2221049', status: 'revisi_semhas', catatan: 'Setelah semhas, revisi ke penguji' },
    { no: 7, nim: '2221043', status: 'bimbingan_akhir', catatan: 'SIDANG AKHIR - kartu link akademik muncul' },
    { no: 8, nim: '2221062', status: 'menunggu_sidang', catatan: 'SIDANG AKHIR - jadwal sidang sudah dicatat' },
    { no: 9, nim: '2221032', status: 'persiapan_wisuda', catatan: 'Upload berkas wisuda' },
    { no: 10, nim: '2221036', status: 'selesai', catatan: 'Lulus, berkas wisuda disetujui' },
    // Dua akun bersih untuk menjalankan alur end-to-end
    { no: 11, nim: '321321', status: 'pra_sempro', catatan: 'SAMPLE SIDANG - alur hidup end-to-end', clearPenguji: true },
    { no: 12, nim: '123123', status: 'pra_sempro', catatan: 'SAMPLE LATIHAN - dipakai saat berlatih', clearPenguji: true }
];

async function run() {
    console.log(isConfirmed
        ? '⚠️  MODE: CONFIRM - data akan benar-benar diubah'
        : '🔍 MODE: DRY-RUN - tidak ada data yang diubah (tambahkan --confirm untuk eksekusi)');
    console.log('');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB\n');

    // Ambil dosen roster
    const dosenNips = Object.values(DOSEN_ROSTER);
    const dosenDocs = await User.find({ nim_nip: { $in: dosenNips }, role: 'dosen' });
    const dosenMap = {};
    dosenDocs.forEach((d) => { dosenMap[d.nim_nip] = d; });

    const missingDosen = dosenNips.filter((nip) => !dosenMap[nip]);
    if (missingDosen.length > 0) {
        console.log(`❌ Dosen roster tidak ditemukan: ${missingDosen.join(', ')}. Batal.`);
        return;
    }

    const D1 = dosenMap[DOSEN_ROSTER.dospem1];
    const D2 = dosenMap[DOSEN_ROSTER.dospem2];
    const P1 = dosenMap[DOSEN_ROSTER.penguji1];
    const P2 = dosenMap[DOSEN_ROSTER.penguji2];

    console.log('=== DOSEN ROSTER ===');
    console.log(`Dospem 1 : ${D1.nim_nip} - ${D1.name}`);
    console.log(`Dospem 2 : ${D2.nim_nip} - ${D2.name}`);
    console.log(`Penguji 1: ${P1.nim_nip} - ${P1.name}`);
    console.log(`Penguji 2: ${P2.nim_nip} - ${P2.name}`);
    console.log('');

    const dosenByType = {
        dospem_1: D1._id,
        dospem_2: D2._id,
        penguji_1: P1._id,
        penguji_2: P2._id
    };

    const summary = [];

    for (const item of ROSTER) {
        const student = await User.findOne({ nim_nip: item.nim, role: 'mahasiswa' });

        if (!student) {
            console.log(`⚠️  [${item.no}] NIM ${item.nim} tidak ditemukan. Dilewati.\n`);
            continue;
        }

        const needsPenguji = PHASES_WITH_PENGUJI.has(item.status) && !item.clearPenguji;
        // Sample bersih (belum pernah bimbingan) tetap di BAB I agar konsisten
        const targetProgress = item.clearPenguji
            ? 'BAB I'
            : (PROGRESS_BY_PHASE[item.status] || student.currentProgress);

        const bimbinganCount = await Bimbingan.countDocuments({ mahasiswa: student._id });
        const jadwalCount = await Jadwal.countDocuments({ mahasiswa: student._id });

        console.log('='.repeat(72));
        console.log(`[${item.no}] ${student.name} (${student.nim_nip})`);
        console.log(`     ${item.catatan}`);
        console.log(`     Status : ${student.statusMahasiswa} -> ${item.status}`);
        console.log(`     Progress: ${student.currentProgress} -> ${targetProgress}`);
        console.log(`     Dospem : -> ${D1.name} / ${D2.name}`);
        console.log(`     Penguji: -> ${needsPenguji ? `${P1.name} / ${P2.name}` : '(dikosongkan)'}`);
        console.log(`     Riwayat: ${bimbinganCount} bimbingan, ${jadwalCount} jadwal akan di-remap`);

        summary.push({
            no: item.no,
            nim: student.nim_nip,
            nama: student.name,
            fase: item.status,
            catatan: item.catatan
        });

        if (!isConfirmed) {
            console.log('     ➡️  (dry-run) tidak ditulis.\n');
            continue;
        }

        // --- Update user ---
        student.statusMahasiswa = item.status;
        student.currentProgress = targetProgress;
        student.dospem_1 = D1._id;
        student.dospem_2 = D2._id;
        student.penguji_1 = needsPenguji ? P1._id : null;
        student.penguji_2 = needsPenguji ? P2._id : null;
        student.isActive = true;
        await student.save();

        // --- Remap riwayat Bimbingan mengikuti dosenType ---
        for (const [dosenType, dosenId] of Object.entries(dosenByType)) {
            await Bimbingan.updateMany(
                { mahasiswa: student._id, dosenType },
                { $set: { dosen: dosenId } }
            );
        }

        // --- Remap penguji pada Jadwal ---
        if (jadwalCount > 0) {
            await Jadwal.updateMany(
                { mahasiswa: student._id },
                { $set: { penguji: [P1._id, P2._id] } }
            );
        }

        console.log('     ✅ Diterapkan.\n');
    }

    console.log('='.repeat(72));
    console.log('\n📋 RINGKASAN ROSTER TESTING\n');
    console.log('No | NIM      | Fase               | Mahasiswa');
    console.log('-'.repeat(72));
    summary.forEach((s) => {
        console.log(
            `${String(s.no).padEnd(2)} | ${s.nim.padEnd(8)} | ${s.fase.padEnd(18)} | ${s.nama}`
        );
    });

    console.log('\nDosen untuk semua mahasiswa di atas:');
    console.log(`  Dospem 1 : ${D1.nim_nip} (${D1.name})`);
    console.log(`  Dospem 2 : ${D2.nim_nip} (${D2.name})`);
    console.log(`  Penguji 1: ${P1.nim_nip} (${P1.name})`);
    console.log(`  Penguji 2: ${P2.nim_nip} (${P2.name})`);
    console.log('  Admin    : admin001');

    if (!isConfirmed) {
        console.log('\n🔍 Dry-run selesai. Jalankan ulang dengan --confirm untuk menerapkan.');
    } else {
        console.log('\n🚀 Roster testing siap dipakai.');
        console.log('   Catatan: mahasiswa fase `menunggu_sidang` belum punya jadwal Sidang Akhir.');
        console.log('   Buat lewat Admin > Kelola Jadwal bila ingin tampilan jadwalnya lengkap.');
    }
}

run()
    .catch((e) => console.error('❌ Error:', e))
    .finally(async () => {
        await mongoose.disconnect();
        console.log('🔌 Koneksi MongoDB ditutup.');
    });
