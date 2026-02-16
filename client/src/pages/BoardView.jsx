import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { socket } from '../socket';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import Column from '../components/Column';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ActivityLog from '../components/ActivityLog';

const BoardView = () => {
    const { id: boardId } = useParams();
    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [newListTitle, setNewListTitle] = useState('');

    // Modal & Activity State
    const [editingTask, setEditingTask] = useState(null);
    const [showActivity, setShowActivity] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // 3px movement to start drag
            },
        })
    );

    useEffect(() => {
        fetchBoardData();

        // Socket setup
        socket.connect();
        socket.emit('join-board', boardId);

        socket.on('board-updated', () => {
            console.log('Board updated event received');
            fetchBoardData();
        });

        return () => {
            socket.off('board-updated');
            socket.emit('leave-board', boardId);
            socket.disconnect();
        };
    }, [boardId]);

    const fetchBoardData = async () => {
        try {
            // Fetch lists with tasks (nested structure from our API)
            const resLists = await api.get(`/boards/${boardId}/lists`);
            // We also need board details for title etc, but let's assume lists return is main content
            // Assuming we might have a separate endpoint for board details or header
            // For now let's just use lists. Board title might require another fetch if not in lists.
            // Let's assume we can fetch local board details or another endpoint.
            // Just fetching lists is enough for the board view logic.
            // Attach onClick to tasks
            const listsWithHandlers = resLists.data.map(list => ({
                ...list,
                tasks: list.tasks.map(task => ({
                    ...task,
                    onClick: (t) => setEditingTask(t)
                }))
            }));
            setLists(listsWithHandlers);

            // Just for Title
            const resBoard = await api.get(`/boards`); // This returns all boards, suboptimal but works for mock
            const currentBoard = resBoard.data.find(b => b.id === boardId);
            setBoard(currentBoard);

        } catch (err) {
            console.error("Failed to fetch board", err);
        }
    };

    const createList = async (e) => {
        e.preventDefault();
        if (!newListTitle) return;
        try {
            const position = lists.length;
            await api.post(`/boards/${boardId}/lists`, { title: newListTitle, position });
            setNewListTitle('');
            fetchBoardData(); // Socket will also trigger this but local optimization ok
        } catch (err) {
            console.error(err);
        }
    }

    // Drag Handlers
    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);

        if (active.data.current?.type === 'Task') {
            setActiveTask(active.data.current.task);
        }
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';
        const isOverColumn = over.data.current?.type === 'Column';

        if (isActiveTask) {
            // Dropping a task
            // We need to find source list and dest list
            const sourceList = lists.find(list => list.tasks.find(t => t.id === activeId));
            let destList;

            if (isOverTask) {
                destList = lists.find(list => list.tasks.find(t => t.id === overId));
            } else if (isOverColumn) {
                destList = lists.find(list => list.id === overId);
            }

            if (!sourceList || !destList) return;

            // Optimistic Update can be complex, let's just call API and refresh for MVP
            // Actually, "Functional Requirements: Drag and drop tasks across lists" implies smooth UI.
            // But doing optimisitc update with `lists` state is good.

            // ... Logic for reordering tasks locally ...

            // API Call
            // If dragging task to another task, we need new index.
            // If dragging to a column (empty or end), index = end.

            // Simplified: Just update listId. Ordering within list is bonus.
            try {
                // If moving between lists or reordering
                // We update the task's listId and position.
                // Assuming we just put it at the end if dropped on column
                // or after the target task if dropped on task.

                await api.put(`/tasks/${activeId}`, {
                    listId: destList.id,
                    // position: newPosition // Todo: calculate position for precise sorting
                });

                // Trigger socket update from component? Server does it.
                fetchBoardData();
            } catch (err) {
                console.error("Move failed", err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col relative">
            <header className="p-4 bg-gray-800 shadow flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">{board?.title || 'Board'}</h1>
                    <button onClick={() => setShowActivity(!showActivity)} className="text-sm text-gray-400 hover:text-white border border-gray-600 px-2 py-1 rounded">
                        {showActivity ? 'Hide History' : 'Show History'}
                    </button>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="p-1 px-2 rounded bg-gray-700 border-gray-600 text-sm w-40"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="New List Title"
                        className="p-1 px-2 rounded bg-gray-700 border-gray-600 text-sm"
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                    />
                    <button onClick={createList} className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700">Add List</button>
                </div>
            </header>

            <main className="flex-1 overflow-x-auto p-4 flex items-start">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext items={lists.map(l => l.id)} strategy={horizontalListSortingStrategy}>
                        {lists.map(list => (
                            <Column
                                key={list.id}
                                list={list}
                                tasks={list.tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()))}
                                refreshBoard={fetchBoardData}
                            />
                        ))}
                    </SortableContext>

                    <DragOverlay>
                        {activeId && activeTask ? (
                            <TaskCard task={activeTask} />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </main>

            {editingTask && (
                <TaskModal
                    task={editingTask}
                    boardId={boardId}
                    onClose={() => setEditingTask(null)}
                    onUpdate={() => { fetchBoardData(); }}
                />
            )}

            <ActivityLog
                boardId={boardId}
                isOpen={showActivity}
                onClose={() => setShowActivity(false)}
            />
        </div>
    );
};

export default BoardView;
