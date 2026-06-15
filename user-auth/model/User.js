import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: null },
    zip: { type: String, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    shippingAddress: { type: addressSchema, default: () => ({}) },
    billingAddress: { type: addressSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
