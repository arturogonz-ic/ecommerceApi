import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'lost'],
      default: 'pending',
    },
    deliveryAt: { type: Date, default: null },
    shippingCarrier: { type: String, default: null },
    trackingId: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Order = mongoose.model('Order', orderSchema);
