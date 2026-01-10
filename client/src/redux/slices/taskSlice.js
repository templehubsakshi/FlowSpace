import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  tasks: {
    todo: [],
    in_progress: [],
    done: []
  },
  selectedTask: null,
  isLoading: false,
  error: null
};

// Fetch tasks for workspace
export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (workspaceId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tasks/workspace/${workspaceId}`);
      return response.data.tasks;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Create task
export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Update task
export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ taskId, updates }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, updates);
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (taskId, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Move task (drag-and-drop)
export const moveTask = createAsyncThunk(
  'tasks/move',
  async ({ taskId, newStatus, newOrder }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/move`, {
        newStatus,
        newOrder
      });
      return response.data.task;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Add comment
export const addComment = createAsyncThunk(
  'tasks/addComment',
  async ({ taskId, text }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { text });
      return { taskId, comment: response.data.comment };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Delete comment
export const deleteComment = createAsyncThunk(
  'tasks/deleteComment',
  async ({ taskId, commentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}/comments/${commentId}`);
      return { taskId, commentId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

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
    // Optimistic update for drag-and-drop
    optimisticMoveTask: (state, action) => {
      const { taskId, sourceStatus, destinationStatus, sourceIndex, destinationIndex } = action.payload;
      
      // Find and remove task from source
      const taskToMove = state.tasks[sourceStatus][sourceIndex];
      if (!taskToMove) return; // Safety check

      // Remove from source column
      state.tasks[sourceStatus].splice(sourceIndex, 1);
      
      // Update task status
      taskToMove.status = destinationStatus;
      
      // Add to destination column at specific position
      state.tasks[destinationStatus].splice(destinationIndex, 0, taskToMove);
    },
    // Rollback failed move
    rollbackMoveTask: (state, action) => {
      const { taskId, sourceStatus, destinationStatus, sourceIndex } = action.payload;
      
      // Find task in destination
      const taskIndex = state.tasks[destinationStatus].findIndex(t => t._id === taskId);
      if (taskIndex === -1) return;
      
      // Remove from destination
      const [task] = state.tasks[destinationStatus].splice(taskIndex, 1);
      
      // Restore original status
      task.status = sourceStatus;
      
      // Put back in source at original position
      state.tasks[sourceStatus].splice(sourceIndex, 0, task);
    }
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const task = action.payload;
        state.tasks[task.status].unshift(task);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update task
    builder
      .addCase(updateTask.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        
        // Find and update task in correct status array
        Object.keys(state.tasks).forEach(status => {
          const index = state.tasks[status].findIndex(t => t._id === updatedTask._id);
          if (index !== -1) {
            // If status changed, move to new column
            if (state.tasks[status][index].status !== updatedTask.status) {
              state.tasks[status].splice(index, 1);
              state.tasks[updatedTask.status].unshift(updatedTask);
            } else {
              state.tasks[status][index] = updatedTask;
            }
          }
        });

        // Update selected task if it's the one being updated
        if (state.selectedTask?._id === updatedTask._id) {
          state.selectedTask = updatedTask;
        }
      });

    // Delete task
    builder
      .addCase(deleteTask.fulfilled, (state, action) => {
        const taskId = action.payload;
        
        // Remove from all status arrays
        Object.keys(state.tasks).forEach(status => {
          state.tasks[status] = state.tasks[status].filter(t => t._id !== taskId);
        });

        if (state.selectedTask?._id === taskId) {
          state.selectedTask = null;
        }
      });

    // Move task
    builder
      .addCase(moveTask.pending, (state) => {
        // Task already moved optimistically
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        const movedTask = action.payload;
        
        // Task already in correct position from optimistic update
        // Just update with server data
        Object.keys(state.tasks).forEach(status => {
          const index = state.tasks[status].findIndex(t => t._id === movedTask._id);
          if (index !== -1) {
            state.tasks[status][index] = movedTask;
          }
        });
      })
      .addCase(moveTask.rejected, (state, action) => {
        // Error handled in component with rollback
        state.error = action.payload;
      });

    // Add comment
    builder
      .addCase(addComment.fulfilled, (state, action) => {
        const { taskId, comment } = action.payload;
        
        if (state.selectedTask?._id === taskId) {
          state.selectedTask.comments.push(comment);
        }
      });

    // Delete comment
    builder
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { taskId, commentId } = action.payload;
        
        if (state.selectedTask?._id === taskId) {
          state.selectedTask.comments = state.selectedTask.comments.filter(
            c => c._id !== commentId
          );
        }
      });
  }
});

export const { 
  setSelectedTask, 
  clearError, 
  optimisticMoveTask,
  rollbackMoveTask  // ← NEW: Export rollback action
} = taskSlice.actions;

export default taskSlice.reducer;