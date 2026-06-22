/**
 * ====================================================================
 * Seed Existing Dummy Data - 18 Existing Students
 * ====================================================================
 * This script seeds guidance histories and schedules for 18 students
 * who are ALREADY present in the database.
 * 
 * It queries each student's actual dospem_1 & dospem_2, and dynamically
 * sets penguji_1 & penguji_2 from other lecturers in the database.
 * 
 * Usage: node scripts/seedExistingDummyData.js
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Bimbingan = require('../models/Bimbingan');
const Jadwal = require('../models/Jadwal');

const MONGODB_URI = process.env.MONGODB_URI;

// Map of the 18 target students to seed
const studentMap = {
    // --- FASE SEMPRO (6 ORANG) ---
    '2321053': { status: 'pra_sempro', progress: 'BAB I' },
    '2421051': { status: 'pra_sempro', progress: 'BAB II' },
    '2221015': { status: 'pra_sempro', progress: 'BAB III' },
    '2221053': { status: 'menunggu_sempro', progress: 'BAB III' },
    '2221057': { status: 'menunggu_sempro', progress: 'BAB III' },
    '2221006': { status: 'menunggu_sempro', progress: 'BAB III' },

    // --- FASE SETELAH SEMPRO (6 ORANG) ---
    '2421046': { status: 'revisi_sempro', progress: 'BAB III' },
    '1921012': { status: 'revisi_sempro', progress: 'BAB III' },
    '2221064': { status: 'bimbingan_lanjut', progress: 'BAB IV' },
    '2221042': { status: 'bimbingan_lanjut', progress: 'BAB V' },
    '2221045': { status: 'menunggu_semhas', progress: 'BAB V' },
    '2221011': { status: 'menunggu_semhas', progress: 'BAB V' },

    // --- FASE AKHIR / SUDAH BIMBINGAN (6 ORANG) ---
    '2221049': { status: 'bimbingan_akhir', progress: 'BAB VI' },
    '2421035': { status: 'bimbingan_akhir', progress: 'BAB VI' },
    '2221033': { status: 'menunggu_sidang', progress: 'BAB VI' },
    '2221025': { status: 'menunggu_sidang', progress: 'BAB VI' },
    '2221030': { status: 'selesai', progress: 'Selesai' },
    '2221028': { status: 'selesai', progress: 'Selesai' }
};

const nims = Object.keys(studentMap);

const titles = {
    '2321053': "Rancang Bangun Sistem Informasi Bimbingan Skripsi Berbasis Web Dengan Metode Prototyping Untuk Meningkatkan Efektivitas Komunikasi",
    '2421051': "Sistem Informasi Inventaris Lab Berbasis IoT Menggunakan RFID",
    '2221015': "Analisis Kepuasan Pengguna Aplikasi Mobile Banking Menggunakan Metode Delone & McLean",
    '2221053': "Rancang Bangun E-Commerce Produk Pertanian Lokal Berbasis Web",
    '2221057': "Sistem Pendukung Keputusan Pemilihan Karyawan Terbaik Menggunakan Metode SAW",
    '2221006': "Penerapan Algoritma Naive Bayes Untuk Analisis Sentimen Ulasan Aplikasi",
    '2421046': "Sistem Informasi Tracer Study Alumni Institut Teknologi Batam Berbasis Web",
    '1921012': "Perancangan UI/UX Aplikasi Pembelajaran Interaktif Anak Menggunakan Design Thinking",
    '2221064': "Rancang Bangun Sistem Keamanan Kandang Menggunakan Arduino dan Telegram Bot",
    '2221042': "Analisis Kinerja Website E-Government Menggunakan Metode Webqual 4.0",
    '2221045': "Sistem Informasi Penyewaan Kamar Kos Berbasis Geolocation",
    '2221011': "Penerapan Metode Agile Scrum Pada Rancang Bangun Aplikasi CRM UMKM",
    '2221049': "Sistem Pakar Diagnosa Penyakit Tanaman Hidroponik Menggunakan Forward Chaining",
    '2421035': "Analisis Pengaruh Keamanan Informasi Terhadap Kepercayaan Pengguna Fintech",
    '2221033': "Rancang Bangun E-Learning Interaktif Dengan Fitur Gamifikasi",
    '2221025': "Sistem Informasi Penjadwalan Rapat Internal Perusahaan Berbasis Web",
    '2221030': "Penerapan Algoritma K-Means Untuk Segmentasi Pelanggan Toko Retail",
    '2221028': "Rancang Bangun Aplikasi Monitoring Kesehatan Ibu dan Anak Berbasis Mobile"
};

async function seed() {
    console.log('\n=============================================================');
    console.log('🌱 STARTING SEEDER FOR EXISTING STUDENTS...');
    console.log('=============================================================\n');

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB.');

        // Get all lecturers to dynamically allocate examiners
        const lecturers = await User.find({ role: 'dosen', status: 'aktif' });
        if (lecturers.length < 4) {
            console.log('❌ Error: Not enough active Dosen accounts in DB to set up examiners. Need at least 4.');
            process.exit(1);
        }

        console.log(`ℹ️  Found ${lecturers.length} active lecturers.`);

        // Find existing students matching the 18 NIMs
        const students = await User.find({ nim_nip: { $in: nims } });
        console.log(`ℹ️  Found ${students.length} of the 18 students in your DB.`);

        // Log if any NIM is missing
        const foundNims = students.map(s => s.nim_nip);
        const missingNims = nims.filter(n => !foundNims.includes(n));
        if (missingNims.length > 0) {
            console.log(`⚠️  Warning: The following NIMs are missing from your DB and will be skipped: ${missingNims.join(', ')}`);
        }

        // Helper to insert a guidance submission record
        const createBimbinganRecord = async (student, dosen, type, version, status, title, cat, feedback, dateOffsetDays) => {
            const date = new Date();
            date.setDate(date.getDate() - dateOffsetDays);

            let k = 'bimbingan_dospem';
            if (type === 'penguji_1' || type === 'penguji_2') {
                if (student.statusMahasiswa === 'revisi_sempro' || student.statusMahasiswa === 'bimbingan_lanjut') k = 'revisi_sempro';
                else if (student.statusMahasiswa === 'revisi_semhas' || student.statusMahasiswa === 'bimbingan_akhir') k = 'revisi_semhas';
                else k = 'revisi_sidang';
            }

            return Bimbingan.create({
                mahasiswa: student._id,
                dosen: dosen._id,
                dosenType: type,
                kategoriBimbingan: k,
                version: `V${version}`,
                judul: title,
                catatan: cat,
                fileName: `bimbingan_${student.nim_nip}_v${version}.pdf`,
                filePath: `uploads/bimbingan/bimbingan_${student.nim_nip}_v${version}.pdf`,
                fileSize: '1543200',
                fileOriginalName: `${title.replace(/\s+/g, '_')}_v${version}.pdf`,
                status: status,
                feedback: feedback,
                feedbackDate: status !== 'menunggu' ? date : null,
                createdAt: date,
                updatedAt: date
            });
        };

        // Helper to insert a schedule
        const createJadwalRecord = async (student, jenis, dateOffsetDays, time, room, examiners, status, result, grade) => {
            const date = new Date();
            date.setDate(date.getDate() + dateOffsetDays);

            const validRooms = [
                'A301', 'A302', 'A303', 'A304', 'A305', 'A306', 'A307', 'A308', 'A309', 'A310', 'A311', 'A312', 'A313', 'A314', 'A315',
                'B301', 'B302', 'B303', 'B304', 'B305', 'B306', 'B307', 'B308', 'B309'
            ];
            let finalRoom = room;
            if (!validRooms.includes(room)) {
                let charCodeSum = 0;
                for (let idx = 0; idx < room.length; idx++) {
                    charCodeSum += room.charCodeAt(idx);
                }
                finalRoom = validRooms[charCodeSum % validRooms.length];
            }

            return Jadwal.create({
                mahasiswa: student._id,
                jenisJadwal: jenis,
                tanggal: date,
                waktuMulai: time,
                waktuSelesai: time.replace(/(\d+):/, (m, p) => String(parseInt(p) + 2) + ':'), // +2 hours
                ruangan: finalRoom,
                penguji: examiners.map(e => e._id),
                status: status,
                hasil: result,
                nilaiSidang: grade,
                catatan: status === 'selesai' ? 'Sidang dilaksanakan dengan tertib.' : null
            });
        };

        for (const stud of students) {
            const nim = stud.nim_nip;
            const target = studentMap[nim];
            const title = titles[nim] || stud.judulTA || 'Judul Tugas Akhir';

            console.log(`\n─────────────────────────────────────────────────────────────────`);
            console.log(`👤 Processing Mahasiswa: ${stud.name} (${nim})`);

            // Fetch dospems from document
            const d1 = stud.dospem_1;
            const d2 = stud.dospem_2;

            if (!d1 || !d2) {
                console.log(`⚠️  Skip: Student does not have dospem_1 or dospem_2 assigned!`);
                continue;
            }

            // Clean existing bimbingans and schedules for this student
            await Bimbingan.deleteMany({ mahasiswa: stud._id });
            await Jadwal.deleteMany({ mahasiswa: stud._id });
            console.log(`   ✅ Cleared old bimbingan and schedule logs.`);

            // Dynamically select two examiners (who are not dospem1 or dospem2)
            const availableExaminers = lecturers.filter(l => 
                l._id.toString() !== d1.toString() && 
                l._id.toString() !== d2.toString()
            );
            
            const p1 = availableExaminers[0];
            const p2 = availableExaminers[1] || availableExaminers[0]; // fallback if only 3 lecturers in DB

            // Update student's academic status, progress, title, and examiners in DB
            stud.statusMahasiswa = target.status;
            stud.currentProgress = target.progress;
            stud.judulTA = title;
            // Assign examiners if post-sempro
            if (target.status !== 'pra_sempro' && target.status !== 'menunggu_sempro') {
                stud.penguji_1 = p1._id;
                stud.penguji_2 = p2._id;
            } else {
                stud.penguji_1 = null;
                stud.penguji_2 = null;
            }
            await stud.save();
            console.log(`   ✅ Status updated to "${target.status}" (${target.progress})`);
            console.log(`   ✅ Examiners mapped: Penguji 1 = ${p1.name}, Penguji 2 = ${p2.name}`);

            // Populate dospem details for local use
            const dospem1Obj = await User.findById(d1);
            const dospem2Obj = await User.findById(d2);

            // --- SEED ACCORDING TO FASE ---

            if (nim === '2321053') {
                // pra_sempro, BAB I, in progress
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 1, 'revisi', 'Bab I Pendahuluan', 'Mohon dikoreksi bab 1 saya pak', 'Latar belakang kurang kuat, tambahkan data pendukung.', 10);
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 2, 'menunggu', 'Bab I Pendahuluan (Revisi)', 'Sudah diperbaiki latar belakangnya pak', null, 2);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 1, 'acc', 'Bab I & II Draft', 'Draft bab 1 dan bab 2 bu', 'Format penulisan oke, silakan lanjut.', 8);
            }
            else if (nim === '2421051') {
                // pra_sempro, BAB II, in progress
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 1, 'revisi', 'Bab I Pendahuluan', 'Draf Bab 1', 'Revisi tata bahasa.', 15);
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 2, 'lanjut_bab', 'Bab I Pendahuluan (Revisi)', 'Draf Bab 1 revisi', 'Bab 1 ACC, silakan lanjut bab 2.', 10);
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 3, 'menunggu', 'Bab II Landasan Teori', 'Landasan teori buatan saya pak', null, 3);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 1, 'revisi', 'Bab I & II Draft', 'Bab 1 dan 2', 'Landasan teori kurang lengkap, cari referensi jurnal.', 12);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 2, 'acc', 'Bab I & II Draft (Revisi)', 'Revisi Bab 1 & 2', 'ACC Bab 2.', 5);
            }
            else if (nim === '2221015') {
                // pra_sempro, BAB III, in progress
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 1, 'revisi', 'Bab I Draft', 'Draf bab 1', 'Perbaiki latar belakang.', 20);
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 2, 'lanjut_bab', 'Bab I Draft (Revisi)', 'Draf Bab 1 revisi', 'ACC Bab 1, lanjut Bab 2.', 16);
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 3, 'acc', 'Bab II Landasan Teori', 'Draf Bab 2', 'ACC Bab 2, lanjut Bab 3.', 10);
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 4, 'menunggu', 'Bab III Metodologi', 'Metodologi penelitian pak', null, 2);

                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 1, 'revisi', 'Bab I & II Draft', 'Draf Bab 1 & 2', 'Rapikan indentasi penulisan.', 18);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 2, 'lanjut_bab', 'Bab I & II Draft (Revisi)', 'Revisi Bab 1 & 2', 'ACC Bab 1-2, lanjut Bab 3.', 12);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 3, 'acc', 'Bab III Metodologi', 'Draf Bab 3', 'Metodologi sudah terstruktur. ACC.', 8);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 4, 'menunggu', 'Proposal Lengkap (BAB I - III)', 'Pengajuan proposal sempro bu', null, 1);
            }
            else if (['2221053', '2221057', '2221006'].includes(nim)) {
                // menunggu_sempro
                // Needs >= 5 bimbingan each with acc_sempro status at the end
                for (let v = 1; v <= 4; v++) {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', v, 'lanjut_bab', `Bab ${v} Draft`, `Draf bimbingan dospem 1 V${v}`, `Bagus, silakan dilanjutkan ke tahap berikutnya.`, 25 - (v * 4));
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', v, 'lanjut_bab', `Bab ${v} Draft`, `Draf bimbingan dospem 2 V${v}`, `Revisi minor selesai, lanjutkan.`, 25 - (v * 4));
                }
                // V5 is ACC SEMPRO
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 5, 'acc_sempro', 'Proposal Final (BAB I - III)', 'Pengajuan Seminar Proposal pak', 'ACC Maju Sempro. Persiapkan presentasi Anda.', 5);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 5, 'acc_sempro', 'Proposal Final (BAB I - III)', 'Pengajuan Seminar Proposal bu', 'ACC Sempro. Kuasai materi metodologi penelitian.', 4);

                // Add upcoming schedule
                const dateOffset = nim === '2221053' ? 3 : (nim === '2221057' ? 5 : 7);
                const time = nim === '2221053' ? '09:00' : (nim === '2221057' ? '11:00' : '14:00');
                await createJadwalRecord(stud, 'sidang_proposal', dateOffset, time, `Ruang Sidang ${nim === '2221053' ? 1 : 2}`, [p1, p2], 'dijadwalkan', null, null);
            }
            else if (nim === '2421046') {
                // revisi_sempro - in revision with examiners
                // 1. Create history of 5 bimbingan with dospems (acc_sempro)
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 30 - v);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 30 - v);
                }
                // 2. Create COMPLETED schedule (lulus_revisi)
                await createJadwalRecord(stud, 'sidang_proposal', -5, '09:00', 'Ruang Sidang 1', [p1, p2], 'selesai', 'lulus_revisi', 82);

                // 3. Create current revision bimbingans to examiners
                await createBimbinganRecord(stud, p1, 'penguji_1', 1, 'menunggu', 'Revisi Proposal - Metodologi', 'Perbaikan metodologi sesuai masukan sidang sempro kemarin pak.', null, 1);
                await createBimbinganRecord(stud, p2, 'penguji_2', 1, 'revisi', 'Revisi Proposal - Batasan Masalah', 'Perbaikan batasan masalah sesuai masukan sidang sempro kemarin bu.', 'Batasan masalah masih terlalu luas, persempit lagi.', 2);
            }
            else if (nim === '1921012') {
                // revisi_sempro - in revision with examiners
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 32 - v);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 32 - v);
                }
                await createJadwalRecord(stud, 'sidang_proposal', -6, '11:00', 'Ruang Sidang 2', [p1, p2], 'selesai', 'lulus_revisi', 78);

                // Revision history
                await createBimbinganRecord(stud, p1, 'penguji_1', 1, 'revisi', 'Revisi Bab I-III', 'Draft perbaikan pak', 'Revisi ulang landasan teori.', 4);
                await createBimbinganRecord(stud, p1, 'penguji_1', 2, 'acc', 'Revisi Bab I-III (Revisi 2)', 'Landasan teori sudah dilengkapi pak', 'Landasan teori OK. ACC Sempro.', 2);
                await createBimbinganRecord(stud, p2, 'penguji_2', 1, 'menunggu', 'Revisi Bab III Metodologi', 'Draf perbaikan metodologi bu', null, 1);
            }
            else if (nim === '2221064') {
                // bimbingan_lanjut, BAB IV
                // 1. Dospem bimbingan sempro (V1-V5)
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 45 - v);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 45 - v);
                }
                // 2. Sempro completed
                await createJadwalRecord(stud, 'sidang_proposal', -15, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 85);
                // 3. Current bimbingan BAB IV
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 6, 'menunggu', 'BAB IV Pembahasan & Hasil', 'Hasil analisis sistem yang saya buat pak', null, 2);
            }
            else if (nim === '2221042') {
                // bimbingan_lanjut, BAB V
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 50 - v);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 50 - v);
                }
                await createJadwalRecord(stud, 'sidang_proposal', -20, '10:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 80);

                // Bab IV bimbingan
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 6, 'acc', 'BAB IV Implementasi', 'Implementasi sistem pak', 'Bagus, lanjut bab 5.', 10);
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 7, 'menunggu', 'BAB V Kesimpulan & Saran', 'Kesimpulan tugas akhir pak', null, 1);

                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 6, 'acc', 'BAB IV Implementasi & Pengujian', 'Implementasi dan pengujian sistem bu', 'ACC Bab 4.', 8);
            }
            else if (['2221045', '2221011'].includes(nim)) {
                // menunggu_semhas
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 60 - v);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 60 - v);
                }
                await createJadwalRecord(stud, 'sidang_proposal', -30, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 88);

                // BAB IV-V bimbingan
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 6, 'acc', 'BAB IV Pembahasan', 'Bimbingan bab 4', 'ACC, lanjut bab 5.', 18);
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 7, 'acc', 'BAB V Kesimpulan', 'Bimbingan bab 5', 'ACC, kumpulkan draf semhas.', 10);

                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 6, 'acc', 'BAB IV-V Draft', 'Bimbingan bab 4-5', 'Lengkapi saran.', 16);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 7, 'acc', 'BAB IV-V Draft (Revisi)', 'Revisi Bab 5', 'ACC Semhas.', 9);

                // Upcoming semhas schedule
                const dateOffset = nim === '2221045' ? 4 : 6;
                await createJadwalRecord(stud, 'sidang_semhas', dateOffset, '10:00', `Ruang Sidang 1`, [p1, p2], 'dijadwalkan', null, null);
            }
            else if (nim === '2221049') {
                // bimbingan_akhir, BAB VI
                await createJadwalRecord(stud, 'sidang_proposal', -50, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 85);
                await createJadwalRecord(stud, 'sidang_semhas', -15, '09:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 83);

                // 3. Current bimbingan BAB VI
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 1, 'menunggu', 'BAB VI Penutup & Draft Skripsi Lengkap', 'Draf lengkap skripsi pak', null, 3);
            }
            else if (nim === '2421035') {
                // bimbingan_akhir, BAB VI
                await createJadwalRecord(stud, 'sidang_proposal', -60, '10:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 80);
                await createJadwalRecord(stud, 'sidang_semhas', -20, '10:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 82);

                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 1, 'revisi', 'BAB VI Draft Skripsi', 'Draf skripsi lengkap pak', 'Perbaiki format lampiran.', 10);
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 2, 'menunggu', 'BAB VI Draft Skripsi (Revisi)', 'Perbaikan lampiran pak', null, 2);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 1, 'acc', 'BAB VI Draft Skripsi', 'Draf skripsi lengkap bu', 'ACC, silakan upload ke dospem 1.', 5);
            }
            else if (['2221033', '2221025'].includes(nim)) {
                // menunggu_sidang
                await createJadwalRecord(stud, 'sidang_proposal', -70, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 88);
                await createJadwalRecord(stud, 'sidang_semhas', -35, '09:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 86);

                // Dospem final ACC bimbingan
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 1, 'acc_sempro', 'Draf Skripsi Lengkap', 'Pengajuan Sidang Skripsi pak', 'ACC Maju Sidang Skripsi.', 8);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 1, 'acc_sempro', 'Draf Skripsi Lengkap', 'Pengajuan Sidang Skripsi bu', 'ACC Sidang Skripsi.', 7);

                // Upcoming final defense schedule
                const dateOffset = nim === '2221033' ? 5 : 8;
                await createJadwalRecord(stud, 'sidang_skripsi', dateOffset, '09:00', `Ruang Sidang Utama`, [p1, p2], 'dijadwalkan', null, null);
            }
            else if (['2221030', '2221028'].includes(nim)) {
                // selesai
                await createJadwalRecord(stud, 'sidang_proposal', -100, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 90);
                await createJadwalRecord(stud, 'sidang_semhas', -60, '09:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 88);
                await createJadwalRecord(stud, 'sidang_skripsi', -15, '09:00', 'Ruang Sidang Utama', [p1, p2], 'selesai', 'lulus', 92);

                // Final revision with examiners (acc)
                await createBimbinganRecord(stud, p1, 'penguji_1', 1, 'acc', 'Revisi Laporan Akhir', 'Perbaikan bab pembahasan pak', 'ACC.', 10);
                await createBimbinganRecord(stud, p2, 'penguji_2', 1, 'acc', 'Revisi Laporan Akhir', 'Perbaikan bab kesimpulan bu', 'ACC.', 8);
            }

            console.log(`   ✅ Seeded guidance history & schedules successfully.`);
        }

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║   🎉 SEEDING COMPLETED SUCCESSFULLY!                       ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

    } catch (e) {
        console.error('❌ SEEDING FAILED:', e);
    } finally {
        await mongoose.disconnect();
        console.log('📴 Database connection closed.');
    }
}

seed();
