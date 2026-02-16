import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { useState } from 'react';
import api from '../api/axios';

const Column = ({ list, tasks, refreshBoard }) => {
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: list.id,
        data: {
            type: 'Column',
            list,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const createTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle) return;
        try {
            // Calculate position (append to end)
            const position = tasks.length > 0 ? tasks[tasks.length - 1].position + 1 : 0;

            await api.post(`/lists/${list.id}/tasks`, {
                title: newTaskTitle,
                position
            });
            setNewTaskTitle('');
            refreshBoard();
        } catch (err) {
            console.error("Failed to create task", err);
        }
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-gray-800 w-72 min-w-72 rounded-lg p-4 flex flex-col mr-4 max-h-full"
        >
            <div
                className="flex justify-between items-center mb-4 cursor-grab font-bold text-lg"
                {...attributes}
                {...listeners}
            >
                <h3>{list.title}</h3>
            </div>

            <div className="flex-1 overflow-y-auto min-h-20">
                <SortableContext
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>
            </div>

            <div className="mt-2">
                <form onSubmit={createTask}>
                    <input
                        type="text"
                        placeholder="Add a task..."
                        className="w-full bg-gray-700 text-sm p-2 rounded border border-gray-600 focus:outline-none"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                </form>
            </div>
        </div>
    );
};

export default Column;
