/**
 * ===========================================
 * Bimbingan Service - API Calls
 * ===========================================
 * Service untuk semua API calls terkait bimbingan
 */

import api, { type ApiResponse } from '../lib/api';
import type { User } from './authService';

// ===== Types =====
export interface Reply {
    _id: string;
    id?: string; // alias for _id
    bimbingan: string;
    sender: {
        _id: string;
        name: string;
        role: string;
    };
    senderRole: 'mahasiswa' | 'dosen';
    message: string;
    createdAt: string;
    timestamp?: string; // alias for formattedTime
    formattedTime?: string;
}

export interface Bimbingan {
    _id: string;
    id?: string; // alias for _id
    mahasiswa: User | string;
    dosen: User | string;
    dosenType: 'dospem_1' | 'dospem_2';
    version: string;
    judul: string;
    catatan?: string;
    fileName: string;
    filePath: string;
    fileSize: string;
    fileOriginalName?: string;
    status: 'menunggu' | 'revisi' | 'acc' | 'lanjut_bab' | 'acc_sempro';
    statusColor?: string;
    feedback?: string;
    feedbackDate?: string;
    tanggalFeedback?: string; // alias for feedbackDate
    tanggalKirim?: string; // alias for createdAt
    feedbackFile?: string;
    feedbackFileName?: string;
    replies?: Reply[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateBimbinganRequest {
    judul: string;
    dosenType: 'dospem_1' | 'dospem_2';
    catatan?: string;
    file: File;
}

export interface FeedbackRequest {
    status: 'revisi' | 'acc' | 'lanjut_bab' | 'acc_sempro';
    feedback: string;
    feedbackFile?: File;
}

export interface ReplyRequest {
    message: string;
}

// ===== Bimbingan API Functions =====

/**
 * Get all bimbingan (filtered by role automatically)
 */
export const getBimbinganList = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    dosenType?: string;
    mahasiswaId?: string;
}): Promise<ApiResponse<Bimbingan[]>> => {
    const response = await api.get<ApiResponse<Bimbingan[]>>('/bimbingan', { params });
    return response.data;
};

/**
 * Get bimbingan by ID
 */
export const getBimbinganById = async (id: string): Promise<ApiResponse<Bimbingan>> => {
    const response = await api.get<ApiResponse<Bimbingan>>(`/bimbingan/${id}`);
    return response.data;
};

/**
 * Create new bimbingan (mahasiswa only)
 */
export const createBimbingan = async (data: CreateBimbinganRequest): Promise<ApiResponse<Bimbingan>> => {
    const formData = new FormData();
    formData.append('judul', data.judul);
    formData.append('dosenType', data.dosenType);
    if (data.catatan) formData.append('catatan', data.catatan);
    formData.append('file', data.file);

    const response = await api.post<ApiResponse<Bimbingan>>('/bimbingan', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Give feedback to bimbingan (dosen only)
 */
export const giveFeedback = async (id: string, data: FeedbackRequest): Promise<ApiResponse<Bimbingan>> => {
    const formData = new FormData();
    formData.append('status', data.status);
    formData.append('feedback', data.feedback);
    if (data.feedbackFile) formData.append('feedbackFile', data.feedbackFile);

    const response = await api.put<ApiResponse<Bimbingan>>(`/bimbingan/${id}/feedback`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Add reply to bimbingan
 */
export const addReply = async (bimbinganId: string, data: ReplyRequest): Promise<ApiResponse<Reply>> => {
    const response = await api.post<ApiResponse<Reply>>(`/bimbingan/${bimbinganId}/reply`, data);
    return response.data;
};

/**
 * Download bimbingan file
 */
export const downloadFile = async (bimbinganId: string): Promise<Blob> => {
    const response = await api.get(`/bimbingan/download/${bimbinganId}`, {
        responseType: 'blob',
    });
    return response.data;
};

/**
 * Get pending bimbingan count (dosen only)
 */
export const getPendingCount = async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get<ApiResponse<{ count: number }>>('/bimbingan/pending-count');
    return response.data;
};

// ===== Admin Bimbingan Functions =====

export interface BimbinganStats {
    total: number;
    menunggu: number;
    revisi: number;
    acc: number;
    lanjut_bab: number;
    acc_sempro: number;
}

export interface AdminBimbinganSummary {
    mahasiswa: {
        _id: string;
        name: string;
        nim_nip: string;
        prodi: string;
        judulTA: string;
        currentProgress: string;
        dospem_1: { _id: string; name: string; nim_nip: string } | null;
        dospem_2: { _id: string; name: string; nim_nip: string } | null;
    };
    dospem1: {
        stats: BimbinganStats;
        bimbingan: Bimbingan[];
    };
    dospem2: {
        stats: BimbinganStats;
        bimbingan: Bimbingan[];
    };
}

export interface ClearBimbinganResult {
    deletedBimbingan: number;
    deletedReplies: number;
    deletedFiles: number;
    progressReset: boolean;
    scope: string;
}

/**
 * Get admin bimbingan summary for a mahasiswa
 */
export const getAdminBimbinganSummary = async (mahasiswaId: string): Promise<ApiResponse<AdminBimbinganSummary>> => {
    const response = await api.get<ApiResponse<AdminBimbinganSummary>>(`/bimbingan/admin/mahasiswa/${mahasiswaId}`);
    return response.data;
};

/**
 * Clear bimbingan history (admin only, hard delete)
 */
export const clearBimbinganHistory = async (
    mahasiswaId: string,
    dosenType: 'dospem_1' | 'dospem_2' | 'all',
    resetProgress: boolean = false
): Promise<ApiResponse<ClearBimbinganResult>> => {
    const response = await api.delete<ApiResponse<ClearBimbinganResult>>(
        `/bimbingan/admin/clear/${mahasiswaId}`,
        { params: { dosenType, resetProgress: resetProgress.toString() } }
    );
    return response.data;
};
