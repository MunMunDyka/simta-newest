/**
 * ===========================================
 * User Model - Schema Definition
 * ===========================================
 * Model untuk semua user: Mahasiswa, Dosen, Admin
 */

'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;

/**
 * User Schema Definition
 */
const userSchema = new Schema({
    // ===== Core Fields (Wajib) =====
    nim_nip: {
        type: String,
        required: [true, 'NIM/NIP wajib diisi'],
        unique: true,
        trim: true,
        minlength: [5, 'NIM/NIP minimal 5 karakter'],
        maxlength: [20, 'NIM/NIP maksimal 20 karakter']
    },

    password: {
        type: String,
        required: [true, 'Password wajib diisi'],
        minlength: [6, 'Password minimal 6 karakter'],
        select: false // Tidak include password saat query
    },

    // Plain password for admin viewing (DEMO ONLY - NOT FOR PRODUCTION!)
    plainPassword: {
        type: String,
        select: false
    },

    name: {
        type: String,
        required: [true, 'Nama wajib diisi'],
        trim: true,
        minlength: [2, 'Nama minimal 2 karakter'],
        maxlength: [100, 'Nama maksimal 100 karakter']
    },

    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid']
    },

    role: {
        type: String,
        enum: {
            values: ['mahasiswa', 'dosen', 'admin'],
            message: 'Role harus salah satu dari: mahasiswa, dosen, admin'
        },
        required: [true, 'Role wajib diisi']
    },

    // ===== Khusus Mahasiswa =====
    prodi: {
        type: String,
        trim: true,
        default: null
    },

    semester: {
        type: String,
        trim: true,
        default: null
    },

    judulTA: {
        type: String,
        trim: true,
        default: null
    },

    currentProgress: {
        type: String,
        trim: true,
        default: 'BAB I',
        enum: ['BAB I', 'BAB II', 'BAB III', 'BAB IV', 'BAB V', 'BAB VI', 'Selesai']
    },

    // ===== Status Akademik Mahasiswa (Alur Sidang) =====
    statusMahasiswa: {
        type: String,
        enum: [
            'pra_sempro',       // Default awal, bimbingan dospem BAB I-III
            'menunggu_sempro',   // Telah dijadwalkan / sedang menunggu ujian sempro
            'revisi_sempro',     // Pasca sempro, wajib bimbingan revisi ke penguji
            'bimbingan_lanjut',  // Telah lulus revisi sempro, lanjut bimbingan dospem BAB IV-V
            'menunggu_semhas',   // Sedang menunggu jadwal ujian semhas
            'revisi_semhas',     // Pasca semhas, wajib bimbingan revisi ke penguji
            'bimbingan_akhir',   // Telah lulus revisi semhas, lanjut bimbingan dospem bab akhir
            'menunggu_sidang',   // Sedang menunggu jadwal ujian sidang akhir
            'revisi_sidang',     // Pasca sidang, bimbingan revisi laporan akhir ke penguji
            'persiapan_wisuda',  // Tahap persiapan wisuda (upload berkas & verifikasi admin)
            'selesai'            // Telah lulus semua sidang, revisi penguji, dan berkas wisuda disetujui admin
        ],
        default: 'pra_sempro'
    },

    // ===== Dosen Pembimbing (ref ke User dengan role dosen) =====
    dospem_1: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    dospem_2: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // ===== Dosen Penguji (di-assign dari jadwal sidang) =====
    penguji_1: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    penguji_2: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // ===== Metadata =====
    status: {
        type: String,
        enum: ['aktif', 'nonaktif'],
        default: 'aktif'
    },

    avatar: {
        type: String,
        default: null
    },

    whatsapp: {
        type: String,
        trim: true,
        default: null
    },

    // ===== Dokumen Wisuda (Mahasiswa only) =====
    dokumenWisuda: {
        skripsiFull: {
            fileName: { type: String, default: null },
            filePath: { type: String, default: null },
            fileSize: { type: String, default: null },
            fileOriginalName: { type: String, default: null },
            uploadedAt: { type: Date, default: null }
        },
        pptSkripsi: {
            fileName: { type: String, default: null },
            filePath: { type: String, default: null },
            fileSize: { type: String, default: null },
            fileOriginalName: { type: String, default: null },
            uploadedAt: { type: Date, default: null }
        },
        halamanPengesahan: {
            fileName: { type: String, default: null },
            filePath: { type: String, default: null },
            fileSize: { type: String, default: null },
            fileOriginalName: { type: String, default: null },
            uploadedAt: { type: Date, default: null }
        },
        formBimbingan: {
            fileName: { type: String, default: null },
            filePath: { type: String, default: null },
            fileSize: { type: String, default: null },
            fileOriginalName: { type: String, default: null },
            uploadedAt: { type: Date, default: null }
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
        verifiedAt: {
            type: Date,
            default: null
        }
    },

    // ===== Multiple Role (Dosen + Admin) =====
    canAccessAdmin: {
        type: Boolean,
        default: false
    },

}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ===== Indexes =====
// Note: nim_nip sudah unique: true, jadi tidak perlu index manual
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ dospem_1: 1 });
userSchema.index({ dospem_2: 1 });
userSchema.index({ penguji_1: 1 });
userSchema.index({ penguji_2: 1 });
userSchema.index({ statusMahasiswa: 1 });
userSchema.index({ name: 'text' }); // Text search index

