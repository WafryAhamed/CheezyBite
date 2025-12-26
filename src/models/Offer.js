const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please apply a name for the offer'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    code: {
        type: String,
        required: [true, 'Please add a coupon code'],
        unique: true,
        trim: true,
        uppercase: true,
        minlength: [3, 'Code must be at least 3 characters']
    },
    type: {
        type: String,
        enum: ['fixed', 'percent'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: [0, 'Discount value cannot be negative']
    },
    maxDiscount: {
        type: Number,
        default: null // For percentage discounts, optional max cap
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validTo: {
        type: Date
    },
    usageLimitTotal: {
        type: Number,
        default: null // null means unlimited
    },
    usageLimitPerUser: {
        type: Number,
        default: 1
    },
    firstOrderOnly: {
        type: Boolean,
        default: false // If true, only customers with no previous orders can use
    },
    usedCount: {
        type: Number,
        default: 0
    },
    userUsage: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        count: {
            type: Number,
            default: 1
        },
        lastUsedAt: Date
    }],
    appliesTo: {
        type: String,
        enum: ['all', 'category', 'pizzas'],
        default: 'all'
    },
    categories: {
        type: [String],
        default: []
    },
    pizzaIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Pizza',
        default: []
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster lookups by code
OfferSchema.index({ code: 1 });

module.exports = mongoose.models.Offer || mongoose.model('Offer', OfferSchema);
