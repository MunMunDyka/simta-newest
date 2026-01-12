/**
 * ===========================================
 * Error Middleware - Global Error Handler
 * ===========================================
 * Menangani semua error dari route handlers
 * dengan format response yang konsisten dan verbose
 */

'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Convert Mongoose validation errors to readable format
 * @param {Object} err - Mongoose validation error
 * @returns {Array} - Array of error objects
 */
const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(error => ({
        field: error.path,
        message: error.message,
        value: error.value
    }));
    return errors;
};

/**
 * Handle MongoDB duplicate key error
 * @param {Object} err - MongoDB error
 * @returns {string} - Error message
 */
const handleDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return `Data dengan ${field} '${value}' sudah ada. Gunakan nilai yang berbeda.`;
};

/**
 * Handle MongoDB CastError (invalid ObjectId, etc.)
 * @param {Object} err - MongoDB error
 * @returns {string} - Error message
 */
const handleCastError = (err) => {
    return `Format tidak valid untuk ${err.path}: ${err.value}`;
};

/**
 * Global Error Handler Middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
const errorMiddleware = (err, req, res, next) => {
    // Log error for debugging
    console.error('');
    console.error('╔════════════════════════════════════════════════════════════╗');
    console.error('║   🔴 ERROR OCCURRED                                        ║');
    console.error('╚════════════════════════════════════════════════════════════╝');
    console.error(`📍 Path: ${req.method} ${req.originalUrl}`);
    console.error(`⏰ Time: ${new Date().toISOString()}`);
    console.error(`📝 Message: ${err.message}`);

    if (process.env.NODE_ENV === 'development') {
        console.error(`📚 Stack: ${err.stack}`);
    }
    console.error('');

    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || [];

    // ===== Handle specific error types =====

    // 1. ApiError (our custom error)
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    }

    // 2. Mongoose Validation Error
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validasi gagal. Periksa kembali data yang dikirim.';
        errors = handleValidationError(err);
    }

    // 3. MongoDB Duplicate Key Error
    else if (err.code === 11000) {
        statusCode = 409;
        message = handleDuplicateKeyError(err);
    }

    // 4. MongoDB CastError (Invalid ObjectId, etc.)
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = handleCastError(err);
    }

    // 5. JWT Errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token tidak valid. Silakan login kembali.';
    }

    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token sudah kedaluwarsa. Silakan login kembali.';
    }

    // 6. Multer Errors (File upload)
    else if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'Ukuran file terlalu besar. Maksimal 10MB.';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Field file tidak sesuai.';
        } else {
            message = `Error upload file: ${err.message}`;
        }
    }

    // 7. SyntaxError (Invalid JSON body)
    else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'Format JSON tidak valid. Periksa body request Anda.';
    }

    // ===== Build Response =====
    const response = {
        success: false,
        message,
        code: statusCode,
        errors
    };

    // Include stack trace in development mode
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        response.errorType = err.name;
    }

    // Include request info for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
        response.request = {
            method: req.method,
            path: req.originalUrl,
            body: req.body,
            params: req.params,
            query: req.query
        };
    }

    // Send response
    res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
