/**
 * ===========================================
 * Database Configuration - MongoDB Connection
 * ===========================================
 * Mengelola koneksi ke MongoDB Atlas dengan
 * error handling verbose dan graceful shutdown.
 * 
 * Includes custom DNS resolution (Google/Cloudflare)
 * untuk mengatasi ISP DNS yang tidak bisa resolve
 * SRV record MongoDB Atlas.
 */

'use strict';

const mongoose = require('mongoose');
const dns = require('dns');

/**
 * Custom DNS Configuration
 * Menggunakan Google DNS (8.8.8.8) dan Cloudflare DNS (1.1.1.1)
 * untuk mengatasi masalah ISP yang tidak bisa resolve SRV record MongoDB Atlas.
 * 
 * Approach: Manual SRV resolution → convert mongodb+srv:// to mongodb://
 */
const customResolver = new dns.Resolver();
customResolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);

console.log('🌐 DNS Resolver dikonfigurasi: Google (8.8.8.8) + Cloudflare (1.1.1.1)');

/**
 * Manually resolve SRV records and convert mongodb+srv:// URI
 * to standard mongodb:// URI.
 * 
 * @param {string} srvUri - MongoDB SRV connection string (mongodb+srv://...)
 * @returns {Promise<{uri: string, options: object}>} - Resolved standard URI and options
 */
const resolveSrvUri = async (srvUri) => {
    // Parse the SRV URI
    const srvMatch = srvUri.match(/^mongodb\+srv:\/\/([^@]+)@([^/?]+)(\/[^?]*)?(\?.*)?$/);
    if (!srvMatch) {
        throw new Error('Invalid mongodb+srv:// URI format');
    }

    const credentials = srvMatch[1]; // user:password
    const hostname = srvMatch[2];     // cluster0.xxxxx.mongodb.net
    const dbPath = srvMatch[3] || ''; // /dbname
    const queryString = srvMatch[4] || ''; // ?retryWrites=true&...

    console.log(`🔍 Resolving SRV record untuk: _mongodb._tcp.${hostname}`);

    // Resolve SRV records using custom DNS
    const srvRecords = await new Promise((resolve, reject) => {
        customResolver.resolveSrv(`_mongodb._tcp.${hostname}`, (err, records) => {
            if (err) reject(err);
            else resolve(records);
        });
    });

    if (!srvRecords || srvRecords.length === 0) {
        throw new Error(`No SRV records found for _mongodb._tcp.${hostname}`);
    }

    console.log(`✅ SRV records ditemukan: ${srvRecords.length} host(s)`);
    srvRecords.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.name}:${r.port} (priority: ${r.priority}, weight: ${r.weight})`);
    });

    // Resolve TXT records for additional options (like authSource, replicaSet)
    let txtOptions = '';
    try {
        const txtRecords = await new Promise((resolve, reject) => {
            customResolver.resolveTxt(hostname, (err, records) => {
                if (err) {
                    // TXT records are optional, don't fail
                    console.log('   ℹ️  No TXT records found (optional)');
                    resolve([]);
                } else {
                    resolve(records);
                }
            });
        });

        if (txtRecords && txtRecords.length > 0) {
            txtOptions = txtRecords[0].join('');
            console.log(`   📝 TXT options: ${txtOptions}`);
        }
    } catch (e) {
        // TXT resolution failure is non-fatal
    }

    // Build standard mongodb:// URI
    const hosts = srvRecords.map(r => `${r.name}:${r.port}`).join(',');
    
    // Merge query params: txt options + original query params
    const params = new URLSearchParams();
    
    // Add TXT options first
    if (txtOptions) {
        const txtParams = new URLSearchParams(txtOptions);
        for (const [key, value] of txtParams) {
            params.set(key, value);
        }
    }
    
    // Add/override with original query params
    if (queryString) {
        const originalParams = new URLSearchParams(queryString.replace('?', ''));
        for (const [key, value] of originalParams) {
            params.set(key, value);
        }
    }

    // Always ensure ssl/tls is enabled (SRV implies TLS)
    params.set('tls', 'true');

    const resolvedUri = `mongodb://${credentials}@${hosts}${dbPath}?${params.toString()}`;
    
    console.log(`🔗 Resolved URI: mongodb://${credentials.split(':')[0]}:****@${hosts}${dbPath}`);

    return resolvedUri;
};

/**
 * MongoDB Connection Options
 * Optimized for MongoDB Atlas
 */
const connectionOptions = {
    // Connection pool settings
    maxPoolSize: 10,
    minPoolSize: 2,

    // Timeout settings
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,

    // Other settings
    family: 4, // Use IPv4, skip trying IPv6
};

/**
 * Connect to MongoDB Database
 * @returns {Promise<void>}
 */
const connectDatabase = async () => {
    let MONGODB_URI = process.env.MONGODB_URI;

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

        // If using SRV connection string, manually resolve it
        if (MONGODB_URI.startsWith('mongodb+srv://')) {
            console.log('🔄 Menggunakan custom DNS resolver untuk SRV lookup...');
            try {
                MONGODB_URI = await resolveSrvUri(MONGODB_URI);
            } catch (dnsError) {
                console.error('⚠️  Custom DNS resolution gagal:', dnsError.message);
                console.error('   Mencoba koneksi langsung dengan SRV URI...');
                // Fall back to original URI if manual resolution fails
                MONGODB_URI = process.env.MONGODB_URI;
            }
        }

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
