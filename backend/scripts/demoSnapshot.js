/**
 * ====================================================================
 * Demo Snapshot & Restore (khusus akun sample testing)
 * ====================================================================
 * Memotret kondisi akun sample demo lalu mengembalikannya persis seperti
 * semula setelah selesai testing. Berguna untuk menguji alur penuh
 * berkali-kali tanpa meninggalkan data sisa.
 *
 * CAKUPAN SENGAJA DIBATASI pada akun sample testing saja
 * (default: 123123 dan 321321). Mahasiswa galeri per fase dan seluruh
 * mahasiswa lain TIDAK pernah disentuh.
 *
 * Data yang ikut dipotret/dipulihkan untuk tiap akun:
 * - Field User terkait alur (status, progress, plotting, deadline, wisuda)
 * - Seluruh Bimbingan + Reply miliknya
 * - Seluruh Jadwal miliknya
 * - Seluruh PengajuanSeminar miliknya
 *
 * Usage:
 *   node scripts/demoSnapshot.js save                     # potret kondisi sekarang
 *   node scripts/demoSnapshot.js restore                  # dry-run pemulihan
 *   node scripts/demoSnapshot.js restore --confirm        # pulihkan
 *   node scripts/demoSnapshot.js save --nim=123123        # batasi ke satu akun
 *   node scripts/demoSnapshot.js status                   # lihat isi snapshot
 */

'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Bimbingan = require('../models/Bimbingan');
const Jadwal = require('../models/Jadwal');
const Reply = require('../models/Reply');
const PengajuanSeminar = require('../models/PengajuanSeminar');

const MONGODB_URI = process.env.MONGODB_URI;
const SNAPSHOT_FILE = path.join(__dirname, 'demo-snapshot.json');

const args = process.argv.slice(2);
const mode = args.find((a) => !a.startsWith('--')) || 'status';
const isConfirmed = args.includes('--confirm');
const nimArg = args.find((a) => a.startsWith('--nim='));

// 12 akun roster demo (10 wakil fase + 2 sample bersih).
// Mahasiswa di luar daftar ini TIDAK pernah disentuh.
const DEFAULT_NIMS = [
    '2321053', // pra_sempro
    '2221015', // menunggu_sempro
    '2221057', // revisi_sempro
    '2221064', // bimbingan_lanjut
    '2221011', // menunggu_semhas
    '2221049', // revisi_semhas
    '2221043', // bimbingan_akhir
    '2221062', // menunggu_sidang
    '2221032', // persiapan_wisuda
    '2221036', // selesai
    '321321',  // sample sidang
    '123123'   // sample latihan
];
const targetNims = nimArg
    ? nimArg.replace('--nim=', '').split(',').map((n) => n.trim()).filter(Boolean)
    : DEFAULT_NIMS;

// Field User yang ikut dipotret (selain identitas & kredensial)
const USER_FIELDS = [
    'statusMahasiswa',
    'currentProgress',
    'judulTA',
    'dospem_1',
    'dospem_2',
    'penguji_1',
    'penguji_2',
    'revisiDeadline',
    'dokumenWisuda',
    'isActive',
    'status'
];

async function collect(student) {
    const bimbingan = await Bimbingan.find({ mahasiswa: student._id }).lean();
    const bimbinganIds = bimbingan.map((b) => b._id);
    const reply = bimbinganIds.length
        ? await Reply.find({ bimbingan: { $in: bimbinganIds } }).lean()
        : [];
    const jadwal = await Jadwal.find({ mahasiswa: student._id }).lean();
    const pengajuan = await PengajuanSeminar.find({ mahasiswa: student._id }).lean();

    const userFields = {};
    USER_FIELDS.forEach((f) => { userFields[f] = student[f]; });

    return { bimbingan, reply, jadwal, pengajuan, userFields };
}

async function doSave() {
    const students = await User.find({ nim_nip: { $in: targetNims }, role: 'mahasiswa' });
    if (!students.length) {
        console.log('❌ Tidak ada akun sample yang cocok. Batal.');
        return;
    }

    const snapshot = {
        createdAt: new Date().toISOString(),
        nims: [],
        data: {}
    };

    for (const student of students) {
        const collected = await collect(student);
        snapshot.nims.push(student.nim_nip);
        snapshot.data[student.nim_nip] = {
            name: student.name,
            userId: student._id.toString(),
            ...collected
        };

        console.log(`📸 ${student.name} (${student.nim_nip})`);
        console.log(`   status=${student.statusMahasiswa} progress=${student.currentProgress}`);
        console.log(`   ${collected.bimbingan.length} bimbingan, ${collected.reply.length} reply, ` +
            `${collected.jadwal.length} jadwal, ${collected.pengajuan.length} pengajuan`);
    }

    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
    console.log(`\n✅ Snapshot disimpan: ${SNAPSHOT_FILE}`);
    console.log('   Silakan testing sepuasnya, lalu jalankan:');
    console.log('   node scripts/demoSnapshot.js restore --confirm');
}

