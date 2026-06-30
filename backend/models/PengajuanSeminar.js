/**
 * ===========================================
 * Pengajuan Seminar Model
 * ===========================================
 * Menyimpan softcopy pengajuan seminar proposal/hasil sebelum dijadwalkan.
 */

'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const pengajuanSeminarSchema = new Schema({
    mahasiswa: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jenisPengajuan: {
        type: String,
        enum: ['seminar_proposal', 'seminar_hasil'],
        required: true
    },
    fileName: {
        type: String,
        default: null
    },
    filePath: {
        type: String,
        default: null
    },
    fileSize: {
        type: String,
        default: null
    },
    fileOriginalName: {
        type: String,
        default: null
    },
    uploadedAt: {
        type: Date,
        default: null
    },
    statusVerifikasi: {
        type: String,
        enum: ['belum_upload', 'menunggu_verifikasi', 'disetujui', 'ditolak'],
        default: 'belum_upload'
    },
    catatanAdmin: {
        type: String,
        default: null
    },
    verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

pengajuanSeminarSchema.index({ mahasiswa: 1, jenisPengajuan: 1 }, { unique: true });
pengajuanSeminarSchema.index({ jenisPengajuan: 1, statusVerifikasi: 1 });
pengajuanSeminarSchema.index({ statusVerifikasi: 1 });

pengajuanSeminarSchema.virtual('jenisPengajuanDisplay').get(function () {
    const display = {
        seminar_proposal: 'Seminar Proposal',
        seminar_hasil: 'Seminar Hasil'
    };

    return display[this.jenisPengajuan] || this.jenisPengajuan;
});

module.exports = mongoose.model('PengajuanSeminar', pengajuanSeminarSchema);
