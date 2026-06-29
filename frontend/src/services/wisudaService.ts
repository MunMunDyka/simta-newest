/**
 * ===========================================
 * Wisuda Service - API Calls
 * ===========================================
 * Service untuk semua API calls terkait Persiapan Wisuda
 */

import api, { type ApiResponse } from '../lib/api';
import { type User } from './authService';

/**
 * Upload dokumen wisuda (PDF files)
 * @param formData - FormData containing skripsiFull, pptSkripsi, halamanPengesahan, formBimbingan
 */
export const uploadWisuda = async (formData: FormData): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>('/users/upload-wisuda', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const getWisudaFileName = (filePath: string): string => {
    return filePath.replace(/\\/g, '/').split('/').pop() || filePath;
};

const fetchWisudaFileBlob = async (filePath: string): Promise<{ blob: Blob; fileName: string }> => {
    const fileName = getWisudaFileName(filePath);
    const response = await api.get(`/users/wisuda-download/${encodeURIComponent(fileName)}`, {
        responseType: 'blob',
    });

    return {
        blob: new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' }),
        fileName,
    };
};

/**
 * Download dokumen wisuda menggunakan authenticated API request.
 * Link biasa tidak membawa Authorization header, sehingga route protected akan mengembalikan 401.
 */
export const downloadWisudaFile = async (filePath: string, fallbackFileName?: string): Promise<void> => {
    const { blob, fileName } = await fetchWisudaFileBlob(filePath);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fallbackFileName || fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

/**
 * Buka dokumen wisuda di tab baru menggunakan authenticated API request.
 */
export const previewWisudaFile = async (filePath: string): Promise<void> => {
    const { blob } = await fetchWisudaFileBlob(filePath);
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
};

/**
 * Verifikasi dokumen wisuda oleh Admin
 * @param mahasiswaId - ID mahasiswa yang diverifikasi
 * @param statusVerifikasi - 'disetujui' atau 'ditolak'
 * @param catatanAdmin - Catatan/alasan (wajib jika ditolak)
 */
export const verifikasiWisuda = async (
    mahasiswaId: string,
    statusVerifikasi: 'disetujui' | 'ditolak',
    catatanAdmin?: string
): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>(`/users/${mahasiswaId}/verifikasi-wisuda`, {
        statusVerifikasi,
        catatanAdmin,
    });
    return response.data;
};
