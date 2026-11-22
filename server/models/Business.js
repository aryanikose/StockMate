const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // Exactly one business profile per owner in the first version
    },
    businessName: {
      type: String,
      required: [true, 'Please provide your business name'],
      trim: true,
      maxlength: [120, 'Business name cannot exceed 120 characters']
    },
    businessType: {
      type: String,
      required: [true, 'Please select your business type'],
      enum: {
        values: [
          'Cafe',
          'Restaurant',
          'Hotel',
          'Bakery',
          'Cloud Kitchen',
          'Food Stall',
          'Other'
        ],
        message: 'Invalid business type selected'
      }
    },
    address: {
      type: String,
      required: [true, 'Please provide the physical address'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please provide the city'],
      trim: true,
      index: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide a business phone number'],
      trim: true
    },
    logo: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Business', businessSchema);
