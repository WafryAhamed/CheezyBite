const mongoose = require('mongoose');

const ToppingSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Topping name is required'],
        trim: true,
        lowercase: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    enabled: {
        type: Boolean,
        default: true
    },
    type: {
        type: String,
        enum: ['veg', 'meat', 'cheese', 'spicy', 'other'],
        default: 'veg'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update timestamp on save
ToppingSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

// Index for faster queries
ToppingSchema.index({ enabled: 1 });


module.exports = mongoose.models.Topping || mongoose.model('Topping', ToppingSchema);
