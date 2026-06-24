/**
 * Reset All Students to Pra-Sempro - Clean slate for academic stages and progress
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function resetAllToPraSempro() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!');

        console.log('\n🔄 Resetting statusMahasiswa to "pra_sempro" and currentProgress to "BAB I" for all students...');
        const result = await User.updateMany(
            { role: 'mahasiswa' },
            { 
                $set: { 
                    statusMahasiswa: 'pra_sempro',
                    currentProgress: 'BAB I'
                } 
            }
        );
        console.log(`✅ Success: Reset ${result.modifiedCount} student records back to Pra-Sempro (BAB I).`);

        console.log('\n🎉 All student academic stages and progresses have been reset to default!');

    } catch (e) {
        console.error('❌ Error executing database reset:', e);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB.');
    }
}

resetAllToPraSempro();
