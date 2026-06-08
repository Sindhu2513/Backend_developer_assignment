const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    
    // Extract token from Bearer scheme header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Access denied. No token provided.', 401));
    }

    // Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve active user from database
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('Access denied. User does not exist.', 401));
    }

    // Grant access and expose profile
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired authentication token.', 401));
  }
};

module.exports = authMiddleware;