async function doRestore() {
    if (!fs.existsSync(SNAPSHOT_FILE)) {
        console.log(`❌ Snapshot belum ada di ${SNAPSHOT_FILE}`);
        console.log('   Jalankan dulu: node scripts/demoSnapshot.js save');
        return;
    }

    const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
    console.log(`📂 Snapshot dibuat: ${snapshot.createdAt}`);
    console.log(`   Akun: ${snapshot.nims.join(', ')}\n`);

    for (const nim of snapshot.nims) {
        const saved = snapshot.data[nim];
        const student = await User.findOne({ nim_nip: nim, role: 'mahasiswa' });
        if (!student) {
            console.log(`⚠️  ${nim} tidak ditemukan. Dilewati.\n`);
            continue;
        }

        const nowBimbingan = await Bimbingan.countDocuments({ mahasiswa: student._id });
        const nowJadwal = await Jadwal.countDocuments({ mahasiswa: student._id });
        const nowPengajuan = await PengajuanSeminar.countDocuments({ mahasiswa: student._id });

        console.log(`🔄 ${saved.name} (${nim})`);
        console.log(`   status  : ${student.statusMahasiswa} -> ${saved.userFields.statusMahasiswa}`);
        console.log(`   progress: ${student.currentProgress} -> ${saved.userFields.currentProgress}`);
        console.log(`   bimbingan: ${nowBimbingan} -> ${saved.bimbingan.length}`);
        console.log(`   jadwal   : ${nowJadwal} -> ${saved.jadwal.length}`);
        console.log(`   pengajuan: ${nowPengajuan} -> ${saved.pengajuan.length}`);

        if (!isConfirmed) {
            console.log('   ➡️  (dry-run) tidak ditulis.\n');
            continue;
        }

        // Bersihkan seluruh data milik akun sample ini
        const currentBimbingan = await Bimbingan.find({ mahasiswa: student._id }).select('_id');
        if (currentBimbingan.length) {
            await Reply.deleteMany({ bimbingan: { $in: currentBimbingan.map((b) => b._id) } });
        }
        await Bimbingan.deleteMany({ mahasiswa: student._id });
        await Jadwal.deleteMany({ mahasiswa: student._id });
        await PengajuanSeminar.deleteMany({ mahasiswa: student._id });

        // Pulihkan record persis seperti snapshot (termasuk _id asli)
        if (saved.bimbingan.length) await Bimbingan.insertMany(saved.bimbingan);
        if (saved.reply.length) await Reply.insertMany(saved.reply);
        if (saved.jadwal.length) await Jadwal.insertMany(saved.jadwal);
        if (saved.pengajuan.length) await PengajuanSeminar.insertMany(saved.pengajuan);

        // Pulihkan field user
        USER_FIELDS.forEach((f) => { student[f] = saved.userFields[f]; });
        await student.save();

        console.log('   ✅ Dipulihkan.\n');
    }

    console.log(isConfirmed
        ? '🚀 Selesai. Akun sample kembali ke kondisi snapshot.'
        : '🔍 Dry-run selesai. Tambahkan --confirm untuk memulihkan.');
}

async function doStatus() {
    if (!fs.existsSync(SNAPSHOT_FILE)) {
        console.log('ℹ️  Belum ada snapshot. Jalankan: node scripts/demoSnapshot.js save');
        return;
    }
    const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
    console.log(`📂 Snapshot dibuat : ${snapshot.createdAt}`);
    console.log(`   Akun tercakup   : ${snapshot.nims.join(', ')}\n`);
    snapshot.nims.forEach((nim) => {
        const d = snapshot.data[nim];
        console.log(`   ${d.name} (${nim})`);
        console.log(`     status=${d.userFields.statusMahasiswa} progress=${d.userFields.currentProgress}`);
        console.log(`     ${d.bimbingan.length} bimbingan, ${d.jadwal.length} jadwal, ${d.pengajuan.length} pengajuan`);
    });
}

async function run() {
    console.log(`🎯 Akun sample: ${targetNims.join(', ')}`);
    console.log(`   (mahasiswa galeri & user lain tidak disentuh)\n`);

    await mongoose.connect(MONGODB_URI);

    if (mode === 'save') await doSave();
    else if (mode === 'restore') await doRestore();
    else if (mode === 'status') await doStatus();
    else console.log(`❌ Mode tidak dikenal: ${mode}. Gunakan: save | restore | status`);
}

run()
    .catch((e) => console.error('❌ Error:', e))
    .finally(async () => {
        await mongoose.disconnect();
    });
