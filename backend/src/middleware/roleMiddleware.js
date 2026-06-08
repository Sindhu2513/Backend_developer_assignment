const AppError = require('../utils/appError');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized. Session profile not found.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden. You do not have permission to access this resource.', 403));
    }

    next();
  };
};

module.exports = roleMiddleware;
