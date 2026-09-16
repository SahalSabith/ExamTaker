import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './api';

export const fetchMyExams = createAsyncThunk('exam/fetchMyExams', async (_, { rejectWithValue }) => {
  try { return (await api.get('/teacher/exams/')).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const createExam = createAsyncThunk('exam/createExam', async (data, { rejectWithValue }) => {
  try { return (await api.post('/teacher/exams/', data)).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const addQuestion = createAsyncThunk('exam/addQuestion', async ({ examId, question }, { rejectWithValue }) => {
  try { return (await api.post(`/teacher/exams/${examId}/questions/`, question)).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const publishExam = createAsyncThunk('exam/publishExam', async (examId, { rejectWithValue }) => {
  try { return (await api.patch(`/teacher/exams/${examId}/publish/`, { is_published: true })).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const examSlice = createSlice({
  name: 'exam',
  initialState: { exams: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyExams.pending, (s) => { s.loading = true; })
      .addCase(fetchMyExams.fulfilled, (s, a) => { s.loading = false; s.exams = a.payload; })
      .addCase(fetchMyExams.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createExam.fulfilled, (s, a) => { s.exams.unshift(a.payload); });
  },
});

export default examSlice.reducer;