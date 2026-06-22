/**
 * ===========================================
 * Validation Middleware - Input Validation
 * ===========================================
 * Validation rules menggunakan express-validator
 * untuk memvalidasi request body, params, dan query
 */

'use strict';

const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// ===== Validation Result Handler =====

/**
 * Handle validation errors
 * Use after validation rules
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value
        }));

        throw ApiError.badRequest('Validasi gagal. Periksa kembali data yang dikirim.', errorMessages);
    }

    next();
};

// ===== Auth Validation Rules =====

/**
 * Login validation
 */
const loginValidation = [
    body('nim_nip')
        .notEmpty().withMessage('Username wajib diisi')
        .isLength({ min: 5, max: 20 }).withMessage('Username harus 5-20 karakter'),

    body('password')
        .notEmpty().withMessage('Password wajib diisi')
];

/**
 * Change password validation
 */
const changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('Password saat ini wajib diisi'),

    body('newPassword')
        .notEmpty().withMessage('Password baru wajib diisi')
        .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter')
        .matches(/\d/).withMessage('Password baru harus mengandung minimal 1 angka'),

    body('confirmPassword')
        .notEmpty().withMessage('Konfirmasi password wajib diisi')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Konfirmasi password tidak cocok');
            }
            return true;
        })
];

// ===== User Validation Rules =====

/**
 * Create user validation (Admin only)
 */
const createUserValidation = [
    body('nim_nip')
        .notEmpty().withMessage('NIM/NIP wajib diisi')
        .isLength({ min: 5, max: 20 }).withMessage('NIM/NIP harus 5-20 karakter')
        .trim(),

    body('password')
        .notEmpty().withMessage('Password wajib diisi')
        .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),

    body('name')
        .notEmpty().withMessage('Nama wajib diisi')
        .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter')
        .trim(),

    body('email')
        .optional({ nullable: true, checkFalsy: true })
        .isEmail().withMessage('Format email tidak valid')
        .normalizeEmail(),

    body('role')
        .notEmpty().withMessage('Role wajib diisi')
        .isIn(['mahasiswa', 'dosen', 'admin']).withMessage('Role harus: mahasiswa, dosen, atau admin'),

    body('prodi')
        .optional()
        .trim(),

    body('semester')
        .optional()
        .trim()
];

/**
 * Update user validation
 */
const updateUserValidation = [
    body('name')
        .optional()
        .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter')
        .trim(),

    body('email')
        .optional({ nullable: true, checkFalsy: true })
        .isEmail().withMessage('Format email tidak valid')
        .normalizeEmail(),

    body('prodi')
        .optional()
        .trim(),

    body('semester')
        .optional()
        .trim(),

    body('judulTA')
        .optional()
        .trim(),

    body('status')
        .optional()
        .isIn(['aktif', 'nonaktif']).withMessage('Status harus: aktif atau nonaktif')
];

/**
 * Assign dospem validation
 */
const assignDospemValidation = [
    body('dospem_1')
        .optional({ nullable: true })
        .isMongoId().withMessage('Format ID dosen pembimbing 1 tidak valid'),

    body('dospem_2')
        .optional({ nullable: true })
        .isMongoId().withMessage('Format ID dosen pembimbing 2 tidak valid'),

    body('penguji_1')
        .optional({ nullable: true })
        .isMongoId().withMessage('Format ID dosen penguji 1 tidak valid'),

    body('penguji_2')
        .optional({ nullable: true })
        .isMongoId().withMessage('Format ID dosen penguji 2 tidak valid')
];

// ===== Bimbingan Validation Rules =====

/**
 * Create bimbingan validation
 */
const createBimbinganValidation = [
    body('judul')
        .notEmpty().withMessage('Judul bimbingan wajib diisi')
        .isLength({ min: 5, max: 200 }).withMessage('Judul harus 5-200 karakter')
        .trim(),

    body('dosenType')
        .notEmpty().withMessage('Jenis dosen pembimbing wajib diisi')
        .isIn(['dospem_1', 'dospem_2', 'penguji_1', 'penguji_2']).withMessage('Jenis dosen harus: dospem_1, dospem_2, penguji_1, atau penguji_2'),

    body('catatan')
        .optional()
        .isLength({ max: 1000 }).withMessage('Catatan maksimal 1000 karakter')
        .trim()
];

/**
 * Give feedback validation
 */
const feedbackValidation = [
    body('status')
        .notEmpty().withMessage('Status wajib diisi')
        .isIn(['revisi', 'acc', 'lanjut_bab', 'acc_sempro']).withMessage('Status harus: revisi, acc, lanjut_bab, atau acc_sempro'),

    body('feedback')
        .notEmpty().withMessage('Feedback wajib diisi')
        .isLength({ min: 5, max: 2000 }).withMessage('Feedback harus 5-2000 karakter')
        .trim()
];

/**
 * Save draft feedback validation
 */
const draftFeedbackValidation = [
    body('status')
        .optional({ nullable: true, checkFalsy: true })
        .isIn(['revisi', 'acc', 'lanjut_bab', 'acc_sempro']).withMessage('Status tidak valid'),

    body('feedback')
        .optional({ nullable: true, checkFalsy: true })
        .isLength({ max: 2000 }).withMessage('Draft feedback maksimal 2000 karakter')
        .trim()
];

/**
 * Reply validation
 */
