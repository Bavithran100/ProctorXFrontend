import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Client from "../Client";
import "../App.css";

export default function AddCodingQuestion() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState({
    title: "",
    description: "",
    difficulty: "EASY",
    marks: 10,
    testCases: [{ input: "", output: "" }]
  });

  function handleChange(e) {
    setQuestion({ ...question, [e.target.name]: e.target.value });
  }

  function addTestCase() {
    setQuestion({
      ...question,
      testCases: [...question.testCases, { input: "", output: "" }]
    });
  }

  function updateTestCase(i, field, value) {
    const updated = [...question.testCases];
    updated[i][field] = value;

    setQuestion({ ...question, testCases: updated });
  }

  async function save() {
    await Client.post(`/admin/exams/${examId}/coding-questions`, question);

    alert("Question saved");
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
            <div className="hero-badge">Coding question authoring</div>
            <h2>Add Coding Question</h2>
            <p>Define the prompt, marks, and testcase pairs for this coding assessment.</p>
          </div>
        </div>

        <div className="field-panel">
          <div className="field-stack">
            <label>Title</label>
            <input
              name="title"
              placeholder="Title"
              onChange={handleChange}
            />
          </div>

          <div className="field-stack">
            <label>Problem Description</label>
            <textarea
              name="description"
              placeholder="Problem Description"
              onChange={handleChange}
            />
          </div>

          <div className="field-stack">
            <label>Marks</label>
            <input
              name="marks"
              type="number"
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="question-card" style={{ marginTop: "20px" }}>
          <h3>Test Cases</h3>

          {question.testCases.map((t, i) => (
            <div key={i} className="form-grid" style={{ marginTop: "16px" }}>
              <div className="field-stack">
                <label>Input</label>
                <input
                  placeholder="Input"
                  onChange={e => updateTestCase(i, "input", e.target.value)}
                />
              </div>

              <div className="field-stack">
                <label>Expected Output</label>
                <input
                  placeholder="Expected Output"
                  onChange={e => updateTestCase(i, "output", e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="button-row" style={{ marginTop: "24px" }}>
          <button className="ghost-btn" onClick={addTestCase}>
            Add Test Case
          </button>

          <button className="primary-btn" onClick={save}>
            Add Question
          </button>
          <button className="secondary-btn" onClick={publish}>
            Publish Exam
          </button>
        </div>
      </div>
    </div>
  );
}
