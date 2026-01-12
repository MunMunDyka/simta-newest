/**
 * ===========================================
 * Middleware Index - Export all middlewares
 * ===========================================
 */

'use strict';

const authMiddleware = require('./authMiddleware');
const roleMiddleware = require('./roleMiddleware');
const errorMiddleware = require('./errorMiddleware');
const validationMiddleware = require('./validationMiddleware');

module.exports = {
    authMiddleware,
    optionalAuth: authMiddleware.optionalAuth,
    roleMiddleware,
    adminOnly: roleMiddleware.adminOnly,
    dosenOnly: roleMiddleware.dosenOnly,
    mahasiswaOnly: roleMiddleware.mahasiswaOnly,
    adminOrDosen: roleMiddleware.adminOrDosen,
    selfOrAdmin: roleMiddleware.selfOrAdmin,
    errorMiddleware,
    ...validationMiddleware
};
