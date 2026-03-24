import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workspaceReducer from './slices/workspaceSlice';
import taskReducer from './slices/taskSlice';
import statisticsReducer from './slices/statisticsSlice';
import notificationsReducer from './slices/notificationSlice';

const appReducer = combineReducers({
  auth: authReducer,
  workspace: workspaceReducer,
  tasks: taskReducer,
  statistics: statisticsReducer,
  notifications: notificationsReducer,
});

// FIX: Reset ALL slices to initialState on logout.
// Previously store.js used configureStore({ reducer: {} }) directly,
// so only authSlice reset on logout — workspace/tasks/notifications
// stayed in memory. User B would see User A's data, AND the invite
// modal would send User A's stale workspaceId causing 403 errors.
const rootReducer = (state, action) => {
  if (
    action.type === 'auth/logout/fulfilled' ||
    action.type === 'auth/logout/rejected' || // clear even if API fails
    action.type === 'auth/forceLogout'
  ) {
    state = undefined; // every slice resets to its own initialState
  }
  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;