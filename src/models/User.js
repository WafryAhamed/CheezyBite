const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        default: '',
        validate: {
            validator: function (v) {
                if (!v) return true; // Allow empty
                // Strict Sri Lanka Format: 07XXXXXXXX or +947XXXXXXXX
                return /^(?:\+94|0)7\d{8}$/.test(v);
            },
            message: props => `${props.value} is not a valid Sri Lankan phone number! Use 07XXXXXXXX or +947XXXXXXXX.`
        }
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    addresses: [{
        id: {
            type: String,
            required: true
        },
        label: {
            type: String,
            enum: ['Home', 'Work', 'Other'],
            default: 'Home'
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        area: {
            type: String,
            default: ''
        },
        phone: {
            type: String,
            required: true
        },
        isDefault: {
            type: Boolean,
            default: false
        }
    }],
    role: {
        type: String,
        enum: ['Customer', 'Delivery', 'Manager', 'Super Admin'],
        default: 'Customer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: {
        type: String,
        default: undefined
    },
    resetPasswordExpires: {
        type: Date,
        default: undefined
    }
}, {
    timestamps: true
});

// Update timestamp on save
UserSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
