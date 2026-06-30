/**
 * Seed Pengajuan Seminar Flow Data
 *
 * Non-destructive helper for testing:
 * ACC Seminar -> Upload Softcopy -> Verifikasi Admin -> Buat Jadwal.
 *
 * This script only upserts PengajuanSeminar records and creates small PDF files
 * in backend/uploads/pengajuan-seminar. It does not create users, lecturers, or
 * schedules, and it does not delete existing data.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Bimbingan = require('../models/Bimbingan');
const Jadwal = require('../models/Jadwal');
const PengajuanSeminar = require('../models/PengajuanSeminar');

const MONGODB_URI = process.env.MONGODB_URI;
const uploadDir = path.join(__dirname, '..', 'uploads', 'pengajuan-seminar');
const bimbinganDir = path.join(__dirname, '..', 'uploads', 'bimbingan');
const shouldPrepareStatuses = process.argv.includes('--prepare-statuses');
const minimumBimbinganPerDospem = 5;

const flowConfigs = [
    {
        jenisPengajuan: 'seminar_proposal',
        jenisJadwal: 'sidang_proposal',
        requiredStatus: 'menunggu_sempro',
        fallbackStatuses: ['pra_sempro'],
        targetProgress: 'BAB III',
        label: 'Seminar Proposal',
        bab: 'BAB I-III'
    },
    {
        jenisPengajuan: 'seminar_hasil',
        jenisJadwal: 'sidang_semhas',
        requiredStatus: 'menunggu_semhas',
        fallbackStatuses: ['bimbingan_lanjut'],
        targetProgress: 'BAB V',
        label: 'Seminar Hasil',
        bab: 'BAB I-V'
    }
];

const plannedStatuses = ['menunggu_verifikasi', 'disetujui'];

const ensureUploadDir = () => {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    if (!fs.existsSync(bimbinganDir)) {
        fs.mkdirSync(bimbinganDir, { recursive: true });
    }
};

const makePdfBuffer = ({ student, config, statusVerifikasi }) => {
    const lines = [
        'SIMTA - Dokumen Uji Pengajuan Seminar',
        `Mahasiswa: ${student.name}`,
        `NIM: ${student.nim_nip}`,
        `Jenis: ${config.label}`,
        `Softcopy: ${config.bab}`,
        `Status seed: ${statusVerifikasi}`,
        `Generated: ${new Date().toISOString()}`
    ];

    const text = lines.join('\\n');

    return Buffer.from(
        `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${text.length + 64} >>
stream
BT
/F1 12 Tf
72 720 Td
(${text.replace(/[()\\]/g, ' ')}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000059 00000 n
0000000116 00000 n
0000000251 00000 n
0000000394 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
464
%%EOF
`,
        'utf8'
    );
};

const isValidLecturer = (lecturer) => {
    return lecturer && lecturer.role === 'dosen' && lecturer.status !== 'nonaktif';
};

const hasActiveSchedule = async (studentId, jenisJadwal) => {
    const existing = await Jadwal.findOne({
        mahasiswa: studentId,
        jenisJadwal,
        status: { $ne: 'dibatalkan' }
    }).select('_id status tanggal');

    return Boolean(existing);
};

const findCandidates = async (config) => {
    const statusPool = shouldPrepareStatuses
        ? [config.requiredStatus, ...config.fallbackStatuses]
        : [config.requiredStatus];

    const students = await User.find({
        role: 'mahasiswa',
        status: 'aktif',
        statusMahasiswa: { $in: statusPool },
        dospem_1: { $ne: null },
        dospem_2: { $ne: null }
    })
        .populate('dospem_1', 'name nim_nip role status')
        .populate('dospem_2', 'name nim_nip role status')
        .populate('penguji_1', 'name nim_nip role status')
        .populate('penguji_2', 'name nim_nip role status')
        .sort({ nim_nip: 1 });

    const valid = [];

    for (const student of students) {
        if (!isValidLecturer(student.dospem_1) || !isValidLecturer(student.dospem_2)) {
            continue;
        }

        if (await hasActiveSchedule(student._id, config.jenisJadwal)) {
            continue;
        }

        valid.push(student);
    }

    return valid;
};

const createBimbinganSeedFile = ({ student, config, dosenType, version, status }) => {
    const safeNim = String(student.nim_nip).replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `bimbingan_seed_${safeNim}_${config.jenisPengajuan}_${dosenType}_${version}_${status}.pdf`;
    const filePath = path.join(bimbinganDir, fileName);
    const buffer = makePdfBuffer({
        student,
        config,
        statusVerifikasi: `Riwayat ${dosenType} ${version} ${status}`
    });

    fs.writeFileSync(filePath, buffer);

    return {
        fileName,
        filePath: `uploads/bimbingan/${fileName}`,
        fileSize: String(buffer.length),
        fileOriginalName: `Bimbingan_${config.label.replace(/\s+/g, '_')}_${safeNim}_${dosenType}_${version}.pdf`
    };
};

const ensureDospemBimbinganHistory = async ({ student, config, dosenField }) => {
    const dosen = student[dosenField];
    if (!isValidLecturer(dosen)) {
        return { dosenField, created: 0, skipped: true };
    }

    let total = await Bimbingan.countDocuments({
        mahasiswa: student._id,
        dosenType: dosenField
    });

    let created = 0;
    const statusSequence = ['acc', 'revisi', 'acc', 'lanjut_bab'];

    while (total < minimumBimbinganPerDospem - 1) {
        const version = await Bimbingan.getNextVersion(student._id, dosen._id);
        const status = statusSequence[total % statusSequence.length];
        const file = createBimbinganSeedFile({ student, config, dosenType: dosenField, version, status });
        const date = new Date();
        date.setDate(date.getDate() - (minimumBimbinganPerDospem - total + (dosenField === 'dospem_1' ? 8 : 6)));

        await Bimbingan.create({
            mahasiswa: student._id,
            dosen: dosen._id,
            dosenType: dosenField,
            kategoriBimbingan: 'bimbingan_dospem',
            version,
            judul: `${config.targetProgress} - Progres ${config.label}`,
            catatan: `Seed riwayat bimbingan ${config.label}.`,
            ...file,
            status,
            feedback: status === 'revisi'
                ? 'Perbaiki bagian pembahasan dan susunan dokumen.'
                : 'Progres bimbingan diterima.',
            feedbackDate: date,
            createdAt: date,
            updatedAt: date
        });

        total += 1;
        created += 1;
    }

    const latest = await Bimbingan.findOne({
        mahasiswa: student._id,
        dosenType: dosenField
    }).sort({ createdAt: -1 });

    if (!latest || latest.status !== 'acc_sempro') {
        const version = await Bimbingan.getNextVersion(student._id, dosen._id);
        const file = createBimbinganSeedFile({ student, config, dosenType: dosenField, version, status: 'acc_sempro' });
        const date = new Date();
        date.setDate(date.getDate() - (dosenField === 'dospem_1' ? 2 : 1));

        await Bimbingan.create({
            mahasiswa: student._id,
            dosen: dosen._id,
            dosenType: dosenField,
            kategoriBimbingan: 'bimbingan_dospem',
            version,
            judul: `${config.targetProgress} - Persetujuan Maju ${config.label}`,
            catatan: `Dokumen ${config.bab} siap diajukan untuk ${config.label}.`,
            ...file,
            status: 'acc_sempro',
            feedback: `Disetujui untuk mengajukan ${config.label}.`,
            feedbackDate: date,
            createdAt: date,
            updatedAt: date
        });

        created += 1;
    }

    return { dosenField, created, skipped: false };
};

const ensureBimbinganFlow = async ({ student, config }) => {
    const [dospem1, dospem2] = await Promise.all([
        ensureDospemBimbinganHistory({ student, config, dosenField: 'dospem_1' }),
        ensureDospemBimbinganHistory({ student, config, dosenField: 'dospem_2' })
    ]);

    return { dospem1, dospem2 };
};

const getValidExaminers = async (student) => {
    const existing = [student.penguji_1, student.penguji_2].filter(isValidLecturer);
    if (existing.length >= 2) {
        return existing.slice(0, 2).map((dosen) => dosen._id);
    }

    const excluded = [student.dospem_1?._id, student.dospem_2?._id, ...existing.map((dosen) => dosen._id)]
        .filter(Boolean)
        .map((id) => id.toString());

    const lecturers = await User.find({
        role: 'dosen',
        status: 'aktif',
        _id: { $nin: excluded }
    }).limit(2 - existing.length);

    return [...existing.map((dosen) => dosen._id), ...lecturers.map((dosen) => dosen._id)];
};

const ensurePriorProposalSchedule = async (student) => {
    const existing = await Jadwal.findOne({
        mahasiswa: student._id,
        jenisJadwal: 'sidang_proposal',
        status: { $ne: 'dibatalkan' }
    });

    if (existing) {
        return { created: false, existingStatus: existing.status };
    }

    const penguji = await getValidExaminers(student);
    if (penguji.length < 2) {
        return { created: false, missingExaminers: true };
    }

    const admin = await User.findOne({ role: 'admin' }).select('_id');
    const date = new Date();
    date.setDate(date.getDate() - 21);

    await Jadwal.create({
        mahasiswa: student._id,
        jenisJadwal: 'sidang_proposal',
        tanggal: date,
        waktuMulai: '09:00',
        waktuSelesai: '11:00',
        ruangan: 'A401',
        penguji,
        status: 'selesai',
        hasil: 'lulus',
        nilaiSidang: 82,
        catatan: 'Seed riwayat Seminar Proposal selesai sebagai prasyarat Seminar Hasil.',
        createdBy: admin?._id || null
    });

    if (!student.penguji_1 || !student.penguji_2) {
        student.penguji_1 = penguji[0];
        student.penguji_2 = penguji[1];
        await student.save();
    }

    return { created: true };
};

const upsertPengajuan = async ({ student, config, statusVerifikasi }) => {
    const previousStatus = student.statusMahasiswa;
    const previousProgress = student.currentProgress;

    if (student.statusMahasiswa !== config.requiredStatus) {
        if (!shouldPrepareStatuses) {
            return {
                action: 'skipped',
                reason: `student status ${student.statusMahasiswa} is not ${config.requiredStatus}`,
                student,
                statusVerifikasi: null,
                config
            };
        }

        student.statusMahasiswa = config.requiredStatus;
        student.currentProgress = config.targetProgress;
        await student.save();
    }

    const bimbinganFlow = await ensureBimbinganFlow({ student, config });
    const priorProposalSchedule = config.jenisPengajuan === 'seminar_hasil'
        ? await ensurePriorProposalSchedule(student)
        : null;

    const safeNim = String(student.nim_nip).replace(/[^a-zA-Z0-9.-]/g, '_');
    const safeJenis = config.jenisPengajuan.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `pengajuan_seed_${safeNim}_${safeJenis}_${statusVerifikasi}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = makePdfBuffer({ student, config, statusVerifikasi });

    fs.writeFileSync(filePath, buffer);

    const existing = await PengajuanSeminar.findOne({
        mahasiswa: student._id,
        jenisPengajuan: config.jenisPengajuan
    });

    if (existing?.statusVerifikasi === 'disetujui' && statusVerifikasi !== 'disetujui') {
        return {
            action: 'skipped',
            reason: 'existing approved record preserved',
            student,
            statusVerifikasi: existing.statusVerifikasi,
            config
        };
    }

    const pengajuan = await PengajuanSeminar.findOneAndUpdate(
        {
            mahasiswa: student._id,
            jenisPengajuan: config.jenisPengajuan
        },
        {
            $set: {
                fileName,
                filePath: `uploads/pengajuan-seminar/${fileName}`,
                fileSize: (buffer.length / (1024 * 1024)).toFixed(2) + ' MB',
                fileOriginalName: `Softcopy_${config.label.replace(/\s+/g, '_')}_${safeNim}.pdf`,
                uploadedAt: new Date(),
                statusVerifikasi,
                catatanAdmin: statusVerifikasi === 'disetujui' ? 'Seed data siap untuk uji pembuatan jadwal.' : null,
                verifiedBy: null,
                verifiedAt: statusVerifikasi === 'disetujui' ? new Date() : null
            }
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );

    return {
        action: existing ? 'updated' : 'created',
        student,
        statusVerifikasi: pengajuan.statusVerifikasi,
        config,
        previousStatus,
        previousProgress,
        bimbinganFlow,
        priorProposalSchedule,
        fileName
    };
};

const main = async () => {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI tidak ditemukan. Pastikan backend/.env tersedia.');
    }

    ensureUploadDir();

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB:', mongoose.connection.name);
    console.log('Prepare statuses:', shouldPrepareStatuses ? 'YES' : 'NO');
    console.log('');

    const results = [];

    for (const config of flowConfigs) {
        const candidates = await findCandidates(config);
        console.log(`${config.label}: found ${candidates.length} valid candidate(s).`);

        if (candidates.length === 0) {
            results.push({
                action: 'missing',
                config,
                reason: `Tidak ada mahasiswa aktif dengan status ${config.requiredStatus}, dospem valid, dan tanpa jadwal aktif ${config.label}.`
            });
            continue;
        }

        const selected = candidates.slice(0, plannedStatuses.length);

        for (let index = 0; index < selected.length; index += 1) {
            const result = await upsertPengajuan({
                student: selected[index],
                config,
                statusVerifikasi: plannedStatuses[index]
            });
            results.push(result);
        }
    }

    console.log('');
    console.log('Seed result:');
    console.log('============================================================');

    results.forEach((result) => {
        if (result.action === 'missing') {
            console.log(`[MISS] ${result.config.label}: ${result.reason}`);
            return;
        }

        console.log(
            `[${result.action.toUpperCase()}] ${result.config.label} | ${result.statusVerifikasi} | ` +
            `${result.student.name} (${result.student.nim_nip}) | ` +
            `Dospem: ${result.student.dospem_1.name}, ${result.student.dospem_2.name}` +
            (
                result.previousStatus && result.previousStatus !== result.config.requiredStatus
                    ? ` | Status: ${result.previousStatus} -> ${result.config.requiredStatus}`
                    : ''
            ) +
            ` | Bimbingan created: D1 ${result.bimbinganFlow?.dospem1?.created || 0}, D2 ${result.bimbinganFlow?.dospem2?.created || 0}` +
            (
                result.priorProposalSchedule
                    ? ` | Proposal schedule: ${result.priorProposalSchedule.created ? 'created' : result.priorProposalSchedule.existingStatus || 'skipped'}`
                    : ''
            )
        );
    });

    console.log('============================================================');
    console.log('Next test: buka Admin -> Verifikasi Dokumen Mahasiswa -> tab Pengajuan Seminar.');
};

main()
    .catch((error) => {
        console.error('Seed failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
