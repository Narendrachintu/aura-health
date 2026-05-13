import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { caloriesApi } from '../caloriesApi';

const initialState = {
  items: [],
  stats: null,
  status: 'idle',
  error: null,
};

export const fetchCalories = createAsyncThunk('calories/list', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await caloriesApi.list(params);
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load calories');
  }
});

export const fetchCalorieStats = createAsyncThunk('calories/stats', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await caloriesApi.stats(params);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load calorie stats');
  }
});

export const addCalorie = createAsyncThunk('calories/add', async (payload, { rejectWithValue }) => {
  try {
    const res = await caloriesApi.add(payload);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to add calorie');
  }
});

export const updateCalorie = createAsyncThunk('calories/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await caloriesApi.update(id, payload);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to update calorie');
  }
});

export const deleteCalorie = createAsyncThunk('calories/delete', async (id, { rejectWithValue }) => {
  try {
    await caloriesApi.remove(id);
    return id;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to delete calorie');
  }
});

const slice = createSlice({
  name: 'calories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCalories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.stats = action.payload.stats;
      })
      .addCase(fetchCalories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCalorieStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(addCalorie.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateCalorie.fulfilled, (state, action) => {
        state.items = state.items.map((x) => (x._id === action.payload._id ? action.payload : x));
      })
      .addCase(deleteCalorie.fulfilled, (state, action) => {
        state.items = state.items.filter((x) => x._id !== action.payload);
      });
  },
});

export const selectCalories = (s) => s.calories.items;
export const selectCalorieStats = (s) => s.calories.stats;

export default slice.reducer;

