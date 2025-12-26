import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    items: [{
        cartLineId: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        image: {
            type: String,
            required: true
        },
        size: {
            type: String,
            required: true
        },
        crust: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 1
        },
        additionalTopping: [{
            id: Number,
            name: String,
            price: Number
        }]
    }]
}, {
    timestamps: true
});

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);
