// In-memory store for activities since we are using mock DB
const activities = [];

const logActivity = (boardId, userId, message) => {
    const activity = {
        id: Date.now().toString(),
        boardId,
        userId,
        message,
        createdAt: new Date()
    };
    activities.unshift(activity); // Add to beginning
    // Keep only last 50 activities to avoid memory overflow in long run
    if (activities.length > 100) activities.pop();

    return activity;
};

const getBoardActivity = (boardId) => {
    return activities.filter(a => a.boardId === boardId);
}

module.exports = { logActivity, getBoardActivity };
