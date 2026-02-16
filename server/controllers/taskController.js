const prisma = require('../prisma/client');
const { logActivity } = require('../utils/activityLogger');
const { emitBoardUpdate } = require('../socket');

const createTask = async (req, res) => {
    try {
        const { listId } = req.params;
        const { title, description, position, assigneeId } = req.body;

        const newTask = await prisma.task.create({
            data: { title, description, position, listId, assigneeId },
        });

        // Get boardId from list to log/emit
        const list = await prisma.list.findUnique({ where: { id: listId } });
        if (list) {
            logActivity(list.boardId, req.user.id, `Created task "${title}"`);
            emitBoardUpdate(list.boardId, { type: 'TASK_CREATED', task: newTask });
        }

        res.json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, position, listId, assigneeId } = req.body;

        // Get old task to check for changes
        const oldTask = await prisma.task.findUnique({ where: { id } });

        const updatedTask = await prisma.task.update({
            where: { id },
            data: { title, description, position, listId, assigneeId }
        });

        // Get boardId
        const list = await prisma.list.findUnique({ where: { id: updatedTask.listId } });
        if (list) {
            let message = `Updated task "${updatedTask.title}"`;
            if (oldTask.listId !== updatedTask.listId) message = `Moved task "${updatedTask.title}"`;
            if (oldTask.assigneeId !== updatedTask.assigneeId && updatedTask.assigneeId) message = `Assigned task "${updatedTask.title}"`;

            logActivity(list.boardId, req.user.id, message);
            emitBoardUpdate(list.boardId, { type: 'TASK_UPDATED', task: updatedTask });
        }

        res.json(updatedTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await prisma.task.findUnique({ where: { id } });

        await prisma.task.delete({ where: { id } });

        if (task) {
            const list = await prisma.list.findUnique({ where: { id: task.listId } });
            if (list) {
                logActivity(list.boardId, req.user.id, `Deleted task "${task.title}"`);
                emitBoardUpdate(list.boardId, { type: 'TASK_DELETED', taskId: id });
            }
        }

        res.json({ message: 'Task deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { createTask, updateTask, deleteTask };
