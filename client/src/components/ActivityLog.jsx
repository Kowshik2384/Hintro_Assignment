import { useEffect, useState } from 'react';
import api from '../api/axios';

const ActivityLog = ({ boardId, isOpen, onClose }) => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        if (isOpen) fetchLogs();
    }, [isOpen]);

    const fetchLogs = async () => {
        try {
            const res = await api.get(`/boards/${boardId}/activity`);
            setLogs(res.data);
        } catch (err) {
            console.error("Failed to fetch activity", err);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-gray-800 shadow-xl p-4 overflow-y-auto border-l border-gray-700 z-40 transform transition-transform duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-white">Activity</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
            </div>
            <div className="space-y-3">
                {logs.length === 0 && <p className="text-gray-500 text-sm">No activity yet.</p>}
                {logs.map(log => (
                    <div key={log.id} className="text-sm border-b border-gray-700 pb-2">
                        <p className="text-gray-300">{log.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityLog;
