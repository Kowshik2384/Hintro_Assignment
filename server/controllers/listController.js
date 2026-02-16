const prisma = require('../prisma/client');
const { logActivity } = require('../utils/activityLogger');
const { emitBoardUpdate } = require('../socket');

const getLists = async (req, res) => {
    try {
        const { boardId } = req.params;
        const lists = await prisma.list.findMany({
            where: { boardId },
            orderBy: { position: 'asc' }
        });

        // Enrich lists with tasks
        const listsWithTasks = await Promise.all(lists.map(async (list) => {
            const tasks = await prisma.task.findMany({
                where: { listId: list.id },
                orderBy: { position: 'asc' }
            });
            return { ...list, tasks };
        }));

        res.json(listsWithTasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createList = async (req, res) => {
    try {
        const { boardId } = req.params;
        const { title, position } = req.body;

        const newList = await prisma.list.create({
            data: { title, position, boardId },
        });

        logActivity(boardId, req.user.id, `Created list "${title}"`);
        emitBoardUpdate(boardId, { type: 'LIST_CREATED', list: newList });

        res.json(newList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateList = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, position } = req.body;
        const updatedList = await prisma.list.update({
            where: { id },
            data: { title, position }
        });
        // Logging update might be too noisy for reordering, maybe just title change?
        // Skipping logging for simple list updates to reduce noise

        const list = await prisma.list.findUnique({ where: { id } });
        if (list) emitBoardUpdate(list.boardId, { type: 'LIST_UPDATED', list: updatedList });

        res.json(updatedList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const deleteList = async (req, res) => {
    try {
        const { id } = req.params;
        const list = await prisma.list.findUnique({ where: { id } });

        await prisma.list.delete({ where: { id } });

        if (list) {
            logActivity(list.boardId, req.user.id, `Deleted list "${list.title}"`);
            emitBoardUpdate(list.boardId, { type: 'LIST_DELETED', listId: id });
        }

        res.json({ message: 'List deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getLists, createList, updateList, deleteList };
