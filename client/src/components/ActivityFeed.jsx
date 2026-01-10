import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare, 
  User,
  Clock
} from 'lucide-react';

export default function ActivityFeed() {
  const { tasks } = useSelector((state) => state.tasks);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Generate activity feed from tasks
    const allTasks = [
      ...tasks.todo,
      ...tasks.in_progress,
      ...tasks.done
    ];

    // Sort by most recent
    const sortedTasks = [...allTasks].sort((a, b) => 
      new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );

    // Generate activities
    const newActivities = sortedTasks.slice(0, 10).map(task => {
      const isNew = !task.updatedAt || task.updatedAt === task.createdAt;
      
      return {
        id: task._id,
        type: isNew ? 'created' : 'updated',
        task: task.title,
        user: task.creator?.name || 'Unknown',
        timestamp: task.updatedAt || task.createdAt,
        status: task.status,
        priority: task.priority
      };
    });

    setActivities(newActivities);
  }, [tasks]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'created':
        return <Plus className="w-4 h-4" />;
      case 'updated':
        return <Edit className="w-4 h-4" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4" />;
      case 'commented':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'created':
        return 'bg-green-100 text-green-600';
      case 'updated':
        return 'bg-blue-100 text-blue-600';
      case 'deleted':
        return 'bg-red-100 text-red-600';
      case 'commented':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-800 mb-2">No Activity Yet</h3>
        <p className="text-gray-600">Task activities will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-600" />
        Recent Activity
      </h3>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition"
          >
            {/* Icon */}
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">
                <span className="font-semibold">{activity.user}</span>
                {' '}
                {activity.type === 'created' ? 'created' : 'updated'}
                {' '}
                <span className="font-medium text-blue-600">{activity.task}</span>
              </p>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(activity.timestamp)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  activity.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  activity.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  activity.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {activity.priority}
                </span>
              </div>
            </div>

            {/* User Avatar */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {activity.user.charAt(0).toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}