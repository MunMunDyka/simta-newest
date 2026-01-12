/**
 * ===========================================
 * Auth Service - API Calls
 * ===========================================
 * Service untuk semua API calls terkait authentication
 */

import api, { type ApiResponse } from '../lib/api';

// ===== Types =====
export interface User {
    _id: string;
    id: string;
    nim_nip: string;
    name: string;
    email?: string;
    role: 'mahasiswa' | 'dosen' | 'admin';
    prodi?: string;
    semester?: string;
    judulTA?: string;
    currentProgress?: string;
    dospem_1?: string | { _id: string; name: string; nim_nip: string };
    dospem_2?: string | { _id: string; name: string; nim_nip: string };
    status: 'aktif' | 'nonaktif';
    avatar?: string;
    initials?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginRequest {
    nim_nip: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// ===== Auth API Functions =====

/**
 * Login user
 */
export const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data;
};

/**
 * Get current user profile
 */
export const getMe = async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>('/auth/logout');
    return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (token: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const response = await api.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh', {
        refreshToken: token,
    });
    return response.data;
};

/**
 * Change password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const response = await api.put<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/change-password', data);
    return response.data;
};
