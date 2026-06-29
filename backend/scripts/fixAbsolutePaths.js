/**
 * Fix Absolute Paths - Convert absolute file paths in database to relative paths
 * Usage: node scripts/fixAbsolutePaths.js
 */
'use strict';

require('dotenv').config();
const mongoose = require('mongoose');

// Helper to normalize path to relative
function normalizeToRelative(filePath) {
    if (!filePath) return filePath;
    const normalized = filePath.replace(/\\/g, '/');
    const idx = normalized.indexOf('uploads/');
    if (idx !== -1) {
        return normalized.substring(idx);
    }
    return normalized;
}

async function fixPaths() {
    try {
        console.log('Connecting to MongoDB...');
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ MONGODB_URI is not defined in .env');
            process.exit(1);
        }
        await mongoose.connect(mongoUri);
        console.log('🔌 Connected to MongoDB.');

        const db = mongoose.connection.db;

        // 1. Fix Users Collection (Avatar and Wisuda Documents)
        const users = await db.collection('users').find({}).toArray();
        let updatedUsers = 0;

        for (const user of users) {
            let changed = false;
            const updatedData = {};

            // Avatar path
            if (user.avatar) {
                const relativeAvatar = normalizeToRelative(user.avatar);
                if (relativeAvatar !== user.avatar) {
                    updatedData.avatar = relativeAvatar;
                    changed = true;
                    console.log(`👤 User ${user.name} (${user.nim_nip}): Avatar updated to ${relativeAvatar}`);
                }
            }

            // Wisuda Documents path
            if (user.dokumenWisuda) {
                const docFields = ['skripsiFull', 'pptSkripsi', 'halamanPengesahan', 'formBimbingan'];
                const updatedWisuda = { ...user.dokumenWisuda };
                let wisudaChanged = false;

                for (const field of docFields) {
                    if (updatedWisuda[field] && updatedWisuda[field].filePath) {
                        const originalPath = updatedWisuda[field].filePath;
                        const relativePath = normalizeToRelative(originalPath);
                        if (relativePath !== originalPath) {
                            updatedWisuda[field] = {
                                ...updatedWisuda[field],
                                filePath: relativePath
                            };
                            wisudaChanged = true;
                            console.log(`🎓 User ${user.name} (${user.nim_nip}): Wisuda ${field} path updated to ${relativePath}`);
                        }
                    }
                }

                if (wisudaChanged) {
                    updatedData.dokumenWisuda = updatedWisuda;
                    changed = true;
                }
            }

            if (changed) {
                await db.collection('users').updateOne(
                    { _id: user._id },
                    { $set: updatedData }
                );
                updatedUsers++;
            }
        }
        console.log(`✅ Users update complete. Total users fixed: ${updatedUsers}`);

        // 2. Fix Bimbingan Collection (filePath, feedbackFile, draftFeedbackFile)
        const bimbingans = await db.collection('bimbingans').find({}).toArray();
        let updatedBimbingans = 0;

        for (const b of bimbingans) {
            let changed = false;
            const updatedData = {};

            if (b.filePath) {
                const relativePath = normalizeToRelative(b.filePath);
                if (relativePath !== b.filePath) {
                    updatedData.filePath = relativePath;
                    changed = true;
                }
            }

            if (b.feedbackFile) {
                const relativePath = normalizeToRelative(b.feedbackFile);
                if (relativePath !== b.feedbackFile) {
                    updatedData.feedbackFile = relativePath;
                    changed = true;
                }
            }

            if (b.draftFeedbackFile) {
                const relativePath = normalizeToRelative(b.draftFeedbackFile);
                if (relativePath !== b.draftFeedbackFile) {
                    updatedData.draftFeedbackFile = relativePath;
                    changed = true;
                }
            }

            if (changed) {
                await db.collection('bimbingans').updateOne(
                    { _id: b._id },
                    { $set: updatedData }
                );
                updatedBimbingans++;
            }
        }
        console.log(`✅ Bimbingans update complete. Total bimbingan records fixed: ${updatedBimbingans}`);

        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB. Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
}

fixPaths();
