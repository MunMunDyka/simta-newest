/**
 * Check Collections Script
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function checkCollections() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');
        console.log('Database Name:', mongoose.connection.name);

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('\n=== COLLECTIONS ===');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} documents`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkCollections();
