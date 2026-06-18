/**
 * ===========================================
 * Jadwal Routes - Jadwal Sidang Endpoints
 * ===========================================
 * Routes untuk manajemen jadwal sidang
 */

'use strict';

const express = require('express');
const router = express.Router();

// Controllers
const jadwalController = require('../controller/jadwalController');

// Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
    createJadwalValidation,
    updateJadwalValidation,
    mongoIdParam,
    paginationQuery,
    handleValidationErrors
} = require('../middleware/validationMiddleware');

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/jadwal/statistics
 * @desc    Get jadwal statistics
 * @access  Admin
 */
router.get(
    '/statistics',
    roleMiddleware(['admin']),
    jadwalController.getStatistics
);

/**
 * @route   GET /api/jadwal/penguji-workload
 * @desc    Get examiner workloads
 * @access  Admin
 */
router.get(
    '/penguji-workload',
    roleMiddleware(['admin']),
    jadwalController.getPengujiWorkload
);

/**
 * @route   GET /api/jadwal/upcoming
 * @desc    Get upcoming jadwal
 * @access  Private
 */
router.get(
    '/upcoming',
    jadwalController.getUpcoming
);

/**
 * @route   GET /api/jadwal
 * @desc    Get all jadwal (filtered by role)
 * @access  Private
 */
router.get(
    '/',
    paginationQuery,
    handleValidationErrors,
    jadwalController.getAll
);

/**
 * @route   GET /api/jadwal/:id
 * @desc    Get jadwal by ID
 * @access  Private
 */
router.get(
    '/:id',
    mongoIdParam('id'),
    handleValidationErrors,
    jadwalController.getById
);

/**
 * @route   POST /api/jadwal
 * @desc    Create new jadwal
 * @access  Admin
 */
router.post(
    '/',
    roleMiddleware(['admin']),
    createJadwalValidation,
    handleValidationErrors,
    jadwalController.create
);

/**
 * @route   PUT /api/jadwal/:id
 * @desc    Update jadwal
 * @access  Admin
 */
router.put(
    '/:id',
    roleMiddleware(['admin']),
    mongoIdParam('id'),
    updateJadwalValidation,
    handleValidationErrors,
    jadwalController.update
);

/**
 * @route   DELETE /api/jadwal/all/permanent
 * @desc    Hard delete all schedules (permanent removal)
 * @access  Admin
 */
router.delete(
    '/all/permanent',
    roleMiddleware(['admin']),
    jadwalController.clearAll
);

/**
 * @route   DELETE /api/jadwal/:id/permanent
 * @desc    Hard delete jadwal (permanent removal)
 * @access  Admin
 */
router.delete(
    '/:id/permanent',
    roleMiddleware(['admin']),
    mongoIdParam('id'),
    handleValidationErrors,
    jadwalController.hardDelete
);

/**
 * @route   DELETE /api/jadwal/:id
 * @desc    Cancel jadwal
 * @access  Admin
 */
router.delete(
    '/:id',
    roleMiddleware(['admin']),
    mongoIdParam('id'),
    handleValidationErrors,
    jadwalController.remove
);

module.exports = router;
