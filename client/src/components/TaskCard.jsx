import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, User, MessageSquare, AlertCircle, GripVertical, Edit2, Trash2, Eye } from 'lucide-react';
import { memo, useState } from 'react';
import { useSelector } from 'react-redux';

function TaskCard({ task, onClick, onDelete, workspaceId }) {
  const [showActions, setShowActions] = useState(false);
const { user } = useSelector(state => state.auth);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  // Priority colors
  const priorityConfig = {
    low: { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
    medium: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
    urgent: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' }
  };

  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  // Check if overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
const canDelete =
  task.createdBy === user?._id || user?.role === "admin";

  // ✅ HANDLE DELETE
  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent card click
    
    if (window.confirm(`Delete task: "${task.title}"?`)) {
      if (onDelete) {
        await onDelete(task._id, workspaceId);
      }
    }
  };

  // ✅ HANDLE VIEW DETAILS
  const handleViewDetails = (e) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}. Priority: ${task.priority}. Status: ${task.status}`}
      className={`
        bg-white rounded-lg p-4 shadow-sm border border-gray-200 group relative
        transition-all duration-200 ease-out
        hover:shadow-xl hover:scale-[1.02] hover:border-blue-300 hover:-translate-y-1
        active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isDragging ? 'shadow-2xl rotate-2 scale-105' : ''}
      `}
    >
      {/* ✅ QUICK ACTIONS (HOVER) */}
      <div className={`
        absolute top-2 right-2 flex items-center gap-1
        transition-opacity duration-200
        ${showActions ? 'opacity-100' : 'opacity-0'}
      `}>
        <button
          onClick={handleViewDetails}
          className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm"
          title="View Details"
          aria-label="View task details"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        
        {canDelete && (
  <button
    onClick={handleDelete}
    className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm"
    title="Delete Task"
    aria-label="Delete task"
  >
    <Trash2 className="w-3.5 h-3.5" />
  </button>
)}

        
        <div className="p-1.5 opacity-50 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${priority.bg}`}>
          <div className={`w-2 h-2 rounded-full ${priority.dot}`} />
          <span className={`text-xs font-medium ${priority.text}`}>
            {task.priority}
          </span>
        </div>

        {isOverdue && (
          <div className="text-red-500" title="Overdue">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition pr-20">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-3">
          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center gap-1" title={task.assignee.name}>
              <User className="w-3 h-3" />
              <span className="truncate max-w-[80px]">{task.assignee.name}</span>
            </div>
          )}

          {/* Comments count */}
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}>
            <Clock className="w-3 h-3" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap with memo and custom comparison function
export default memo(TaskCard, (prevProps, nextProps) => {
  return (
    prevProps.task._id === nextProps.task._id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.description === nextProps.task.description &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.assignee?._id === nextProps.task.assignee?._id &&
    prevProps.task.dueDate === nextProps.task.dueDate &&
    JSON.stringify(prevProps.task.tags) === JSON.stringify(nextProps.task.tags) &&
    prevProps.task.comments?.length === nextProps.task.comments?.length
  );
});