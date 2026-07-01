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
const SystemSetting = require('../models/SystemSetting');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated, sendCreated } = require('../utils/responseHelper');
const { notifyDosenBimbinganBaruEmail, notifyMahasiswaFeedbackEmail } = require('../services/emailService');

const DEFAULT_MIN_BIMBINGAN_SEMPRO = parseInt(process.env.MIN_BIMBINGAN_SEMPRO, 10) || 5;
const MIN_BIMBINGAN_SETTING_PREFIX = 'min_bimbingan_sempro';
const PROGRESS_OPTIONS = ['BAB I', 'BAB II', 'BAB III', 'BAB IV', 'BAB V', 'BAB VI', 'Selesai'];

const getMinBimbinganSettingKey = (mahasiswaId) => `${MIN_BIMBINGAN_SETTING_PREFIX}:${mahasiswaId}`;

const getValidMinBimbingan = (value) => {
    const parsed = parseInt(value, 10);

    return Number.isInteger(parsed) && parsed >= 1 && parsed <= 20 ? parsed : DEFAULT_MIN_BIMBINGAN_SEMPRO;
};

const getMinBimbinganSetting = async (mahasiswaId) => {
    if (!mahasiswaId) return null;
    return SystemSetting.findOne({ key: getMinBimbinganSettingKey(mahasiswaId) }).lean();
};

const getMinBimbinganRequirementsFromSetting = (setting) => {
    const value = setting?.value;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return {
            dospem1: getValidMinBimbingan(value.dospem1 ?? value.dospem_1 ?? value.minBimbinganDospem1),
            dospem2: getValidMinBimbingan(value.dospem2 ?? value.dospem_2 ?? value.minBimbinganDospem2)
        };
    }

    const fallback = getValidMinBimbingan(value);
    return { dospem1: fallback, dospem2: fallback };
};

const getMinBimbinganRequirements = async (mahasiswaId) => {
    const setting = await getMinBimbinganSetting(mahasiswaId);
    return getMinBimbinganRequirementsFromSetting(setting);
};

const getMinBimbinganForDosenType = async (mahasiswaId, dosenType) => {
    const requirements = await getMinBimbinganRequirements(mahasiswaId);
    return dosenType === 'dospem_2' ? requirements.dospem2 : requirements.dospem1;
};

const normalizeMinBimbinganValue = (value) => {
    const parsed = parseInt(value, 10);

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 20) {
        throw ApiError.badRequest('Minimal bimbingan harus berupa angka 1 sampai 20');
    }

    return parsed;
};

