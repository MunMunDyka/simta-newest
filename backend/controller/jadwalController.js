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
const PengajuanSeminar = require('../models/PengajuanSeminar');
const SystemSetting = require('../models/SystemSetting');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated, sendCreated } = require('../utils/responseHelper');
const { notifyJadwalSidangEmail } = require('../services/emailService');

const getJenisJadwalDisplay = (jenis) => {
    const display = {
        sidang_proposal: 'Seminar Proposal',
        sidang_semhas: 'Seminar Hasil',
        sidang_skripsi: 'Sidang Akhir'
    };
    return display[jenis] || jenis;
};

const requiredPengajuanByJadwal = {
    sidang_proposal: 'seminar_proposal',
    sidang_semhas: 'seminar_hasil'
};

const ACADEMIC_SIDANG_LINK_KEY = 'academic_sidang_akhir_link';
const REVISION_DEADLINE_DAYS = Number(process.env.REVISION_DEADLINE_DAYS || 14);

const setRevisionDeadline = (student, jenis) => {
    const tanggalMulai = new Date();
    const deadline = new Date(tanggalMulai.getTime() + REVISION_DEADLINE_DAYS * 24 * 60 * 60 * 1000);

    student.revisiDeadline = {
        jenis,
        tanggalMulai,
        deadline,
        status: 'aktif',
        isLocked: false,
        unlockedBy: null,
        unlockedAt: null,
        catatan: `Deadline revisi otomatis ${REVISION_DEADLINE_DAYS} hari setelah jadwal selesai.`
    };
};

const clearRevisionDeadline = (student) => {
    student.revisiDeadline = {
        jenis: null,
        tanggalMulai: null,
        deadline: null,
        status: 'tidak_aktif',
        isLocked: false,
        unlockedBy: null,
        unlockedAt: null,
        catatan: null
    };
};

const getAcademicSidangLink = asyncHandler(async (req, res) => {
    const setting = await SystemSetting.findOne({ key: ACADEMIC_SIDANG_LINK_KEY }).lean();

    sendSuccess(res, 200, 'Link pendaftaran sidang akhir akademik berhasil diambil', {
        url: setting?.value?.url || '',
        label: setting?.value?.label || 'Daftar Sidang Akhir melalui Akademik',
        updatedAt: setting?.updatedAt || null
    });
});

