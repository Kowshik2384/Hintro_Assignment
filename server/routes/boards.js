const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getBoards, createBoard } = require('../controllers/boardController');

router.get('/', auth, getBoards);
router.post('/', auth, createBoard);

module.exports = router;
