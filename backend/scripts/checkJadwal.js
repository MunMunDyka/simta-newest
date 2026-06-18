/**
 * Check Jadwal Script
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function checkJadwal() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const db = mongoose.connection.db;
        const jadwals = await db.collection('jadwals').find({}).toArray();
        console.log('\n=== JADWAL ===');
        console.log('Total:', jadwals.length);
        for (const j of jadwals) {
            const mhs = await db.collection('users').findOne({ _id: j.mahasiswa });
            console.log(`- ID: ${j._id}`);
            console.log(`  Mahasiswa: ${mhs ? mhs.name : 'Unknown'} (${j.mahasiswa})`);
            console.log(`  Tanggal: ${j.tanggal}`);
            console.log(`  Waktu Mulai: ${j.waktuMulai}`);
            console.log(`  Waktu Selesai: ${j.waktuSelesai}`);
            console.log(`  Ruangan: ${j.ruangan}`);
            console.log(`  Status: ${j.status}`);
            console.log('');
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkJadwal();
