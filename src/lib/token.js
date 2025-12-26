import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cheezybite-jwt-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user/admin
 */
export function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(request) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    return authHeader.substring(7);
}

/**
 * Check if user has admin role
 */
export function isAdmin(user) {
    return user && user.role && ['Super Admin', 'Manager'].includes(user.role);
}

/**
 * Set authentication cookie (httpOnly for security)
 */
export function setAuthCookie(token) {
    return {
        name: 'token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Changed from 'strict' to 'lax' for localhost compatibility
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
    };
}

/**
 * Extract token from cookie or Authorization header
 * Prioritizes httpOnly cookie for security
 */
export function extractTokenFromRequest(request) {
    // Try to get from cookie first (more secure)
    const cookieHeader = request.headers.get('cookie');
    console.log('🔍 extractTokenFromRequest() - Cookie header:', cookieHeader ? `"${cookieHeader.substring(0, 50)}..."` : 'None');
    
    if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {});

        if (cookies.token) {
            console.log('✅ Found token in cookies');
            return cookies.token;
        } else {
            console.log('❌ No token= found in cookies. Available cookies:', Object.keys(cookies));
        }
    }

    // Fallback to Authorization header (for API clients)
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Authorization header:', authHeader ? `"${authHeader.substring(0, 30)}..."` : 'None');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        console.log('✅ Found token in Authorization header');
        return authHeader.substring(7);
    }

    console.log('❌ No token found in cookies or Authorization header');
    return null;
}
