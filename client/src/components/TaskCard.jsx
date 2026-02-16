import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TaskCard = ({ task }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => task.onClick && task.onClick(task)}
            className="bg-gray-700 p-3 mb-2 rounded shadow-sm hover:bg-gray-600 cursor-pointer active:cursor-grabbing border border-gray-600"
        >
            <div className="font-medium text-white">{task.title}</div>
            {task.description && <div className="text-xs text-gray-400 mt-1">{task.description}</div>}
            {task.assignee && <div className="text-xs bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full inline-block mt-2">{task.assignee.username}</div>}
        </div>
    );
};

export default TaskCard;
