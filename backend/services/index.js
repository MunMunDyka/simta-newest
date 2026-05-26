/**
 * ===========================================
 * Services Index
 * ===========================================
 * Export all service modules
 */

'use strict';

const whatsappService = require('./whatsappService');
const emailService = require('./emailService');

module.exports = {
    whatsappService,
    emailService
};
