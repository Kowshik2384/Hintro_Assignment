const prisma = require('../prisma/client');

const getBoards = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // In a real DB, we would use skip/take. 
        // For mock store array, we slice, but Prisma Client Mock `findMany` logic in `client.js` 
        // might not support skip/take unless we implemented it.
        // Let's assume we implement it or just handle it here if 'prisma' was real.
        // Since prisma is our mock *client*, let's see if we can pass valid args.
        // Our mock client 'findMany' might ignore skip/take if not implemented.
        // Let's implement manual slicing here for the mock to be sure, 
        // OR update the mock client to support it. 
        // Updating mock client is better architecture.

        // However, to be safe and quick:
        const allBoards = await prisma.board.findMany({
            where: {} // Fetch all for manual pagination if mock doesn't support it
        });

        const paginatedBoards = allBoards.slice(skip, skip + limit);

        res.json({
            data: paginatedBoards,
            total: allBoards.length,
            page,
            limit,
            totalPages: Math.ceil(allBoards.length / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createBoard = async (req, res) => {
    try {
        const { title, description } = req.body;
        const newBoard = await prisma.board.create({
            data: { title, description, ownerId: req.user.id },
        });
        res.json(newBoard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getBoards, createBoard };
