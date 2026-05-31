/**
 * ===========================================
 * Email Notification Service
 * ===========================================
 * Service untuk mengirim notifikasi email transactional.
 *
 * Provider: Resend / SMTP
 */

'use strict';

const axios = require('axios');
const nodemailer = require('nodemailer');

const parseBoolean = (value) => {
    if (typeof value === 'boolean') return value;

    return ['true', '1', 'yes', 'on', 'enable', 'enabled'].includes(
        String(value || '').trim().toLowerCase()
    );
};

const config = {
    provider: process.env.EMAIL_PROVIDER || 'resend',
    enabled: parseBoolean(process.env.EMAIL_ENABLED),
    from: process.env.EMAIL_FROM || 'SIMTA <noreply@example.com>',
    resendApiKey: process.env.RESEND_API_KEY || '',
    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 465),
        secure: parseBoolean(process.env.SMTP_SECURE ?? 'true'),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
    },
    appUrl: process.env.APP_URL || 'https://simta-iteba-demo.netlify.app/'
};

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const maskEmail = (email = '') => {
    const [name, domain] = String(email).split('@');
    if (!name || !domain) return email ? '[invalid-email]' : '-';

    return `${name.slice(0, 2)}***@${domain}`;
};

const formatRecipients = (to) => {
    const recipients = Array.isArray(to) ? to : [to];
    return recipients.map(maskEmail).join(', ');
};

const getStatusBadgeStyle = (status = '') => {
    const normalized = String(status).toLowerCase();

    if (normalized.includes('acc sidang') || normalized.includes('acc sempro')) {
        return 'background:#f3e8ff;color:#7e22ce;border:1px solid #d8b4fe;';
    }

    if (normalized.includes('acc')) {
        return 'background:#dcfce7;color:#15803d;border:1px solid #86efac;';
    }

    if (normalized.includes('revisi')) {
        return 'background:#fee2e2;color:#b91c1c;border:1px solid #fecaca;';
    }

    if (normalized.includes('lanjut')) {
        return 'background:#dbeafe;color:#1d4ed8;border:1px solid #bfdbfe;';
    }

    return 'background:#f1f5f9;color:#334155;border:1px solid #e2e8f0;';
};

const logEmailDebug = ({ to, subject }) => {
    console.log('[Email Debug] Config:', {
        enabled: config.enabled,
        provider: config.provider,
        from: config.from,
        recipients: formatRecipients(to),
        subject,
        appUrl: config.appUrl,
        smtp: config.provider === 'smtp'
            ? {
                host: config.smtp.host,
                port: config.smtp.port,
                secure: config.smtp.secure,
                user: maskEmail(config.smtp.user),
                hasPassword: Boolean(config.smtp.pass)
            }
            : undefined,
        resend: config.provider === 'resend'
            ? {
                hasApiKey: Boolean(config.resendApiKey)
            }
            : undefined
    });
};

const renderEmailLayout = ({ title, intro, rows = [], closing }) => {
    const rowHtml = rows
        .filter((row) => row.value !== undefined && row.value !== null && row.value !== '')
        .map((row) => {
            const isStatus = String(row.label).toLowerCase() === 'status';
            const valueHtml = isStatus
                ? `<span style="display:inline-block;padding:5px 10px;border-radius:999px;font-size:12px;font-weight:700;line-height:1;${getStatusBadgeStyle(row.value)}">${escapeHtml(row.value)}</span>`
                : escapeHtml(row.value);

            return `
            <tr>
                <td style="padding:8px 0;color:#64748b;font-size:14px;width:120px;">${escapeHtml(row.label)}</td>
                <td style="padding:8px 0;color:#0f172a;font-size:14px;font-weight:600;">${valueHtml}</td>
            </tr>
        `;
        })
        .join('');

    return `
<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:560px;margin:0 auto;padding:28px 16px;">
        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:28px;box-shadow:0 8px 24px rgba(15,23,42,0.06);">
            <p style="margin:0 0 8px;color:#2563eb;font-size:13px;font-weight:700;letter-spacing:.04em;">SIMTA</p>
            <h1 style="margin:0 0 12px;color:#0f172a;font-size:22px;line-height:1.35;">${escapeHtml(title)}</h1>
            <p style="margin:0 0 20px;color:#334155;font-size:15px;line-height:1.6;">${escapeHtml(intro)}</p>
            ${rowHtml ? `<table role="presentation" style="width:100%;border-collapse:collapse;margin:4px 0 22px;">${rowHtml}</table>` : ''}
            <a href="${escapeHtml(config.appUrl)}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 18px;border-radius:10px;">Buka SIMTA</a>
            <p style="margin:18px 0 0;color:#64748b;font-size:13px;line-height:1.6;">${escapeHtml(closing)}<br>
            Jika tombol tidak bisa dibuka, salin link ini: <a href="${escapeHtml(config.appUrl)}" style="color:#2563eb;">${escapeHtml(config.appUrl)}</a></p>
        </div>
    </div>
</body>
</html>`;
};

const sendViaResend = async ({ to, subject, text, html }) => {
    const response = await axios.post(
        'https://api.resend.com/emails',
        {
            from: config.from,
            to: Array.isArray(to) ? to : [to],
            subject,
            text,
            ...(html ? { html } : {})
        },
        {
            headers: {
                Authorization: `Bearer ${config.resendApiKey}`,
                'Content-Type': 'application/json'
            }
        }
    );

    return response.data;
};