const replyValidation = [
    body('message')
        .notEmpty().withMessage('Pesan wajib diisi')
        .isLength({ min: 1, max: 2000 }).withMessage('Pesan maksimal 2000 karakter')
        .trim()
];

// ===== Jadwal Validation Rules =====

const checkWeekend = (val) => {
    if (!val) return true;
    const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
    let day;
    if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        const dateNum = parseInt(match[3]);
        const dateObj = new Date(Date.UTC(year, month, dateNum));
        day = dateObj.getUTCDay();
    } else {
        const dateObj = new Date(val);
        day = dateObj.getUTCDay();
    }
    if (day === 0 || day === 6) {
        throw new Error('Jadwal tidak boleh pada hari Sabtu atau Minggu (weekend)');
    }
    return true;
};

const checkTimeLimit = (val) => {
    if (!val) return true;
    const [hours, minutes] = val.split(':').map(Number);
    const timeVal = hours * 60 + minutes;
    const startLimit = 8 * 60; // 08:00
    const endLimit = 17 * 60;  // 17:00
    if (timeVal < startLimit || timeVal > endLimit) {
        throw new Error('Waktu sidang harus antara pukul 08:00 - 17:00 WIB');
    }
    return true;
};

/**
 * Create jadwal validation
 */
const createJadwalValidation = [
    body('mahasiswa')
        .notEmpty().withMessage('ID mahasiswa wajib diisi')
        .isMongoId().withMessage('Format ID mahasiswa tidak valid'),

    body('jenisJadwal')
        .notEmpty().withMessage('Jenis jadwal wajib diisi')
        .isIn(['sidang_proposal', 'sidang_skripsi']).withMessage('Jenis jadwal harus: sidang_proposal atau sidang_skripsi'),

    body('tanggal')
        .notEmpty().withMessage('Tanggal wajib diisi')
        .isISO8601().withMessage('Format tanggal tidak valid (gunakan ISO 8601)')
        .custom(checkWeekend),

    body('waktuMulai')
        .notEmpty().withMessage('Waktu mulai wajib diisi')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Format waktu harus HH:MM')
        .custom(checkTimeLimit),

    body('waktuSelesai')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Format waktu harus HH:MM')
        .custom(checkTimeLimit),

    body('ruangan')
        .optional()
        .isLength({ max: 100 }).withMessage('Nama ruangan maksimal 100 karakter')
        .trim(),

    body('penguji')
        .optional()
        .isArray().withMessage('Penguji harus berupa array'),

    body('penguji.*')
        .isMongoId().withMessage('Format ID penguji tidak valid')
];

/**
 * Update jadwal validation
 */
const updateJadwalValidation = [
    body('tanggal')
        .optional()
        .isISO8601().withMessage('Format tanggal tidak valid')
        .custom(checkWeekend),

    body('waktuMulai')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Format waktu harus HH:MM')
        .custom(checkTimeLimit),

    body('waktuSelesai')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Format waktu harus HH:MM')
        .custom(checkTimeLimit),

    body('status')
        .optional()
        .isIn(['dijadwalkan', 'berlangsung', 'selesai', 'dibatalkan']).withMessage('Status tidak valid'),

    body('hasil')
        .optional()
        .isIn(['lulus', 'lulus_revisi', 'tidak_lulus']).withMessage('Hasil tidak valid'),

    body('nilaiSidang')
        .optional()
        .isFloat({ min: 0, max: 100 }).withMessage('Nilai harus antara 0-100')
];

// ===== Clear Bimbingan Validation Rules =====

/**
 * Clear bimbingan history validation (Admin only)
 */
const clearBimbinganValidation = [
    query('dosenType')
        .notEmpty().withMessage('Jenis dosen (dosenType) wajib diisi')
        .isIn(['dospem_1', 'dospem_2', 'all']).withMessage('dosenType harus: dospem_1, dospem_2, atau all'),

    query('resetProgressTo')
        .optional()
        .isIn(['BAB I', 'BAB II', 'BAB III', 'BAB IV', 'BAB V', 'Selesai'])
        .withMessage('Target reset progress tidak valid')
];

/**
 * Clear all bimbingan history validation (Admin only)
 */
const clearAllBimbinganGlobalValidation = [
    query('resetProgressTo')
        .optional()
        .isIn(['BAB I', 'BAB II', 'BAB III', 'BAB IV', 'BAB V', 'Selesai'])
        .withMessage('Target reset progress tidak valid')
];

// ===== Common Validation Rules =====

/**
 * MongoDB ObjectId param validation
 */
const mongoIdParam = (paramName = 'id') => [
    param(paramName)
        .isMongoId().withMessage(`Format ${paramName} tidak valid`)
];

/**
 * Pagination query validation
 */
const paginationQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page harus bilangan positif'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 500 }).withMessage('Limit harus antara 1-500')
];

module.exports = {
    handleValidationErrors,
    // Auth
    loginValidation,
    changePasswordValidation,
    // User
    createUserValidation,
    updateUserValidation,
    assignDospemValidation,
    // Bimbingan
    createBimbinganValidation,
    feedbackValidation,
    draftFeedbackValidation,
    replyValidation,
    clearBimbinganValidation,
    clearAllBimbinganGlobalValidation,
    // Jadwal
    createJadwalValidation,
    updateJadwalValidation,
    // Common
    mongoIdParam,
    paginationQuery
};
