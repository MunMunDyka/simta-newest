/**
 * ===========================================
 * Jadwal Controller - Jadwal Sidang Management
 * ===========================================
 * Controller untuk manajemen jadwal sidang:
 * - Admin: CRUD jadwal sidang
 * - Dosen: View jadwal sebagai penguji
 * - Mahasiswa: View jadwal sendiri
 */

'use strict';

const Jadwal = require('../models/Jadwal');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated, sendCreated } = require('../utils/responseHelper');
const { notifyJadwalSidang } = require('../services/whatsappService');

/**
 * @desc    Get all jadwal with filtering
 * @route   GET /api/jadwal
 * @access  Private
 */
const getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, jenisJadwal, upcoming, viewAll } = req.query;
    const userRole = req.user.role;
    const userId = req.user._id;

    let query = {};

    // Filter based on role (unless viewAll is set for public jadwal viewing)
    if (viewAll !== 'true') {
        if (userRole === 'mahasiswa') {
            query.mahasiswa = userId;
        } else if (userRole === 'dosen') {
            // Dosen can see jadwal where they are penguji
            query.penguji = userId;
        }
    }
    // Admin can always see all

    if (status) query.status = status;
    if (jenisJadwal) query.jenisJadwal = jenisJadwal;

    // Only upcoming (future dates)
    if (upcoming === 'true') {
        query.tanggal = { $gte: new Date() };
    }

    // Execute query
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jadwalList, total] = await Promise.all([
        Jadwal.find(query)
            .populate('mahasiswa', 'name nim_nip prodi judulTA')
            .populate('penguji', 'name nim_nip')
            .populate('createdBy', 'name')
            .sort({ tanggal: 1, waktuMulai: 1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Jadwal.countDocuments(query)
    ]);

    sendPaginated(res, 'Data jadwal berhasil diambil', jadwalList, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

/**
 * @desc    Get jadwal by ID
 * @route   GET /api/jadwal/:id
 * @access  Private
 */
const getById = asyncHandler(async (req, res) => {
    const jadwal = await Jadwal.findById(req.params.id)
        .populate('mahasiswa', 'name nim_nip prodi judulTA dospem_1 dospem_2')
        .populate('penguji', 'name nim_nip email')
        .populate('createdBy', 'name');

    if (!jadwal) {
        throw ApiError.notFound('Jadwal tidak ditemukan');
    }

    // Authorization check
    const userRole = req.user.role;
    const userId = req.user._id.toString();

    if (userRole === 'mahasiswa' && jadwal.mahasiswa._id.toString() !== userId) {
        throw ApiError.forbidden('Anda hanya dapat melihat jadwal milik Anda');
    }

    if (userRole === 'dosen') {
        const isPenguji = jadwal.penguji.some(p => p._id.toString() === userId);
        if (!isPenguji) {
            throw ApiError.forbidden('Anda hanya dapat melihat jadwal dimana Anda sebagai penguji');
        }
    }

    sendSuccess(res, 200, 'Data jadwal berhasil diambil', jadwal);
});

/**
 * @desc    Create new jadwal (Admin only)
 * @route   POST /api/jadwal
 * @access  Admin
 */
const create = asyncHandler(async (req, res) => {
    const {
        mahasiswa,
        jenisJadwal,
        tanggal,
        waktuMulai,
        waktuSelesai,
        ruangan,
        penguji,
        catatan
    } = req.body;

    // Validate mahasiswa exists
    const mahasiswaUser = await User.findById(mahasiswa);
    if (!mahasiswaUser || mahasiswaUser.role !== 'mahasiswa') {
        throw ApiError.badRequest('Mahasiswa tidak valid');
    }

    // Validate penguji (all must be dosen)
    if (penguji && penguji.length > 0) {
        const dosenList = await User.find({
            _id: { $in: penguji },
            role: 'dosen'
        });

        if (dosenList.length !== penguji.length) {
            throw ApiError.badRequest('Satu atau lebih penguji bukan dosen yang valid');
        }
    }

    // Check if slot is available
    if (ruangan) {
        const isAvailable = await Jadwal.isSlotAvailable(
            new Date(tanggal),
            waktuMulai,
            ruangan
        );

        if (!isAvailable) {
            throw ApiError.conflict(
                `Ruangan '${ruangan}' sudah digunakan pada ${tanggal} pukul ${waktuMulai}`
            );
        }
    }

    // Check if mahasiswa already has jadwal for same jenis
    const existingJadwal = await Jadwal.findOne({
        mahasiswa,
        jenisJadwal,
        status: { $ne: 'dibatalkan' }
    });

    if (existingJadwal) {
        throw ApiError.conflict(
            `Mahasiswa sudah memiliki jadwal ${jenisJadwal === 'sidang_proposal' ? 'Sidang Proposal' : 'Sidang Skripsi'}. ` +
            'Batalkan jadwal yang ada jika ingin membuat yang baru.'
        );
    }

    // Create jadwal
    const jadwal = await Jadwal.create({
        mahasiswa,
        jenisJadwal,
        tanggal: new Date(tanggal),
        waktuMulai,
        waktuSelesai,
        ruangan,
        penguji: penguji || [],
        catatan,
        createdBy: req.user._id
    });

    await jadwal.populate([
        { path: 'mahasiswa', select: 'name nim_nip prodi whatsapp' },
        { path: 'penguji', select: 'name nim_nip whatsapp' },
        { path: 'createdBy', select: 'name' }
    ]);

    console.log(`📅 Jadwal created: ${jadwal.jenisJadwalDisplay} for ${mahasiswaUser.name}`);

    // Format tanggal dan waktu untuk notifikasi
    const tanggalFormatted = new Date(jadwal.tanggal).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const waktuFormatted = `${jadwal.waktuMulai} - ${jadwal.waktuSelesai || 'selesai'} WIB`;

    // Send WhatsApp notification to mahasiswa (non-blocking)
    if (jadwal.mahasiswa.whatsapp) {
        notifyJadwalSidang(
            jadwal.mahasiswa.whatsapp,
            jadwal.mahasiswa.name,
            'mahasiswa',
            tanggalFormatted,
            waktuFormatted,
            jadwal.ruangan || '-'
        ).then(result => {
            if (result.success) {
                console.log(`📱 WhatsApp sent to mahasiswa: ${jadwal.mahasiswa.name}`);
            } else {
                console.log(`⚠️ WhatsApp not sent to mahasiswa: ${result.reason || result.error}`);
            }
        }).catch(err => console.error('WhatsApp error:', err));
    }

    // Send WhatsApp notification to all penguji (non-blocking)
    if (jadwal.penguji && jadwal.penguji.length > 0) {
        jadwal.penguji.forEach(dosen => {
            if (dosen.whatsapp) {
                notifyJadwalSidang(
                    dosen.whatsapp,
                    jadwal.mahasiswa.name,
                    'penguji',
                    tanggalFormatted,
                    waktuFormatted,
                    jadwal.ruangan || '-'
                ).then(result => {
                    if (result.success) {
                        console.log(`📱 WhatsApp sent to penguji: ${dosen.name}`);
                    } else {
                        console.log(`⚠️ WhatsApp not sent to penguji ${dosen.name}: ${result.reason || result.error}`);
                    }
                }).catch(err => console.error('WhatsApp error:', err));
            }
        });
    }

    sendCreated(res, 'Jadwal sidang berhasil dibuat', jadwal);
});

/**
 * @desc    Update jadwal (Admin only)
 * @route   PUT /api/jadwal/:id
 * @access  Admin
 */
const update = asyncHandler(async (req, res) => {
    const jadwal = await Jadwal.findById(req.params.id);

    if (!jadwal) {
        throw ApiError.notFound('Jadwal tidak ditemukan');
    }

    // Cannot update completed or cancelled jadwal
    if (jadwal.status === 'selesai') {
        throw ApiError.badRequest('Tidak dapat mengubah jadwal yang sudah selesai');
    }

    const allowedUpdates = [
        'tanggal', 'waktuMulai', 'waktuSelesai', 'ruangan',
        'penguji', 'status', 'catatan', 'hasil', 'nilaiSidang'
    ];

    // Apply updates
    for (const field of allowedUpdates) {
        if (req.body[field] !== undefined) {
            if (field === 'tanggal') {
                jadwal[field] = new Date(req.body[field]);
            } else {
                jadwal[field] = req.body[field];
            }
        }
    }

    // If status changed to selesai, require hasil
    if (jadwal.status === 'selesai' && !jadwal.hasil) {
        throw ApiError.badRequest('Hasil sidang wajib diisi jika status selesai');
    }

    await jadwal.save();

    await jadwal.populate([
        { path: 'mahasiswa', select: 'name nim_nip' },
        { path: 'penguji', select: 'name nim_nip' }
    ]);

    console.log(`✏️ Jadwal updated: ${jadwal._id}`);

    sendSuccess(res, 200, 'Jadwal berhasil diupdate', jadwal);
});

/**
 * @desc    Delete/Cancel jadwal (Admin only)
 * @route   DELETE /api/jadwal/:id
 * @access  Admin
 */
const remove = asyncHandler(async (req, res) => {
    const jadwal = await Jadwal.findById(req.params.id);

    if (!jadwal) {
        throw ApiError.notFound('Jadwal tidak ditemukan');
    }

    if (jadwal.status === 'selesai') {
        throw ApiError.badRequest('Tidak dapat menghapus jadwal yang sudah selesai');
    }

    // Soft delete (cancel)
    jadwal.status = 'dibatalkan';
    jadwal.catatan = req.body.alasan || 'Dibatalkan oleh admin';
    await jadwal.save();

    console.log(`🗑️ Jadwal cancelled: ${jadwal._id}`);

    sendSuccess(res, 200, 'Jadwal berhasil dibatalkan', null);
});

/**
 * @desc    Get upcoming jadwal (for dashboard)
 * @route   GET /api/jadwal/upcoming
 * @access  Private
 */
const getUpcoming = asyncHandler(async (req, res) => {
    const { days = 30 } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role;

    let jadwalList;

    if (userRole === 'admin') {
        jadwalList = await Jadwal.getUpcoming(parseInt(days));
    } else if (userRole === 'dosen') {
        jadwalList = await Jadwal.findByPenguji(userId);
        jadwalList = jadwalList.filter(j =>
            j.status === 'dijadwalkan' &&
            new Date(j.tanggal) >= new Date()
        );
    } else {
        jadwalList = await Jadwal.findByMahasiswa(userId);
        jadwalList = jadwalList.filter(j =>
            j.status === 'dijadwalkan' &&
            new Date(j.tanggal) >= new Date()
        );
    }

    sendSuccess(res, 200, 'Jadwal mendatang berhasil diambil', jadwalList);
});

/**
 * @desc    Get jadwal statistics (Admin only)
 * @route   GET /api/jadwal/statistics
 * @access  Admin
 */
const getStatistics = asyncHandler(async (req, res) => {
    const stats = await Jadwal.getStatistics();
    sendSuccess(res, 200, 'Statistik jadwal berhasil diambil', stats);
});

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getUpcoming,
    getStatistics
};
