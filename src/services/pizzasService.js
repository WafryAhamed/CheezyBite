import api from './apiClient';

export const pizzasService = {
    getAll: async () => {
        return await api.get('/pizzas');
    },

    getById: async (id) => {
        return await api.get(`/pizzas/${id}`);
    },

    // Admin
    create: async (data) => {
        return await api.post('/admin/pizzas', data);
    },

    update: async (id, data) => {
        return await api.put(`/admin/pizzas/${id}`, data);
    },

    delete: async (id) => {
        return await api.delete(`/admin/pizzas/${id}`);
    },

    toggleStatus: async (id) => {
        return await api.patch(`/admin/pizzas/${id}`);
    }
};
