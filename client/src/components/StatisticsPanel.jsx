import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { calculateStatistics } from '../redux/slices/statisticsSlice';
import ActivityFeed from './ActivityFeed';
import StatCard from './StatCard';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { 
  CheckCircle2, Clock, AlertTriangle, Target,
  TrendingUp, Users, Award, Zap
} from 'lucide-react';

export default function StatisticsPanel() {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.tasks);
  const statistics = useSelector((state) => state.statistics);

  useEffect(() => {
    dispatch(calculateStatistics(tasks));
  }, [tasks, dispatch]);

  const STATUS_COLORS = {
    'To Do': '#64748b',
    'In Progress': '#3b82f6',
    'Done': '#10b981'
  };

  const PRIORITY_COLORS = {
    low: '#94a3b8',
    medium: '#3b82f6',
    high: '#f97316',
    urgent: '#ef4444'
  };

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
    <div className="space-y-6 animate-fadeIn">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl p-6 text-white shadow-xl transform hover:-translate-y-1 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
            <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          <p className="text-sm font-semibold opacity-90 mb-1">Total Tasks</p>
          <p className="text-4xl font-black mb-2">{statistics.totalTasks}</p>
          <p className="text-xs opacity-75">Across all columns</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-2xl p-6 text-white shadow-xl transform hover:-translate-y-1 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <Award className="w-5 h-5 text-yellow-300 animate-bounce" />
          </div>
          <p className="text-sm font-semibold opacity-90 mb-1">Completion Rate</p>
          <p className="text-4xl font-black mb-2">{statistics.completionRate}%</p>
          <p className="text-xs opacity-75">{statistics.tasksByStatus.done} completed</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-2xl p-6 text-white shadow-xl transform hover:-translate-y-1 transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-semibold opacity-90 mb-1">In Progress</p>
          <p className="text-4xl font-black mb-2">{statistics.tasksByStatus.in_progress}</p>
          <p className="text-xs opacity-75">Active tasks</p>
        </div>

        <div className={`bg-gradient-to-br ${statistics.overdueTasks > 0 ? 'from-red-500 to-red-600' : 'from-teal-500 to-teal-600'} dark:${statistics.overdueTasks > 0 ? 'from-red-600 to-red-700' : 'from-teal-600 to-teal-700'} rounded-2xl p-6 text-white shadow-xl transform hover:-translate-y-1 transition-all`}>
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-semibold opacity-90 mb-1">Overdue</p>
          <p className="text-4xl font-black mb-2">{statistics.overdueTasks}</p>
          <p className="text-xs opacity-75">
            {statistics.overdueTasks > 0 ? 'Needs attention' : 'All on track'}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border-2 border-slate-200 dark:border-slate-700">
        <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
          Task Progress
        </h3>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-3">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">To Do</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {statistics.tasksByStatus.todo} tasks
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-slate-500 to-slate-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                style={{
                  width: `${statistics.totalTasks ? (statistics.tasksByStatus.todo / statistics.totalTasks) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-3">
              <span className="text-sm font-bold text-blue-700 dark:text-blue-400">In Progress</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {statistics.tasksByStatus.in_progress} tasks
              </span>
            </div>
            <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                style={{
                  width: `${statistics.totalTasks ? (statistics.tasksByStatus.in_progress / statistics.totalTasks) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-3">
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Done</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {statistics.tasksByStatus.done} tasks
              </span>
            </div>
            <div className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                style={{
                  width: `${statistics.totalTasks ? (statistics.tasksByStatus.done / statistics.totalTasks) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {statusData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border-2 border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
              Task Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={statusData} 
                  dataKey="value" 
                  outerRadius={100} 
                  label 
                  strokeWidth={2}
                  stroke="white"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {priorityData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border-2 border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
              Priority Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontWeight="bold" />
                <YAxis stroke="#64748b" fontWeight="bold" />
                <Tooltip />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {statistics.tasksByAssignee.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border-2 border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Tasks by Team Member
            </h3>
          </div>

          <div className="space-y-5">
            {statistics.tasksByAssignee.map((a, i) => (
              <div key={i}>
                <div className="flex justify-between mb-3">
                  <span className="text-slate-900 dark:text-white font-bold text-lg">
                    {a.name}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 font-bold">
                    {a.completed} / {a.count}
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-4 rounded-full transition-all duration-500 shadow-lg"
                    style={{
                      width: `${a.count ? (a.completed / a.count) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ActivityFeed />

      {statistics.totalTasks === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-16 text-center border-2 border-slate-200 dark:border-slate-700">
          <TrendingUp className="w-24 h-24 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
          <h3 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-3">
            No Data Yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
            Create some tasks to see statistics and insights
          </p>
        </div>
      )}
    </div>
  );
}