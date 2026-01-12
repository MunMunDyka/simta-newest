/**
 * Fix judulTA for Andhika
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function fixJudulTA() {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const db = mongoose.connection.db;

        // Check current judulTA
        const andhika = await db.collection('users').findOne({ nim_nip: '2321053' });
        console.log('Current judulTA:', andhika?.judulTA);

        if (!andhika?.judulTA) {
            // Update judulTA
            await db.collection('users').updateOne(
                { nim_nip: '2321053' },
                {
                    $set: {
                        judulTA: 'Rancang Bangun Sistem Informasi Bimbingan Skripsi Berbasis Web Dengan Metode Prototyping Untuk Meningkatkan Efektivitas Komunikasi dan Dokumentasi Revisi Mahasiswa Dengan Dosen Pembimbing'
                    }
                }
            );
            console.log('✅ judulTA updated!');
        } else {
            console.log('✅ judulTA already exists');
        }

        // Verify
        const updated = await db.collection('users').findOne({ nim_nip: '2321053' });
        console.log('Updated judulTA:', updated?.judulTA);

        await mongoose.disconnect();
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixJudulTA();
