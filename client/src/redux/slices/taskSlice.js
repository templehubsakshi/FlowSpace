import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  tasks: {
    todo: [],
    'in-progress': [],
    done: [],
  },
  selectedTask: null,
  // Workspace whose tasks we are currently loading/showing. Used to drop late
  // responses of a previous workspace (fast A→B switch: A's slower response
  // used to overwrite B's board).
  activeWorkspaceId: null,
  isLoading: false,
  error: null,
};

const normalizeTasksPayload = (tasks = {}) => ({
  todo: tasks.todo || [],
  // FIX: `tasks.in-progress` is the EXPRESSION `tasks.in - progress` (ReferenceError:
  // progress is not defined) whenever tasks['in-progress'] was falsy.
  'in-progress': tasks['in-progress'] || [],
  done: tasks.done || [],
});

const ensureStatusBucket = (state, status) => {
  if (!state.tasks[status]) {
    state.tasks[status] = [];
  }
};

const removeTaskFromAllColumns = (state, taskId) => {
  Object.keys(state.tasks).forEach((status) => {
    state.tasks[status] = state.tasks[status].filter((task) => task._id !== taskId);
  });
};

const removeCommentFromState = (state, { taskId, commentId }) => {
  if (state.selectedTask?._id === taskId && state.selectedTask.comments) {
    state.selectedTask.comments = state.selectedTask.comments.filter((c) => c._id !== commentId);
  }
  Object.keys(state.tasks).forEach((status) => {
    const idx = state.tasks[status].findIndex((t) => t._id === taskId);
    if (idx !== -1 && state.tasks[status][idx].comments) {
      state.tasks[status][idx].comments = state.tasks[status][idx].comments.filter((c) => c._id !== commentId);
    }
  });
};

const findTaskWithStatus = (state, taskId) => {
  for (const status of Object.keys(state.tasks)) {
    const index = state.tasks[status].findIndex((task) => task._id === taskId);
    if (index !== -1) {
      return { status, index, task: state.tasks[status][index] };
    }
  }
  return null;
};

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/workspace/${workspaceId}`);
      return response.data.tasks;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ taskId, updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updates);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const moveTask = createAsyncThunk(
  'tasks/move',
  async ({ taskId, newStatus, newOrder }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/move`, {
        newStatus,
        newOrder,
      });
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move task');
    }
  }
);

