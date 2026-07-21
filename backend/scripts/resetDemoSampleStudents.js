/**
 * ====================================================================
 * Reset Demo Sample Students
 * ====================================================================
 * Mengembalikan mahasiswa sample demo ke kondisi awal `pra_sempro`
 * yang benar-benar bersih (belum pernah bimbingan sama sekali),
 * supaya alur aplikasi bisa diperagakan dari nol saat latihan/sidang.
 *
 * Yang dilakukan untuk SETIAP NIM target:
 * - Hapus semua Bimbingan milik mahasiswa tsb (beserta Reply-nya)
 * - Hapus semua Jadwal milik mahasiswa tsb
 * - Hapus semua PengajuanSeminar milik mahasiswa tsb
 * - Reset status  -> 'pra_sempro', progress -> 'BAB I'
 * - Kosongkan penguji_1 / penguji_2 (agar admin bisa memilih penguji
 *   saat demo; jika penguji sudah terisi, backend akan mengunci pilihan)
 * - Reset revisiDeadline dan dokumenWisuda ke kondisi awal
 * - Pastikan isActive = true
 *
 * TIDAK diubah: dospem_1, dospem_2, judulTA, email, password,
 * dan seluruh mahasiswa lain di database.
 *
 * Usage:
 *   node scripts/resetDemoSampleStudents.js            # dry-run (aman, tidak menulis)
 *   node scripts/resetDemoSampleStudents.js --confirm  # benar-benar mengubah data
 *
 * Batasi ke NIM tertentu:
 *   node scripts/resetDemoSampleStudents.js --nim=123123 --confirm
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Bimbingan = require('../models/Bimbingan');
const Jadwal = require('../models/Jadwal');
const Reply = require('../models/Reply');
const PengajuanSeminar = require('../models/PengajuanSeminar');

const MONGODB_URI = process.env.MONGODB_URI;

// NIM mahasiswa sample demo (Sample A = latihan, Sample B = sidang)
const DEFAULT_TARGET_NIMS = ['123123', '321321'];

const args = process.argv.slice(2);
const isConfirmed = args.includes('--confirm');
const nimArg = args.find((a) => a.startsWith('--nim='));
const targetNims = nimArg
    ? nimArg.replace('--nim=', '').split(',').map((n) => n.trim()).filter(Boolean)
    : DEFAULT_TARGET_NIMS;

const emptyFile = () => ({
    fileName: null,
    filePath: null,
    fileSize: null,
    fileOriginalName: null,
    uploadedAt: null
});

async function run() {
    console.log(isConfirmed
        ? '⚠️  MODE: CONFIRM - data akan benar-benar diubah'
        : '🔍 MODE: DRY-RUN - tidak ada data yang diubah (tambahkan --confirm untuk eksekusi)');
    console.log(`🎯 Target NIM: ${targetNims.join(', ')}\n`);

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB\n');

    const students = await User.find({ nim_nip: { $in: targetNims }, role: 'mahasiswa' })
        .populate('dospem_1', 'name nim_nip')
        .populate('dospem_2', 'name nim_nip');

    if (students.length === 0) {
        console.log('❌ Tidak ada mahasiswa yang cocok dengan NIM target. Batal.');
        return;
    }

    const missing = targetNims.filter((nim) => !students.some((s) => s.nim_nip === nim));
    if (missing.length > 0) {
        console.log(`⚠️  NIM tidak ditemukan (dilewati): ${missing.join(', ')}\n`);
    }

    for (const student of students) {
        console.log('='.repeat(70));
        console.log(`👤 ${student.name} (${student.nim_nip})`);
        console.log(`   Status sekarang : ${student.statusMahasiswa} | Progress: ${student.currentProgress}`);
        console.log(`   Dospem (tetap)  : ${student.dospem_1?.name || '-'} / ${student.dospem_2?.name || '-'}`);

        const bimbinganList = await Bimbingan.find({ mahasiswa: student._id }).select('_id');
        const bimbinganIds = bimbinganList.map((b) => b._id);

        const replyCount = bimbinganIds.length
            ? await Reply.countDocuments({ bimbingan: { $in: bimbinganIds } })
            : 0;
        const jadwalCount = await Jadwal.countDocuments({ mahasiswa: student._id });
        const pengajuanCount = await PengajuanSeminar.countDocuments({ mahasiswa: student._id });

        console.log(`   Akan dihapus    : ${bimbinganIds.length} bimbingan, ${replyCount} reply, ` +
            `${jadwalCount} jadwal, ${pengajuanCount} pengajuan seminar`);

        if (!isConfirmed) {
            console.log('   ➡️  (dry-run) tidak ada perubahan yang ditulis.\n');
            continue;
        }

        if (bimbinganIds.length > 0) {
            await Reply.deleteMany({ bimbingan: { $in: bimbinganIds } });
            await Bimbingan.deleteMany({ _id: { $in: bimbinganIds } });
        }
        await Jadwal.deleteMany({ mahasiswa: student._id });
        await PengajuanSeminar.deleteMany({ mahasiswa: student._id });

        student.statusMahasiswa = 'pra_sempro';
        student.currentProgress = 'BAB I';
        student.penguji_1 = null;
        student.penguji_2 = null;
        student.isActive = true;

        student.revisiDeadline = {
            jenis: null,
            tanggalMulai: null,
            deadline: null,
            status: 'tidak_aktif',
            isLocked: false,
            unlockedBy: null,
            unlockedAt: null,
            catatan: null
        };

        student.dokumenWisuda = {
            skripsiFull: emptyFile(),
            pptSkripsi: emptyFile(),
            halamanPengesahan: emptyFile(),
            formBimbingan: emptyFile(),
            statusVerifikasi: 'belum_upload',
            catatanAdmin: null,
            verifiedAt: null
        };

        await student.save();
        console.log('   ✅ Direset ke pra_sempro (BAB I), bersih tanpa riwayat bimbingan.\n');
    }

    console.log('='.repeat(70));
    if (isConfirmed) {
        console.log('🚀 Selesai. Mahasiswa sample siap dipakai demo dari fase pra_sempro.');
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
