const express = require('express');
const router = express.Router({ mergeParams: true }); // Enable access to parent params
const auth = require('../middleware/auth');
const { getLists, createList, updateList, deleteList } = require('../controllers/listController');

router.get('/', auth, getLists);
router.post('/', auth, createList);
router.put('/:id', auth, updateList);
router.delete('/:id', auth, deleteList);

module.exports = router;
