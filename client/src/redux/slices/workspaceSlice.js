import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

//INtial state 
const initialState = {
    workspaces: [],
    currentWorkspace: null,
    isLoading: false,
    error: null
};

//fetch all workspaces if it contains store in response otheresise return errror 
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

//create workspace 
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

// get a worksapce
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

//update workspace 
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

//delete workspace 
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

//Invite memeber 
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

//remove member
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

//leave workspace
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

//kaunsa  workspace  open  hain  list  mein  kaunkauns  workspace  hain  loading error hain aur refresh hone par bhi workspace remember karta 

const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {  //yaha wo kaam hota hain jo direct change the data 
        setCurrentWorkspace: (state, action) => { //jab user koi workspace par click karta hain
            state.currentWorkspace = action.payload; //use current workspace mein set kar do
            if (action.payload) {
                localStorage.setItem(
                    'currentWorkspaceId',
                    action.payload._id
                ); //us workspace ki id ko browswe me sava kar lo taaki refresh hone par bhi rahe
            } else {
                localStorage.removeItem('currentWorkspaceId'); //agar null hain to hata do
            }
        },
        clearError: (state) => {
            state.error = null;
        }
    },

    extraReducers: (builder) => { //api se data aane bala part yahan server se data aata jaata hin 

        //Fetch workspaces
        builder
            .addCase(fetchWorkspaces.pending, (state) => { //jab kaam suru hota hain loading chalu puraan data hatta do
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkspaces.fulfilled, (state, action) => { //jab kaam puraan ho jata hain to loading band kar do aur data set kar do
                state.isLoading = false;
                state.workspaces = action.payload;

                //auto select workspace 
                if (action.payload.length > 0 && !state.currentWorkspace) {
                    const saveId = localStorage.getItem('currentWorkspaceId');

                    const workspace = saveId
                        ? action.payload.find(w => w._id === saveId)
                        : action.payload[0];

                    state.currentWorkspace = workspace || action.payload[0];
                }
            })
            .addCase(fetchWorkspaces.rejected, (state, action) => { //jab kaam fail ho jata hain to loading band kar do aur error set kar do
                state.isLoading = false;
                state.error = action.payload;
            });

        //create workspace
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

        //fetch single workspace
        builder
            .addCase(fetchWorkspace.fulfilled, (state, action) => {
                state.currentWorkspace = action.payload;
                //upadte in list too
                const index = state.workspaces.findIndex(
                    w => w._id === action.payload._id
                );
                if (index !== -1) {
                    state.workspaces[index] = action.payload;
                }
            });

        //update workspace 
        builder
            .addCase(updateWorkspace.fulfilled, (state, action) => {
                const index = state.workspaces.findIndex(
                    w => w._id === action.payload._id
                );
                if (index !== -1) {
                    state.workspaces[index] = action.payload;
                }
                if (state.currentWorkspace?._id === action.payload._id) {
                    state.currentWorkspace = action.payload;
                }
            });

        //delete workspace 
        builder
            .addCase(deleteWorkspace.fulfilled, (state, action) => {
                state.workspaces = state.workspaces.filter(
                    w => w._id !== action.payload
                );
                if (state.currentWorkspace?._id === action.payload) {
                    state.currentWorkspace = state.workspaces[0] || null;
                }
            });

        //Invite member 
        builder
            .addCase(inviteMember.fulfilled, (state, action) => {
                if (state.currentWorkspace?._id === action.payload._id) {
                    state.currentWorkspace = action.payload;
                }
                const index = state.workspaces.findIndex(
                    w => w._id === action.payload._id
                );
                if (index !== -1) {
                    state.workspaces[index] = action.payload;
                }
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
                state.workspaces = state.workspaces.filter(
                    w => w._id !== action.payload
                );
                if (state.currentWorkspace?._id === action.payload) {
                    state.currentWorkspace = state.workspaces[0] || null;
                }
            });
    }
});

export const { setCurrentWorkspace, clearError } = workspaceSlice.actions;
export default workspaceSlice.reducer;
