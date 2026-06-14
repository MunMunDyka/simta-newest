/**
 * ===========================================
 * Database Seeder - Dosen Accounts
 * ===========================================
 * Script untuk menambahkan akun dosen ke database
 * 
 * Usage: node scripts/seedDosen.js
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

// Data dosen
const dosenList = [
    {
        nim_nip: 'DOSEN003',
        password: 'DOSEN003',
        plainPassword: 'DOSEN003',
        name: 'Assoc. Prof. Dr. Ir. Ririt Dwiputri Permatasari, S.T, M.SI',
        email: 'bankaipro142@gmail.com',
        role: 'dosen',
        status: 'aktif',
        whatsapp: '123'
    },
    {
        nim_nip: 'DOSEN004',
        password: 'DOSEN004',
        plainPassword: 'DOSEN004',
        name: 'Alhamidi, S.Kom., M.Kom.',
        email: 'bankaipro142@gmail.com',
        role: 'dosen',
        status: 'aktif',
        whatsapp: '123'
    },
    {
        nim_nip: 'DOSEN005',
        password: 'DOSEN005',
        plainPassword: 'DOSEN005',
        name: 'Refli Novigardi, S.Kom, M.Kom',
        email: 'bankaipro142@gmail.com',
        role: 'dosen',
        status: 'aktif',
        whatsapp: '123'
    },
    {
        nim_nip: 'DOSEN006',
        password: 'DOSEN006',
        plainPassword: 'DOSEN006',
        name: 'Faradiba Jabnabillah, S.Pd., M.Pd',
        email: 'bankaipro142@gmail.com',
        role: 'dosen',
        status: 'aktif',
        whatsapp: '123'
    },
    {
        nim_nip: 'DOSEN007',
        password: 'DOSEN007',
        plainPassword: 'DOSEN007',
        name: 'Fidya Farasalsabila, S.T, M.Kom',
        email: 'bankaipro142@gmail.com',
        role: 'dosen',
        status: 'aktif',
        whatsapp: '123'
    },
    {
        nim_nip: 'DOSEN008',
        password: 'DOSEN008',
        plainPassword: 'DOSEN008',
        name: 'Sasa Ani Arnomo, S.Kom., M.SI. Ph.D.',
        email: 'bankaipro142@gmail.com',
        role: 'dosen',
        status: 'aktif',
        whatsapp: '123'
    },
];

async function seedDosen() {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   🌱 SIMTA Seeder - Dosen Accounts                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('');

        let created = 0;
        let skipped = 0;

        for (const dosen of dosenList) {
            const existing = await User.findOne({ nim_nip: dosen.nim_nip });
            if (existing) {
                console.log(`⚠️  ${dosen.nim_nip} - ${dosen.name} (sudah ada, skip)`);
                skipped++;
            } else {
                await User.create(dosen);
                console.log(`✅ ${dosen.nim_nip} - ${dosen.name} (CREATED)`);
                created++;
            }
        }

        console.log('');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   ✅ SEEDING DOSEN COMPLETED!                              ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log(`📊 Hasil: ${created} dibuat, ${skipped} dilewati`);
        console.log('');
        console.log('📋 Login Credentials (password = NIP):');
        dosenList.forEach(d => {
            console.log(`   ${d.nim_nip} → ${d.name}`);
        });
        console.log('');

    } catch (error) {
        console.error('');
        console.error('❌ SEEDING FAILED!');
        console.error('Error:', error.message);
        console.error('');
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('📴 Database connection closed');
        process.exit(0);
    }
}

seedDosen();
