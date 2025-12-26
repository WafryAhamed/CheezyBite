/**
 * LocalStorage Helper - Safe cart persistence
 * Handles SSR and data corruption gracefully
 */

const CART_STORAGE_KEY = 'cheezybite_guest_cart';

/**
 * Check if we're in browser environment (not SSR)
 * @returns {boolean}
 */
const isBrowser = () => typeof window !== 'undefined';

/**
 * Save cart to localStorage
 * @param {Array} cart - Cart items array
 * @returns {boolean} Success status
 */
export function saveCart(cart) {
    if (!isBrowser()) return false;

    try {
        const cartData = JSON.stringify(cart);
        localStorage.setItem(CART_STORAGE_KEY, cartData);
        return true;
    } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
        return false;
    }
}

/**
 * Load cart from localStorage
 * @returns {Array} Cart items or empty array if error
 */
export function loadCart() {
    if (!isBrowser()) return [];

    try {
        const cartData = localStorage.getItem(CART_STORAGE_KEY);

        if (!cartData) return [];

        const parsedCart = JSON.parse(cartData);

        // Validate that it's an array
        if (!Array.isArray(parsedCart)) {
            console.warn('Invalid cart data in localStorage, resetting...');
            clearCart();
            return [];
        }

        return parsedCart;
    } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        // Clear corrupted data
        clearCart();
        return [];
    }
}

/**
 * Clear cart from localStorage
 * @returns {boolean} Success status
 */
export function clearCart() {
    if (!isBrowser()) return false;

    try {
        localStorage.removeItem(CART_STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Failed to clear cart from localStorage:', error);
        return false;
    }
}

/**
 * Check if cart exists in localStorage
 * @returns {boolean}
 */
export function hasStoredCart() {
    if (!isBrowser()) return false;

    try {
        const cartData = localStorage.getItem(CART_STORAGE_KEY);
        return cartData !== null;
    } catch (error) {
        return false;
    }
}

export default {
    saveCart,
    loadCart,
    clearCart,
    hasStoredCart,
};
