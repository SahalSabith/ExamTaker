import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { submitAnswer, finishExam, clearAttempt } from '../Redux/studentSlice';

export default function TakeExam() {
  const { currentExam, currentAttempt, error } = useSelector((s) => s.student);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(currentExam ? currentExam.duration_minutes * 60 : 0);
  const [violations, setViolations] = useState(0);
  const [showFocusWarning, setShowFocusWarning] = useState(false);
  const submittedRef = useRef(false);
  const lastViolationRef = useRef(0);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || !currentAttempt?.id) return;
    submittedRef.current = true;
    await dispatch(finishExam(currentAttempt.id));
    dispatch(clearAttempt());
    navigate('/student-dashboard');
  }, [currentAttempt, dispatch, navigate]);

  useEffect(() => {
    if (!currentExam) navigate('/student-dashboard');
  }, [currentExam, navigate]);

  useEffect(() => {
    if (!currentExam) return undefined;

    const registerViolation = () => {
      const now = Date.now();
      if (now - lastViolationRef.current < 1500) return;
      lastViolationRef.current = now;
      setViolations((count) => {
        const next = count + 1;
        setShowFocusWarning(true);
        return next;
      });
    };

    const handleVisibility = () => {
      if (document.hidden) registerViolation();
    };

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', registerViolation);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', registerViolation);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentExam]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, handleSubmit]);

  const handleAnswerChange = async (questionId, payload) => {
    setAnswers({ ...answers, [questionId]: payload });
    await dispatch(submitAnswer({ attemptId: currentAttempt.id, answer: { question_id: questionId, ...payload } }));
  };

  if (!currentExam) return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4">
      <div className="mx-auto max-w-2xl">
        <div className="sticky top-0 z-10 mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Exam in progress</p>
              <h1 className="text-lg font-bold text-slate-950">{currentExam.title}</h1>
            </div>
            <span className="rounded-lg bg-red-50 px-3 py-2 font-mono text-lg font-bold text-red-600">{mins}:{secs.toString().padStart(2, '0')}</span>
          </div>
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Stay on this page. Switching tabs or minimizing is not allowed during the exam.
          </p>
          {violations > 0 && <p className="mt-2 text-sm font-semibold text-red-600">Focus warnings: {violations}</p>}
        </div>

        {showFocusWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
              <p className="text-sm font-semibold text-red-600">Exam warning</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Do not switch tabs</h2>
              <p className="mt-2 text-sm text-slate-600">
                Please stay on the exam page until you submit. This warning is recorded, but your exam was not auto-submitted.
              </p>
              <button onClick={() => setShowFocusWarning(false)} className="mt-4 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white">
                I understand
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {typeof error === 'object' ? Object.values(error).flat().join(', ') : error}
            </p>
          )}
          {currentExam.questions.map((q, i) => (
            <div key={q.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="mb-3 font-semibold text-slate-950">{i + 1}. {q.question_text} <span className="text-xs font-medium text-slate-400">({q.marks} marks)</span></p>

              {q.question_type !== 'descriptive' ? (
                <div className="space-y-2">
                  {q.choices.map((c) => (
                    <label key={c.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-slate-700">
                      <input type="radio" name={`q-${q.id}`}
                        onChange={() => handleAnswerChange(q.id, { selected_choice_id: c.id })} />
                      {c.choice_text}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  placeholder="Type your answer..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base"
                  onBlur={(e) => handleAnswerChange(q.id, { text_answer: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>

        <button onClick={handleSubmit} className="mt-6 w-full rounded-lg bg-red-600 py-4 font-semibold text-white">
          Submit Exam
        </button>
      </div>
    </div>
  );
}
