require('dotenv').config();
const mongoose = require('mongoose');
const userController = require('../controller/userController');

async function run() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        // Dosen ID: 69469901aec0334ba209ebf8
        const dosenId = new mongoose.Types.ObjectId('69469901aec0334ba209ebf8');

        // Mock req and res
        const req = {
            user: { _id: dosenId, role: 'dosen' },
            query: { filterRole: 'penguji' }
        };

        return new Promise((resolve, reject) => {
            const res = {
                statusCode: 200,
                json: async function(data) {
                    console.log('\n--- Response JSON ---');
                    console.log('Success:', data.success);
                    console.log('Message:', data.message);
                    if (data.data) {
                        console.log('Total students returned:', data.data.length);
                        data.data.forEach(m => {
                            console.log(`- ${m.name} (Relation: ${m.dosenRelation}, Status: ${m.statusMahasiswa})`);
                        });
                    } else {
                        console.log('No data returned.');
                    }
                    await mongoose.disconnect();
                    resolve();
                },
                status: function(code) {
                    this.statusCode = code;
                    return this;
                }
            };

            userController.getMahasiswaBimbingan(req, res, async (err) => {
                if (err) {
                    console.error('Next error:', err);
                    await mongoose.disconnect();
                    reject(err);
                }
            });
        });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run().then(() => process.exit(0)).catch(() => process.exit(1));
