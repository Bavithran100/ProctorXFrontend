import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Client from "../Client";
import "../App.css";

export default function AddQuestions() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [current, setCurrent] = useState({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "",
    marks: 0
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
      correctOption: "",
      marks: 0
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
            <p>Compose question text, options, answers, and marks for this exam.</p>
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
            <div className="field-stack">
              <label>Marks</label>
              <input value={current.marks} type="number" name="marks" placeholder="Marks" onChange={handleChange} />
            </div>
          </div>
        </div>

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
