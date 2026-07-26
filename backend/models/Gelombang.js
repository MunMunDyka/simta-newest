/**
 * ===========================================
 * Gelombang Model
 * ===========================================
 * Periode gelombang sidang (Sempro & Semhas) yang dikelola admin (CRUD).
 * Dipakai untuk menentukan gelombang sebuah jadwal berdasarkan tanggal sidang.
 * Sidang Akhir (skripsi) tidak memakai gelombang.
 */

'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const gelombangSchema = new Schema({
    jenis: {
        type: String,
        required: [true, 'Jenis gelombang wajib diisi'],
        enum: ['seminar_proposal', 'seminar_hasil']
    },
    tahunAjaran: {
        type: String,
        required: [true, 'Tahun ajaran wajib diisi'],
        trim: true
    },
    nomor: {
        type: Number,
        required: [true, 'Nomor gelombang wajib diisi'],
        min: [1, 'Nomor gelombang minimal 1']
    },
    tanggalMulai: {
        type: Date,
        required: [true, 'Tanggal mulai wajib diisi']
    },
    tanggalSelesai: {
        type: Date,
        required: [true, 'Tanggal selesai wajib diisi']
    },
    keterangan: {
        type: String,
        trim: true,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Cegah duplikat gelombang pada jenis + tahun ajaran + nomor yang sama.
gelombangSchema.index({ jenis: 1, tahunAjaran: 1, nomor: 1 }, { unique: true });

module.exports = mongoose.model('Gelombang', gelombangSchema);
