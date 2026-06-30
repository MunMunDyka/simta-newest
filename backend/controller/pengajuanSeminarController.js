/**
 * ===========================================
 * Pengajuan Seminar Controller
 * ===========================================
 * Upload, verifikasi, dan download softcopy pengajuan seminar.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const PengajuanSeminar = require('../models/PengajuanSeminar');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/responseHelper');

const jenisPengajuanMap = {
    seminar_proposal: {
        label: 'Seminar Proposal',
        requiredStatus: 'menunggu_sempro'
    },
    seminar_hasil: {
        label: 'Seminar Hasil',
        requiredStatus: 'menunggu_semhas'
    }
};

const getRefId = (value) => {
    if (!value) return null;
    return value._id || value;
};

const isSameId = (left, right) => {
    const leftId = getRefId(left);
    const rightId = getRefId(right);
    return Boolean(leftId && rightId && leftId.toString() === rightId.toString());
};

const isAdminAccess = (user) => user.role === 'admin' || user.canAccessAdmin === true;

const isDosenRelatedToMahasiswa = (mahasiswa, dosenId) => {
    if (!mahasiswa || mahasiswa.role !== 'mahasiswa') return false;

    return ['dospem_1', 'dospem_2', 'penguji_1', 'penguji_2']
        .some((field) => isSameId(mahasiswa[field], dosenId));
};

const ensureValidJenis = (jenisPengajuan) => {
    const jenis = jenisPengajuanMap[jenisPengajuan];
    if (!jenis) {
        throw ApiError.badRequest('Jenis pengajuan harus seminar_proposal atau seminar_hasil');
    }
    return jenis;
};

const getAll = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 100,
        jenisPengajuan,
        statusVerifikasi,
        search,
        mahasiswaId
    } = req.query;

    const query = {};

    if (jenisPengajuan) {
        ensureValidJenis(jenisPengajuan);
        query.jenisPengajuan = jenisPengajuan;
    }

    if (statusVerifikasi && statusVerifikasi !== 'semua') {
        query.statusVerifikasi = statusVerifikasi;
    }

    if (mahasiswaId) {
        query.mahasiswa = mahasiswaId;
    }

    if (req.user.role === 'mahasiswa') {
        query.mahasiswa = req.user._id;
    } else if (req.user.role === 'dosen' && !isAdminAccess(req.user)) {
        const relatedStudents = await User.find({
            role: 'mahasiswa',
            $or: [
                { dospem_1: req.user._id },
                { dospem_2: req.user._id },
                { penguji_1: req.user._id },
                { penguji_2: req.user._id }
            ]
        }).select('_id');

        const relatedIds = relatedStudents.map((student) => student._id);
        query.mahasiswa = query.mahasiswa
            ? { $in: relatedIds.filter((id) => id.toString() === query.mahasiswa.toString()) }
            : { $in: relatedIds };
    }

    if (search) {
        const students = await User.find({
            role: 'mahasiswa',
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { nim_nip: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }).select('_id');
        const searchIds = students.map((student) => student._id);

        if (query.mahasiswa && query.mahasiswa.$in) {
            query.mahasiswa.$in = query.mahasiswa.$in.filter((id) =>
                searchIds.some((searchId) => searchId.toString() === id.toString())
            );
        } else if (query.mahasiswa) {
            const selectedId = query.mahasiswa.toString();
            query.mahasiswa = searchIds.some((id) => id.toString() === selectedId)
                ? query.mahasiswa
                : { $in: [] };
        } else {
            query.mahasiswa = { $in: searchIds };
        }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
        PengajuanSeminar.find(query)
            .populate('mahasiswa', 'name nim_nip prodi judulTA statusMahasiswa dospem_1 dospem_2 penguji_1 penguji_2')
            .populate('verifiedBy', 'name nim_nip')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        PengajuanSeminar.countDocuments(query)
    ]);

    sendPaginated(res, 'Data pengajuan seminar berhasil diambil', items, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

const upload = asyncHandler(async (req, res) => {
    const { jenisPengajuan } = req.params;
    const jenis = ensureValidJenis(jenisPengajuan);

    if (!req.file) {
        throw ApiError.badRequest('File softcopy PDF wajib diunggah');
    }

    const student = await User.findById(req.user._id);
    if (!student || student.role !== 'mahasiswa') {
        throw ApiError.notFound('Mahasiswa tidak ditemukan');
    }

    if (student.statusMahasiswa !== jenis.requiredStatus) {
        throw ApiError.badRequest(
            `Anda belum berada pada tahap pengajuan ${jenis.label}. Pastikan sudah ACC Seminar dari dosen pembimbing.`
        );
    }

    let pengajuan = await PengajuanSeminar.findOne({
        mahasiswa: student._id,
        jenisPengajuan
    });

    if (pengajuan?.statusVerifikasi === 'disetujui') {
        throw ApiError.badRequest(`Berkas pengajuan ${jenis.label} sudah disetujui dan tidak dapat diunggah ulang`);
    }

    if (!pengajuan) {
        pengajuan = new PengajuanSeminar({
            mahasiswa: student._id,
            jenisPengajuan
        });
    }

    pengajuan.fileName = req.file.filename;
    pengajuan.filePath = 'uploads/pengajuan-seminar/' + req.file.filename;
    pengajuan.fileSize = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';
    pengajuan.fileOriginalName = req.file.originalname;
    pengajuan.uploadedAt = new Date();
    pengajuan.statusVerifikasi = 'menunggu_verifikasi';
    pengajuan.catatanAdmin = null;
    pengajuan.verifiedBy = null;
    pengajuan.verifiedAt = null;

    await pengajuan.save();
    await pengajuan.populate('mahasiswa', 'name nim_nip prodi judulTA statusMahasiswa');

    sendSuccess(res, 200, `Berkas pengajuan ${jenis.label} berhasil diunggah`, pengajuan);
});

const verifikasi = asyncHandler(async (req, res) => {
    const { statusVerifikasi, catatanAdmin } = req.body;

    if (!['disetujui', 'ditolak'].includes(statusVerifikasi)) {
        throw ApiError.badRequest('Status verifikasi harus disetujui atau ditolak');
    }

    if (statusVerifikasi === 'ditolak' && !catatanAdmin?.trim()) {
        throw ApiError.badRequest('Catatan evaluasi wajib diisi jika dokumen ditolak');
    }

    const pengajuan = await PengajuanSeminar.findById(req.params.id)
        .populate('mahasiswa', 'name nim_nip prodi judulTA statusMahasiswa');

    if (!pengajuan) {
        throw ApiError.notFound('Pengajuan seminar tidak ditemukan');
    }

    if (!pengajuan.fileName) {
        throw ApiError.badRequest('Pengajuan belum memiliki file softcopy');
    }

    pengajuan.statusVerifikasi = statusVerifikasi;
    pengajuan.catatanAdmin = catatanAdmin || null;
    pengajuan.verifiedBy = req.user._id;
    pengajuan.verifiedAt = new Date();
    await pengajuan.save();
    await pengajuan.populate('verifiedBy', 'name nim_nip');

    sendSuccess(
        res,
        200,
        `Berkas pengajuan ${pengajuan.jenisPengajuanDisplay} berhasil ${statusVerifikasi === 'disetujui' ? 'disetujui' : 'ditolak'}`,
        pengajuan
    );
});

const downloadFile = asyncHandler(async (req, res) => {
    const { fileName } = req.params;
    const safeFileName = path.basename(fileName);
    const filePath = path.resolve(__dirname, '..', 'uploads', 'pengajuan-seminar', safeFileName);

    if (!fs.existsSync(filePath)) {
        throw ApiError.notFound('File pengajuan seminar tidak ditemukan');
    }

    const pengajuan = await PengajuanSeminar.findOne({
        $or: [
            { fileName: safeFileName },
            { filePath: `uploads/pengajuan-seminar/${safeFileName}` },
            { filePath: safeFileName }
        ]
    }).populate('mahasiswa', 'role name dospem_1 dospem_2 penguji_1 penguji_2');

    if (!isAdminAccess(req.user)) {
        const isOwner = req.user.role === 'mahasiswa' && isSameId(pengajuan?.mahasiswa?._id, req.user._id);
        const isRelatedDosen = req.user.role === 'dosen' && isDosenRelatedToMahasiswa(pengajuan?.mahasiswa, req.user._id);

        if (!isOwner && !isRelatedDosen) {
            throw ApiError.forbidden('Anda tidak memiliki akses untuk mendownload file ini');
        }
    }

    res.download(filePath, safeFileName);
});

module.exports = {
    getAll,
    upload,
    verifikasi,
    downloadFile,
    jenisPengajuanMap
};
