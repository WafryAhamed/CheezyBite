import bcrypt from 'bcryptjs';
import { verifyToken, extractTokenFromRequest } from './token.js';

export * from './token.js';

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

/**
 * Middleware to verify authentication
 * Returns user/admin data if authenticated, null otherwise
 */
export async function authenticate(request) {
    const token = extractTokenFromRequest(request);

    if (!token) {
        console.log('🔍 authenticate(): No token found in request');
        return null;
    }

    try {
        const decoded = verifyToken(token);
        console.log('✅ authenticate(): Token verified, decoded:', { type: decoded.type, role: decoded.role, userId: decoded.userId, adminId: decoded.adminId });
        return decoded;
    } catch (error) {
        console.log('❌ authenticate(): Token verification failed:', error.message);
        return null; // Return null if verification fails
    }
}

/**
 * Check if user/admin has admin privileges
 */
export function isAdmin(authData) {
    if (!authData || authData.type !== 'admin') {
        return false;
    }
    return ['Super Admin', 'Manager'].includes(authData.role);
}

/**
 * Generate response for authentication error
 */
export function unauthorizedResponse(message = 'Authentication required') {
    return Response.json(
        { success: false, error: message },
        { status: 401 }
    );
}

/**
 * Generate response for forbidden access
 */
export function forbiddenResponse(message = 'Access forbidden') {
    return Response.json(
        { success: false, error: message },
        { status: 403 }
    );
}
