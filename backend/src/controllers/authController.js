const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { sendSuccess } = require('../utils/apiResponse');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

const authController = {
  // POST /register
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return next(new AppError('A user with that email already exists.', 400));
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user profile
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword
      });

      // Sign JWT Token
      const token = jwt.sign(
        { id: newUser._id, role: newUser.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Exclude password field from the returned user object
      const userResponse = {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt
      };

      return sendSuccess(res, { token, user: userResponse }, 201);
    } catch (error) {
      next(error);
    }
  },

  // POST /login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user and explicitly select the hidden password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return next(new AppError('Invalid email or password.', 401));
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next(new AppError('Invalid email or password.', 401));
      }

      // Sign JWT Token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Construct safe user object without password
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      };

      return sendSuccess(res, { token, user: userResponse }, 200);
    } catch (error) {
      next(error);
    }
  },

  // GET /me
  async getMe(req, res, next) {
    try {
      // req.user is already populated by the authMiddleware
      return sendSuccess(res, { user: req.user }, 200);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
