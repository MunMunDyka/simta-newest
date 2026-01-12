/**
 * ===========================================
 * Reply Model - Schema Definition
 * ===========================================
 * Model untuk komentar/balasan dalam
 * thread bimbingan (contextual discussion)
 */

'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

/**
 * Reply Schema Definition
 */
const replySchema = new Schema({
    // ===== Relasi =====
    bimbingan: {
        type: Schema.Types.ObjectId,
        ref: 'Bimbingan',
        required: [true, 'ID bimbingan wajib diisi']
    },

    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Pengirim wajib diisi']
    },

    senderRole: {
        type: String,
        enum: {
            values: ['mahasiswa', 'dosen'],
            message: 'Sender role harus mahasiswa atau dosen'
        },
        required: [true, 'Role pengirim wajib diisi']
    },

    // ===== Content =====
    message: {
        type: String,
        required: [true, 'Pesan wajib diisi'],
        trim: true,
        minlength: [1, 'Pesan tidak boleh kosong'],
        maxlength: [2000, 'Pesan maksimal 2000 karakter']
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ===== Indexes =====
replySchema.index({ bimbingan: 1, createdAt: 1 });
replySchema.index({ sender: 1 });

// ===== Virtual: Formatted timestamp =====
replySchema.virtual('formattedTime').get(function () {
    if (!this.createdAt) return '';

    const options = {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    };
    return this.createdAt.toLocaleDateString('id-ID', options);
});

// ===== Static Methods =====

/**
 * Get all replies for a bimbingan
 * @param {ObjectId} bimbinganId - ID bimbingan
 * @returns {Promise<Reply[]>}
 */
replySchema.statics.findByBimbingan = function (bimbinganId) {
    return this.find({ bimbingan: bimbinganId })
        .populate('sender', 'name nim_nip role')
        .sort({ createdAt: 1 }); // Chronological order
};

/**
 * Count replies for a bimbingan
 * @param {ObjectId} bimbinganId - ID bimbingan
 * @returns {Promise<number>}
 */
replySchema.statics.countByBimbingan = function (bimbinganId) {
    return this.countDocuments({ bimbingan: bimbinganId });
};

/**
 * Get latest replies (for notification preview)
 * @param {ObjectId} bimbinganId - ID bimbingan
 * @param {number} limit - Jumlah reply
 * @returns {Promise<Reply[]>}
 */
replySchema.statics.getLatestReplies = function (bimbinganId, limit = 5) {
    return this.find({ bimbingan: bimbinganId })
        .populate('sender', 'name role')
        .sort({ createdAt: -1 })
        .limit(limit);
};

// ===== Instance Methods =====

/**
 * Check if sender is the owner
 * @param {ObjectId} userId - ID user
 * @returns {boolean}
 */
replySchema.methods.isOwner = function (userId) {
    return this.sender.toString() === userId.toString();
};

// ===== Create Model =====
const Reply = mongoose.model('Reply', replySchema);

module.exports = Reply;
