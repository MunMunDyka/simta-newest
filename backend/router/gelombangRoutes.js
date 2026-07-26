/**
 * ===========================================
 * Gelombang Routes
 * ===========================================
 */

'use strict';

const express = require('express');
const router = express.Router();

const gelombangController = require('../controller/gelombangController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Daftar gelombang dapat dibaca semua role (untuk dropdown & filter jadwal).
router.get('/', gelombangController.getAll);

// CRUD hanya admin.
router.post('/', roleMiddleware(['admin']), gelombangController.create);
router.put('/:id', roleMiddleware(['admin']), gelombangController.update);
router.delete('/:id', roleMiddleware(['admin']), gelombangController.remove);

module.exports = router;
