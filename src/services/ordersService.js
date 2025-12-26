import api from './apiClient';

export const ordersService = {
    // User
    create: async (orderData) => {
        return await api.post('/orders', orderData);
    },

    getMyOrders: async () => {
        return await api.get('/orders');
    },

    getById: async (id) => {
        return await api.get(`/orders/${id}`);
    },

    cancel: async (id) => {
        return await api.post(`/orders/${id}/cancel`); // Using POST for action
    },

    // Admin
    getAllAdmin: async () => {
        return await api.get('/admin/orders');
    },

    updateStatus: async (id, stage) => {
        return await api.patch(`/admin/orders/${id}/status`, { currentStage: stage });
    }
};
