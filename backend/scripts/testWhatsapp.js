/**
 * ===========================================
 * Test WhatsApp Notification
 * ===========================================
 * Script untuk test kirim pesan WhatsApp via Fonnte
 * 
 * Usage: node scripts/testWhatsapp.js [nomor_hp]
 * Example: node scripts/testWhatsapp.js 08123456789
 */

'use strict';

require('dotenv').config();
const axios = require('axios');

// Ambil nomor dari argument atau pakai default
const targetPhone = process.argv[2] || '08123456789';

// Config
const config = {
    enabled: process.env.WHATSAPP_ENABLED === 'true',
    provider: process.env.WHATSAPP_PROVIDER || 'fonnte',
    token: process.env.WHATSAPP_API_TOKEN || ''
};

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   📱 SIMTA - WhatsApp Notification Test                    ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

console.log('📋 Configuration:');
console.log(`   Enabled: ${config.enabled}`);
console.log(`   Provider: ${config.provider}`);
console.log(`   Token: ${config.token ? config.token.substring(0, 5) + '...' : 'NOT SET'}`);
console.log(`   Target: ${targetPhone}`);
console.log('');

if (!config.token) {
    console.log('❌ ERROR: WHATSAPP_API_TOKEN not set in .env');
    console.log('   Please add: WHATSAPP_API_TOKEN=your_token_here');
    process.exit(1);
}

// Test message
const testMessage = `🧪 *Test Notifikasi SIMTA*

Ini adalah pesan test dari Sistem Informasi Manajemen Tugas Akhir (SIMTA).

Jika kamu menerima pesan ini, berarti notifikasi WhatsApp sudah berhasil dikonfigurasi! ✅

📅 Waktu: ${new Date().toLocaleString('id-ID')}`;

async function testSend() {
    console.log('🔄 Sending test message...');
    console.log('');

    try {
        // Normalize phone number
        let phone = targetPhone.replace(/\D/g, '');
        if (phone.startsWith('0')) {
            phone = '62' + phone.substring(1);
        }

        const response = await axios.post(
            'https://api.fonnte.com/send',
            {
                target: phone,
                message: testMessage,
                countryCode: '62'
            },
            {
                headers: {
                    'Authorization': config.token
                }
            }
        );

        console.log('📤 Response from Fonnte:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log('');

        if (response.data.status === true || response.data.detail === 'sent' || response.data.status === 'true') {
            console.log('✅ SUCCESS! Message sent to ' + targetPhone);
            console.log('   Check your WhatsApp!');
        } else {
            console.log('⚠️  Response received but status unclear');
            console.log('   Please check your WhatsApp');
        }

    } catch (error) {
        console.log('❌ ERROR sending message:');
        console.log(`   ${error.message}`);

        if (error.response) {
            console.log('   Response data:', error.response.data);
        }
    }

    console.log('');
    console.log('════════════════════════════════════════════════════════════');
}

testSend();