const sendViaSmtp = async ({ to, subject, text, html }) => {
    const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass
        }
    });

    return transporter.sendMail({
        from: config.from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text,
        ...(html ? { html } : {})
    });
};

const sendEmail = async ({ to, subject, text, html }) => {
    logEmailDebug({ to, subject });

    if (!config.enabled) {
        console.log('[Email] Disabled - skipping notification');
        return { success: false, reason: 'disabled' };
    }

    if (!to) {
        console.log('[Email] No recipient configured');
        return { success: false, reason: 'no_recipient' };
    }

    if (config.provider === 'resend' && !config.resendApiKey) {
        console.log('[Email] No Resend API key configured');
        return { success: false, reason: 'no_api_key' };
    }

    if (config.provider === 'smtp' && (!config.smtp.user || !config.smtp.pass)) {
        console.log('[Email] SMTP credentials are not configured');
        return { success: false, reason: 'no_smtp_credentials' };
    }

    try {
        console.log(`[Email] Sending to ${formatRecipients(to)} via ${config.provider}`);

        let result;
        switch (config.provider) {
            case 'resend':
                result = await sendViaResend({ to, subject, text, html });
                break;
            case 'smtp':
                result = await sendViaSmtp({ to, subject, text, html });
                break;
            default:
                console.log('[Email] Unknown provider:', config.provider);
                return { success: false, reason: 'unknown_provider' };
        }

        console.log('[Email] Sent successfully:', {
            provider: config.provider,
            messageId: result?.messageId || result?.id || '-',
            response: result?.response || undefined
        });
        return { success: true, data: result };
    } catch (error) {
        const smtpError = {
            message: error.message,
            code: error.code,
            command: error.command,
            responseCode: error.responseCode,
            response: error.response
        };
        console.error('[Email] Error sending message:', error.response?.data || smtpError);
        return { success: false, error: error.response?.data?.message || error.message };
    }
};

const notifyDosenBimbinganBaruEmail = async (dosenEmail, mahasiswaNama, judul, catatan) => {
    const subject = 'SIMTA - Bimbingan Baru Menunggu Review';
    const text = `SIMTA - Bimbingan Baru

Mahasiswa: ${mahasiswaNama}
Judul: ${judul || '-'}
Catatan: ${catatan || '-'}

Silakan login ke SIMTA untuk melakukan review:
${config.appUrl}`;

    const html = renderEmailLayout({
        title: 'Bimbingan Baru Menunggu Review',
        intro: 'Ada pengajuan bimbingan baru yang perlu Bapak/Ibu review.',
        rows: [
            { label: 'Mahasiswa', value: mahasiswaNama },
            { label: 'Judul', value: judul || '-' },
            { label: 'Catatan', value: catatan || '-' }
        ],
        closing: 'Silakan login ke SIMTA untuk melakukan review.'
    });

    return sendEmail({ to: dosenEmail, subject, text, html });
};

const notifyMahasiswaFeedbackEmail = async (mahasiswaEmail, dosenNama, status, feedback) => {
    const subject = `SIMTA - Feedback Bimbingan (${status})`;
    const text = `SIMTA - Feedback Bimbingan

Dosen: ${dosenNama}
Status: ${status}
Catatan: ${feedback || '-'}

Silakan login ke SIMTA untuk melihat detail feedback:
${config.appUrl}`;

    const html = renderEmailLayout({
        title: `Feedback Bimbingan (${status})`,
        intro: 'Dosen pembimbing telah memberikan feedback untuk bimbingan Anda.',
        rows: [
            { label: 'Dosen', value: dosenNama },
            { label: 'Status', value: status },
            { label: 'Catatan', value: feedback || '-' }
        ],
        closing: 'Silakan login ke SIMTA untuk melihat detail feedback.'
    });

    return sendEmail({ to: mahasiswaEmail, subject, text, html });
};

const notifyJadwalSidangEmail = async (email, nama, role, tanggal, waktu, ruangan) => {
    const subject = 'SIMTA - Jadwal Sidang';
    const roleText = role === 'mahasiswa'
        ? `Halo ${nama}, jadwal sidang Anda telah dibuat.`
        : `Anda ditunjuk sebagai penguji untuk mahasiswa ${nama}.`;
    const text = `SIMTA - Jadwal Sidang

${roleText}

Tanggal: ${tanggal}
Waktu: ${waktu}
Ruangan: ${ruangan}

Harap hadir sesuai jadwal yang telah ditentukan.

Login SIMTA:
${config.appUrl}`;

    const html = renderEmailLayout({
        title: 'Jadwal Sidang',
        intro: roleText,
        rows: [
            { label: 'Tanggal', value: tanggal },
            { label: 'Waktu', value: waktu },
            { label: 'Ruangan', value: ruangan }
        ],
        closing: 'Harap hadir sesuai jadwal yang telah ditentukan.'
    });

    return sendEmail({ to: email, subject, text, html });
};

module.exports = {
    sendEmail,
    notifyDosenBimbinganBaruEmail,
    notifyMahasiswaFeedbackEmail,
    notifyJadwalSidangEmail
};
