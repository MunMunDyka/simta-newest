/**
 * ===========================================
 * Role Middleware - Role-Based Access Control
 * ===========================================
 * Middleware untuk membatasi akses berdasarkan
 * role user (admin, dosen, mahasiswa)
 */

'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Role Middleware Factory
 * Membatasi akses hanya untuk role tertentu
 * 
 * @param {string[]} allowedRoles - Array of role yang diizinkan
 * @returns {Function} - Express middleware function
 * 
 * Usage:
 * router.post('/users', authMiddleware, roleMiddleware(['admin']), controller);
 * router.get('/mahasiswa', authMiddleware, roleMiddleware(['admin', 'dosen']), controller);
 */
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        // 1. Check if user exists (should be set by authMiddleware)
        if (!req.user) {
            throw ApiError.unauthorized(
                'Akses ditolak. Silakan login terlebih dahulu.'
            );
        }

        // 2. Check if user's role is in allowed roles
        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            // Build friendly error message
            const rolesText = allowedRoles.join(', ');
            throw ApiError.forbidden(
                `Akses ditolak. Hanya ${rolesText} yang dapat mengakses resource ini. ` +
                `Role Anda saat ini: ${userRole}`
            );
        }

        // 3. User has permission, continue
        next();
    };
};

/**
 * Admin Only Middleware
 * Shortcut for roleMiddleware(['admin'])
 */
const adminOnly = roleMiddleware(['admin']);

/**
 * Dosen Only Middleware
 * Shortcut for roleMiddleware(['dosen'])
 */
const dosenOnly = roleMiddleware(['dosen']);

/**
 * Mahasiswa Only Middleware
 * Shortcut for roleMiddleware(['mahasiswa'])
 */
const mahasiswaOnly = roleMiddleware(['mahasiswa']);

/**
 * Admin or Dosen Middleware
 * Shortcut for roleMiddleware(['admin', 'dosen'])
 */
const adminOrDosen = roleMiddleware(['admin', 'dosen']);

/**
 * Self or Admin Middleware
 * User can access their own resource, or admin can access any
 * 
 * @param {string} paramName - Name of the request param containing user ID (default: 'id')
 */
const selfOrAdmin = (paramName = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            throw ApiError.unauthorized('Akses ditolak. Silakan login terlebih dahulu.');
        }

        const targetId = req.params[paramName];
        const isAdmin = req.user.role === 'admin';
        const isSelf = req.user._id.toString() === targetId;

        if (!isAdmin && !isSelf) {
            throw ApiError.forbidden(
                'Akses ditolak. Anda hanya dapat mengakses data milik Anda sendiri.'
            );
        }

        next();
    };
};

/**
 * Check if user is the owner of a resource
 * For use in controllers after fetching the resource
 * 
 * @param {ObjectId} resourceOwnerId - Owner ID of the resource
 * @param {ObjectId} currentUserId - Current user ID
 * @param {string} currentUserRole - Current user role
 * @returns {boolean} - True if user can access
 */
const canAccess = (resourceOwnerId, currentUserId, currentUserRole) => {
    if (currentUserRole === 'admin') return true;
    return resourceOwnerId.toString() === currentUserId.toString();
};

module.exports = roleMiddleware;
module.exports.adminOnly = adminOnly;
module.exports.dosenOnly = dosenOnly;
module.exports.mahasiswaOnly = mahasiswaOnly;
module.exports.adminOrDosen = adminOrDosen;
module.exports.selfOrAdmin = selfOrAdmin;
module.exports.canAccess = canAccess;
