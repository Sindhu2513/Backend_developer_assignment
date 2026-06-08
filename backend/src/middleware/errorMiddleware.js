const AppError = require('../utils/appError');

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the stack trace for developers
  console.error('Error stack trace:', err.stack || err);

  // Mongoose Cast Error (Invalid Object ID)
  if (err.name === 'CastError') {
    error = new AppError(`Resource not found. Invalid ID format: ${err.value}`, 404);
  }

  // Mongoose Duplicate Key (Unique Constraint violation, e.g. duplicate email)
  if (err.code === 11000) {
    const duplicateField = Object.keys(err.keyValue)[0];
    error = new AppError(`An account with that ${duplicateField} is already registered.`, 400);
  }

  // Mongoose Field Validation Error
  if (err.name === 'ValidationError') {
    const validationMessage = Object.values(err.errors)
      .map((element) => element.message)
      .join(', ');
    error = new AppError(validationMessage, 400);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid authentication token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your authentication token has expired. Please log in again.', 401);
  }

  const statusCode = error.statusCode || 500;
  const clientMessage = error.message || 'An unexpected database error occurred.';

  res.status(statusCode).json({
    success: false,
    message: clientMessage
  });
};

module.exports = errorMiddleware;
