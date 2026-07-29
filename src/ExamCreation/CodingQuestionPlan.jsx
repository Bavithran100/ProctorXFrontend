import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../App.css";

export default function CodingQuestionPlan() {
  const SYSTEM_PROMPT = `
You are an academic coding-exam planner for CSE students.

Turn the coordinator's brief into a practical plan for Java coding questions.
Choose an appropriate number of questions, difficulty, algorithms, constraints,
and edge-case coverage for the stated student level. Aim for correct, efficient,
and assessable questions.

Return ONLY valid JSON in this exact format:
{
  "topic": "",
  "questionCount": 5,
  "difficulty": "EASY",
  "targetComplexity": "",
  "constraints": "",
  "testCaseFocus": "",
  "additionalInstructions": ""
}

Use difficulty only as EASY, MEDIUM, HARD, or MIXED.
`;

  const { examId } = useParams();
  const navigate = useNavigate();
  const [planningPrompt, setPlanningPrompt] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generatePlan() {
    if (!planningPrompt.trim()) {
      alert("Describe the coding assessment you want to create first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: planningPrompt }
          ],
          temperature: 0.3
        })
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content
        ?.replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const generatedPlan = JSON.parse(content);

      setPlan({
        topic: generatedPlan.topic || planningPrompt,
        questionCount: Math.max(1, Number(generatedPlan.questionCount) || 1),
        difficulty: generatedPlan.difficulty || "MEDIUM",
        targetComplexity: generatedPlan.targetComplexity || "",
        constraints: generatedPlan.constraints || "",
        testCaseFocus: generatedPlan.testCaseFocus || "",
        additionalInstructions: generatedPlan.additionalInstructions || ""
      });
    } catch (error) {
      console.error("AI planning failed", error);
      alert("AI planning failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function continueToGenerator() {
    if (!plan) {
      alert("Generate the AI plan first");
      return;
    }

    navigate(`/admin/exams/${examId}/coding-ai`, { state: { plan } });
  }

  return (
    <div className="exam-page">
      <div className="exam-container">
        <div className="page-header">
          <div>
            <div className="hero-badge">AI planning brief</div>
            <h2>Plan Coding Questions</h2>
            <p>Describe the assessment once. AI will create the detailed plan used by the question generator.</p>
          </div>
        </div>

        <div className="field-panel">
          <div className="field-stack">
            <label>Assessment brief</label>
            <textarea
              value={planningPrompt}
              placeholder="Example: Plan DSA questions for third-year CSE students. Focus on arrays, stacks, and queues with efficient solutions and strong edge-case coverage."
              onChange={(event) => setPlanningPrompt(event.target.value)}
            />
          </div>
        </div>

        <button className="primary-btn" onClick={generatePlan} disabled={loading} style={{ marginTop: "20px" }}>
          {loading ? "Planning..." : "Generate AI Plan"}
        </button>

        {plan && (
          <div className="question-preview" style={{ marginTop: "24px" }}>
            <div className="question-preview-header">
              <h3>Generated Plan</h3>
              <span className="status-chip">{plan.questionCount} questions</span>
            </div>
            <p><b>Topic:</b> {plan.topic}</p>
            <p><b>Difficulty:</b> {plan.difficulty}</p>
            <p><b>Target complexity:</b> {plan.targetComplexity || "Appropriate efficient complexity"}</p>
            <p><b>Constraints:</b> {plan.constraints || "To be defined per question"}</p>
            <p><b>Test-case focus:</b> {plan.testCaseFocus || "Normal, boundary, and edge cases"}</p>
            {plan.additionalInstructions && <p><b>Additional instructions:</b> {plan.additionalInstructions}</p>}

            <button className="secondary-btn" onClick={continueToGenerator}>
              Use This Plan to Generate Questions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