const normalizeMinBimbinganPair = (body) => ({
    dospem1: normalizeMinBimbinganValue(body.minBimbinganDospem1 ?? body.dospem1 ?? body.minBimbinganSempro),
    dospem2: normalizeMinBimbinganValue(body.minBimbinganDospem2 ?? body.dospem2 ?? body.minBimbinganSempro)
});

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

    // ===== Status-based submission restrictions =====
    const mahasiswaFull = await User.findById(mahasiswa._id);
    const studentStatus = mahasiswaFull?.statusMahasiswa || 'pra_sempro';
    const REVISION_STATUSES = ['revisi_sempro', 'revisi_semhas', 'revisi_sidang'];
    const DOSPEM_STATUSES = ['pra_sempro', 'bimbingan_lanjut'];

    if (['bimbingan_akhir', 'menunggu_sidang', 'persiapan_wisuda', 'selesai'].includes(studentStatus)) {
        if (file) fs.unlinkSync(file.path);
        throw ApiError.badRequest(
            'Tahap bimbingan di SIMTA telah selesai. Proses Sidang Akhir dilanjutkan melalui akademik.'
        );
    }

    if (REVISION_STATUSES.includes(studentStatus)) {
        // During revision phases, student can ONLY submit to penguji
        if (dosenType === 'dospem_1' || dosenType === 'dospem_2') {
            if (file) fs.unlinkSync(file.path);
            throw ApiError.badRequest(
                'Bimbingan dengan Dosen Pembimbing dikunci sementara. ' +
                'Selesaikan revisi dengan Dosen Penguji terlebih dahulu.'
            );
        }
    } else if (DOSPEM_STATUSES.includes(studentStatus)) {
        // During normal guidance phases, student can ONLY submit to dospem
        if (dosenType === 'penguji_1' || dosenType === 'penguji_2') {
            if (file) fs.unlinkSync(file.path);
            throw ApiError.badRequest(
                'Bimbingan revisi penguji belum dibuka. ' +
                'Tahap bimbingan ini hanya aktif setelah pelaksanaan ujian.'
            );
        }
    }

    // Get dosen pembimbing
    let dosenId;
    if (dosenType === 'dospem_1') {
        dosenId = mahasiswaFull.dospem_1;
    } else if (dosenType === 'dospem_2') {
        dosenId = mahasiswaFull.dospem_2;
    } else if (dosenType === 'penguji_1') {
        dosenId = mahasiswaFull.penguji_1;
    } else if (dosenType === 'penguji_2') {
        dosenId = mahasiswaFull.penguji_2;
    }

    if (!dosenId) {
        fs.unlinkSync(file.path);
        const dosenLabel = dosenType.startsWith('penguji')
            ? `Dosen penguji ${dosenType === 'penguji_1' ? '1' : '2'}`
            : `Dosen pembimbing ${dosenType === 'dospem_1' ? '1' : '2'}`;
        throw ApiError.badRequest(
            `${dosenLabel} belum di-assign. Hubungi admin untuk menentukan dosen Anda.`
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

    // Determine kategoriBimbingan based on student status
    const kategoriBimbinganMap = {
        'revisi_sempro': 'revisi_sempro',
        'revisi_semhas': 'revisi_semhas',
        'revisi_sidang': 'revisi_sidang'
    };

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
        kategoriBimbingan: kategoriBimbinganMap[studentStatus] || 'bimbingan_dospem',
        status: 'menunggu'
    });

    // Populate for response
    await bimbingan.populate('dosen', 'name nim_nip email');

    console.log(`📤 Bimbingan submitted: ${mahasiswa.name} -> ${bimbingan.dosen.name} (${version})`);

    // Send email notification to dosen (non-blocking)
    if (bimbingan.dosen.email) {
        notifyDosenBimbinganBaruEmail(bimbingan.dosen.email, mahasiswa.name, judul, catatan)
            .then(result => {
                if (result.success) {
                    console.log(`Email sent to dosen: ${bimbingan.dosen.name}`);
                } else {
                    console.log(`Email not sent to dosen: ${result.reason || result.error}`);
                }
            })
            .catch(err => console.error('Email error:', err));
    } else {
        console.log(`Dosen ${bimbingan.dosen.name} doesn't have email address`);
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
        const minBimbinganSempro = await getMinBimbinganForDosenType(bimbingan.mahasiswa, bimbingan.dosenType);
        const totalBimbinganDospem = await Bimbingan.countDocuments({
            mahasiswa: bimbingan.mahasiswa,
            dosenType: bimbingan.dosenType
        });

        if (totalBimbinganDospem < minBimbinganSempro) {
            throw ApiError.badRequest(
                `ACC Maju Sempro hanya dapat diberikan setelah minimal ${minBimbinganSempro} kali bimbingan dengan dosen pembimbing ini.`
            );
        }
    }

    if (status === 'lanjut_bab') {
        const mahasiswa = await User.findById(bimbingan.mahasiswa);
        const blockedBeforeSempro = mahasiswa?.currentProgress === 'BAB III' &&
            (!mahasiswa.statusMahasiswa || ['pra_sempro', 'menunggu_sempro'].includes(mahasiswa.statusMahasiswa));
        const blockedBeforeSemhas = mahasiswa?.currentProgress === 'BAB V' &&
            ['bimbingan_lanjut', 'menunggu_semhas'].includes(mahasiswa.statusMahasiswa);

        if (blockedBeforeSempro) {
            throw ApiError.badRequest('Mahasiswa sudah berada di BAB III. Gunakan ACC Seminar Proposal jika syarat bimbingan sudah terpenuhi.');
        }

        if (blockedBeforeSemhas) {
            throw ApiError.badRequest('Mahasiswa sudah berada di BAB V. Gunakan ACC Seminar Hasil jika syarat bimbingan sudah terpenuhi.');
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
    } else if (bimbingan.draftFeedbackFile) {
        // Promote draft file if no new file is uploaded
        bimbingan.feedbackFile = bimbingan.draftFeedbackFile;
        bimbingan.feedbackFileName = bimbingan.draftFeedbackFileName;
    }

    // Reset draft fields
    bimbingan.draftFeedback = null;
    bimbingan.draftStatus = null;
    bimbingan.draftFeedbackFile = null;
    bimbingan.draftFeedbackFileName = null;
    bimbingan.hasDraft = false;

    await bimbingan.save();

    // Update mahasiswa progress if lanjut_bab
    if (status === 'lanjut_bab') {
        const mahasiswa = await User.findById(bimbingan.mahasiswa);
        if (mahasiswa) {
            const currentIndex = PROGRESS_OPTIONS.indexOf(mahasiswa.currentProgress);
            // Block BAB III -> BAB IV if student hasn't passed sempro
            if (mahasiswa.currentProgress === 'BAB III' &&
                (!mahasiswa.statusMahasiswa || mahasiswa.statusMahasiswa === 'pra_sempro' || mahasiswa.statusMahasiswa === 'menunggu_sempro')) {
                console.log(`⚠️ Progress blocked: ${mahasiswa.name} must pass Sempro before BAB IV`);
            } else if (currentIndex < PROGRESS_OPTIONS.length - 1) {
                mahasiswa.currentProgress = PROGRESS_OPTIONS[currentIndex + 1];
                await mahasiswa.save();
                console.log(`📈 Progress updated: ${mahasiswa.name} -> ${mahasiswa.currentProgress}`);
            }
        }
    }

    // ===== Examiner ACC Resolution Logic =====
    // When a penguji gives 'acc' on a revision bimbingan, check if BOTH penguji have given acc
    if (status === 'acc' && (bimbingan.dosenType === 'penguji_1' || bimbingan.dosenType === 'penguji_2')) {
        const mahasiswa = await User.findById(bimbingan.mahasiswa);
        if (mahasiswa && ['revisi_sempro', 'revisi_semhas', 'revisi_sidang'].includes(mahasiswa.statusMahasiswa)) {
            // Check if the OTHER penguji has also given acc
            const otherPengujiType = bimbingan.dosenType === 'penguji_1' ? 'penguji_2' : 'penguji_1';
            const otherPengujiAcc = await Bimbingan.findOne({
                mahasiswa: bimbingan.mahasiswa,
                dosenType: otherPengujiType,
                kategoriBimbingan: bimbingan.kategoriBimbingan,
                status: 'acc'
            });

            if (otherPengujiAcc) {
                // Both penguji have given ACC - transition student status
                const statusTransitions = {
                    'revisi_sempro': 'bimbingan_lanjut',
                    'revisi_semhas': 'bimbingan_akhir',
                    'revisi_sidang': 'persiapan_wisuda'
                };
                const nextStatus = statusTransitions[mahasiswa.statusMahasiswa];
                if (nextStatus) {
                    mahasiswa.statusMahasiswa = nextStatus;

                    // Automatically update progress bab
                    if (nextStatus === 'bimbingan_lanjut') {
                        mahasiswa.currentProgress = 'BAB IV';
                    } else if (nextStatus === 'bimbingan_akhir') {
                        mahasiswa.currentProgress = 'BAB VI';
                    } else if (nextStatus === 'persiapan_wisuda') {
                        mahasiswa.currentProgress = 'Selesai';
                    }

                    await mahasiswa.save();
                    console.log(`🎓 Status transitioned: ${mahasiswa.name} -> ${nextStatus} (both penguji ACC)`);
                }
            } else {
                console.log(`⏳ Waiting for ${otherPengujiType} ACC for ${mahasiswa.name}`);
            }
        }
    }

    // ===== Supervisor ACC Resolution Logic =====
    // When a dospem gives 'acc_sempro' on a bimbingan, check if BOTH dospem have given 'acc_sempro'
    if (status === 'acc_sempro' && (bimbingan.dosenType === 'dospem_1' || bimbingan.dosenType === 'dospem_2')) {
        const mahasiswa = await User.findById(bimbingan.mahasiswa);
        if (mahasiswa && ['pra_sempro', 'bimbingan_lanjut'].includes(mahasiswa.statusMahasiswa)) {
            // Find the latest bimbingan for the OTHER dospem
            const otherDospemType = bimbingan.dosenType === 'dospem_1' ? 'dospem_2' : 'dospem_1';
            const otherDospemLatest = await Bimbingan.findOne({
                mahasiswa: bimbingan.mahasiswa,
                dosenType: otherDospemType
            }).sort({ createdAt: -1 });

            if (otherDospemLatest && otherDospemLatest.status === 'acc_sempro') {
                let isValid = true;

                // For bimbingan_lanjut, check if the other dospem's ACC is after the proposal exam was completed
                if (mahasiswa.statusMahasiswa === 'bimbingan_lanjut') {
                    const Jadwal = require('../models/Jadwal');
                    const lastSempro = await Jadwal.findOne({
                        mahasiswa: bimbingan.mahasiswa,
                        jenisJadwal: 'sidang_proposal',
                        status: 'selesai'
                    }).sort({ updatedAt: -1 });

                    if (lastSempro && otherDospemLatest.createdAt <= lastSempro.updatedAt) {
                        isValid = false;
                    }
                }
                if (isValid) {
                    const statusTransitions = {
                        'pra_sempro': 'menunggu_sempro',
                        'bimbingan_lanjut': 'menunggu_semhas'
                    };
                    const nextStatus = statusTransitions[mahasiswa.statusMahasiswa];
                    if (nextStatus) {
                        mahasiswa.statusMahasiswa = nextStatus;
                        await mahasiswa.save();
                        console.log(`🎓 Status transitioned (Dospem ACC): ${mahasiswa.name} -> ${nextStatus}`);
                    }
                } else {
                    console.log(`⏳ The other dospem's (${otherDospemType}) ACC was from a previous phase for ${mahasiswa.name}`);
                }
            } else {
                console.log(`⏳ Waiting for ${otherDospemType} ACC Sempro/Sidang for ${mahasiswa.name}`);
            }
        }
    }

    await bimbingan.populate('mahasiswa dosen', 'name nim_nip email');

    console.log(`💬 Feedback given: ${req.user.name} -> ${bimbingan.mahasiswa.name} (${status})`);

    // Send email notification to mahasiswa (non-blocking)
    if (bimbingan.mahasiswa.email) {
        const statusText = status === 'acc'
            ? 'ACC'
            : status === 'revisi'
                ? 'Revisi'
                : status === 'acc_sempro'
                    ? 'ACC Maju Sidang'
                    : 'Lanjut BAB';
        notifyMahasiswaFeedbackEmail(bimbingan.mahasiswa.email, req.user.name, statusText, feedback)
            .then(result => {
                if (result.success) {
                    console.log(`Email sent to mahasiswa: ${bimbingan.mahasiswa.name}`);
                } else {
                    console.log(`Email not sent to mahasiswa: ${result.reason || result.error}`);
                }
            })
            .catch(err => console.error('Email error:', err));
    } else {
        console.log(`Mahasiswa ${bimbingan.mahasiswa.name} doesn't have email address`);
    }

    sendSuccess(res, 200, 'Feedback berhasil diberikan', bimbingan);
});

