import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [boards, setBoards] = useState([]);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { logout, user } = useAuth();

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const res = await api.get('/boards');
            // Handle both array (legacy) and paginated object
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setBoards(data);
        } catch (err) {
            console.error(err);
        }
    };

    const createBoard = async (e) => {
        e.preventDefault();
        if (!newBoardTitle) return;
        try {
            await api.post('/boards', { title: newBoardTitle });
            setNewBoardTitle('');
            fetchBoards();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredBoards = boards.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Welcome, {user?.username}</h1>
                <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Logout</button>
            </div>

            <div className="mb-8 flex gap-4">
                <form onSubmit={createBoard} className="flex gap-4 flex-1">
                    <input
                        type="text"
                        placeholder="New Board Title"
                        className="p-2 rounded bg-gray-800 border border-gray-700 text-white flex-1 max-w-md"
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">Create Board</button>
                </form>
                <input
                    type="text"
                    placeholder="Search Boards..."
                    className="p-2 rounded bg-gray-800 border border-gray-700 text-white w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredBoards.map((board) => (
                    <Link key={board.id} to={`/board/${board.id}`} className="block">
                        <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition cursor-pointer h-32 flex flex-col justify-between">
                            <h3 className="text-xl font-bold">{board.title}</h3>
                            <p className="text-gray-400 text-sm">Created: {new Date(board.createdAt).toLocaleDateString()}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