const updateAcademicSidangLink = asyncHandler(async (req, res) => {
    const { url, label } = req.body;
    const normalizedUrl = typeof url === 'string' ? url.trim() : '';

    if (normalizedUrl && !/^https?:\/\/.+/i.test(normalizedUrl)) {
        throw ApiError.badRequest('Link akademik harus diawali dengan http:// atau https://');
    }

    const setting = await SystemSetting.findOneAndUpdate(
        { key: ACADEMIC_SIDANG_LINK_KEY },
        {
            value: {
                url: normalizedUrl,
                label: label?.trim() || 'Daftar Sidang Akhir melalui Akademik'
            },
            label: 'Link Pendaftaran Sidang Akhir Akademik',
            description: 'Link eksternal akademik untuk mahasiswa yang sudah menyelesaikan Seminar Hasil.'
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    sendSuccess(res, 200, 'Link pendaftaran sidang akhir akademik berhasil diperbarui', setting.value);
});

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
    let {
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

    const requiredPengajuan = requiredPengajuanByJadwal[jenisJadwal];
    if (requiredPengajuan) {
        const approvedPengajuan = await PengajuanSeminar.findOne({
            mahasiswa,
            jenisPengajuan: requiredPengajuan,
            statusVerifikasi: 'disetujui'
        });

        if (!approvedPengajuan) {
            throw ApiError.badRequest(
                `Berkas pengajuan ${getJenisJadwalDisplay(jenisJadwal)} belum disetujui admin. ` +
                'Mahasiswa harus upload softcopy dan menunggu verifikasi sebelum jadwal dibuat.'
            );
        }
    }

    if (jenisJadwal === 'sidang_skripsi' && !['bimbingan_akhir', 'menunggu_sidang'].includes(mahasiswaUser.statusMahasiswa)) {
        throw ApiError.badRequest(
            'Jadwal Sidang Akhir hanya dapat dicatat setelah mahasiswa menyelesaikan Seminar Hasil.'
        );
    }

    // Force immutable examiners if already assigned to the student in a previous exam phase
    if (mahasiswaUser.penguji_1 || mahasiswaUser.penguji_2) {
        penguji = [mahasiswaUser.penguji_1, mahasiswaUser.penguji_2].filter(Boolean);
        console.log(`🔒 Forcing pre-assigned examiners for student: ${mahasiswaUser.name}`);
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

    if (jenisJadwal === 'sidang_skripsi' && mahasiswaUser.statusMahasiswa === 'bimbingan_akhir') {
        await User.findByIdAndUpdate(mahasiswa, {
            statusMahasiswa: 'menunggu_sidang',
            currentProgress: 'BAB VI'
        });
    }

    // Validate that penguji is not dospem_1 or dospem_2 of the student
    const dospem1Id = mahasiswaUser.dospem_1?.toString();
    const dospem2Id = mahasiswaUser.dospem_2?.toString();

    if (penguji && penguji.length > 0) {
        penguji.forEach(pId => {
            const currentPengujiIdStr = pId.toString();
            if (currentPengujiIdStr === dospem1Id || currentPengujiIdStr === dospem2Id) {
                throw ApiError.badRequest('Dosen Pembimbing tidak boleh ditugaskan sebagai Dosen Penguji');
            }
        });
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

    // Check if mahasiswa has another schedule on the same date and time slot
    const studentConflict = await Jadwal.findOne({
        mahasiswa,
        tanggal: new Date(tanggal),
        waktuMulai,
        status: { $ne: 'dibatalkan' }
    });

    if (studentConflict) {
        throw ApiError.conflict(
            `Mahasiswa sudah memiliki jadwal ${getJenisJadwalDisplay(studentConflict.jenisJadwal)} pada tanggal dan waktu yang sama.`
        );
    }

    // Check if mahasiswa already has jadwal for same jenis
    const existingJadwal = await Jadwal.findOne({
        mahasiswa,
        jenisJadwal,
        status: { $ne: 'dibatalkan' }
    });

    if (existingJadwal) {
        throw ApiError.conflict(
            `Mahasiswa sudah memiliki jadwal ${getJenisJadwalDisplay(jenisJadwal)}. ` +
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

    // ===== Sync penguji to mahasiswa User record =====
    if (penguji && penguji.length > 0) {
        const updatePenguji = {};
        if (penguji[0]) updatePenguji.penguji_1 = penguji[0];
        if (penguji[1]) updatePenguji.penguji_2 = penguji[1];
        await User.findByIdAndUpdate(mahasiswa, updatePenguji);
        console.log(`🔗 Penguji synced to student record: ${mahasiswaUser.name}`);
    }

    await jadwal.populate([
        { path: 'mahasiswa', select: 'name nim_nip prodi email' },
        { path: 'penguji', select: 'name nim_nip email' },
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

    // Send email notification to mahasiswa (non-blocking)
    if (jadwal.mahasiswa.email) {
        notifyJadwalSidangEmail(
            jadwal.mahasiswa.email,
            jadwal.mahasiswa.name,
            'mahasiswa',
            tanggalFormatted,
            waktuFormatted,
            jadwal.ruangan || '-'
        ).then(result => {
            if (result.success) {
                console.log(`Email sent to mahasiswa: ${jadwal.mahasiswa.name}`);
            } else {
                console.log(`Email not sent to mahasiswa: ${result.reason || result.error}`);
            }
        }).catch(err => console.error('Email error:', err));
    }

    // Send email notification to all penguji (non-blocking)
    if (jadwal.penguji && jadwal.penguji.length > 0) {
        jadwal.penguji.forEach(dosen => {
            if (dosen.email) {
                notifyJadwalSidangEmail(
                    dosen.email,
                    jadwal.mahasiswa.name,
                    'penguji',
                    tanggalFormatted,
                    waktuFormatted,
                    jadwal.ruangan || '-'
                ).then(result => {
                    if (result.success) {
                        console.log(`Email sent to penguji: ${dosen.name}`);
                    } else {
                        console.log(`Email not sent to penguji ${dosen.name}: ${result.reason || result.error}`);
                    }
                }).catch(err => console.error('Email error:', err));
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

    // Cannot update completed jadwal (cancelled can be rescheduled)
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

    // If penguji is being updated, validate that they are not dospem_1 or dospem_2 of the student
    if (req.body.penguji !== undefined) {
        const student = await User.findById(jadwal.mahasiswa);
        if (student) {
            // Force immutable examiners on schedule updates if they are already pre-assigned
            if (student.penguji_1 || student.penguji_2) {
                req.body.penguji = [student.penguji_1, student.penguji_2].filter(Boolean);
                console.log(`🔒 Override schedule update to use original plotted examiners`);
            }

            const dospem1Id = student.dospem_1?.toString();
            const dospem2Id = student.dospem_2?.toString();
            const newPenguji = req.body.penguji || [];

            newPenguji.forEach(pId => {
                const currentPengujiIdStr = pId.toString();
                if (currentPengujiIdStr === dospem1Id || currentPengujiIdStr === dospem2Id) {
                    throw ApiError.badRequest('Dosen Pembimbing tidak boleh ditugaskan sebagai Dosen Penguji');
                }
            });
        }
    }

    // Check if student has another schedule on same date and time slot (excluding current schedule)
    if (req.body.tanggal !== undefined || req.body.waktuMulai !== undefined || req.body.mahasiswa !== undefined) {
        const targetMahasiswa = req.body.mahasiswa || jadwal.mahasiswa;
        const targetTanggal = req.body.tanggal ? new Date(req.body.tanggal) : jadwal.tanggal;
        const targetWaktuMulai = req.body.waktuMulai || jadwal.waktuMulai;

        const studentConflict = await Jadwal.findOne({
            _id: { $ne: jadwal._id },
            mahasiswa: targetMahasiswa,
            tanggal: targetTanggal,
            waktuMulai: targetWaktuMulai,
            status: { $ne: 'dibatalkan' }
        });

        if (studentConflict) {
            throw ApiError.conflict(
                `Mahasiswa sudah memiliki jadwal ${getJenisJadwalDisplay(studentConflict.jenisJadwal)} pada tanggal dan waktu yang sama.`
            );
        }
    }

    // Check if mahasiswa already has another active schedule for the same jenisJadwal
    if (req.body.status === 'dijadwalkan') {
        const existingJadwal = await Jadwal.findOne({
            _id: { $ne: jadwal._id },
            mahasiswa: jadwal.mahasiswa,
            jenisJadwal: jadwal.jenisJadwal,
            status: { $ne: 'dibatalkan' }
        });

        if (existingJadwal) {
            throw ApiError.conflict(
                `Mahasiswa sudah memiliki jadwal ${getJenisJadwalDisplay(jadwal.jenisJadwal)}. ` +
                'Batalkan jadwal yang ada jika ingin mengaktifkan kembali jadwal ini.'
            );
        }
    }

    // ===== Sync penguji to mahasiswa User record when penguji array is updated =====
    if (req.body.penguji !== undefined) {
        const newPenguji = req.body.penguji || [];
        const updatePenguji = {
            penguji_1: newPenguji[0] || null,
            penguji_2: newPenguji[1] || null
        };
        await User.findByIdAndUpdate(jadwal.mahasiswa, updatePenguji);
        console.log(`🔗 Penguji synced to student record on jadwal update`);
    }

    await jadwal.save();

    // ===== Automatic Student Status Transition on Exam Completion =====
    if (jadwal.status === 'selesai' && (jadwal.hasil === 'lulus' || jadwal.hasil === 'lulus_revisi')) {
        const student = await User.findById(jadwal.mahasiswa);
        if (student) {
            // Map jenis jadwal to the next student status
            const statusMap = {
                'sidang_proposal': 'revisi_sempro',
                'sidang_semhas': 'revisi_semhas',
                'sidang_skripsi': 'persiapan_wisuda'
            };

            const nextStatus = statusMap[jadwal.jenisJadwal];
            if (nextStatus) {
                student.statusMahasiswa = nextStatus;
                if (nextStatus === 'persiapan_wisuda') {
                    student.currentProgress = 'Selesai';
                }

                if (jadwal.hasil === 'lulus_revisi' && ['revisi_sempro', 'revisi_semhas'].includes(nextStatus)) {
                    setRevisionDeadline(student, nextStatus);
                } else if (nextStatus === 'persiapan_wisuda') {
                    clearRevisionDeadline(student);
                }

                // Assign penguji_1 and penguji_2 from the exam panel
                if (jadwal.penguji && jadwal.penguji.length >= 1) {
                    student.penguji_1 = jadwal.penguji[0]._id || jadwal.penguji[0];
                }
                if (jadwal.penguji && jadwal.penguji.length >= 2) {
                    student.penguji_2 = jadwal.penguji[1]._id || jadwal.penguji[1];
                }

                await student.save();
                console.log(`🎓 Student status updated: ${student.name} -> ${nextStatus}, penguji assigned`);
            }

            // If hasil is 'lulus' (not 'lulus_revisi'), student skips revision and goes straight to next guidance phase.
            // Sidang Akhir is handled by Akademik; once admin marks it completed in SIMTA, open wisuda documents.
            if (jadwal.hasil === 'lulus') {
                const directTransition = {
                    'sidang_proposal': 'bimbingan_lanjut',
                    'sidang_semhas': 'bimbingan_akhir',
                    'sidang_skripsi': 'persiapan_wisuda'
                };
                const directStatus = directTransition[jadwal.jenisJadwal];
                if (directStatus) {
                    student.statusMahasiswa = directStatus;
                    clearRevisionDeadline(student);

                    // Automatically update progress bab
                    if (directStatus === 'bimbingan_lanjut') {
                        student.currentProgress = 'BAB IV';
                    } else if (directStatus === 'bimbingan_akhir') {
                        student.currentProgress = 'BAB VI';
                    } else if (directStatus === 'persiapan_wisuda') {
                        student.currentProgress = 'Selesai';
                    }

                    await student.save();
                    console.log(`🎓 Student directly transitioned: ${student.name} -> ${directStatus} (lulus tanpa revisi)`);
                }
            }
        }
    }

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

    // ===== Clear penguji from mahasiswa User record when jadwal is cancelled =====
    if (jadwal.penguji && jadwal.penguji.length > 0) {
        // Only clear if no other active jadwal assigns these penguji to this student
        const otherActiveJadwal = await Jadwal.findOne({
            _id: { $ne: jadwal._id },
            mahasiswa: jadwal.mahasiswa,
            status: { $ne: 'dibatalkan' },
            penguji: { $exists: true, $not: { $size: 0 } }
        });

        if (!otherActiveJadwal) {
            await User.findByIdAndUpdate(jadwal.mahasiswa, {
                penguji_1: null,
                penguji_2: null
            });
            console.log(`🔗 Penguji cleared from student record on jadwal cancel`);
        }
    }

    console.log(`🗑️ Jadwal cancelled: ${jadwal._id}`);

    sendSuccess(res, 200, 'Jadwal berhasil dibatalkan', null);
});

/**
 * @desc    Hard delete jadwal (permanent, only for cancelled/completed)
 * @route   DELETE /api/jadwal/:id/permanent
 * @access  Admin
 */
const hardDelete = asyncHandler(async (req, res) => {
    const jadwal = await Jadwal.findById(req.params.id);

    if (!jadwal) {
        throw ApiError.notFound('Jadwal tidak ditemukan');
    }

    if (jadwal.status === 'dijadwalkan') {
        throw ApiError.badRequest(
            'Tidak dapat menghapus permanen jadwal yang masih aktif. Batalkan terlebih dahulu.'
        );
    }

    await Jadwal.findByIdAndDelete(req.params.id);

    console.log(`💀 Jadwal PERMANENTLY deleted: ${jadwal._id} by Admin ${req.user.name}`);

    sendSuccess(res, 200, 'Jadwal berhasil dihapus permanen', null);
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

/**
 * @desc    Get examiner workloads (Admin only)
 * @route   GET /api/jadwal/penguji-workload
 * @access  Admin
 */
const getPengujiWorkload = asyncHandler(async (req, res) => {
    // 1. Aggregate workloads from Jadwal
    const workloads = await Jadwal.aggregate([
        { $match: { status: { $ne: 'dibatalkan' } } },
        { $unwind: '$penguji' },
        { $group: { _id: '$penguji', count: { $sum: 1 } } }
    ]);

    // Create a map for quick lookup
    const workloadMap = {};
    workloads.forEach(item => {
        workloadMap[item._id.toString()] = item.count;
    });

    // 2. Fetch all lecturers
    const lecturers = await User.find({ role: 'dosen' })
        .select('name nim_nip prodi')
        .lean();

    // 3. Map workload to each lecturer and sort by workload (ascending)
    const result = lecturers.map(dosen => ({
        _id: dosen._id,
        name: dosen.name,
        nim_nip: dosen.nim_nip,
        prodi: dosen.prodi,
        workload: workloadMap[dosen._id.toString()] || 0
    }));

    // Sort by workload ascending, then by name
    result.sort((a, b) => {
        if (a.workload !== b.workload) {
            return a.workload - b.workload;
        }
        return a.name.localeCompare(b.name);
    });

    sendSuccess(res, 200, 'Workload penguji berhasil diambil', result);
});

/**
 * @desc    Hard delete all jadwal (permanent, admin only)
 * @route   DELETE /api/jadwal/all/permanent
 * @access  Admin
 */
const clearAll = asyncHandler(async (req, res) => {
    const result = await Jadwal.deleteMany({});
    console.log(`💀 ALL Jadwal PERMANENTLY deleted: ${result.deletedCount} items by Admin ${req.user.name}`);
    sendSuccess(res, 200, 'Seluruh jadwal berhasil dihapus permanen', null);
});

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    hardDelete,
    getUpcoming,
    getStatistics,
    getPengujiWorkload,
    clearAll,
    getAcademicSidangLink,
    updateAcademicSidangLink
};
