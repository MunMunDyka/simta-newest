/**
 * ===========================================
 * UAT Testing Controller (MODULE RAHASIA)
 * ===========================================
 * Alat bantu UAT untuk menguji fitur "feedback tak dibalas 5 hari -> pengajuan
 * bimbingan gagal" tanpa menunggu 5 hari nyata.
 *
 * Cara kerja: menggeser `createdAt` sebuah bimbingan uji sehingga jatuh temponya
 * hanya beberapa menit dari sekarang, lalu memanggil fungsi kedaluwarsa ASLI.
 * Logika deadline (aturan 5 hari) TIDAK diubah sama sekali.
 *
 * Module ini hanya aktif bila ENABLE_UAT_MODULE=true dan hanya untuk admin.
 */

'use strict';

const Bimbingan = require('../models/Bimbingan');
const { expireStaleBimbingan } = require('./bimbinganController');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/responseHelper');

const FEEDBACK_DEADLINE_DAYS = parseInt(process.env.FEEDBACK_DEADLINE_DAYS, 10) || 5;
const DEADLINE_MS = FEEDBACK_DEADLINE_DAYS * 24 * 60 * 60 * 1000;

// Kembalikan info jatuh tempo sebuah bimbingan (createdAt + deadline).
const decorate = (b) => {
    const created = new Date(b.createdAt).getTime();
    const expireAt = new Date(created + DEADLINE_MS);
    return {
        _id: b._id,
        mahasiswa: b.mahasiswa ? { name: b.mahasiswa.name, nim_nip: b.mahasiswa.nim_nip } : null,
        dosen: b.dosen ? { name: b.dosen.name } : null,
        dosenType: b.dosenType,
        judul: b.judul || null,
        createdAt: b.createdAt,
        expireAt,
        sisaDetik: Math.max(0, Math.round((expireAt.getTime() - Date.now()) / 1000))
    };
};

/**
 * @desc    Daftar bimbingan status "menunggu" (kandidat uji)
 * @route   GET /api/uat/bimbingan-menunggu
 */
const listMenunggu = asyncHandler(async (req, res) => {
    const data = await Bimbingan.find({ status: 'menunggu' })
        .populate('mahasiswa', 'name nim_nip')
        .populate('dosen', 'name')
        .sort({ createdAt: -1 });
    sendSuccess(res, 200, 'Daftar bimbingan menunggu', data.map(decorate));
});

/**
 * @desc    Mulai countdown: geser createdAt agar jatuh tempo `minutes` dari sekarang
 * @route   POST /api/uat/timeskip
 * @body    { bimbinganId, minutes }
 */
const timeskip = asyncHandler(async (req, res) => {
    const { bimbinganId } = req.body;
    const minutes = Number(req.body.minutes);
    if (!bimbinganId) throw ApiError.badRequest('bimbinganId wajib diisi');
    if (!Number.isFinite(minutes) || minutes < 0) throw ApiError.badRequest('minutes harus angka >= 0');

    const b = await Bimbingan.findById(bimbinganId);
    if (!b) throw ApiError.notFound('Bimbingan tidak ditemukan');
    if (b.status !== 'menunggu') throw ApiError.badRequest('Hanya bimbingan status "menunggu" yang bisa diuji');

    // createdAt = sekarang - (deadline - menit) -> jatuh tempo `minutes` dari sekarang
    const newCreatedAt = new Date(Date.now() - DEADLINE_MS + minutes * 60 * 1000);
    await Bimbingan.updateOne({ _id: b._id }, { $set: { createdAt: newCreatedAt } }, { timestamps: false });

    const updated = await Bimbingan.findById(b._id).populate('mahasiswa', 'name nim_nip').populate('dosen', 'name');
    sendSuccess(res, 200, `Countdown dimulai (~${minutes} menit)`, decorate(updated));
});

/**
 * @desc    Reset createdAt bimbingan ke waktu sekarang (batalkan countdown)
 * @route   POST /api/uat/reset
 * @body    { bimbinganId }
 */
const resetTimestamp = asyncHandler(async (req, res) => {
    const { bimbinganId } = req.body;
    if (!bimbinganId) throw ApiError.badRequest('bimbinganId wajib diisi');

    const b = await Bimbingan.findById(bimbinganId);
    if (!b) throw ApiError.notFound('Bimbingan tidak ditemukan');

    await Bimbingan.updateOne({ _id: b._id }, { $set: { createdAt: new Date() } }, { timestamps: false });

    const updated = await Bimbingan.findById(b._id).populate('mahasiswa', 'name nim_nip').populate('dosen', 'name');
    sendSuccess(res, 200, 'createdAt direset ke sekarang', decorate(updated));
});

/**
 * @desc    Jalankan pengecekan deadline ASLI (hapus yang kedaluwarsa)
 * @route   POST /api/uat/run-check
 */
const runCheck = asyncHandler(async (req, res) => {
    const dihapus = await expireStaleBimbingan();
    sendSuccess(res, 200, 'Pengecekan deadline dijalankan', { dihapus });
});

module.exports = {
    listMenunggu,
    timeskip,
    resetTimestamp,
    runCheck
};
