/**
 * ===========================================
 * SIMTA Backend - Main Application Entry Point
 * ===========================================
 * Sistem Informasi Manajemen Tugas Akhir
 * Institut Teknologi Batam
 */

'use strict';

// ===== 1. Import Dependencies =====
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Load environment variables FIRST before anything else
require('dotenv').config();

// Import custom modules
const connectDatabase = require('./config/database');
const errorMiddleware = require('./middleware/errorMiddleware');
const routes = require('./router');

// ===== 2. Initialize Express App =====
const app = express();

// Custom Request Logger for debugging (logs all requests in CMD, including static files)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[REQ] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// ===== 3. Environment Variables =====
const PORT = process.env.PORT || 7860;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ===== 4. Security & Parsing Middlewares =====

// Helmet - Set security HTTP headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',    // Vite default
    'http://localhost:3000',    // CRA default
    'http://localhost:4173',    // Vite preview
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    ...FRONTEND_URL.split(',').map(url => url.trim())
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || NODE_ENV === 'development') {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'] // For file downloads
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads folder)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== 5. Request Logging (Legacy) =====
// Custom logger at the top handles all request logging now.

// ===== 6. Health Check Endpoint =====
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 SIMTA API is running!',
        version: '1.0.0',
        environment: NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'SIMTA API Health Check OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memoryUsage: process.memoryUsage()
    });
});

// ===== 7. API Routes =====
app.use('/api', routes);

// ===== 8. Handle 404 - Route Not Found =====
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`,
        code: 404,
        suggestion: 'Periksa kembali URL dan method yang digunakan'
    });
});

// ===== 9. Global Error Handler =====
app.use(errorMiddleware);

// ===== 10. Start Server =====
const startServer = async () => {
    try {
        // Connect to database
        await connectDatabase();

        // Start listening
        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════════╗');
            console.log('║                                                            ║');
            console.log('║   🎓 SIMTA Backend API                                     ║');
            console.log('║   Sistem Informasi Manajemen Tugas Akhir                   ║');
            console.log('║                                                            ║');
            console.log('╠════════════════════════════════════════════════════════════╣');
            console.log(`║   🌐 Server    : http://localhost:${PORT}                     ║`);
            console.log(`║   📁 API Base  : http://localhost:${PORT}/api                 ║`);
            console.log(`║   🔧 Mode      : ${NODE_ENV.padEnd(41)}║`);
            console.log('║                                                            ║');
            console.log('╚════════════════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (error) {
        console.error('');
        console.error('╔════════════════════════════════════════════════════════════╗');
        console.error('║   ❌ FATAL ERROR - Server gagal dijalankan                 ║');
        console.error('╚════════════════════════════════════════════════════════════╝');
        console.error('');
        console.error('Error Details:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

// ===== 11. Graceful Shutdown Handling =====
const gracefulShutdown = (signal) => {
    console.log('');
    console.log(`📴 ${signal} received. Shutting down gracefully...`);

    // Close server & database connections
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('');
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('');
    console.error('💥 UNHANDLED REJECTION! Shutting down...');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
});

// Start the server
startServer();

module.exports = app;
