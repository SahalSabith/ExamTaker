import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAvailableExams, startExam } from '../redux/studentSlice';

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { availableExams } = useSelector((s) => s.student);

  useEffect(() => { dispatch(fetchAvailableExams()); }, [dispatch]);

  const handleStart = async (examId) => {
    const res = await dispatch(startExam(examId));
    if (res.payload?.attempt_id) navigate('/take-exam');
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Available Exams</h1>
        <div className="space-y-3">
          {availableExams.map((exam) => (
            <div key={exam.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <div>
                <p className="font-semibold">{exam.title}</p>
                <p className="text-sm text-gray-500">{exam.total_marks} marks • {exam.duration_minutes} min</p>
              </div>
              <button onClick={() => handleStart(exam.id)} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                Start
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}