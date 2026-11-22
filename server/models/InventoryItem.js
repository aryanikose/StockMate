const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide an item name'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: [
          'Vegetables',
          'Fruits',
          'Dairy',
          'Grains and Cereals',
          'Pulses',
          'Spices',
          'Meat and Seafood',
          'Oils',
          'Beverages',
          'Packaging',
          'Cleaning Supplies',
          'Other'
        ],
        message: 'Invalid inventory category'
      },
      index: true
    },
    unit: {
      type: String,
      required: [true, 'Please specify a unit of measurement'],
      enum: {
        values: ['kg', 'g', 'litre', 'ml', 'pieces', 'packets'],
        message: 'Unit must be kg, g, litre, ml, pieces, or packets'
      }
    },
    currentQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Current quantity cannot be negative']
    },
    minimumQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Minimum threshold cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound Index: Enforce unique item name per business
inventoryItemSchema.index({ business: 1, name: 1 }, { unique: true });

// Virtual Field: Compute stock status dynamically
inventoryItemSchema.virtual('stockStatus').get(function () {
  if (this.currentQuantity === 0) {
    return 'out_of_stock';
  }
  if (this.currentQuantity <= this.minimumQuantity) {
    return 'low_stock';
  }
  return 'in_stock';
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
