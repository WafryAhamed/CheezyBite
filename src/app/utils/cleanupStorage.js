/**
 * Storage Cleanup Utility
 * Ensures fresh state for the application by versioning the local storage.
 */

const APP_VERSION = '1.0.0';
const APP_VERSION_KEY = 'cheezybite_app_version';

const KEYS_TO_CLEAR = [
    'cheezybite_cart',
    'cheezybite_admin_pizzas',
    'cheezybite_admin_toppings',
    'cheezybite_orders',
    'cheezybite_admin_auth',
    'cheezybite_active_order',
    'cheezybite_order_history'
];

export const performCleanup = () => {
    if (typeof window === 'undefined') return;

    try {
        const currentVersion = localStorage.getItem(APP_VERSION_KEY);

        if (currentVersion !== APP_VERSION) {
            console.log(`App version changed from ${currentVersion} to ${APP_VERSION}. Cleaning up old storage...`);

            // Clear all target keys
            KEYS_TO_CLEAR.forEach(key => {
                localStorage.removeItem(key);
            });

            // Set new version
            localStorage.setItem(APP_VERSION_KEY, APP_VERSION);

            console.log('Storage cleanup complete. UI state reset.');
            return true; // Cleanup occurred
        }
    } catch (error) {
        console.error('State cleanup failed:', error);
    }
    return false; // No cleanup needed
};

// Helper for image cache busting
export const getVersionedImage = (src) => {
    if (!src || src.startsWith('http')) return src;
    return `${src}?v=${APP_VERSION}`;
};
