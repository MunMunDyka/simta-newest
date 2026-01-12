/**
 * ===========================================
 * Auth Middleware - JWT Verification
 * ===========================================
 * Middleware untuk memverifikasi JWT token
 * dan melindungi route yang memerlukan autentikasi
 */

'use strict';

const { verifyAccessToken, extractTokenFromHeader } = require('../utils/tokenHelper');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Auth Middleware - Verify JWT and attach user to request
 * 
 * Usage:
 * router.get('/protected', authMiddleware, controller);
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
        throw ApiError.unauthorized(
            'Access denied. Token tidak ditemukan. Silakan login terlebih dahulu.'
        );
    }

    // 2. Verify token
    let decoded;
    try {
        decoded = verifyAccessToken(token);
    } catch (error) {
        throw error; // ApiError from verifyAccessToken
    }

    // 3. Check if user still exists
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
        throw ApiError.unauthorized(
            'User dengan token ini tidak ditemukan. Mungkin akun sudah dihapus.'
        );
    }

    // 4. Check if user is still active
    if (user.status !== 'aktif') {
        throw ApiError.forbidden(
            'Akun Anda tidak aktif. Hubungi administrator untuk informasi lebih lanjut.'
        );
    }

    // 5. Attach user to request object
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;

    // 6. Continue to next middleware/controller
    next();
});

/**
 * Optional Auth Middleware - If token exists, verify it; otherwise continue
 * Useful for routes that work with or without authentication
 * 
 * Usage:
 * router.get('/public-or-enhanced', optionalAuth, controller);
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
        try {
            const decoded = verifyAccessToken(token);
            const user = await User.findById(decoded.id).select('-password');

            if (user && user.status === 'aktif') {
                req.user = user;
                req.userId = user._id;
                req.userRole = user.role;
            }
        } catch (error) {
            // Token invalid, but continue anyway (optional auth)
            console.log('Optional auth: Token invalid, continuing as guest');
        }
    }

    next();
});

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;
