const User = require('../models/User');
const Business = require('../models/Business');
const SupplierProfile = require('../models/SupplierProfile');

// @desc    Get Aggregated Admin Platform Statistics
// @route   GET /api/admin/dashboard
// @access  Private (Role: admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBusinesses,
      totalSuppliers,
      pendingSuppliers,
      approvedSuppliers,
      recentUsers,
      recentSuppliers
    ] = await Promise.all([
      User.countDocuments(),
      Business.countDocuments(),
      SupplierProfile.countDocuments(),
      SupplierProfile.countDocuments({ verificationStatus: 'pending' }),
      SupplierProfile.countDocuments({ verificationStatus: 'approved' }),
      User.find().select('-password').sort({ createdAt: -1 }).limit(5),
      SupplierProfile.find().sort({ createdAt: -1 }).limit(5)
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalBusinesses,
          totalSuppliers,
          pendingSuppliers,
          approvedSuppliers
        },
        recentUsers,
        recentSuppliers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get List of Suppliers Awaiting Verification
// @route   GET /api/admin/suppliers/pending
// @access  Private (Role: admin)
exports.getPendingSuppliers = async (req, res, next) => {
  try {
    const suppliers = await SupplierProfile.find({ verificationStatus: 'pending' })
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: { suppliers }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve Supplier Profile
// @route   PATCH /api/admin/suppliers/:id/approve
// @access  Private (Role: admin)
exports.approveSupplier = async (req, res, next) => {
  try {
    const supplier = await SupplierProfile.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier profile not found'
      });
    }

    supplier.verificationStatus = 'approved';
    await supplier.save();

    res.status(200).json({
      success: true,
      message: `Supplier "${supplier.businessName}" has been approved for marketplace discovery.`,
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject Supplier Profile
// @route   PATCH /api/admin/suppliers/:id/reject
// @access  Private (Role: admin)
exports.rejectSupplier = async (req, res, next) => {
  try {
    const supplier = await SupplierProfile.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier profile not found'
      });
    }

    supplier.verificationStatus = 'rejected';
    await supplier.save();

    res.status(200).json({
      success: true,
      message: `Supplier "${supplier.businessName}" verification was rejected.`,
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Registered Users
// @route   GET /api/admin/users
// @access  Private (Role: admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};
