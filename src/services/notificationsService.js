import apiClient from './apiClient';

export const notificationsService = {
    getAll: async () => {
        return apiClient.get('/admin/notifications');
    },

    create: async (data) => {
        return apiClient.post('/admin/notifications', data);
    },

    markAllAsRead: async () => {
        return apiClient.patch('/admin/notifications/mark-all-read');
    }
};
