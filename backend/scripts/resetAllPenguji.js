/**
 * Reset All Penguji - Clear all examiner plots from Mahasiswa and Jadwal models
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Jadwal = require('../models/Jadwal');

const MONGODB_URI = process.env.MONGODB_URI;

async function reset() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!');

        // 1. Reset penguji_1 and penguji_2 on Mahasiswa
        console.log('\n🔄 Resetting penguji_1 and penguji_2 fields on all Mahasiswa...');
        const userResult = await User.updateMany(
            { role: 'mahasiswa' },
            { $set: { penguji_1: null, penguji_2: null } }
        );
        console.log(`✅ Success: Reset examiner fields on ${userResult.modifiedCount} mahasiswa records.`);

        // 2. Clear penguji array on all Jadwal (Schedules)
        console.log('\n🔄 Clearing penguji arrays on all Jadwal (schedules)...');
        const jadwalResult = await Jadwal.updateMany(
            {},
            { $set: { penguji: [] } }
        );
        console.log(`✅ Success: Cleared penguji list on ${jadwalResult.modifiedCount} jadwal records.`);

        console.log('\n🎉 Reset completed successfully! You can now start re-plotting the examiners.');

    } catch (e) {
        console.error('❌ Error executing reset:', e);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
}

reset();
