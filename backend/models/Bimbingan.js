/**
 * ===========================================
 * Bimbingan Model - Schema Definition
 * ===========================================
 * Model untuk menyimpan data bimbingan/upload
 * dokumen dari mahasiswa ke dosen pembimbing
 */

'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Bimbingan Schema Definition
 */
const bimbinganSchema = new Schema({
    // ===== Relasi =====
    mahasiswa: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Mahasiswa wajib diisi']
    },

    dosen: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Dosen pembimbing wajib diisi']
    },

    dosenType: {
        type: String,
        enum: {
            values: ['dospem_1', 'dospem_2'],
            message: 'Jenis dosen harus dospem_1 atau dospem_2'
        },
        required: [true, 'Jenis dosen pembimbing wajib diisi']
    },

    // ===== Submission Info =====
    version: {
        type: String,
        required: [true, 'Versi dokumen wajib diisi'],
        trim: true,
        match: [/^V\d+$/, 'Format versi harus V1, V2, V3, dst'] // V1, V2, V3, etc.
    },

    judul: {
        type: String,
        required: [true, 'Judul bimbingan wajib diisi'],
        trim: true,
        minlength: [5, 'Judul minimal 5 karakter'],
        maxlength: [200, 'Judul maksimal 200 karakter']
    },

    catatan: {
        type: String,
        trim: true,
        maxlength: [1000, 'Catatan maksimal 1000 karakter'],
        default: null
    },

    // ===== File Info =====
    fileName: {
        type: String,
        required: [true, 'Nama file wajib diisi'],
        trim: true
    },

    filePath: {
        type: String,
        required: [true, 'Path file wajib diisi'],
        trim: true
    },

    fileSize: {
        type: String,
        trim: true,
        default: null
    },

    fileOriginalName: {
        type: String,
        trim: true,
        default: null
    },

    // ===== Status & Feedback =====
    status: {
        type: String,
        enum: {
            values: ['menunggu', 'revisi', 'acc', 'lanjut_bab'],
            message: 'Status harus: menunggu, revisi, acc, atau lanjut_bab'
        },
        default: 'menunggu'
    },

    feedback: {
        type: String,
        trim: true,
        maxlength: [2000, 'Feedback maksimal 2000 karakter'],
        default: null
    },

    feedbackDate: {
        type: Date,
        default: null
    },

    // Optional: File attachment dari dosen untuk feedback
    feedbackFile: {
        type: String,
        trim: true,
        default: null
    },

    feedbackFileName: {
        type: String,
        trim: true,
        default: null
    }

}, {
    timestamps: true, // createdAt dan updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ===== Indexes =====
bimbinganSchema.index({ mahasiswa: 1, dosen: 1, createdAt: -1 });
bimbinganSchema.index({ mahasiswa: 1, dosenType: 1, createdAt: -1 });
bimbinganSchema.index({ dosen: 1, status: 1, createdAt: -1 });
bimbinganSchema.index({ status: 1 });
bimbinganSchema.index({ createdAt: -1 });

// ===== Virtual: Get replies =====
bimbinganSchema.virtual('replies', {
    ref: 'Reply',
    localField: '_id',
    foreignField: 'bimbingan',
    options: { sort: { createdAt: 1 } }
});

// ===== Virtual: Get status badge color =====
bimbinganSchema.virtual('statusColor').get(function () {
    const colors = {
        menunggu: 'yellow',
        revisi: 'red',
        acc: 'green',
        lanjut_bab: 'blue'
    };
    return colors[this.status] || 'gray';
});

// ===== Virtual: Format file size =====
bimbinganSchema.virtual('fileSizeFormatted').get(function () {
    if (!this.fileSize) return 'Unknown';

    const bytes = parseInt(this.fileSize);
    if (isNaN(bytes)) return this.fileSize;

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
});

// ===== Static Methods =====

/**
 * Get bimbingan list for mahasiswa
 * @param {ObjectId} mahasiswaId - ID mahasiswa
 * @param {string} dosenType - dospem_1 atau dospem_2 (optional)
 * @returns {Promise<Bimbingan[]>}
 */
bimbinganSchema.statics.findByMahasiswa = function (mahasiswaId, dosenType = null) {
    const query = { mahasiswa: mahasiswaId };
    if (dosenType) query.dosenType = dosenType;

    return this.find(query)
        .populate('dosen', 'name nim_nip')
        .populate('replies')
        .sort({ createdAt: -1 });
};

/**
 * Get bimbingan list for dosen (mahasiswa bimbingannya)
 * @param {ObjectId} dosenId - ID dosen
 * @param {string} status - Filter by status (optional)
 * @returns {Promise<Bimbingan[]>}
 */
bimbinganSchema.statics.findByDosen = function (dosenId, status = null) {
    const query = { dosen: dosenId };
    if (status) query.status = status;

    return this.find(query)
        .populate('mahasiswa', 'name nim_nip prodi currentProgress')
        .populate('replies')
        .sort({ createdAt: -1 });
};

/**
 * Get pending reviews for dosen
 * @param {ObjectId} dosenId - ID dosen
 * @returns {Promise<Bimbingan[]>}
 */
bimbinganSchema.statics.getPendingReviews = function (dosenId) {
    return this.find({ dosen: dosenId, status: 'menunggu' })
        .populate('mahasiswa', 'name nim_nip prodi')
        .sort({ createdAt: 1 }); // Oldest first
};

/**
 * Get next version number for mahasiswa+dosen combination
 * @param {ObjectId} mahasiswaId - ID mahasiswa
 * @param {ObjectId} dosenId - ID dosen
 * @returns {Promise<string>} - Next version (V1, V2, etc.)
 */
bimbinganSchema.statics.getNextVersion = async function (mahasiswaId, dosenId) {
    const lastBimbingan = await this.findOne({
        mahasiswa: mahasiswaId,
        dosen: dosenId
    }).sort({ createdAt: -1 });

    if (!lastBimbingan) return 'V1';

    const lastVersion = parseInt(lastBimbingan.version.replace('V', ''));
    return `V${lastVersion + 1}`;
};

/**
 * Check if mahasiswa has pending bimbingan
 * @param {ObjectId} mahasiswaId - ID mahasiswa
 * @param {string} dosenType - dospem_1 atau dospem_2
 * @returns {Promise<boolean>}
 */
bimbinganSchema.statics.hasPendingBimbingan = async function (mahasiswaId, dosenType) {
    const pending = await this.findOne({
        mahasiswa: mahasiswaId,
        dosenType: dosenType,
        status: 'menunggu'
    });
    return !!pending;
};

// ===== Instance Methods =====

/**
 * Give feedback to bimbingan
 * @param {string} feedbackText - Feedback dari dosen
 * @param {string} newStatus - Status baru (revisi, acc, lanjut_bab)
 * @param {Object} file - Optional file attachment
 */
bimbinganSchema.methods.giveFeedback = function (feedbackText, newStatus, file = null) {
    this.feedback = feedbackText;
    this.status = newStatus;
    this.feedbackDate = new Date();

    if (file) {
        this.feedbackFile = file.path;
        this.feedbackFileName = file.originalname;
    }

    return this.save();
};

// ===== Create Model =====
const Bimbingan = mongoose.model('Bimbingan', bimbinganSchema);

module.exports = Bimbingan;
