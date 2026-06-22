/**
 * ====================================================================
 * Seed All Students Dummy Data - 44 Students
 * ====================================================================
 * This script seeds realistic guidance histories and schedules for ALL
 * students currently in the database, distributing their statuses
 * evenly so that all lecturer accounts have active bimbingans to review.
 * 
 * It queries each student's actual dospem_1 & dospem_2, and dynamically
 * sets penguji_1 & penguji_2 from other lecturers in the database.
 * 
 * Usage: node scripts/seedAllStudentsDummy.js
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Bimbingan = require('../models/Bimbingan');
const Jadwal = require('../models/Jadwal');

const MONGODB_URI = process.env.MONGODB_URI;

// Order of statuses to distribute round-robin
const statusSequence = [
    'pra_sempro', 
    'menunggu_sempro', 
    'revisi_sempro', 
    'bimbingan_lanjut', 
    'menunggu_semhas', 
    'bimbingan_akhir', 
    'menunggu_sidang', 
    'selesai'
];

async function seedAll() {
    console.log('\n=============================================================');
    console.log('🌱 STARTING SEEDER FOR ALL 44 STUDENTS...');
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

        // Find all students
        const students = await User.find({ role: 'mahasiswa' });
        console.log(`ℹ️  Found ${students.length} students in database.`);

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

        let seededCount = 0;

        for (let i = 0; i < students.length; i++) {
            const stud = students[i];
            const nim = stud.nim_nip;

            // Fetch dospems from document
            const d1 = stud.dospem_1;
            const d2 = stud.dospem_2;

            if (!d1 || !d2) {
                console.log(`⚠️  Skip ${stud.name} (${nim}): Dospem not fully plotted!`);
                continue;
            }

            // Determine status round-robin
            const targetStatus = statusSequence[i % statusSequence.length];
            
            // Determine progress based on status
            let targetProgress = 'BAB I';
            if (targetStatus === 'pra_sempro') {
                targetProgress = i % 3 === 0 ? 'BAB I' : (i % 3 === 1 ? 'BAB II' : 'BAB III');
            } else if (targetStatus === 'menunggu_sempro' || targetStatus === 'revisi_sempro') {
                targetProgress = 'BAB III';
            } else if (targetStatus === 'bimbingan_lanjut') {
                targetProgress = i % 2 === 0 ? 'BAB IV' : 'BAB V';
            } else if (targetStatus === 'menunggu_semhas') {
                targetProgress = 'BAB V';
            } else if (targetStatus === 'bimbingan_akhir' || targetStatus === 'menunggu_sidang') {
                targetProgress = 'BAB VI';
            } else if (targetStatus === 'selesai') {
                targetProgress = 'Selesai';
            }

            // Clean existing bimbingans and schedules for this student
            await Bimbingan.deleteMany({ mahasiswa: stud._id });
            await Jadwal.deleteMany({ mahasiswa: stud._id });

            // Dynamically select two examiners (who are not dospem1 or dospem2)
            const availableExaminers = lecturers.filter(l => 
                l._id.toString() !== d1.toString() && 
                l._id.toString() !== d2.toString()
            );
            
            const p1 = availableExaminers[0];
            const p2 = availableExaminers[1] || availableExaminers[0]; // fallback

            // Update student status and progress in DB
            stud.statusMahasiswa = targetStatus;
            stud.currentProgress = targetProgress;
            if (targetStatus !== 'pra_sempro' && targetStatus !== 'menunggu_sempro') {
                stud.penguji_1 = p1._id;
                stud.penguji_2 = p2._id;
            } else {
                stud.penguji_1 = null;
                stud.penguji_2 = null;
            }
            await stud.save();

            // Populate dospems for local use
            const dospem1Obj = await User.findById(d1);
            const dospem2Obj = await User.findById(d2);

            // --- SEED BIMBINGAN HISTORY & SCHEDULES ACCORDING TO STATUS ---

            if (targetStatus === 'pra_sempro') {
                if (targetProgress === 'BAB I') {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 1, 'revisi', 'Bab I Pendahuluan', 'Revisi latar belakang pak', 'Latar belakang belum kuat.', 10);
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 2, 'menunggu', 'Bab I Pendahuluan (Revisi)', 'Sudah diperbaiki pak', null, 2);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 1, 'acc', 'Bab I Draft', 'Draf bab 1 bu', 'ACC, format penulisan sudah sesuai.', 8);
                } else if (targetProgress === 'BAB II') {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 1, 'revisi', 'Bab I Pendahuluan', 'Draf bab 1', 'Revisi tata bahasa.', 15);
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 2, 'lanjut_bab', 'Bab I Pendahuluan (Revisi)', 'Revisi draf', 'Bab 1 ACC, lanjut Bab 2.', 10);
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 3, 'menunggu', 'Bab II Landasan Teori', 'Landasan teori pak', null, 3);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 1, 'acc', 'Bab I & II Draft', 'Bab 1 dan 2 bu', 'Format oke, ACC.', 5);
                } else { // BAB III
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 1, 'acc', 'Bab I Draft', 'Bimbingan', 'ACC.', 20);
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 2, 'acc', 'Bab II Landasan Teori', 'Bimbingan', 'ACC.', 15);
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 3, 'menunggu', 'Bab III Metodologi', 'Bimbingan bab 3', null, 2);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 1, 'acc', 'Bab III Metodologi', 'Bimbingan bab 3', 'Metodologi terstruktur. ACC.', 5);
                }
            }
            else if (targetStatus === 'menunggu_sempro') {
                // Needs >= 5 bimbingan each with acc_sempro status at the end
                for (let v = 1; v <= 4; v++) {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', v, 'lanjut_bab', `Bab ${v} Draft`, `Bimbingan Dospem 1 V${v}`, `Bagus, lanjutkan.`, 20 - v);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', v, 'lanjut_bab', `Bab ${v} Draft`, `Bimbingan Dospem 2 V${v}`, `Revisi minor selesai.`, 20 - v);
                }
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 5, 'acc_sempro', 'Proposal Final (BAB I - III)', 'Pengajuan proposal sempro', 'ACC Maju Sempro.', 5);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 5, 'acc_sempro', 'Proposal Final (BAB I - III)', 'Pengajuan proposal sempro', 'ACC Sempro.', 4);

                // Add upcoming schedule
                await createJadwalRecord(stud, 'sidang_proposal', 5, '09:00', `Ruang Sidang ${i % 3 + 1}`, [p1, p2], 'dijadwalkan', null, null);
            }
            else if (targetStatus === 'revisi_sempro') {
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan`, 'ACC.', 25 - v);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan`, 'ACC.', 25 - v);
                }
                await createJadwalRecord(stud, 'sidang_proposal', -4, '10:00', 'Ruang Sidang 1', [p1, p2], 'selesai', 'lulus_revisi', 80);

                await createBimbinganRecord(stud, p1, 'penguji_1', 1, 'menunggu', 'Revisi Proposal - Metodologi', 'Perbaikan metodologi sesuai masukan sidang', null, 1);
                await createBimbinganRecord(stud, p2, 'penguji_2', 1, 'revisi', 'Revisi Proposal - Batasan Masalah', 'Perbaikan batasan masalah bu', 'Perjelas lagi batasan masalah.', 2);
            }
            else if (targetStatus === 'bimbingan_lanjut') {
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan`, 'ACC.', 35 - v);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan`, 'ACC.', 35 - v);
                }
                await createJadwalRecord(stud, 'sidang_proposal', -15, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 85);
                
                if (targetProgress === 'BAB IV') {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 6, 'menunggu', 'BAB IV Pembahasan & Hasil', 'Hasil analisis sistem yang saya buat pak', null, 2);
                } else {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 6, 'acc', 'BAB IV Implementasi', 'Implementasi sistem pak', 'Bagus, lanjut bab 5.', 8);
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 7, 'menunggu', 'BAB V Kesimpulan & Saran', 'Kesimpulan tugas akhir pak', null, 1);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 6, 'acc', 'BAB IV Pembahasan', 'Pembahasan bu', 'ACC.', 5);
                }
            }
            else if (targetStatus === 'menunggu_semhas') {
                for (let v = 1; v <= 5; v++) {
                    await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan`, 'ACC.', 45 - v);
                    await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', v, v === 5 ? 'acc_sempro' : 'acc', `Bab ${v} Draft`, `Bimbingan`, 'ACC.', 45 - v);
                }
                await createJadwalRecord(stud, 'sidang_proposal', -25, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 84);

                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 6, 'acc', 'BAB IV Pembahasan', 'Bimbingan bab 4', 'ACC, lanjut bab 5.', 18);
                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 7, 'acc', 'BAB V Kesimpulan', 'Bimbingan bab 5', 'ACC, kumpulkan draf semhas.', 10);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 6, 'acc', 'BAB IV-V Draft', 'Bimbingan bab 4-5', 'Lengkapi saran.', 12);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 7, 'acc', 'BAB IV-V Draft (Revisi)', 'Revisi Bab 5', 'ACC Semhas.', 5);

                // Upcoming semhas schedule
                await createJadwalRecord(stud, 'sidang_semhas', 6, '10:00', `Ruang Sidang 1`, [p1, p2], 'dijadwalkan', null, null);
            }
            else if (targetStatus === 'bimbingan_akhir') {
                await createJadwalRecord(stud, 'sidang_proposal', -60, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 85);
                await createJadwalRecord(stud, 'sidang_semhas', -15, '09:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 83);

                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 1, 'menunggu', 'BAB VI Penutup & Draft Skripsi Lengkap', 'Draf lengkap skripsi pak', null, 3);
            }
            else if (targetStatus === 'menunggu_sidang') {
                await createJadwalRecord(stud, 'sidang_proposal', -70, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 88);
                await createJadwalRecord(stud, 'sidang_semhas', -35, '09:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 86);

                await createBimbinganRecord(stud, dospem1Obj, 'dospem_1', 1, 'acc_sempro', 'Draf Skripsi Lengkap', 'Pengajuan Sidang Skripsi pak', 'ACC Maju Sidang Skripsi.', 8);
                await createBimbinganRecord(stud, dospem2Obj, 'dospem_2', 1, 'acc_sempro', 'Draf Skripsi Lengkap', 'Pengajuan Sidang Skripsi bu', 'ACC Sidang Skripsi.', 7);

                // Upcoming final defense schedule
                await createJadwalRecord(stud, 'sidang_skripsi', 7, '09:00', `Ruang Sidang Utama`, [p1, p2], 'dijadwalkan', null, null);
            }
            else if (targetStatus === 'selesai') {
                await createJadwalRecord(stud, 'sidang_proposal', -100, '09:00', 'Ruang 301', [p1, p2], 'selesai', 'lulus', 90);
                await createJadwalRecord(stud, 'sidang_semhas', -60, '09:00', 'Ruang 302', [p1, p2], 'selesai', 'lulus', 88);
                await createJadwalRecord(stud, 'sidang_skripsi', -15, '09:00', 'Ruang Sidang Utama', [p1, p2], 'selesai', 'lulus', 92);

                await createBimbinganRecord(stud, p1, 'penguji_1', 1, 'acc', 'Revisi Laporan Akhir', 'Perbaikan bab pembahasan pak', 'ACC.', 10);
                await createBimbinganRecord(stud, p2, 'penguji_2', 1, 'acc', 'Revisi Laporan Akhir', 'Perbaikan bab kesimpulan bu', 'ACC.', 8);
            }

            seededCount++;
        }

        console.log(`\n📊 SUMMARY:`);
        console.log(`   └─ Processed and Seeded ${seededCount} students in total.`);
        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║   🎉 ALL STUDENTS SEEDING COMPLETED SUCCESSFULLY!          ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

    } catch (e) {
        console.error('❌ SEEDING FAILED:', e);
    } finally {
        await mongoose.disconnect();
        console.log('📴 Database connection closed.');
    }
}

seedAll();
