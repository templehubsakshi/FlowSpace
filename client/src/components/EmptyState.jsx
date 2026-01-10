import { Plus, CheckCircle2, Clock, Target } from 'lucide-react';

export default function EmptyState({ status, onAddTask }) {
  const config = {
    todo: {
      icon: <Target className="w-16 h-16 text-gray-300" />,
      title: "No tasks to do",
      description: "Start by creating your first task",
      color: "text-gray-600"
    },
    in_progress: {
      icon: <Clock className="w-16 h-16 text-blue-300" />,
      title: "Nothing in progress",
      description: "Drag tasks here or create new ones",
      color: "text-blue-600"
    },
    done: {
      icon: <CheckCircle2 className="w-16 h-16 text-green-300" />,
      title: "No completed tasks yet",
      description: "Complete tasks to see them here",
      color: "text-green-600"
    }
  };

  const { icon, title, description, color } = config[status] || config.todo;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Animated Icon */}
      <div className="mb-4 animate-bounce">
        {icon}
      </div>

      {/* Title */}
      <h3 className={`text-lg font-semibold ${color} mb-2`}>
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-6 max-w-xs">
        {description}
      </p>

      {/* Action Button */}
      {onAddTask && (
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      )}

      {/* Decorative Elements */}
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
}