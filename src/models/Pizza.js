import mongoose from 'mongoose';

const PizzaSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Pizza name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    image: {
        type: String,
        required: [true, 'Image path is required']
    },
    priceSm: {
        type: Number,
        required: [true, 'Small price is required'],
        min: [0, 'Price cannot be negative']
    },
    priceMd: {
        type: Number,
        required: [true, 'Medium price is required'],
        min: [0, 'Price cannot be negative']
    },
    priceLg: {
        type: Number,
        required: [true, 'Large price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Chicken', 'Cheese', 'Veg', 'Spicy', 'Special']
    },
    tags: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 4.5,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
    },
    ratingCount: {
        type: Number,
        default: 0,
        min: [0, 'Rating count cannot be negative']
    },
    enabled: {
        type: Boolean,
        default: true
    },
    toppingIds: [{
        type: Number
    }],
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
PizzaSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for faster queries
PizzaSchema.index({ enabled: 1, category: 1 });
PizzaSchema.index({ id: 1 });

export default mongoose.models.Pizza || mongoose.model('Pizza', PizzaSchema);
