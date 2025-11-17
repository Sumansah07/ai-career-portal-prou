const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware called, token:', token ? 'exists' : 'missing');

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }



    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token is no longer valid'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      console.log('Authorize middleware called with roles:', roles);
      console.log('req.user in authorize:', req.user);



      // First, check if role is available in JWT (which it should be)
      if (req.user.role) {
        console.log('Using role from JWT:', req.user.role);
        if (!roles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: `Access denied. This feature is only available to ${roles.join(' or ')}.`
          });
        }
        req.userRole = req.user.role;
        return next();
      }

      // Fallback: fetch user from database if role not in JWT
      console.log('Role not found in JWT, fetching from database...');
      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      console.log('User role from DB:', user.role);

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. This feature is only available to ${roles.join(' or ')}.`
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error in authorization'
      });
    }
  };
};

module.exports = { auth, authorize };
