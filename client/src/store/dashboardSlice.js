import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dashboardApi } from '../dashboardApi';
import { fetchMe } from './authSlice';
import { fetchSuggestions as apiFetchSuggestions } from '../api/aiApi';

const initialState = {
  today: null,
  week: null,
  suggestions: [],
  status: 'idle',
  authHydrationStatus: 'idle',
  error: null,
};

export const getDashboard = createAsyncThunk('dashboard/get', async (_, { rejectWithValue }) => {
  try {
    const res = await dashboardApi.getDashboard();
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load dashboard');
  }
});

export const fetchSuggestions = createAsyncThunk('dashboard/suggestions', async (_, { rejectWithValue }) => {
  try {
    const res = await apiFetchSuggestions();
    return res.data.data;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load suggestions');
  }
});

export const hydrateRequest = createAsyncThunk('dashboard/hydrate', async (_, { dispatch, rejectWithValue }) => {
  try {
    // if token exists, fetch me + dashboard
    const token = localStorage.getItem('aura_token');
    if (!token) return;
    await dispatch(fetchMe()).unwrap().catch(() => undefined);
    await dispatch(getDashboard()).unwrap();
    await dispatch(fetchSuggestions()).unwrap().catch(() => undefined);
  } catch (e) {
    return rejectWithValue(e?.response?.data?.message || 'Hydration failed');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(hydrateRequest.pending, (state) => {
        state.authHydrationStatus = 'loading';
      })
      .addCase(hydrateRequest.fulfilled, (state) => {
        state.authHydrationStatus = 'succeeded';
      })
      .addCase(hydrateRequest.rejected, (state) => {
        state.authHydrationStatus = 'failed';
      })
      .addCase(getDashboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.today = action.payload.today;
        state.week = action.payload.week;
      })
      .addCase(getDashboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      });
  },
});

export const dashboardSliceActions = {
  hydrateRequest,
};

export const selectDashboard = (s) => s.dashboard;
export const selectToday = (s) => s.dashboard.today;
export const selectWeek = (s) => s.dashboard.week;
export const selectAuthLoading = (s) => s.dashboard.authHydrationStatus === 'loading';

export default dashboardSlice.reducer;

