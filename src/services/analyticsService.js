import api from './apiClient';

export const analyticsService = {
    getDashboardData: async () => {
        return await api.get('/admin/analytics');
    }
};
