/**
 * Create Schedules - Populate the Jadwal collection with real schedule data from PDF
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Jadwal = require('../models/Jadwal');

const MONGODB_URI = process.env.MONGODB_URI;
const FULL_SCHEDULES_PATH = path.join(__dirname, '..', '..', 'RANDOM-KEBUTUHANSKRIPSI', 'Jadwal-Sidang', 'full_schedules.json');

async function createSchedules() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!');

        // 1. Load JSON file
        if (!fs.existsSync(FULL_SCHEDULES_PATH)) {
            throw new Error(`full_schedules.json not found at ${FULL_SCHEDULES_PATH}`);
        }
        const fullSchedules = JSON.parse(fs.readFileSync(FULL_SCHEDULES_PATH, 'utf-8'));
        console.log(`📋 Loaded ${Object.keys(fullSchedules).length} schedules from JSON.`);

        // 2. Fetch an Admin to set as createdBy
        const adminUser = await User.findOne({ role: 'admin' });
        const adminId = adminUser ? adminUser._id : null;
        console.log(`📋 Admin user for createdBy: ${adminUser ? adminUser.name : 'None'}`);

        // 3. Clear existing Jadwal records
        console.log('\n🧹 Clearing all existing Jadwal records...');
        const delJadwal = await Jadwal.deleteMany({});
        console.log(`✅ Success: Deleted ${delJadwal.deletedCount} old schedule records.`);

        // 4. Create new schedules
        let createdCount = 0;
        for (const nim in fullSchedules) {
            const item = fullSchedules[nim];
            
            // Find student in DB
            const student = await User.findOne({ role: 'mahasiswa', nim_nip: nim });
            if (!student) {
                console.log(`ℹ️ Student with NIM ${nim} (${item.nama}) is not in DB. Skipping schedule creation.`);
                continue;
            }

            // Ensure they have examiners assigned (if not, use what we have on student record)
            const pengujiList = [];
            if (student.penguji_1) pengujiList.push(student.penguji_1);
            if (student.penguji_2) pengujiList.push(student.penguji_2);

            // Determine status and hasil based on student status
            let status = 'selesai';
            let hasil = 'lulus';
            let nilaiSidang = 82;
            
            if (student.statusMahasiswa === 'pra_sempro') {
                status = 'dijadwalkan';
                hasil = null;
                nilaiSidang = null;
            }

            // Parse date
            const tanggalStr = item.tanggal || '2026-04-06'; // fallback
            const tanggal = new Date(tanggalStr);

            // Create schedule document
            await Jadwal.create({
                mahasiswa: student._id,
                jenisJadwal: 'sidang_proposal',
                tanggal: tanggal,
                waktuMulai: item.waktuMulai,
                waktuSelesai: item.waktuSelesai,
                ruangan: item.ruangan,
                penguji: pengujiList,
                status: status,
                hasil: hasil,
                nilaiSidang: nilaiSidang,
                catatan: 'Dibuat otomatis dari data jadwal PDF',
                createdBy: adminId
            });

            createdCount++;
        }

        console.log(`\n🎉 Success: Created ${createdCount} proposal defense schedules based on PDF data!`);

    } catch (e) {
        console.error('❌ Error during schedule creation:', e);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
}

createSchedules();
