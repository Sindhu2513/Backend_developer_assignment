const errorHandler = (err, req, res, next) => {
  // Log the detailed error internally
  console.error('Error Stack:', err.stack || err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected server error occurred.';

  res.status(statusCode).json({
    success: false,
    message: message
  });
};

module.exports = errorHandler;
