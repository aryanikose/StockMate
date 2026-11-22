const mongoose = require('mongoose');

const supplierProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // Exactly one supplier profile per supplier user account
    },
    businessName: {
      type: String,
      required: [true, 'Please provide the supplier company or business name'],
      trim: true,
      maxlength: [120, 'Supplier business name cannot exceed 120 characters']
    },
    contactPerson: {
      type: String,
      required: [true, 'Please provide a primary contact person name'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Please provide a business address'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please provide the operating city'],
      trim: true,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact phone number'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Invalid verification status'
      },
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SupplierProfile', supplierProfileSchema);
