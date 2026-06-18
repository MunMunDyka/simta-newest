/**
 * ===========================================
 * Bimbingan Routes - Bimbingan Endpoints
 * ===========================================
 * Routes untuk manajemen bimbingan skripsi
 */

'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Controllers
const bimbinganController = require('../controller/bimbinganController');

// Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
    createBimbinganValidation,
    feedbackValidation,
    draftFeedbackValidation,
    replyValidation,
    clearBimbinganValidation,
    clearAllBimbinganGlobalValidation,
    mongoIdParam,
    paginationQuery,
    handleValidationErrors
} = require('../middleware/validationMiddleware');

// ===== Multer Configuration =====

// Ensure uploads directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const bimbinganUploadDir = path.join(uploadDir, 'bimbingan');

if (!fs.existsSync(bimbinganUploadDir)) {
    fs.mkdirSync(bimbinganUploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, bimbinganUploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: userId_timestamp_originalname
        const userId = req.user ? req.user._id : 'unknown';
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, `${userId}_${timestamp}_${safeName}`);
    }
});

// File filter - PDF only
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Hanya file PDF yang diperbolehkan'), false);
    }
};

// Multer upload instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: (parseInt(process.env.MAX_FILE_SIZE) || 10) * 1024 * 1024 // Default 10MB
    }
});

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/bimbingan/admin/progress-report
 * @desc    Get bimbingan progress report for all mahasiswa
 * @access  Admin
 */
router.get(
    '/admin/progress-report',
    roleMiddleware(['admin']),
    bimbinganController.getProgressReport
);

/**
 * @route   GET /api/bimbingan/admin/settings/:mahasiswaId
 * @desc    Get bimbingan settings for selected mahasiswa
 * @access  Admin
 */
router.get(
    '/admin/settings/:mahasiswaId',
    roleMiddleware(['admin']),
    mongoIdParam('mahasiswaId'),
    handleValidationErrors,
    bimbinganController.getBimbinganSettings
);

/**
 * @route   PUT /api/bimbingan/admin/settings/:mahasiswaId
 * @desc    Update bimbingan settings for selected mahasiswa
 * @access  Admin
 */
router.put(
    '/admin/settings/:mahasiswaId',
    roleMiddleware(['admin']),
    mongoIdParam('mahasiswaId'),
    handleValidationErrors,
    bimbinganController.updateBimbinganSettings
);

/**
 * @route   GET /api/bimbingan/admin/mahasiswa/:mahasiswaId
 * @desc    Get bimbingan summary for admin (all bimbingan + stats per dospem)
 * @access  Admin
 */
router.get(
    '/admin/mahasiswa/:mahasiswaId',
    roleMiddleware(['admin']),
    mongoIdParam('mahasiswaId'),
    handleValidationErrors,
    bimbinganController.getAdminBimbinganSummary
);

/**
 * @route   DELETE /api/bimbingan/admin/clear/:mahasiswaId
 * @desc    Clear bimbingan history (hard delete)
 * @access  Admin
 */
router.delete(
    '/admin/clear/:mahasiswaId',
    roleMiddleware(['admin']),
    mongoIdParam('mahasiswaId'),
    clearBimbinganValidation,
    handleValidationErrors,
    bimbinganController.clearBimbinganHistory
);

/**
 * @route   DELETE /api/bimbingan/admin/clear-all-global
 * @desc    Clear ALL bimbingan history globally (hard delete for all mahasiswas)
 * @access  Admin
 */
router.delete(
    '/admin/clear-all-global',
    roleMiddleware(['admin']),
    clearAllBimbinganGlobalValidation,
    handleValidationErrors,
    bimbinganController.clearAllBimbinganGlobal
);


/**
 * @route   GET /api/bimbingan/pending-count
 * @desc    Get pending bimbingan count (for dosen)
 * @access  Dosen
 */
router.get(
    '/pending-count',
    roleMiddleware(['dosen']),
    bimbinganController.getPendingCount
);

/**
 * @route   GET /api/bimbingan/sempro-status/:mahasiswaId
 * @desc    Get sempro readiness status for mahasiswa
 * @access  Private (mahasiswa own, dosen, admin)
 */
router.get(
    '/sempro-status/:mahasiswaId',
    mongoIdParam('mahasiswaId'),
    handleValidationErrors,
    bimbinganController.getSemproStatus
);

/**
 * @route   GET /api/bimbingan/generate-surat-sempro/:mahasiswaId
 * @desc    Generate and download Surat Persetujuan Sempro (DOCX)
 * @access  Private (mahasiswa own, admin)
 */
router.get(
    '/generate-surat-sempro/:mahasiswaId',
    mongoIdParam('mahasiswaId'),
    handleValidationErrors,
    bimbinganController.generateSuratSempro
);

/**
 * @route   GET /api/bimbingan/download/:id
 * @desc    Download bimbingan file
 * @access  Private (mahasiswa, dosen involved, or admin)
 */
router.get(
    '/download/:id',
    mongoIdParam('id'),
    handleValidationErrors,
    bimbinganController.downloadFile
);

/**
 * @route   GET /api/bimbingan
 * @desc    Get all bimbingan (filtered by role)
 * @access  Private
 */
router.get(
    '/',
    paginationQuery,
    handleValidationErrors,
    bimbinganController.getAll
);

/**
 * @route   GET /api/bimbingan/:id
 * @desc    Get bimbingan by ID
 * @access  Private
 */
router.get(
    '/:id',
    mongoIdParam('id'),
    handleValidationErrors,
    bimbinganController.getById
);

/**
 * @route   POST /api/bimbingan
 * @desc    Create new bimbingan (upload file)
 * @access  Mahasiswa
 */
router.post(
    '/',
    roleMiddleware(['mahasiswa']),
    upload.single('file'),
    createBimbinganValidation,
    handleValidationErrors,
    bimbinganController.create
);

/**
 * @route   PUT /api/bimbingan/:id/feedback
 * @desc    Give feedback to bimbingan
 * @access  Dosen
 */
router.put(
    '/:id/feedback',
    roleMiddleware(['dosen']),
    mongoIdParam('id'),
    upload.single('feedbackFile'), // Optional feedback file
    feedbackValidation,
    handleValidationErrors,
    bimbinganController.giveFeedback
);

/**
 * @route   PUT /api/bimbingan/:id/draft-feedback
 * @desc    Save feedback draft to bimbingan
 * @access  Dosen
 */
router.put(
    '/:id/draft-feedback',
    roleMiddleware(['dosen']),
    mongoIdParam('id'),
    upload.single('feedbackFile'), // Optional feedback file (we can use the same field name)
    draftFeedbackValidation,
    handleValidationErrors,
    bimbinganController.saveFeedbackDraft
);

/**
 * @route   POST /api/bimbingan/:id/reply
 * @desc    Add reply/comment to bimbingan
 * @access  Private (mahasiswa or dosen involved)
 */
router.post(
    '/:id/reply',
    mongoIdParam('id'),
    replyValidation,
    handleValidationErrors,
    bimbinganController.addReply
);

module.exports = router;
