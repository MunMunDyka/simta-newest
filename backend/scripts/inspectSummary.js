/**
 * Inspect Summary - Get status counts and full list of mahasiswa in DB
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function inspect() {
    try {
        await mongoose.connect(MONGODB_URI);
        
        // Count by status
        const counts = await User.aggregate([
            { $match: { role: 'mahasiswa' } },
            { $group: { _id: '$statusMahasiswa', count: { $sum: 1 } } }
        ]);

        console.log('\n📊 STATUS MAHASISWA COUNTS:');
        console.log('==========================');
        counts.forEach(c => {
            console.log(`- ${c._id || 'NULL'}: ${c.count} mahasiswa`);
        });

        // Get all students
        const students = await User.find({ role: 'mahasiswa' })
            .select('name nim_nip statusMahasiswa currentProgress dospem_1 dospem_2')
            .populate('dospem_1 dospem_2', 'name nim_nip')
            .lean();

        console.log(`\n📋 TOTAL STUDENTS: ${students.length}`);
        console.log('==========================');
        students.forEach((s, idx) => {
            console.log(`[${idx + 1}] NIM: ${s.nim_nip} | Nama: ${s.name}`);
            console.log(`    Status: ${s.statusMahasiswa} | Progress: ${s.currentProgress}`);
            console.log(`    Dospem 1: ${s.dospem_1 ? s.dospem_1.name : '-'} | Dospem 2: ${s.dospem_2 ? s.dospem_2.name : '-'}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

inspect();
