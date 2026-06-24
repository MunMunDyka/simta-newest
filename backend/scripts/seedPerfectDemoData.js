/**
 * ====================================================================
 * Seed Perfect Demo Data - 24 Students Matched to 8 Lecturers
 * ====================================================================
 * This script sets up a perfect academic flow distribution in the DB.
 * It maps 24 target students across 6 academic stages such that:
 * - Each of the 8 active lecturers has exactly ONE student in each of the 6 stages.
 * - Previous schedules (sidang_proposal, sidang_semhas, sidang_skripsi) are generated.
 * - History of bimbingan (V1, V2, etc.) is generated for both pembimbing and examiners.
 * - Wisuda documents are uploaded for stage 6 students (waiting for admin verification).
 * 
 * Usage: node scripts/seedPerfectDemoData.js
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Bimbingan = require('../models/Bimbingan');
const Jadwal = require('../models/Jadwal');

const MONGODB_URI = process.env.MONGODB_URI;

const studentStages = [
    // --- STAGE 1: pra_sempro (4 students, Bab 1-3, no schedules, no examiners) ---
    {
        nim: '2321053',
        status: 'pra_sempro',
        progress: 'BAB II',
        dospem1: 'DOSEN001',
        dospem2: 'DOSEN002',
        title: 'Rancang Bangun Sistem Informasi Bimbingan Skripsi Berbasis Web Dengan Metode Prototyping Untuk Meningkatkan Efektivitas Komunikasi'
    },
    {
        nim: '2421051',
        status: 'pra_sempro',
        progress: 'BAB I',
        dospem1: 'DOSEN003',
        dospem2: 'DOSEN004',
        title: 'Sistem Informasi Inventaris Lab Berbasis IoT Menggunakan RFID'
    },
    {
        nim: '2221015',
        status: 'pra_sempro',
        progress: 'BAB II',
        dospem1: 'DOSEN005',
        dospem2: 'DOSEN006',
        title: 'Analisis Kepuasan Pengguna Aplikasi Mobile Banking Menggunakan Metode Delone & McLean'
    },
    {
        nim: '2221053',
        status: 'pra_sempro',
        progress: 'BAB I',
        dospem1: 'DOSEN007',
        dospem2: 'DOSEN008',
        title: 'Rancang Bangun E-Commerce Produk Pertanian Lokal Berbasis Web'
    },

    // --- STAGE 2: revisi_sempro (4 students, finished Sempro, in revision with examiners) ---
    {
        nim: '2221057',
        status: 'revisi_sempro',
        progress: 'BAB III',
        dospem1: 'DOSEN002',
        dospem2: 'DOSEN003',
        title: 'Sistem Pendukung Keputusan Pemilihan Karyawan Terbaik Menggunakan Metode SAW'
    },
    {
        nim: '2221006',
        status: 'revisi_sempro',
        progress: 'BAB III',
        dospem1: 'DOSEN004',
        dospem2: 'DOSEN005',
        title: 'Penerapan Algoritma Naive Bayes Untuk Analisis Sentimen Ulasan Aplikasi'
    },
    {
        nim: '2421046',
        status: 'revisi_sempro',
        progress: 'BAB III',
        dospem1: 'DOSEN006',
        dospem2: 'DOSEN007',
        title: 'Sistem Informasi Tracer Study Alumni Institut Teknologi Batam Berbasis Web'
    },
    {
        nim: '1921012',
        status: 'revisi_sempro',
        progress: 'BAB III',
        dospem1: 'DOSEN008',
        dospem2: 'DOSEN001',
        title: 'Perancangan UI/UX Aplikasi Pembelajaran Interaktif Anak Menggunakan Design Thinking'
    },

    // --- STAGE 3: bimbingan_lanjut (4 students, finished Sempro revision, normal bimbingan Bab 4-5) ---
    {
        nim: '2221064',
        status: 'bimbingan_lanjut',
        progress: 'BAB IV',
        dospem1: 'DOSEN003',
        dospem2: 'DOSEN005',
        title: 'Rancang Bangun Sistem Keamanan Kandang Menggunakan Arduino dan Telegram Bot'
    },
    {
        nim: '2221042',
        status: 'bimbingan_lanjut',
        progress: 'BAB IV',
        dospem1: 'DOSEN004',
        dospem2: 'DOSEN006',
        title: 'Analisis Kinerja Website E-Government Menggunakan Metode Webqual 4.0'
    },
    {
        nim: '2221045',
        status: 'bimbingan_lanjut',
        progress: 'BAB IV',
        dospem1: 'DOSEN007',
        dospem2: 'DOSEN001',
        title: 'Sistem Informasi Penyewaan Kamar Kos Berbasis Geolocation'
    },
    {
        nim: '2221011',
        status: 'bimbingan_lanjut',
        progress: 'BAB IV',
        dospem1: 'DOSEN008',
        dospem2: 'DOSEN002',
        title: 'Penerapan Metode Agile Scrum Pada Rancang Bangun Aplikasi CRM UMKM'
    },

    // --- STAGE 4: revisi_semhas (4 students, finished Semhas, in revision with examiners) ---
    {
        nim: '2221049',
        status: 'revisi_semhas',
        progress: 'BAB V',
        dospem1: 'DOSEN005',
        dospem2: 'DOSEN007',
        title: 'Sistem Pakar Diagnosa Penyakit Tanaman Hidroponik Menggunakan Forward Chaining'
    },
    {
        nim: '2421035',
        status: 'revisi_semhas',
        progress: 'BAB V',
        dospem1: 'DOSEN006',
        dospem2: 'DOSEN008',
        title: 'Analisis Pengaruh Keamanan Informasi Terhadap Kepercayaan Pengguna Fintech'
    },
    {
        nim: '2221033',
        status: 'revisi_semhas',
        progress: 'BAB V',
        dospem1: 'DOSEN001',
        dospem2: 'DOSEN003',
        title: 'Rancang Bangun E-Learning Interaktif Dengan Fitur Gamifikasi'
    },
    {
        nim: '2221025',
        status: 'revisi_semhas',
        progress: 'BAB V',
        dospem1: 'DOSEN002',
        dospem2: 'DOSEN004',
        title: 'Sistem Informasi Penjadwalan Rapat Internal Perusahaan Berbasis Web'
    },

    // --- STAGE 5: revisi_sidang (4 students, finished Sidang Akhir, in revision with examiners) ---
    {
        nim: '2221030',
        status: 'revisi_sidang',
        progress: 'BAB VI',
        dospem1: 'DOSEN007',
        dospem2: 'DOSEN004',
        title: 'Penerapan Algoritma K-Means Untuk Segmentasi Pelanggan Toko Retail'
    },
    {
        nim: '2221028',
        status: 'revisi_sidang',
        progress: 'BAB VI',
        dospem1: 'DOSEN008',
        dospem2: 'DOSEN005',
        title: 'Rancang Bangun Aplikasi Monitoring Kesehatan Ibu dan Anak Berbasis Mobile'
    },
    {
        nim: '2221004',
        status: 'revisi_sidang',
        progress: 'BAB VI',
        dospem1: 'DOSEN002',
        dospem2: 'DOSEN006',
        title: 'Analisis Keamanan Jaringan Nirkabel Menggunakan Metode Penetration Testing'
    },
    {
        nim: '2221050',
        status: 'revisi_sidang',
        progress: 'BAB VI',
        dospem1: 'DOSEN001',
        dospem2: 'DOSEN003',
        title: 'Pengembangan Chatbot Customer Service Berbasis NLP pada E-Commerce'
    },

    // --- STAGE 6: persiapan_wisuda (4 students, finished all revisions, waiting for graduation verification) ---
    {
        nim: '2221036',
        status: 'persiapan_wisuda',
        progress: 'Selesai',
        dospem1: 'DOSEN004',
        dospem2: 'DOSEN001',
        title: 'Penerapan Sistem Pendukung Keputusan Penentuan Kelayakan Kredit Rumah'
    },
    {
        nim: '2221032',
        status: 'persiapan_wisuda',
        progress: 'Selesai',
        dospem1: 'DOSEN005',
        dospem2: 'DOSEN002',
        title: 'Rancang Bangun Sistem Kehadiran Karyawan Menggunakan Deteksi Wajah'
    },
    {
        nim: '2221046',
        status: 'persiapan_wisuda',
        progress: 'Selesai',
        dospem1: 'DOSEN006',
        dospem2: 'DOSEN003',
        title: 'Sistem Informasi E-Koperasi Berbasis Web Mobile'
    },
    {
        nim: '2221017',
        status: 'persiapan_wisuda',
        progress: 'Selesai',
        dospem1: 'DOSEN008',
        dospem2: 'DOSEN007',
        title: 'Optimasi Penjadwalan Mata Kuliah Menggunakan Algoritma Genetika'
    }
];

// Helper to create Bimbingan
const createBimbingan = async (studentId, dosenId, dType, category, version, title, catatan, status, feedback, daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return Bimbingan.create({
        mahasiswa: studentId,
        dosen: dosenId,
        dosenType: dType,
        kategoriBimbingan: category,
        version: `V${version}`,
        judul: title,
        catatan: catatan,
        fileName: `bimbingan_${studentId}_v${version}.pdf`,
        filePath: `uploads/bimbingan/bimbingan_${studentId}_v${version}.pdf`,
        fileSize: '1048576',
        fileOriginalName: `${title.replace(/\s+/g, '_')}_v${version}.pdf`,
        status: status,
        feedback: feedback,
        feedbackDate: status !== 'menunggu' ? date : null,
        createdAt: date,
        updatedAt: date
    });
};

// Helper to create Jadwal
const createJadwal = async (studentId, type, daysAgo, time, room, examiners, status, result, grade) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo); // Note: '-' to make it in the past
    return Jadwal.create({
        mahasiswa: studentId,
        jenisJadwal: type,
        tanggal: date,
        waktuMulai: time,
        waktuSelesai: time.replace(/(\d+):/, (m, p) => String(parseInt(p) + 2) + ':'),
        ruangan: room,
        penguji: examiners,
        status: status,
        hasil: result,
        nilaiSidang: grade,
        catatan: status === 'selesai' ? 'Sidang berjalan lancar.' : null
    });
};

async function seed() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!');

        // 1. Fetch Lecturers
        const lecturers = await User.find({ role: 'dosen' });
        console.log(`📋 Found ${lecturers.length} lecturers.`);
        const dmap = {};
        lecturers.forEach(l => {
            dmap[l.nim_nip] = l;
        });

        // Get 24 student records
        const targetNims = studentStages.map(s => s.nim);
        const students = await User.find({ nim_nip: { $in: targetNims } });
        console.log(`📋 Found ${students.length} of 24 target students.`);

        const smap = {};
        students.forEach(s => {
            smap[s.nim_nip] = s;
        });

        // 2. Clear old data for these 24 students
        const studentIds = students.map(s => s._id);
        await Bimbingan.deleteMany({ mahasiswa: { $in: studentIds } });
        await Jadwal.deleteMany({ mahasiswa: { $in: studentIds } });
        console.log('🧹 Cleared existing bimbingan and schedules for target students.');

        // 3. Process each student
        for (const config of studentStages) {
            const student = smap[config.nim];
            if (!student) {
                console.log(`⚠️ Student NIM ${config.nim} not found. Skipping.`);
                continue;
            }

            const d1 = dmap[config.dospem1];
            const d2 = dmap[config.dospem2];
            if (!d1 || !d2) {
                console.log(`⚠️ Dospems for student NIM ${config.nim} not found. Skipping.`);
                continue;
            }

            // Assign examiners: Pick two other lecturers not matching dospem1 or dospem2
            const availableExaminers = lecturers.filter(l => 
                l.nim_nip !== config.dospem1 && 
                l.nim_nip !== config.dospem2
            );
            const p1 = availableExaminers[0];
            const p2 = availableExaminers[1];

            console.log(`⚙️ Seeding NIM: ${config.nim} (${student.name}) - Stage: ${config.status}`);

            // Update user properties
            student.judulTA = config.title;
            student.statusMahasiswa = config.status;
            student.currentProgress = config.progress;
            student.dospem_1 = d1._id;
            student.dospem_2 = d2._id;

            // Set examiners for stages beyond pra_sempro
            if (config.status !== 'pra_sempro') {
                student.penguji_1 = p1._id;
                student.penguji_2 = p2._id;
            } else {
                student.penguji_1 = null;
                student.penguji_2 = null;
            }

            // Reset wisuda documents default
            student.dokumenWisuda = {
                skripsiFull: { fileName: null, filePath: null, fileSize: null, fileOriginalName: null, uploadedAt: null },
                pptSkripsi: { fileName: null, filePath: null, fileSize: null, fileOriginalName: null, uploadedAt: null },
                halamanPengesahan: { fileName: null, filePath: null, fileSize: null, fileOriginalName: null, uploadedAt: null },
                formBimbingan: { fileName: null, filePath: null, fileSize: null, fileOriginalName: null, uploadedAt: null },
                statusVerifikasi: 'belum_upload',
                catatanAdmin: null,
                verifiedAt: null
            };

            // Set wisuda upload for stage 6
            if (config.status === 'persiapan_wisuda') {
                const now = new Date();
                student.dokumenWisuda = {
                    skripsiFull: {
                        fileName: `skripsi_full_${config.nim}.pdf`,
                        filePath: `uploads/wisuda/skripsi_full_${config.nim}.pdf`,
                        fileSize: '4.5 MB',
                        fileOriginalName: 'Skripsi_Full_Draft_Akhir.pdf',
                        uploadedAt: now
                    },
                    pptSkripsi: {
                        fileName: `ppt_${config.nim}.pdf`,
                        filePath: `uploads/wisuda/ppt_${config.nim}.pdf`,
                        fileSize: '2.1 MB',
                        fileOriginalName: 'Presentasi_Sidang.pdf',
                        uploadedAt: now
                    },
                    halamanPengesahan: {
                        fileName: `pengesahan_${config.nim}.pdf`,
                        filePath: `uploads/wisuda/pengesahan_${config.nim}.pdf`,
                        fileSize: '1.2 MB',
                        fileOriginalName: 'Halaman_Pengesahan_Signed.pdf',
                        uploadedAt: now
                    },
                    formBimbingan: {
                        fileName: `logbook_${config.nim}.pdf`,
                        filePath: `uploads/wisuda/logbook_${config.nim}.pdf`,
                        fileSize: '1.8 MB',
                        fileOriginalName: 'Logbook_Bimbingan_All.pdf',
                        uploadedAt: now
                    },
                    statusVerifikasi: 'menunggu_verifikasi',
                    catatanAdmin: null,
                    verifiedAt: null
                };
            }

            await student.save();

            // --- History seeding depending on stage ---
            if (config.status === 'pra_sempro') {
                // Stage 1: Bab 1-3 bimbingan in progress, no exam schedule
                if (config.progress === 'BAB I') {
                    await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', 1, 'Draft Bab I Pendahuluan', 'Mohon bimbingan draf latar belakang pak.', 'revisi', 'Perbaiki latar belakang, fokuskan pada kontribusi penelitian.', 10);
                    await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', 2, 'Draft Bab I Pendahuluan (Revisi)', 'Perbaikan draf latar belakang sesuai arahan.', 'menunggu', null, 2);
                } else if (config.progress === 'BAB II') {
                    await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', 1, 'Draft Bab I', 'Bimbingan Bab I.', 'acc', 'ACC Bab 1, silakan lanjut bab 2.', 12);
                    await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', 2, 'Draft Bab II Landasan Teori', 'Bimbingan Bab II tentang pustaka pendukung.', 'revisi', 'Tambahkan pustaka jurnal 5 tahun terakhir.', 6);
                    await createBimbingan(student._id, d2._id, 'dospem_2', 'bimbingan_dospem', 1, 'Draft Bab I & II', 'Bimbingan dospem 2 Bab I dan II.', 'acc', 'ACC, tulisan rapi.', 4);
                }
            } 
            else if (config.status === 'revisi_sempro') {
                // Stage 2: Finished Sempro, in revision with examiners
                // 1. Dospem bimbingan history leading to sempro
                for (let v = 1; v <= 4; v++) {
                    await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', v, `Draft Bab ${v > 3 ? 3 : v}`, `Draf bimbingan dospem 1 V${v}`, 'acc', 'ACC, lanjutkan.', 25 - v * 4);
                    await createBimbingan(student._id, d2._id, 'dospem_2', 'bimbingan_dospem', v, `Draft Bab ${v > 3 ? 3 : v}`, `Draf bimbingan dospem 2 V${v}`, 'acc', 'Lanjutkan.', 25 - v * 4);
                }
                await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', 5, 'Proposal Final (Bab I-III)', 'ACC Sempro.', 'acc_sempro', 'ACC Seminar Proposal.', 6);
                await createBimbingan(student._id, d2._id, 'dospem_2', 'bimbingan_dospem', 5, 'Proposal Final (Bab I-III)', 'ACC Sempro.', 'acc_sempro', 'ACC Seminar Proposal.', 5);
                
                // 2. Sempro schedule
                await createJadwal(student._id, 'sidang_proposal', 4, '09:00', 'Ruang A301', [p1._id, p2._id], 'selesai', 'lulus_revisi', 80);

                // 3. Examiners revision bimbingan in progress
                await createBimbingan(student._id, p1._id, 'penguji_1', 'revisi_sempro', 1, 'Revisi Proposal - Penguji 1', 'Perbaikan metode penelitian sesuai catatan sidang.', 'menunggu', null, 1);
                await createBimbingan(student._id, p2._id, 'penguji_2', 'revisi_sempro', 1, 'Revisi Proposal - Penguji 2', 'Perbaikan batasan masalah.', 'revisi', 'Batasan masalah kurang spesifik.', 2);
            } 
            else if (config.status === 'bimbingan_lanjut') {
                // Stage 3: Finished Sempro revision, normal bimbingan Bab 4-5
                // 1. Dospem bimbingan history leading to sempro
                for (let v = 1; v <= 5; v++) {
                    await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', v, `Draft Bab ${v > 3 ? 3 : v}`, `Draf V${v}`, v === 5 ? 'acc_sempro' : 'acc', 'OK.', 40 - v * 5);
                    await createBimbingan(student._id, d2._id, 'dospem_2', 'bimbingan_dospem', v, `Draft Bab ${v > 3 ? 3 : v}`, `Draf V${v}`, v === 5 ? 'acc_sempro' : 'acc', 'OK.', 40 - v * 5);
                }
                // 2. Sempro schedule
                await createJadwal(student._id, 'sidang_proposal', 20, '10:00', 'Ruang B301', [p1._id, p2._id], 'selesai', 'lulus_revisi', 84);

                // 3. Examiner revision completed
                await createBimbingan(student._id, p1._id, 'penguji_1', 'revisi_sempro', 1, 'Revisi Sempro Penguji 1', 'Revisi.', 'acc', 'ACC Sempro.', 15);
                await createBimbingan(student._id, p2._id, 'penguji_2', 'revisi_sempro', 1, 'Revisi Sempro Penguji 2', 'Revisi.', 'acc', 'ACC Sempro.', 14);

                // 4. Current dospem bimbingan Bab IV
                await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', 6, 'Draft Bab IV Analisis', 'Bimbingan Bab IV pak.', 'menunggu', null, 2);
            } 
            else if (config.status === 'revisi_semhas') {
                // Stage 4: Finished Semhas, in revision with examiners
                // 1. Sempro schedule & Sempro revision history
                await createJadwal(student._id, 'sidang_proposal', 60, '09:00', 'Ruang A302', [p1._id, p2._id], 'selesai', 'lulus', 85);
                
                // 2. Dospem bimbingan history for Bab 4-5
                for (let v = 1; v <= 5; v++) {
                    await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', v, `Draft Bab ${v}`, `Draf V${v}`, 'acc', 'Lanjutkan.', 50 - v * 5);
                }
                for (let v = 6; v <= 9; v++) {
                    await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', v, `Draft Bab 4 dan 5`, `Draf V${v}`, 'acc', 'OK.', 30 - v * 2);
                }
                // ACC Semhas
                await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', 10, 'ACC Seminar Hasil (Bab I-V)', 'ACC Semhas.', 'acc', 'ACC Seminar Hasil.', 8);
                await createBimbingan(student._id, d2._id, 'dospem_2', 'bimbingan_dospem', 6, 'ACC Seminar Hasil (Bab I-V)', 'ACC Semhas.', 'acc', 'ACC Seminar Hasil.', 7);

                // 3. Semhas schedule
                await createJadwal(student._id, 'sidang_semhas', 4, '09:00', 'Ruang A303', [p1._id, p2._id], 'selesai', 'lulus_revisi', 82);

                // 4. Examiner revision in progress
                await createBimbingan(student._id, p1._id, 'penguji_1', 'revisi_semhas', 1, 'Revisi Semhas - Penguji 1', 'Perbaikan pembahasan bab IV.', 'menunggu', null, 1);
                await createBimbingan(student._id, p2._id, 'penguji_2', 'revisi_semhas', 1, 'Revisi Semhas - Penguji 2', 'Perbaikan format kesimpulan bab V.', 'revisi', 'Kesimpulan harus menjawab rumusan masalah.', 2);
            } 
            else if (config.status === 'revisi_sidang') {
                // Stage 5: Finished Sidang Akhir, in revision with examiners
                // 1. Sempro & Semhas schedules
                await createJadwal(student._id, 'sidang_proposal', 90, '09:00', 'Ruang A304', [p1._id, p2._id], 'selesai', 'lulus', 83);
                await createJadwal(student._id, 'sidang_semhas', 50, '11:00', 'Ruang A305', [p1._id, p2._id], 'selesai', 'lulus', 86);

                // 2. Dospem bimbingan Bab VI
                for (let v = 1; v <= 10; v++) {
                    await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', v, `Draft Bab ${v > 5 ? 5 : v}`, `Draf V${v}`, 'acc', 'Lanjutkan.', 80 - v * 5);
                }
                await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', 11, 'Draft Bab VI Penutup', 'Bimbingan Bab VI.', 'acc', 'ACC Bab VI.', 20);
                await createBimbingan(student._id, d1._id, 'dospem_1', 'bimbingan_dospem', 12, 'ACC Sidang Skripsi (Bab I-VI)', 'ACC Sidang.', 'acc', 'ACC Sidang Akhir.', 8);
                await createBimbingan(student._id, d2._id, 'dospem_2', 'bimbingan_dospem', 7, 'ACC Sidang Skripsi (Bab I-VI)', 'ACC Sidang.', 'acc', 'ACC Sidang Akhir.', 7);

                // 3. Sidang Skripsi schedule
                await createJadwal(student._id, 'sidang_skripsi', 3, '14:00', 'Ruang Sidang Utama', [p1._id, p2._id], 'selesai', 'lulus_revisi', 87);

                // 4. Examiner revision in progress
                await createBimbingan(student._id, p1._id, 'penguji_1', 'revisi_sidang', 1, 'Revisi Sidang - Penguji 1', 'Perbaikan format halaman pengesahan.', 'menunggu', null, 1);
                await createBimbingan(student._id, p2._id, 'penguji_2', 'revisi_sidang', 1, 'Revisi Sidang - Penguji 2', 'Penambahan landasan teori pustaka.', 'revisi', 'Tambahkan 2 jurnal rujukan terbaru.', 2);
            } 
            else if (config.status === 'persiapan_wisuda') {
                // Stage 6: Finished all, uploaded wisuda files, waiting for verification
                // 1. Sempro, Semhas, & Sidang Skripsi schedules
                await createJadwal(student._id, 'sidang_proposal', 120, '09:00', 'Ruang B304', [p1._id, p2._id], 'selesai', 'lulus', 88);
                await createJadwal(student._id, 'sidang_semhas', 80, '11:00', 'Ruang B305', [p1._id, p2._id], 'selesai', 'lulus', 90);
                await createJadwal(student._id, 'sidang_skripsi', 15, '09:00', 'Ruang Sidang Utama', [p1._id, p2._id], 'selesai', 'lulus', 92);

                // 2. Examiner revision completed
                await createBimbingan(student._id, p1._id, 'penguji_1', 'revisi_sidang', 1, 'Revisi Sidang Akhir Penguji 1', 'Revisi.', 'acc', 'ACC Sidang.', 12);
                await createBimbingan(student._id, p2._id, 'penguji_2', 'revisi_sidang', 1, 'Revisi Sidang Akhir Penguji 2', 'Revisi.', 'acc', 'ACC Sidang.', 11);
            }
        }

        console.log('\n🚀 ALL TARGET STUDENTS SEEDED SUCCESSFULLY!');
        console.log('Each of the 8 lecturers now has:');
        console.log('- 1 student in pra_sempro (Stage 1)');
        console.log('- 1 student in revisi_sempro (Stage 2)');
        console.log('- 1 student in bimbingan_lanjut (Stage 3)');
        console.log('- 1 student in revisi_semhas (Stage 4)');
        console.log('- 1 student in revisi_sidang (Stage 5)');
        console.log('- 1 student in persiapan_wisuda (Stage 6)');

    } catch (e) {
        console.error('❌ Error during seeding:', e);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
}

seed();
