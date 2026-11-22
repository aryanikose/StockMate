const SupplierProfile = require('../models/SupplierProfile');
const SupplierProduct = require('../models/SupplierProduct');

// @desc    Create or Update Supplier Profile
// @route   POST or PUT /api/suppliers/profile
// @access  Private (Role: supplier)
exports.createOrUpdateProfile = async (req, res, next) => {
  try {
    const { businessName, contactPerson, address, city, phone, description } = req.body;

    if (!businessName || !contactPerson || !address || !city || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: businessName, contactPerson, address, city, phone.'
      });
    }

    let profile = await SupplierProfile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile (preserves verificationStatus set by Admin)
      profile.businessName = businessName;
      profile.contactPerson = contactPerson;
      profile.address = address;
      profile.city = city;
      profile.phone = phone;
      if (description !== undefined) profile.description = description;

      await profile.save();

      return res.status(200).json({
        success: true,
        message: 'Supplier profile updated successfully',
        data: { profile }
      });
    }

    // Create new profile with 'pending' verification status
    profile = await SupplierProfile.create({
      user: req.user._id,
      businessName,
      contactPerson,
      address,
      city,
      phone,
      description: description || '',
      verificationStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Supplier profile created and submitted for Admin verification',
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Supplier's Own Profile
// @route   GET /api/suppliers/profile/me
// @access  Private (Role: supplier)
exports.getMyProfile = async (req, res, next) => {
  try {
    const profile = await SupplierProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'No supplier profile found. Please create your profile.'
      });
    }

    res.status(200).json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Marketplace Directory of Approved Suppliers
// @route   GET /api/suppliers
// @access  Private (Role: business, admin)
exports.getApprovedSuppliers = async (req, res, next) => {
  try {
    const { search, city } = req.query;

    const query = { verificationStatus: 'approved' };

    // City filter
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Keyword search
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await SupplierProfile.find(query).sort({ businessName: 1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: { suppliers }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Supplier Details
// @route   GET /api/suppliers/:id
// @access  Private
exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await SupplierProfile.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // If requested by a business owner, only show approved suppliers
    if (req.user.role === 'business' && supplier.verificationStatus !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Supplier is currently not available in the marketplace.'
      });
    }

    const products = await SupplierProduct.find({
      supplier: supplier._id,
      ...(req.user.role === 'business' && { isAvailable: true })
    }).sort({ category: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: {
        supplier,
        products
      }
    });
  } catch (error) {
    next(error);
  }
};
