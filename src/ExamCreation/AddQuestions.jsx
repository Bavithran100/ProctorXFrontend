import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Client from "../Client";
import "../App.css";

export default function AddQuestions() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const plannedQuestionCount = location.state?.questionCount;

  const [current, setCurrent] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: ""
  });

  function handleChange(e) {
    setCurrent({ ...current, [e.target.name]: e.target.value });
  }

  async function addQuestion() {
    await Client.post(`/admin/exams/${examId}/questions`, current);
    setCurrent({
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: ""
    });
  }

  async function publish() {
    const res = await Client.post(`/admin/exams/${examId}/questions/Publish`);
    console.log(res.data);

    navigate("/dashboard");
    console.log("Question published Successfully");
  }

  return (
    <div className="exam-page">
      <div className="exam-container">
        <div className="page-header">
          <div>
            <div className="hero-badge">Manual question builder</div>
            <h2>Add Questions</h2>
            <p>Compose question text and answers. Marks are assigned automatically from the exam total.</p>
          </div>
        </div>

        <div className="question-card">
          <div className="field-stack">
            <label>Question</label>
            <input value={current.questionText} name="questionText" placeholder="Question" onChange={handleChange} />
          </div>

          <div className="options-grid" style={{ marginTop: "18px" }}>
            <div className="field-stack">
              <label>Option A</label>
              <input value={current.optionA} name="optionA" placeholder="Option A" onChange={handleChange} />
            </div>
            <div className="field-stack">
              <label>Option B</label>
              <input value={current.optionB} name="optionB" placeholder="Option B" onChange={handleChange} />
            </div>
            <div className="field-stack">
              <label>Option C</label>
              <input value={current.optionC} name="optionC" placeholder="Option C" onChange={handleChange} />
            </div>
            <div className="field-stack">
              <label>Option D</label>
              <input value={current.optionD} name="optionD" placeholder="Option D" onChange={handleChange} />
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: "18px" }}>
            <div className="field-stack">
              <label>Correct Answer</label>
              <input value={current.correctOption} name="correctOption" placeholder="Correct Answer (A/B/C/D)" onChange={handleChange} />
            </div>
          </div>
        </div>

        {plannedQuestionCount && (
          <p className="helper-text">The backend will divide the exam total across {plannedQuestionCount} questions.</p>
        )}

        <button className="primary-btn" onClick={addQuestion}>
          Add Question
        </button>

        <button className="secondary-btn" onClick={publish}>
          Publish Exam
        </button>
      </div>
    </div>
  );
}
