import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { waterApi } from '../waterApi';

const initialState = {
  items: [],
  today: [],
  stats: null,
  status: 'idle',
  error: null,
};

export const fetchWater = createAsyncThunk('water/list', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await waterApi.list(params);
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load water');
  }
});

export const fetchTodayWater = createAsyncThunk('water/today', async (_, { rejectWithValue }) => {
  try {
    const res = await waterApi.today();
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load today water');
  }
});

export const fetchWaterStats = createAsyncThunk('water/stats', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await waterApi.stats(params);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load water stats');
  }
});

export const addWater = createAsyncThunk('water/add', async (payload, { rejectWithValue }) => {
  try {
    const res = await waterApi.add(payload);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to add water');
  }
});

export const deleteWater = createAsyncThunk('water/delete', async (id, { rejectWithValue }) => {
  try {
    await waterApi.remove(id);
    return id;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to delete water');
  }
});

export const updateWater = createAsyncThunk('water/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const res = await waterApi.update(id, payload);
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to update water');
  }
});

const slice = createSlice({
  name: 'water',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWater.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchWater.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.stats = action.payload.stats;
      })
      .addCase(fetchWater.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchTodayWater.fulfilled, (state, action) => {
        state.today = action.payload.data || [];
        state.stats = { totalAmount: action.payload.totalAmount };
      })
      .addCase(fetchWaterStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(addWater.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
        state.today = [action.payload, ...(state.today || [])];
      })
      .addCase(deleteWater.fulfilled, (state, action) => {
        state.items = state.items.filter((x) => x._id !== id);
        state.today = state.today.filter((x) => x._id !== id);
      })
      .addCase(updateWater.fulfilled, (state, action) => {
        state.items = state.items.map((x) => (x._id === action.payload._id ? action.payload : x));
        state.today = state.today.map((x) => (x._id === action.payload._id ? action.payload : x));
      });
  },
});

export const selectWater = (s) => s.water.items;
export const selectTodayWater = (s) => s.water.today;
export const selectWaterStats = (s) => s.water.stats;

export default slice.reducer;

