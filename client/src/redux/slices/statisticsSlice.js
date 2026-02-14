import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  totalTasks: 0,
  completionRate: 0,
  overdueTasks: 0,
  tasksByStatus: {
    todo: 0,
    in_progress: 0,
    done: 0
  },
  tasksByPriority: {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0
  },
  tasksByAssignee: []
};

const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    calculateStatistics: (state, action) => {
      const tasks = action.payload;
      
      // Flatten all tasks
      const allTasks = [
        ...tasks.todo,
        ...tasks.in_progress,
        ...tasks.done
      ];

      // Total tasks
      state.totalTasks = allTasks.length;

      // Tasks by status
      state.tasksByStatus = {
        todo: tasks.todo.length,
        in_progress: tasks.in_progress.length,
        done: tasks.done.length
      };

      // Completion rate
      state.completionRate = state.totalTasks > 0
        ? Math.round((tasks.done.length / state.totalTasks) * 100)
        : 0;

      // Overdue tasks
      const now = new Date();
      state.overdueTasks = allTasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < now && 
        task.status !== 'done'
      ).length;

      // Tasks by priority
      // ✅ FIX: Use Object.hasOwn instead of hasOwnProperty
      state.tasksByPriority = {
        low: 0,
        medium: 0,
        high: 0,
        urgent: 0
      };
      allTasks.forEach(task => {
        if (Object.hasOwn(state.tasksByPriority, task.priority)) {
          state.tasksByPriority[task.priority]++;
        }
      });

      // Tasks by assignee
      const assigneeMap = {};
      allTasks.forEach(task => {
        if (task.assignee) {
          const name = task.assignee.name;
          if (!assigneeMap[name]) {
            assigneeMap[name] = { name, count: 0, completed: 0 };
          }
          assigneeMap[name].count++;
          if (task.status === 'done') {
            assigneeMap[name].completed++;
          }
        } else {
          if (!assigneeMap['Unassigned']) {
            assigneeMap['Unassigned'] = { name: 'Unassigned', count: 0, completed: 0 };
          }
          assigneeMap['Unassigned'].count++;
          if (task.status === 'done') {
            assigneeMap['Unassigned'].completed++;
          }
        }
      });

      state.tasksByAssignee = Object.values(assigneeMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 assignees
    }
  }
});

export const { calculateStatistics } = statisticsSlice.actions;
export default statisticsSlice.reducer;