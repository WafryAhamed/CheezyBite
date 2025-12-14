import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    entity: {
        type: String, // e.g., 'Order', 'Pizza', 'User'
        required: true
    },
    entityId: {
        type: String,
        required: true
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId, // User or Admin ID
        required: true
    },
    actorModel: {
        type: String,
        enum: ['User', 'Admin'],
        required: true
    },
    details: {
        type: Object
    },
    ipAddress: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 90 // Auto-delete after 90 days
    }
}, {
    timestamps: true
});

AuditLogSchema.index({ entity: 1, entityId: 1 });
AuditLogSchema.index({ createdAt: -1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
