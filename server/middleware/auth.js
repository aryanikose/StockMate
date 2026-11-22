const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes: verifies JWT and attaches user to req
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header for 'Bearer <token>'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Ensure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.'
    });
  }

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB (excluding password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account belonging to this token no longer exists.'
      });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Authentication failure:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.'
    });
  }
};

// Middleware to authorize specific user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role || 'unknown'}' is not authorized to access this route.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
