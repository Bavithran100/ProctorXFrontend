import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Client from "../Client";
import "../App.css";

const SYSTEM_PROMPT = `
You are an exam question generator AI for an online proctoring system.

Rules:
- Generate ONLY multiple choice questions (MCQs)
- Each question must have exactly 4 options: A, B, C, D
- Clearly mention the correct option (A/B/C/D)
- Questions must be exam-oriented
- No explanations
- Output MUST be valid JSON




JSON format:
{
  "questions": [
    {
      "questionText": "",
      "optionA": "",
      "optionB": "",
      "optionC": "",
      "optionD": "",
      "correctOption": "A",
      "marks": 1
    }
  ]
}
`;

export default function GenerateAIQuestions() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const plannedQuestionCount = location.state?.questionCount;

  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(plannedQuestionCount || 5);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  async function generateQuestions() {
    setLoading(true);
    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Generate ${count} MCQ questions on ${topic}`
              }
            ],
            temperature: 0.4
          })
        }
      );

      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      setQuestions(parsed.questions || []);
    } catch (err) {
      console.error("AI generation failed", err);
      alert("AI generation failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function mapQuestion(q) {
    return {
      questionText: q.questionText,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctOption: q.correctOption
    };
  }

  async function saveQuestions() {
    if (plannedQuestionCount && questions.length !== plannedQuestionCount) {
      alert(`Generate exactly ${plannedQuestionCount} questions for this exam`);
      return;
    }

    try {
      for (let q of questions) {
        const payload = mapQuestion(q);
        await Client.post(`/admin/exams/${examId}/questions`, payload);
      }
      navigate(`/admin/exams/${examId}/add-questions`);
    } catch (err) {
      console.error("Failed to save questions", err);
      alert("Failed to save questions");
    }
  }

  return (
    <div className="exam-page">
      <div className="exam-container">
        <div className="page-header">
          <div>
            <div className="hero-badge">AI assisted authoring</div>
            <h2>Generate Questions using AI</h2>
            <p>Produce MCQ drafts, preview them clearly, and keep your existing generation logic intact.</p>
          </div>
        </div>

        <div className="field-panel">
          <div className="form-grid">
            <div className="field-stack">
              <label>Topic</label>
              <input
                placeholder="Enter topic (e.g. Data Structures)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="field-stack">
              <label>Number of Questions</label>
              <input
                type="number"
                placeholder="Number of questions"
                value={count}
                readOnly={Boolean(plannedQuestionCount)}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button className="primary-btn" onClick={generateQuestions} style={{ marginTop: "20px" }}>
          {loading ? "Generating..." : "Generate Questions"}
        </button>

        {loading && (
          <div className="preview-stack" style={{ marginTop: "20px" }}>
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        )}

        {questions.length > 0 && (
          <>
            <h3 style={{ marginTop: "26px" }}>Preview</h3>

            {questions.map((q, i) => (
              <div key={i} className="question-preview">
                <div className="question-preview-header">
                  <h4>Question {i + 1}</h4>
                  <span className="status-chip">Marks assigned automatically</span>
                </div>
                <p><b>Prompt:</b> {q.questionText}</p>
                <div className="options-grid options-list">
                  <div className="option">A. {q.optionA}</div>
                  <div className="option">B. {q.optionB}</div>
                  <div className="option">C. {q.optionC}</div>
                  <div className="option">D. {q.optionD}</div>
                </div>
                <p><b>Correct Option:</b> {q.correctOption}</p>
              </div>
            ))}

            <button className="secondary-btn" onClick={saveQuestions}>
              Use These Questions
            </button>
          </>
        )}
      </div>
    </div>
  );
}
