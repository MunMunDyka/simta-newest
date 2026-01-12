/**
 * ===========================================
 * Auth Controller - Authentication Logic
 * ===========================================
 * Controller untuk menangani autentikasi:
 * login, logout, refresh token, change password
 */

'use strict';

const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');
const { generateTokenPair, verifyRefreshToken } = require('../utils/tokenHelper');

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { nim_nip, password } = req.body;

    // 1. Find user by nim_nip (include password)
    const user = await User.findByNimNip(nim_nip);

    if (!user) {
        throw ApiError.unauthorized(
            `Login gagal. User dengan NIM/NIP '${nim_nip}' tidak ditemukan. ` +
            'Periksa kembali NIM/NIP Anda atau hubungi admin.'
        );
    }

    // 2. Check if user is active
    if (user.status !== 'aktif') {
        throw ApiError.forbidden(
            'Akun Anda saat ini tidak aktif. Hubungi administrator untuk mengaktifkan kembali.'
        );
    }

    // 3. Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw ApiError.unauthorized(
            'Login gagal. Password yang Anda masukkan salah. ' +
            'Jika lupa password, hubungi administrator.'
        );
    }

    // 4. Generate tokens
    const tokens = generateTokenPair(user);

    // 5. Populate dosen pembimbing if mahasiswa (BEFORE toPublicJSON)
    if (user.role === 'mahasiswa') {
        await user.populate('dospem_1 dospem_2', 'name nim_nip email');
    }

    // 6. Prepare user data (without password)
    const userData = user.toPublicJSON();

    // 7. Send response
    console.log(`✅ Login successful: ${user.name} (${user.role})`);

    sendSuccess(res, 200, 'Login berhasil! Selamat datang.', {
        user: userData,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
    });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    // User already attached by authMiddleware
    let user = await User.findById(req.user._id);

    if (!user) {
        throw ApiError.notFound('User tidak ditemukan');
    }

    // Populate dosen pembimbing if mahasiswa
    if (user.role === 'mahasiswa') {
        await user.populate('dospem_1 dospem_2', 'name nim_nip email');
    }

    sendSuccess(res, 200, 'Data user berhasil diambil', user.toPublicJSON());
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: token } = req.body;

    if (!token) {
        throw ApiError.badRequest('Refresh token wajib disertakan');
    }

    // 1. Verify refresh token
    let decoded;
    try {
        decoded = verifyRefreshToken(token);
    } catch (error) {
        throw error;
    }

    // 2. Find user
    const user = await User.findById(decoded.id);

    if (!user) {
        throw ApiError.unauthorized('User tidak ditemukan. Silakan login kembali.');
    }

    if (user.status !== 'aktif') {
        throw ApiError.forbidden('Akun tidak aktif. Hubungi administrator.');
    }

    // 3. Generate new tokens
    const tokens = generateTokenPair(user);

    sendSuccess(res, 200, 'Token berhasil diperbarui', {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
    });
});

/**
 * @desc    Logout user (client-side should clear tokens)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    // For JWT, logout is handled client-side by removing the token
    // Here we just confirm the logout was requested

    console.log(`📴 Logout: ${req.user.name}`);

    sendSuccess(res, 200, 'Logout berhasil. Sampai jumpa!', null);
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // 1. Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        throw ApiError.notFound('User tidak ditemukan');
    }

    // 2. Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
        throw ApiError.badRequest('Password saat ini salah. Periksa kembali password Anda.');
    }

    // 3. Check if new password is same as current
    const isSamePassword = await user.comparePassword(newPassword);

    if (isSamePassword) {
        throw ApiError.badRequest('Password baru tidak boleh sama dengan password saat ini.');
    }

    // 4. Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // 5. Generate new tokens (invalidate old ones)
    const tokens = generateTokenPair(user);

    console.log(`🔐 Password changed: ${user.name}`);

    sendSuccess(res, 200, 'Password berhasil diubah. Silakan login dengan password baru.', {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
    });
});

module.exports = {
    login,
    getMe,
    refreshToken,
    logout,
    changePassword
};
