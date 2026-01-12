/**
 * ===========================================
 * Token Helper - JWT Utilities
 * ===========================================
 * Helper functions untuk generate dan verify
 * JWT access tokens dan refresh tokens
 */

'use strict';

const jwt = require('jsonwebtoken');
const ApiError = require('./ApiError');

// ===== Environment Variables =====
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_change_this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_this';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate Access Token
 * @param {Object} payload - Data to encode (biasanya { id, nim_nip, role })
 * @returns {string} - JWT access token
 */
const generateAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'simta-api',
        audience: 'simta-frontend'
    });
};

/**
 * Generate Refresh Token
 * @param {Object} payload - Data to encode (biasanya { id })
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'simta-api',
        audience: 'simta-frontend'
    });
};

/**
 * Generate both Access and Refresh tokens
 * @param {Object} user - User object
 * @returns {Object} - { accessToken, refreshToken }
 */
const generateTokenPair = (user) => {
    const accessPayload = {
        id: user._id || user.id,
        nim_nip: user.nim_nip,
        role: user.role,
        name: user.name
    };

    const refreshPayload = {
        id: user._id || user.id
    };

    return {
        accessToken: generateAccessToken(accessPayload),
        refreshToken: generateRefreshToken(refreshPayload)
    };
};

/**
 * Verify Access Token
 * @param {string} token - JWT access token
 * @returns {Object} - Decoded payload
 * @throws {ApiError} - If token is invalid or expired
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET, {
            issuer: 'simta-api',
            audience: 'simta-frontend'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw ApiError.unauthorized('Token sudah kedaluwarsa, silakan login kembali');
        }
        if (error.name === 'JsonWebTokenError') {
            throw ApiError.unauthorized('Token tidak valid');
        }
        throw ApiError.unauthorized('Gagal memverifikasi token');
    }
};

/**
 * Verify Refresh Token
 * @param {string} token - JWT refresh token
 * @returns {Object} - Decoded payload
 * @throws {ApiError} - If token is invalid or expired
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET, {
            issuer: 'simta-api',
            audience: 'simta-frontend'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw ApiError.unauthorized('Refresh token sudah kedaluwarsa, silakan login kembali');
        }
        if (error.name === 'JsonWebTokenError') {
            throw ApiError.unauthorized('Refresh token tidak valid');
        }
        throw ApiError.unauthorized('Gagal memverifikasi refresh token');
    }
};

/**
 * Decode token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Token or null
 */
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader) return null;

    // Support both "Bearer <token>" and just "<token>"
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return authHeader;
};

/**
 * Get token expiry date
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiry date or null
 */
const getTokenExpiry = (token) => {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
    }
    return null;
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired
 */
const isTokenExpired = (token) => {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;
    return expiry < new Date();
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
    extractTokenFromHeader,
    getTokenExpiry,
    isTokenExpired
};
