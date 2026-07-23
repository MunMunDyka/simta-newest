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
    dosenType: 'dospem_1' | 'dospem_2' | 'penguji_1' | 'penguji_2';
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
    draftFeedback?: string;
    draftStatus?: string;
    draftFeedbackFile?: string;
    draftFeedbackFileName?: string;
    hasDraft?: boolean;
    replies?: Reply[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateBimbinganRequest {
    judul: string;
    dosenType: 'dospem_1' | 'dospem_2' | 'penguji_1' | 'penguji_2';
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

export interface FeedbackDraftRequest {
    status?: string;
    feedback?: string;
    feedbackFile?: File;
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
 * Save feedback draft to bimbingan (dosen only)
 */
export const saveFeedbackDraft = async (id: string, data: FeedbackDraftRequest): Promise<ApiResponse<Bimbingan>> => {
    const formData = new FormData();
    if (data.status) formData.append('status', data.status);
    if (data.feedback) formData.append('feedback', data.feedback);
    if (data.feedbackFile) formData.append('feedbackFile', data.feedbackFile);

    const response = await api.put<ApiResponse<Bimbingan>>(`/bimbingan/${id}/draft-feedback`, formData, {
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
 * Download lampiran feedback dari dosen
 */
export const downloadFeedbackFile = async (bimbinganId: string): Promise<Blob> => {
    const response = await api.get(`/bimbingan/download-feedback/${bimbinganId}`, {
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
        penguji_1: { _id: string; name: string; nim_nip: string } | null;
        penguji_2: { _id: string; name: string; nim_nip: string } | null;
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
    progressResetTo?: string | null;
    currentProgress?: string;
    scope: string;
}

export interface BimbinganSettings {
    minBimbinganSempro: number;
    minBimbinganDospem1: number;
    minBimbinganDospem2: number;
    defaultMinBimbinganSempro: number;
    isCustom: boolean;
    mahasiswa?: {
        _id: string;
        name: string;
        nim_nip: string;
    };
}

/**
 * Get admin bimbingan summary for a mahasiswa
 */
export const getAdminBimbinganSummary = async (mahasiswaId: string): Promise<ApiResponse<AdminBimbinganSummary>> => {
    const response = await api.get<ApiResponse<AdminBimbinganSummary>>(`/bimbingan/admin/mahasiswa/${mahasiswaId}`);
    return response.data;
};

/**
 * Get admin bimbingan settings
 */
export const getBimbinganSettings = async (mahasiswaId: string): Promise<ApiResponse<BimbinganSettings>> => {
    const response = await api.get<ApiResponse<BimbinganSettings>>(`/bimbingan/admin/settings/${mahasiswaId}`);
    return response.data;
};

/**
 * Update admin bimbingan settings
 */
export const updateBimbinganSettings = async (
    mahasiswaId: string,
    minBimbinganDospem1: number,
    minBimbinganDospem2: number
): Promise<ApiResponse<BimbinganSettings>> => {
    const response = await api.put<ApiResponse<BimbinganSettings>>(`/bimbingan/admin/settings/${mahasiswaId}`, {
        minBimbinganDospem1,
        minBimbinganDospem2,
    });
    return response.data;
};

/**
 * Clear bimbingan history (admin only, hard delete)
 */
export const clearBimbinganHistory = async (
    mahasiswaId: string,
    dosenType: 'dospem_1' | 'dospem_2' | 'all',
    resetProgress: boolean = false,
    resetProgressTo?: string
): Promise<ApiResponse<ClearBimbinganResult>> => {
    const response = await api.delete<ApiResponse<ClearBimbinganResult>>(
        `/bimbingan/admin/clear/${mahasiswaId}`,
        { params: { dosenType, resetProgress: resetProgress.toString(), ...(resetProgress && resetProgressTo ? { resetProgressTo } : {}) } }
    );
    return response.data;
};

export interface ClearBimbinganGlobalResult {
    deletedBimbingan: number;
    deletedReplies: number;
    deletedFiles: number;
    settingsCleared: number;
    progressReset: boolean;
    progressResetTo: string | null;
}

/**
 * Clear ALL bimbingan history globally (admin only, hard delete)
 */
export const clearAllBimbinganGlobal = async (
    resetProgress: boolean = false,
    resetProgressTo?: string,
    clearSettings: boolean = false
): Promise<ApiResponse<ClearBimbinganGlobalResult>> => {
    const response = await api.delete<ApiResponse<ClearBimbinganGlobalResult>>(
        '/bimbingan/admin/clear-all-global',
        {
            params: {
                resetProgress: resetProgress.toString(),
                clearSettings: clearSettings.toString(),
                ...(resetProgress && resetProgressTo ? { resetProgressTo } : {}),
            }
        }
    );
    return response.data;
};
