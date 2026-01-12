/**
 * ===========================================
 * Bimbingan Controller - Bimbingan Management
 * ===========================================
 * Controller untuk manajemen bimbingan:
 * - Mahasiswa: Submit bimbingan, view history, reply
 * - Dosen: View submissions, give feedback, reply
 */

'use strict';

const path = require('path');
const fs = require('fs');
const Bimbingan = require('../models/Bimbingan');
const Reply = require('../models/Reply');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated, sendCreated } = require('../utils/responseHelper');
const { notifyDosenBimbinganBaru, notifyMahasiswaFeedback } = require('../services/whatsappService');

/**
 * @desc    Get all bimbingan (filtered by role)
 * @route   GET /api/bimbingan
 * @access  Private
 */
const getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, dosenType, mahasiswaId } = req.query;
    const userRole = req.user.role;
    const userId = req.user._id;

    let query = {};

    // Filter based on role
    if (userRole === 'mahasiswa') {
        // Mahasiswa can only see their own bimbingan
        query.mahasiswa = userId;
        if (dosenType) query.dosenType = dosenType;
    } else if (userRole === 'dosen') {
        // Dosen can only see bimbingan assigned to them
        query.dosen = userId;
        if (mahasiswaId) query.mahasiswa = mahasiswaId;
    } else if (userRole === 'admin') {
        // Admin can see all
        if (mahasiswaId) query.mahasiswa = mahasiswaId;
    }

    if (status) query.status = status;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bimbinganList, total] = await Promise.all([
        Bimbingan.find(query)
            .populate({
                path: 'mahasiswa',
                select: 'name nim_nip prodi currentProgress judulTA'
            })
            .populate('dosen', 'name nim_nip')
            .populate({
                path: 'replies',
                populate: { path: 'sender', select: 'name role' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Bimbingan.countDocuments(query)
    ]);

    sendPaginated(res, 'Data bimbingan berhasil diambil', bimbinganList, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

/**
 * @desc    Get bimbingan by ID
 * @route   GET /api/bimbingan/:id
 * @access  Private
 */
const getById = asyncHandler(async (req, res) => {
    const bimbingan = await Bimbingan.findById(req.params.id)
        .populate('mahasiswa', 'name nim_nip prodi currentProgress judulTA')
        .populate('dosen', 'name nim_nip email')
        .populate({
            path: 'replies',
            populate: { path: 'sender', select: 'name role' },
            options: { sort: { createdAt: 1 } }
        });

    if (!bimbingan) {
        throw ApiError.notFound('Bimbingan tidak ditemukan');
    }

    // Authorization check
    const userRole = req.user.role;
    const userId = req.user._id.toString();

    if (userRole === 'mahasiswa' && bimbingan.mahasiswa._id.toString() !== userId) {
        throw ApiError.forbidden('Anda hanya dapat melihat bimbingan milik Anda');
    }

    if (userRole === 'dosen' && bimbingan.dosen._id.toString() !== userId) {
        throw ApiError.forbidden('Anda hanya dapat melihat bimbingan yang ditujukan kepada Anda');
    }

    sendSuccess(res, 200, 'Data bimbingan berhasil diambil', bimbingan);
});

/**
 * @desc    Create new bimbingan (submit file)
 * @route   POST /api/bimbingan
 * @access  Mahasiswa
 */
const create = asyncHandler(async (req, res) => {
    const { judul, dosenType, catatan } = req.body;
    const mahasiswa = req.user;
    const file = req.file;

    // Validate file
    if (!file) {
        throw ApiError.badRequest('File dokumen wajib diunggah');
    }

    // Check file type (PDF only)
    if (!file.mimetype.includes('pdf')) {
        // Delete uploaded file
        fs.unlinkSync(file.path);
        throw ApiError.badRequest('Hanya file PDF yang diperbolehkan');
    }

    // Get dosen pembimbing
    let dosenId;
    if (dosenType === 'dospem_1') {
        dosenId = mahasiswa.dospem_1;
    } else if (dosenType === 'dospem_2') {
        dosenId = mahasiswa.dospem_2;
    }

    if (!dosenId) {
        fs.unlinkSync(file.path);
        throw ApiError.badRequest(
            `Dosen pembimbing ${dosenType === 'dospem_1' ? '1' : '2'} belum di-assign. ` +
            'Hubungi admin untuk menentukan dosen pembimbing Anda.'
        );
    }

    // Check if there's pending bimbingan for this dosen
    const hasPending = await Bimbingan.hasPendingBimbingan(mahasiswa._id, dosenType);
    if (hasPending) {
        fs.unlinkSync(file.path);
        throw ApiError.badRequest(
            'Anda masih memiliki bimbingan yang menunggu feedback dari dosen ini. ' +
            'Tunggu hingga dosen memberikan feedback sebelum mengirim yang baru.'
        );
    }

    // Get next version
    const version = await Bimbingan.getNextVersion(mahasiswa._id, dosenId);

    // Create bimbingan
    const bimbingan = await Bimbingan.create({
        mahasiswa: mahasiswa._id,
        dosen: dosenId,
        dosenType,
        version,
        judul,
        catatan,
        fileName: file.filename,
        filePath: file.path,
        fileSize: file.size.toString(),
        fileOriginalName: file.originalname,
        status: 'menunggu'
    });

    // Populate for response
    await bimbingan.populate('dosen', 'name nim_nip whatsapp');

    console.log(`📤 Bimbingan submitted: ${mahasiswa.name} -> ${bimbingan.dosen.name} (${version})`);

    // Send WhatsApp notification to dosen (non-blocking)
    if (bimbingan.dosen.whatsapp) {
        notifyDosenBimbinganBaru(bimbingan.dosen.whatsapp, mahasiswa.name, catatan)
            .then(result => {
                if (result.success) {
                    console.log(`📱 WhatsApp sent to dosen: ${bimbingan.dosen.name}`);
                } else {
                    console.log(`⚠️ WhatsApp not sent: ${result.reason || result.error}`);
                }
            })
            .catch(err => console.error('WhatsApp error:', err));
    } else {
        console.log(`⚠️ Dosen ${bimbingan.dosen.name} doesn't have WhatsApp number`);
    }

    sendCreated(res, 'Bimbingan berhasil dikirim. Menunggu feedback dari dosen.', bimbingan);
});

/**
 * @desc    Give feedback to bimbingan
 * @route   PUT /api/bimbingan/:id/feedback
 * @access  Dosen
 */
const giveFeedback = asyncHandler(async (req, res) => {
    const { status, feedback } = req.body;
    const dosenId = req.user._id;

    const bimbingan = await Bimbingan.findById(req.params.id);

    if (!bimbingan) {
        throw ApiError.notFound('Bimbingan tidak ditemukan');
    }

    // Check authorization
    if (bimbingan.dosen.toString() !== dosenId.toString()) {
        throw ApiError.forbidden('Anda tidak memiliki akses untuk memberikan feedback ini');
    }

    // Check if already reviewed
    if (bimbingan.status !== 'menunggu') {
        throw ApiError.badRequest(
            `Bimbingan ini sudah direviews dengan status '${bimbingan.status}'. ` +
            'Tidak dapat mengubah feedback yang sudah diberikan.'
        );
    }

    // Update bimbingan with feedback
    bimbingan.status = status;
    bimbingan.feedback = feedback;
    bimbingan.feedbackDate = new Date();

    // Handle feedback file if uploaded
    if (req.file) {
        bimbingan.feedbackFile = req.file.path;
        bimbingan.feedbackFileName = req.file.originalname;
    }

    await bimbingan.save();

    // Update mahasiswa progress if lanjut_bab
    if (status === 'lanjut_bab') {
        const mahasiswa = await User.findById(bimbingan.mahasiswa);
        if (mahasiswa) {
            const progressOrder = ['BAB I', 'BAB II', 'BAB III', 'BAB IV', 'BAB V', 'Selesai'];
            const currentIndex = progressOrder.indexOf(mahasiswa.currentProgress);
            if (currentIndex < progressOrder.length - 1) {
                mahasiswa.currentProgress = progressOrder[currentIndex + 1];
                await mahasiswa.save();
                console.log(`📈 Progress updated: ${mahasiswa.name} -> ${mahasiswa.currentProgress}`);
            }
        }
    }

    await bimbingan.populate('mahasiswa dosen', 'name nim_nip whatsapp');

    console.log(`💬 Feedback given: ${req.user.name} -> ${bimbingan.mahasiswa.name} (${status})`);

    // Send WhatsApp notification to mahasiswa (non-blocking)
    if (bimbingan.mahasiswa.whatsapp) {
        const statusText = status === 'acc' ? 'ACC' : status === 'revisi' ? 'Revisi' : 'Lanjut Bab';
        notifyMahasiswaFeedback(bimbingan.mahasiswa.whatsapp, req.user.name, statusText, feedback)
            .then(result => {
                if (result.success) {
                    console.log(`📱 WhatsApp sent to mahasiswa: ${bimbingan.mahasiswa.name}`);
                } else {
                    console.log(`⚠️ WhatsApp not sent: ${result.reason || result.error}`);
                }
            })
            .catch(err => console.error('WhatsApp error:', err));
    } else {
        console.log(`⚠️ Mahasiswa ${bimbingan.mahasiswa.name} doesn't have WhatsApp number`);
    }

    sendSuccess(res, 200, 'Feedback berhasil diberikan', bimbingan);
});

/**
 * @desc    Add reply to bimbingan
 * @route   POST /api/bimbingan/:id/reply
 * @access  Private (mahasiswa or dosen involved)
 */
const addReply = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const bimbingan = await Bimbingan.findById(req.params.id);

    if (!bimbingan) {
        throw ApiError.notFound('Bimbingan tidak ditemukan');
    }

    // Authorization check
    const isMahasiswa = bimbingan.mahasiswa.toString() === userId.toString();
    const isDosen = bimbingan.dosen.toString() === userId.toString();

    if (!isMahasiswa && !isDosen && userRole !== 'admin') {
        throw ApiError.forbidden('Anda tidak memiliki akses ke bimbingan ini');
    }

    // Create reply
    const reply = await Reply.create({
        bimbingan: bimbingan._id,
        sender: userId,
        senderRole: userRole === 'admin' ? 'dosen' : userRole,
        message
    });

    await reply.populate('sender', 'name role');

    console.log(`💬 Reply added: ${req.user.name} on bimbingan ${bimbingan.version}`);

    sendCreated(res, 'Balasan berhasil dikirim', reply);
});

/**
 * @desc    Download bimbingan file
 * @route   GET /api/bimbingan/download/:id
 * @access  Private
 */
const downloadFile = asyncHandler(async (req, res) => {
    const bimbingan = await Bimbingan.findById(req.params.id);

    if (!bimbingan) {
        throw ApiError.notFound('Bimbingan tidak ditemukan');
    }

    // Authorization check
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    const isMahasiswa = bimbingan.mahasiswa.toString() === userId;
    const isDosen = bimbingan.dosen.toString() === userId;

    if (!isMahasiswa && !isDosen && userRole !== 'admin') {
        throw ApiError.forbidden('Anda tidak memiliki akses untuk mendownload file ini');
    }

    // Check if file exists
    const filePath = path.resolve(bimbingan.filePath);

    if (!fs.existsSync(filePath)) {
        throw ApiError.notFound('File tidak ditemukan di server');
    }

    // Send file
    res.download(filePath, bimbingan.fileOriginalName || bimbingan.fileName);
});

/**
 * @desc    Get pending bimbingan count (for dosen dashboard)
 * @route   GET /api/bimbingan/pending-count
 * @access  Dosen
 */
const getPendingCount = asyncHandler(async (req, res) => {
    const dosenId = req.user._id;

    const count = await Bimbingan.countDocuments({
        dosen: dosenId,
        status: 'menunggu'
    });

    sendSuccess(res, 200, 'Jumlah bimbingan pending', { count });
});

module.exports = {
    getAll,
    getById,
    create,
    giveFeedback,
    addReply,
    downloadFile,
    getPendingCount
};
