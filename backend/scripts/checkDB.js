/**
 * Check Database Script
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function checkDB() {
    try {
        console.log('Connecting to MongoDB...');
        console.log('URI:', process.env.MONGODB_URI?.substring(0, 30) + '...');

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected!');

        const db = mongoose.connection.db;

        // Get users
        const users = await db.collection('users').find({}).toArray();
        console.log('\n=== USERS ===');
        users.forEach(u => {
            console.log(`- ${u.name} (${u.nim_nip}) [${u.role}] dospem1: ${u.dospem_1 || 'null'} dospem2: ${u.dospem_2 || 'null'}`);
        });

        // Get bimbingan
        const bimbingan = await db.collection('bimbingans').find({}).toArray();
        console.log('\n=== BIMBINGAN ===');
        console.log('Total:', bimbingan.length);
        bimbingan.forEach(b => {
            console.log(`- ID: ${b._id}`);
            console.log(`  Mahasiswa: ${b.mahasiswa}`);
            console.log(`  Dosen: ${b.dosen}`);
            console.log(`  Status: ${b.status}`);
            console.log(`  File: ${b.fileName}`);
            console.log('');
        });

        await mongoose.disconnect();
        console.log('\nDone!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkDB();
