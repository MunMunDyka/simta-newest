/**
 * ====================================================================
 * Cleanup Large Dummy Data - Remove seeded students 2321001 - 2321018
 * ====================================================================
 * Script to clean up the database by removing the 18 seeded students,
 * their bimbingan submissions, and their schedules.
 * 
 * Usage: node scripts/cleanupLargeDummyData.js
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Bimbingan = require('../models/Bimbingan');
const Jadwal = require('../models/Jadwal');

const MONGODB_URI = process.env.MONGODB_URI;
const studentNims = Array.from({ length: 18 }, (_, i) => String(2321001 + i));

async function cleanupData() {
    console.log('\n=============================================================');
    console.log('🔄 STARTING DATABASE CLEANUP FOR SEEDED DUMMY DATA...');
    console.log('=============================================================\n');

    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB.');

        // Find the user documents for the Nims
        const users = await User.find({ nim_nip: { $in: studentNims } });
        const userIds = users.map(u => u._id);

        if (userIds.length === 0) {
            console.log('ℹ️  No seeded dummy students found in the database. Nothing to clean.');
        } else {
            console.log(`ℹ️  Found ${userIds.length} dummy students to remove.`);

            // Delete Bimbingan logs
            const bimbinganDel = await Bimbingan.deleteMany({ mahasiswa: { $in: userIds } });
            console.log(`✅ Deleted ${bimbinganDel.deletedCount} bimbingan records.`);

            // Delete Jadwal logs
            const jadwalDel = await Jadwal.deleteMany({ mahasiswa: { $in: userIds } });
            console.log(`✅ Deleted ${jadwalDel.deletedCount} schedules.`);

            // Delete Users
            const userDel = await User.deleteMany({ _id: { $in: userIds } });
            console.log(`✅ Deleted ${userDel.deletedCount} student accounts.`);
        }

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║   ✅ DATABASE CLEANUP COMPLETED SUCCESSFULLY!              ║');
        console.log('╚════════════════════════════════════════════════════════════╝\n');

    } catch (error) {
        console.error('\n❌ DATABASE CLEANUP FAILED!');
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('📴 Database connection closed.');
        process.exit(0);
    }
}

cleanupData();
