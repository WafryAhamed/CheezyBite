import api from './apiClient';

export const offersService = {
    // Get all active offers for customers
    getActive: async () => {
        return await api.get('/offers');
    },

    // Apply coupon
    apply: async (code, cartTotal) => {
        return await api.post('/offers/apply', { code, cartTotal });
    },

    // Admin: Get all offers
    getAllAdmin: async () => {
        return await api.get('/admin/offers');
    },

    // Admin: Create offer
    create: async (offerData) => {
        return await api.post('/admin/offers', offerData);
    },

    // Admin: Update offer
    update: async (id, offerData) => {
        return await api.patch(`/admin/offers/${id}`, offerData);
    },

    // Admin: Delete offer
    delete: async (id) => {
        return await api.delete(`/admin/offers/${id}`);
    }
};
