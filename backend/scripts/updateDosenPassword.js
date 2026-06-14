/**
 * Update password semua dosen ke "dosen123"
 */
'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function updatePasswords() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const dosenList = await User.find({ role: 'dosen' });
        
        for (const dosen of dosenList) {
            dosen.password = 'dosen123';
            dosen.plainPassword = 'dosen123';
            await dosen.save(); // triggers pre-save hook to hash
            console.log(`✅ ${dosen.nim_nip} - ${dosen.name} → password updated`);
        }

        console.log(`\n📊 Total: ${dosenList.length} dosen updated to password "dosen123"`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

updatePasswords();
