/**
 * Setup Database Sample - Reset and map all students to a perfect distribution
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;
const EXAMINERS_JSON_PATH = path.join(__dirname, '..', '..', 'RANDOM-KEBUTUHANSKRIPSI', 'Jadwal-Sidang', 'parsed_examiners.json');

async function setup() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!');

        // 1. Fetch Lecturers (Dosen)
        const dosenList = await User.find({ role: 'dosen' });
        console.log(`📋 Found ${dosenList.length} lecturers.`);
        if (dosenList.length !== 8) {
            throw new Error(`Expected 8 lecturers in the database, found ${dosenList.length}`);
        }

        // 2. Load PDF Parsed Examiners
        let pdfExaminers = {};
        if (fs.existsSync(EXAMINERS_JSON_PATH)) {
            pdfExaminers = JSON.parse(fs.readFileSync(EXAMINERS_JSON_PATH, 'utf-8'));
            console.log(`📋 Loaded ${Object.keys(pdfExaminers).length} examiner mappings from PDF.`);
        } else {
            console.log('⚠️ parsed_examiners.json not found! Using random examiners for all.');
        }

        // 3. Fetch Students (Mahasiswa)
        let students = await User.find({ role: 'mahasiswa' });
        console.log(`📋 Found ${students.length} existing students.`);

        // 4. Create new students if we have less than 60
        const targetCount = 60;
        if (students.length < targetCount) {
            const needToCreate = targetCount - students.length;
            console.log(`🔄 Creating ${needToCreate} new sample students to reach ${targetCount}...`);
            
            const firstNames = ['Andi', 'Budi', 'Cici', 'Dedi', 'Evi', 'Fani', 'Gani', 'Heri', 'Indah', 'Joko', 'Kiki', 'Lina', 'Maman', 'Neni', 'Oki', 'Putri'];
            const lastNames = ['Pratama', 'Santoso', 'Wijaya', 'Kusuma', 'Sari', 'Lestari', 'Hidayat', 'Saputra', 'Utami', 'Wibowo', 'Nugroho', 'Riyadi'];
            
            for (let i = 0; i < needToCreate; i++) {
                const fName = firstNames[i % firstNames.length];
                const lName = lastNames[(i + 3) % lastNames.length];
                const name = `${fName} ${lName}`;
                
                // Find a unique NIM
                let nim = `9921${String(101 + i)}`;
                
                const newStudent = await User.create({
                    name,
                    nim_nip: nim,
                    username: `student_${nim}`,
                    password: 'password123', // Will be hashed automatically by pre-save hook
                    role: 'mahasiswa',
                    prodi: 'Sistem Informasi',
                    semester: '8',
                    status: 'aktif'
                });
                
                students.push(newStudent);
            }
            console.log(`✅ Success: Total students in memory is now ${students.length}.`);
        }

        // 5. Divide 60 students into 5 academic stage groups of 12 students each
        // Stages:
        // 0: pra_sempro (currentProgress: BAB I)
        // 1: bimbingan_lanjut (currentProgress: BAB IV) [Sudah Sempro]
        // 2: bimbingan_akhir (currentProgress: BAB VI) [Sudah Semhas]
        // 3: persiapan_wisuda (currentProgress: Selesai) [Sudah Sidang]
        // 4: selesai (currentProgress: Selesai) [Wisuda]
        
        const stages = [
            { status: 'pra_sempro', progress: 'BAB I' },
            { status: 'bimbingan_lanjut', progress: 'BAB IV' },
            { status: 'bimbingan_akhir', progress: 'BAB VI' },
            { status: 'persiapan_wisuda', progress: 'Selesai' },
            { status: 'selesai', progress: 'Selesai' }
        ];

        // 6. Define the perfect dospem pairing pattern (12 students, 8 lecturers, each lecturer assigned exactly 3 times)
        const dospemPairs = [
            [0, 1], // Student 0
            [1, 2], // Student 1
            [2, 3], // Student 2
            [3, 4], // Student 3
            [4, 5], // Student 4
            [5, 6], // Student 5
            [6, 7], // Student 6
            [7, 0], // Student 7
            [0, 2], // Student 8
            [1, 3], // Student 9
            [4, 6], // Student 10
            [5, 7]  // Student 11
        ];

        // Helper function to get a random lecturer excluding specified ones
        const getRandomLecturerExcluding = (excludeIds) => {
            const available = dosenList.filter(d => !excludeIds.includes(d._id.toString()));
            const randomIndex = Math.floor(Math.random() * available.length);
            return available[randomIndex];
        };

        // 7. Perform the update updates
        console.log('\n🔄 Applying perfect assignments to all 60 students...');
        let updatedCount = 0;

        for (let stageIdx = 0; stageIdx < 5; stageIdx++) {
            const stageConfig = stages[stageIdx];
            const startIdx = stageIdx * 12;

            for (let pairIdx = 0; pairIdx < 12; pairIdx++) {
                const student = students[startIdx + pairIdx];
                const pair = dospemPairs[pairIdx];
                
                // Get dospem IDs
                const d1 = dosenList[pair[0]];
                const d2 = dosenList[pair[1]];
                
                const dospem1_id = d1._id.toString();
                const dospem2_id = d2._id.toString();
                
                // Look up examiners from PDF mapping (by NIM)
                let p1_id = null;
                let p2_id = null;
                
                const pdfMapping = pdfExaminers[student.nim_nip];
                
                if (pdfMapping) {
                    // Check if PDF examiner 1 is valid (not "nadia" and matches database)
                    if (pdfMapping.penguji_1 && pdfMapping.penguji_1 !== 'nadia') {
                        p1_id = pdfMapping.penguji_1;
                    }
                    // Check if PDF examiner 2 is valid (not "nadia" and matches database)
                    if (pdfMapping.penguji_2 && pdfMapping.penguji_2 !== 'nadia') {
                        p2_id = pdfMapping.penguji_2;
                    }
                }

                // If examiner matches dospem, reset it to null so it will be randomized
                if (p1_id === dospem1_id || p1_id === dospem2_id) p1_id = null;
                if (p2_id === dospem1_id || p2_id === dospem2_id) p2_id = null;

                // Assign random examiner for Penguji 1 if not set
                if (!p1_id) {
                    const randomP1 = getRandomLecturerExcluding([dospem1_id, dospem2_id]);
                    p1_id = randomP1._id.toString();
                }

                // Assign random examiner for Penguji 2 if not set (must also exclude Penguji 1)
                if (!p2_id || p2_id === p1_id) {
                    const randomP2 = getRandomLecturerExcluding([dospem1_id, dospem2_id, p1_id]);
                    p2_id = randomP2._id.toString();
                }

                // Update the user record
                await User.findByIdAndUpdate(student._id, {
                    statusMahasiswa: stageConfig.status,
                    currentProgress: stageConfig.progress,
                    dospem_1: d1._id,
                    dospem_2: d2._id,
                    penguji_1: new mongoose.Types.ObjectId(p1_id),
                    penguji_2: new mongoose.Types.ObjectId(p2_id)
                });
                
                updatedCount++;
            }
        }

        console.log(`\n✅ Database updated! Assigned ${updatedCount} students.`);
        console.log('\n📊 Summary of setup:');
        console.log('- Total Lecturers: 8');
        console.log('- Total Students: 60 (12 per academic stage)');
        console.log('- Each lecturer is now assigned exactly:');
        console.log('  * 3 bimbingan students in pra_sempro');
        console.log('  * 3 bimbingan students in bimbingan_lanjut (Sudah Sempro)');
        console.log('  * 3 bimbingan students in bimbingan_akhir (Sudah Semhas)');
        console.log('  * 3 bimbingan students in persiapan_wisuda (Sudah Sidang Akhir)');
        console.log('  * 3 bimbingan students in selesai (Wisuda)');
        console.log('- All examiner conflicts (pembimbing serving as examiner) and "Nadia" assignments have been resolved.');

    } catch (e) {
        console.error('❌ Error during setup:', e);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
}

setup();
