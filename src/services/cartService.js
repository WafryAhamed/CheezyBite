import api from './apiClient';

export const cartService = {
    getCart: async () => {
        return await api.get('/cart');
    },

    syncCart: async (items, merge = false) => {
        return await api.post('/cart', { items, merge });
    },

    clearCart: async () => {
        return await api.delete('/cart');
    }
};
