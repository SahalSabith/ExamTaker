import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  addQuestion,
  deleteQuestion,
  fetchExam,
  createExam,
  publishExam,
  updateExam,
} from '../Redux/examSlice';

const emptyQuestion = {
  question_text: '',
  question_type: 'mcq',
  marks: 1,
  time_limit_seconds: '',
  choices: [{ choice_text: '', is_correct: false }, { choice_text: '', is_correct: false }],
};

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const fromDateTimeLocal = (value) => (value ? new Date(value).toISOString() : null);

export default function CreateExam() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const editingExamId = location.state?.examId;
  const { loading, error } = useSelector((s) => s.exam);
  const [exam, setExam] = useState(null);
  const [message, setMessage] = useState('');
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    start_at: '',
    end_at: '',
    allow_multiple_attempts: false,
    shuffle_questions: false,
  });
  const [qForm, setQForm] = useState(emptyQuestion);
  const [questions, setQuestions] = useState([]);
  const errorMessage = error
    ? (typeof error === 'object' ? Object.values(error).flat().join(', ') : error)
    : null;

  useEffect(() => {
    const loadExam = async () => {
      if (!editingExamId) return;
      const res = await dispatch(fetchExam(editingExamId));
      if (!res.payload?.id) return;
      setExam(res.payload);
      setQuestions(res.payload.questions || []);
      setExamForm({
        title: res.payload.title || '',
        description: res.payload.description || '',
        duration_minutes: res.payload.duration_minutes || 30,
        start_at: toDateTimeLocal(res.payload.start_at),
        end_at: toDateTimeLocal(res.payload.end_at),
        allow_multiple_attempts: Boolean(res.payload.allow_multiple_attempts),
        shuffle_questions: Boolean(res.payload.shuffle_questions),
      });
    };
    loadExam();
  }, [dispatch, editingExamId]);

  const examPayload = () => ({
    ...examForm,
    title: examForm.title.trim(),
    description: examForm.description.trim(),
    duration_minutes: Number(examForm.duration_minutes),
    start_at: fromDateTimeLocal(examForm.start_at),
    end_at: fromDateTimeLocal(examForm.end_at),
  });

  const handleSaveExam = async (e) => {
    e.preventDefault();
    setMessage('');
    const res = exam
      ? await dispatch(updateExam({ examId: exam.id, data: examPayload() }))
      : await dispatch(createExam(examPayload()));

    if (res.payload?.id) {
      setExam(res.payload);
      setMessage(exam ? 'Exam details saved.' : 'Exam created. Add questions next.');
    }
  };

  const handleChoiceChange = (index, field, value) => {
    const updated = qForm.choices.map((choice, i) => ({
      ...choice,
      ...(field === 'is_correct' ? { is_correct: i === index ? value : false } : {}),
    }));
    if (field !== 'is_correct') updated[index][field] = value;
    setQForm({ ...qForm, choices: updated });
  };

  const handleQuestionType = (questionType) => {
    if (questionType === 'true_false') {
      setQForm({
        ...qForm,
        question_type: questionType,
        choices: [{ choice_text: 'True', is_correct: true }, { choice_text: 'False', is_correct: false }],
      });
      return;
    }
    setQForm({ ...qForm, question_type: questionType });
  };

  const addChoiceField = () => {
    setQForm({ ...qForm, choices: [...qForm.choices, { choice_text: '', is_correct: false }] });
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!exam?.id) return;
    setMessage('');
    const payload = {
      question_text: qForm.question_text.trim(),
      question_type: qForm.question_type,
      marks: Number(qForm.marks),
      time_limit_seconds: qForm.time_limit_seconds ? Number(qForm.time_limit_seconds) : null,
      order: questions.length,
      choices: qForm.question_type === 'descriptive'
        ? []
        : qForm.choices.map((choice) => ({
          choice_text: choice.choice_text.trim(),
          is_correct: choice.is_correct,
        })),
    };
    const res = await dispatch(addQuestion({ examId: exam.id, question: payload }));
    if (res.payload?.id) {
      setQuestions([...questions, res.payload]);
      setQForm(emptyQuestion);
    }
  };

  const handleDeleteQuestion = async (question) => {
    if (!window.confirm('Delete this question?')) return;
    const res = await dispatch(deleteQuestion(question.id));
    if (res.payload) setQuestions(questions.filter((item) => item.id !== question.id));
  };

  const handlePublish = async () => {
    setMessage('');
    const res = await dispatch(publishExam(exam.id));
    if (res.payload?.is_published) {
      setExam({ ...exam, is_published: true });
      navigate('/teacher-dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button onClick={() => navigate('/teacher-dashboard')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
            Back
          </button>
          <Link to="/teacher-dashboard" className="text-sm font-semibold text-blue-600">Dashboard</Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={handleSaveExam} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-blue-600">{exam ? 'Edit exam' : 'Create exam'}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Exam setup</h1>
            {errorMessage && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>}
            {message && <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}

            <label className="mt-4 block text-sm font-medium text-slate-700">Title</label>
            <input required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base"
              value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} />

            <label className="mt-4 block text-sm font-medium text-slate-700">Description</label>
            <textarea className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base"
              value={examForm.description} onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} />

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Duration</label>
                <input type="number" min="1" required className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base"
                  value={examForm.duration_minutes} onChange={(e) => setExamForm({ ...examForm, duration_minutes: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Start time</label>
                <input type="datetime-local" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base"
                  value={examForm.start_at} onChange={(e) => setExamForm({ ...examForm, start_at: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">End time</label>
                <input type="datetime-local" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-base"
                  value={examForm.end_at} onChange={(e) => setExamForm({ ...examForm, end_at: e.target.value })} />
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-700">
                <input type="checkbox" checked={examForm.allow_multiple_attempts} onChange={(e) => setExamForm({ ...examForm, allow_multiple_attempts: e.target.checked })} />
                Allow multiple attempts
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-700">
                <input type="checkbox" checked={examForm.shuffle_questions} onChange={(e) => setExamForm({ ...examForm, shuffle_questions: e.target.checked })} />
                Shuffle questions
              </label>
            </div>

            <button disabled={loading} className="mt-4 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white disabled:opacity-50">
              {loading ? 'Saving...' : exam ? 'Save exam' : 'Create exam'}
            </button>
            {exam?.access_code && <p className="mt-3 text-center text-sm text-slate-600">Access code <span className="font-bold text-slate-950">{exam.access_code}</span></p>}
          </form>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-600">Questions</p>
                <h2 className="text-xl font-bold text-slate-950">{questions.length} added</h2>
              </div>
              <button disabled={!exam || !questions.length} onClick={handlePublish} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
                Publish
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-3">
              <textarea disabled={!exam} placeholder={exam ? 'Question text' : 'Create the exam first'} required className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base disabled:bg-slate-100"
                value={qForm.question_text} onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })} />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <select disabled={!exam} className="rounded-lg border border-slate-300 px-3 py-3 text-base" value={qForm.question_type}
                  onChange={(e) => handleQuestionType(e.target.value)}>
                  <option value="mcq">MCQ</option>
                  <option value="true_false">True / False</option>
                  <option value="descriptive">Descriptive</option>
                </select>
                <input disabled={!exam} type="number" min="1" placeholder="Marks" className="rounded-lg border border-slate-300 px-3 py-3 text-base"
                  value={qForm.marks} onChange={(e) => setQForm({ ...qForm, marks: e.target.value })} />
                <input disabled={!exam} type="number" min="1" placeholder="Seconds" className="col-span-2 rounded-lg border border-slate-300 px-3 py-3 text-base sm:col-span-2"
                  value={qForm.time_limit_seconds} onChange={(e) => setQForm({ ...qForm, time_limit_seconds: e.target.value })} />
              </div>

              {qForm.question_type !== 'descriptive' && (
                <div className="space-y-2">
                  {qForm.choices.map((choice, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input type="radio" name="correct" checked={choice.is_correct} onChange={() => handleChoiceChange(index, 'is_correct', true)} />
                      <input disabled={!exam || qForm.question_type === 'true_false'} placeholder={`Choice ${index + 1}`} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-base disabled:bg-slate-100"
                        value={choice.choice_text} onChange={(e) => handleChoiceChange(index, 'choice_text', e.target.value)} />
                    </div>
                  ))}
                  {qForm.question_type === 'mcq' && <button type="button" onClick={addChoiceField} className="text-sm font-semibold text-blue-600">Add choice</button>}
                </div>
              )}

              <button disabled={!exam || loading} className="w-full rounded-lg bg-slate-900 py-3 font-semibold text-white disabled:opacity-40">
                Add question
              </button>
            </form>

            <div className="mt-5 space-y-2">
              {questions.map((question, index) => (
                <div key={question.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{index + 1}. {question.question_text}</p>
                    <p className="mt-1 text-xs text-slate-500">{question.marks} marks • {question.question_type}</p>
                  </div>
                  <button onClick={() => handleDeleteQuestion(question)} className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
