import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    workspaces: [],
    currentWorkspace: null,
    isLoading: false,
    error: null
};

export const fetchWorkspaces = createAsyncThunk(
    'workspace/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/workspaces');
            return response.data.workspaces;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createWorkspace = createAsyncThunk(
    'workspace/create',
    async ({ name, description }, { rejectWithValue }) => {
        try {
            const response = await api.post('/workspaces', { name, description });
            return response.data.workspace;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchWorkspace = createAsyncThunk(
    'workspace/fetchOne',
    async (workspaceId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/workspaces/${workspaceId}`);
            return response.data.workspace;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateWorkspace = createAsyncThunk(
    'workspace/update',
    async ({ workspaceId, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/workspaces/${workspaceId}`, data);
            return response.data.workspace;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteWorkspace = createAsyncThunk(
    'workspace/delete',
    async (workspaceId, { rejectWithValue }) => {
        try {
            await api.delete(`/workspaces/${workspaceId}`);
            return workspaceId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const inviteMember = createAsyncThunk(
    'workspace/inviteMember',
    async ({ workspaceId, email, role }, { rejectWithValue }) => {
        try {
            const response = await api.post(
                `/workspaces/${workspaceId}/invite`,
                { email, role }
            );
            return response.data.workspace;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const removeMember = createAsyncThunk(
    'workspace/removeMember',
    async ({ workspaceId, memberId }, { rejectWithValue }) => {
        try {
            await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
            return memberId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

export const leaveWorkspace = createAsyncThunk(
    'workspace/leave',
    async (workspaceId, { rejectWithValue }) => {
        try {
            await api.post(`/workspaces/${workspaceId}/leave`);
            return workspaceId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

// NEW: Owner kisi member ka role change kare — member → admin ya admin → member
export const updateMemberRole = createAsyncThunk(
    'workspace/updateMemberRole',
    async ({ workspaceId, memberId, role }, { rejectWithValue }) => {
        try {
            const response = await api.patch(
                `/workspaces/${workspaceId}/members/${memberId}/role`,
                { role }
            );
            return response.data.workspace;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        setCurrentWorkspace: (state, action) => {
            state.currentWorkspace = action.payload;
            if (action.payload) {
                localStorage.setItem('currentWorkspaceId', action.payload._id);
            } else {
                localStorage.removeItem('currentWorkspaceId');
            }
        },
        clearError: (state) => {
            state.error = null;
        }
    },

    extraReducers: (builder) => {

        // Fetch workspaces
        builder
            .addCase(fetchWorkspaces.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkspaces.fulfilled, (state, action) => {
                state.isLoading = false;
                state.workspaces = action.payload;

                if (action.payload.length > 0 && !state.currentWorkspace) {
                    const saveId = localStorage.getItem('currentWorkspaceId');
                    const workspace = saveId
                        ? action.payload.find(w => w._id === saveId)
                        : action.payload[0];
                    state.currentWorkspace = workspace || action.payload[0];
                }
            })
            .addCase(fetchWorkspaces.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });

        // Create workspace
        builder
            .addCase(createWorkspace.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createWorkspace.fulfilled, (state, action) => {
                state.isLoading = false;
                state.workspaces.unshift(action.payload);
                state.currentWorkspace = action.payload;
                localStorage.setItem('currentWorkspaceId', action.payload._id);
            })
            .addCase(createWorkspace.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });

        // Fetch single workspace
        builder
            .addCase(fetchWorkspace.fulfilled, (state, action) => {
                state.currentWorkspace = action.payload;
                const index = state.workspaces.findIndex(w => w._id === action.payload._id);
                if (index !== -1) state.workspaces[index] = action.payload;
            });

        // Update workspace
        builder
            .addCase(updateWorkspace.fulfilled, (state, action) => {
                const index = state.workspaces.findIndex(w => w._id === action.payload._id);
                if (index !== -1) state.workspaces[index] = action.payload;
                if (state.currentWorkspace?._id === action.payload._id) {
                    state.currentWorkspace = action.payload;
                }
            });

        // Delete workspace
        builder
            .addCase(deleteWorkspace.fulfilled, (state, action) => {
                state.workspaces = state.workspaces.filter(w => w._id !== action.payload);
                if (state.currentWorkspace?._id === action.payload) {
                    state.currentWorkspace = state.workspaces[0] || null;
                }
            });

        // Invite member
        builder
            .addCase(inviteMember.fulfilled, (state, action) => {
                if (state.currentWorkspace?._id === action.payload._id) {
                    state.currentWorkspace = action.payload;
                }
                const index = state.workspaces.findIndex(w => w._id === action.payload._id);
                if (index !== -1) state.workspaces[index] = action.payload;
            });

        // Remove member
        builder
            .addCase(removeMember.fulfilled, (state, action) => {
                if (state.currentWorkspace) {
                    state.currentWorkspace.members =
                        state.currentWorkspace.members.filter(
                            m => m.user._id !== action.payload
                        );
                }
            });

        // Leave workspace
        builder
            .addCase(leaveWorkspace.fulfilled, (state, action) => {
                state.workspaces = state.workspaces.filter(w => w._id !== action.payload);
                if (state.currentWorkspace?._id === action.payload) {
                    state.currentWorkspace = state.workspaces[0] || null;
                }
            });

        // Update member role — server updated workspace return karta hai,
        // dono currentWorkspace aur workspaces list update karo
        builder
            .addCase(updateMemberRole.fulfilled, (state, action) => {
                if (state.currentWorkspace?._id === action.payload._id) {
                    state.currentWorkspace = action.payload;
                }
                const index = state.workspaces.findIndex(w => w._id === action.payload._id);
                if (index !== -1) state.workspaces[index] = action.payload;
            });
    }
});

export const { setCurrentWorkspace, clearError } = workspaceSlice.actions;
export default workspaceSlice.reducer;