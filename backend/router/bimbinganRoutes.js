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
    replyValidation,
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
