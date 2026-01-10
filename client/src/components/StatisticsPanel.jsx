import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { calculateStatistics } from '../redux/slices/statisticsSlice';
import ActivityFeed from './ActivityFeed';
import StatCard from './StatCard';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Target,
  TrendingUp,
  Users
} from 'lucide-react';

export default function StatisticsPanel() {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.tasks);
  const statistics = useSelector((state) => state.statistics);

  // Calculate statistics when tasks change
  useEffect(() => {
    dispatch(calculateStatistics(tasks));
  }, [tasks, dispatch]);

  // Chart colors
  const STATUS_COLORS = {
    'To Do': '#6b7280',
    'In Progress': '#3b82f6',
    'Done': '#10b981'
  };

  const PRIORITY_COLORS = {
    low: '#9ca3af',
    medium: '#3b82f6',
    high: '#f97316',
    urgent: '#ef4444'
  };

  // Prepare data for charts
  const statusData = [
    { name: 'To Do', value: statistics.tasksByStatus.todo, color: STATUS_COLORS['To Do'] },
    { name: 'In Progress', value: statistics.tasksByStatus.in_progress, color: STATUS_COLORS['In Progress'] },
    { name: 'Done', value: statistics.tasksByStatus.done, color: STATUS_COLORS['Done'] }
  ].filter(item => item.value > 0);

  const priorityData = [
    { name: 'Low', value: statistics.tasksByPriority.low, color: PRIORITY_COLORS.low },
    { name: 'Medium', value: statistics.tasksByPriority.medium, color: PRIORITY_COLORS.medium },
    { name: 'High', value: statistics.tasksByPriority.high, color: PRIORITY_COLORS.high },
    { name: 'Urgent', value: statistics.tasksByPriority.urgent, color: PRIORITY_COLORS.urgent }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={statistics.totalTasks}
          icon={<Target className="w-6 h-6" />}
          color="blue"
          subtitle="Across all columns"
        />

        <StatCard
          title="Completion Rate"
          value={`${statistics.completionRate}%`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="green"
          subtitle={`${statistics.tasksByStatus.done} completed`}
        />

        <StatCard
          title="In Progress"
          value={statistics.tasksByStatus.in_progress}
          icon={<Clock className="w-6 h-6" />}
          color="orange"
          subtitle="Active tasks"
        />

        <StatCard
          title="Overdue"
          value={statistics.overdueTasks}
          icon={<AlertTriangle className="w-6 h-6" />}
          color={statistics.overdueTasks > 0 ? 'red' : 'green'}
          subtitle={statistics.overdueTasks > 0 ? 'Needs attention' : 'All on track'}
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Task Progress</h3>
        <div className="space-y-4">
          {/* To Do */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">To Do</span>
              <span className="text-sm font-bold text-gray-800">
                {statistics.tasksByStatus.todo} tasks
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gray-600 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${statistics.totalTasks > 0 ? (statistics.tasksByStatus.todo / statistics.totalTasks) * 100 : 0}%` 
                }}
              />
            </div>
          </div>

          {/* In Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-blue-600">In Progress</span>
              <span className="text-sm font-bold text-gray-800">
                {statistics.tasksByStatus.in_progress} tasks
              </span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${statistics.totalTasks > 0 ? (statistics.tasksByStatus.in_progress / statistics.totalTasks) * 100 : 0}%` 
                }}
              />
            </div>
          </div>

          {/* Done */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-green-600">Done</span>
              <span className="text-sm font-bold text-gray-800">
                {statistics.tasksByStatus.done} tasks
              </span>
            </div>
            <div className="w-full bg-green-100 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${statistics.totalTasks > 0 ? (statistics.tasksByStatus.done / statistics.totalTasks) * 100 : 0}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Distribution Pie Chart */}
        {statusData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Task Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Priority Breakdown */}
        {priorityData.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Priority Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tasks by Assignee */}
      {statistics.tasksByAssignee.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-800">Tasks by Team Member</h3>
          </div>
          <div className="space-y-4">
            {statistics.tasksByAssignee.map((assignee, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {assignee.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{assignee.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-bold text-gray-800">{assignee.completed}</span>
                    <span> / {assignee.count} completed</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${assignee.count > 0 ? (assignee.completed / assignee.count) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
<ActivityFeed />
      {/* Empty State */}
      {statistics.totalTasks === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Data Yet</h3>
          <p className="text-gray-600">
            Create some tasks to see statistics and insights
          </p>
        </div>
      )}
    </div>
  );
}