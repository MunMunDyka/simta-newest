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

const MIN_BIMBINGAN_SEMPRO = 5;

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

    if (status === 'acc_sempro') {
        const totalBimbinganDospem = await Bimbingan.countDocuments({
            mahasiswa: bimbingan.mahasiswa,
            dosenType: bimbingan.dosenType
        });

        if (totalBimbinganDospem < MIN_BIMBINGAN_SEMPRO) {
            throw ApiError.badRequest(
                `ACC Maju Sempro hanya dapat diberikan setelah minimal ${MIN_BIMBINGAN_SEMPRO} kali bimbingan dengan dosen pembimbing ini.`
            );
        }
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
        const statusText = status === 'acc'
            ? 'ACC'
            : status === 'revisi'
                ? 'Revisi'
                : status === 'acc_sempro'
                    ? 'ACC Maju Sempro'
                    : 'Lanjut Bab';
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

/**
 * @desc    Get sempro readiness status for mahasiswa
 * @route   GET /api/bimbingan/sempro-status/:mahasiswaId
 * @access  Private (mahasiswa can only check own, admin/dosen can check all)
 * 
 * Requirements for Sempro (SI prodi):
 * - Minimum 5 bimbingan from dospem_1 and dospem_2
 * - Each dospem must give final acc_sempro approval
 */
const getSemproStatus = asyncHandler(async (req, res) => {
    const { mahasiswaId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Authorization check
    if (userRole === 'mahasiswa' && userId.toString() !== mahasiswaId) {
        throw ApiError.forbidden('Anda hanya dapat melihat status Anda sendiri');
    }

    // Get mahasiswa data
    const mahasiswa = await User.findById(mahasiswaId);
    if (!mahasiswa || mahasiswa.role !== 'mahasiswa') {
        throw ApiError.notFound('Mahasiswa tidak ditemukan');
    }

    // Count total bimbingan (any status) per dospem
    const [totalDospem1, totalDospem2, accSemproDospem1, accSemproDospem2] = await Promise.all([
        Bimbingan.countDocuments({
            mahasiswa: mahasiswaId,
            dosenType: 'dospem_1'
        }),
        Bimbingan.countDocuments({
            mahasiswa: mahasiswaId,
            dosenType: 'dospem_2'
        }),
        Bimbingan.countDocuments({
            mahasiswa: mahasiswaId,
            dosenType: 'dospem_1',
            status: 'acc_sempro'
        }),
        Bimbingan.countDocuments({
            mahasiswa: mahasiswaId,
            dosenType: 'dospem_2',
            status: 'acc_sempro'
        })
    ]);

    const dospem1MeetsMinimum = totalDospem1 >= MIN_BIMBINGAN_SEMPRO;
    const dospem2MeetsMinimum = totalDospem2 >= MIN_BIMBINGAN_SEMPRO;
    const dospem1Approved = accSemproDospem1 > 0;
    const dospem2Approved = accSemproDospem2 > 0;

    // Check if ready for sempro
    const dospem1Ready = dospem1MeetsMinimum && dospem1Approved;
    const dospem2Ready = dospem2MeetsMinimum && dospem2Approved;
    const isReady = dospem1Ready && dospem2Ready;

    // Get dosen names
    await mahasiswa.populate('dospem_1 dospem_2', 'name nim_nip');

    const response = {
        isReady,
        minRequired: MIN_BIMBINGAN_SEMPRO,
        dospem1: {
            dosen: mahasiswa.dospem_1 ? {
                name: mahasiswa.dospem_1.name,
                nim_nip: mahasiswa.dospem_1.nim_nip
            } : null,
            accCount: accSemproDospem1,
            totalBimbingan: totalDospem1,
            required: MIN_BIMBINGAN_SEMPRO,
            needed: Math.max(0, MIN_BIMBINGAN_SEMPRO - totalDospem1),
            meetsMinimum: dospem1MeetsMinimum,
            approved: dospem1Approved,
            ready: dospem1Ready
        },
        dospem2: {
            dosen: mahasiswa.dospem_2 ? {
                name: mahasiswa.dospem_2.name,
                nim_nip: mahasiswa.dospem_2.nim_nip
            } : null,
            accCount: accSemproDospem2,
            totalBimbingan: totalDospem2,
            required: MIN_BIMBINGAN_SEMPRO,
            needed: Math.max(0, MIN_BIMBINGAN_SEMPRO - totalDospem2),
            meetsMinimum: dospem2MeetsMinimum,
            approved: dospem2Approved,
            ready: dospem2Ready
        },
        message: isReady
            ? 'Selamat! Anda sudah memenuhi syarat untuk mengajukan Seminar Proposal.'
            : `Syarat Sempro: minimal ${MIN_BIMBINGAN_SEMPRO} kali bimbingan dan ACC Maju Sempro dari masing-masing dosen pembimbing.`
    };

    sendSuccess(res, 200, 'Status kesiapan sempro', response);
});

/**
 * @desc    Generate Surat Persetujuan Sempro (DOCX)
 * @route   GET /api/bimbingan/generate-surat-sempro/:mahasiswaId
 * @access  Private (mahasiswa own, admin)
 */
const generateSuratSempro = asyncHandler(async (req, res) => {
    const { mahasiswaId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Authorization check
    if (userRole === 'mahasiswa' && userId.toString() !== mahasiswaId) {
        throw ApiError.forbidden('Anda hanya dapat mengunduh surat milik Anda sendiri');
    }

    // Get mahasiswa data with dosen pembimbing
    const mahasiswa = await User.findById(mahasiswaId).populate('dospem_1 dospem_2', 'name nim_nip');
    if (!mahasiswa || mahasiswa.role !== 'mahasiswa') {
        throw ApiError.notFound('Mahasiswa tidak ditemukan');
    }

    // Verify sempro requirements are met
    const [totalDospem1, totalDospem2, accSemproDospem1, accSemproDospem2] = await Promise.all([
        Bimbingan.countDocuments({
            mahasiswa: mahasiswaId,
            dosenType: 'dospem_1'
        }),
        Bimbingan.countDocuments({
            mahasiswa: mahasiswaId,
            dosenType: 'dospem_2'
        }),
        Bimbingan.countDocuments({
            mahasiswa: mahasiswaId,
            dosenType: 'dospem_1',
            status: 'acc_sempro'
        }),
        Bimbingan.countDocuments({
            mahasiswa: mahasiswaId,
            dosenType: 'dospem_2',
            status: 'acc_sempro'
        })
    ]);

    const isReady = totalDospem1 >= MIN_BIMBINGAN_SEMPRO
        && totalDospem2 >= MIN_BIMBINGAN_SEMPRO
        && accSemproDospem1 > 0
        && accSemproDospem2 > 0;

    if (!isReady) {
        throw ApiError.badRequest(
            'Anda belum memenuhi syarat untuk mengunduh surat persetujuan sempro. ' +
            `Dibutuhkan minimal ${MIN_BIMBINGAN_SEMPRO} kali bimbingan dan ACC Maju Sempro dari masing-masing dosen pembimbing.`
        );
    }

    // Import document service
    const { generateSuratPersetujuanSempro } = require('../services/documentService');

    // Generate DOCX
    const buffer = await generateSuratPersetujuanSempro({
        mahasiswa: {
            name: mahasiswa.name,
            nim_nip: mahasiswa.nim_nip,
            prodi: mahasiswa.prodi,
            judulTA: mahasiswa.judulTA
        },
        dospem1: mahasiswa.dospem_1 ? {
            name: mahasiswa.dospem_1.name,
            nim_nip: mahasiswa.dospem_1.nim_nip
        } : null,
        dospem2: mahasiswa.dospem_2 ? {
            name: mahasiswa.dospem_2.name,
            nim_nip: mahasiswa.dospem_2.nim_nip
        } : null
    });

    // Set response headers for file download
    const fileName = `Surat_Persetujuan_Sempro_${mahasiswa.nim_nip}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length);

    console.log(`📄 Surat Sempro generated: ${mahasiswa.name} (${mahasiswa.nim_nip})`);

    // Send buffer
    res.send(buffer);
});

/**
 * @desc    Get admin bimbingan summary for a mahasiswa
 * @route   GET /api/bimbingan/admin/mahasiswa/:mahasiswaId
 * @access  Admin
 */
const getAdminBimbinganSummary = asyncHandler(async (req, res) => {
    const { mahasiswaId } = req.params;

    // Get mahasiswa data
    const mahasiswa = await User.findById(mahasiswaId)
        .populate('dospem_1', 'name nim_nip')
        .populate('dospem_2', 'name nim_nip');

    if (!mahasiswa || mahasiswa.role !== 'mahasiswa') {
        throw ApiError.notFound('Mahasiswa tidak ditemukan');
    }

    // Get all bimbingan for this mahasiswa
    const allBimbingan = await Bimbingan.find({ mahasiswa: mahasiswaId })
        .populate('dosen', 'name nim_nip')
        .sort({ createdAt: -1 });

    // Separate by dosenType
    const bimbinganDospem1 = allBimbingan.filter(b => b.dosenType === 'dospem_1');
    const bimbinganDospem2 = allBimbingan.filter(b => b.dosenType === 'dospem_2');

    // Count by status
    const countByStatus = (list) => ({
        total: list.length,
        menunggu: list.filter(b => b.status === 'menunggu').length,
        revisi: list.filter(b => b.status === 'revisi').length,
        acc: list.filter(b => b.status === 'acc').length,
        lanjut_bab: list.filter(b => b.status === 'lanjut_bab').length,
        acc_sempro: list.filter(b => b.status === 'acc_sempro').length,
    });

    const response = {
        mahasiswa: {
            _id: mahasiswa._id,
            name: mahasiswa.name,
            nim_nip: mahasiswa.nim_nip,
            prodi: mahasiswa.prodi,
            judulTA: mahasiswa.judulTA,
            currentProgress: mahasiswa.currentProgress,
            dospem_1: mahasiswa.dospem_1,
            dospem_2: mahasiswa.dospem_2,
        },
        dospem1: {
            stats: countByStatus(bimbinganDospem1),
            bimbingan: bimbinganDospem1,
        },
        dospem2: {
            stats: countByStatus(bimbinganDospem2),
            bimbingan: bimbinganDospem2,
        },
    };

    sendSuccess(res, 200, 'Data bimbingan mahasiswa berhasil diambil', response);
});

/**
 * @desc    Clear bimbingan history (hard delete)
 * @route   DELETE /api/bimbingan/admin/clear/:mahasiswaId
 * @access  Admin
 * @query   dosenType - dospem_1 | dospem_2 | all
 * @query   resetProgress - true | false (optional, default false)
 */
const clearBimbinganHistory = asyncHandler(async (req, res) => {
    const { mahasiswaId } = req.params;
    const { dosenType, resetProgress } = req.query;

    // Get mahasiswa data
    const mahasiswa = await User.findById(mahasiswaId);
    if (!mahasiswa || mahasiswa.role !== 'mahasiswa') {
        throw ApiError.notFound('Mahasiswa tidak ditemukan');
    }

    // Build query based on dosenType
    let query = { mahasiswa: mahasiswaId };
    if (dosenType !== 'all') {
        query.dosenType = dosenType;
    }

    // Find all bimbingan to delete (need IDs for replies and file paths)
    const bimbinganToDelete = await Bimbingan.find(query);

    if (bimbinganToDelete.length === 0) {
        throw ApiError.badRequest('Tidak ada data bimbingan yang ditemukan untuk dihapus');
    }

    const bimbinganIds = bimbinganToDelete.map(b => b._id);

    // 1. Delete all replies associated with these bimbingan
    const deletedReplies = await Reply.deleteMany({ bimbingan: { $in: bimbinganIds } });

    // 2. Delete physical files (PDF uploads)
    let filesDeleted = 0;
    for (const bimbingan of bimbinganToDelete) {
        // Delete submission file
        if (bimbingan.filePath) {
            const filePath = path.resolve(bimbingan.filePath);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    filesDeleted++;
                } catch (err) {
                    console.error(`⚠️ Failed to delete file: ${filePath}`, err.message);
                }
            }
        }
        // Delete feedback file if exists
        if (bimbingan.feedbackFile) {
            const feedbackPath = path.resolve(bimbingan.feedbackFile);
            if (fs.existsSync(feedbackPath)) {
                try {
                    fs.unlinkSync(feedbackPath);
                    filesDeleted++;
                } catch (err) {
                    console.error(`⚠️ Failed to delete feedback file: ${feedbackPath}`, err.message);
                }
            }
        }
    }

    // 3. Delete bimbingan records from database
    const deletedBimbingan = await Bimbingan.deleteMany({ _id: { $in: bimbinganIds } });

    // 4. Optionally reset mahasiswa progress
    let progressReset = false;
    if (resetProgress === 'true') {
        mahasiswa.currentProgress = 'BAB I';
        await mahasiswa.save();
        progressReset = true;
    }

    const scopeLabel = dosenType === 'all' ? 'semua dospem' : dosenType === 'dospem_1' ? 'Dospem 1' : 'Dospem 2';
    console.log(`🗑️ Bimbingan cleared: ${mahasiswa.name} (${scopeLabel}) - ${deletedBimbingan.deletedCount} bimbingan, ${deletedReplies.deletedCount} replies, ${filesDeleted} files`);

    sendSuccess(res, 200, `Riwayat bimbingan berhasil dihapus (${scopeLabel})`, {
        deletedBimbingan: deletedBimbingan.deletedCount,
        deletedReplies: deletedReplies.deletedCount,
        deletedFiles: filesDeleted,
        progressReset,
        scope: dosenType,
    });
});

/**
 * @desc    Get bimbingan progress report for all mahasiswa (Admin only)
 * @route   GET /api/bimbingan/admin/progress-report
 * @access  Admin
 */
const getProgressReport = asyncHandler(async (req, res) => {
    // Get all mahasiswa with their dospem info
    const mahasiswaList = await User.find({ role: 'mahasiswa', status: 'aktif' })
        .select('name nim_nip prodi judulTA currentProgress dospem_1 dospem_2')
        .populate('dospem_1', 'name nim_nip')
        .populate('dospem_2', 'name nim_nip')
        .sort({ name: 1 });

    // Aggregate bimbingan counts per mahasiswa per dosenType
    const bimbinganAgg = await Bimbingan.aggregate([
        {
            $group: {
                _id: { mahasiswa: '$mahasiswa', dosenType: '$dosenType' },
                total: { $sum: 1 },
                acc: { $sum: { $cond: [{ $eq: ['$status', 'acc'] }, 1, 0] } },
                acc_sempro: { $sum: { $cond: [{ $eq: ['$status', 'acc_sempro'] }, 1, 0] } },
                revisi: { $sum: { $cond: [{ $eq: ['$status', 'revisi'] }, 1, 0] } },
                menunggu: { $sum: { $cond: [{ $eq: ['$status', 'menunggu'] }, 1, 0] } },
                lanjut_bab: { $sum: { $cond: [{ $eq: ['$status', 'lanjut_bab'] }, 1, 0] } },
                lastActivity: { $max: '$createdAt' }
            }
        }
    ]);

    // Map aggregation to mahasiswa
    const report = mahasiswaList.map(mhs => {
        const dospem1Data = bimbinganAgg.find(
            a => a._id.mahasiswa.toString() === mhs._id.toString() && a._id.dosenType === 'dospem_1'
        );
        const dospem2Data = bimbinganAgg.find(
            a => a._id.mahasiswa.toString() === mhs._id.toString() && a._id.dosenType === 'dospem_2'
        );

        const d1Total = dospem1Data?.total || 0;
        const d2Total = dospem2Data?.total || 0;
        const d1Acc = dospem1Data?.acc || 0;
        const d2Acc = dospem2Data?.acc || 0;
        const d1AccSempro = dospem1Data?.acc_sempro || 0;
        const d2AccSempro = dospem2Data?.acc_sempro || 0;
        const d1MeetsMinimum = d1Total >= MIN_BIMBINGAN_SEMPRO;
        const d2MeetsMinimum = d2Total >= MIN_BIMBINGAN_SEMPRO;
        const d1IsSufficient = d1MeetsMinimum && d1AccSempro > 0;
        const d2IsSufficient = d2MeetsMinimum && d2AccSempro > 0;

        return {
            _id: mhs._id,
            name: mhs.name,
            nim_nip: mhs.nim_nip,
            prodi: mhs.prodi,
            judulTA: mhs.judulTA,
            currentProgress: mhs.currentProgress,
            dospem_1: mhs.dospem_1 ? { name: mhs.dospem_1.name, nim_nip: mhs.dospem_1.nim_nip } : null,
            dospem_2: mhs.dospem_2 ? { name: mhs.dospem_2.name, nim_nip: mhs.dospem_2.nim_nip } : null,
            dospem1: {
                total: d1Total,
                acc: d1Acc,
                revisi: dospem1Data?.revisi || 0,
                menunggu: dospem1Data?.menunggu || 0,
                lanjut_bab: dospem1Data?.lanjut_bab || 0,
                acc_sempro: d1AccSempro,
                lastActivity: dospem1Data?.lastActivity || null,
                meetsMinimum: d1MeetsMinimum,
                isSufficient: d1IsSufficient
            },
            dospem2: {
                total: d2Total,
                acc: d2Acc,
                revisi: dospem2Data?.revisi || 0,
                menunggu: dospem2Data?.menunggu || 0,
                lanjut_bab: dospem2Data?.lanjut_bab || 0,
                acc_sempro: d2AccSempro,
                lastActivity: dospem2Data?.lastActivity || null,
                meetsMinimum: d2MeetsMinimum,
                isSufficient: d2IsSufficient
            },
            totalBimbingan: d1Total + d2Total,
            totalAcc: d1Acc + d2Acc,
            isBothSufficient: d1IsSufficient && d2IsSufficient,
            isSemproReady: d1IsSufficient && d2IsSufficient,
            lastActivity: dospem1Data?.lastActivity > dospem2Data?.lastActivity
                ? dospem1Data?.lastActivity
                : dospem2Data?.lastActivity || dospem1Data?.lastActivity || null
        };
    });

    // Summary stats
    const summary = {
        totalMahasiswa: report.length,
        sufficientBoth: report.filter(r => r.isBothSufficient).length,
        sufficientOne: report.filter(r => (r.dospem1.isSufficient || r.dospem2.isSufficient) && !r.isBothSufficient).length,
        insufficientBoth: report.filter(r => !r.dospem1.isSufficient && !r.dospem2.isSufficient).length,
        minAccRequired: MIN_BIMBINGAN_SEMPRO
    };

    sendSuccess(res, 200, 'Progress report berhasil diambil', { summary, report });
});

module.exports = {
    getAll,
    getById,
    create,
    giveFeedback,
    addReply,
    downloadFile,
    getPendingCount,
    getSemproStatus,
    generateSuratSempro,
    getAdminBimbinganSummary,
    clearBimbinganHistory,
    getProgressReport
};
