import axios from 'axios';

/**
 * Helper to trigger Socket.IO events from Next.js API Routes
 * Calls the separate Express Socket Server via HTTP
 * Gracefully handles socket server unavailability
 */
export async function emitSocketEvent(event, data, room = null) {
    const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'super-secret-internal-key';

    try {
        await axios.post(`${SOCKET_SERVER_URL}/internal/emit`, {
            event,
            data,
            room
        }, {
            headers: {
                'x-internal-secret': INTERNAL_SECRET,
                'Content-Type': 'application/json'
            },
            timeout: 3000 // 3 second timeout
        });
        // Silent success
    } catch (error) {
        // Socket server might not be running - this is non-critical
        // Don't log errors, just silently fail
        // The API request should NOT fail because socket failed
    }
}
