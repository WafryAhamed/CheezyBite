export const isValidLuhn = (number) => {
    if (!number) return false;
    const sanitized = number.replace(/\D/g, '');
    if (sanitized.length !== 16) return false; // Strict 16 digit requirement as requested

    let sum = 0;
    let shouldDouble = false;

    // Loop through values starting from the rightmost digit
    for (let i = sanitized.length - 1; i >= 0; i--) {
        let digit = parseInt(sanitized.charAt(i));

        if (shouldDouble) {
            if ((digit *= 2) > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return (sum % 10) === 0;
};

export const isValidExpiry = (expiry) => {
    if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) return false;

    const [monthStr, yearStr] = expiry.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt('20' + yearStr, 10); // Assume 20XX

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
};

export const isValidCVV = (cvv) => {
    return /^\d{3}$/.test(cvv);
};

export const isValidName = (name) => {
    if (!name) return false;
    return name.trim().length >= 3 && /^[A-Za-z\s]+$/.test(name);
};

export const validateCardField = (name, value, allData = {}) => {
    switch (name) {
        case 'number':
            if (!value) return "Card number is required";
            if (!isValidLuhn(value)) return "Invalid card number. Please check and try again.";
            return null;
        case 'expiry':
            if (!value) return "Expiry date is required";
            if (!isValidExpiry(value)) return "Card has expired or date is invalid.";
            return null;
        case 'cvv':
            if (!value) return "CVV is required";
            if (!isValidCVV(value)) return "Invalid CVV.";
            return null;
        case 'name':
            if (!value) return "Cardholder name is required";
            if (!isValidName(value)) return "Enter cardholder name as shown on card.";
            return null;
        default:
            return null;
    }
};
