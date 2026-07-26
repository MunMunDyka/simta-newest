/**
 * ===========================================
 * Gelombang Controller - CRUD Periode Gelombang Sidang
 * ===========================================
 */

'use strict';

const Gelombang = require('../models/Gelombang');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/responseHelper');

const JENIS_VALID = ['seminar_proposal', 'seminar_hasil'];

/**
 * @desc    Ambil daftar gelombang
 * @route   GET /api/gelombang
 * @access  Private (semua role terautentikasi)
 * @query   includeInactive=true, jenis, tahunAjaran
 */
const getAll = asyncHandler(async (req, res) => {
    const query = req.query.includeInactive === 'true' ? {} : { isActive: true };
    if (req.query.jenis) query.jenis = req.query.jenis;
    if (req.query.tahunAjaran) query.tahunAjaran = req.query.tahunAjaran;

    const gelombang = await Gelombang.find(query).sort({ tahunAjaran: 1, jenis: 1, nomor: 1 });
    sendSuccess(res, 200, 'Data gelombang berhasil diambil', gelombang);
});

// Validasi & normalisasi payload gelombang. Mengembalikan objek terverifikasi.
const parseGelombangPayload = (body) => {
    const jenis = String(body.jenis || '').trim();
    if (!JENIS_VALID.includes(jenis)) {
        throw ApiError.badRequest('Jenis gelombang harus seminar_proposal atau seminar_hasil');
    }

    const tahunAjaran = String(body.tahunAjaran || '').trim();
    if (!tahunAjaran) {
        throw ApiError.badRequest('Tahun ajaran wajib diisi');
    }

    const nomor = Number(body.nomor);
    if (!Number.isInteger(nomor) || nomor < 1) {
        throw ApiError.badRequest('Nomor gelombang harus angka minimal 1');
    }

    const tanggalMulai = new Date(body.tanggalMulai);
    const tanggalSelesai = new Date(body.tanggalSelesai);
    if (isNaN(tanggalMulai.getTime()) || isNaN(tanggalSelesai.getTime())) {
        throw ApiError.badRequest('Tanggal mulai dan selesai wajib diisi dengan benar');
    }
    if (tanggalMulai > tanggalSelesai) {
        throw ApiError.badRequest('Tanggal mulai tidak boleh setelah tanggal selesai');
    }

    return { jenis, tahunAjaran, nomor, tanggalMulai, tanggalSelesai, keterangan: body.keterangan || null };
};

// Pastikan urutan kronologis antar gelombang pada jenis + tahun ajaran yang sama:
// gelombang bernomor lebih besar harus dimulai setelah gelombang sebelumnya berakhir.
const validateChronology = async (data, excludeId) => {
    const query = { jenis: data.jenis, tahunAjaran: data.tahunAjaran };
    if (excludeId) query._id = { $ne: excludeId };
    const sejenis = await Gelombang.find(query);
    for (const g of sejenis) {
        if (g.nomor < data.nomor && data.tanggalMulai <= g.tanggalSelesai) {
            throw ApiError.badRequest(`Tanggal mulai harus setelah Gelombang ${g.nomor} berakhir.`);
        }
        if (g.nomor > data.nomor && data.tanggalSelesai >= g.tanggalMulai) {
            throw ApiError.badRequest(`Tanggal selesai harus sebelum Gelombang ${g.nomor} dimulai.`);
        }
    }
};

/**
 * @desc    Tambah gelombang
 * @route   POST /api/gelombang
 * @access  Admin
 */
const create = asyncHandler(async (req, res) => {
    const data = parseGelombangPayload(req.body);

    const existing = await Gelombang.findOne({ jenis: data.jenis, tahunAjaran: data.tahunAjaran, nomor: data.nomor });
    if (existing) {
        throw ApiError.conflict(`Gelombang ${data.nomor} untuk ${data.tahunAjaran} sudah terdaftar`);
    }

    await validateChronology(data, null);

    const gelombang = await Gelombang.create(data);
    sendCreated(res, 'Gelombang berhasil ditambahkan', gelombang);
});

/**
 * @desc    Ubah gelombang
 * @route   PUT /api/gelombang/:id
 * @access  Admin
 */
const update = asyncHandler(async (req, res) => {
    const gelombang = await Gelombang.findById(req.params.id);
    if (!gelombang) {
        throw ApiError.notFound('Gelombang tidak ditemukan');
    }

    const data = parseGelombangPayload({
        jenis: req.body.jenis ?? gelombang.jenis,
        tahunAjaran: req.body.tahunAjaran ?? gelombang.tahunAjaran,
        nomor: req.body.nomor ?? gelombang.nomor,
        tanggalMulai: req.body.tanggalMulai ?? gelombang.tanggalMulai,
        tanggalSelesai: req.body.tanggalSelesai ?? gelombang.tanggalSelesai,
        keterangan: req.body.keterangan ?? gelombang.keterangan
    });

    const duplicate = await Gelombang.findOne({
        jenis: data.jenis,
        tahunAjaran: data.tahunAjaran,
        nomor: data.nomor,
        _id: { $ne: gelombang._id }
    });
    if (duplicate) {
        throw ApiError.conflict(`Gelombang ${data.nomor} untuk ${data.tahunAjaran} sudah terdaftar`);
    }

    await validateChronology(data, gelombang._id);

    Object.assign(gelombang, data);
    if (req.body.isActive !== undefined) {
        gelombang.isActive = Boolean(req.body.isActive);
    }

    await gelombang.save();
    sendSuccess(res, 200, 'Gelombang berhasil diperbarui', gelombang);
});

/**
 * @desc    Hapus gelombang
 * @route   DELETE /api/gelombang/:id
 * @access  Admin
 */
const remove = asyncHandler(async (req, res) => {
    const gelombang = await Gelombang.findById(req.params.id);
    if (!gelombang) {
        throw ApiError.notFound('Gelombang tidak ditemukan');
    }

    await gelombang.deleteOne();
    sendSuccess(res, 200, 'Gelombang berhasil dihapus', null);
});

module.exports = {
    getAll,
    create,
    update,
    remove
};
