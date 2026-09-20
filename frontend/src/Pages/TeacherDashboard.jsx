import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutStudent } from '../Redux/authSlice';
import { deleteExam, fetchMyExams, publishResults } from '../Redux/examSlice';

export default function TeacherDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { exams, loading, error } = useSelector((s) => s.exam);

  useEffect(() => { dispatch(fetchMyExams()); }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutStudent());
    navigate('/login', { replace: true });
  };

  const handleDelete = async (exam) => {
    if (!window.confirm(`Delete "${exam.title}"?`)) return;
    await dispatch(deleteExam(exam.id));
  };

  const handlePublishResults = async (exam) => {
    await dispatch(publishResults(exam.id));
  };

  const handleShareWhatsApp = (exam) => {
    const text = encodeURIComponent(
      `Exam: ${exam.title}\nAccess code: ${exam.access_code}\nLogin and attend it in ExamTester.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const formatWindow = (exam) => {
    if (!exam.start_at && !exam.end_at) return 'No schedule set';
    const start = exam.start_at ? new Date(exam.start_at).toLocaleString() : 'Any time';
    const end = exam.end_at ? new Date(exam.end_at).toLocaleString() : 'No end';
    return `${start} - ${end}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Teacher workspace</p>
            <h1 className="text-2xl font-bold text-slate-950">Welcome, {user?.name}</h1>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Link to="/create-exam" className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white">
              New exam
            </Link>
            <button onClick={handleLogout} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Logout
            </button>
          </div>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{typeof error === 'object' ? Object.values(error).flat().join(', ') : error}</p>}

        {loading ? <p className="text-sm text-slate-500">Loading exams...</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {exams.map((exam) => (
              <div key={exam.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{exam.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                    {exam.question_count} questions • {exam.total_marks} marks • {exam.duration_minutes} min
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${exam.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {exam.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>Code: <span className="font-semibold text-slate-950">{exam.access_code}</span></p>
                  <p>{formatWindow(exam)}</p>
                  <p>Marks: {exam.results_published ? 'Published' : 'Hidden from students'}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link to="/create-exam" state={{ examId: exam.id }} className="rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-semibold text-white">
                    Edit
                  </Link>
                  <button onClick={() => handleShareWhatsApp(exam)} className="rounded-lg border border-green-200 px-3 py-2 text-sm font-semibold text-green-700">
                    WhatsApp
                  </button>
                  {!exam.results_published && (
                    <button onClick={() => handlePublishResults(exam)} className="col-span-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
                      Publish marks
                    </button>
                  )}
                  <button onClick={() => handleDelete(exam)} className="col-span-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">
                    Delete exam
                  </button>
                </div>
              </div>
            ))}
            {!exams.length && <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No exams yet. Create your first exam.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
