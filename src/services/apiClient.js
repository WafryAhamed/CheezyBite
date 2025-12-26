import axios from 'axios';
import toast from 'react-hot-toast';

// Base API Client Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Important for cookies
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        // We rely strictly on httpOnly cookies now.
        // No client-side token attachment needed.
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Standardize response structure
        // Expecting { success: true, data: ..., message: ... }
        return response.data;
    },
    (error) => {
        // Handle network errors (no response from server)
        if (!error.response) {
            console.error('Network Error:', error.message);
            return Promise.reject({
                success: false,
                message: 'Network error. Please check your connection.',
                status: 0,
                data: null
            });
        }

        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred';

        // Silence console errors for functional/expected errors:
        // - Auth failures (401/403)
        // - Validation errors (400) - user input errors
        // - Conflict (409) - "User already exists"
        // - Unprocessable Entity (422) - validation errors
        const isFunctionalError = error.response?.status === 400 ||
            error.response?.status === 401 ||
            error.response?.status === 403 ||
            error.response?.status === 404 ||
            error.response?.status === 409 ||
            error.response?.status === 422 ||
            errorMessage.includes('Invalid token');

        if (!isFunctionalError) {
            console.error('API Error:', errorMessage);
        }

        // Normalize status for "Invalid token" to 401 to ensure proper handling
        const status = errorMessage.includes('Invalid token') ? 401 : error.response?.status;

        return Promise.reject({
            success: false,
            message: errorMessage,
            status: status,
            data: error.response?.data
        });
    }
);

export default apiClient;
