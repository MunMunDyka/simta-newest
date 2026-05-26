type ApiErrorResponse = {
    message?: string;
    errors?: Array<{ message?: string }>;
};

export const getApiErrorMessage = (error: unknown, fallback = 'Terjadi kesalahan. Silakan coba lagi.') => {
    const err = error as {
        response?: {
            data?: ApiErrorResponse;
            status?: number;
        };
        message?: string;
    };

    const data = err.response?.data;
    const validationMessage = data?.errors?.find((item) => item.message)?.message;

    return validationMessage || data?.message || err.message || fallback;
};
