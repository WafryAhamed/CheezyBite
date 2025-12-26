import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userModel',
        required: true
    },
    userModel: {
        type: String,
        enum: ['User', 'Admin'],
        required: true
    },
    role: {
        type: String,
        required: false
    },
    sessionId: {
        type: String,
        unique: true,
        sparse: true
    },
    token: {
        type: String,
        required: true,
        index: true
    },
    ipAddress: String,
    userAgent: String,
    isValid: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // Auto-delete when expired
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
