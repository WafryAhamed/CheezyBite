const mongoose = require('mongoose');

const OtpSessionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    purpose: {
        type: String,
        enum: ['signup', 'login', 'profile_update', 'checkout', 'order_place', 'email_verification'],
        required: true
    },
    otpHash: {
        type: String,
        required: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index
    },
    consumedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Ensure compound index to quickly find active session for email+purpose
// We search for: email=?, purpose=?, consumedAt=null, expiresAt > now
OtpSessionSchema.index({ email: 1, purpose: 1, consumedAt: 1, expiresAt: 1 });

module.exports = mongoose.models.OtpSession || mongoose.model('OtpSession', OtpSessionSchema);
