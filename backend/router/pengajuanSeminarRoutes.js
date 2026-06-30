/**
 * ===========================================
 * Pengajuan Seminar Routes
 * ===========================================
 */

'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const pengajuanSeminarController = require('../controller/pengajuanSeminarController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const ApiError = require('../utils/ApiError');

router.use(authMiddleware);

const pengajuanDir = path.join(__dirname, '..', 'uploads', 'pengajuan-seminar');
if (!fs.existsSync(pengajuanDir)) {
    fs.mkdirSync(pengajuanDir, { recursive: true });
}

const pengajuanStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, pengajuanDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `pengajuan_${req.user._id}_${req.params.jenisPengajuan}_${uniqueSuffix}${path.extname(cleanName)}`);
    }
});

const pengajuanUpload = multer({
    storage: pengajuanStorage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
        if (isPdf) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file PDF yang diperbolehkan untuk berkas pengajuan seminar'));
        }
    }
});

const handlePengajuanUpload = (req, res, next) => {
    pengajuanUpload.single('softcopy')(req, res, (err) => {
        if (!err) {
            next();
            return;
        }

        const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'Ukuran file pengajuan seminar maksimal 25MB'
            : err.message || 'Gagal mengunggah berkas pengajuan seminar';

        next(ApiError.badRequest(message));
    });
};

router.get(
    '/',
    roleMiddleware(['mahasiswa', 'dosen', 'admin']),
    pengajuanSeminarController.getAll
);

router.post(
    '/:jenisPengajuan/upload',
    roleMiddleware(['mahasiswa']),
    handlePengajuanUpload,
    pengajuanSeminarController.upload
);

router.put(
    '/:id/verifikasi',
    roleMiddleware(['admin']),
    pengajuanSeminarController.verifikasi
);

router.get(
    '/download/:fileName',
    roleMiddleware(['mahasiswa', 'dosen', 'admin']),
    pengajuanSeminarController.downloadFile
);

module.exports = router;
