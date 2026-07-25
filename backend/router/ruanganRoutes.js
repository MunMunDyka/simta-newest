/**
 * ===========================================
 * Ruangan Routes
 * ===========================================
 */

'use strict';

const express = require('express');
const router = express.Router();

const ruanganController = require('../controller/ruanganController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Daftar ruangan dapat dibaca semua role (untuk dropdown jadwal).
router.get('/', ruanganController.getAll);

// CRUD hanya admin.
router.post('/', roleMiddleware(['admin']), ruanganController.create);
router.put('/:id', roleMiddleware(['admin']), ruanganController.update);
router.delete('/:id', roleMiddleware(['admin']), ruanganController.remove);

module.exports = router;
