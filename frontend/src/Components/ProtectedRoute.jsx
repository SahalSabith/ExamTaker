import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, role }) {
  const { user } = useSelector((s) => s.auth);
  const access = localStorage.getItem('access');
  if (!user || !access) {
    localStorage.setItem('auth_message', 'Please login again to continue.');
    return <Navigate to="/login" replace />;
  }
  if (role && user.role !== role) {
    const dashboard = user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
    return <Navigate to={dashboard} replace />;
  }
  return children;
}
