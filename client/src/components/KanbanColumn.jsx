import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Plus } from 'lucide-react';

export default function KanbanColumn({ 
  status, 
  title, 
  tasks, 
  color,
  onTaskClick,
  onAddTask,
  dropIndicatorClass = ''  // Optional class for drop indicator styling
}) {
  const { setNodeRef } = useDroppable({ id: status });

  const colorClasses = {
    todo: 'bg-gray-50 border-gray-200',
    in_progress: 'bg-blue-50 border-blue-200',
    done: 'bg-green-50 border-green-200'
  };

  const headerColors = {
    todo: 'bg-gray-600',
    in_progress: 'bg-blue-600',
    done: 'bg-green-600'
  };

  return (
    <div 
      className={`flex flex-col h-full rounded-xl border-2 transition-all duration-200 ${colorClasses[status]} ${dropIndicatorClass}`}
      role="region"
      aria-label={`${title} column`}
    >
      {/* Column Header */}
      <div className={`${headerColors[status]} text-white p-4 rounded-t-xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 
              className="font-bold text-lg" 
              id={`${status}-heading`}  // Accessibility: label tasks list
            >
              {title}
            </h2>
            <span 
              className="bg-white bg-opacity-30 px-3 py-1 rounded-full text-sm font-semibold min-w-[32px] text-center"
              aria-label={`${tasks.length} tasks`}
            >
              {tasks.length}
            </span>
          </div>
          
          <button
            onClick={onAddTask}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all transform hover:scale-110 active:scale-95"
            title={`Add task to ${title}`}
            aria-label={`Add task to ${title}`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div
        ref={setNodeRef}
        className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar"
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
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No tasks yet</p>
              <p className="text-xs mt-1">Drag tasks here or click + to add</p>
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
}
