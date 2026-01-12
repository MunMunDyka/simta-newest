/**
 * ===========================================
 * Controllers Index - Export all controllers
 * ===========================================
 */

'use strict';

const authController = require('./authController');
const userController = require('./userController');
const bimbinganController = require('./bimbinganController');
const jadwalController = require('./jadwalController');

module.exports = {
    authController,
    userController,
    bimbinganController,
    jadwalController
};
