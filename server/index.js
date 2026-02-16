const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const prisma = require('./prisma/client');

const http = require('http'); // Import http
const { initSocket } = require('./socket'); // Import socket init
const listRoutes = require('./routes/lists');
const taskRoutes = require('./routes/tasks');
const taskDirectRoutes = require('./routes/tasksDirect');

// ... imports remain the same

dotenv.config();
const app = express();
const server = http.createServer(app); // Create http server
initSocket(server); // Init socket

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Running');
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', require('./routes/boards')); // Assuming board routes file name
// List routes are nested under boards usually, but here I defined them with mergeParams to be mounted.
// Let's mount them such that:
// /api/boards/:boardId/lists -> listRoutes
app.use('/api/boards/:boardId/lists', listRoutes);
// /api/boards/:boardId/activity -> activityRoutes
app.use('/api/boards/:boardId/activity', require('./routes/activity'));
// /api/lists/:listId/tasks -> taskRoutes
app.use('/api/lists/:listId/tasks', taskRoutes);
// /api/tasks/:id -> taskDirectRoutes
app.use('/api/tasks', taskDirectRoutes);

server.listen(PORT, () => { // Listen on server, not app
    console.log(`Server running on port ${PORT}`);
});
