// Demo Override: Always Open
export const isStoreOpen = () => {
    return true;
};

export const getNextOpeningTime = () => {
    return "Now";
};

// Mock Serviceable Areas (Colombo, Sri Lanka context based on previous chats)
const SERVICEABLE_CITIES = ['Colombo', 'Dehiwala', 'Mount Lavinia', 'Nugegoda', 'Battaramulla', 'Rajagiriya', 'Kotte', 'Wellawatte', 'Bambalapitiya', 'Kollupitiya'];

export const isServiceableArea = (city) => {
    // Demo Override: Always Deliver to any city
    return true;
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
