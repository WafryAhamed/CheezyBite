/**
 * Validation utilities for API inputs
 */

/**
 * Email validation
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Password validation
 * At least 6 characters
 */
export function isValidPassword(password) {
    return password && password.length >= 6;
}

/**
 * Phone number validation (Sri Lankan format)
 * Accepts: +94771234567, 0771234567, 771234567
 */
export function isValidPhone(phone) {
    if (!phone) return false;
    const phoneRegex = /^(\+94|0)?[0-9]{9,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate required fields
 */
export function validateRequiredFields(data, requiredFields) {
    const errors = {};

    requiredFields.forEach(field => {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            errors[field] = `${field} is required`;
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validate user registration data
 */
export function validateUserRegistration(data) {
    const { email, password, name } = data;
    const errors = {};

    if (!email || !isValidEmail(email)) {
        errors.email = 'Valid email is required';
    }

    if (!password || !isValidPassword(password)) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (!name || name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validate user login data
 */
export function validateUserLogin(data) {
    const { email, password } = data;
    const errors = {};

    if (!email || !isValidEmail(email)) {
        errors.email = 'Valid email is required';
    }

    if (!password) {
        errors.password = 'Password is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validate admin login data
 */
export function validateAdminLogin(data) {
    const { username, password } = data;
    const errors = {};

    if (!username || username.trim().length < 3) {
        errors.username = 'Username is required';
    }

    if (!password) {
        errors.password = 'Password is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validate pizza data
 */
export function validatePizzaData(data) {
    const { name, description, priceSm, priceMd, priceLg, category } = data;
    const errors = {};

    if (!name || name.trim().length < 3) {
        errors.name = 'Pizza name must be at least 3 characters';
    }

    if (!description || description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters';
    }

    if (!priceSm || priceSm < 0) {
        errors.priceSm = 'Valid small price is required';
    }

    if (!priceMd || priceMd < 0) {
        errors.priceMd = 'Valid medium price is required';
    }

    if (!priceLg || priceLg < 0) {
        errors.priceLg = 'Valid large price is required';
    }

    if (!category) {
        errors.category = 'Category is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validate topping data
 */
export function validateToppingData(data) {
    const { name, price } = data;
    const errors = {};

    if (!name || name.trim().length < 2) {
        errors.name = 'Topping name must be at least 2 characters';
    }

    if (price === undefined || price < 0) {
        errors.price = 'Valid price is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Validate order data
 */
export function validateOrderData(data) {
    const { items, total, address, paymentMethod } = data;
    const errors = {};

    if (!items || !Array.isArray(items) || items.length === 0) {
        errors.items = 'Order must contain at least one item';
    }

    if (!total || total < 0) {
        errors.total = 'Valid total is required';
    }

    if (!address || !address.street || !address.city) {
        errors.address = 'Valid delivery address is required';
    }

    if (!paymentMethod || !['card', 'cash', 'wallet'].includes(paymentMethod)) {
        errors.paymentMethod = 'Valid payment method is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
}
