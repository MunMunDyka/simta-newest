/**
 * ===========================================
 * Auth Slice - Redux State Management
 * ===========================================
 * Mengelola state authentication: user, tokens, loading
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';
import type { User, LoginRequest } from '../../services/authService';

// ===== State Type =====
interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
}

type ApiErrorResponse = {
    message?: string;
    errors?: Array<{ message?: string }>;
};

// ===== Initial State =====
const initialState: AuthState = {
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
    const err = error as { response?: { data?: ApiErrorResponse } };
    const data = err.response?.data;
    const validationMessage = data?.errors?.find((item) => item.message)?.message;

    return validationMessage || data?.message || fallback;
};

// ===== Async Thunks =====

/**
 * Login thunk
 */
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);

            // Save tokens to localStorage
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            return response.data;
        } catch (error: unknown) {
            return rejectWithValue(getApiErrorMessage(error, 'Login gagal. Periksa kembali username dan password.'));
        }
    }
);

/**
 * Get current user thunk (for checking auth on app load)
 */
export const getMe = createAsyncThunk(
    'auth/getMe',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.getMe();
            return response.data;
        } catch (error: unknown) {
            // Clear tokens if getMe fails
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            return rejectWithValue(getApiErrorMessage(error, 'Session expired'));
        }
    }
);

/**
 * Logout thunk
 */
export const logout = createAsyncThunk(
    'auth/logout',
    async () => {
        try {
            await authService.logout();
        } catch {
            // Ignore error, we're logging out anyway
        } finally {
            // Always clear tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
        return null;
    }
);

/**
 * Initialize auth (check if user is already logged in)
 */
export const initializeAuth = createAsyncThunk(
    'auth/initialize',
    async (_, { dispatch }) => {
        const token = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                // Verify token is still valid
                await dispatch(getMe()).unwrap();
                return true;
            } catch {
                return false;
            }
        }
        return false;
    }
);

// ===== Slice =====
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        toggleActiveRole: (state) => {
            if (state.user && state.user.canAccessAdmin) {
                const currentActive = state.user.activeRole || state.user.role;
                const newRole = currentActive === 'admin' ? 'dosen' : 'admin';
                state.user = { ...state.user, activeRole: newRole };
                localStorage.setItem('activeRole', newRole);
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                const savedActiveRole = localStorage.getItem('activeRole') as 'dosen' | 'admin' | null;
                const user = action.payload.user;
                if (user.canAccessAdmin && savedActiveRole) {
                    user.activeRole = savedActiveRole;
                } else {
                    user.activeRole = user.role;
                    localStorage.removeItem('activeRole');
                }
                state.user = user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })

            // Get Me
            .addCase(getMe.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                const savedActiveRole = localStorage.getItem('activeRole') as 'dosen' | 'admin' | null;
                const user = action.payload;
                if (user.canAccessAdmin && savedActiveRole) {
                    user.activeRole = savedActiveRole;
                } else {
                    user.activeRole = user.role;
                }
                state.user = user;
            })
            .addCase(getMe.rejected, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
            })

            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.error = null;
                localStorage.removeItem('activeRole');
            })

            // Initialize
            .addCase(initializeAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(initializeAuth.fulfilled, (state) => {
                state.isLoading = false;
                state.isInitialized = true;
            })
            .addCase(initializeAuth.rejected, (state) => {
                state.isLoading = false;
                state.isInitialized = true;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError, setUser, toggleActiveRole } = authSlice.actions;
export default authSlice.reducer;
