import axios from 'axios';
import toast from 'react-hot-toast';

// Base API Client Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true // Important for httpOnly cookies
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        // Token is primarily handled by httpOnly cookie, 
        // but we can attach it if we have it in localStorage (fallback)
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('jwt_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
    (response) => {
        // Standardize response structure
        // Expecting { success: true, data: ..., message: ... }
        return response.data;
    },
    (error) => {
        const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
        console.error("API Error:", errorMessage);
        return Promise.reject({
            success: false,
            message: errorMessage,
            status: error.response?.status,
            data: error.response?.data
        });
    }
);

export default api;
