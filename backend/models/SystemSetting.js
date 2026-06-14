/**
 * ===========================================
 * System Setting Model
 * ===========================================
 * Menyimpan konfigurasi sistem yang bisa diubah admin
 */

'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const systemSettingSchema = new Schema({
    key: {
        type: String,
        required: [true, 'Key setting wajib diisi'],
        unique: true,
        trim: true
    },
    value: {
        type: Schema.Types.Mixed,
        required: [true, 'Value setting wajib diisi']
    },
    label: {
        type: String,
        trim: true,
        default: null
    },
    description: {
        type: String,
        trim: true,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
