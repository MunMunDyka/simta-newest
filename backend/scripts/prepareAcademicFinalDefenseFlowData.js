/**
 * Prepare Academic Final Defense Flow Data
 *
 * Safe helper for UAT/demo using existing real mahasiswa and dosen accounts.
 * Default mode is DRY RUN. Use --apply to write changes.
 *
 * Flow prepared:
 * 1. Selesai Semhas -> mahasiswa sees academic final-defense registration link.
 * 2. Admin records final-defense schedule received from Akademik.
 * 3. Admin confirms final-defense completion -> mahasiswa opens berkas wisuda.
 */

'use strict';

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Jadwal = require('../models/Jadwal');
const SystemSetting = require('../models/SystemSetting');

const MONGODB_URI = process.env.MONGODB_URI;
const isApply = process.argv.includes('--apply');

const ACADEMIC_SIDANG_LINK_KEY = 'academic_sidang_akhir_link';
const DEFAULT_LINK = 'https://akademik.iteba.ac.id/pendaftaran-sidang-akhir';

const targets = [
    {
        nim: '2221049',
        label: 'Selesai Semhas - link akademik terbuka',
        statusMahasiswa: 'bimbingan_akhir',
        currentProgress: 'BAB VI',
        ensureSemhasCompleted: true
    },
    {
        nim: '2421035',
        label: 'Selesai Semhas - link akademik terbuka',
        statusMahasiswa: 'bimbingan_akhir',
        currentProgress: 'BAB VI',
        ensureSemhasCompleted: true
    },
    {
        nim: '2221033',
        label: 'Jadwal Sidang Akhir Akademik sudah dicatat admin',
        statusMahasiswa: 'menunggu_sidang',
        currentProgress: 'BAB VI',
        ensureSemhasCompleted: true,
        finalDefense: {
            status: 'dijadwalkan',
            dateOffsetDays: 7,
            waktuMulai: '09:00',
            waktuSelesai: '11:00',
            ruangan: 'A401'
        }
    },
    {
        nim: '2221025',
        label: 'Jadwal Sidang Akhir Akademik sudah dicatat admin',
        statusMahasiswa: 'menunggu_sidang',
        currentProgress: 'BAB VI',
        ensureSemhasCompleted: true,
        finalDefense: {
            status: 'dijadwalkan',
            dateOffsetDays: 10,
            waktuMulai: '13:00',
            waktuSelesai: '15:00',
            ruangan: 'A402'
        }
    },
    {
        nim: '2221030',
        label: 'Sidang Akhir Akademik selesai - berkas wisuda terbuka',
        statusMahasiswa: 'persiapan_wisuda',
        currentProgress: 'Selesai',
        ensureSemhasCompleted: true,
        finalDefense: {
            status: 'selesai',
            hasil: 'lulus',
            nilaiSidang: 88,
            dateOffsetDays: -3,
            waktuMulai: '09:00',
            waktuSelesai: '11:00',
            ruangan: 'A403'
        }
    }
];

const toDateWithOffset = (offsetDays) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    date.setHours(0, 0, 0, 0);
    return date;
};

const getAdminId = async () => {
    const admin = await User.findOne({ role: 'admin', status: 'aktif' }).select('_id name nim_nip').lean();
    return admin?._id || null;
};

const getValidExaminers = async (student) => {
    const existingIds = [student.penguji_1, student.penguji_2]
        .filter(Boolean)
        .map((item) => item._id || item);

    if (existingIds.length >= 2) {
        return existingIds.slice(0, 2);
    }

    const excluded = [
        student.dospem_1?._id || student.dospem_1,
        student.dospem_2?._id || student.dospem_2,
        ...existingIds
    ].filter(Boolean).map((id) => id.toString());

    const lecturers = await User.find({
        role: 'dosen',
        status: 'aktif',
        _id: { $nin: excluded }
    })
        .select('_id name nim_nip')
        .sort({ name: 1 })
        .limit(2 - existingIds.length);

    return [...existingIds, ...lecturers.map((dosen) => dosen._id)];
};

const upsertSchedule = async ({ student, jenisJadwal, config, adminId, catatan }) => {
    const penguji = await getValidExaminers(student);

    if (penguji.length < 2) {
        return {
            action: 'skipped',
            reason: 'Penguji valid kurang dari 2 dosen'
        };
    }

    const payload = {
        mahasiswa: student._id,
        jenisJadwal,
        tanggal: toDateWithOffset(config.dateOffsetDays),
        waktuMulai: config.waktuMulai,
        waktuSelesai: config.waktuSelesai,
        ruangan: config.ruangan,
        penguji,
        status: config.status,
        hasil: config.hasil || null,
        nilaiSidang: config.nilaiSidang || null,
        catatan,
        createdBy: adminId
    };

    const existing = await Jadwal.findOne({
        mahasiswa: student._id,
        jenisJadwal,
        status: { $ne: 'dibatalkan' }
    });

    if (!isApply) {
        return {
            action: existing ? 'would-update' : 'would-create',
            pengujiCount: penguji.length,
            schedule: payload
        };
    }

    if (existing) {
        await Jadwal.findByIdAndUpdate(existing._id, payload, { runValidators: true });
        return { action: 'updated', pengujiCount: penguji.length };
    }

    await Jadwal.create(payload);
    return { action: 'created', pengujiCount: penguji.length };
};

