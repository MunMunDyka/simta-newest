require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const db = mongoose.connection.db;
        const users = await db.collection('users').find({ role: 'mahasiswa' }).toArray();
        console.log(`Total mahasiswa found: ${users.length}`);

        for (const u of users) {
            console.log(`\nNama: ${u.name} (NIM: ${u.nim_nip})`);
            console.log(`Status Mahasiswa: ${u.statusMahasiswa || 'pra_sempro'}`);
            console.log(`Dospem 1: ${u.dospem_1}`);
            console.log(`Dospem 2: ${u.dospem_2}`);
            console.log(`Penguji 1: ${u.penguji_1}`);
            console.log(`Penguji 2: ${u.penguji_2}`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
