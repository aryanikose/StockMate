const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupplierProduct',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    unit: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.001, 'Quantity must be positive']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    lineTotal: {
      type: Number,
      required: true,
      min: [0, 'Line total cannot be negative']
    }
  },
  { _id: false }
);

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupplierProfile',
      required: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order must contain at least one item'],
      validate: [val => val.length > 0, 'Order must contain at least one item']
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'dispatched', 'delivered', 'cancelled'],
        message: 'Invalid purchase order status'
      },
      default: 'pending',
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    deliveredAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for rapid order querying by status and date
purchaseOrderSchema.index({ business: 1, status: 1 });
purchaseOrderSchema.index({ supplier: 1, status: 1 });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
