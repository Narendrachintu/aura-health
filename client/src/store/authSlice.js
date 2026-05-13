import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '../authApi';

const initialState = {
  user: null,
  token: localStorage.getItem('aura_token') || null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const res = await authApi.login(payload);
    const { token, user } = res.data;
    localStorage.setItem('aura_token', token);
    localStorage.setItem('aura_user', JSON.stringify(user));
    return { token, user };
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const res = await authApi.register(payload);
    const { token, user } = res.data;
    localStorage.setItem('aura_token', token);
    localStorage.setItem('aura_user', JSON.stringify(user));
    return { token, user };
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Signup failed');
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await authApi.getMe();
    return res.data.user;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Session expired');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    const res = await authApi.updateProfile(payload);
    localStorage.setItem('aura_user', JSON.stringify(res.data.user));
    return res.data.user;
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Update failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.token = null;
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const authSliceActions = authSlice.actions;

export const selectAuth = (s) => s.auth;
export const selectIsAuthed = (s) => Boolean(s.auth?.token);
export const selectAuthUser = (s) => s.auth.user;
export const selectAuthStatus = (s) => s.auth.status;
export const selectAuthError = (s) => s.auth.error;

export default authSlice.reducer;

