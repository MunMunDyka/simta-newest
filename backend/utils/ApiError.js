/**
 * ===========================================
 * ApiError - Custom Error Class
 * ===========================================
 * Error class untuk standardisasi error handling
 * dengan format response yang konsisten
 */

'use strict';

/**
 * Custom API Error class
 * @extends Error
 */
class ApiError extends Error {
    /**
     * Create an API Error
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     * @param {Array} errors - Additional error details
     * @param {boolean} isOperational - Is this an operational error?
     */
    constructor(statusCode, message, errors = [], isOperational = true) {
        super(message);

        this.statusCode = statusCode;
        this.success = false;
        this.errors = errors;
        this.isOperational = isOperational;

        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }

    // ===== Static Factory Methods =====

    /**
     * 400 Bad Request
     * @param {string} message - Error message
     * @param {Array} errors - Validation errors
     * @returns {ApiError}
     */
    static badRequest(message = 'Bad Request', errors = []) {
        return new ApiError(400, message, errors);
    }

    /**
     * 401 Unauthorized
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static unauthorized(message = 'Unauthorized: Silakan login terlebih dahulu') {
        return new ApiError(401, message);
    }

    /**
     * 403 Forbidden
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static forbidden(message = 'Forbidden: Anda tidak memiliki akses ke resource ini') {
        return new ApiError(403, message);
    }

    /**
     * 404 Not Found
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static notFound(message = 'Resource tidak ditemukan') {
        return new ApiError(404, message);
    }

    /**
     * 409 Conflict
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static conflict(message = 'Data sudah ada atau terjadi konflik') {
        return new ApiError(409, message);
    }

    /**
     * 422 Unprocessable Entity
     * @param {string} message - Error message
     * @param {Array} errors - Validation errors
     * @returns {ApiError}
     */
    static unprocessable(message = 'Validasi gagal', errors = []) {
        return new ApiError(422, message, errors);
    }

    /**
     * 429 Too Many Requests
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static tooManyRequests(message = 'Terlalu banyak request, coba lagi nanti') {
        return new ApiError(429, message);
    }

    /**
     * 500 Internal Server Error
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static internal(message = 'Internal Server Error', isOperational = false) {
        return new ApiError(500, message, [], isOperational);
    }

    /**
     * 503 Service Unavailable
     * @param {string} message - Error message
     * @returns {ApiError}
     */
    static serviceUnavailable(message = 'Service sedang tidak tersedia') {
        return new ApiError(503, message);
    }

    // ===== Utility Methods =====

    /**
     * Convert error to JSON response format
     * @param {boolean} includeStack - Include stack trace
     * @returns {Object}
     */
    toJSON(includeStack = false) {
        const response = {
            success: false,
            message: this.message,
            code: this.statusCode,
            errors: this.errors
        };

        if (includeStack && this.stack) {
            response.stack = this.stack;
        }

        return response;
    }
}

module.exports = ApiError;
