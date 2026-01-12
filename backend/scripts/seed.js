/**
 * ===========================================
 * Database Seeder - Admin Account Only
 * ===========================================
 * Script untuk membuat akun admin di database
 * 
 * Usage: node scripts/seed.js
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connection string
const MONGODB_URI = process.env.MONGODB_URI;

// Admin seed data
const adminData = {
    nim_nip: 'admin001',
    password: 'Ebt9BRADR6YGT7bniRETd0',
    name: 'Administrator SIMTA',
    email: 'admin@iteba.ac.id',
    role: 'admin',
    status: 'aktif'
};

/**
 * Seed database with admin account
 */
async function seedDatabase() {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   🌱 SIMTA Database Seeder - Admin Only                    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    try {
        // Connect to database
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        console.log('');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ nim_nip: adminData.nim_nip });

        if (existingAdmin) {
            console.log('⚠️  Admin account already exists!');
            console.log(`   NIM/NIP: ${existingAdmin.nim_nip}`);
            console.log(`   Name: ${existingAdmin.name}`);
            console.log('');
            console.log('ℹ️  Skipping admin creation. Use --force to recreate.');
        } else {
            // Create Admin
            console.log('� Creating Admin user...');
            const admin = await User.create(adminData);
            console.log(`   ✅ Admin created: ${admin.name} (${admin.nim_nip})`);
        }

        console.log('');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   ✅ SEEDING COMPLETED SUCCESSFULLY!                       ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('📋 Admin Login Credentials:');
        console.log('');
        console.log('   ADMIN:');
        console.log('   └─ NIM/NIP: admin001');
        console.log('   └─ Password: Ebt9BRADR6YGT7bniRETd0');
        console.log('');

    } catch (error) {
        console.error('');
        console.error('❌ SEEDING FAILED!');
        console.error('Error:', error.message);
        console.error('');
        process.exit(1);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('📴 Database connection closed');
        process.exit(0);
    }
}

// Run seeder
seedDatabase();
