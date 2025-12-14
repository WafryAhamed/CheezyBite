import api from './apiClient';

export const toppingsService = {
    getAll: async () => {
        return await api.get('/toppings');
    },

    // Admin
    create: async (data) => {
        return await api.post('/admin/toppings', data);
    },

    update: async (id, data) => {
        return await api.put(`/admin/toppings/${id}`, data);
    },

    delete: async (id) => {
        return await api.delete(`/admin/toppings/${id}`);
    },

    toggleStatus: async (id) => {
        return await api.patch(`/admin/toppings/${id}`);
    }
};
