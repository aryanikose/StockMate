const Business = require('../models/Business');

// @desc    Create Business Profile
// @route   POST /api/business
// @access  Private (Role: business)
exports.createBusiness = async (req, res, next) => {
  try {
    const { businessName, businessType, address, city, phone, logo } = req.body;

    // Check if the user already created a business profile
    const existingBusiness = await Business.findOne({ owner: req.user._id });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered a business profile. Each account supports one business.'
      });
    }

    if (!businessName || !businessType || !address || !city || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: businessName, businessType, address, city, phone.'
      });
    }

    const business = await Business.create({
      owner: req.user._id,
      businessName,
      businessType,
      address,
      city,
      phone,
      logo: logo || ''
    });

    res.status(201).json({
      success: true,
      message: 'Business profile created successfully',
      data: { business }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User's Business Profile
// @route   GET /api/business/me
// @access  Private (Role: business)
exports.getMyBusiness = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'No business profile found for this user account.'
      });
    }

    res.status(200).json({
      success: true,
      data: { business }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Current User's Business Profile
// @route   PUT /api/business/me
// @access  Private (Role: business)
exports.updateMyBusiness = async (req, res, next) => {
  try {
    const { businessName, businessType, address, city, phone, logo } = req.body;

    let business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found. Please create one first.'
      });
    }

    // Update fields
    if (businessName) business.businessName = businessName;
    if (businessType) business.businessType = businessType;
    if (address) business.address = address;
    if (city) business.city = city;
    if (phone) business.phone = phone;
    if (logo !== undefined) business.logo = logo;

    await business.save();

    res.status(200).json({
      success: true,
      message: 'Business profile updated successfully',
      data: { business }
    });
  } catch (error) {
    next(error);
  }
};
