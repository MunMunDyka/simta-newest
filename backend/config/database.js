/**
 * ===========================================
 * Database Configuration - MongoDB Connection
 * ===========================================
 * Mengelola koneksi ke MongoDB Atlas dengan
 * error handling verbose dan graceful shutdown
 */

'use strict';

const mongoose = require('mongoose');

/**
 * MongoDB Connection Options
 * Optimized for MongoDB Atlas
 */
const connectionOptions = {
    // Connection pool settings
    maxPoolSize: 10,
    minPoolSize: 2,

    // Timeout settings
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,

    // Other settings
    family: 4, // Use IPv4, skip trying IPv6
};

/**
 * Connect to MongoDB Database
 * @returns {Promise<void>}
 */
const connectDatabase = async () => {
    const MONGODB_URI = process.env.MONGODB_URI;

    // Validate MongoDB URI
    if (!MONGODB_URI) {
        console.error('');
        console.error('╔════════════════════════════════════════════════════════════╗');
        console.error('║   ❌ DATABASE ERROR                                        ║');
        console.error('╠════════════════════════════════════════════════════════════╣');
        console.error('║   MONGODB_URI tidak ditemukan di environment variables!   ║');
        console.error('║                                                            ║');
        console.error('║   Pastikan file .env sudah dibuat dan berisi:              ║');
        console.error('║   MONGODB_URI=mongodb+srv://user:pass@cluster/dbname       ║');
        console.error('╚════════════════════════════════════════════════════════════╝');
        console.error('');
        throw new Error('MONGODB_URI tidak ditemukan di environment variables');
    }

    try {
        console.log('');
        console.log('🔄 Menghubungkan ke MongoDB Atlas...');

        // Attempt connection
        await mongoose.connect(MONGODB_URI, connectionOptions);

        console.log('✅ MongoDB Atlas terhubung dengan sukses!');
        console.log(`   📁 Database: ${mongoose.connection.name}`);
        console.log(`   🌐 Host: ${mongoose.connection.host}`);
        console.log('');

    } catch (error) {
        console.error('');
        console.error('╔════════════════════════════════════════════════════════════╗');
        console.error('║   ❌ DATABASE CONNECTION FAILED                            ║');
        console.error('╚════════════════════════════════════════════════════════════╝');
        console.error('');

        // Provide helpful error messages based on error type
        if (error.name === 'MongoServerSelectionError') {
            console.error('📋 Kemungkinan penyebab:');
            console.error('   1. Connection string (MONGODB_URI) salah');
            console.error('   2. IP Address belum di-whitelist di MongoDB Atlas');
            console.error('   3. Username atau password salah');
            console.error('   4. Koneksi internet bermasalah');
            console.error('');
            console.error('💡 Solusi:');
            console.error('   - Buka MongoDB Atlas → Network Access → Add IP Address');
            console.error('   - Tambahkan 0.0.0.0/0 untuk allow semua IP (development)');
            console.error('');
        } else if (error.name === 'MongoParseError') {
            console.error('📋 Connection string tidak valid!');
            console.error('   Format yang benar:');
            console.error('   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/dbname');
            console.error('');
        } else if (error.message.includes('authentication failed')) {
            console.error('📋 Authentication failed!');
            console.error('   Username atau password salah di MongoDB Atlas');
            console.error('');
        }

        console.error('🔍 Error Details:');
        console.error(`   Name: ${error.name}`);
        console.error(`   Message: ${error.message}`);
        console.error('');

        throw error;
    }
};

// ===== Connection Event Listeners =====

mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('🟡 Mongoose disconnected from MongoDB');
});

// ===== Graceful Shutdown =====

/**
 * Close database connection gracefully
 */
const closeDatabaseConnection = async () => {
    try {
        await mongoose.connection.close();
        console.log('📴 MongoDB connection closed gracefully');
    } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error.message);
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    await closeDatabaseConnection();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeDatabaseConnection();
    process.exit(0);
});

module.exports = connectDatabase;
module.exports.closeDatabaseConnection = closeDatabaseConnection;
