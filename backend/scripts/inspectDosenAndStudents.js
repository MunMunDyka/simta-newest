/**
 * Inspect Dosen and Students
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function inspect() {
    try {
        await mongoose.connect(MONGODB_URI);
        
        const dosenList = await User.find({ role: 'dosen' }).select('name nim_nip');
        const studentList = await User.find({ role: 'mahasiswa' }).select('name nim_nip dospem_1 dospem_2 statusMahasiswa currentProgress');
        
        console.log(`\n📋 TOTAL DOSEN: ${dosenList.length}`);
        dosenList.forEach(d => {
            console.log(`- ${d.name} (${d.nim_nip}) ID: ${d._id}`);
        });

        console.log(`\n📋 TOTAL STUDENTS: ${studentList.length}`);
        
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

inspect();
