import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { sleepApi } from '../sleepApi';

const initialState = {
  items: [],
  stats: null,
  status: 'idle',
  error: null,
};

export const fetchSleep = createAsyncThunk('sleep/list', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await sleepApi.list(params);
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load sleep');
  }
});

export const fetchSleepStats = createAsyncThunk('sleep/stats', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await sleepApi.stats(params);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load sleep stats');
  }
});

export const addSleep = createAsyncThunk('sleep/add', async (payload, { rejectWithValue }) => {
  try {
    const res = await sleepApi.add(payload);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to add sleep');
  }
});

export const updateSleep = createAsyncThunk('sleep/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await sleepApi.update(id, payload);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to update sleep');
  }
});

export const deleteSleep = createAsyncThunk('sleep/delete', async (id, { rejectWithValue }) => {
  try {
    await sleepApi.remove(id);
    return id;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to delete sleep');
  }
});

const slice = createSlice({
  name: 'sleep',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSleep.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSleep.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.stats = action.payload.stats;
      })
      .addCase(fetchSleep.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchSleepStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(addSleep.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(updateSleep.fulfilled, (state, action) => {
        state.items = state.items.map((x) => (x._id === action.payload._id ? action.payload : x));
      })
      .addCase(deleteSleep.fulfilled, (state, action) => {
        state.items = state.items.filter((x) => x._id !== action.payload);
      });
  },
});

export const selectSleep = (s) => s.sleep.items;
export const selectSleepStats = (s) => s.sleep.stats;

export default slice.reducer;

