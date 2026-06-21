/**
 * Inspect Students - Check existing mahasiswa in DB
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function inspect() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const students = await User.find({ role: 'mahasiswa' })
            .populate('dospem_1', 'name nim_nip')
            .populate('dospem_2', 'name nim_nip')
            .populate('penguji_1', 'name nim_nip')
            .populate('penguji_2', 'name nim_nip');

        console.log(`\nFound ${students.length} Mahasiswa:`);
        console.log('================================================================================');
        
        students.forEach((s, idx) => {
            console.log(`${idx + 1}. Nama  : ${s.name}`);
            console.log(`   NIM   : ${s.nim_nip}`);
            console.log(`   Status: ${s.statusMahasiswa} | Progress: ${s.currentProgress}`);
            console.log(`   Dospem 1: ${s.dospem_1 ? `${s.dospem_1.name} (${s.dospem_1.nim_nip})` : 'BELUM PLOTTING'}`);
            console.log(`   Dospem 2: ${s.dospem_2 ? `${s.dospem_2.name} (${s.dospem_2.nim_nip})` : 'BELUM PLOTTING'}`);
            console.log(`   Penguji 1: ${s.penguji_1 ? `${s.penguji_1.name} (${s.penguji_1.nim_nip})` : '-'}`);
            console.log(`   Penguji 2: ${s.penguji_2 ? `${s.penguji_2.name} (${s.penguji_2.nim_nip})` : '-'}`);
            console.log('--------------------------------------------------------------------------------');
        });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

inspect();
