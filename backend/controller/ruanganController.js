/**
 * ===========================================
 * Ruangan Controller - CRUD Ruangan Sidang
 * ===========================================
 */

'use strict';

const Ruangan = require('../models/Ruangan');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/responseHelper');

/**
 * @desc    Ambil daftar ruangan
 * @route   GET /api/ruangan
 * @access  Private (semua role terautentikasi)
 * @query   includeInactive=true untuk menampilkan yang non-aktif (admin)
 */
const getAll = asyncHandler(async (req, res) => {
    const query = req.query.includeInactive === 'true' ? {} : { isActive: true };
    const ruangan = await Ruangan.find(query).sort({ nama: 1 });
    sendSuccess(res, 200, 'Data ruangan berhasil diambil', ruangan);
});

/**
 * @desc    Tambah ruangan
 * @route   POST /api/ruangan
 * @access  Admin
 */
const create = asyncHandler(async (req, res) => {
    const nama = String(req.body.nama || '').trim();
    if (!nama) {
        throw ApiError.badRequest('Nama ruangan wajib diisi');
    }

    const existing = await Ruangan.findOne({ nama });
    if (existing) {
        throw ApiError.conflict(`Ruangan "${nama}" sudah terdaftar`);
    }

    const ruangan = await Ruangan.create({
        nama,
        keterangan: req.body.keterangan || null
    });

    sendCreated(res, 'Ruangan berhasil ditambahkan', ruangan);
});

/**
 * @desc    Ubah ruangan
 * @route   PUT /api/ruangan/:id
 * @access  Admin
 */
const update = asyncHandler(async (req, res) => {
    const ruangan = await Ruangan.findById(req.params.id);
    if (!ruangan) {
        throw ApiError.notFound('Ruangan tidak ditemukan');
    }

    if (req.body.nama !== undefined) {
        const nama = String(req.body.nama).trim();
        if (!nama) {
            throw ApiError.badRequest('Nama ruangan tidak boleh kosong');
        }
        const duplicate = await Ruangan.findOne({ nama, _id: { $ne: ruangan._id } });
        if (duplicate) {
            throw ApiError.conflict(`Ruangan "${nama}" sudah terdaftar`);
        }
        ruangan.nama = nama;
    }

    if (req.body.keterangan !== undefined) {
        ruangan.keterangan = req.body.keterangan || null;
    }

    if (req.body.isActive !== undefined) {
        ruangan.isActive = Boolean(req.body.isActive);
    }

    await ruangan.save();
    sendSuccess(res, 200, 'Ruangan berhasil diperbarui', ruangan);
});

/**
 * @desc    Hapus ruangan
 * @route   DELETE /api/ruangan/:id
 * @access  Admin
 */
const remove = asyncHandler(async (req, res) => {
    const ruangan = await Ruangan.findById(req.params.id);
    if (!ruangan) {
        throw ApiError.notFound('Ruangan tidak ditemukan');
    }

    await ruangan.deleteOne();
    sendSuccess(res, 200, 'Ruangan berhasil dihapus', null);
});

module.exports = {
    getAll,
    create,
    update,
    remove
};
