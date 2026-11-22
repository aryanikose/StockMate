const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true
    },
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
      index: true
    },
    movementType: {
      type: String,
      required: true,
      enum: {
        values: ['IN', 'OUT', 'ADJUSTMENT_INCREASE', 'ADJUSTMENT_DECREASE'],
        message: 'Invalid stock movement type'
      },
      index: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.001, 'Quantity must be a positive number']
    },
    reason: {
      type: String,
      required: [true, 'Reason for stock movement is required'],
      trim: true
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // Movements are immutable
  }
);

// Compound Index: For rapid history queries by business & date
stockMovementSchema.index({ business: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
