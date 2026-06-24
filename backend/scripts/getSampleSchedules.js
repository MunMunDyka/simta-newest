/**
 * Get Sample Schedules - Inspect 3 schedules from the database
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const Jadwal = require('../models/Jadwal');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function inspect() {
    try {
        await mongoose.connect(MONGODB_URI);
        
        const schedules = await Jadwal.find({})
            .populate('mahasiswa', 'name nim_nip statusMahasiswa')
            .populate('penguji', 'name nim_nip')
            .limit(3);
            
        console.log('\n🔍 SAMPLE OF 3 SCHEDULES IN DATABASE:');
        console.log('========================================================================');
        
        schedules.forEach((s, idx) => {
            console.log(`[${idx + 1}] Mahasiswa : ${s.mahasiswa?.name} (${s.mahasiswa?.nim_nip})`);
            console.log(`    Status Mahasiswa: ${s.mahasiswa?.statusMahasiswa}`);
            console.log(`    Jadwal Ujian     : ${s.jenisJadwalDisplay}`);
            console.log(`    Tanggal / Jam    : ${s.tanggalFormatted} | ${s.waktuMulai} - ${s.waktuSelesai}`);
            console.log(`    Ruangan Ujian    : ${s.ruangan}`);
            console.log(`    Status Jadwal    : ${s.status} (Hasil: ${s.hasil || '-'}, Nilai: ${s.nilaiSidang || '-'})`);
            console.log(`    Dosen Penguji    :`);
            if (s.penguji && s.penguji.length > 0) {
                s.penguji.forEach((p, pIdx) => {
                    console.log(`       ${pIdx + 1}. ${p.name} (${p.nim_nip})`);
                });
            } else {
                console.log(`       (Belum ditugaskan)`);
            }
            console.log('------------------------------------------------------------------------');
        });
        
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

inspect();
