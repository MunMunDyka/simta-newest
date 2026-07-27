/**
 * ===========================================
 * UAT Testing Routes (MODULE RAHASIA)
 * ===========================================
 * Hanya aktif bila ENABLE_UAT_MODULE=true, dan hanya untuk admin.
 * Di produksi (flag tidak di-set) seluruh endpoint membalas 404.
 */

'use strict';

const express = require('express');
const router = express.Router();

const uatController = require('../controller/uatTestingController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Gerbang 1: mati total bila flag tidak aktif (seolah route tidak ada).
router.use((req, res, next) => {
    if (process.env.ENABLE_UAT_MODULE !== 'true') {
        return res.status(404).json({ success: false, message: 'Not found' });
    }
    next();
});

// Gerbang 2: harus login sebagai admin.
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/bimbingan-menunggu', uatController.listMenunggu);
router.post('/timeskip', uatController.timeskip);
router.post('/reset', uatController.resetTimestamp);
router.post('/run-check', uatController.runCheck);

module.exports = router;
