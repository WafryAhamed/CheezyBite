import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage',
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      // For percentage: 0-100
      // For fixed: amount in currency
    },
    maxDiscount: {
      // Maximum discount amount (applies to percentage coupons)
      type: Number,
      min: 0,
      default: null,
    },
    minOrderValue: {
      // Minimum order value required to use coupon
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      maxlength: 200,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usageLimit: {
      // Total usage limit for this coupon
      type: Number,
      default: null, // null = unlimited
      min: 1,
    },
    usagePerUser: {
      // How many times a single user can use this coupon
      type: Number,
      default: 1,
      min: 1,
    },
    usedCount: {
      // Current usage count
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      // Admin ID who created this coupon
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient lookups
couponSchema.index({ code: 1 });
couponSchema.index({ active: 1, expiresAt: 1 });

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
