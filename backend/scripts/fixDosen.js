/**
 * Ensure DOSEN002 (Bu Rifa) can login with correct password
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function fixDosen002() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const db = mongoose.connection.db;

        // Check if DOSEN002 exists
        const rifa = await db.collection('users').findOne({ nim_nip: 'DOSEN002' });

        if (rifa) {
            console.log('\n✅ User DOSEN002 found:');
            console.log('  Name:', rifa.name);
            console.log('  Email:', rifa.email);
            console.log('  Role:', rifa.role);

            // Reset password to ensure it works
            const hashedPassword = await bcrypt.hash('dosen123', 12);
            await db.collection('users').updateOne(
                { nim_nip: 'DOSEN002' },
                { $set: { password: hashedPassword } }
            );
            console.log('\n✅ Password reset to: dosen123');
        } else {
            console.log('❌ DOSEN002 not found, creating...');

            const hashedPassword = await bcrypt.hash('dosen123', 12);

            await db.collection('users').insertOne({
                nim_nip: 'DOSEN002',
                name: "Rifa'atul Mahmudah Burhan, S.Kom.",
                email: 'rifaatul@iteba.ac.id',
                password: hashedPassword,
                role: 'dosen',
                status: 'aktif',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            console.log('✅ User DOSEN002 created!');
        }

        // Also ensure DOSEN001 password is correct
        const alvendo = await db.collection('users').findOne({ nim_nip: 'DOSEN001' });
        if (alvendo) {
            const hashedPassword = await bcrypt.hash('dosen123', 12);
            await db.collection('users').updateOne(
                { nim_nip: 'DOSEN001' },
                { $set: { password: hashedPassword } }
            );
            console.log('✅ DOSEN001 password also reset to: dosen123');
        }

        console.log('\n=== LOGIN CREDENTIALS ===');
        console.log('DOSEN 1 (Pak Alvendo):');
        console.log('  NIP: DOSEN001');
        console.log('  Password: dosen123');
        console.log('\nDOSEN 2 (Bu Rifa):');
        console.log('  NIP: DOSEN002');
        console.log('  Password: dosen123');
        console.log('\nMAHASISWA (Andhika):');
        console.log('  NIM: 2321053');
        console.log('  Password: mahasiswa123');

        await mongoose.disconnect();
        console.log('\nDone!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixDosen002();
