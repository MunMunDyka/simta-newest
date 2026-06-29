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
const Bimbingan = require('../models/Bimbingan');
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
    const { page = 1, limit = 10, role, status, search, statusMahasiswa, statusVerifikasi } = req.query;

    // Build query
    const query = {};

    if (role) {
        query.role = role;
    }

    if (status) {
        query.status = status;
    }

    if (statusMahasiswa) {
        query.statusMahasiswa = statusMahasiswa;
    }

    if (statusVerifikasi) {
        query['dokumenWisuda.statusVerifikasi'] = statusVerifikasi;
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
            .populate('dospem_1 dospem_2 penguji_1 penguji_2', 'name nim_nip')
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
        .populate('dospem_1 dospem_2 penguji_1 penguji_2', 'name nim_nip email');

    if (req.user.role === 'admin' || req.user.canAccessAdmin) {
        query = query.select('+plainPassword');
    } else {
        query = query.select('-password');
    }

    const user = await query;

    if (!user) {
        throw ApiError.notFound(`User dengan ID '${req.params.id}' tidak ditemukan`);
    }

    // Check authorization (admin can view anyone, others can only view themselves)
    if (req.user.role !== 'admin' && !req.user.canAccessAdmin && req.user._id.toString() !== user._id.toString()) {
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
    const { nim_nip, password, name, email, role, prodi, semester, status, judulTA, canAccessAdmin } = req.body;

    // Only Master Admin (admin001) can grant admin access
    if (canAccessAdmin === true && req.user.nim_nip !== 'admin001') {
        throw ApiError.forbidden('Hanya Master Admin (admin001) yang dapat memberikan akses admin');
    }

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
        canAccessAdmin: role === 'dosen' ? (canAccessAdmin || false) : false,
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

    // Only Master Admin (admin001) can modify admin access
    if (req.body.canAccessAdmin !== undefined && req.body.canAccessAdmin !== user.canAccessAdmin) {
        if (req.user.nim_nip !== 'admin001') {
            throw ApiError.forbidden('Hanya Master Admin (admin001) yang dapat memberikan atau mencabut akses admin');
        }
    }

    const isAdmin = req.user.role === 'admin' || req.user.canAccessAdmin === true;
    const isSelf = req.user._id.toString() === user._id.toString();

    if (!isAdmin && !isSelf) {
        throw ApiError.forbidden('Anda hanya dapat mengupdate data diri sendiri');
    }

    // Determine allowed fields based on role
    let allowedFields;

    if (isAdmin) {
        // Admin can update all fields except password (use change-password)
        allowedFields = ['name', 'email', 'prodi', 'semester', 'judulTA', 'currentProgress', 'statusMahasiswa', 'penguji_1', 'penguji_2', 'status', 'avatar', 'whatsapp', 'canAccessAdmin'];
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
    const { dospem_1, dospem_2, penguji_1, penguji_2 } = req.body;

    const mahasiswa = await User.findById(req.params.id);

    if (!mahasiswa) {
        throw ApiError.notFound('Mahasiswa tidak ditemukan');
    }

    if (mahasiswa.role !== 'mahasiswa') {
        throw ApiError.badRequest('Hanya mahasiswa yang dapat di-assign dosen');
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

    // Validate penguji_1 if provided
    if (penguji_1) {
        const penguji1 = await User.findById(penguji_1);
        if (!penguji1 || penguji1.role !== 'dosen') {
            throw ApiError.badRequest('Dosen penguji 1 tidak valid atau bukan dosen');
        }
        mahasiswa.penguji_1 = penguji_1;
    } else if (penguji_1 === null) {
        mahasiswa.penguji_1 = null;
    }

    // Validate penguji_2 if provided
    if (penguji_2) {
        const penguji2 = await User.findById(penguji_2);
        if (!penguji2 || penguji2.role !== 'dosen') {
            throw ApiError.badRequest('Dosen penguji 2 tidak valid atau bukan dosen');
        }
        mahasiswa.penguji_2 = penguji_2;
    } else if (penguji_2 === null) {
        mahasiswa.penguji_2 = null;
    }

    // Check if dospem_1 and dospem_2 are the same
    if (mahasiswa.dospem_1 && mahasiswa.dospem_2 &&
        mahasiswa.dospem_1.toString() === mahasiswa.dospem_2.toString()) {
        throw ApiError.badRequest('Dosen pembimbing 1 dan 2 tidak boleh sama');
    }

    // Check if penguji_1 and penguji_2 are the same
    if (mahasiswa.penguji_1 && mahasiswa.penguji_2 &&
        mahasiswa.penguji_1.toString() === mahasiswa.penguji_2.toString()) {
        throw ApiError.badRequest('Dosen penguji 1 dan 2 tidak boleh sama');
    }

    // Ensure dospem is not assigned as penguji
    const dospemIds = [mahasiswa.dospem_1?.toString(), mahasiswa.dospem_2?.toString()].filter(Boolean);
    const pengujiIds = [mahasiswa.penguji_1?.toString(), mahasiswa.penguji_2?.toString()].filter(Boolean);
    
    pengujiIds.forEach(pId => {
        if (dospemIds.includes(pId)) {
            throw ApiError.badRequest('Dosen Pembimbing tidak boleh ditugaskan sebagai Dosen Penguji');
        }
    });

    await mahasiswa.save();
    await mahasiswa.populate('dospem_1 dospem_2 penguji_1 penguji_2', 'name nim_nip');

    console.log(`👥 Dosen pembimbing and penguji assigned for ${mahasiswa.name}`);

    sendSuccess(res, 200, 'Plotting dosen berhasil diupdate', mahasiswa.toPublicJSON());
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

    // Filter: 'pembimbing', 'penguji', or 'semua' (default: 'semua')
    const filterRole = req.query.filterRole || 'semua';
    console.log(`🔍 getMahasiswaBimbingan: Dosen ID: ${dosenId}, Filter Role: ${filterRole}`);

    const mahasiswa = await User.findMahasiswaByDosen(dosenId, filterRole);
    const mahasiswaIds = mahasiswa.map((item) => item._id);

    const bimbinganList = await Bimbingan.find({
        mahasiswa: { $in: mahasiswaIds },
        dosen: dosenId
    })
        .select('mahasiswa status version judul feedback feedbackDate createdAt updatedAt')
        .sort({ createdAt: -1 });

    const bimbinganSummary = new Map();

    bimbinganList.forEach((bimbingan) => {
        const mahasiswaId = bimbingan.mahasiswa.toString();
        const existing = bimbinganSummary.get(mahasiswaId);
        const isDosenAction = bimbingan.status !== 'menunggu' && Boolean(bimbingan.feedbackDate);

        if (!existing) {
            bimbinganSummary.set(mahasiswaId, {
                lastBimbinganStatus: bimbingan.status,
                lastBimbinganVersion: bimbingan.version,
                lastBimbinganJudul: bimbingan.judul,
                lastBimbinganAt: bimbingan.createdAt,
                lastFeedbackAt: bimbingan.feedbackDate,
                pendingReviewCount: bimbingan.status === 'menunggu' ? 1 : 0,
                lastActionStatus: isDosenAction ? bimbingan.status : null,
                lastActionVersion: isDosenAction ? bimbingan.version : null,
                lastActionJudul: isDosenAction ? bimbingan.judul : null,
                lastActionAt: isDosenAction ? bimbingan.feedbackDate : null
            });
            return;
        }

        if (bimbingan.status === 'menunggu') {
            existing.pendingReviewCount += 1;
        }

        if (isDosenAction && (!existing.lastActionAt || bimbingan.feedbackDate > existing.lastActionAt)) {
            existing.lastActionStatus = bimbingan.status;
            existing.lastActionVersion = bimbingan.version;
            existing.lastActionJudul = bimbingan.judul;
            existing.lastActionAt = bimbingan.feedbackDate;
        }
    });

    const mahasiswaWithStatus = mahasiswa.map((item) => {
        const data = item.toObject();
        const summary = bimbinganSummary.get(item._id.toString());
        const pendingReviewCount = summary?.pendingReviewCount || 0;

        // Determine dosenRelation: pembimbing or penguji
        const dosenIdStr = dosenId.toString();
        let dosenRelation = 'pembimbing';
        if (
            (data.penguji_1 && data.penguji_1._id?.toString() === dosenIdStr) ||
            (data.penguji_2 && data.penguji_2._id?.toString() === dosenIdStr)
        ) {
            // Check if also pembimbing
            const isPembimbing = (data.dospem_1 && data.dospem_1._id?.toString() === dosenIdStr) ||
                                  (data.dospem_2 && data.dospem_2._id?.toString() === dosenIdStr);
            dosenRelation = isPembimbing ? 'pembimbing' : 'penguji';
        }

        return {
            ...data,
            dosenRelation,
            lastBimbinganStatus: summary?.lastBimbinganStatus || null,
            lastBimbinganVersion: summary?.lastBimbinganVersion || null,
            lastBimbinganJudul: summary?.lastBimbinganJudul || null,
            lastBimbinganAt: summary?.lastBimbinganAt || null,
            lastFeedbackAt: summary?.lastFeedbackAt || null,
            lastActionStatus: summary?.lastActionStatus || null,
            lastActionVersion: summary?.lastActionVersion || null,
            lastActionJudul: summary?.lastActionJudul || null,
            lastActionAt: summary?.lastActionAt || null,
            pendingReviewCount,
            reviewStatus: pendingReviewCount > 0
                ? 'menunggu_review'
                : summary
                    ? 'sudah_direview'
                    : 'belum_ada'
        };
    });

    // Sort: pending review first, then recent activity/bimbingan date desc, then alphabetical
    mahasiswaWithStatus.sort((a, b) => {
        if (a.pendingReviewCount !== b.pendingReviewCount) {
            return b.pendingReviewCount - a.pendingReviewCount;
        }
        const dateA = a.lastBimbinganAt ? new Date(a.lastBimbinganAt).getTime() : 0;
        const dateB = b.lastBimbinganAt ? new Date(b.lastBimbinganAt).getTime() : 0;
        if (dateA !== dateB) {
            return dateB - dateA;
        }
        return a.name.localeCompare(b.name);
    });

    sendSuccess(res, 200, 'Data mahasiswa bimbingan berhasil diambil', mahasiswaWithStatus);
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
    user.avatar = 'uploads/avatars/' + req.file.filename;
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

/**
 * @desc    Get workload statistics for all dosen
 * @route   GET /api/users/dosen-workloads
 * @access  Admin
 */
const getDosenWorkloads = asyncHandler(async (req, res) => {
    const lecturers = await User.find({ role: 'dosen' })
        .select('name nim_nip prodi status avatar whatsapp email')
        .lean();
    
    // Fetch active student user assignments
    const students = await User.find({ role: 'mahasiswa', status: 'aktif' })
        .select('dospem_1 dospem_2 penguji_1 penguji_2')
        .lean();
        
    const lecturersWithWorkloads = lecturers.map(dosen => {
        const dosenIdStr = dosen._id.toString();
        let pembimbing1Count = 0;
        let pembimbing2Count = 0;
        let penguji1Count = 0;
        let penguji2Count = 0;
        
        students.forEach(student => {
            if (student.dospem_1?.toString() === dosenIdStr) pembimbing1Count++;
            if (student.dospem_2?.toString() === dosenIdStr) pembimbing2Count++;
            if (student.penguji_1?.toString() === dosenIdStr) penguji1Count++;
            if (student.penguji_2?.toString() === dosenIdStr) penguji2Count++;
        });
        
        return {
            ...dosen,
            workload: {
                pembimbing1: pembimbing1Count,
                pembimbing2: pembimbing2Count,
                penguji1: penguji1Count,
                penguji2: penguji2Count,
                totalPembimbing: pembimbing1Count + pembimbing2Count,
                totalPenguji: penguji1Count + penguji2Count,
                total: pembimbing1Count + pembimbing2Count + penguji1Count + penguji2Count
            }
        };
    });
    
    sendSuccess(res, 200, 'Workload dosen berhasil diambil', lecturersWithWorkloads);
});

/**
 * @desc    Upload graduation documents for mahasiswa
 * @route   POST /api/users/upload-wisuda
 * @access  Private (Mahasiswa only)
 */
const uploadWisuda = asyncHandler(async (req, res) => {
    const student = await User.findById(req.user._id);
    if (!student) {
        throw ApiError.notFound('Mahasiswa tidak ditemukan');
    }
    if (student.statusMahasiswa !== 'persiapan_wisuda') {
        throw ApiError.badRequest('Anda tidak berada dalam tahap persiapan wisuda');
    }
    if (student.dokumenWisuda && student.dokumenWisuda.statusVerifikasi === 'disetujui') {
        throw ApiError.badRequest('Dokumen wisuda Anda telah disetujui, tidak dapat diunggah ulang');
    }

    const fields = ['skripsiFull', 'pptSkripsi', 'halamanPengesahan', 'formBimbingan'];
    let hasUpdated = false;

    fields.forEach(field => {
        if (req.files && req.files[field] && req.files[field][0]) {
            const file = req.files[field][0];
            student.dokumenWisuda[field] = {
                fileName: file.filename,
                filePath: 'uploads/wisuda/' + file.filename,
                fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                fileOriginalName: file.originalname,
                uploadedAt: new Date()
            };
            hasUpdated = true;
        }
    });

    if (!hasUpdated) {
        throw ApiError.badRequest('Tidak ada berkas yang diunggah');
    }

    // Check if all 4 files are now uploaded
    const doc = student.dokumenWisuda;
    if (doc.skripsiFull.fileName && doc.pptSkripsi.fileName && doc.halamanPengesahan.fileName && doc.formBimbingan.fileName) {
        doc.statusVerifikasi = 'menunggu_verifikasi';
    } else {
        doc.statusVerifikasi = 'belum_upload';
    }

    await student.save();
    console.log(`🎓 Wisuda documents uploaded for ${student.name}`);
    sendSuccess(res, 200, 'Dokumen wisuda berhasil diunggah', student.toPublicJSON());
});

/**
 * @desc    Verify graduation documents for admin
 * @route   PUT /api/users/:id/verifikasi-wisuda
 * @access  Private (Admin only)
 */
const verifikasiWisuda = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { statusVerifikasi, catatanAdmin } = req.body;

    if (!['disetujui', 'ditolak'].includes(statusVerifikasi)) {
        throw ApiError.badRequest('Status verifikasi harus: disetujui atau ditolak');
    }

    const student = await User.findById(id);
    if (!student || student.role !== 'mahasiswa') {
        throw ApiError.notFound('Mahasiswa tidak ditemukan');
    }

    if (student.statusMahasiswa !== 'persiapan_wisuda') {
        throw ApiError.badRequest('Mahasiswa tidak berada dalam tahap persiapan wisuda');
    }

    student.dokumenWisuda.statusVerifikasi = statusVerifikasi;
    student.dokumenWisuda.catatanAdmin = catatanAdmin || null;
    student.dokumenWisuda.verifiedAt = new Date();

    if (statusVerifikasi === 'disetujui') {
        student.statusMahasiswa = 'selesai';
        student.currentProgress = 'Selesai';
    }

    await student.save();
    console.log(`🎓 Wisuda documents verified for ${student.name}: ${statusVerifikasi}`);
    sendSuccess(res, 200, `Dokumen wisuda berhasil ${statusVerifikasi === 'disetujui' ? 'disetujui' : 'ditolak'}`, student.toPublicJSON());
});

/**
 * @desc    Download wisuda document file
 * @route   GET /api/users/wisuda-download/:fileName
 * @access  Private
 */
const downloadWisudaFile = asyncHandler(async (req, res) => {
    const { fileName } = req.params;
    const safeFileName = path.basename(fileName);
    const filePath = path.resolve(__dirname, '..', 'uploads', 'wisuda', safeFileName);
    const fs = require('fs');

    if (!fs.existsSync(filePath)) {
        throw ApiError.notFound('File dokumen wisuda tidak ditemukan');
    }

    // Authorization check
    if (req.user.role === 'mahasiswa') {
        const expectedPrefix = `wisuda_${req.user._id}_`;
        if (!safeFileName.startsWith(expectedPrefix)) {
            throw ApiError.forbidden('Anda tidak memiliki akses untuk mendownload file ini');
        }
    }

    res.download(filePath, safeFileName);
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
    resetPassword,
    getDosenWorkloads,
    uploadWisuda,
    verifikasiWisuda,
    downloadWisudaFile
};
