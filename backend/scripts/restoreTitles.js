/**
 * Restore Original Student Titles
 */

'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

const originalTitles = {
    '2321053': "Rancang Bangun Sistem Informasi Bimbingan Skripsi Berbasis Web Dengan Metode Prototyping Untuk Meningkatkan Efektivitas Komunikasi dan Dokumentasi Revisi Mahasiswa Dengan Dosen Pembimbing",
    '2421051': "Pengembangan Sistem Informasi Sketch Warehouse dengan Modul Otomatisasi Data Pallet Berbasis Barcode Scanning untuk Peningkatan Kecepatan dan Akurasi Inventaris di PT. Sumitomo Wiring System Batam Indonesia",
    '2221015': "Perancangan dan Implementasi Sistem Informasi Pengajuan Tanda Tangan Digital Berbasis Web Menggunakan QR Code Pada Institut Teknologi Batam",
    '2221053': "Perancangan Sistem Informasi Laundry Berbasis Web Dengan Fitur Nota Digital dan Pemantauan Status Cucian Pada Laundry Cahaya",
    '2221057': "Perancangan Website Sebagai media Informasi Kuliner Seafood di Kota Batam dengan Menggunakan Metode Design Thinking",
    '2221006': "Penerapan Metode Design Thinking Dalam Perancangan Sistem Informasi Pariwisata Tanjung Balai Karimun Berbasis Website",
    '2421046': "Perancangan Sistem Informasi Pengelolaan Data Barang masuk dan Keluar Berbasis Website di Gudang PT. Lintasarta",
    '1921012': "Analisis Kinerja Sistem Operasi Windows 10 dengan Cachy OS",
    '2221064': "Sistem Informasi Sekolah Anak Berkebutuhan Khusus Berbasis Web dengan Fitur Monitoring dan Administrasi",
    '2221042': "Sistem Pembuatan Surat Akademik Digital Berbasis Website Untuk Layanan Administrasi Mahasiswa",
    '2221045': "Perancangan Sistem Informasi Akuntasi ranger Fight Night Menggunakan Odoo ERP",
    '2221011': "Pengembangan Sistem Informasi Pelaporan Kinerja Tenaga Pendukung Berbasis Web (Studi Kasus : Direktorat Pengelolaan Kepelabuhanan BP Batam)",
    '2221049': "Perancangan Sistem Informasi Promosi Produk Berbasis Web Pada UMKM Dapur Fawwaz",
    '2421035': "Rancang Bangun Sistem Informasi Konversi Nilai Mahasiswa Alih Jenjang Berbasis Website dengan Metode Waterfall di Institut Teknologi Batam",
    '2221033': "Perancangan dan Implementasi Website Hard To Mosh Berbasis Website sebagai Media Informasi, Promosi dan Manajemen Acara Musik Hardcore di Kota Batam Menggunakan Metode Rapid Application Development (RAD)",
    '2221025': "Sistem Pendukung Keputusan Pemilihan Mahasiswa Lulusan Terbaik Angkatan 2022 - 2024 Menggunakan Metode SAW (Simple Additive Weighting) di Institut Teknologi Batam",
    '2221030': "Analisis Pola Pembelian Konsumen Menggunakan Algoritma Apriori (Studi Kasus : MoMoo Juice Bar & Coffe)",
    '2221028': "Perancangan Sistem Absensi Siswa Berbasis Website dengan Notifikasi WhatsApp ke Orang Tua (Studi Kasus : SMK Negeri 7 Batam)"
};

async function restore() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        for (const nim of Object.keys(originalTitles)) {
            const title = originalTitles[nim];
            const result = await User.updateOne({ nim_nip: nim }, { $set: { judulTA: title } });
            if (result.modifiedCount > 0) {
                console.log(`✅ Restored Title for NIM ${nim}`);
            } else {
                console.log(`ℹ️ NIM ${nim} already has correct title or not found`);
            }
        }

        console.log('\nAll titles restored successfully!');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

restore();
