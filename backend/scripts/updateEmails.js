'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected');

        const result = await User.updateMany(
            { nim_nip: { $ne: '2321053' } },
            { $set: { email: 'example@gmail.com' } }
        );

        console.log(`✅ Updated ${result.modifiedCount} users to example@gmail.com`);
        console.log('⏭️  Skipped: Andhika Laksmana (2321053)');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
})();
