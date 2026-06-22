/**
 * ====================================================================
 * Seed Large Dummy Data - 18 Students in Various Academic Phases
 * ====================================================================
 * Script to populate database with realistic students, guidance history,
 * and defense schedules according to system rules.
 * 
 * Usage: node scripts/seedLargeDummyData.js
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Bimbingan = require('../models/Bimbingan');
const Jadwal = require('../models/Jadwal');

const MONGODB_URI = process.env.MONGODB_URI;

// Target student NIMs
const studentNims = Array.from({ length: 18 }, (_, i) => String(2321001 + i));

const titles = [
    "Sistem Informasi Inventaris Lab Berbasis IoT Menggunakan RFID",
    "Analisis Kepuasan Pengguna Aplikasi Mobile Banking Menggunakan Metode Delone & McLean",
    "Rancang Bangun E-Commerce Produk Pertanian Lokal Berbasis Web",
    "Sistem Pendukung Keputusan Pemilihan Karyawan Terbaik Menggunakan Metode SAW",
    "Penerapan Algoritma Naive Bayes Untuk Analisis Sentimen Ulasan Aplikasi SIMTA",
    "Sistem Informasi Tracer Study Alumni Institut Teknologi Batam Berbasis Web",
    "Perancangan UI/UX Aplikasi Pembelajaran Interaktif Anak Menggunakan Design Thinking",
    "Rancang Bangun Sistem Keamanan Kandang Menggunakan Arduino dan Telegram Bot",
    "Analisis Kinerja Website E-Government Menggunakan Metode Webqual 4.0",
    "Sistem Informasi Penyewaan Kamar Kos Berbasis Geolocation",
    "Penerapan Metode Agile Scrum Pada Rancang Bangun Aplikasi CRM UMKM",
    "Sistem Pakar Diagnosa Penyakit Tanaman Hidroponik Menggunakan Forward Chaining",
    "Analisis Pengaruh Keamanan Informasi Terhadap Kepercayaan Pengguna Fintech",
    "Rancang Bangun E-Learning Interaktif Dengan Fitur Gamifikasi",
    "Sistem Informasi Penjadwalan Rapat Internal Perusahaan Berbasis Web",
    "Penerapan Algoritma K-Means Untuk Segmentasi Pelanggan Toko Retail",
    "Rancang Bangun Aplikasi Monitoring Kesehatan Ibu dan Anak Berbasis Mobile",
    "Sistem Keamanan Pintu Rumah Berbasis Face Recognition Menggunakan Raspberry Pi"
];

async function seedData() {
    console.log('\n=============================================================');
    console.log('🌱 STARTING LARGE DUMMY DATA SEEDING (18 STUDENTS)...');
    console.log('=============================================================\n');

    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB.');

        // 1. Fetch available Dosens
        const dosens = await User.find({ role: 'dosen', status: 'aktif' }).limit(8);
        if (dosens.length < 4) {
            console.log('❌ Error: Please seed Dosen accounts first! Run node scripts/seedDosen.js');
            process.exit(1);
        }

        console.log(`ℹ️  Found ${dosens.length} active lecturers in database.`);

        // 2. Clear existing records for the 18 target students
        console.log('🔄 Cleaning up existing dummy data for students 2321001 - 2321018...');
        const existingUsers = await User.find({ nim_nip: { $in: studentNims } });
        const existingUserIds = existingUsers.map(u => u._id);

        await User.deleteMany({ _id: { $in: existingUserIds } });
        await Bimbingan.deleteMany({ mahasiswa: { $in: existingUserIds } });
        await Jadwal.deleteMany({ mahasiswa: { $in: existingUserIds } });
        console.log('✅ Cleanup complete.');

        // Helper to hash password
        const passwordHash = await bcrypt.hash('mahasiswa123', 10);

        // Define lecturers mapping helper
        const getLecturers = (index) => {
            // Distribute lecturers dynamically
            const dospem1 = dosens[index % dosens.length];
            const dospem2 = dosens[(index + 1) % dosens.length];
            const penguji1 = dosens[(index + 2) % dosens.length];
            const penguji2 = dosens[(index + 3) % dosens.length];
            return { dospem1, dospem2, penguji1, penguji2 };
        };

        // Create 18 students
        console.log('🔄 Seeding students...');
        const studentsList = [];
        const studentsData = [
            // --- FASE SEMPRO (6 ORANG) ---
            { nim: '2321001', name: 'Ahmad Fauzi', status: 'pra_sempro', progress: 'BAB I' },
            { nim: '2321002', name: 'Budi Santoso', status: 'pra_sempro', progress: 'BAB II' },
            { nim: '2321003', name: 'Citra Lestari', status: 'pra_sempro', progress: 'BAB III' },
            { nim: '2321004', name: 'Dewi Lestari', status: 'menunggu_sempro', progress: 'BAB III' },
            { nim: '2321005', name: 'Eko Prasetyo', status: 'menunggu_sempro', progress: 'BAB III' },
            { nim: '2321006', name: 'Fitriani', status: 'menunggu_sempro', progress: 'BAB III' },

            // --- FASE SETELAH SEMPRO (6 ORANG) ---
            { nim: '2321007', name: 'Gita Permata', status: 'revisi_sempro', progress: 'BAB III' },
            { nim: '2321008', name: 'Hendra Wijaya', status: 'revisi_sempro', progress: 'BAB III' },
            { nim: '2321009', name: 'Indah Sari', status: 'bimbingan_lanjut', progress: 'BAB IV' },
            { nim: '2321010', name: 'Joko Susilo', status: 'bimbingan_lanjut', progress: 'BAB V' },
            { nim: '2321011', name: 'Kartika Putri', status: 'menunggu_semhas', progress: 'BAB V' },
            { nim: '2321012', name: 'Lukman Hakim', status: 'menunggu_semhas', progress: 'BAB V' },

            // --- FASE AKHIR / SUDAH BIMBINGAN (6 ORANG) ---
            { nim: '2321013', name: 'Mega Utami', status: 'bimbingan_akhir', progress: 'BAB VI' },
            { nim: '2321014', name: 'Novi Andriani', status: 'bimbingan_akhir', progress: 'BAB VI' },
            { nim: '2321015', name: 'Oki Setiawan', status: 'menunggu_sidang', progress: 'BAB VI' },
            { nim: '2321016', name: 'Putri Lestari', status: 'menunggu_sidang', progress: 'BAB VI' },
            { nim: '2321017', name: 'Rian Hidayat', status: 'selesai', progress: 'Selesai' },
            { nim: '2321018', name: 'Siti Aminah', status: 'selesai', progress: 'Selesai' }
        ];

        for (let i = 0; i < studentsData.length; i++) {
            const data = studentsData[i];
            const { dospem1, dospem2, penguji1, penguji2 } = getLecturers(i);

            const user = await User.create({
                nim_nip: data.nim,
                password: passwordHash,
                plainPassword: 'mahasiswa123',
                name: data.name,
                email: `${data.name.toLowerCase().replace(/\s+/g, '')}@student.iteba.ac.id`,
                role: 'mahasiswa',
                prodi: 'Sistem Informasi',
                semester: '7',
                judulTA: titles[i],
                currentProgress: data.progress,
                statusMahasiswa: data.status,
                dospem_1: dospem1._id,
                dospem_2: dospem2._id,
                // Assign examiners if post-sempro
                penguji_1: (data.status !== 'pra_sempro' && data.status !== 'menunggu_sempro') ? penguji1._id : null,
                penguji_2: (data.status !== 'pra_sempro' && data.status !== 'menunggu_sempro') ? penguji2._id : null,
                status: 'aktif',
                whatsapp: '0812345678' + String(10 + i)
            });

            studentsList.push({
                user,
                dospem1,
                dospem2,
                penguji1,
                penguji2,
                status: data.status,
                progress: data.progress
            });
            console.log(`   └─ Student Created: ${user.name} (${user.nim_nip}) - Status: ${user.statusMahasiswa}`);
        }

        console.log('✅ Students seeded successfully.\n');

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

        console.log('🔄 Seeding bimbingan histories & schedules...');
        for (let i = 0; i < studentsList.length; i++) {
            const item = studentsList[i];
            const stud = item.user;
            const d1 = item.dospem1;
            const d2 = item.dospem2;
            const p1 = item.penguji1;
            const p2 = item.penguji2;

            // --- SEED ACCORDING TO FASE ---

            if (stud.nim_nip === '2321001') {
                // pra_sempro, BAB I, in progress
                await createBimbinganRecord(stud, d1, 'dospem_1', 1, 'revisi', 'Bab I Pendahuluan', 'Mohon dikoreksi bab 1 saya pak', 'Latar belakang kurang kuat, tambahkan data pendukung.', 10);
                await createBimbinganRecord(stud, d1, 'dospem_1', 2, 'menunggu', 'Bab I Pendahuluan (Revisi)', 'Sudah diperbaiki latar belakangnya pak', null, 2);
                await createBimbinganRecord(stud, d2, 'dospem_2', 1, 'acc', 'Bab I & II Draft', 'Draft bab 1 dan bab 2 bu', 'Format penulisan oke, silakan lanjut.', 8);
            }
            else if (stud.nim_nip === '2321002') {
                // pra_sempro, BAB II, in progress
                await createBimbinganRecord(stud, d1, 'dospem_1', 1, 'revisi', 'Bab I Pendahuluan', 'Draf Bab 1', 'Revisi tata bahasa.', 15);
                await createBimbinganRecord(stud, d1, 'dospem_1', 2, 'lanjut_bab', 'Bab I Pendahuluan (Revisi)', 'Draf Bab 1 revisi', 'Bab 1 ACC, silakan lanjut bab 2.', 10);
                await createBimbinganRecord(stud, d1, 'dospem_1', 3, 'menunggu', 'Bab II Landasan Teori', 'Landasan teori buatan saya pak', null, 3);
                await createBimbinganRecord(stud, d2, 'dospem_2', 1, 'revisi', 'Bab I & II Draft', 'Bab 1 dan 2', 'Landasan teori kurang lengkap, cari referensi jurnal.', 12);
                await createBimbinganRecord(stud, d2, 'dospem_2', 2, 'acc', 'Bab I & II Draft (Revisi)', 'Revisi Bab 1 & 2', 'ACC Bab 2.', 5);
            }
            else if (stud.nim_nip === '2321003') {
                // pra_sempro, BAB III, in progress
                await createBimbinganRecord(stud, d1, 'dospem_1', 1, 'revisi', 'Bab I Draft', 'Draf bab 1', 'Perbaiki latar belakang.', 20);
                await createBimbinganRecord(stud, d1, 'dospem_1', 2, 'lanjut_bab', 'Bab I Draft (Revisi)', 'Draf Bab 1 revisi', 'ACC Bab 1, lanjut Bab 2.', 16);
                await createBimbinganRecord(stud, d1, 'dospem_1', 3, 'acc', 'Bab II Landasan Teori', 'Draf Bab 2', 'ACC Bab 2, lanjut Bab 3.', 10);
                await createBimbinganRecord(stud, d1, 'dospem_1', 4, 'menunggu', 'Bab III Metodologi', 'Metodologi penelitian pak', null, 2);

                await createBimbinganRecord(stud, d2, 'dospem_2', 1, 'revisi', 'Bab I & II Draft', 'Draf Bab 1 & 2', 'Rapikan indentasi penulisan.', 18);
                await createBimbinganRecord(stud, d2, 'dospem_2', 2, 'lanjut_bab', 'Bab I & II Draft (Revisi)', 'Revisi Bab 1 & 2', 'ACC Bab 1-2, lanjut Bab 3.', 12);
                await createBimbinganRecord(stud, d2, 'dospem_2', 3, 'acc', 'Bab III Metodologi', 'Draf Bab 3', 'Metodologi sudah terstruktur. ACC.', 8);
                await createBimbinganRecord(stud, d2, 'dospem_2', 4, 'menunggu', 'Proposal Lengkap (BAB I - III)', 'Pengajuan proposal sempro bu', null, 1);
            }
            else if (['2321004', '2321005', '2321006'].includes(stud.nim_nip)) {
                // menunggu_sempro
                // Needs >= 5 bimbingan each with acc_sempro status at the end
                for (let v = 1; v <= 4; v++) {
                    await createBimbinganRecord(stud, d1, 'dospem_1', v, 'lanjut_bab', `Bab ${v} Draft`, `Draf bimbingan dospem 1 V${v}`, `Bagus, silakan dilanjutkan ke tahap berikutnya.`, 25 - (v * 4));
                    await createBimbinganRecord(stud, d2, 'dospem_2', v, 'lanjut_bab', `Bab ${v} Draft`, `Draf bimbingan dospem 2 V${v}`, `Revisi minor selesai, lanjutkan.`, 25 - (v * 4));
                }
                // V5 is ACC SEMPRO
                await createBimbinganRecord(stud, d1, 'dospem_1', 5, 'acc_sempro', 'Proposal Final (BAB I - III)', 'Pengajuan Seminar Proposal pak', 'ACC Maju Sempro. Persiapkan presentasi Anda.', 5);
                await createBimbinganRecord(stud, d2, 'dospem_2', 5, 'acc_sempro', 'Proposal Final (BAB I - III)', 'Pengajuan Seminar Proposal bu', 'ACC Sempro. Kuasai materi metodologi penelitian.', 4);

                // Add upcoming schedule
                const dateOffset = stud.nim_nip === '2321004' ? 3 : (stud.nim_nip === '2321005' ? 5 : 7);
                const time = stud.nim_nip === '2321004' ? '09:00' : (stud.nim_nip === '2321005' ? '11:00' : '14:00');
                await createJadwalRecord(stud, 'sidang_proposal', dateOffset, time, `Ruang Sidang ${i % 3 + 1}`, [p1, p2], 'dijadwalkan', null, null);
            }
            else if (stud.nim_nip === '2321007') {
                // revisi_sempro - in revision with examiners
                // 1. Create history of 5 bimbingan with dospems (acc_sempro)
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, d1, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 30 - v);
                    await createBimbinganRecord(stud, d2, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 30 - v);
                }
                // 2. Create COMPLETED schedule (lulus_revisi)
                await createJadwalRecord(stud, 'sidang_proposal', -5, '09:00', 'Ruang Sidang 1', [p1, p2], 'selesai', 'lulus_revisi', 82);

                // 3. Create current revision bimbingans to examiners
                await createBimbinganRecord(stud, p1, 'penguji_1', 1, 'menunggu', 'Revisi Proposal - Metodologi', 'Perbaikan metodologi sesuai masukan sidang sempro kemarin pak.', null, 1);
                await createBimbinganRecord(stud, p2, 'penguji_2', 1, 'revisi', 'Revisi Proposal - Batasan Masalah', 'Perbaikan batasan masalah sesuai masukan sidang sempro kemarin bu.', 'Batasan masalah masih terlalu luas, persempit lagi.', 2);
            }
            else if (stud.nim_nip === '2321008') {
                // revisi_sempro - in revision with examiners
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, d1, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 32 - v);
                    await createBimbinganRecord(stud, d2, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 32 - v);
                }
                await createJadwalRecord(stud, 'sidang_proposal', -6, '11:00', 'Ruang Sidang 2', [p1, p2], 'selesai', 'lulus_revisi', 78);

                // Revision history
                await createBimbinganRecord(stud, p1, 'penguji_1', 1, 'revisi', 'Revisi Bab I-III', 'Draft perbaikan pak', 'Revisi ulang landasan teori.', 4);
                await createBimbinganRecord(stud, p1, 'penguji_1', 2, 'acc', 'Revisi Bab I-III (Revisi 2)', 'Landasan teori sudah dilengkapi pak', 'Landasan teori OK. ACC Sempro.', 2);
                await createBimbinganRecord(stud, p2, 'penguji_2', 1, 'menunggu', 'Revisi Bab III Metodologi', 'Draf perbaikan metodologi bu', null, 1);
            }
            else if (stud.nim_nip === '2321009') {
                // bimbingan_lanjut, BAB IV
                // 1. Dospem bimbingan sempro (V1-V5)
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, d1, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 45 - v);
                    await createBimbinganRecord(stud, d2, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 45 - v);
                }
                // 2. Sempro completed
                await createJadwalRecord(stud, 'sidang_proposal', -15, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 85);
                // 3. Current bimbingan BAB IV
                await createBimbinganRecord(stud, d1, 'dospem_1', 6, 'menunggu', 'BAB IV Pembahasan & Hasil', 'Hasil analisis sistem yang saya buat pak', null, 2);
            }
            else if (stud.nim_nip === '2321010') {
                // bimbingan_lanjut, BAB V
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, d1, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 50 - v);
                    await createBimbinganRecord(stud, d2, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 50 - v);
                }
                await createJadwalRecord(stud, 'sidang_proposal', -20, '10:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 80);

                // Bab IV bimbingan
                await createBimbinganRecord(stud, d1, 'dospem_1', 6, 'acc', 'BAB IV Implementasi', 'Implementasi sistem pak', 'Bagus, lanjut bab 5.', 10);
                await createBimbinganRecord(stud, d1, 'dospem_1', 7, 'menunggu', 'BAB V Kesimpulan & Saran', 'Kesimpulan tugas akhir pak', null, 1);

                await createBimbinganRecord(stud, d2, 'dospem_2', 6, 'acc', 'BAB IV Implementasi & Pengujian', 'Implementasi dan pengujian sistem bu', 'ACC Bab 4.', 8);
            }
            else if (['2321011', '2321012'].includes(stud.nim_nip)) {
                // menunggu_semhas
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, d1, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 60 - v);
                    await createBimbinganRecord(stud, d2, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan V${v}`, 'ACC.', 60 - v);
                }
                await createJadwalRecord(stud, 'sidang_proposal', -30, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 88);

                // BAB IV-V bimbingan
                await createBimbinganRecord(stud, d1, 'dospem_1', 6, 'acc', 'BAB IV Pembahasan', 'Bimbingan bab 4', 'ACC, lanjut bab 5.', 18);
                await createBimbinganRecord(stud, d1, 'dospem_1', 7, 'acc', 'BAB V Kesimpulan', 'Bimbingan bab 5', 'ACC, kumpulkan draf semhas.', 10);

                await createBimbinganRecord(stud, d2, 'dospem_2', 6, 'acc', 'BAB IV-V Draft', 'Bimbingan bab 4-5', 'Lengkapi saran.', 16);
                await createBimbinganRecord(stud, d2, 'dospem_2', 7, 'acc', 'BAB IV-V Draft (Revisi)', 'Revisi Bab 5', 'ACC Semhas.', 9);

                // Upcoming semhas schedule
                const dateOffset = stud.nim_nip === '2321011' ? 4 : 6;
                await createJadwalRecord(stud, 'sidang_semhas', dateOffset, '10:00', `Ruang Sidang 1`, [p1, p2], 'dijadwalkan', null, null);
            }
            else if (stud.nim_nip === '2321013') {
                // bimbingan_akhir, BAB VI
                // 1. Sempro
                await createJadwalRecord(stud, 'sidang_proposal', -50, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 85);
                // 2. Semhas
                await createJadwalRecord(stud, 'sidang_semhas', -15, '09:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 83);

                // 3. Current bimbingan BAB VI
                await createBimbinganRecord(stud, d1, 'dospem_1', 1, 'menunggu', 'BAB VI Penutup & Draft Skripsi Lengkap', 'Draf lengkap skripsi pak', null, 3);
            }
            else if (stud.nim_nip === '2321014') {
                // bimbingan_akhir, BAB VI
                await createJadwalRecord(stud, 'sidang_proposal', -60, '10:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 80);
                await createJadwalRecord(stud, 'sidang_semhas', -20, '10:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 82);

                await createBimbinganRecord(stud, d1, 'dospem_1', 1, 'revisi', 'BAB VI Draft Skripsi', 'Draf skripsi lengkap pak', 'Perbaiki format lampiran.', 10);
                await createBimbinganRecord(stud, d1, 'dospem_1', 2, 'menunggu', 'BAB VI Draft Skripsi (Revisi)', 'Perbaikan lampiran pak', null, 2);
                await createBimbinganRecord(stud, d2, 'dospem_2', 1, 'acc', 'BAB VI Draft Skripsi', 'Draf skripsi lengkap bu', 'ACC, silakan upload ke dospem 1.', 5);
            }
            else if (['2321015', '2321016'].includes(stud.nim_nip)) {
                // menunggu_sidang
                await createJadwalRecord(stud, 'sidang_proposal', -70, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 88);
                await createJadwalRecord(stud, 'sidang_semhas', -35, '09:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 86);

                // Dospem final ACC bimbingan
                await createBimbinganRecord(stud, d1, 'dospem_1', 1, 'acc_sempro', 'Draf Skripsi Lengkap', 'Pengajuan Sidang Skripsi pak', 'ACC Maju Sidang Skripsi.', 8);
                await createBimbinganRecord(stud, d2, 'dospem_2', 1, 'acc_sempro', 'Draf Skripsi Lengkap', 'Pengajuan Sidang Skripsi bu', 'ACC Sidang Skripsi.', 7);

                // Upcoming final defense schedule
                const dateOffset = stud.nim_nip === '2321015' ? 5 : 8;
                await createJadwalRecord(stud, 'sidang_skripsi', dateOffset, '09:00', `Ruang Sidang Utama`, [p1, p2], 'dijadwalkan', null, null);
            }
            else if (['2321017', '2321018'].includes(stud.nim_nip)) {
                // selesai
                await createJadwalRecord(stud, 'sidang_proposal', -100, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 90);
                await createJadwalRecord(stud, 'sidang_semhas', -60, '09:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 88);
                await createJadwalRecord(stud, 'sidang_skripsi', -15, '09:00', 'Ruang Sidang Utama', [p1, p2], 'selesai', 'lulus', 92);

                // Final revision with examiners (acc)
                await createBimbinganRecord(stud, p1, 'penguji_1', 1, 'acc', 'Revisi Laporan Akhir', 'Perbaikan bab pembahasan pak', 'ACC.', 10);
                await createBimbinganRecord(stud, p2, 'penguji_2', 1, 'acc', 'Revisi Laporan Akhir', 'Perbaikan bab kesimpulan bu', 'ACC.', 8);
            }

            console.log(`   └─ Seeded guidance history & schedules for student: ${stud.name}`);
        }

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║   🎉 SEEDING LARGE DUMMY DATA COMPLETED SUCCESSFULLY!      ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

        // Print sample credentials
        console.log('📋 Login Credentials for Testing:');
        console.log('   All students have password: "mahasiswa123"');
        console.log('   - 2321001 (Ahmad Fauzi)     - Fase: pra_sempro (BAB I)');
        console.log('   - 2321004 (Dewi Lestari)    - Fase: menunggu_sempro (Scheduled)');
        console.log('   - 2321007 (Gita Permata)    - Fase: revisi_sempro (In revision)');
        console.log('   - 2321009 (Indah Sari)      - Fase: bimbingan_lanjut (BAB IV)');
        console.log('   - 2321011 (Kartika Putri)   - Fase: menunggu_semhas (Scheduled)');
        console.log('   - 2321013 (Mega Utami)      - Fase: bimbingan_akhir (BAB VI)');
        console.log('   - 2321015 (Oki Setiawan)    - Fase: menunggu_sidang (Scheduled)');
        console.log('   - 2321017 (Rian Hidayat)    - Fase: selesai (Graduated)');
        console.log('');

    } catch (error) {
        console.error('\n❌ SEEDING DUMMY DATA FAILED!');
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('📴 Database connection closed.');
        process.exit(0);
    }
}

seedData();
