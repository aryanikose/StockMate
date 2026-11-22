const User = require('../models/User');

// Helper to generate token and send standard success response
const sendTokenResponse = (user, statusCode, message, res) => {
  const token = user.getSignedJwtToken();

  // Create clean user object without password
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt
  };

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: userData,
      token
    }
  });
};

// @desc    Register new user (Business Owner or Supplier)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validation: ensure required fields are present
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, password.'
      });
    }

    // Security Rule: Admin role cannot be registered publicly
    if (role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Administrator accounts cannot be created via public registration.'
      });
    }

    // Role must be business or supplier
    const assignedRole = role === 'supplier' ? 'supplier' : 'business';

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.'
      });
    }

    // Create user in database
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: assignedRole
    });

    sendTokenResponse(user, 201, 'Account registered successfully', res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password presence
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Find user in DB (explicitly selecting password since it is select: false)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Verify password hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    sendTokenResponse(user, 200, 'Logged in successfully', res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private (Requires JWT)
exports.getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};
