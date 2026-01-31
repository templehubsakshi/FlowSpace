// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import api from '../../services/api';

// // Initial state
// const initialState = {
//   user: null,
//   isAuthenticated: false,
//   isLoading: false,
//   error: null
// };

// // Async: Signup
// export const signup = createAsyncThunk(
//   'auth/signup',
//   async ({ name, email, password }, { rejectWithValue }) => {
//     try {
//       const response = await api.post('/auth/signup', { name, email, password });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Signup failed');
//     }
//   }
// );

// // Async: Login
// export const login = createAsyncThunk(
//   'auth/login',
//   async ({ email, password }, { rejectWithValue }) => {
//     try {
//       const response = await api.post('/auth/login', { email, password });
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || 'Login failed');
//     }
//   }
// );

// // Async: Check Auth (on app load)
// export const checkAuth = createAsyncThunk(
//   'auth/checkAuth',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.get('/auth/me');
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Async: Logout
// export const logout = createAsyncThunk(
//   'auth/logout',
//   async (_, { rejectWithValue }) => {
//     try {
//       await api.post('/auth/logout');
//       return null;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message);
//     }
//   }
// );

// // Create slice
// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     }
//   },
//   extraReducers: (builder) => {
//     // Signup
//     builder
//       .addCase(signup.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(signup.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isAuthenticated = true;
//         state.user = action.payload.user;
//       })
//       .addCase(signup.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       });

//     // Login
//     builder
//       .addCase(login.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(login.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isAuthenticated = true;
//         state.user = action.payload.user;
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.payload;
//       });

//     // Check Auth
//     builder
//       .addCase(checkAuth.fulfilled, (state, action) => {
//         state.isAuthenticated = true;
//         state.user = action.payload.user;
//       })
//       .addCase(checkAuth.rejected, (state) => {
//         state.isAuthenticated = false;
//         state.user = null;
//       });

//     // Logout
//     builder
//       .addCase(logout.fulfilled, (state) => {
//         state.isAuthenticated = false;
//         state.user = null;
//       });
//   }
// });

// export const { clearError } = authSlice.actions;
// export default authSlice.reducer;
// //createAsyncThunk used for api call automatically create three action types pending,fulfilled,rejected
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state - Read from localStorage on app load
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null, // ⚠️ ADD THIS
  isAuthenticated: !!localStorage.getItem('token'), // ⚠️ UPDATE THIS
  isLoading: false,
  error: null
};

// Async: Signup
export const signup = createAsyncThunk(
  'auth/signup',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      return response.data; // Should return { user, token }
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
      return response.data; // Should return { user, token }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Async: Check Auth (on app load)
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
      await api.post('/auth/logout');
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Create slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token; // ⚠️ SAVE TOKEN
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token); // ⚠️ SAVE TO LOCALSTORAGE
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token; // ⚠️ SAVE TOKEN
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token); // ⚠️ SAVE TO LOCALSTORAGE
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Check Auth
    builder
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        // Token already in localStorage from login
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null; // ⚠️ CLEAR TOKEN
        
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token'); 
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;