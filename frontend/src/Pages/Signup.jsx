import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerStudent, registerTeacher, clearError, clearSuccessMessage } from '../Redux/authSlice';

export default function Signup() {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    roll_no: '',
    student_class: '',
    phone_number: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage } = useSelector((state) => state.auth);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
        navigate('/login');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
    );

    if (role === 'teacher') {
      const { name, phone_number, password } = trimmedData;
      dispatch(registerTeacher({ name, phone_number, password }));
      return;
    }

    dispatch(registerStudent(trimmedData));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <p className="text-center text-sm font-semibold text-blue-600">ExamTester</p>
        <h2 className="mt-1 text-center text-2xl font-bold text-slate-950">
          Create Account
        </h2>
        <p className="mb-6 mt-2 text-center text-sm text-slate-500">Choose the right account type before signing up.</p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {typeof error === 'object'
              ? Object.values(error).flat().join(', ')
              : error}
          </p>
        )}

        {successMessage && (
          <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </p>
        )}

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`rounded-md py-2 text-sm font-semibold transition ${role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`rounded-md py-2 text-sm font-semibold transition ${role === 'teacher' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'}`}
          >
            Teacher
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {role === 'student' && (
          <>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">Roll No</label>
              <input
                type="text"
                name="roll_no"
                value={formData.roll_no}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-slate-700">Class</label>
              <input
                type="text"
                name="student_class"
                value={formData.student_class}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </>
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
          {loading ? 'Signing up...' : `Sign Up as ${role === 'teacher' ? 'Teacher' : 'Student'}`}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
