/**
 * Order Status Constants
 * Shared between Frontend and Backend logic
 */

export const ORDER_STAGES = {
    PLACED: 0,
    PREPARING: 1,
    BAKING: 2,
    OUT_FOR_DELIVERY: 3,
    DELIVERED: 4,
    CANCELLED: -1
};

export const ORDER_STAGE_NAMES = {
    [ORDER_STAGES.PLACED]: 'Order Placed',
    [ORDER_STAGES.PREPARING]: 'Preparing',
    [ORDER_STAGES.BAKING]: 'Baking',
    [ORDER_STAGES.OUT_FOR_DELIVERY]: 'Out for Delivery',
    [ORDER_STAGES.DELIVERED]: 'Delivered',
    [ORDER_STAGES.CANCELLED]: 'Cancelled'
};

export const STAGE_MESSAGES = [
    { name: 'Order Placed', emoji: '✅', message: 'Order confirmed!' },
    { name: 'Preparing', emoji: '👨‍🍳', message: 'Chef is preparing your pizza...' },
    { name: 'Baking', emoji: '🔥', message: 'Pizza is baking in the oven!' },
    { name: 'Out for Delivery', emoji: '🚴', message: 'Your pizza is on the way!' },
    { name: 'Delivered', emoji: '🎉', message: 'Delivered! Enjoy your meal!' }
];

export const ORDER_STATUS_SLUGS = ['placed', 'preparing', 'baking', 'out_for_delivery', 'delivered'];
