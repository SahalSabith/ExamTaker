import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from './api';

export const fetchMyExams = createAsyncThunk('exam/fetchMyExams', async (_, { rejectWithValue }) => {
  try { return (await api.get('/teacher/exams/')).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const fetchExam = createAsyncThunk('exam/fetchExam', async (examId, { rejectWithValue }) => {
  try { return (await api.get(`/teacher/exams/${examId}/`)).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const createExam = createAsyncThunk('exam/createExam', async (data, { rejectWithValue }) => {
  try { return (await api.post('/teacher/exams/', data)).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const updateExam = createAsyncThunk('exam/updateExam', async ({ examId, data }, { rejectWithValue }) => {
  try { return (await api.patch(`/teacher/exams/${examId}/`, data)).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const deleteExam = createAsyncThunk('exam/deleteExam', async (examId, { rejectWithValue }) => {
  try {
    await api.delete(`/teacher/exams/${examId}/`);
    return examId;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const addQuestion = createAsyncThunk('exam/addQuestion', async ({ examId, question }, { rejectWithValue }) => {
  try { return (await api.post(`/teacher/exams/${examId}/questions/`, question)).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const deleteQuestion = createAsyncThunk('exam/deleteQuestion', async (questionId, { rejectWithValue }) => {
  try {
    await api.delete(`/teacher/questions/${questionId}/`);
    return questionId;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const publishExam = createAsyncThunk('exam/publishExam', async (examId, { rejectWithValue }) => {
  try { return (await api.patch(`/teacher/exams/${examId}/publish/`, { is_published: true })).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

export const publishResults = createAsyncThunk('exam/publishResults', async (examId, { rejectWithValue }) => {
  try { return (await api.patch(`/teacher/exams/${examId}/publish-results/`, { results_published: true })).data; }
  catch (err) { return rejectWithValue(err.response?.data); }
});

const examSlice = createSlice({
  name: 'exam',
  initialState: { exams: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyExams.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMyExams.fulfilled, (s, a) => { s.loading = false; s.exams = a.payload; })
      .addCase(fetchMyExams.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchExam.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchExam.fulfilled, (s) => { s.loading = false; })
      .addCase(fetchExam.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(createExam.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(createExam.fulfilled, (s, a) => { s.loading = false; s.exams.unshift(a.payload); })
      .addCase(createExam.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(updateExam.fulfilled, (s, a) => {
        const index = s.exams.findIndex((item) => item.id === a.payload.id);
        if (index >= 0) s.exams[index] = { ...s.exams[index], ...a.payload };
      })
      .addCase(deleteExam.fulfilled, (s, a) => { s.exams = s.exams.filter((item) => item.id !== a.payload); })
      .addCase(addQuestion.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(addQuestion.fulfilled, (s) => { s.loading = false; })
      .addCase(addQuestion.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(deleteQuestion.rejected, (s, a) => { s.error = a.payload; })
      .addCase(publishExam.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(publishExam.fulfilled, (s, a) => {
        s.loading = false;
        const exam = s.exams.find((item) => item.id === a.meta.arg);
        if (exam) exam.is_published = a.payload.is_published;
      })
      .addCase(publishExam.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(publishResults.fulfilled, (s, a) => {
        const exam = s.exams.find((item) => item.id === a.meta.arg);
        if (exam) exam.results_published = a.payload.results_published;
      });
  },
});

export default examSlice.reducer;
