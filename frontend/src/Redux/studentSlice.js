import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './api';

export const fetchAvailableExams = createAsyncThunk('student/fetchAvailableExams', async (_, { rejectWithValue }) => {
  try { return (await api.get('/student/exams/')).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const startExam = createAsyncThunk('student/startExam', async (examId, { rejectWithValue }) => {
  try { return (await api.post(`/student/exams/${examId}/start/`)).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const submitAnswer = createAsyncThunk('student/submitAnswer', async ({ attemptId, answer }, { rejectWithValue }) => {
  try { return (await api.post(`/student/attempts/${attemptId}/answer/`, answer)).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const finishExam = createAsyncThunk('student/finishExam', async (attemptId, { rejectWithValue }) => {
  try { return (await api.post(`/student/attempts/${attemptId}/finish/`)).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const fetchMyAttempts = createAsyncThunk('student/fetchMyAttempts', async (_, { rejectWithValue }) => {
  try { return (await api.get('/student/attempts/')).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const studentSlice = createSlice({
  name: 'student',
  initialState: {
    availableExams: [],
    attempts: [],
    currentAttempt: null,
    currentExam: null,
    loading: false,
    error: null,
    result: null,
  },
  reducers: {
    clearAttempt: (s) => { s.currentAttempt = null; s.currentExam = null; s.result = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableExams.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchAvailableExams.fulfilled, (s, a) => { s.loading = false; s.availableExams = a.payload; })
      .addCase(fetchAvailableExams.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(startExam.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(startExam.fulfilled, (s, a) => {
        s.loading = false;
        s.currentAttempt = { id: a.payload.attempt_id, started_at: a.payload.started_at };
        s.currentExam = a.payload.exam;
      })
      .addCase(startExam.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(submitAnswer.rejected, (s, a) => { s.error = a.payload; })
      .addCase(finishExam.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(finishExam.fulfilled, (s, a) => { s.loading = false; s.result = a.payload; })
      .addCase(finishExam.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMyAttempts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMyAttempts.fulfilled, (s, a) => { s.loading = false; s.attempts = a.payload; })
      .addCase(fetchMyAttempts.rejected, (s, a) => { s.loading = false; s.error = a.payload; });
  },
});

export const { clearAttempt } = studentSlice.actions;
export default studentSlice.reducer;
