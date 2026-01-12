/**
 * Test populate judulTA
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function testPopulate() {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        // Load User model first (required for populate)
        require('../models/User');

        // Get Bimbingan model
        const Bimbingan = require('../models/Bimbingan');

        // Find bimbingan with status menunggu
        const bimbingan = await Bimbingan.findOne({ status: 'menunggu' })
            .populate('mahasiswa', 'name nim_nip prodi currentProgress judulTA');

        console.log('\n=== Bimbingan with populated mahasiswa ===');
        console.log('Bimbingan ID:', bimbingan._id);
        console.log('Mahasiswa populated:', JSON.stringify(bimbingan.mahasiswa, null, 2));

        await mongoose.disconnect();
        console.log('\nDone!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testPopulate();
