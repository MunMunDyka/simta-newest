require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const dosenId = new mongoose.Types.ObjectId('69469901aec0334ba209ebf8');

        console.log('\n--- Query filterRole = dospem ---');
        const dospemList = await User.findMahasiswaByDosen(dosenId, 'pembimbing');
        console.log('Total pembimbing students:', dospemList.length);
        dospemList.forEach(m => console.log(`- ${m.name}`));

        console.log('\n--- Query filterRole = penguji ---');
        const pengujiList = await User.findMahasiswaByDosen(dosenId, 'penguji');
        console.log('Total penguji students:', pengujiList.length);
        pengujiList.forEach(m => console.log(`- ${m.name}`));

        console.log('\n--- Query filterRole = semua ---');
        const semuaList = await User.findMahasiswaByDosen(dosenId, 'semua');
        console.log('Total semua students:', semuaList.length);
        semuaList.forEach(m => console.log(`- ${m.name}`));

        await mongoose.disconnect();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
