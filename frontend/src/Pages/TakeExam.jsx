import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { submitAnswer, finishExam, clearAttempt } from '../redux/studentSlice';

export default function TakeExam() {
  const { currentExam, currentAttempt } = useSelector((s) => s.student);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(currentExam ? currentExam.duration_minutes * 60 : 0);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (!currentExam) navigate('/student-dashboard');
  }, [currentExam, navigate]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleAnswerChange = async (questionId, payload) => {
    setAnswers({ ...answers, [questionId]: payload });
    await dispatch(submitAnswer({ attemptId: currentAttempt.id, answer: { question_id: questionId, ...payload } }));
  };

  const handleSubmit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    await dispatch(finishExam(currentAttempt.id));
    dispatch(clearAttempt());
    navigate('/student-dashboard');
  };

  if (!currentExam) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
          <h1 className="text-xl font-bold">{currentExam.title}</h1>
          <span className="text-red-500 font-mono text-lg">{mins}:{secs.toString().padStart(2, '0')}</span>
        </div>

        <div className="space-y-4">
          {currentExam.questions.map((q, i) => (
            <div key={q.id} className="bg-white p-4 rounded-lg shadow">
              <p className="font-medium mb-2">{i + 1}. {q.question_text} <span className="text-xs text-gray-400">({q.marks} marks)</span></p>

              {q.question_type !== 'descriptive' ? (
                <div className="space-y-1">
                  {q.choices.map((c) => (
                    <label key={c.id} className="flex items-center gap-2">
                      <input type="radio" name={`q-${q.id}`}
                        onChange={() => handleAnswerChange(q.id, { selected_choice_id: c.id })} />
                      {c.choice_text}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  placeholder="Type your answer..."
                  className="w-full border rounded-lg px-3 py-2"
                  onBlur={(e) => handleAnswerChange(q.id, { text_answer: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>

        <button onClick={handleSubmit} className="w-full mt-6 bg-red-500 text-white py-3 rounded-lg font-semibold">
          Submit Exam
        </button>
      </div>
    </div>
  );
}