/**
 * ===========================================
 * Migration: Set canAccessAdmin for Specific Dosen
 * ===========================================
 * Flags DOSEN001 (Alvendo) and DOSEN004 (Alhamidi) 
 * as having admin access (multiple role).
 * 
 * Usage: node scripts/setMultipleRole.js
 */

'use strict';

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/simta';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Flag DOSEN001 (Alvendo) and DOSEN004 (Alhamidi)
        const targetNIPs = ['DOSEN001', 'DOSEN004'];

        for (const nip of targetNIPs) {
            const result = await usersCollection.updateOne(
                { nim_nip: nip },
                { $set: { canAccessAdmin: true } }
            );

            if (result.matchedCount > 0) {
                const user = await usersCollection.findOne({ nim_nip: nip });
                console.log(`✅ ${nip} (${user.name}) → canAccessAdmin: true`);
            } else {
                console.log(`⚠️ ${nip} not found in database`);
            }
        }

        console.log('\n🎉 Migration complete!');
        console.log('These dosen can now switch to Admin mode from their profile dropdown.');

    } catch (error) {
        console.error('❌ Migration error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

run();
