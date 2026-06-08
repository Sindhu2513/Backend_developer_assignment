const User = require('../models/User');
const Task = require('../models/Task');
const { sendSuccess } = require('../utils/apiResponse');

const adminController = {
  // GET /admin/users
  async getAllUsers(req, res, next) {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      return sendSuccess(res, users, 200);
    } catch (error) {
      next(error);
    }
  },

  // GET /admin/tasks
  async getAllTasks(req, res, next) {
    try {
      const tasks = await Task.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
      return sendSuccess(res, tasks, 200);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminController;
