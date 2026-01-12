/**
 * Fix Bimbingan Mapping
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function fixBimbingan() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!\n');

        const db = mongoose.connection.db;

        // Get the new users
        const andhika = await db.collection('users').findOne({ nim_nip: '2321053' });
        const alvendo = await db.collection('users').findOne({ nim_nip: 'DOSEN001' });

        console.log('Andhika ID:', andhika._id);
        console.log('Alvendo ID:', alvendo._id);

        // Update bimbingan to use new users
        const result = await db.collection('bimbingans').updateMany(
            {},
            {
                $set: {
                    mahasiswa: andhika._id,
                    dosen: alvendo._id
                }
            }
        );

        console.log(`\n✅ Updated ${result.modifiedCount} bimbingan records`);

        // Verify
        const bimbingan = await db.collection('bimbingans').findOne({});
        console.log('\nVerification:');
        console.log('Bimbingan mahasiswa:', bimbingan.mahasiswa);
        console.log('Bimbingan dosen:', bimbingan.dosen);

        await mongoose.disconnect();
        console.log('\nDone! Now login as:');
        console.log('- Mahasiswa: 2321053 / mahasiswa123');
        console.log('- Dosen: DOSEN001 / dosen123');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixBimbingan();
