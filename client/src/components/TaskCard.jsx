import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  GripVertical,
  Trash2,
  Eye,
  Sparkles
} from 'lucide-react';
import { memo, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';

function TaskCard({ task, onClick, onDelete, workspaceId }) {
  const [showActions, setShowActions] = useState(false);
  const { user } = useSelector(state => state.auth);

  const isMobile = useMemo(() => window.innerWidth < 768, []);

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
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityConfig = {
    low: {
      gradient: 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-400',
      border: 'border-slate-300 dark:border-slate-600'
    },
    medium: {
      gradient: 'from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
      border: 'border-blue-300 dark:border-blue-600'
    },
    high: {
      gradient: 'from-orange-100 to-orange-200 dark:from-orange-900/40 dark:to-orange-800/40',
      text: 'text-orange-700 dark:text-orange-300',
      dot: 'bg-orange-500',
      border: 'border-orange-300 dark:border-orange-600'
    },
    urgent: {
      gradient: 'from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40',
      text: 'text-red-700 dark:text-red-300',
      dot: 'bg-red-500',
      border: 'border-red-300 dark:border-red-600'
    }
  };

  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const canDelete = task.createdBy === user?._id || user?.role === 'admin';

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete task "${task.title}"?`)) {
      if (onDelete) await onDelete(task._id, workspaceId);
    }
  };

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
      onMouseEnter={() => !isMobile && setShowActions(true)}
      onMouseLeave={() => !isMobile && setShowActions(false)}
      className={`
        relative group
        bg-white dark:bg-slate-800
        border-2 ${priority.border}
        rounded-2xl p-5
        shadow-md hover:shadow-2xl
        transition-all duration-300 ease-out
        hover:-translate-y-1
        cursor-pointer
        ${isDragging ? 'shadow-2xl scale-105 rotate-2 ring-4 ring-blue-500/30' : ''}
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${priority.gradient} opacity-10 rounded-2xl`}></div>

      <div
        className={`
          absolute top-3 right-3 flex items-center gap-2
          transition-all duration-300
          ${isMobile ? 'opacity-100' : showActions ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <button
          onClick={handleViewDetails}
          className="p-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
        >
          <Eye className="w-4 h-4" />
        </button>

        {canDelete && (
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <div className="p-2 opacity-50 cursor-grab active:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${priority.gradient}`}>
            <div className={`w-2.5 h-2.5 rounded-full ${priority.dot} animate-pulse`}></div>
            <span className={`text-xs font-bold capitalize ${priority.text}`}>
              {task.priority}
            </span>
          </div>

          {isOverdue && (
            <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full animate-pulse">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs font-bold">Overdue</span>
            </div>
          )}
        </div>

        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-2 pr-24">
          {task.title}
        </h3>

        {task.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {task.description}
          </p>
        )}

        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {task.assignee && (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-bold truncate max-w-[80px]">
                  {task.assignee.name}
                </span>
              </div>
            )}

            {task.comments?.length > 0 && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-bold">{task.comments.length}</span>
              </div>
            )}
          </div>

          {task.dueDate && (
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
              isOverdue 
                ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' 
                : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(TaskCard);