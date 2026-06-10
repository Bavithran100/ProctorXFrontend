import { useReducer } from "react";
import { useNavigate } from "react-router-dom";
import Client from "../Client";
import "../App.css";

export default function CreateExam() {
  const [exam, dispatchForm] = useReducer(
    (state, action) => ({ ...state, [action.name]: action.value }),
    {
      title: "",
      description: "",
      duration: "",
      totalMarks: "",
      examType: "MCQ",
      instructions: "",
      rules: "",
      startTime: "",
      endTime: ""
    }
  );

  const navigate = useNavigate();

  function handleChange(e) {
    dispatchForm({ name: e.target.name, value: e.target.value });
  }

  async function handleCreate(next) {
    try {
      const payload = {
        title: exam.title,
        description: exam.description,
        duration: Number(exam.duration),
        totalMarks: Number(exam.totalMarks),
        examType: exam.examType,
        startTime: exam.startTime,
        endTime: exam.endTime,
        instruction: {
          instructions: exam.instructions,
          rules: exam.rules
        }
      };

      const res = await Client.post("/admin/exams", payload);
      const examId = res.data.id;

      if (exam.examType === "CODING") {
        if (next === "AI") {
          navigate(`/admin/exams/${examId}/coding-ai`);
        } else {
          navigate(`/admin/exams/${examId}/coding-manual`);
        }
      } else {
        if (next === "AI") {
          navigate(`/admin/exams/${examId}/generate-ai`);
        } else {
          navigate(`/admin/exams/${examId}/add-questions`);
        }
      }
    } catch (err) {
      console.error("Failed to create exam", err);
    }
  }

  return (
    <div className="exam-page">
      <div className="exam-container">
        <div className="page-header">
          <div>
            <div className="hero-badge">Coordinator workflow</div>
            <h2>Create Exam</h2>
            <p>Set up exam details, scheduling, rules, and the question authoring path.</p>
          </div>
        </div>

        <div className="field-panel">
          <div className="form-grid">
            <div className="field-stack">
              <label>Exam Title</label>
              <input
                name="title"
                placeholder="Exam Title"
                onChange={handleChange}
              />
            </div>

            <div className="field-stack">
              <label>Duration</label>
              <input
                name="duration"
                type="number"
                placeholder="Duration (minutes)"
                onChange={handleChange}
              />
            </div>

            <div className="field-stack">
              <label>Total Marks</label>
              <input
                name="totalMarks"
                type="number"
                placeholder="Total Marks"
                onChange={handleChange}
              />
            </div>

            <div className="field-stack">
              <label>Short Description</label>
              <input
                name="description"
                placeholder="Short Description"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="field-panel" style={{ marginTop: "18px" }}>
          <div className="form-grid">
            <div className="field-stack">
              <label>Exam Type</label>
              <select
                name="examType"
                value={exam.examType}
                onChange={handleChange}
              >
                <option value="MCQ">MCQ Test</option>
                <option value="CODING">Coding Test</option>
              </select>
            </div>

            <div className="field-stack">
              <label>Start Time</label>
              <input
                type="datetime-local"
                step="60"
                name="startTime"
                onChange={handleChange}
              />
            </div>

            <div className="field-stack">
              <label>End Time</label>
              <input
                type="datetime-local"
                step="60"
                name="endTime"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: "18px" }}>
            <div className="field-stack">
              <label>Exam Instructions</label>
              <textarea
                name="instructions"
                placeholder="Exam Instructions"
                onChange={handleChange}
              />
            </div>

            <div className="field-stack">
              <label>Exam Rules</label>
              <textarea
                name="rules"
                placeholder="Exam Rules"
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="button-row" style={{ marginTop: "24px" }}>
          <button
            className="primary-btn"
            onClick={() => handleCreate("MANUAL")}
          >
            Add Questions Manually
          </button>

          <button
            className="secondary-btn"
            onClick={() => handleCreate("AI")}
          >
            Generate Questions using AI
          </button>
        </div>
      </div>
    </div>
  );
}
