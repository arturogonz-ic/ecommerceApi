import mongoose from 'mongoose';

const discountSchema = new mongoose.Schema(
  {
    percentage: { type: Number, required: true, min: 1, max: 100 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, required: true, default: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: [] }],
    discount: { type: discountSchema, default: undefined },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
