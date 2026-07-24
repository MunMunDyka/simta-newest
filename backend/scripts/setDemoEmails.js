/**
 * ====================================================================
 * Set Email Akun Demo
 * ====================================================================
 * Mengarahkan email seluruh akun yang terlibat pada roster demo ke satu
 * alamat inbox, sehingga notifikasi Email SIMTA (bimbingan baru,
 * feedback, jadwal sidang, reset password) dapat ditunjukkan secara live
 * dari satu Gmail saat sidang.
 *
 * Catatan penting:
 * - Field `email` pada model User TIDAK unique, jadi alamat yang sama
 *   boleh dipakai banyak akun.
 * - Forgot Password menerima NIM/NIP maupun email sebagai identifier,
 *   sehingga akun tetap bisa ditargetkan spesifik lewat NIM meskipun
 *   emailnya dipakai bersama.
 * - Query forgot password mensyaratkan `status: 'aktif'`. Skrip ini
 *   melaporkan (dan opsional memperbaiki) akun yang statusnya belum aktif.
 *
 * Usage:
 *   node scripts/setDemoEmails.js                    # dry-run
 *   node scripts/setDemoEmails.js --confirm          # terapkan
 *   node scripts/setDemoEmails.js --confirm --aktifkan   # sekaligus set status aktif
 *   node scripts/setDemoEmails.js --email=lain@gmail.com --confirm
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

const args = process.argv.slice(2);
const isConfirmed = args.includes('--confirm');
const setAktif = args.includes('--aktifkan');
const emailArg = args.find((a) => a.startsWith('--email='));
const TARGET_EMAIL = (emailArg ? emailArg.replace('--email=', '') : 'simtademoapp@gmail.com')
    .trim()
    .toLowerCase();

// Mahasiswa roster demo (10 fase + 2 sample bersih)
const MAHASISWA_NIM = [
    '2321053', // pra_sempro
    '2221015', // menunggu_sempro
    '2221057', // revisi_sempro
    '2221064', // bimbingan_lanjut
    '2221011', // menunggu_semhas
    '2221049', // revisi_semhas
    '2221043', // bimbingan_akhir
    '2221062', // menunggu_sidang
    '2221032', // persiapan_wisuda
    '2221036', // selesai
    '321321',  // sample sidang
    '123123'   // sample latihan
];

// Dosen & admin yang terlibat demo
const DOSEN_ADMIN_NIP = [
    'DOSEN003', // dospem 1
    'DOSEN002', // dospem 2
    'DOSEN005', // penguji 1
    'DOSEN008', // penguji 2
    'DOSEN001', // multi-role (canAccessAdmin)
    'DOSEN004', // multi-role (canAccessAdmin)
    'admin001'  // admin
];

async function run() {
    console.log(isConfirmed
        ? '⚠️  MODE: CONFIRM - data akan benar-benar diubah'
        : '🔍 MODE: DRY-RUN - tidak ada data yang diubah (tambahkan --confirm)');
    console.log(`📧 Email tujuan: ${TARGET_EMAIL}`);
    console.log(setAktif ? '🔓 Status akun akan diset "aktif"' : 'ℹ️  Status akun tidak diubah (pakai --aktifkan bila perlu)');
    console.log('');

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB\n');

    const allIds = [...MAHASISWA_NIM, ...DOSEN_ADMIN_NIP];
    const users = await User.find({ nim_nip: { $in: allIds } });

    const found = new Set(users.map((u) => u.nim_nip));
    const missing = allIds.filter((id) => !found.has(id));
    if (missing.length) {
        console.log(`⚠️  Tidak ditemukan (dilewati): ${missing.join(', ')}\n`);
    }

    const belumAktif = [];

    console.log('NIM/NIP    | Role      | Status   | Email lama -> baru');
    console.log('-'.repeat(78));

    for (const user of users) {
        const emailLama = user.email || '(kosong)';
        const status = user.status || '(kosong)';

        if (status !== 'aktif') belumAktif.push(`${user.nim_nip} (${status})`);

        console.log(
            `${user.nim_nip.padEnd(10)} | ${String(user.role).padEnd(9)} | ${String(status).padEnd(8)} | ` +
            `${emailLama} -> ${TARGET_EMAIL}`
        );

        if (!isConfirmed) continue;

        user.email = TARGET_EMAIL;
        if (setAktif) user.status = 'aktif';
        await user.save();
    }

    console.log('-'.repeat(78));
    console.log(`\nTotal akun diproses: ${users.length}`);
    console.log(`  Mahasiswa : ${users.filter((u) => u.role === 'mahasiswa').length}`);
    console.log(`  Dosen     : ${users.filter((u) => u.role === 'dosen').length}`);
    console.log(`  Admin     : ${users.filter((u) => u.role === 'admin').length}`);

    if (belumAktif.length) {
        console.log(`\n⚠️  Akun dengan status BUKAN 'aktif' (${belumAktif.length}):`);
        console.log(`   ${belumAktif.join(', ')}`);
        console.log('   Forgot Password hanya menemukan akun berstatus "aktif".');
        if (!setAktif) {
            console.log('   Jalankan dengan --aktifkan untuk memperbaikinya.');
        } else if (isConfirmed) {
            console.log('   ✅ Sudah diset "aktif" oleh skrip ini.');
        }
    } else {
        console.log("\n✅ Semua akun sudah berstatus 'aktif'.");
    }

    console.log('\nCatatan: karena email dipakai bersama, gunakan NIM/NIP saat menguji');
    console.log('Forgot Password agar akun yang ditargetkan sesuai keinginan.');

    if (!isConfirmed) {
        console.log('\n🔍 Dry-run selesai. Jalankan ulang dengan --confirm untuk menerapkan.');
    } else {
        console.log('\n🚀 Selesai. Semua notifikasi demo akan masuk ke ' + TARGET_EMAIL);
    }
}

run()
    .catch((e) => console.error('❌ Error:', e))
    .finally(async () => {
        await mongoose.disconnect();
        console.log('🔌 Koneksi MongoDB ditutup.');
    });
