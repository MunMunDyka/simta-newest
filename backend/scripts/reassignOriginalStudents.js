/**
 * Reassign Original Students - Clean up fake students and restore original students with correct dospems and PDF examiners
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Bimbingan = require('../models/Bimbingan');
const Jadwal = require('../models/Jadwal');

const MONGODB_URI = process.env.MONGODB_URI;
const EXAMINERS_JSON_PATH = path.join(__dirname, '..', '..', 'RANDOM-KEBUTUHANSKRIPSI', 'Jadwal-Sidang', 'parsed_examiners.json');
const MAHASISWA_LIST_PATH = path.join(__dirname, '..', '..', 'RANDOM-KEBUTUHANSKRIPSI', 'mahasiswalist.md');

// Map of Dosen Code to Database ObjectId
const dosenMap = {
    'DOSEN001': '69469901aec0334ba209ebf8', // Alvendo Wahyu Aranski M.Kom
    'DOSEN002': '69469901aec0334ba209ebf9', // Rifa'atul Mahmudah Burhan, S.Kom.
    'DOSEN003': '6a2959a73ae8e40a7f058495', // Assoc. Prof. Dr. Ir. Ririt Dwiputri Permatasari, S.T, M.SI
    'DOSEN004': '6a2959a73ae8e40a7f05849a', // Alhamidi, S.Kom., M.Kom.
    'DOSEN005': '6a2959a73ae8e40a7f05849d', // Refli Noviardi, S.Kom, M.Kom
    'DOSEN006': '6a2959a83ae8e40a7f0584a0', // Faradiba Jabnabillah, S.Pd., M.Pd
    'DOSEN007': '6a2959a83ae8e40a7f0584a3', // Fidya Farasalsabila, S.T, M.Kom
    'DOSEN008': '6a2959a93ae8e40a7f0584a6', // Sasa Ani Arnomo, S.Kom., M.SI. Ph.D.
};

async function run() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!');

        // 1. Find and delete fake students (NIM starting with 9921)
        console.log('\n🧹 Cleaning up fake students...');
        const fakeStudents = await User.find({ role: 'mahasiswa', nim_nip: /^9921/ });
        const fakeStudentIds = fakeStudents.map(s => s._id);

        if (fakeStudentIds.length > 0) {
            const delBimbingan = await Bimbingan.deleteMany({ mahasiswa: { $in: fakeStudentIds } });
            const delJadwal = await Jadwal.deleteMany({ mahasiswa: { $in: fakeStudentIds } });
            const delUsers = await User.deleteMany({ _id: { $in: fakeStudentIds } });
            console.log(`✅ Success: Deleted ${delUsers.deletedCount} fake students.`);
            console.log(`✅ Success: Deleted ${delBimbingan.deletedCount} associated bimbingan records.`);
            console.log(`✅ Success: Deleted ${delJadwal.deletedCount} associated jadwal records.`);
        } else {
            console.log('ℹ️ No fake students found to delete.');
        }

        // 2. Fetch the 8 active lecturers
        const dosenList = await User.find({ role: 'dosen' });
        console.log(`\n📋 Loaded ${dosenList.length} database lecturers.`);

        // 3. Load PDF Parsed Examiners
        let pdfExaminers = {};
        if (fs.existsSync(EXAMINERS_JSON_PATH)) {
            pdfExaminers = JSON.parse(fs.readFileSync(EXAMINERS_JSON_PATH, 'utf-8'));
            console.log(`📋 Loaded ${Object.keys(pdfExaminers).length} examiner mappings from PDF.`);
        } else {
            console.log('⚠️ parsed_examiners.json not found!');
        }

        // Helper to get random lecturer excluding certain IDs
        const getRandomLecturerExcluding = (excludeIds) => {
            const available = dosenList.filter(d => !excludeIds.includes(d._id.toString()));
            const randomIndex = Math.floor(Math.random() * available.length);
            return available[randomIndex];
        };

        // 4. Parse mahasiswalist.md to extract original students and dospems
        console.log('\n📖 Reading mahasiswalist.md...');
        const lines = fs.readFileSync(MAHASISWA_LIST_PATH, 'utf-8').split('\n');
        
        let originalStudents = [];
        // Typically lines start from index 3 (after headers)
        for (let i = 3; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split('\t');
            if (parts.length >= 7) {
                const name = parts[0].trim();
                const nim = parts[1].trim();
                const prodi = parts[2].trim();
                const semester = parts[3].trim();
                const judul = parts[4].trim();
                const dospem1_code = parts[5].trim();
                const dospem2_code = parts[6].trim();
                
                originalStudents.push({
                    name,
                    nim,
                    prodi,
                    semester,
                    judul,
                    dospem_1_id: dosenMap[dospem1_code],
                    dospem_2_id: dosenMap[dospem2_code]
                });
            }
        }
        
        console.log(`📋 Found ${originalStudents.length} original students in mahasiswalist.md.`);

        // 5. Reassign original student records
        let updatedCount = 0;
        const stages = [
            { status: 'pra_sempro', progress: 'BAB I' },
            { status: 'bimbingan_lanjut', progress: 'BAB IV' },
            { status: 'bimbingan_akhir', progress: 'BAB VI' },
            { status: 'persiapan_wisuda', progress: 'Selesai' },
            { status: 'selesai', progress: 'Selesai' }
        ];

        for (let idx = 0; idx < originalStudents.length; idx++) {
            const orig = originalStudents[idx];
            
            // Distribute stage: cycle through the 5 configs (approximately 9 of each status)
            const stageConfig = stages[idx % 5];
            
            // Find student in DB
            const studentUser = await User.findOne({ role: 'mahasiswa', nim_nip: orig.nim });
            if (!studentUser) {
                console.log(`⚠️ Student with NIM ${orig.nim} (${orig.name}) not found in database! Skipping.`);
                continue;
            }

            const dospem1_id = orig.dospem_1_id;
            const dospem2_id = orig.dospem_2_id;

            // Resolve Examiners from PDF
            let p1_id = null;
            let p2_id = null;
            
            const pdfMapping = pdfExaminers[orig.nim];
            
            if (pdfMapping) {
                if (pdfMapping.penguji_1 && pdfMapping.penguji_1 !== 'nadia') {
                    p1_id = pdfMapping.penguji_1;
                }
                if (pdfMapping.penguji_2 && pdfMapping.penguji_2 !== 'nadia') {
                    p2_id = pdfMapping.penguji_2;
                }
            }

            // Exclude dospems from being examiners
            const excludeForP1 = [dospem1_id, dospem2_id].filter(Boolean);
            if (p1_id && excludeForP1.includes(p1_id)) p1_id = null;
            
            if (!p1_id) {
                const randP1 = getRandomLecturerExcluding(excludeForP1);
                p1_id = randP1._id.toString();
            }

            const excludeForP2 = [dospem1_id, dospem2_id, p1_id].filter(Boolean);
            if (p2_id && excludeForP2.includes(p2_id)) p2_id = null;
            
            if (!p2_id) {
                const randP2 = getRandomLecturerExcluding(excludeForP2);
                p2_id = randP2._id.toString();
            }

            // Update user record
            await User.findByIdAndUpdate(studentUser._id, {
                name: orig.name,
                judulTA: orig.judul || studentUser.judulTA,
                statusMahasiswa: stageConfig.status,
                currentProgress: stageConfig.progress,
                dospem_1: dospem1_id ? new mongoose.Types.ObjectId(dospem1_id) : null,
                dospem_2: dospem2_id ? new mongoose.Types.ObjectId(dospem2_id) : null,
                penguji_1: new mongoose.Types.ObjectId(p1_id),
                penguji_2: new mongoose.Types.ObjectId(p2_id)
            });

            updatedCount++;
        }

        console.log(`\n✅ Database updated! Reassigned ${updatedCount} original students.`);
        console.log('🎉 Reset completed successfully! Database contains ONLY original students.');

    } catch (e) {
        console.error('❌ Error during run:', e);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
}

run();
