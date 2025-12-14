import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
 * Middleware to verify authentication
 * Returns user/admin data if authenticated, null otherwise
 */
export async function authenticate(request) {
    const token = extractToken(request);

    if (!token) {
        return null;
    }

    try {
        const decoded = verifyToken(token);
        return decoded;
    } catch (error) {
        return null;
    }
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

/**
 * Check if user has admin role
 */
export function isAdmin(user) {
    return user && user.role && ['Super Admin', 'Manager'].includes(user.role);
}
