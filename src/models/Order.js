const mongoose = require('mongoose');

// Schema definition for Orders
const OrderSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    // For guest checkouts (future)
    customerEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    customerPhone: {
        type: String,
        trim: true
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
            required: true,
            min: [0, 'Price cannot be negative']
        },
        amount: {
            type: Number,
            required: true,
            min: [1, 'Amount must be at least 1']
        },
        additionalTopping: [{
            id: Number,
            name: String,
            price: Number
        }]
    }],
    total: {
        type: Number,
        required: [true, 'Total is required'],
        min: [0, 'Total cannot be negative']
    },
    address: {
        id: String,
        label: String,
        street: String,
        city: String,
        area: String,
        phone: String
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'cash', 'wallet'],
        required: [true, 'Payment method is required']
    },
    paymentDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    deliveryTime: {
        type: String,
        enum: ['asap', 'schedule'],
        default: 'asap'
    },
    scheduledFor: {
        type: Date,
        default: null
    },
    deliveryInstructions: {
        type: String,
        default: '',
        trim: true
    },
    currentStage: {
        type: Number,
        default: 0,
        min: [-1, 'Stage cannot be less than -1'], // -1 = cancelled
        max: [4, 'Stage cannot exceed 4'] // 0-4: placed, preparing, baking, delivering, delivered
    },
    status: {
        type: String,
        enum: ['Order Placed', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Order Placed'
    },
    statusHistory: [{
        stage: Number,
        status: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            default: null
        }
    }],
    feedback: {
        rating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
            default: null
        },
        comment: {
            type: String,
            default: '',
            trim: true
        },
        submittedAt: {
            type: Date,
            default: null
        }
    },
    estimatedDeliveryTime: {
        type: Date,
        default: null
    },
    actualDeliveryTime: {
        type: Date,
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelReason: {
        type: String,
        default: '',
        trim: true
    },
    appliedOffer: {
        code: String,
        type: {
            type: String,
            enum: ['fixed', 'percent']
        },
        value: Number,
        discountAmount: Number
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative']
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
OrderSchema.pre('save', function () {
    this.updatedAt = Date.now();

    // Auto-update status based on currentStage
    if (this.isModified('currentStage')) {
        const stageStatuses = ['Order Placed', 'Preparing', 'Baking', 'Out for Delivery', 'Delivered'];
        if (this.currentStage === -1) {
            this.status = 'Cancelled';
            this.cancelledAt = Date.now();
        } else if (this.currentStage >= 0 && this.currentStage <= 4) {
            this.status = stageStatuses[this.currentStage];

            // Add to status history
            this.statusHistory.push({
                stage: this.currentStage,
                status: this.status,
                timestamp: Date.now()
            });

            // Set delivery time when delivered
            if (this.currentStage === 4 && !this.actualDeliveryTime) {
                this.actualDeliveryTime = Date.now();
            }
        }
    }
});

// Indexes for faster queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ currentStage: 1 });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
