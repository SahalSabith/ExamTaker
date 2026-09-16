import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createExam, addQuestion, publishExam } from '../redux/examSlice';

export default function CreateExam() {
  const dispatch = useDispatch();
  const [exam, setExam] = useState(null);
  const [examForm, setExamForm] = useState({ title: '', description: '', duration_minutes: 30 });

  const [qForm, setQForm] = useState({
    question_text: '', question_type: 'mcq', marks: 1, time_limit_seconds: '',
    choices: [{ choice_text: '', is_correct: false }, { choice_text: '', is_correct: false }],
  });
  const [questions, setQuestions] = useState([]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    const res = await dispatch(createExam(examForm));
    if (res.payload?.id) setExam(res.payload);
  };

  const handleChoiceChange = (index, field, value) => {
    const updated = [...qForm.choices];
    if (field === 'is_correct') {
      updated.forEach((c, i) => (c.is_correct = i === index ? value : false));
    } else {
      updated[index][field] = value;
    }
    setQForm({ ...qForm, choices: updated });
  };

  const addChoiceField = () => {
    setQForm({ ...qForm, choices: [...qForm.choices, { choice_text: '', is_correct: false }] });
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const payload = {
      question_text: qForm.question_text,
      question_type: qForm.question_type,
      marks: qForm.marks,
      time_limit_seconds: qForm.time_limit_seconds || null,
      order: questions.length,
      choices: qForm.question_type === 'descriptive' ? [] : qForm.choices,
    };
    const res = await dispatch(addQuestion({ examId: exam.id, question: payload }));
    if (res.payload?.id) {
      setQuestions([...questions, res.payload]);
      setQForm({
        question_text: '', question_type: 'mcq', marks: 1, time_limit_seconds: '',
        choices: [{ choice_text: '', is_correct: false }, { choice_text: '', is_correct: false }],
      });
    }
  };

  const handlePublish = async () => {
    await dispatch(publishExam(exam.id));
    alert('Exam published! Access code: ' + exam.access_code);
  };

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <form onSubmit={handleCreateExam} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Create Exam</h2>
          <input placeholder="Title" required className="w-full border rounded-lg px-3 py-2 mb-3"
            value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} />
          <textarea placeholder="Description" className="w-full border rounded-lg px-3 py-2 mb-3"
            value={examForm.description} onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} />
          <input type="number" placeholder="Duration (minutes)" required className="w-full border rounded-lg px-3 py-2 mb-3"
            value={examForm.duration_minutes} onChange={(e) => setExamForm({ ...examForm, duration_minutes: e.target.value })} />
          <button className="w-full bg-blue-500 text-white py-2 rounded-lg">Next: Add Questions</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-2">{exam.title}</h2>
        <p className="text-sm text-gray-500 mb-6">{questions.length} question(s) added</p>

        <form onSubmit={handleAddQuestion} className="border-t pt-4">
          <textarea placeholder="Question text" required className="w-full border rounded-lg px-3 py-2 mb-3"
            value={qForm.question_text} onChange={(e) => setQForm({ ...qForm, question_text: e.target.value })} />

          <div className="flex gap-3 mb-3">
            <select className="border rounded-lg px-3 py-2 flex-1" value={qForm.question_type}
              onChange={(e) => setQForm({ ...qForm, question_type: e.target.value })}>
              <option value="mcq">MCQ</option>
              <option value="true_false">True / False</option>
              <option value="descriptive">Descriptive</option>
            </select>
            <input type="number" placeholder="Marks" className="border rounded-lg px-3 py-2 w-24"
              value={qForm.marks} onChange={(e) => setQForm({ ...qForm, marks: e.target.value })} />
            <input type="number" placeholder="Time (sec, optional)" className="border rounded-lg px-3 py-2 w-40"
              value={qForm.time_limit_seconds} onChange={(e) => setQForm({ ...qForm, time_limit_seconds: e.target.value })} />
          </div>

          {qForm.question_type !== 'descriptive' && (
            <div className="mb-3 space-y-2">
              {qForm.choices.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" name="correct" checked={c.is_correct}
                    onChange={() => handleChoiceChange(i, 'is_correct', true)} />
                  <input placeholder={`Choice ${i + 1}`} className="flex-1 border rounded-lg px-3 py-1.5"
                    value={c.choice_text} onChange={(e) => handleChoiceChange(i, 'choice_text', e.target.value)} />
                </div>
              ))}
              <button type="button" onClick={addChoiceField} className="text-sm text-blue-500">+ Add choice</button>
            </div>
          )}

          <button className="w-full bg-green-500 text-white py-2 rounded-lg">Add Question</button>
        </form>

        <ul className="mt-6 space-y-2">
          {questions.map((q, i) => (
            <li key={q.id} className="text-sm bg-gray-50 p-2 rounded">
              {i + 1}. {q.question_text} — {q.marks} marks ({q.question_type})
            </li>
          ))}
        </ul>

        {questions.length > 0 && (
          <button onClick={handlePublish} className="w-full mt-6 bg-purple-600 text-white py-2 rounded-lg">
            Publish Exam
          </button>
        )}
      </div>
    </div>
  );
}