/**
 * ===========================================
 * User Routes - User Management Endpoints
 * ===========================================
 * Routes untuk manajemen user (CRUD)
 */

'use strict';

const express = require('express');
const router = express.Router();

// Controllers
const userController = require('../controller/userController');

// Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
    createUserValidation,
    updateUserValidation,
    assignDospemValidation,
    mongoIdParam,
    paginationQuery,
    handleValidationErrors
} = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/users/statistics
 * @desc    Get user statistics
 * @access  Admin
 */
router.get(
    '/statistics',
    roleMiddleware(['admin']),
    userController.getStatistics
);

/**
 * @route   GET /api/users/dosen
 * @desc    Get all dosen (for dropdown)
 * @access  Admin
 */
router.get(
    '/dosen',
    roleMiddleware(['admin']),
    userController.getAllDosen
);

/**
 * @route   GET /api/users/mahasiswa-bimbingan
 * @desc    Get mahasiswa bimbingan (for dosen or admin viewing dosen)
 * @access  Dosen, Admin
 */
router.get(
    '/mahasiswa-bimbingan',
    roleMiddleware(['dosen', 'admin']),
    userController.getMahasiswaBimbingan
);

// Multer for avatar upload
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure avatars directory exists
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `avatar_${req.user._id}_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const avatarUpload = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar (JPEG, PNG, GIF, WEBP) yang diperbolehkan'));
        }
    }
});

/**
 * @route   POST /api/users/upload-avatar
 * @desc    Upload avatar for current user
 * @access  Private (all authenticated users)
 */
router.post(
    '/upload-avatar',
    avatarUpload.single('avatar'),
    userController.uploadAvatar
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update own profile
 * @access  Private (all authenticated users)
 */
router.put(
    '/profile',
    userController.updateProfile
);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination & filtering
 * @access  Admin
 */
router.get(
    '/',
    roleMiddleware(['admin']),
    paginationQuery,
    handleValidationErrors,
    userController.getAll
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (self or admin)
 */
router.get(
    '/:id',
    mongoIdParam('id'),
    handleValidationErrors,
    userController.getById
);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Admin
 */
router.post(
    '/',
    roleMiddleware(['admin']),
    createUserValidation,
    handleValidationErrors,
    userController.create
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin or Self
 */
router.put(
    '/:id',
    mongoIdParam('id'),
    updateUserValidation,
    handleValidationErrors,
    userController.update
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (soft delete)
 * @access  Admin
 */
router.delete(
    '/:id',
    roleMiddleware(['admin']),
    mongoIdParam('id'),
    handleValidationErrors,
    userController.remove
);

/**
 * @route   DELETE /api/users/:id/permanent
 * @desc    Permanent delete user (hard delete from database)
 * @access  Admin
 */
router.delete(
    '/:id/permanent',
    roleMiddleware(['admin']),
    mongoIdParam('id'),
    handleValidationErrors,
    userController.hardDelete
);

/**
 * @route   PUT /api/users/:id/assign-dospem
 * @desc    Assign dosen pembimbing to mahasiswa
 * @access  Admin
 */
router.put(
    '/:id/assign-dospem',
    roleMiddleware(['admin']),
    mongoIdParam('id'),
    assignDospemValidation,
    handleValidationErrors,
    userController.assignDospem
);

/**
 * @route   PUT /api/users/:id/reset-password
 * @desc    Reset user password (Admin only)
 * @access  Admin
 */
router.put(
    '/:id/reset-password',
    roleMiddleware(['admin']),
    mongoIdParam('id'),
    userController.resetPassword
);

module.exports = router;
