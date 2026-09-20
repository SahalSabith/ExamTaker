import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutStudent } from '../Redux/authSlice';
import { fetchMyAttempts } from '../Redux/studentSlice';

export default function StudentProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { attempts, loading, error } = useSelector((s) => s.student);

  useEffect(() => {
    dispatch(fetchMyAttempts());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutStudent());
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => navigate('/student-dashboard')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
            Back
          </button>
          <button onClick={handleLogout} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">
            Logout
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-blue-600">Profile</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{user?.name}</h1>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-slate-500">Class</p>
              <p className="font-semibold text-slate-950">{user?.student_class || '-'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-slate-500">Roll no</p>
              <p className="font-semibold text-slate-950">{user?.roll_no || '-'}</p>
            </div>
            <div className="col-span-2 rounded-lg bg-slate-50 p-3">
              <p className="text-slate-500">Phone</p>
              <p className="font-semibold text-slate-950">{user?.phone_number}</p>
            </div>
          </div>
        </div>

        <div className="my-4 grid grid-cols-2 gap-2">
          <Link to="/student-dashboard" className="rounded-lg border border-slate-300 py-3 text-center text-sm font-semibold text-slate-700">Exams</Link>
          <Link to="/student-profile" className="rounded-lg bg-blue-600 py-3 text-center text-sm font-semibold text-white">History</Link>
        </div>

        <h2 className="mb-3 text-lg font-bold text-slate-950">Previous exams</h2>
        {loading && <p className="text-sm text-slate-500">Loading history...</p>}
        {error && <p className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{typeof error === 'object' ? Object.values(error).flat().join(', ') : error}</p>}

        <div className="space-y-3">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{attempt.exam_title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {attempt.submitted_at ? `Submitted ${new Date(attempt.submitted_at).toLocaleString()}` : 'In progress'}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${attempt.exam_results_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {attempt.exam_results_published ? 'Marks out' : 'Waiting'}
                </span>
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <p className="text-sm text-slate-500">Score</p>
                <p className="text-xl font-bold text-slate-950">
                  {attempt.visible_total_score === null || attempt.visible_total_score === undefined
                    ? 'Not published'
                    : attempt.visible_total_score}
                </p>
              </div>
            </div>
          ))}
          {!attempts.length && !loading && <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No previous exams yet.</p>}
        </div>
      </div>
    </div>
  );
}
