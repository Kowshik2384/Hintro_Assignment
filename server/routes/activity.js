const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { getBoardActivity } = require('../utils/activityLogger');
// We need to fetch user details for the UI probably, or store username in log.
// Let's store username in log for simplicity in next step or fetch users.

router.get('/', auth, (req, res) => {
    const { boardId } = req.params;
    const logs = getBoardActivity(boardId);
    res.json(logs);
});

module.exports = router;
