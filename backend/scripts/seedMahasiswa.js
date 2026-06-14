/**
 * ===========================================
 * Database Seeder - Mahasiswa Accounts
 * ===========================================
 * Usage: node scripts/seedMahasiswa.js
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

const DEFAULT_PASSWORD = 'mahasiswa123';
const DEFAULT_WHATSAPP = '123';

// Data mahasiswa dari list
const mahasiswaRaw = [
    { name: 'Muhamad Andrian Yudhistira', nim: '2421051', judul: 'Pengembangan Sistem Informasi Sketch Warehouse dengan Modul Otomatisasi Data Pallet Berbasis Barcode Scanning untuk Peningkatan Kecepatan dan Akurasi Inventaris di PT. Sumitomo Wiring System Batam Indonesia', d1: 'DOSEN004', d2: 'DOSEN003' },
    { name: 'Charles', nim: '2221015', judul: 'Perancangan dan Implementasi Sistem Informasi Pengajuan Tanda Tangan Digital Berbasis Web Menggunakan QR Code Pada Institut Teknologi Batam', d1: 'DOSEN004', d2: 'DOSEN001' },
    { name: 'Elisabeth Sing', nim: '2221007', judul: 'Perancangan dan Implementasi Sistem Absensi Pegawai Berbasis Web Menggunakan Qr Code (Studi Kasus : PT. Eka Nusa Sinergi)', d1: 'DOSEN004', d2: 'DOSEN002' },
    { name: 'Meliana Efendi', nim: '2221008', judul: 'Perancangan Game Edukasi Interaktif untuk Meningkatkan Kemampuan berfikir Logis Anak Usia Dini Berbasis Construct 3', d1: 'DOSEN004', d2: 'DOSEN002' },
    { name: 'Khairunnisa Ramadhan', nim: '2221053', judul: 'Perancangan Sistem Informasi Laundry Berbasis Web Dengan Fitur Nota Digital dan Pemantauan Status Cucian Pada Laundry Cahaya', d1: 'DOSEN004', d2: 'DOSEN005' },
    { name: 'Amanda Puspita Sari', nim: '2221057', judul: 'Perancangan Website Sebagai media Informasi Kuliner Seafood di Kota Batam dengan Menggunakan Metode Design Thinking', d1: 'DOSEN004', d2: 'DOSEN005' },
    { name: 'Raja Syafira Aprilianna', nim: '2221006', judul: 'Penerapan Metode Design Thinking Dalam Perancangan Sistem Informasi Pariwisata Tanjung Balai Karimun Berbasis Website', d1: 'DOSEN004', d2: 'DOSEN007' },
    { name: 'Shafira Putri Rheyna', nim: '2421046', judul: 'Perancangan Sistem Informasi Pengelolaan Data Barang masuk dan Keluar Berbasis Website di Gudang PT. Lintasarta', d1: 'DOSEN004', d2: 'DOSEN007' },
    { name: 'Febriantoro Prihatin Suprapto', nim: '1921012', judul: 'Analisis Kinerja Sistem Operasi Windows 10 dengan Cachy OS', d1: 'DOSEN001', d2: 'DOSEN003' },
    { name: 'Muhammad Kelvin Pranata', nim: '2221064', judul: 'Sistem Informasi Sekolah Anak Berkebutuhan Khusus Berbasis Web dengan Fitur Monitoring dan Administrasi', d1: 'DOSEN001', d2: 'DOSEN005' },
    { name: 'Angga Kurniawan', nim: '2221042', judul: 'Sistem Pembuatan Surat Akademik Digital Berbasis Website Untuk Layanan Administrasi Mahasiswa', d1: 'DOSEN001', d2: 'DOSEN002' },
    { name: 'Muhammad Zukhruful Azkia', nim: '2221045', judul: 'Perancangan Sistem Informasi Akuntasi ranger Fight Night Menggunakan Odoo ERP', d1: 'DOSEN001', d2: 'DOSEN002' },
    { name: 'Intan Iqlima', nim: '2221011', judul: 'Pengembangan Sistem Informasi Pelaporan Kinerja Tenaga Pendukung Berbasis Web (Studi Kasus : Direktorat Pengelolaan Kepelabuhanan BP Batam)', d1: 'DOSEN001', d2: 'DOSEN007' },
    { name: 'Andhin Nabila Bilbina', nim: '2221049', judul: 'Perancangan Sistem Informasi Promosi Produk Berbasis Web Pada UMKM Dapur Fawwaz', d1: 'DOSEN001', d2: 'DOSEN006' },
    { name: 'Fani Rahma Yanti', nim: '2421035', judul: 'Rancang Bangun Sistem Informasi Konversi Nilai Mahasiswa Alih Jenjang Berbasis Website dengan Metode Waterfall di Institut Teknologi Batam', d1: 'DOSEN001', d2: 'DOSEN003' },
    { name: 'Ilham Alief Fatih', nim: '2221033', judul: 'Perancangan dan Implementasi Website Hard To Mosh Berbasis Website sebagai Media Informasi, Promosi dan Manajemen Acara Musik Hardcore di Kota Batam Menggunakan Metode Rapid Application Development (RAD)', d1: 'DOSEN003', d2: 'DOSEN008' },
    { name: 'Zada Alzena', nim: '2221025', judul: 'Sistem Pendukung Keputusan Pemilihan Mahasiswa Lulusan Terbaik Angkatan 2022 - 2024 Menggunakan Metode SAW (Simple Additive Weighting) di Institut Teknologi Batam', d1: 'DOSEN003', d2: 'DOSEN006' },
    { name: 'Ezzy Mielanda', nim: '2221030', judul: 'Analisis Pola Pembelian Konsumen Menggunakan Algoritma Apriori (Studi Kasus : MoMoo Juice Bar & Coffe)', d1: 'DOSEN003', d2: 'DOSEN006' },
    { name: 'Siti Maulidya', nim: '2221028', judul: 'Perancangan Sistem Absensi Siswa Berbasis Website dengan Notifikasi WhatsApp ke Orang Tua (Studi Kasus : SMK Negeri 7 Batam)', d1: 'DOSEN003', d2: 'DOSEN002' },
    { name: 'Sri Dwi Ana Melia', nim: '2221004', judul: 'Analisis Pengaruh Intensitas Bermain Games Online Roblox Terhadap Motivasi Belajar dan Konsentrasi Akademik Mahasiswa Iteba Menggunakan Pendekatan Algoritma Decision Tree', d1: 'DOSEN003', d2: 'DOSEN002' },
    { name: 'Suci Dwi Maharani', nim: '2221050', judul: 'Perancangan Sistem Booking Online Untuk Manajemen Layanan Eyelash By Nara Berbasis Website', d1: 'DOSEN006', d2: 'DOSEN005' },
    { name: 'Peromika', nim: '2221040', judul: 'Perancangan Sistem Informasi E-Catalog Mori Kopi Berbasis Web Menggunakan Metode Rapid Application Development (RAD)', d1: 'DOSEN006', d2: 'DOSEN007' },
    { name: 'Yusuf Hendrawan', nim: '2221036', judul: 'Perancangan Sistem Informasi Pendukung Menggunakan Metode Profile Matching Dalam Pemilihan Jurusan Kuliah Untuk Siswa SMA Negeri 4 Batam Berbasis Website', d1: 'DOSEN006', d2: 'DOSEN008' },
    { name: 'Syaldi Ardiansyah Akmal', nim: '2221032', judul: 'Perancangan Sistem Informasi Akuntansi Berbasis Odoo ERP Menggunakan Metode R&D pada Usaha ArdTechno', d1: 'DOSEN006', d2: 'DOSEN007' },
    { name: 'Bagas Rizaldi', nim: '2221046', judul: 'Perancangan Sistem Informasi Kasir Digital Berbasis Web Untuk Mendukung Operasional Usaha Mikro', d1: 'DOSEN006', d2: 'DOSEN005' },
    { name: 'Seftiyana Eka Putri', nim: '2221017', judul: 'Perancangan E-Catalog Penyewaan Kebaya Pada Toko Rentkuma Berbasis Web Menggunakan Metode Agile Scrum', d1: 'DOSEN006', d2: 'DOSEN004' },
    { name: 'Rahma Della', nim: '2221019', judul: 'Perancangan Marketplace Propreti Berbasis Mobile untuk Multi Agen dengan konsep Ecommerce : Properti Primary dan Secondary', d1: 'DOSEN006', d2: 'DOSEN004' },
    { name: 'Raihan Nabil Ihsan', nim: '2221043', judul: 'Perancangan Sistem Informasi Gudang Berbasis Website Menggunakan Metode R&D Cv. Cahaya Utama Batam', d1: 'DOSEN007', d2: 'DOSEN005' },
    { name: 'Josia Maxwell Agustinus Domgoran', nim: '2221003', judul: 'Perancangan Sistem Informasi Pemasaran Produk Berbasis Web Untuk Meningkatkan Jangkauan pasar Pada PT. Karya Gemilang Djaya', d1: 'DOSEN007', d2: 'DOSEN005' },
    { name: 'Teddy Elfvaro Siagian', nim: '2221054', judul: 'Penerapan Power Automate Desktop untuk Otomatisasi Pembuatan Laporan Bulanan Departemen Purchasing di PT. X', d1: 'DOSEN005', d2: 'DOSEN004' },
    { name: 'Joko Sugiyanto', nim: '2221041', judul: 'Perancangan Sistem Informasi Administrasi Desa Kelong Dengan Konsep PWA', d1: 'DOSEN002', d2: 'DOSEN008' },
    { name: 'Hudiya Aksan Hawary', nim: '2221009', judul: 'Perancangan dan Implementasi Sistem Informasi Pemesanan dan Pelacakan Status Laundry Sepatu Berbasis Web pad Usaha Shepatu', d1: 'DOSEN002', d2: 'DOSEN005' },
    { name: 'Rahmat Taufik Hidayat', nim: '2221062', judul: 'Digitalisasi Pelaporan Hasil Kerja Cleaning Service di BTP Berbasis Website', d1: 'DOSEN008', d2: 'DOSEN001' },
    { name: 'Muhammad Chairul Wibisono', nim: '2221026', judul: 'Perancangan dan Implemntasi Galeri Inovasi Mahasiswa Institut Teknologi Batam Berbasis Web', d1: 'DOSEN008', d2: 'DOSEN005' },
    { name: 'Putri Juwita Lingga', nim: '2221020', judul: 'Perancangan Sistem Aplikasi Pengenalan Produk Wifi Berbasis Web Dengan Menggunakan Metode Agile Pada Perusahaan PermanaNet', d1: 'DOSEN008', d2: 'DOSEN001' },
    { name: 'Adittya Danang Setiawan', nim: '2221013', judul: 'Perancangan Aplikasi E-Commerce Top-Up Game Online Berbasis Website dengan Integrasi Payment Gateway', d1: 'DOSEN008', d2: 'DOSEN001' },
    { name: 'Muhammad Arief Kurniawan', nim: '2221012', judul: 'Perancangan Sistem Informasi Antrian Online Ultrasonografi (USG) Pasien Rumah Sakit Harapan Bunda Batam Berbasis Web', d1: 'DOSEN008', d2: 'DOSEN002' },
    { name: 'Ahmad Miftahul Zaki', nim: '2421056', judul: 'Penerapan 3D WebAR untuk Produk Furniture di Interscience Consultant', d1: 'DOSEN008', d2: 'DOSEN007' },
    { name: 'Indah Kurnia Arianda', nim: '2221002', judul: 'Perancangan Sistem Informasi Stok Inventory Penjualan di Toko Aisyah Berbasis Web', d1: 'DOSEN008', d2: 'DOSEN002' },
    { name: 'Dickson', nim: '2221022', judul: 'Perancangan Sistem Sales Manajemen Berbasis Laravel Filament Pada PT Usaha Kiat Permata', d1: 'DOSEN003', d2: 'DOSEN004' },
    { name: 'Martin Kelvin', nim: '2221035', judul: 'Perancangan Arsitektur Sistem Informasi Log Analystics Terdistribusi (Roblox-to Cloud) dan Visualisasi Heatmap untuk Analisis Pola Eksplorasi pada Game Mount Verde', d1: 'DOSEN008', d2: 'DOSEN002' },
    { name: 'Vinsensius Fendy Kurniawan', nim: '2221031', judul: 'Rancang Bangun Asisten Virtual Mobile dengan Fitur Interaksi Proaktif Melalui Pengembangan Dataset Sintetis Berpersona Tsundere', d1: 'DOSEN008', d2: 'DOSEN007' },
    { name: 'Dinda Putri Khairunnisa', nim: '2221010', judul: 'Implementasi Metode Design Thinking Dalam Perancangan Sistem Informasi Presensi Karyawan Berbasis Website', d1: 'DOSEN001', d2: 'DOSEN002' },
    { name: 'Adry Mirza Savaras', nim: '2221037', judul: 'Pengembangan Aplikasi Kutomisasi Keyboard Mekanik Berbasis Augmented Reality di iOS untuk Optimalisasi Pengambilan Keputusan Pembeli', d1: 'DOSEN001', d2: 'DOSEN005' },
    { name: 'Ardiya Winata', nim: '2221027', judul: 'PERANCANGAN DAN IMPLEMENTASI SISTEM INFORMASI HOTEL BERBASIS WEB UNTUK MENDUKUNG RESERVASI DAN PROMOSI PADA BATAM 1 HOTEL', d1: 'DOSEN003', d2: 'DOSEN004' },
    { name: 'Muhammad Riansyah', nim: '2221034', judul: '', d1: '', d2: '' },
];

async function seedMahasiswa() {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   🌱 SIMTA Seeder - Mahasiswa Accounts                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Fetch all dosen to map NIP -> ObjectId
        const allDosen = await User.find({ role: 'dosen' });
        const dosenMap = {};
        allDosen.forEach(d => {
            dosenMap[d.nim_nip] = d._id;
        });
        console.log(`📋 Dosen loaded: ${allDosen.length} (${Object.keys(dosenMap).join(', ')})\n`);

        let created = 0;
        let skipped = 0;
        let errors = 0;

        for (const mhs of mahasiswaRaw) {
            // Check if already exists
            const existing = await User.findOne({ nim_nip: mhs.nim });
            if (existing) {
                console.log(`⚠️  ${mhs.nim} - ${mhs.name} (sudah ada, skip)`);
                skipped++;
                continue;
            }

            // Resolve dospem IDs
            const dospem1Id = mhs.d1 ? dosenMap[mhs.d1] : null;
            const dospem2Id = mhs.d2 ? dosenMap[mhs.d2] : null;

            if (mhs.d1 && !dospem1Id) {
                console.log(`❌ ${mhs.nim} - ${mhs.name} (Dospem 1 "${mhs.d1}" tidak ditemukan!)`);
                errors++;
                continue;
            }
            if (mhs.d2 && !dospem2Id) {
                console.log(`❌ ${mhs.nim} - ${mhs.name} (Dospem 2 "${mhs.d2}" tidak ditemukan!)`);
                errors++;
                continue;
            }

            const userData = {
                nim_nip: mhs.nim,
                password: DEFAULT_PASSWORD,
                plainPassword: DEFAULT_PASSWORD,
                name: mhs.name,
                email: 'bankaipro142@gmail.com',
                role: 'mahasiswa',
                prodi: 'Sistem Informasi',
                semester: '8',
                judulTA: mhs.judul || null,
                currentProgress: 'BAB I',
                dospem_1: dospem1Id || null,
                dospem_2: dospem2Id || null,
                status: 'aktif',
                whatsapp: DEFAULT_WHATSAPP,
            };

            await User.create(userData);
            const d1Label = mhs.d1 || '-';
            const d2Label = mhs.d2 || '-';
            console.log(`✅ ${mhs.nim} - ${mhs.name} [${d1Label} | ${d2Label}]`);
            created++;
        }

        console.log('');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║   ✅ SEEDING MAHASISWA COMPLETED!                          ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log(`📊 Hasil: ${created} dibuat, ${skipped} dilewati, ${errors} error`);
        console.log(`🔑 Password default: ${DEFAULT_PASSWORD}`);
        console.log('');

    } catch (error) {
        console.error('');
        console.error('❌ SEEDING FAILED!');
        console.error('Error:', error.message);
        console.error('');
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('📴 Database connection closed');
        process.exit(0);
    }
}

seedMahasiswa();
