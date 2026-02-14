import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

export default function KanbanColumn({ 
  status, 
  title, 
  tasks, 
  onTaskClick,
  onAddTask,
  onDeleteTask,
  workspaceId,
  dropIndicatorClass = ''
}) {
  const { setNodeRef } = useDroppable({ id: status });

  // Column body colors
  const columnColors = {
    todo: 'bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700',
    in_progress: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    done: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
  };

  // Header gradient colors (Modern UI)
  const headerGradients = {
    todo: 'from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800',
    in_progress: 'from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800',
    done: 'from-green-600 to-green-700 dark:from-green-700 dark:to-green-800'
  };

  return (
    <div 
      className={`
        flex flex-col h-full rounded-2xl border
        transition-all duration-300 shadow-sm hover:shadow-md
        ${columnColors[status]} ${dropIndicatorClass}
      `}
      role="region"
      aria-label={`${title} column`}
    >
      {/* ===== Header ===== */}
      <div className={`
        bg-gradient-to-r ${headerGradients[status]}
        text-white p-4 rounded-t-2xl
      `}>
        <div className="flex items-center justify-between">

          {/* Left Side */}
          <div className="flex items-center gap-3">
            <h2 
              className="font-bold text-lg tracking-wide" 
              id={`${status}-heading`}
            >
              {title}
            </h2>

            {/* Task Count */}
            <span 
              className="
                bg-white/25 backdrop-blur-sm
                px-3 py-1 rounded-full text-sm font-semibold
                min-w-[32px] text-center
              "
              aria-label={`${tasks.length} tasks`}
            >
              {tasks.length}
            </span>
          </div>

          {/* Add Task Button */}
          <button
            onClick={onAddTask}
            className="
              p-2 rounded-xl
              bg-white/10 hover:bg-white/20
              transition-all duration-200
              hover:scale-110 active:scale-95
            "
            title={`Add task to ${title}`}
            aria-label={`Add task to ${title}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== Task List ===== */}
      <div
        ref={setNodeRef}
        className="
          flex-1 p-4 space-y-3
          overflow-y-auto custom-scrollbar
        "
        style={{ minHeight: '400px' }}
        role="list"
        aria-labelledby={`${status}-heading`}
      >
        <SortableContext 
          items={tasks.map(t => t._id)} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.length > 0 ? (
            tasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => onTaskClick(task)}
                onDelete={onDeleteTask}
                workspaceId={workspaceId}
              />
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <p className="text-sm font-medium">No tasks yet</p>
              <p className="text-xs mt-1">
                Drag tasks here or click + to add
              </p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
