const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { createTask, updateTask, deleteTask } = require('../controllers/taskController');

// Note: creation usually happens under a list, but update/delete is by ID.
// We can structure routes like /api/lists/:listId/tasks for creation/get
// And /api/tasks/:id for update/delete.
// Or just handle all in one.
// Let's doing: POST /api/lists/:listId/tasks
// PUT /api/tasks/:id

router.post('/', auth, createTask);

module.exports = router;
