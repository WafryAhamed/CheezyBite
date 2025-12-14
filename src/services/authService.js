import api from './apiClient';

export const authService = {
    // Register
    register: async (email, password, name) => {
        return await api.post('/auth/register', { email, password, name });
    },

    // Login
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        // Optional: Save token if returned in body (fallback for non-cookie clients)
        if (response.success && response.data.token) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('jwt_token', response.data.token);
            }
        }
        return response;
    },

    // Admin Login
    adminLogin: async (username, password) => {
        const response = await api.post('/admin/auth/login', { username, password });
        if (response.success && response.data.token) {
            if (typeof window !== 'undefined') {
                localStorage.setItem('jwt_token', response.data.token);
            }
        }
        return response;
    },

    // Logout
    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // Ignore error on logout
        }
        if (typeof window !== 'undefined') {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('cheezybite_user'); // Clear legacy mock
        }
        return { success: true };
    },

    // Get Current User (Me)
    getCurrentUser: async () => {
        return await api.get('/auth/me');
    },

    // Update Profile
    updateProfile: async (updates) => {
        return await api.put('/users/me', updates);
    }
};
