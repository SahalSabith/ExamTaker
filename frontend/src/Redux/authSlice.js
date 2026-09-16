import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './api';

export const registerTeacher = createAsyncThunk('auth/registerTeacher', async (data, { rejectWithValue }) => {
  try { return (await api.post('/auth/register/teacher/', data)).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const registerStudent = createAsyncThunk('auth/registerStudent', async (data, { rejectWithValue }) => {
  try { return (await api.post('/auth/register/student/', data)).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (data, { rejectWithValue }) => {
  try { return (await api.post('/auth/login/', data)).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const storedUser = localStorage.getItem('user');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    logout: (state) => { state.user = null; localStorage.clear(); },
    clearError: (state) => { state.error = null; },
    clearSuccessMessage: (state) => { state.successMessage = null; },
  },
  extraReducers: (builder) => {
    const saveAuth = (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      localStorage.setItem('access', action.payload.access);
      localStorage.setItem('refresh', action.payload.refresh);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    };
    builder
      .addCase(registerTeacher.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerTeacher.fulfilled, saveAuth)
      .addCase(registerTeacher.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(registerStudent.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerStudent.fulfilled, saveAuth)
      .addCase(registerStudent.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, saveAuth)
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { logout, clearError, clearSuccessMessage } = authSlice.actions;
export default authSlice.reducer;