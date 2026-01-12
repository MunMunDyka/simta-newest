/**
 * ===========================================
 * User Controller - User Management
 * ===========================================
 * Controller untuk CRUD user:
 * - Admin: Create, Read, Update, Delete users
 * - Dosen: View mahasiswa bimbingan
 * - All: View & update own profile
 */

'use strict';

const User = require('../models/User');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated, sendCreated } = require('../utils/responseHelper');

/**
 * @desc    Get all users with pagination & filtering
 * @route   GET /api/users
 * @access  Admin
 */
const getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role, status, search } = req.query;

    // Build query
    const query = {};

    if (role) {
        query.role = role;
    }

    if (status) {
        query.status = status;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { nim_nip: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-password')
            .populate('dospem_1 dospem_2', 'name nim_nip')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        User.countDocuments(query)
    ]);

    sendPaginated(res, 'Data user berhasil diambil', users, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private (self or admin)
 */
const getById = asyncHandler(async (req, res) => {
    // If admin, include plainPassword
    let query = User.findById(req.params.id)
        .populate('dospem_1 dospem_2', 'name nim_nip email');

    if (req.user.role === 'admin') {
        query = query.select('+plainPassword');
    } else {
        query = query.select('-password');
    }

    const user = await query;

    if (!user) {
        throw ApiError.notFound(`User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    // Check authorization (admin can view anyone, others can only view themselves)
    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
        // Dosen can view their bimbingan students
        if (req.user.role === 'dosen') {
            const isBimbinganStudent =
                (user.dospem_1 && user.dospem_1.toString() === req.user._id.toString()) ||
                (user.dospem_2 && user.dospem_2.toString() === req.user._id.toString());

            if (!isBimbinganStudent) {
                throw ApiError.forbidden('Anda hanya dapat melihat data mahasiswa bimbingan Anda');
            }
        } else {
            throw ApiError.forbidden('Anda hanya dapat melihat data diri sendiri');
        }
    }

    sendSuccess(res, 200, 'Data user berhasil diambil', user);
});

/**
 * @desc    Create new user (Admin only)
 * @route   POST /api/users
 * @access  Admin
 */
const create = asyncHandler(async (req, res) => {
    const { nim_nip, password, name, email, role, prodi, semester, status, judulTA } = req.body;

    // Check if nim_nip already exists
    const existingUser = await User.findOne({ nim_nip });

    if (existingUser) {
        throw ApiError.conflict(
            `User dengan NIM/NIP '${nim_nip}' sudah terdaftar. ` +
            'Gunakan NIM/NIP yang berbeda.'
        );
    }

    // Create new user
    const user = await User.create({
        nim_nip,
        password,
        plainPassword: password, // Store plain password for admin viewing (DEMO ONLY!)
        name,
        email,
        role,
        prodi,
        semester,
        judulTA,
        status: status || 'aktif'
    });

    console.log(`✅ User created: ${user.name} (${user.role}) by Admin ${req.user.name}`);

    sendCreated(res, 'User berhasil dibuat', user.toPublicJSON());
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Admin (all fields) or Self (limited fields)
 */
const update = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw ApiError.notFound(`User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user._id.toString() === user._id.toString();

    if (!isAdmin && !isSelf) {
        throw ApiError.forbidden('Anda hanya dapat mengupdate data diri sendiri');
    }

    // Determine allowed fields based on role
    let allowedFields;

    if (isAdmin) {
        // Admin can update all fields except password (use change-password)
        allowedFields = ['name', 'email', 'prodi', 'semester', 'judulTA', 'currentProgress', 'status', 'avatar', 'whatsapp'];
    } else {
        // Self can only update limited fields
        allowedFields = ['email', 'avatar'];
    }

    // Update only allowed fields
    const updates = {};
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    // Apply updates
    Object.assign(user, updates);
    await user.save();

    console.log(`✏️ User updated: ${user.name} by ${req.user.name}`);

    sendSuccess(res, 200, 'User berhasil diupdate', user.toPublicJSON());
});

/**
 * @desc    Delete user (soft delete by setting status to nonaktif)
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
const remove = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw ApiError.notFound(`User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    // Prevent deleting self
    if (req.user._id.toString() === user._id.toString()) {
        throw ApiError.badRequest('Anda tidak dapat menghapus akun sendiri');
    }

    // Prevent deleting other admins
    if (user.role === 'admin') {
        throw ApiError.forbidden('Tidak dapat menghapus akun admin lain');
    }

    // Soft delete
    user.status = 'nonaktif';
    await user.save();

    console.log(`🗑️ User deactivated: ${user.name} by Admin ${req.user.name}`);

    sendSuccess(res, 200, 'User berhasil dinonaktifkan', null);
});

/**
 * @desc    Hard delete user (permanent delete from database)
 * @route   DELETE /api/users/:id/permanent
 * @access  Admin
 */
const hardDelete = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw ApiError.notFound(`User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    // Prevent deleting self
    if (req.user._id.toString() === user._id.toString()) {
        throw ApiError.badRequest('Anda tidak dapat menghapus akun sendiri');
    }

    // Prevent deleting admins
    if (user.role === 'admin') {
        throw ApiError.forbidden('Tidak dapat menghapus akun admin');
    }

    // Permanent delete
    await User.findByIdAndDelete(req.params.id);

    console.log(`💀 User PERMANENTLY deleted: ${user.name} by Admin ${req.user.name}`);

    sendSuccess(res, 200, 'User berhasil dihapus permanen', null);
});

/**
 * @desc    Assign dosen pembimbing to mahasiswa
 * @route   PUT /api/users/:id/assign-dospem
 * @access  Admin
 */
const assignDospem = asyncHandler(async (req, res) => {
    const { dospem_1, dospem_2 } = req.body;

    const mahasiswa = await User.findById(req.params.id);

    if (!mahasiswa) {
        throw ApiError.notFound('Mahasiswa tidak ditemukan');
    }

    if (mahasiswa.role !== 'mahasiswa') {
        throw ApiError.badRequest('Hanya mahasiswa yang dapat di-assign dosen pembimbing');
    }

    // Validate dospem_1 if provided
    if (dospem_1) {
        const dosen1 = await User.findById(dospem_1);
        if (!dosen1 || dosen1.role !== 'dosen') {
            throw ApiError.badRequest('Dosen pembimbing 1 tidak valid atau bukan dosen');
        }
        mahasiswa.dospem_1 = dospem_1;
    } else if (dospem_1 === null) {
        mahasiswa.dospem_1 = null;
    }

    // Validate dospem_2 if provided
    if (dospem_2) {
        const dosen2 = await User.findById(dospem_2);
        if (!dosen2 || dosen2.role !== 'dosen') {
            throw ApiError.badRequest('Dosen pembimbing 2 tidak valid atau bukan dosen');
        }
        mahasiswa.dospem_2 = dospem_2;
    } else if (dospem_2 === null) {
        mahasiswa.dospem_2 = null;
    }

    // Check if dospem_1 and dospem_2 are the same
    if (mahasiswa.dospem_1 && mahasiswa.dospem_2 &&
        mahasiswa.dospem_1.toString() === mahasiswa.dospem_2.toString()) {
        throw ApiError.badRequest('Dosen pembimbing 1 dan 2 tidak boleh sama');
    }

    await mahasiswa.save();
    await mahasiswa.populate('dospem_1 dospem_2', 'name nim_nip');

    console.log(`👥 Dosen pembimbing assigned for ${mahasiswa.name}`);

    sendSuccess(res, 200, 'Dosen pembimbing berhasil di-assign', mahasiswa.toPublicJSON());
});

/**
 * @desc    Get mahasiswa bimbingan (for dosen or admin viewing dosen)
 * @route   GET /api/users/mahasiswa-bimbingan
 * @access  Dosen, Admin
 */
const getMahasiswaBimbingan = asyncHandler(async (req, res) => {
    // If admin and dosenId provided, use that. Otherwise use current user's ID
    let dosenId;
    if (req.user.role === 'admin' && req.query.dosenId) {
        // Convert string to ObjectId for proper comparison
        dosenId = new mongoose.Types.ObjectId(req.query.dosenId);
    } else {
        dosenId = req.user._id;
    }

    const mahasiswa = await User.findMahasiswaByDosen(dosenId);

    sendSuccess(res, 200, 'Data mahasiswa bimbingan berhasil diambil', mahasiswa);
});

/**
 * @desc    Get all dosen (for dropdown selection)
 * @route   GET /api/users/dosen
 * @access  Admin
 */
const getAllDosen = asyncHandler(async (req, res) => {
    // Return ALL dosen (including nonaktif) for dropdown selection
    const dosen = await User.find({ role: 'dosen' })
        .select('name nim_nip email status')
        .sort({ status: 1, name: 1 }); // Sort: aktif first, then by name

    sendSuccess(res, 200, 'Data dosen berhasil diambil', dosen);
});

/**
 * @desc    Get statistics (for admin dashboard)
 * @route   GET /api/users/statistics
 * @access  Admin
 */
const getStatistics = asyncHandler(async (req, res) => {
    const [totalMahasiswa, totalDosen, totalAktif, totalNonaktif] = await Promise.all([
        User.countDocuments({ role: 'mahasiswa' }),
        User.countDocuments({ role: 'dosen' }),
        User.countDocuments({ status: 'aktif' }),
        User.countDocuments({ status: 'nonaktif' })
    ]);

    sendSuccess(res, 200, 'Statistik user berhasil diambil', {
        totalMahasiswa,
        totalDosen,
        totalAktif,
        totalNonaktif,
        total: totalMahasiswa + totalDosen
    });
});

/**
 * @desc    Upload avatar for current user
 * @route   POST /api/users/upload-avatar
 * @access  Private (all authenticated users)
 */
const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw ApiError.badRequest('File gambar wajib diupload');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw ApiError.notFound('User tidak ditemukan');
    }

    // Save avatar path
    user.avatar = req.file.path;
    await user.save();

    console.log(`📸 Avatar uploaded for ${user.name}`);

    sendSuccess(res, 200, 'Avatar berhasil diupload', { avatar: user.avatar });
});

/**
 * @desc    Update own profile
 * @route   PUT /api/users/profile
 * @access  Private (all authenticated users)
 */
const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { name, email, whatsapp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        throw ApiError.notFound('User tidak ditemukan');
    }

    // Update allowed fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (whatsapp !== undefined) user.whatsapp = whatsapp;

    await user.save();

    console.log(`✏️ Profile updated for ${user.name}`);

    sendSuccess(res, 200, 'Profile berhasil diupdate', user.toPublicJSON());
});

/**
 * @desc    Reset user password (Admin only)
 * @route   PUT /api/users/:id/reset-password
 * @access  Admin
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        throw ApiError.badRequest('Password baru minimal 6 karakter');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        throw ApiError.notFound('User tidak ditemukan');
    }

    // Update password and plainPassword
    user.password = newPassword;
    user.plainPassword = newPassword;
    await user.save();

    console.log(`🔑 Password reset for ${user.name} by Admin ${req.user.name}`);

    sendSuccess(res, 200, 'Password berhasil direset', { name: user.name, nim_nip: user.nim_nip });
});

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    hardDelete,
    assignDospem,
    getMahasiswaBimbingan,
    getAllDosen,
    getStatistics,
    uploadAvatar,
    updateProfile,
    resetPassword
};
