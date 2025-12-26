/**
 * Date Formatting Utilities
 * Standardized date/time formatting for CheezyBite
 * 
 * Format Standards:
 * - Date: DD MMM YYYY (e.g., "18 Sep 2025")
 * - Time: hh:mm A (e.g., "07:42 PM")
 * - DateTime: DD MMM YYYY, hh:mm A
 */

/**
 * Format date in DD MMM YYYY format
 * @param {Date|string|number} date - Date object, ISO string, or timestamp
 * @returns {string} Formatted date (e.g., "18 Sep 2025")
 */
export function formatDate(date) {
    if (!date) return 'N/A';
    
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        
        const day = d.getDate().toString().padStart(2, '0');
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const year = d.getFullYear();
        
        return `${day} ${month} ${year}`;
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'N/A';
    }
}

/**
 * Format time in hh:mm A format (12-hour)
 * @param {Date|string|number} date - Date object, ISO string, or timestamp
 * @returns {string} Formatted time (e.g., "07:42 PM")
 */
export function formatTime(date) {
    if (!date) return 'N/A';
    
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Time';
        
        return d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Time formatting error:', error);
        return 'N/A';
    }
}

/**
 * Format date and time together
 * @param {Date|string|number} date - Date object, ISO string, or timestamp
 * @returns {string} Formatted datetime (e.g., "18 Sep 2025, 07:42 PM")
 */
export function formatDateTime(date) {
    if (!date) return 'N/A';
    
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid DateTime';
        
        return `${formatDate(d)}, ${formatTime(d)}`;
    } catch (error) {
        console.error('DateTime formatting error:', error);
        return 'N/A';
    }
}

/**
 * Format date and time on separate lines (for UI cards)
 * @param {Date|string|number} date - Date object, ISO string, or timestamp
 * @returns {object} { date: string, time: string }
 */
export function formatDateTimeSplit(date) {
    if (!date) return { date: 'N/A', time: 'N/A' };
    
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return { date: 'Invalid Date', time: 'Invalid Time' };
        
        return {
            date: formatDate(d),
            time: formatTime(d)
        };
    } catch (error) {
        console.error('DateTime split formatting error:', error);
        return { date: 'N/A', time: 'N/A' };
    }
}

/**
 * Format relative time (e.g., "2 hours ago", "Just now")
 * @param {Date|string|number} date - Date object, ISO string, or timestamp
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
    if (!date) return 'N/A';
    
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return formatDate(d);
    } catch (error) {
        console.error('Relative time formatting error:', error);
        return 'N/A';
    }
}

/**
 * Format order status timestamp (shows time if today, date otherwise)
 * @param {Date|string|number} date - Date object, ISO string, or timestamp
 * @returns {string} Smart formatted timestamp
 */
export function formatOrderTimestamp(date) {
    if (!date) return 'N/A';
    
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid Date';
        
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        
        if (isToday) {
            return `Today, ${formatTime(d)}`;
        }
        
        const diffDays = Math.floor((now - d) / 86400000);
        if (diffDays === 1) {
            return `Yesterday, ${formatTime(d)}`;
        }
        
        return formatDateTime(d);
    } catch (error) {
        console.error('Order timestamp formatting error:', error);
        return 'N/A';
    }
}
