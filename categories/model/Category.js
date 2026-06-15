import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
  {
    percentage: { type: Number, required: true, min: 1, max: 100 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, required: true, default: true },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    discount: { type: discountSchema, default: undefined },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
