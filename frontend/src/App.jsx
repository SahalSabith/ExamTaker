import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import TeacherDashboard from './Pages/TeacherDashboard';
import CreateExam from './Pages/CreateExam';
import StudentDashboard from './Pages/StudentDashboard';
import StudentProfile from './Pages/StudentProfile';
import TakeExam from './Pages/TakeExam';
import ProtectedRoute from './Components/ProtectedRoute';

function PublicRoute({ children }) {
  const { user } = useSelector((s) => s.auth);
  const access = localStorage.getItem('access');
  if (!user || !access) return children;
  return <Navigate to={user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/teacher-dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/create-exam" element={<ProtectedRoute role="teacher"><CreateExam /></ProtectedRoute>} />
        <Route path="/student-dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student-profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />
        <Route path="/take-exam" element={<ProtectedRoute role="student"><TakeExam /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
