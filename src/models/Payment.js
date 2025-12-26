import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    orderId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'LKR'
    },
    provider: {
        type: String,
        enum: ['stripe', 'cash', 'card_stub'],
        default: 'card_stub'
    },
    status: {
        type: String,
        enum: ['pending', 'succeeded', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String
    },
    providerPaymentId: {
        type: String
    },
    method: {
        type: String,
        enum: ['card', 'upi', 'wallet', 'cash', 'cod'],
        default: 'card'
    },
    metadata: {
        type: Map,
        of: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for looking up payments by order
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ userId: 1 });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
