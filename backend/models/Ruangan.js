/**
 * ===========================================
 * Ruangan Model
 * ===========================================
 * Daftar ruangan sidang yang dapat dikelola admin (CRUD), menggantikan
 * daftar ruangan yang sebelumnya hardcode di frontend.
 */

'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const ruanganSchema = new Schema({
    nama: {
        type: String,
        required: [true, 'Nama ruangan wajib diisi'],
        trim: true,
        unique: true
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

module.exports = mongoose.model('Ruangan', ruanganSchema);
