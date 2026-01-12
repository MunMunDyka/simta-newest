/**
 * Fix Database - Add missing user and fix mappings
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function fixDB() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const db = mongoose.connection.db;

        // Check if Andhika exists
        const andhika = await db.collection('users').findOne({
            _id: new mongoose.Types.ObjectId('69464c03d6ad2a2542726af3')
        });

        console.log('Andhika user:', andhika ? andhika.name : 'NOT FOUND');

        if (!andhika) {
            console.log('\n❌ User Andhika not found in database!');
            console.log('The bimbingan was submitted by a user that does not exist.');
            console.log('This should not happen - there might be a data integrity issue.');
        } else {
            console.log('\n✅ User found!');
            console.log('Name:', andhika.name);
            console.log('dospem_1:', andhika.dospem_1);
            console.log('dospem_2:', andhika.dospem_2);
        }

        // Get the bimbingan
        const bimbingan = await db.collection('bimbingans').findOne({});
        if (bimbingan) {
            console.log('\n=== BIMBINGAN DETAILS ===');
            console.log('Bimbingan ID:', bimbingan._id);
            console.log('Mahasiswa ID:', bimbingan.mahasiswa);
            console.log('Dosen ID:', bimbingan.dosen);

            // Check if dosen exists
            const dosen = await db.collection('users').findOne({
                _id: bimbingan.dosen
            });
            console.log('Dosen found:', dosen ? dosen.name : 'NOT FOUND');
        }

        await mongoose.disconnect();
        console.log('\nDone!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

fixDB();
