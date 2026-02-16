const { Server } = require("socket.io");

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // Allow all for dev
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("join-board", (boardId) => {
            socket.join(`board_${boardId}`);
            console.log(`Socket ${socket.id} joined board_${boardId}`);
        });

        socket.on("leave-board", (boardId) => {
            socket.leave(`board_${boardId}`);
            console.log(`Socket ${socket.id} left board_${boardId}`);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

// Helper middleware/function to emit events from controllers
const emitBoardUpdate = (boardId, data) => {
    if (io) {
        io.to(`board_${boardId}`).emit("board-updated", data);
    }
}

module.exports = { initSocket, getIO, emitBoardUpdate };
