/**
 * ===========================================
 * API Configuration - Axios Instance
 * ===========================================
 * Konfigurasi axios dengan interceptors untuk
 * handling token dan error responses
 * Includes retry logic for unstable connections
 */

import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosRequestConfig } from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://lymun-simta.hf.space/api';

// Retry Configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay

// Create axios instance with longer timeout for slow servers
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // Increased to 60 seconds for slow servers
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// ===== Request Interceptor =====
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage
        const token = localStorage.getItem('accessToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// ===== Response Interceptor with Retry Logic =====
api.interceptors.response.use(
    (response) => {
        // Return data directly for convenience
        return response;
    },
    async (error: AxiosError<{ message: string; code: number }>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
            _retryCount?: number;
        };

        // Get current retry count
        const retryCount = originalRequest._retryCount || 0;

        // Check if we should retry (network errors, timeouts, 5xx errors)
        const shouldRetry =
            !originalRequest._retry && // Not a token refresh retry
            retryCount < MAX_RETRIES && // Haven't exceeded max retries
            (
                !error.response || // Network error (no response)
                error.code === 'ECONNABORTED' || // Timeout
                (error.response.status >= 500 && error.response.status < 600) // Server errors
            );

        if (shouldRetry) {
            originalRequest._retryCount = retryCount + 1;

            // Calculate delay with exponential backoff
            const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount);

            console.log(`🔄 Retry attempt ${retryCount + 1}/${MAX_RETRIES} after ${delay}ms...`);

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));

            return api(originalRequest);
        }

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    // Try to refresh token
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    // Save new tokens
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, clear tokens and redirect to login
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/';
            }
        }

        // Return error for handling in components
        return Promise.reject(error);
    }
);

export default api;

// ===== Retry Helper for Custom Requests =====
/**
 * Make API request with custom retry logic
 * Useful for file downloads and critical operations
 */
export const apiWithRetry = async <T>(
    config: AxiosRequestConfig,
    maxRetries: number = 3,
    onRetry?: (attempt: number, maxRetries: number) => void
): Promise<T> => {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await api.request<T>(config);
            return response.data;
        } catch (error) {
            lastError = error as Error;

            // Don't retry on 4xx errors (client errors)
            if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
                throw error;
            }

            if (attempt < maxRetries) {
                const delay = RETRY_DELAY_BASE * Math.pow(2, attempt - 1);
                console.log(`🔄 Custom retry ${attempt}/${maxRetries} after ${delay}ms...`);

                if (onRetry) {
                    onRetry(attempt, maxRetries);
                }

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
};

// ===== Helper Types =====
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    code: number;
    data: T;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface ApiError {
    success: false;
    message: string;
    code: number;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}