// ===== Virtual: Get initials for avatar fallback =====
userSchema.virtual('initials').get(function () {
    if (!this.name) return '';
    return this.name
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
});

// ===== Pre-save Hook: Hash password =====
userSchema.pre('save', async function () {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return;
    }

    // Generate salt and hash password
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
});

// ===== Pre-save Hook: Update timestamp =====
userSchema.pre('save', function () {
    this.updatedAt = new Date();
});

// ===== Instance Methods =====

/**
 * Compare password with hashed password
 * @param {string} candidatePassword - Password yang akan dicompare
 * @returns {Promise<boolean>} - True jika cocok
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error comparing password');
    }
};

/**
 * Get public profile (tanpa sensitive data)
 * @returns {Object} - User object tanpa password
 */
userSchema.methods.toPublicJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.__v;
    return userObject;
};

// ===== Static Methods =====

/**
 * Find user by NIM/NIP
 * @param {string} nim_nip - NIM atau NIP
 * @returns {Promise<User|null>}
 */
userSchema.statics.findByNimNip = function (nim_nip) {
    return this.findOne({ nim_nip }).select('+password');
};

/**
 * Find all active users by role
 * @param {string} role - Role yang dicari
 * @returns {Promise<User[]>}
 */
userSchema.statics.findByRole = function (role) {
    return this.find({ role, status: 'aktif' });
};

/**
 * Find mahasiswa by dosen pembimbing atau penguji
 * @param {ObjectId} dosenId - ID dosen
 * @param {string} filterRole - 'pembimbing', 'penguji', atau 'semua' (default: 'semua')
 * @returns {Promise<User[]>}
 */
userSchema.statics.findMahasiswaByDosen = function (dosenId, filterRole = 'semua') {
    let orConditions;
    
    if (filterRole === 'pembimbing') {
        orConditions = [
            { dospem_1: dosenId },
            { dospem_2: dosenId }
        ];
    } else if (filterRole === 'penguji') {
        orConditions = [
            { penguji_1: dosenId },
            { penguji_2: dosenId }
        ];
    } else {
        // 'semua' - include both
        orConditions = [
            { dospem_1: dosenId },
            { dospem_2: dosenId },
            { penguji_1: dosenId },
            { penguji_2: dosenId }
        ];
    }
    
    return this.find({
        role: 'mahasiswa',
        status: 'aktif',
        $or: orConditions
    }).populate('dospem_1 dospem_2 penguji_1 penguji_2', 'name nim_nip');
};

/**
 * Check if NIM/NIP already exists
 * @param {string} nim_nip - NIM atau NIP
 * @returns {Promise<boolean>}
 */
userSchema.statics.isNimNipTaken = async function (nim_nip) {
    const user = await this.findOne({ nim_nip });
    return !!user;
};

// ===== Create Model =====
const User = mongoose.model('User', userSchema);

module.exports = User;
