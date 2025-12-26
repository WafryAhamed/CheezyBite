import api from './apiClient';

export const authService = {
    // Register
    register: async (email, password, name) => {
        return await api.post('/auth/register', { email, password, name });
    },

    // Login
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response;
    },

    // Admin Login
    adminLogin: async (username, password) => {
        const response = await api.post('/admin/auth/login', { username, password });
        return response;
    },

    // Logout
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // Ignore error on logout
        }
        // No client-side cleanup needed for httpOnly cookies
        return { success: true };
    },

    // Get Current User (Me)
    getCurrentUser: async () => {
        return await api.get('/auth/me');
    },

    // Request OTP
    requestOtp: async (email, purpose) => {
        const response = await api.post('/auth/otp/request', { email, purpose });
        return response;
    },

    // Verify OTP
    verifyOtp: async (email, purpose, code) => {
        const response = await api.post('/auth/otp/verify', { email, purpose, code });
        return response;
    },

    // Update Profile
    updateProfile: async (updates) => {
        return await api.put('/users/me', updates);
    },

    // Forgot Password
    forgotPassword: async (email) => {
        const response = await api.post('/auth/password/forgot', { email });
        return response;
    },

    // Reset Password
    resetPassword: async (email, token, newPassword) => {
        const response = await api.post('/auth/password/reset', { email, token, newPassword });
        return response;
    }
};
