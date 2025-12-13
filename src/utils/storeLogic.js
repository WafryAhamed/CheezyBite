export const isStoreOpen = () => {
    // Demo Override: If URL has ?demo_closed=true, force close (handled in component if needed, but here we stick to pure logic)
    // Real logic: 10:00 AM to 11:00 PM
    const now = new Date();
    const hours = now.getHours();

    // Open from 10:00 (10) to 23:00 (23)
    return hours >= 10 && hours < 23;
};

export const getNextOpeningTime = () => {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 23) {
        // It's late night, open tomorrow at 10 AM
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        return "Tomorrow at 10:00 AM";
    } else if (hours < 10) {
        // It's early morning, open today at 10 AM
        return "Today at 10:00 AM";
    }

    return "Now";
};

// Mock Serviceable Areas (Colombo, Sri Lanka context based on previous chats)
const SERVICEABLE_CITIES = ['Colombo', 'Dehiwala', 'Mount Lavinia', 'Nugegoda', 'Battaramulla', 'Rajagiriya', 'Kotte', 'Wellawatte', 'Bambalapitiya', 'Kollupitiya'];

export const isServiceableArea = (city) => {
    if (!city) return false;
    const normalizedCity = city.trim();
    // Case-insensitive partial match for demo leniency
    return SERVICEABLE_CITIES.some(area =>
        normalizedCity.toLowerCase().includes(area.toLowerCase()) ||
        area.toLowerCase().includes(normalizedCity.toLowerCase())
    );
};

export const checkDeliveryAvailability = (city) => {
    const open = isStoreOpen();
    const serviceable = isServiceableArea(city);

    if (!serviceable) {
        return {
            available: false,
            reason: "Sorry, we don't deliver to this area yet.",
            type: 'AREA'
        };
    }

    if (!open) {
        return {
            available: false,
            reason: `Store is currently closed. We open ${getNextOpeningTime()}.`,
            type: 'TIME'
        };
    }

    return { available: true };
};
