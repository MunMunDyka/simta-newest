/**
 * Add Custom Users - Andhika & Real Dospem
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function addCustomUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!\n');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Check if custom users exist
        const existingAndhika = await usersCollection.findOne({ nim_nip: '2321053' });
        const existingAlvendo = await usersCollection.findOne({ nim_nip: 'DOSEN001' });
        const existingRifa = await usersCollection.findOne({ nim_nip: 'DOSEN002' });

        let alvendo, rifa;

        // Create Dosen Alvendo
        if (!existingAlvendo) {
            const hashedPass = await bcrypt.hash('dosen123', 10);
            const result = await usersCollection.insertOne({
                nim_nip: 'DOSEN001',
                password: hashedPass,
                name: 'Alvendo Wahyu Aranski M.Kom',
                email: 'alvendo@iteba.ac.id',
                role: 'dosen',
                status: 'aktif',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            alvendo = { _id: result.insertedId, name: 'Alvendo Wahyu Aranski M.Kom' };
            console.log('✅ Created Dosen: Alvendo Wahyu Aranski M.Kom (DOSEN001)');
        } else {
            alvendo = existingAlvendo;
            console.log('ℹ️  Alvendo already exists');
        }

        // Create Dosen Rifa'atul
        if (!existingRifa) {
            const hashedPass = await bcrypt.hash('dosen123', 10);
            const result = await usersCollection.insertOne({
                nim_nip: 'DOSEN002',
                password: hashedPass,
                name: "Rifa'atul Mahmudah Burhan, S.Kom.",
                email: 'rifaatul@iteba.ac.id',
                role: 'dosen',
                status: 'aktif',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            rifa = { _id: result.insertedId, name: "Rifa'atul Mahmudah Burhan, S.Kom." };
            console.log("✅ Created Dosen: Rifa'atul Mahmudah Burhan, S.Kom. (DOSEN002)");
        } else {
            rifa = existingRifa;
            console.log('ℹ️  Rifa already exists');
        }

        // Get the correct IDs
        alvendo = await usersCollection.findOne({ nim_nip: 'DOSEN001' });
        rifa = await usersCollection.findOne({ nim_nip: 'DOSEN002' });

        // Create Mahasiswa Andhika
        if (!existingAndhika) {
            const hashedPass = await bcrypt.hash('mahasiswa123', 10);
            const result = await usersCollection.insertOne({
                nim_nip: '2321053',
                password: hashedPass,
                name: 'Andhika Laksmana Putra Alka',
                email: 'andhika@student.iteba.ac.id',
                role: 'mahasiswa',
                prodi: 'Sistem Informasi',
                semester: '7',
                judulTA: 'Rancang Bangun Sistem Informasi Bimbingan Skripsi Berbasis Web Dengan Metode Prototyping Untuk Meningkatkan Efektivitas Komunikasi dan Dokumentasi Revisi Mahasiswa Dengan Dosen Pembimbing',
                currentProgress: 'BAB III',
                status: 'aktif',
                dospem_1: alvendo._id,
                dospem_2: rifa._id,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('✅ Created Mahasiswa: Andhika Laksmana Putra Alka (2321053)');
            console.log(`   Dospem 1: ${alvendo.name}`);
            console.log(`   Dospem 2: ${rifa.name}`);
        } else {
            // Update existing Andhika with correct dospem
            await usersCollection.updateOne(
                { nim_nip: '2321053' },
                {
                    $set: {
                        dospem_1: alvendo._id,
                        dospem_2: rifa._id,
                        updatedAt: new Date()
                    }
                }
            );
            console.log('ℹ️  Andhika already exists, updated dospem references');
        }

        // Get Andhika's ID
        const andhika = await usersCollection.findOne({ nim_nip: '2321053' });

        // Update existing bimbingan to point to correct dosen (Alvendo)
        const bimbinganCollection = db.collection('bimbingans');
        const updated = await bimbinganCollection.updateMany(
            { mahasiswa: andhika._id },
            { $set: { dosen: alvendo._id } }
        );
        console.log(`\n📝 Updated ${updated.modifiedCount} bimbingan to use correct dosen`);

        // Summary
        console.log('\n\n========================================');
        console.log('LOGIN CREDENTIALS:');
        console.log('========================================');
        console.log('MAHASISWA:');
        console.log('  NIM: 2321053');
        console.log('  Password: mahasiswa123');
        console.log('');
        console.log('DOSEN 1 (Alvendo):');
        console.log('  NIP: DOSEN001');
        console.log('  Password: dosen123');
        console.log('');
        console.log('DOSEN 2 (Rifa):');
        console.log('  NIP: DOSEN002');
        console.log('  Password: dosen123');
        console.log('========================================');

        await mongoose.disconnect();
        console.log('\nDone!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

addCustomUsers();
