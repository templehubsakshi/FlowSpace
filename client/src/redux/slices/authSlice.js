import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// No localStorage for token — cookie handles auth.
// Only user object (non-sensitive) is cached for UI speed.
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: false, // Never trust localStorage for auth status
  isLoading: true,        // Start true so App.jsx waits for checkAuth
  error: null
};

// Async: Signup
export const signup = createAsyncThunk(
  'auth/signup',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

// Async: Login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Async: Check Auth (on every app load — verifies cookie with backend)
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Async: Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout'); // Backend clears httpOnly cookie
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // For force-logout from api.js 401 interceptor.
    // store.js rootReducer watches for 'auth/forceLogout'
    // and resets ALL slices — not just auth.
    forceLogout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isLoading = false;
      localStorage.removeItem('user');
      localStorage.removeItem('currentWorkspaceId');
    }
  },
  extraReducers: (builder) => {

    // ── Signup ──────────────────────────────────────────
    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── Login ───────────────────────────────────────────
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // ── Check Auth ──────────────────────────────────────
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        localStorage.removeItem('user');
        localStorage.removeItem('currentWorkspaceId');
      });

    // ── Logout ──────────────────────────────────────────
    // Note: store.js rootReducer intercepts 'auth/logout/fulfilled'
    // and 'auth/logout/rejected' to reset ALL slices via state = undefined.
    // These cases handle only the auth slice's own cleanup.
    builder
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.isLoading = false;
        localStorage.removeItem('user');
        localStorage.removeItem('currentWorkspaceId');
      })
      .addCase(logout.rejected, (state) => {
        // Even if API call fails, clear local state
        state.isAuthenticated = false;
        state.user = null;
        state.isLoading = false;
        localStorage.removeItem('user');
        localStorage.removeItem('currentWorkspaceId');
      });
  }
});

export const { clearError, forceLogout } = authSlice.actions;
export default authSlice.reducer;