/**
 * @desc    Save feedback draft to bimbingan
 * @route   PUT /api/bimbingan/:id/draft-feedback
 * @access  Dosen
 */
const saveFeedbackDraft = asyncHandler(async (req, res) => {
    const { status, feedback } = req.body;
    const dosenId = req.user._id;

    const bimbingan = await Bimbingan.findById(req.params.id);

    if (!bimbingan) {
        throw ApiError.notFound('Bimbingan tidak ditemukan');
    }

    // Check authorization
    if (bimbingan.dosen.toString() !== dosenId.toString()) {
        throw ApiError.forbidden('Anda tidak memiliki akses untuk memberikan draft feedback ini');
    }

    // Check if already reviewed
    if (bimbingan.status !== 'menunggu') {
        throw ApiError.badRequest('Bimbingan ini sudah direview. Tidak dapat menyimpan draft.');
    }

    // Update draft fields
    bimbingan.draftFeedback = feedback || null;
    bimbingan.draftStatus = status || null;
    bimbingan.hasDraft = true;

    // Handle feedback file if uploaded
    if (req.file) {
        bimbingan.draftFeedbackFile = req.file.path;
        bimbingan.draftFeedbackFileName = req.file.originalname;
    }

    await bimbingan.save();

    console.log(`📝 Draft feedback saved: ${req.user.name} -> ${bimbingan.mahasiswa}`);

    sendSuccess(res, 200, 'Draft feedback berhasil disimpan', {
        draftFeedback: bimbingan.draftFeedback,
        draftStatus: bimbingan.draftStatus,
        draftFeedbackFileName: bimbingan.draftFeedbackFileName,
        hasDraft: bimbingan.hasDraft
    });
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
    const minRequirements = await getMinBimbinganRequirements(mahasiswaId);

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

    const dospem1MeetsMinimum = totalDospem1 >= minRequirements.dospem1;
    const dospem2MeetsMinimum = totalDospem2 >= minRequirements.dospem2;
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
        minRequired: Math.max(minRequirements.dospem1, minRequirements.dospem2),
        minRequiredByDospem: {
            dospem1: minRequirements.dospem1,
            dospem2: minRequirements.dospem2
        },
        dospem1: {
            dosen: mahasiswa.dospem_1 ? {
                name: mahasiswa.dospem_1.name,
                nim_nip: mahasiswa.dospem_1.nim_nip
            } : null,
            accCount: accSemproDospem1,
            totalBimbingan: totalDospem1,
            required: minRequirements.dospem1,
            needed: Math.max(0, minRequirements.dospem1 - totalDospem1),
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
            required: minRequirements.dospem2,
            needed: Math.max(0, minRequirements.dospem2 - totalDospem2),
            meetsMinimum: dospem2MeetsMinimum,
            approved: dospem2Approved,
            ready: dospem2Ready
        },
        message: isReady
            ? 'Selamat! Anda sudah memenuhi syarat untuk mengajukan Seminar Proposal.'
            : `Syarat Sempro: minimal ${minRequirements.dospem1} kali bimbingan Dospem 1, minimal ${minRequirements.dospem2} kali bimbingan Dospem 2, dan ACC Maju Sempro dari masing-masing dosen pembimbing.`
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
    const minRequirements = await getMinBimbinganRequirements(mahasiswaId);

    // Authorization check
    if (userRole === 'mahasiswa' && userId.toString() !== mahasiswaId) {
        throw ApiError.forbidden('Anda hanya dapat mengunduh surat milik Anda sendiri');
    }

    // Get mahasiswa data with dosen pembimbing
    const mahasiswa = await User.findById(mahasiswaId).populate('dospem_1 dospem_2', 'name nim_nip');
    if (!mahasiswa || mahasiswa.role !== 'mahasiswa') {
        throw ApiError.notFound('Mahasiswa tidak ditemukan');
    }

    // Restrict to students who haven't passed sempro yet
    const postSemproStatuses = ['revisi_sempro', 'bimbingan_lanjut', 'menunggu_semhas', 'revisi_semhas', 'bimbingan_akhir', 'menunggu_sidang', 'revisi_sidang', 'persiapan_wisuda', 'selesai'];
    if (postSemproStatuses.includes(mahasiswa.statusMahasiswa)) {
        throw ApiError.badRequest(
            'Surat persetujuan sempro tidak dapat diunduh karena mahasiswa sudah melewati tahap seminar proposal.'
        );
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

    const isReady = totalDospem1 >= minRequirements.dospem1
        && totalDospem2 >= minRequirements.dospem2
        && accSemproDospem1 > 0
        && accSemproDospem2 > 0;

    if (!isReady) {
        throw ApiError.badRequest(
            'Anda belum memenuhi syarat untuk mengunduh surat persetujuan sempro. ' +
            `Dibutuhkan minimal ${minRequirements.dospem1} kali bimbingan Dospem 1, minimal ${minRequirements.dospem2} kali bimbingan Dospem 2, dan ACC Maju Sempro dari masing-masing dosen pembimbing.`
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
        .populate('dospem_2', 'name nim_nip')
        .populate('penguji_1', 'name nim_nip')
        .populate('penguji_2', 'name nim_nip');

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
            penguji_1: mahasiswa.penguji_1,
            penguji_2: mahasiswa.penguji_2,
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
 * @query   resetProgressTo - BAB I | BAB II | BAB III | BAB IV | BAB V | Selesai (optional)
 */
const clearBimbinganHistory = asyncHandler(async (req, res) => {
    const { mahasiswaId } = req.params;
    const { dosenType, resetProgress, resetProgressTo } = req.query;

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
    let progressResetTo = null;
    if (resetProgress === 'true') {
        const targetProgress = resetProgressTo || 'BAB I';

        if (!PROGRESS_OPTIONS.includes(targetProgress)) {
            throw ApiError.badRequest('Target reset progress tidak valid');
        }

        mahasiswa.currentProgress = targetProgress;
        await mahasiswa.save();
        progressReset = true;
        progressResetTo = targetProgress;
    }

    const scopeLabel = dosenType === 'all' ? 'semua dospem' : dosenType === 'dospem_1' ? 'Dospem 1' : 'Dospem 2';
    console.log(`🗑️ Bimbingan cleared: ${mahasiswa.name} (${scopeLabel}) - ${deletedBimbingan.deletedCount} bimbingan, ${deletedReplies.deletedCount} replies, ${filesDeleted} files`);

    sendSuccess(res, 200, `Riwayat bimbingan berhasil dihapus (${scopeLabel})`, {
        deletedBimbingan: deletedBimbingan.deletedCount,
        deletedReplies: deletedReplies.deletedCount,
        deletedFiles: filesDeleted,
        progressReset,
        progressResetTo,
        currentProgress: mahasiswa.currentProgress,
        scope: dosenType,
    });
});

/**
 * @desc    Clear ALL bimbingan history globally (hard delete for all mahasiswas)
 * @route   DELETE /api/bimbingan/admin/clear-all-global
 * @access  Admin
 * @query   resetProgress - true | false (optional, default false)
 * @query   resetProgressTo - BAB I | BAB II | BAB III | BAB IV | BAB V | Selesai (optional)
 * @query   clearSettings - true | false (optional, default false)
 */
const clearAllBimbinganGlobal = asyncHandler(async (req, res) => {
    const { resetProgress, resetProgressTo, clearSettings } = req.query;

    // Find all bimbingan to delete (need paths to physically delete PDFs)
    const bimbinganToDelete = await Bimbingan.find({});

    // Delete physical files
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

    const bimbinganIds = bimbinganToDelete.map(b => b._id);

    // 1. Delete replies associated with these bimbingans
    const deletedReplies = await Reply.deleteMany({ bimbingan: { $in: bimbinganIds } });

    // 2. Delete all bimbingan records from database
    const deletedBimbingan = await Bimbingan.deleteMany({ _id: { $in: bimbinganIds } });

    // 3. Optionally reset all mahasiswa progress
    let progressReset = false;
    let progressResetTo = null;
    if (resetProgress === 'true') {
        const targetProgress = resetProgressTo || 'BAB I';

        if (!PROGRESS_OPTIONS.includes(targetProgress)) {
            throw ApiError.badRequest('Target reset progress tidak valid');
        }

        await User.updateMany({ role: 'mahasiswa' }, { $set: { currentProgress: targetProgress } });
        progressReset = true;
        progressResetTo = targetProgress;
    }

    // 4. Optionally clear custom settings
    let settingsClearedCount = 0;
    if (clearSettings === 'true') {
        const deletedSettings = await SystemSetting.deleteMany({
            key: { $regex: new RegExp(`^${MIN_BIMBINGAN_SETTING_PREFIX}:`) }
        });
        settingsClearedCount = deletedSettings.deletedCount;
    }

    console.log(`🗑️ GLOBAL CLEAR: All Bimbingan wiped. ${deletedBimbingan.deletedCount} bimbingan, ${deletedReplies.deletedCount} replies, ${filesDeleted} files, ${settingsClearedCount} settings cleared.`);

    sendSuccess(res, 200, 'Seluruh riwayat bimbingan berhasil dihapus secara global', {
        deletedBimbingan: deletedBimbingan.deletedCount,
        deletedReplies: deletedReplies.deletedCount,
        deletedFiles: filesDeleted,
        settingsCleared: settingsClearedCount,
        progressReset,
        progressResetTo,
    });
});


/**
 * @desc    Get bimbingan settings for selected mahasiswa
 * @route   GET /api/bimbingan/admin/settings/:mahasiswaId
 * @access  Admin
 */
const getBimbinganSettings = asyncHandler(async (req, res) => {
    const { mahasiswaId } = req.params;
    const mahasiswa = await User.findById(mahasiswaId).select('name nim_nip role');

    if (!mahasiswa || mahasiswa.role !== 'mahasiswa') {
        throw ApiError.notFound('Mahasiswa tidak ditemukan');
    }

    const setting = await getMinBimbinganSetting(mahasiswaId);
    const minRequirements = getMinBimbinganRequirementsFromSetting(setting);

    sendSuccess(res, 200, 'Setting bimbingan berhasil diambil', {
        minBimbinganSempro: Math.max(minRequirements.dospem1, minRequirements.dospem2),
        minBimbinganDospem1: minRequirements.dospem1,
        minBimbinganDospem2: minRequirements.dospem2,
        defaultMinBimbinganSempro: DEFAULT_MIN_BIMBINGAN_SEMPRO,
        isCustom: Boolean(setting),
        mahasiswa: {
            _id: mahasiswa._id,
            name: mahasiswa.name,
            nim_nip: mahasiswa.nim_nip
        }
    });
});

/**
 * @desc    Update bimbingan settings for selected mahasiswa
 * @route   PUT /api/bimbingan/admin/settings/:mahasiswaId
 * @access  Admin
 */
const updateBimbinganSettings = asyncHandler(async (req, res) => {
    const { mahasiswaId } = req.params;
    const minRequirements = normalizeMinBimbinganPair(req.body);
    const mahasiswa = await User.findById(mahasiswaId).select('name nim_nip role');

    if (!mahasiswa || mahasiswa.role !== 'mahasiswa') {
        throw ApiError.notFound('Mahasiswa tidak ditemukan');
    }

    await SystemSetting.findOneAndUpdate(
        { key: getMinBimbinganSettingKey(mahasiswaId) },
        {
            value: minRequirements,
            label: `Minimal bimbingan sidang - ${mahasiswa.name}`,
            description: 'Override khusus mahasiswa untuk kebutuhan demo/pengujian. Default sistem tetap 5 bimbingan.'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    sendSuccess(res, 200, 'Setting bimbingan berhasil diperbarui', {
        minBimbinganSempro: Math.max(minRequirements.dospem1, minRequirements.dospem2),
        minBimbinganDospem1: minRequirements.dospem1,
        minBimbinganDospem2: minRequirements.dospem2,
        defaultMinBimbinganSempro: DEFAULT_MIN_BIMBINGAN_SEMPRO,
        isCustom: true,
        mahasiswa: {
            _id: mahasiswa._id,
            name: mahasiswa.name,
            nim_nip: mahasiswa.nim_nip
        }
    });
});

/**
 * @desc    Get bimbingan progress report for all mahasiswa (Admin only)
 * @route   GET /api/bimbingan/admin/progress-report
 * @access  Admin
 */
const getProgressReport = asyncHandler(async (req, res) => {
    // Get all active mahasiswa to calculate workloads
    const studentsForWorkload = await User.find({ role: 'mahasiswa', status: 'aktif' }).lean();
    const pembimbingCounts = {};
    const pengujiCounts = {};
    studentsForWorkload.forEach(s => {
        if (s.dospem_1) pembimbingCounts[s.dospem_1.toString()] = (pembimbingCounts[s.dospem_1.toString()] || 0) + 1;
        if (s.dospem_2) pembimbingCounts[s.dospem_2.toString()] = (pembimbingCounts[s.dospem_2.toString()] || 0) + 1;
        if (s.penguji_1) pengujiCounts[s.penguji_1.toString()] = (pengujiCounts[s.penguji_1.toString()] || 0) + 1;
        if (s.penguji_2) pengujiCounts[s.penguji_2.toString()] = (pengujiCounts[s.penguji_2.toString()] || 0) + 1;
    });

    // Get all mahasiswa with their dospem info
    const mahasiswaList = await User.find({ role: 'mahasiswa', status: 'aktif' })
        .select('name nim_nip prodi judulTA currentProgress dospem_1 dospem_2 penguji_1 penguji_2')
        .populate('dospem_1', 'name nim_nip')
        .populate('dospem_2', 'name nim_nip')
        .populate('penguji_1', 'name nim_nip')
        .populate('penguji_2', 'name nim_nip')
        .sort({ name: 1 });

    const settingDocs = await SystemSetting.find({
        key: { $regex: `^${MIN_BIMBINGAN_SETTING_PREFIX}:` }
    }).lean();
    const minByMahasiswa = new Map(
        settingDocs.map(setting => [
            setting.key.replace(`${MIN_BIMBINGAN_SETTING_PREFIX}:`, ''),
            getMinBimbinganRequirementsFromSetting(setting)
        ])
    );

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
        const penguji1Data = bimbinganAgg.find(
            a => a._id.mahasiswa.toString() === mhs._id.toString() && a._id.dosenType === 'penguji_1'
        );
        const penguji2Data = bimbinganAgg.find(
            a => a._id.mahasiswa.toString() === mhs._id.toString() && a._id.dosenType === 'penguji_2'
        );

        const d1Total = dospem1Data?.total || 0;
        const d2Total = dospem2Data?.total || 0;
        const d1Acc = dospem1Data?.acc || 0;
        const d2Acc = dospem2Data?.acc || 0;
        const d1AccSempro = dospem1Data?.acc_sempro || 0;
        const d2AccSempro = dospem2Data?.acc_sempro || 0;

        const p1Total = penguji1Data?.total || 0;
        const p2Total = penguji2Data?.total || 0;
        const p1Acc = penguji1Data?.acc || 0;
        const p2Acc = penguji2Data?.acc || 0;
        const p1AccSempro = penguji1Data?.acc_sempro || 0;
        const p2AccSempro = penguji2Data?.acc_sempro || 0;

        const minRequirements = minByMahasiswa.get(mhs._id.toString()) || {
            dospem1: DEFAULT_MIN_BIMBINGAN_SEMPRO,
            dospem2: DEFAULT_MIN_BIMBINGAN_SEMPRO
        };
        const d1MeetsMinimum = d1Total >= minRequirements.dospem1;
        const d2MeetsMinimum = d2Total >= minRequirements.dospem2;
        const d1IsSufficient = d1MeetsMinimum && d1AccSempro > 0;
        const d2IsSufficient = d2MeetsMinimum && d2AccSempro > 0;

        const p1IsSufficient = p1Acc > 0 || p1AccSempro > 0;
        const p2IsSufficient = p2Acc > 0 || p2AccSempro > 0;

        return {
            _id: mhs._id,
            name: mhs.name,
            nim_nip: mhs.nim_nip,
            prodi: mhs.prodi,
            judulTA: mhs.judulTA,
            currentProgress: mhs.currentProgress,
            dospem_1: mhs.dospem_1 ? {
                name: mhs.dospem_1.name,
                nim_nip: mhs.dospem_1.nim_nip,
                workload: pembimbingCounts[mhs.dospem_1._id.toString()] || 0
            } : null,
            dospem_2: mhs.dospem_2 ? {
                name: mhs.dospem_2.name,
                nim_nip: mhs.dospem_2.nim_nip,
                workload: pembimbingCounts[mhs.dospem_2._id.toString()] || 0
            } : null,
            penguji_1: mhs.penguji_1 ? {
                name: mhs.penguji_1.name,
                nim_nip: mhs.penguji_1.nim_nip,
                workload: pengujiCounts[mhs.penguji_1._id.toString()] || 0
            } : null,
            penguji_2: mhs.penguji_2 ? {
                name: mhs.penguji_2.name,
                nim_nip: mhs.penguji_2.nim_nip,
                workload: pengujiCounts[mhs.penguji_2._id.toString()] || 0
            } : null,
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
            penguji1: {
                total: p1Total,
                acc: p1Acc,
                revisi: penguji1Data?.revisi || 0,
                menunggu: penguji1Data?.menunggu || 0,
                acc_sempro: p1AccSempro,
                lastActivity: penguji1Data?.lastActivity || null,
                isSufficient: p1IsSufficient
            },
            penguji2: {
                total: p2Total,
                acc: p2Acc,
                revisi: penguji2Data?.revisi || 0,
                menunggu: penguji2Data?.menunggu || 0,
                acc_sempro: p2AccSempro,
                lastActivity: penguji2Data?.lastActivity || null,
                isSufficient: p2IsSufficient
            },
            totalBimbingan: d1Total + d2Total,
            totalAcc: d1Acc + d2Acc,
            minBimbinganSempro: Math.max(minRequirements.dospem1, minRequirements.dospem2),
            minBimbinganDospem1: minRequirements.dospem1,
            minBimbinganDospem2: minRequirements.dospem2,
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
        minAccRequired: DEFAULT_MIN_BIMBINGAN_SEMPRO
    };

    sendSuccess(res, 200, 'Progress report berhasil diambil', { summary, report });
});

module.exports = {
    getAll,
    getById,
    create,
    giveFeedback,
    saveFeedbackDraft,
    addReply,
    downloadFile,
    getPendingCount,
    getSemproStatus,
    generateSuratSempro,
    getAdminBimbinganSummary,
    clearBimbinganHistory,
    clearAllBimbinganGlobal,
    getBimbinganSettings,
    updateBimbinganSettings,
    getProgressReport
};
