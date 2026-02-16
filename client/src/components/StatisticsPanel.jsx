import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { calculateStatistics } from "../redux/slices/statisticsSlice";
import ActivityFeed from "./ActivityFeed";
import StatCard from "./StatCard";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

export default function StatisticsPanel() {
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.tasks);
  const statistics = useSelector((state) => state.statistics);

  useEffect(() => {
    dispatch(calculateStatistics(tasks));
  }, [tasks, dispatch]);

  const statusData = useMemo(() => {
    return [
      {
        name: "To Do",
        value: statistics.tasksByStatus.todo,
        color: "#64748b",
      },
      {
        name: "In Progress",
        value: statistics.tasksByStatus.in_progress,
        color: "#3b82f6",
      },
      {
        name: "Done",
        value: statistics.tasksByStatus.done,
        color: "#10b981",
      },
    ].filter((item) => item.value > 0);
  }, [statistics]);

  const priorityData = useMemo(() => {
    return [
      { name: "Low", value: statistics.tasksByPriority.low, color: "#94a3b8" },
      { name: "Medium", value: statistics.tasksByPriority.medium, color: "#3b82f6" },
      { name: "High", value: statistics.tasksByPriority.high, color: "#f97316" },
      { name: "Urgent", value: statistics.tasksByPriority.urgent, color: "#ef4444" },
    ].filter((item) => item.value > 0);
  }, [statistics]);

  if (statistics.totalTasks === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-16 text-center border border-slate-200 dark:border-slate-800">
        <TrendingUp className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
        <h3 className="text-2xl font-bold mb-3">
          No Statistics Yet
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          Start creating tasks to unlock analytics insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* TOP STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={statistics.totalTasks}
          icon={<Target className="w-6 h-6" />}
          color="blue"
          subtitle="Across workspace"
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
          color={statistics.overdueTasks > 0 ? "red" : "purple"}
          subtitle={
            statistics.overdueTasks > 0
              ? "Needs attention"
              : "All on track"
          }
        />
      </div>

      {/* PROGRESS SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-800">
        <h3 className="text-xl font-bold mb-6">Task Progress</h3>

        {["todo", "in_progress", "done"].map((key) => {
          const percentage = statistics.totalTasks
            ? (statistics.tasksByStatus[key] / statistics.totalTasks) * 100
            : 0;

          return (
            <div key={key} className="mb-6">
              <div className="flex justify-between mb-2 text-sm font-medium">
                <span>{key.replace("_", " ").toUpperCase()}</span>
                <span>{statistics.tasksByStatus[key]}</span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {statusData.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold mb-6">
              Task Distribution
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" outerRadius={100}>
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold mb-6">
              Priority Breakdown
            </h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid stroke="currentColor" opacity={0.1} />
                <XAxis dataKey="name" stroke="currentColor" />
                <YAxis stroke="currentColor" />
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

      {/* TEAM PERFORMANCE */}
      {statistics.tasksByAssignee.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-bold">
              Tasks by Team Member
            </h3>
          </div>

          <div className="space-y-5">
            {statistics.tasksByAssignee.map((a, i) => {
              const percent = a.count
                ? (a.completed / a.count) * 100
                : 0;

              return (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{a.name}</span>
                    <span className="text-sm text-slate-500">
                      {a.completed} / {a.count}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ActivityFeed />
    </div>
  );
}
