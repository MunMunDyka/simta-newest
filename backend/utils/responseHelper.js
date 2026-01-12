/**
 * ===========================================
 * Response Helper - Standardized Responses
 * ===========================================
 * Helper functions untuk format response JSON
 * yang konsisten di seluruh API
 */

'use strict';

/**
 * Send success response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {Object} meta - Optional metadata (pagination, etc.)
 */
const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
    const response = {
        success: true,
        message,
        code: statusCode,
        data
    };

    if (meta) {
        response.meta = meta;
    }

    res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array} errors - Array of error details
 * @param {string} stack - Error stack trace (development only)
 */
const sendError = (res, statusCode, message, errors = [], stack = null) => {
    const response = {
        success: false,
        message,
        code: statusCode,
        errors
    };

    if (stack && process.env.NODE_ENV === 'development') {
        response.stack = stack;
    }

    res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Response} res - Express response object
 * @param {string} message - Success message
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination info
 */
const sendPaginated = (res, message, data, pagination) => {
    const { page, limit, total } = pagination;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
        success: true,
        message,
        code: 200,
        data,
        meta: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    });
};

/**
 * Send created response (201)
 * @param {Response} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Created resource data
 */
const sendCreated = (res, message, data) => {
    sendSuccess(res, 201, message, data);
};

/**
 * Send no content response (204)
 * @param {Response} res - Express response object
 */
const sendNoContent = (res) => {
    res.status(204).send();
};

/**
 * Send accepted response (202)
 * @param {Response} res - Express response object
 * @param {string} message - Success message
 * @param {*} data - Optional data
 */
const sendAccepted = (res, message, data = null) => {
    sendSuccess(res, 202, message, data);
};

module.exports = {
    sendSuccess,
    sendError,
    sendPaginated,
    sendCreated,
    sendNoContent,
    sendAccepted
};
