import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyExams } from '../redux/examSlice';

export default function TeacherDashboard() {
  const dispatch = useDispatch();
  const { exams, loading } = useSelector((s) => s.exam);

  useEffect(() => { dispatch(fetchMyExams()); }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Exams</h1>
          <Link to="/create-exam" className="bg-blue-500 text-white px-4 py-2 rounded-lg">+ New Exam</Link>
        </div>

        {loading ? <p>Loading...</p> : (
          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold">{exam.title}</p>
                  <p className="text-sm text-gray-500">
                    {exam.question_count} questions • {exam.total_marks} marks • {exam.duration_minutes} min
                  </p>
                  <p className="text-xs text-gray-400">Code: {exam.access_code}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${exam.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {exam.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}