/**
 * ===========================================
 * WhatsApp Notification Service
 * ===========================================
 * Service untuk mengirim notifikasi WhatsApp
 * 
 * Mendukung:
 * - Fonnte (fonnte.com) - Murah, lokal
 * - Meta WhatsApp Business API - Official
 * - Custom provider
 * 
 * Setup:
 * 1. Pilih provider dan daftar
 * 2. Isi WHATSAPP_* di file .env
 * 3. Service siap digunakan
 */

'use strict';

const axios = require('axios');

// Configuration from environment
const config = {
    provider: process.env.WHATSAPP_PROVIDER || 'fonnte', // fonnte | meta | disabled
    apiUrl: process.env.WHATSAPP_API_URL || '',
    apiToken: process.env.WHATSAPP_API_TOKEN || '',
    sender: process.env.WHATSAPP_SENDER || '',
    enabled: process.env.WHATSAPP_ENABLED === 'true'
};

/**
 * Send WhatsApp message via Fonnte
 * @param {string} phone - Nomor tujuan (628xxx)
 * @param {string} message - Pesan yang dikirim
 */
const sendViaFonnte = async (phone, message) => {
    const response = await axios.post(
        'https://api.fonnte.com/send',
        {
            target: phone,
            message: message,
            countryCode: '62'
        },
        {
            headers: {
                'Authorization': config.apiToken
            }
        }
    );
    return response.data;
};

/**
 * Send WhatsApp message via Meta Business API
 * @param {string} phone - Nomor tujuan (628xxx)
 * @param {string} message - Pesan yang dikirim
 */
const sendViaMeta = async (phone, message) => {
    // Meta WhatsApp Business API format
    // Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/messages/text-messages
    const response = await axios.post(
        `https://graph.facebook.com/v18.0/${config.sender}/messages`,
        {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phone,
            type: 'text',
            text: {
                preview_url: false,
                body: message
            }
        },
        {
            headers: {
                'Authorization': `Bearer ${config.apiToken}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};

/**
 * Main function - Send WhatsApp notification
 * @param {string} phone - Nomor tujuan (format: 628xxx atau 08xxx)
 * @param {string} message - Pesan yang dikirim
 * @returns {Promise<object>} Response dari API
 */
const sendWhatsApp = async (phone, message) => {
    // Check if WhatsApp is enabled
    if (!config.enabled) {
        console.log('[WhatsApp] Disabled - skipping notification');
        return { success: false, reason: 'disabled' };
    }

    // Check if config is complete
    if (!config.apiToken) {
        console.log('[WhatsApp] No API token configured');
        return { success: false, reason: 'no_token' };
    }

    // Normalize phone number (remove leading 0, add 62)
    let normalizedPhone = phone.replace(/\D/g, ''); // Remove non-digits
    if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '62' + normalizedPhone.substring(1);
    }
    if (!normalizedPhone.startsWith('62')) {
        normalizedPhone = '62' + normalizedPhone;
    }

    try {
        console.log(`[WhatsApp] Sending to ${normalizedPhone} via ${config.provider}`);

        let result;
        switch (config.provider) {
            case 'fonnte':
                result = await sendViaFonnte(normalizedPhone, message);
                break;
            case 'meta':
                result = await sendViaMeta(normalizedPhone, message);
                break;
            default:
                console.log('[WhatsApp] Unknown provider:', config.provider);
                return { success: false, reason: 'unknown_provider' };
        }

        console.log('[WhatsApp] Sent successfully:', result);

        // Check Fonnte specific response - status: false means failed
        if (config.provider === 'fonnte' && result.status === false) {
            console.log('[WhatsApp] Fonnte reported failure:', result.reason);
            return { success: false, reason: result.reason || 'fonnte_error', data: result };
        }

        return { success: true, data: result };

    } catch (error) {
        console.error('[WhatsApp] Error sending message:', error.message);
        // Don't throw - notification failure shouldn't break main flow
        return { success: false, error: error.message };
    }
};

// ===== Notification Templates =====

/**
 * Notify dosen when mahasiswa uploads bimbingan
 */
const notifyDosenBimbinganBaru = async (dosenPhone, mahasiswaNama, catatan) => {
    const message = `📚 *SIMTA - Bimbingan Baru*

Mahasiswa: ${mahasiswaNama}
Catatan: ${catatan || '-'}

Silakan login ke SIMTA untuk review.`;

    return sendWhatsApp(dosenPhone, message);
};

/**
 * Notify mahasiswa when dosen gives feedback
 */
const notifyMahasiswaFeedback = async (mahasiswaPhone, dosenNama, status, feedback) => {
    const statusEmoji = {
        'ACC': '✅',
        'Revisi': '🔄',
        'Lanjut Bab': '📖'
    };

    const message = `${statusEmoji[status] || '📝'} *SIMTA - Feedback Bimbingan*

Dosen: ${dosenNama}
Status: ${status}
${feedback ? `Catatan: ${feedback}` : ''}

Login ke SIMTA untuk detail.`;

    return sendWhatsApp(mahasiswaPhone, message);
};

/**
 * Notify mahasiswa & penguji when jadwal sidang created
 */
const notifyJadwalSidang = async (phone, nama, role, tanggal, waktu, ruangan) => {
    const roleText = role === 'mahasiswa' ? 'Anda' : `Anda sebagai Penguji untuk mahasiswa ${nama}`;

    const message = `📅 *SIMTA - Jadwal Sidang*

${roleText} telah dijadwalkan sidang:

📆 Tanggal: ${tanggal}
⏰ Waktu: ${waktu}
🏫 Ruangan: ${ruangan}

Harap hadir 15 menit sebelum jadwal.`;

    return sendWhatsApp(phone, message);
};

/**
 * Reminder before sidang (H-3)
 */
const notifyReminderSidang = async (phone, nama, tanggal, waktu, ruangan) => {
    const message = `⏰ *SIMTA - Pengingat Sidang*

Halo ${nama},

Sidang Anda tinggal 3 hari lagi!

📆 Tanggal: ${tanggal}
⏰ Waktu: ${waktu}
🏫 Ruangan: ${ruangan}

Pastikan semua dokumen sudah siap.`;

    return sendWhatsApp(phone, message);
};

module.exports = {
    sendWhatsApp,
    notifyDosenBimbinganBaru,
    notifyMahasiswaFeedback,
    notifyJadwalSidang,
    notifyReminderSidang
};
