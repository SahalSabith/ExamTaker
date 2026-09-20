import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    navigate(user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard', { replace: true });
  }, [user, navigate]);

  return null;
}
