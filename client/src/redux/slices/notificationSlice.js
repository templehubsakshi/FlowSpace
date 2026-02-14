import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ─────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async ({ page = 1, limit = 20, workspace } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (workspace) params.workspace = workspace;

      const response = await api.get('/notifications', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.patch(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (workspace = null, { rejectWithValue }) => {
    try {
      const body = workspace ? { workspace } : {};
      await api.patch('/notifications/mark-all-read', body);
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (workspace = null, { rejectWithValue }) => {
    try {
      const body = workspace ? { workspace } : {};
      await api.delete('/notifications', { data: body });
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],           // Array of notification objects
    unreadCount: 0,     // Number shown on bell badge
    isLoading: false,
    error: null,
  },
  reducers: {
    // Called from the Socket.IO listener hook when a new notification arrives
    addNotification: (state, action) => {
      state.list.unshift(action.payload); // Add to the top
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch unread count
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    // Mark single as read
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const notification = state.list.find((n) => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // Mark all as read
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.list.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    });

    // Delete single notification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const index = state.list.findIndex((n) => n._id === action.payload);
      if (index !== -1) {
        if (!state.list[index].isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.list.splice(index, 1);
      }
    });

    // Clear all notifications
    builder.addCase(clearAllNotifications.fulfilled, (state) => {
      state.list = [];
      state.unreadCount = 0;
    });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;