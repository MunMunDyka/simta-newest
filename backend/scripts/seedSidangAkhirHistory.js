/**
 * ====================================================================
 * Seed Riwayat Fase Sidang Akhir
 * ====================================================================
 * Mengisi riwayat bimbingan & jadwal untuk dua mahasiswa roster demo
 * yang datanya masih kosong:
 *
 *   - 2221043 Raihan Nabil Ihsan   -> fase `bimbingan_akhir`
 *   - 2221062 Rahmat Taufik Hidayat -> fase `menunggu_sidang`
 *
 * Riwayat dibuat konsisten dengan state machine SIMTA:
 *   bimbingan dospem BAB I-III -> ACC Maju Sidang kedua dospem
 *   -> Sidang Proposal (lulus) -> bimbingan dospem BAB IV-V
 *   -> ACC Maju Sidang kedua dospem -> Seminar Hasil (lulus_revisi)
 *   -> revisi ke kedua penguji (ACC) -> `bimbingan_akhir`
 *   -> (khusus Rahmat) jadwal Sidang Akhir dicatat -> `menunggu_sidang`
 *
 * Skrip ini IDEMPOTEN: riwayat lama milik kedua mahasiswa dihapus
 * lebih dulu agar tidak menumpuk saat dijalankan berulang.
 *
 * Usage:
 *   node scripts/seedSidangAkhirHistory.js            # dry-run
 *   node scripts/seedSidangAkhirHistory.js --confirm  # eksekusi
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Bimbingan = require('../models/Bimbingan');
const Jadwal = require('../models/Jadwal');
const Reply = require('../models/Reply');

const MONGODB_URI = process.env.MONGODB_URI;
const isConfirmed = process.argv.slice(2).includes('--confirm');

const DOSEN = {
    dospem_1: 'DOSEN003',
    dospem_2: 'DOSEN002',
    penguji_1: 'DOSEN005',
    penguji_2: 'DOSEN008'
};

const TARGETS = [
    { nim: '2221043', fase: 'bimbingan_akhir', withSidangAkhir: false },
    { nim: '2221062', fase: 'menunggu_sidang', withSidangAkhir: true }
];

const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
};

const daysAhead = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
};

const slug = (s) => String(s).replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 60);

function buildBimbingan(student, dosenId, dosenType, kategori, version, judul, catatan, status, feedback, ago) {
    const date = daysAgo(ago);
    return {
        mahasiswa: student._id,
        dosen: dosenId,
        dosenType,
        kategoriBimbingan: kategori,
        version: `V${version}`,
        judul,
        catatan,
        fileName: `bimbingan_${student.nim_nip}_${dosenType}_v${version}.pdf`,
        filePath: `uploads/bimbingan/bimbingan_${student.nim_nip}_${dosenType}_v${version}.pdf`,
        fileSize: '1048576',
        fileOriginalName: `${slug(judul)}_V${version}.pdf`,
        status,
        feedback,
        feedbackDate: status === 'menunggu' ? null : date,
        createdAt: date,
        updatedAt: date
    };
}

async function run() {
    console.log(isConfirmed
        ? '⚠️  MODE: CONFIRM - data akan benar-benar ditulis'
        : '🔍 MODE: DRY-RUN - tidak ada data yang ditulis (tambahkan --confirm)');
    console.log('');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB\n');

    const dosenDocs = await User.find({ nim_nip: { $in: Object.values(DOSEN) }, role: 'dosen' });
    const dmap = {};
    dosenDocs.forEach((d) => { dmap[d.nim_nip] = d; });

    const missing = Object.values(DOSEN).filter((nip) => !dmap[nip]);
    if (missing.length) {
        console.log(`❌ Dosen tidak ditemukan: ${missing.join(', ')}. Batal.`);
        return;
    }

    const D1 = dmap[DOSEN.dospem_1];
    const D2 = dmap[DOSEN.dospem_2];
    const P1 = dmap[DOSEN.penguji_1];
    const P2 = dmap[DOSEN.penguji_2];

    for (const target of TARGETS) {
        const student = await User.findOne({ nim_nip: target.nim, role: 'mahasiswa' });
        if (!student) {
            console.log(`⚠️  NIM ${target.nim} tidak ditemukan. Dilewati.\n`);
            continue;
        }

        console.log('='.repeat(72));
        console.log(`👤 ${student.name} (${student.nim_nip}) - fase ${target.fase}`);

        const judul = student.judulTA || 'Tugas Akhir';
        const docs = [];

        // --- Tahap 1: bimbingan dospem BAB I-III menuju Sempro ---
        const babAwal = ['BAB I Pendahuluan', 'BAB II Landasan Teori', 'BAB III Metodologi'];
        babAwal.forEach((bab, i) => {
            docs.push(buildBimbingan(student, D1._id, 'dospem_1', 'bimbingan_dospem',
                i + 1, `Draft ${bab}`, `Mohon bimbingan ${bab} pak/bu.`,
                'acc', `ACC ${bab}, silakan lanjut.`, 160 - i * 12));
            docs.push(buildBimbingan(student, D2._id, 'dospem_2', 'bimbingan_dospem',
                i + 1, `Draft ${bab}`, `Bimbingan ${bab} ke dospem 2.`,
                'acc', 'Sudah baik, lanjutkan.', 158 - i * 12));
        });
        docs.push(buildBimbingan(student, D1._id, 'dospem_1', 'bimbingan_dospem',
            4, 'Proposal Final (BAB I-III)', 'Mohon ACC untuk maju Seminar Proposal.',
            'acc_sempro', 'ACC Maju Seminar Proposal.', 124));
        docs.push(buildBimbingan(student, D2._id, 'dospem_2', 'bimbingan_dospem',
            4, 'Proposal Final (BAB I-III)', 'Mohon ACC untuk maju Seminar Proposal.',
            'acc_sempro', 'ACC Maju Seminar Proposal.', 122));

        // --- Tahap 2: bimbingan dospem BAB IV-V menuju Semhas ---
        const babLanjut = ['BAB IV Hasil dan Pembahasan', 'BAB V Kesimpulan dan Saran'];
        babLanjut.forEach((bab, i) => {
            docs.push(buildBimbingan(student, D1._id, 'dospem_1', 'bimbingan_dospem',
                5 + i, `Draft ${bab}`, `Mohon bimbingan ${bab}.`,
                'acc', `ACC ${bab}.`, 90 - i * 20));
            docs.push(buildBimbingan(student, D2._id, 'dospem_2', 'bimbingan_dospem',
                5 + i, `Draft ${bab}`, `Bimbingan ${bab} ke dospem 2.`,
                'acc', 'Pembahasan sudah sesuai.', 88 - i * 20));
        });
        docs.push(buildBimbingan(student, D1._id, 'dospem_1', 'bimbingan_dospem',
            7, 'Draft Lengkap (BAB I-V)', 'Mohon ACC untuk maju Seminar Hasil.',
            'acc_sempro', 'ACC Maju Seminar Hasil.', 45));
        docs.push(buildBimbingan(student, D2._id, 'dospem_2', 'bimbingan_dospem',
            7, 'Draft Lengkap (BAB I-V)', 'Mohon ACC untuk maju Seminar Hasil.',
            'acc_sempro', 'ACC Maju Seminar Hasil.', 44));

        // --- Tahap 3: revisi Seminar Hasil ke kedua penguji (keduanya ACC) ---
        docs.push(buildBimbingan(student, P1._id, 'penguji_1', 'revisi_semhas',
            1, 'Revisi Seminar Hasil - Penguji 1', 'Perbaikan pembahasan sesuai catatan sidang.',
            'acc', 'Revisi sudah sesuai. ACC.', 22));
        docs.push(buildBimbingan(student, P2._id, 'penguji_2', 'revisi_semhas',
            1, 'Revisi Seminar Hasil - Penguji 2', 'Perbaikan kesimpulan dan daftar pustaka.',
            'acc', 'Kesimpulan sudah menjawab rumusan masalah. ACC.', 20));

        // --- Jadwal ---
        const jadwalDocs = [];
        const existingProposal = await Jadwal.findOne({
            mahasiswa: student._id,
            jenisJadwal: 'sidang_proposal'
        });

        if (!existingProposal) {
            jadwalDocs.push({
                mahasiswa: student._id,
                jenisJadwal: 'sidang_proposal',
                tanggal: daysAgo(110),
                waktuMulai: '09:00',
                waktuSelesai: '11:00',
                ruangan: 'Ruang A301',
                penguji: [P1._id, P2._id],
                status: 'selesai',
                hasil: 'lulus',
                nilaiSidang: 85,
                catatan: 'Seminar Proposal berjalan lancar.'
            });
        }

        jadwalDocs.push({
            mahasiswa: student._id,
            jenisJadwal: 'sidang_semhas',
            tanggal: daysAgo(30),
            waktuMulai: '10:00',
            waktuSelesai: '12:00',
            ruangan: 'Ruang B302',
            penguji: [P1._id, P2._id],
            status: 'selesai',
            hasil: 'lulus_revisi',
            nilaiSidang: 84,
            catatan: 'Seminar Hasil selesai, mahasiswa wajib revisi ke penguji.'
        });

        if (target.withSidangAkhir) {
            jadwalDocs.push({
                mahasiswa: student._id,
                jenisJadwal: 'sidang_skripsi',
                tanggal: daysAhead(7),
                waktuMulai: '13:00',
                waktuSelesai: '15:00',
                ruangan: 'Ruang Sidang Utama',
                penguji: [P1._id, P2._id],
                status: 'dijadwalkan',
                hasil: null,
                nilaiSidang: null,
                catatan: 'Jadwal Sidang Akhir diterima dari Akademik.'
            });
        }

        console.log(`   Judul TA : ${judul}`);
        console.log(`   Bimbingan: ${docs.length} record akan dibuat`);
        console.log(`              (dospem_1/2 BAB I-V + ACC Maju Sidang, revisi semhas 2 penguji ACC)`);
        console.log(`   Jadwal   : ${jadwalDocs.length} record akan dibuat` +
            (existingProposal ? ' (sidang_proposal sudah ada, dipertahankan)' : ''));
        jadwalDocs.forEach((j) => {
            console.log(`              - ${j.jenisJadwal} | ${j.status} | hasil=${j.hasil || '-'} | ${j.tanggal.toISOString().slice(0, 10)}`);
        });

        if (!isConfirmed) {
            console.log('   ➡️  (dry-run) tidak ditulis.\n');
            continue;
        }

        // Bersihkan riwayat lama agar idempoten
        const oldBimbingan = await Bimbingan.find({ mahasiswa: student._id }).select('_id');
        if (oldBimbingan.length) {
            await Reply.deleteMany({ bimbingan: { $in: oldBimbingan.map((b) => b._id) } });
            await Bimbingan.deleteMany({ mahasiswa: student._id });
        }
        await Jadwal.deleteMany({
            mahasiswa: student._id,
            jenisJadwal: { $in: ['sidang_semhas', 'sidang_skripsi'] }
        });

        await Bimbingan.insertMany(docs);
        await Jadwal.insertMany(jadwalDocs);

        console.log('   ✅ Riwayat dibuat.\n');
    }

    console.log('='.repeat(72));
    console.log(isConfirmed
        ? '🚀 Selesai. Riwayat fase Sidang Akhir siap ditampilkan.'
        : '🔍 Dry-run selesai. Jalankan ulang dengan --confirm untuk menerapkan.');
}

run()
    .catch((e) => console.error('❌ Error:', e))
    .finally(async () => {
        await mongoose.disconnect();
        console.log('🔌 Koneksi MongoDB ditutup.');
    });
