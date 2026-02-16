import { useState, useEffect } from 'react';
import api from '../api/axios';

const TaskModal = ({ task, boardId, onClose, onUpdate }) => {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [assigneeId, setAssigneeId] = useState(task.assigneeId || '');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    }

    const handleSave = async () => {
        try {
            const updated = await api.put(`/tasks/${task.id}`, {
                title,
                description,
                assigneeId: assigneeId || null,
                listId: task.listId, // Required by backend validator if rigorous, but maybe safe if optional
                position: task.position
            });
            onUpdate(updated.data);
            onClose();
        } catch (err) {
            console.error("Failed to update task", err);
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/tasks/${task.id}`);
            onUpdate(null, task.id); // Signal delete
            onClose();
        } catch (err) {
            console.error("Failed to delete", err);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-white">
                <h2 className="text-xl font-bold mb-4">Edit Task</h2>

                <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-1">Title</label>
                    <input
                        type="text"
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-1">Description</label>
                    <textarea
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none h-24"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-400 text-sm mb-1">Assignee</label>
                    <select
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none"
                        value={assigneeId}
                        onChange={(e) => setAssigneeId(e.target.value)}
                    >
                        <option value="">Unassigned</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.username}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-between mt-6">
                    <button onClick={handleDelete} className="text-red-400 hover:text-red-300">Delete Task</button>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
                        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;
