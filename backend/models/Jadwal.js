/**
 * ===========================================
 * Jadwal Model - Schema Definition
 * ===========================================
 * Model untuk jadwal sidang proposal/skripsi
 * Dikelola oleh Admin
 */

'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Jadwal Schema Definition
 */
const jadwalSchema = new Schema({
    // ===== Relasi ke Mahasiswa =====
    mahasiswa: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Mahasiswa wajib diisi']
    },

    // ===== Jenis Jadwal =====
    jenisJadwal: {
        type: String,
        enum: {
            values: ['sidang_proposal', 'sidang_skripsi'],
            message: 'Jenis jadwal harus sidang_proposal atau sidang_skripsi'
        },
        required: [true, 'Jenis jadwal wajib diisi']
    },

    // ===== Waktu & Tempat =====
    tanggal: {
        type: Date,
        required: [true, 'Tanggal sidang wajib diisi']
    },

    waktuMulai: {
        type: String,
        required: [true, 'Waktu mulai wajib diisi'],
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format waktu harus HH:MM']
    },

    waktuSelesai: {
        type: String,
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format waktu harus HH:MM'],
        default: null
    },

    ruangan: {
        type: String,
        trim: true,
        maxlength: [100, 'Nama ruangan maksimal 100 karakter'],
        default: null
    },

    // ===== Tim Penguji =====
    penguji: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // ===== Status =====
    status: {
        type: String,
        enum: {
            values: ['dijadwalkan', 'berlangsung', 'selesai', 'dibatalkan'],
            message: 'Status harus: dijadwalkan, berlangsung, selesai, atau dibatalkan'
        },
        default: 'dijadwalkan'
    },

    // ===== Hasil Sidang (diisi setelah selesai) =====
    hasil: {
        type: String,
        enum: {
            values: ['lulus', 'lulus_revisi', 'tidak_lulus', null],
            message: 'Hasil harus: lulus, lulus_revisi, atau tidak_lulus'
        },
        default: null
    },

    nilaiSidang: {
        type: Number,
        min: [0, 'Nilai minimal 0'],
        max: [100, 'Nilai maksimal 100'],
        default: null
    },

    catatan: {
        type: String,
        trim: true,
        maxlength: [1000, 'Catatan maksimal 1000 karakter'],
        default: null
    },

    // ===== Admin yang membuat =====
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ===== Indexes =====
jadwalSchema.index({ mahasiswa: 1, jenisJadwal: 1 });
jadwalSchema.index({ tanggal: 1, status: 1 });
jadwalSchema.index({ status: 1 });
jadwalSchema.index({ penguji: 1 });

// ===== Virtual: Format tanggal Indonesia =====
jadwalSchema.virtual('tanggalFormatted').get(function () {
    if (!this.tanggal) return '';

    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return this.tanggal.toLocaleDateString('id-ID', options);
});

// ===== Virtual: Status badge color =====
jadwalSchema.virtual('statusColor').get(function () {
    const colors = {
        dijadwalkan: 'blue',
        berlangsung: 'yellow',
        selesai: 'green',
        dibatalkan: 'red'
    };
    return colors[this.status] || 'gray';
});

// ===== Virtual: Jenis jadwal display =====
jadwalSchema.virtual('jenisJadwalDisplay').get(function () {
    const display = {
        sidang_proposal: 'Sidang Proposal',
        sidang_skripsi: 'Sidang Skripsi'
    };
    return display[this.jenisJadwal] || this.jenisJadwal;
});

// ===== Static Methods =====

/**
 * Get upcoming jadwal
 * @param {number} days - Number of days ahead (default 30)
 * @returns {Promise<Jadwal[]>}
 */
jadwalSchema.statics.getUpcoming = function (days = 30) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.find({
        tanggal: { $gte: startDate, $lte: endDate },
        status: 'dijadwalkan'
    })
        .populate('mahasiswa', 'name nim_nip prodi judulTA')
        .populate('penguji', 'name nim_nip')
        .sort({ tanggal: 1 });
};

/**
 * Get jadwal by mahasiswa
 * @param {ObjectId} mahasiswaId - ID mahasiswa
 * @returns {Promise<Jadwal[]>}
 */
jadwalSchema.statics.findByMahasiswa = function (mahasiswaId) {
    return this.find({ mahasiswa: mahasiswaId })
        .populate('penguji', 'name nim_nip')
        .populate('createdBy', 'name')
        .sort({ tanggal: -1 });
};

/**
 * Get jadwal where user is penguji
 * @param {ObjectId} dosenId - ID dosen
 * @returns {Promise<Jadwal[]>}
 */
jadwalSchema.statics.findByPenguji = function (dosenId) {
    return this.find({ penguji: dosenId })
        .populate('mahasiswa', 'name nim_nip prodi judulTA')
        .populate('penguji', 'name nim_nip')
        .sort({ tanggal: -1 });
};

/**
 * Get jadwal statistics
 * @returns {Promise<Object>}
 */
jadwalSchema.statics.getStatistics = async function () {
    const now = new Date();

    const [total, upcoming, completed, cancelled] = await Promise.all([
        this.countDocuments(),
        this.countDocuments({ status: 'dijadwalkan', tanggal: { $gte: now } }),
        this.countDocuments({ status: 'selesai' }),
        this.countDocuments({ status: 'dibatalkan' })
    ]);

    return { total, upcoming, completed, cancelled };
};

/**
 * Check if date/time slot is available
 * @param {Date} tanggal - Tanggal sidang
 * @param {string} waktuMulai - Waktu mulai
 * @param {string} ruangan - Ruangan
 * @returns {Promise<boolean>}
 */
jadwalSchema.statics.isSlotAvailable = async function (tanggal, waktuMulai, ruangan) {
    const existing = await this.findOne({
        tanggal: tanggal,
        waktuMulai: waktuMulai,
        ruangan: ruangan,
        status: { $ne: 'dibatalkan' }
    });
    return !existing;
};

// ===== Instance Methods =====

/**
 * Update status to selesai with hasil
 * @param {string} hasil - lulus, lulus_revisi, tidak_lulus
 * @param {number} nilai - Nilai sidang
 * @param {string} catatan - Catatan
 */
jadwalSchema.methods.complete = function (hasil, nilai, catatan = null) {
    this.status = 'selesai';
    this.hasil = hasil;
    this.nilaiSidang = nilai;
    if (catatan) this.catatan = catatan;
    return this.save();
};

/**
 * Cancel jadwal
 * @param {string} alasan - Alasan pembatalan
 */
jadwalSchema.methods.cancel = function (alasan = null) {
    this.status = 'dibatalkan';
    if (alasan) this.catatan = alasan;
    return this.save();
};

// ===== Create Model =====
const Jadwal = mongoose.model('Jadwal', jadwalSchema);

module.exports = Jadwal;
