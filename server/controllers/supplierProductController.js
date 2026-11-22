const SupplierProduct = require('../models/SupplierProduct');
const SupplierProfile = require('../models/SupplierProfile');

// Helper to get authenticated user's supplier profile
const getOwnerSupplierProfile = async (userId) => {
  return await SupplierProfile.findOne({ user: userId });
};

// @desc    Add New Product to Supplier Catalogue
// @route   POST /api/supplier-products
// @access  Private (Role: supplier)
exports.createProduct = async (req, res, next) => {
  try {
    const profile = await getOwnerSupplierProfile(req.user._id);
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your supplier profile before adding products to your catalogue.'
      });
    }

    const { name, category, unit, price, description, isAvailable } = req.body;

    if (!name || !category || !unit || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, category, unit, price.'
      });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number.'
      });
    }

    const product = await SupplierProduct.create({
      supplier: profile._id,
      name: name.trim(),
      category,
      unit,
      price: numPrice,
      description: description || '',
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    res.status(201).json({
      success: true,
      message: 'Product added to catalogue successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Supplier's Own Product Catalogue
// @route   GET /api/supplier-products
// @access  Private (Role: supplier)
exports.getMyProducts = async (req, res, next) => {
  try {
    const profile = await getOwnerSupplierProfile(req.user._id);
    if (!profile) {
      return res.status(200).json({
        success: true,
        data: { products: [], profile: null }
      });
    }

    const products = await SupplierProduct.find({ supplier: profile._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: {
        products,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Product Details
// @route   GET /api/supplier-products/:id
// @access  Private
exports.getProductById = async (req, res, next) => {
  try {
    const product = await SupplierProduct.findById(req.params.id).populate(
      'supplier',
      'businessName city phone contactPerson verificationStatus'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Supplier Product Information or Price
// @route   PUT /api/supplier-products/:id
// @access  Private (Role: supplier)
exports.updateProduct = async (req, res, next) => {
  try {
    const profile = await getOwnerSupplierProfile(req.user._id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found' });
    }

    const product = await SupplierProduct.findOne({
      _id: req.params.id,
      supplier: profile._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not owned by your account'
      });
    }

    const { name, category, unit, price, description, isAvailable } = req.body;

    if (name) product.name = name.trim();
    if (category) product.category = category;
    if (unit) product.unit = unit;
    if (description !== undefined) product.description = description;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid non-negative number.'
        });
      }
      product.price = numPrice;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Product Availability (In Stock / Out of Stock)
// @route   PATCH /api/supplier-products/:id/availability
// @access  Private (Role: supplier)
exports.toggleAvailability = async (req, res, next) => {
  try {
    const profile = await getOwnerSupplierProfile(req.user._id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Supplier profile not found' });
    }

    const product = await SupplierProduct.findOne({
      _id: req.params.id,
      supplier: profile._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not owned by your account'
      });
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product "${product.name}" is now marked as ${product.isAvailable ? 'Available' : 'Unavailable'}`,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search & Browse Active Marketplace Products (Business facing)
// @route   GET /api/supplier-products/marketplace
// @access  Private (Role: business, admin)
exports.getMarketplaceProducts = async (req, res, next) => {
  try {
    const { search, category, city } = req.query;

    // 1. Find all APPROVED suppliers matching city (if specified)
    const supplierQuery = { verificationStatus: 'approved' };
    if (city && city.trim()) {
      supplierQuery.city = { $regex: city.trim(), $options: 'i' };
    }

    const approvedSuppliers = await SupplierProfile.find(supplierQuery).select('_id');
    const approvedSupplierIds = approvedSuppliers.map((s) => s._id);

    // 2. Find active products from these approved suppliers
    const productQuery = {
      supplier: { $in: approvedSupplierIds },
      isAvailable: true
    };

    if (category && category !== 'All') {
      productQuery.category = category;
    }

    if (search && search.trim()) {
      productQuery.name = { $regex: search.trim(), $options: 'i' };
    }

    const products = await SupplierProduct.find(productQuery)
      .populate('supplier', 'businessName city phone contactPerson verificationStatus')
      .sort({ price: 1 }); // Sort by price ascending to easily compare rates!

    res.status(200).json({
      success: true,
      count: products.length,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};
