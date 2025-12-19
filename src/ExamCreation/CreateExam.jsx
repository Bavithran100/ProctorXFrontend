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
      instructions: "",
      rules: ""
    }
  );

  const navigate = useNavigate();

  function handleChange(e) {
    dispatchForm({ name: e.target.name, value: e.target.value });
  }

  async function handleNext() {
    try {
      const payload = {
        title: exam.title,
        description: exam.description,
        duration: Number(exam.duration),
        totalMarks: Number(exam.totalMarks),
        startTime: exam.startTime,
        endTime: exam.endTime,
        instruction: {
          instructions: exam.instructions,
          rules: exam.rules
        }
      };

      const res = await Client.post("/admin/exams", payload);
      navigate(`/admin/exams/${res.data.id}/add-questions`);
    } catch (err) {
      console.error("Failed to create exam", err);
    }
  }

  return (
    <div className="exam-page">
      <div className="exam-container">
        <h2>📝 Create Exam</h2>

        <div className="form-grid">
          <input name="title" placeholder="Exam Title" onChange={handleChange} />
          <input name="duration" type="number" placeholder="Duration (minutes)" onChange={handleChange} />

          <input name="totalMarks" type="number" placeholder="Total Marks" onChange={handleChange} />
          <input name="description" placeholder="Short Description" onChange={handleChange} />
        </div>
        

        <div className="form-grid full">
          <label>Start Time</label>
          <input type="datetime-local"   step="60" name="startTime" onChange={handleChange} />

          <label>End Time</label>
          <input type="datetime-local"   step="60" name="endTime" onChange={handleChange} />

          <textarea name="instructions" placeholder="Exam Instructions" onChange={handleChange} />
          <textarea name="rules" placeholder="Exam Rules" onChange={handleChange} />
        </div>

        <button className="primary-btn" onClick={handleNext}>
          Save & Add Questions →
        </button>
      </div>
    </div>
  );
}
