import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../Redux/authSlice';

export default function Login() {
  const [formData, setFormData] = useState({ phone_number: '', password: '' });
  const [sessionMessage] = useState(() => {
    const message = localStorage.getItem('auth_message') || '';
    localStorage.removeItem('auth_message');
    return message;
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) return;
    navigate(user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard', { replace: true });
  }, [user, navigate]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({
      phone_number: formData.phone_number.trim(),
      password: formData.password,
    }));
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if (error.detail) return error.detail;
    if (typeof error === 'string') return error;
    return Object.values(error).flat().join(', ');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-center text-sm font-semibold text-blue-600">ExamTester</p>
        <h2 className="mt-1 text-center text-2xl font-bold text-slate-950">Login to continue</h2>
        <p className="mb-6 mt-2 text-center text-sm text-slate-500">Use the same phone number and password you registered with.</p>

        {sessionMessage && (
          <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{sessionMessage}</p>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{getErrorMessage()}</p>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            maxLength={10}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-blue-600 hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
