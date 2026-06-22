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
