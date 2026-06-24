/**
 * Reset Student Statuses - Move students out of revision phases back to active guidance phases
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function resetStatuses() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!');

        // 1. Reset revisi_sempro to pra_sempro
        console.log('\n🔄 Resetting "revisi_sempro" status to "pra_sempro"...');
        const resSempro = await User.updateMany(
            { role: 'mahasiswa', statusMahasiswa: 'revisi_sempro' },
            { $set: { statusMahasiswa: 'pra_sempro' } }
        );
        console.log(`✅ Success: Reset ${resSempro.modifiedCount} students from revisi_sempro to pra_sempro.`);

        // 2. Reset revisi_semhas to bimbingan_lanjut
        console.log('\n🔄 Resetting "revisi_semhas" status to "bimbingan_lanjut"...');
        const resSemhas = await User.updateMany(
            { role: 'mahasiswa', statusMahasiswa: 'revisi_semhas' },
            { $set: { statusMahasiswa: 'bimbingan_lanjut' } }
        );
        console.log(`✅ Success: Reset ${resSemhas.modifiedCount} students from revisi_semhas to bimbingan_lanjut.`);

        // 3. Reset revisi_sidang to bimbingan_akhir
        console.log('\n🔄 Resetting "revisi_sidang" status to "bimbingan_akhir"...');
        const resSidang = await User.updateMany(
            { role: 'mahasiswa', statusMahasiswa: 'revisi_sidang' },
            { $set: { statusMahasiswa: 'bimbingan_akhir' } }
        );
        console.log(`✅ Success: Reset ${resSidang.modifiedCount} students from revisi_sidang to bimbingan_akhir.`);

        console.log('\n🎉 Student statuses reset successfully! They are now unlocked and can submit bimbingan to dospem.');

    } catch (e) {
        console.error('❌ Error executing status reset:', e);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
}

resetStatuses();
