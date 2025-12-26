/**
 * Customers Service
 * Admin-only API calls for customer management
 */

import apiClient from './apiClient';

const customersService = {
    /**
     * Get all customers with stats (admin only)
     */
    async getAllAdmin(params = {}) {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const url = `/admin/customers${queryParams ? `?${queryParams}` : ''}`;
            // apiClient already extracts response.data, so response is { success, message, data: {...} }
            const response = await apiClient.get(url);
            return response;
        } catch (error) {
            console.error('customersService.getAllAdmin error:', error);
            throw error;
        }
    },

    /**
     * Get customer details by ID (admin only)
     */
    async getByIdAdmin(customerId) {
        try {
            // apiClient already extracts response.data, so response is { success, message, data: {...} }
            const response = await apiClient.get(`/admin/customers/${customerId}`);
            return response;
        } catch (error) {
            // Let the caller handle the error (e.g. 404)
            throw error;
        }
    }
};

export default customersService;
