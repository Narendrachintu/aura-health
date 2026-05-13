import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { workoutsApi } from '../workoutsApi';

const initialState = {
  items: [],
  stats: null,
  status: 'idle',
  error: null,
};

export const fetchWorkouts = createAsyncThunk('workouts/list', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await workoutsApi.list(params);
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load workouts');
  }
});

export const fetchWorkoutStats = createAsyncThunk('workouts/stats', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await workoutsApi.stats(params);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load workout stats');
  }
});

export const addWorkout = createAsyncThunk('workouts/add', async (payload, { rejectWithValue }) => {
  try {
    const res = await workoutsApi.add(payload);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to add workout');
  }
});

export const updateWorkout = createAsyncThunk('workouts/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await workoutsApi.update(id, payload);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to update workout');
  }
});

export const deleteWorkout = createAsyncThunk('workouts/delete', async (id, { rejectWithValue }) => {
  try {
    const res = await workoutsApi.remove(id);
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to delete workout');
  }
});

const slice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkouts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWorkouts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.stats = action.payload.stats;
      })
      .addCase(fetchWorkouts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchWorkoutStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(addWorkout.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateWorkout.fulfilled, (state, action) => {
        state.items = state.items.map((x) => (x._id === action.payload._id ? action.payload : x));
      })
      .addCase(deleteWorkout.fulfilled, (state, action) => {
        if (action.payload?.message) {
          // optimistic cleanup by id is handled by caller
        }
      });
  },
});

export const selectWorkouts = (s) => s.workouts.items;
export const selectWorkoutStats = (s) => s.workouts.stats;

export default slice.reducer;

