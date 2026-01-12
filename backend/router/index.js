/**
 * ===========================================
 * Main Router - Route Aggregator
 * ===========================================
 * Menggabungkan semua route modules
 */

'use strict';

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const bimbinganRoutes = require('./bimbinganRoutes');
const jadwalRoutes = require('./jadwalRoutes');

/**
 * API Route Mapping
 * 
 * /api/auth/*      - Authentication (login, logout, refresh, etc.)
 * /api/users/*     - User management (CRUD, assign dospem, etc.)
 * /api/bimbingan/* - Bimbingan management (submit, feedback, reply)
 * /api/jadwal/*    - Jadwal sidang management
 */

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/bimbingan', bimbinganRoutes);
router.use('/jadwal', jadwalRoutes);

// ===== Health Check Endpoint =====
/**
 * @route   GET /api/health
 * @desc    API Health check
 * @access  Public
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'SIMTA API is healthy!',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())} seconds`,
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// ===== API Info Endpoint =====
/**
 * @route   GET /api
 * @desc    API Information
 * @access  Public
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to SIMTA API',
        version: '1.0.0',
        documentation: {
            endpoints: {
                auth: {
                    'POST /api/auth/login': 'Login with nim_nip and password',
                    'POST /api/auth/logout': 'Logout (requires auth)',
                    'GET /api/auth/me': 'Get current user (requires auth)',
                    'POST /api/auth/refresh': 'Refresh access token',
                    'PUT /api/auth/change-password': 'Change password (requires auth)'
                },
                users: {
                    'GET /api/users': 'Get all users (admin only)',
                    'GET /api/users/:id': 'Get user by ID',
                    'POST /api/users': 'Create user (admin only)',
                    'PUT /api/users/:id': 'Update user',
                    'DELETE /api/users/:id': 'Delete user (admin only)',
                    'PUT /api/users/:id/assign-dospem': 'Assign dosen pembimbing (admin only)',
                    'GET /api/users/mahasiswa-bimbingan': 'Get mahasiswa bimbingan (dosen only)',
                    'GET /api/users/dosen': 'Get all dosen (admin only)',
                    'GET /api/users/statistics': 'Get user statistics (admin only)'
                },
                bimbingan: {
                    'GET /api/bimbingan': 'Get bimbingan list',
                    'GET /api/bimbingan/:id': 'Get bimbingan detail',
                    'POST /api/bimbingan': 'Submit bimbingan (mahasiswa only)',
                    'PUT /api/bimbingan/:id/feedback': 'Give feedback (dosen only)',
                    'POST /api/bimbingan/:id/reply': 'Add reply',
                    'GET /api/bimbingan/download/:id': 'Download file',
                    'GET /api/bimbingan/pending-count': 'Get pending count (dosen only)'
                },
                jadwal: {
                    'GET /api/jadwal': 'Get jadwal list',
                    'GET /api/jadwal/:id': 'Get jadwal detail',
                    'POST /api/jadwal': 'Create jadwal (admin only)',
                    'PUT /api/jadwal/:id': 'Update jadwal (admin only)',
                    'DELETE /api/jadwal/:id': 'Cancel jadwal (admin only)',
                    'GET /api/jadwal/upcoming': 'Get upcoming jadwal',
                    'GET /api/jadwal/statistics': 'Get jadwal statistics (admin only)'
                }
            }
        }
    });
});

module.exports = router;
