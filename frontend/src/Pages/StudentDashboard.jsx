import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutStudent } from '../Redux/authSlice';
import { fetchAvailableExams, startExam } from '../Redux/studentSlice';

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { availableExams, loading, error } = useSelector((s) => s.student);

  useEffect(() => {
    if (user?.role === 'student') {
      dispatch(fetchAvailableExams());
    }
  }, [dispatch, user?.role]);

  const handleStart = async (examId) => {
    const res = await dispatch(startExam(examId));
    if (res.payload?.attempt_id) navigate('/take-exam');
  };

  const handleLogout = async () => {
    await dispatch(logoutStudent());
    navigate('/login', { replace: true });
  };

  const examStatus = (exam) => {
    if (exam.attempt_status === 'submitted') return 'Submitted';
    if (exam.attempt_status === 'in_progress') return 'In progress';
    if (exam.start_at || exam.end_at) return 'Scheduled';
    return 'Open now';
  };

  const statusClass = (exam) => {
    if (exam.attempt_status === 'submitted') return 'bg-slate-100 text-slate-700';
    if (exam.attempt_status === 'in_progress') return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5">
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-600">Student home</p>
            <h1 className="text-2xl font-bold text-slate-950">Hi, {user?.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{user?.student_class} • Roll {user?.roll_no}</p>
          </div>
          <button onClick={handleLogout} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
            Logout
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <Link to="/student-dashboard" className="rounded-lg bg-blue-600 py-3 text-center text-sm font-semibold text-white">Exams</Link>
          <Link to="/student-profile" className="rounded-lg border border-slate-300 py-3 text-center text-sm font-semibold text-slate-700">Profile</Link>
        </div>

        <h2 className="mb-3 text-lg font-bold text-slate-950">Available exams</h2>
        {loading && <p className="mb-4 text-sm text-slate-500">Loading exams...</p>}
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {typeof error === 'object' ? Object.values(error).flat().join(', ') : error}
          </p>
        )}
        <div className="space-y-3">
          {availableExams.map((exam) => (
            <div key={exam.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-slate-950">{exam.title}</p>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(exam)}`}>{examStatus(exam)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{exam.total_marks} marks • {exam.duration_minutes} min</p>
                {exam.start_at && <p className="mt-1 text-xs text-slate-500">Starts {new Date(exam.start_at).toLocaleString()}</p>}
                {exam.end_at && <p className="text-xs text-slate-500">Ends {new Date(exam.end_at).toLocaleString()}</p>}
              </div>
              {exam.attempt_status === 'submitted' ? (
                <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600">
                  Already attended
                </p>
              ) : (
                <button onClick={() => handleStart(exam.id)} className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white">
                  {exam.attempt_status === 'in_progress' ? 'Continue exam' : 'Start exam'}
                </button>
              )}
            </div>
          ))}
          {!availableExams.length && !loading && <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No exams are available right now.</p>}
        </div>
      </div>
    </div>
  );
}
