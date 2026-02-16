const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { updateTask, deleteTask } = require('../controllers/taskController');

router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
