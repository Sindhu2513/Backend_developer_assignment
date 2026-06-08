const express = require('express');
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const { createTaskValidator, updateTaskValidator, taskIdValidator } = require('../validators/taskValidator');

const router = express.Router();

// Require JWT for all task routes
router.use(authMiddleware);

router.get('/', taskController.getAll);
router.post('/', createTaskValidator, taskController.create);
router.get('/:id', taskIdValidator, taskController.getById);
router.put('/:id', updateTaskValidator, taskController.update);
router.delete('/:id', taskIdValidator, taskController.delete);

module.exports = router;
