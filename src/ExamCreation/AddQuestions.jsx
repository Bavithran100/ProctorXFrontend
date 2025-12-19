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
    const res=await Client.post(`/admin/exams/${examId}/questions/Publish`);
    console.log(res.data);
    
  navigate('/dashboard');
  console.log("Question published Successfully");
  }

  return (
    <div className="exam-page">
      <div className="exam-container">
        <h2>➕ Add Questions</h2>

        <div className="question-card">
          <input value={current.questionText} name="questionText" placeholder="Question" onChange={handleChange} />

          <div className="options-grid">
            <input value={current.optionA} name="optionA" placeholder="Option A" onChange={handleChange} />
            <input value={current.optionB}name="optionB" placeholder="Option B" onChange={handleChange} />
            <input value={current.optionC}name="optionC" placeholder="Option C" onChange={handleChange} />
            <input value={current.optionD}name="optionD" placeholder="Option D" onChange={handleChange} />
          </div>

          <div className="form-grid">
            <input value={current.correctOption} name="correctOption" placeholder="Correct Anwser (A/B/C/D) " onChange={handleChange} />
            <input value={current.marks} type="number" name="marks" placeholder="Marks" onChange={handleChange} />
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