const prepareStudent = async ({ target, adminId }) => {
    const student = await User.findOne({ nim_nip: target.nim, role: 'mahasiswa' })
        .populate('dospem_1', 'name nim_nip role status')
        .populate('dospem_2', 'name nim_nip role status')
        .populate('penguji_1', 'name nim_nip role status')
        .populate('penguji_2', 'name nim_nip role status');

    if (!student) {
        return {
            nim: target.nim,
            label: target.label,
            action: 'missing',
            reason: 'Mahasiswa tidak ditemukan di database'
        };
    }

    const original = {
        statusMahasiswa: student.statusMahasiswa,
        currentProgress: student.currentProgress
    };

    const semhasResult = target.ensureSemhasCompleted
        ? await upsertSchedule({
            student,
            jenisJadwal: 'sidang_semhas',
            config: {
                status: 'selesai',
                hasil: 'lulus',
                nilaiSidang: 85,
                dateOffsetDays: -14,
                waktuMulai: '10:00',
                waktuSelesai: '12:00',
                ruangan: 'A404'
            },
            adminId,
            catatan: 'Data UAT: Seminar Hasil selesai sebagai prasyarat Sidang Akhir Akademik.'
        })
        : null;

    const finalDefenseResult = target.finalDefense
        ? await upsertSchedule({
            student,
            jenisJadwal: 'sidang_skripsi',
            config: target.finalDefense,
            adminId,
            catatan: target.finalDefense.status === 'selesai'
                ? 'Data UAT: Sidang Akhir Akademik selesai berdasarkan konfirmasi admin.'
                : 'Data UAT: Jadwal Sidang Akhir diterima dari akademik dan dicatat admin.'
        })
        : null;

    if (isApply) {
        student.statusMahasiswa = target.statusMahasiswa;
        student.currentProgress = target.currentProgress;
        await student.save();
    }

    return {
        nim: student.nim_nip,
        name: student.name,
        label: target.label,
        action: isApply ? 'updated' : 'preview',
        original,
        target: {
            statusMahasiswa: target.statusMahasiswa,
            currentProgress: target.currentProgress
        },
        dospem: [
            student.dospem_1?.name || '-',
            student.dospem_2?.name || '-'
        ],
        penguji: [
            student.penguji_1?.name || '(dipilih otomatis)',
            student.penguji_2?.name || '(dipilih otomatis)'
        ],
        semhasResult,
        finalDefenseResult
    };
};

const prepareAcademicLink = async () => {
    const payload = {
        url: process.env.ACADEMIC_FINAL_DEFENSE_LINK || DEFAULT_LINK,
        label: 'Daftar Sidang Akhir melalui Akademik'
    };

    if (!isApply) {
        return { action: 'would-upsert', value: payload };
    }

    await SystemSetting.findOneAndUpdate(
        { key: ACADEMIC_SIDANG_LINK_KEY },
        {
            value: payload,
            label: 'Link Pendaftaran Sidang Akhir Akademik',
            description: 'Link eksternal akademik untuk mahasiswa yang sudah menyelesaikan Seminar Hasil.'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return { action: 'upserted', value: payload };
};

const main = async () => {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI tidak ditemukan. Pastikan backend/.env tersedia.');
    }

    await mongoose.connect(MONGODB_URI);
    console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
    console.log(`Mode: ${isApply ? 'APPLY' : 'DRY RUN'}\n`);

    const adminId = await getAdminId();
    const linkResult = await prepareAcademicLink();
    const results = [];

    for (const target of targets) {
        results.push(await prepareStudent({ target, adminId }));
    }

    console.log('Academic final defense link:');
    console.log(linkResult);
    console.log('\nPrepared students:');
    console.log('============================================================');
    results.forEach((result) => {
        if (result.action === 'missing') {
            console.log(`[MISS] ${result.nim} | ${result.reason}`);
            return;
        }

        console.log(`[${result.action.toUpperCase()}] ${result.nim} - ${result.name}`);
        console.log(`  Flow: ${result.label}`);
        console.log(`  Status: ${result.original.statusMahasiswa} -> ${result.target.statusMahasiswa}`);
        console.log(`  Progress: ${result.original.currentProgress} -> ${result.target.currentProgress}`);
        console.log(`  Dospem: ${result.dospem.join(' / ')}`);
        console.log(`  Penguji: ${result.penguji.join(' / ')}`);
        if (result.semhasResult) {
            console.log(`  Semhas schedule: ${result.semhasResult.action}`);
        }
        if (result.finalDefenseResult) {
            console.log(`  Sidang Akhir Akademik schedule: ${result.finalDefenseResult.action}`);
        }
    });
    console.log('============================================================');

    if (!isApply) {
        console.log('\nDRY RUN only. Jalankan dengan --apply jika sudah yakin ingin update database.');
    }
};

main()
    .catch((error) => {
        console.error('Prepare failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
