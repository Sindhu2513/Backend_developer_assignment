const Task = require('../models/Task');
const AppError = require('../utils/appError');
const { sendSuccess } = require('../utils/apiResponse');

const taskController = {
  // GET /
  async getAll(req, res, next) {
    try {
      let tasks;
      if (req.user.role === 'admin') {
        // Admins can see all tasks, join with user data
        tasks = await Task.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
      } else {
        // Standard users can only view their own tasks
        tasks = await Task.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
      }

      return sendSuccess(res, tasks, 200);
    } catch (error) {
      next(error);
    }
  },

  // POST /
  async create(req, res, next) {
    try {
      const { title, description, status } = req.body;
      const createdBy = req.user._id;

      const newTask = await Task.create({
        title,
        description,
        status,
        createdBy
      });

      return sendSuccess(res, newTask, 201);
    } catch (error) {
      next(error);
    }
  },

  // GET /:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const task = await Task.findById(id).populate('createdBy', 'name email');

      if (!task) {
        return next(new AppError('Task not found.', 404));
      }

      // Allow access if admin, or if standard user owns it
      if (req.user.role !== 'admin' && task.createdBy._id.toString() !== req.user._id.toString()) {
        return next(new AppError('Forbidden. You do not own this task.', 403));
      }

      return sendSuccess(res, task, 200);
    } catch (error) {
      next(error);
    }
  },

  // PUT /:id
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, status } = req.body;

      const task = await Task.findById(id);
      if (!task) {
        return next(new AppError('Task not found.', 404));
      }

      // Check permissions
      if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
        return next(new AppError('Forbidden. You do not have permission to modify this task.', 403));
      }

      // Apply modifications and return updated object
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { title, description, status },
        { new: true, runValidators: true }
      );

      return sendSuccess(res, updatedTask, 200);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /:id
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const task = await Task.findById(id);
      if (!task) {
        return next(new AppError('Task not found.', 404));
      }

      // Check permissions
      if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
        return next(new AppError('Forbidden. You do not have permission to delete this task.', 403));
      }

      await Task.findByIdAndDelete(id);

      return sendSuccess(res, { id, message: 'Task deleted successfully.' }, 200);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = taskController;
