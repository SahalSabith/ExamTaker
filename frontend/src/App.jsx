import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import TeacherDashboard from './Pages/TeacherDashboard';
import CreateExam from './Pages/CreateExam';
import StudentDashboard from './Pages/StudentDashboard';
import TakeExam from './Pages/TakeExam';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/teacher-dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/create-exam" element={<ProtectedRoute role="teacher"><CreateExam /></ProtectedRoute>} />
        <Route path="/student-dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/take-exam" element={<ProtectedRoute role="student"><TakeExam /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;