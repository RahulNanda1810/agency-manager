const express = require('express');
const router = express.Router();
const myTasksController = require('../controllers/my-tasks.controller');
const auth = require('../middleware/auth.middleware');

// Get all tasks assigned to current user
router.get('/my-tasks', auth, myTasksController.getMyTasks);

// Get task statistics for current user
router.get('/my-stats', auth, myTasksController.getTaskStats);

module.exports = router;
