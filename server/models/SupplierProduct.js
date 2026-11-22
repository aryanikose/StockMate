const mongoose = require('mongoose');

const supplierProductSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupplierProfile',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters']
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
        message: 'Invalid product category'
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
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound Index: For rapid searches on active products within categories
supplierProductSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model('SupplierProduct', supplierProductSchema);
