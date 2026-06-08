const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All admin routes require JWT + Admin role authorization
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/users', adminController.getAllUsers);
router.get('/tasks', adminController.getAllTasks);

module.exports = router;
