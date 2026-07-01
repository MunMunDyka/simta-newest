/**
 * ===========================================
 * Auth Routes - Authentication Endpoints
 * ===========================================
 * Routes untuk autentikasi user
 */

'use strict';

const express = require('express');
const router = express.Router();

// Controllers
const authController = require('../controller/authController');

// Middlewares
const authMiddleware = require('../middleware/authMiddleware');
const {
    loginValidation,
    changePasswordValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
    handleValidationErrors
} = require('../middleware/validationMiddleware');

/**
 * @route   POST /api/auth/login
 * @desc    Login user with nim_nip and password
 * @access  Public
 */
router.post(
    '/login',
    loginValidation,
    handleValidationErrors,
    authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
    '/logout',
    authMiddleware,
    authController.logout
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get(
    '/me',
    authMiddleware,
    authController.getMe
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post(
    '/refresh',
    authController.refreshToken
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset link to registered email
 * @access  Public
 */
router.post(
    '/forgot-password',
    forgotPasswordValidation,
    handleValidationErrors,
    authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token from email
 * @access  Public
 */
router.post(
    '/reset-password',
    resetPasswordValidation,
    handleValidationErrors,
    authController.resetPassword
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
    '/change-password',
    authMiddleware,
    changePasswordValidation,
    handleValidationErrors,
    authController.changePassword
);

module.exports = router;