export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, text, mentions = [] }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { text, mentions });
      return { taskId, comment: response.data.comment };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'tasks/deleteComment',
  async ({ taskId, commentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}/comments/${commentId}`);
      return { taskId, commentId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    clearTasks: (state) => {
      state.tasks = { todo: [], 'in-progress': [], done: [] };
      state.selectedTask = null;
      state.activeWorkspaceId = null;
    },

    addTaskFromSocket: (state, action) => {
      const task = action.payload;
      ensureStatusBucket(state, task.status);

      const existing = findTaskWithStatus(state, task._id);
      if (existing) {
        removeTaskFromAllColumns(state, task._id);
      }

      // New tasks are appended server-side (order = last), so append here too —
      // unshift() showed them at the top until the next refresh.
      state.tasks[task.status].push(task);
    },

    // Full task object from the server (`task:updated`). A status change via the
    // edit form is placed at the END of the destination column (same as server).
    updateTaskFromSocket: (state, action) => {
      const updatedTask = action.payload;
      const found = findTaskWithStatus(state, updatedTask._id);

      ensureStatusBucket(state, updatedTask.status);

      if (found) {
        if (found.status !== updatedTask.status) {
          state.tasks[found.status].splice(found.index, 1);
          state.tasks[updatedTask.status].push(updatedTask);
        } else {
          state.tasks[found.status][found.index] = updatedTask;
        }
      } else {
        state.tasks[updatedTask.status].push(updatedTask);
      }

      if (state.selectedTask?._id === updatedTask._id) {
        state.selectedTask = updatedTask;
      }
    },

    // `task:moved` from another user. FIX: the old handler only patched `status`
    // and put the card at the TOP of the column (it had no order), so remote
    // boards disagreed with the DB until refresh. The server now sends the full
    // task plus the target index.
    moveTaskFromSocket: (state, action) => {
      const { task, newOrder } = action.payload;
      removeTaskFromAllColumns(state, task._id);
      ensureStatusBucket(state, task.status);

      const column = state.tasks[task.status];
      const index = Number.isInteger(newOrder)
        ? Math.min(Math.max(newOrder, 0), column.length)
        : column.length;
      column.splice(index, 0, task);

      if (state.selectedTask?._id === task._id) {
        state.selectedTask = task;
      }
    },

    deleteTaskFromSocket: (state, action) => {
      const taskId = action.payload;
      removeTaskFromAllColumns(state, taskId);

      if (state.selectedTask?._id === taskId) {
        state.selectedTask = null;
      }
    },

    addCommentFromSocket: (state, action) => {
      const { taskId, comment } = action.payload;

      if (state.selectedTask?._id === taskId) {
        const exists = state.selectedTask.comments?.some((c) => c._id === comment._id);
        if (!exists) {
          if (!state.selectedTask.comments) state.selectedTask.comments = [];
          state.selectedTask.comments.push(comment);
        }
      }

      Object.keys(state.tasks).forEach((status) => {
        const taskIndex = state.tasks[status].findIndex((task) => task._id === taskId);
        if (taskIndex !== -1) {
          const exists = state.tasks[status][taskIndex].comments?.some(
            (c) => c._id === comment._id
          );

          if (!exists) {
            if (!state.tasks[status][taskIndex].comments) {
              state.tasks[status][taskIndex].comments = [];
            }
            state.tasks[status][taskIndex].comments.push(comment);
          }
        }
      });
    },

    deleteCommentFromSocket: (state, action) => {
      removeCommentFromState(state, action.payload);
    },

    optimisticMoveTask: (state, action) => {
      const {
        sourceStatus,
        destinationStatus,
        sourceIndex,
        destinationIndex,
      } = action.payload;

      ensureStatusBucket(state, sourceStatus);
      ensureStatusBucket(state, destinationStatus);

      const taskToMove = state.tasks[sourceStatus][sourceIndex];
      if (!taskToMove) return;

      state.tasks[sourceStatus].splice(sourceIndex, 1);

      const updatedTask = {
        ...taskToMove,
        status: destinationStatus,
      };

      state.tasks[destinationStatus].splice(destinationIndex, 0, updatedTask);

      if (state.selectedTask?._id === updatedTask._id) {
        state.selectedTask = updatedTask;
      }
    },

    rollbackMoveTask: (state, action) => {
      const { taskId, sourceStatus, destinationStatus, sourceIndex } = action.payload;

      ensureStatusBucket(state, sourceStatus);
      ensureStatusBucket(state, destinationStatus);

      const taskIndex = state.tasks[destinationStatus].findIndex(
        (task) => task._id === taskId
      );
      if (taskIndex === -1) return;

      const [task] = state.tasks[destinationStatus].splice(taskIndex, 1);

      const restoredTask = {
        ...task,
        status: sourceStatus,
      };

      state.tasks[sourceStatus].splice(sourceIndex, 0, restoredTask);

      if (state.selectedTask?._id === taskId) {
        state.selectedTask = restoredTask;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.activeWorkspaceId = action.meta.arg;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        // Ignore a late response for a workspace we have already switched away from
        if (state.activeWorkspaceId !== null && action.meta.arg !== state.activeWorkspaceId) return;
        state.isLoading = false;
        state.tasks = normalizeTasksPayload(action.payload);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        if (state.activeWorkspaceId !== null && action.meta.arg !== state.activeWorkspaceId) return;
        state.isLoading = false;
        state.error = action.payload;
      })

      // createTask
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const task = action.payload;

        ensureStatusBucket(state, task.status);
        // Dedupe (a live `task:created` may already have added it) and append:
        // the server stores new tasks at the END of the column, so unshift()
        // made the card jump from top to bottom after a refresh.
        removeTaskFromAllColumns(state, task._id);
        state.tasks[task.status].push(task);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // updateTask
      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const found = findTaskWithStatus(state, updatedTask._id);

        ensureStatusBucket(state, updatedTask.status);

        if (found) {
          if (found.status !== updatedTask.status) {
            state.tasks[found.status].splice(found.index, 1);
            state.tasks[updatedTask.status].push(updatedTask);
          } else {
            state.tasks[found.status][found.index] = updatedTask;
          }
        } else {
          state.tasks[updatedTask.status].push(updatedTask);
        }

        if (state.selectedTask?._id === updatedTask._id) {
          state.selectedTask = updatedTask;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload;
      })

      // deleteTask
      .addCase(deleteTask.fulfilled, (state, action) => {
        const deletedTaskId = action.payload;
        removeTaskFromAllColumns(state, deletedTaskId);

        if (state.selectedTask?._id === deletedTaskId) {
          state.selectedTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      })

      // moveTask
      .addCase(moveTask.pending, () => {
        // already handled optimistically
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        const movedTask = action.payload;
        const found = findTaskWithStatus(state, movedTask._id);

        ensureStatusBucket(state, movedTask.status);

        if (found) {
          if (found.status !== movedTask.status) {
            state.tasks[found.status].splice(found.index, 1);
            state.tasks[movedTask.status].unshift(movedTask);
          } else {
            state.tasks[found.status][found.index] = movedTask;
          }
        } else {
          state.tasks[movedTask.status].unshift(movedTask);
        }

        if (state.selectedTask?._id === movedTask._id) {
          state.selectedTask = movedTask;
        }
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.error = action.payload;
      })

      // addComment
      .addCase(addComment.fulfilled, (state, action) => {
        const { taskId, comment } = action.payload;

        if (state.selectedTask?._id === taskId) {
          const exists = state.selectedTask.comments?.some((c) => c._id === comment._id);
          if (!exists) {
            if (!state.selectedTask.comments) state.selectedTask.comments = [];
            state.selectedTask.comments.push(comment);
          }
        }

        Object.keys(state.tasks).forEach((status) => {
          const taskIndex = state.tasks[status].findIndex((task) => task._id === taskId);
          if (taskIndex !== -1) {
            const exists = state.tasks[status][taskIndex].comments?.some(
              (c) => c._id === comment._id
            );

            if (!exists) {
              if (!state.tasks[status][taskIndex].comments) {
                state.tasks[status][taskIndex].comments = [];
              }
              state.tasks[status][taskIndex].comments.push(comment);
            }
          }
        });
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload;
      })

      // deleteComment
      .addCase(deleteComment.fulfilled, (state, action) => {
        removeCommentFromState(state, action.payload);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedTask,
  clearError,
  clearTasks,
  optimisticMoveTask,
  rollbackMoveTask,
  addTaskFromSocket,
  updateTaskFromSocket,
  moveTaskFromSocket,
  deleteTaskFromSocket,
  addCommentFromSocket,
  deleteCommentFromSocket,
} = taskSlice.actions;

export default taskSlice.reducer;