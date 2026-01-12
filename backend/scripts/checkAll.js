/**
 * Check All Database Details
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function checkAll() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!\n');

        const db = mongoose.connection.db;

        // Get ALL users with full details
        console.log('=== ALL USERS ===');
        const users = await db.collection('users').find({}).toArray();
        users.forEach(u => {
            console.log(`\nID: ${u._id}`);
            console.log(`Name: ${u.name}`);
            console.log(`NIM/NIP: ${u.nim_nip}`);
            console.log(`Role: ${u.role}`);
            console.log(`Email: ${u.email}`);
            if (u.dospem_1) console.log(`Dospem 1: ${u.dospem_1}`);
            if (u.dospem_2) console.log(`Dospem 2: ${u.dospem_2}`);
        });

        // Get ALL bimbingan
        console.log('\n\n=== ALL BIMBINGAN ===');
        const bimbingans = await db.collection('bimbingans').find({}).toArray();
        console.log(`Total: ${bimbingans.length}`);

        for (const b of bimbingans) {
            console.log(`\n--- Bimbingan ---`);
            console.log(`ID: ${b._id}`);
            console.log(`Judul: ${b.judul}`);
            console.log(`Status: ${b.status}`);
            console.log(`Mahasiswa ID: ${b.mahasiswa}`);
            console.log(`Dosen ID: ${b.dosen}`);
            console.log(`DosenType: ${b.dosenType}`);
            console.log(`Created: ${b.createdAt}`);

            // Find mahasiswa name
            const mhs = await db.collection('users').findOne({ _id: b.mahasiswa });
            console.log(`Mahasiswa Name: ${mhs ? mhs.name : 'NOT FOUND'}`);

            // Find dosen name
            const dsn = await db.collection('users').findOne({ _id: b.dosen });
            console.log(`Dosen Name: ${dsn ? dsn.name : 'NOT FOUND'}`);
        }

        // Check which dosen should see this bimbingan
        if (bimbingans.length > 0) {
            console.log('\n\n=== WHO SHOULD SEE THIS BIMBINGAN? ===');
            const b = bimbingans[0];
            console.log(`Bimbingan is for dosen ID: ${b.dosen}`);

            const targetDosen = await db.collection('users').findOne({ _id: b.dosen });
            console.log(`Login as: ${targetDosen?.name} (${targetDosen?.nim_nip})`);
            console.log(`Password: dosen123 (from seed)`);
        }

        await mongoose.disconnect();
        console.log('\n\nDone!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkAll();
