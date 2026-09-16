import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import examReducer from './examSlice';
import studentReducer from './studentSlice';

export const store = configureStore({
  reducer: { auth: authReducer, exam: examReducer, student: studentReducer },
});