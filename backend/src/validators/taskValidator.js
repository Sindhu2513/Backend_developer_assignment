const { body, param, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const handleValidationResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required.')
    .escape(),
  body('description')
    .optional()
    .trim()
    .escape(),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be either: pending, in-progress, or completed.'),
  handleValidationResults
];

const updateTaskValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format.'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty.')
    .escape(),
  body('description')
    .optional()
    .trim()
    .escape(),
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'completed'])
    .withMessage('Status must be either: pending, in-progress, or completed.'),
  handleValidationResults
];

const taskIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format.'),
  handleValidationResults
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  taskIdValidator
};
