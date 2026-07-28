import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import Client from "../Client";
import "../App.css";

export default function GenerateCodingAIQuestions() {
  const SYSTEM_PROMPT = `
You are a programming exam generator AI.

Rules:
- Generate coding questions
- Include a correct reference solution in Java
- Return ONLY valid JSON
- No markdown, no explanations
- Generate Beginner level questions
- Class Name Must be Main

IMPORTANT:
- DO NOT generate testcases
- DO NOT generate expected output

REFERENCE SOLUTION RULES:
- Must be complete runnable Java code
- Must use Scanner
- Must follow STDIN format
- Must print output correctly

JSON format:

{
 "questions":[
   {
     "title":"",
     "description":"",
     "difficulty":"EASY",
     "allowedLanguage":"JAVA",
     "marks":10,
     "referenceSolution":""
   }
 ]
}
`;

  const { examId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(2);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [inputs, setInputs] = useState({});
  const [solutions, setSolutions] = useState({});
  const [generatedOutput, setGeneratedOutput] = useState({});

  async function generate() {
    if (!topic) {
      alert("Enter a topic first");
      return;
    }

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
              { role: "user", content: `Generate ${count} coding questions on ${topic}` }
            ],
            temperature: 0.4
          })
        }
      );

      const data = await res.json();

      let content = data.choices[0].message.content;

      content = content.replace(/```json/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(content);

      const questionsWithTC = (parsed.questions || []).map(q => ({
        ...q,
        testCases: [],
        referenceSolution: q.referenceSolution || ""
      }));

      setQuestions(questionsWithTC);

      setSolutions(
        questionsWithTC.reduce((acc, q, i) => {
          acc[i] = q.referenceSolution;
          return acc;
        }, {})
      );
    } catch (err) {
      console.error(err);
      alert("AI generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function generateOutput(qIndex) {
    const input = inputs[qIndex];
    const solution = solutions[qIndex];

    if (!input) return alert("Enter input");
    if (!solution) return alert("Paste solution");

    try {
      const res = await Client.post("/code-execution/generate-output", {
        script: solution,
        stdin: input
      });
      const data = res.data;

      if (!data.stdout) {
        alert("Error in code");
        console.log(data);
        return;
      }

      setGeneratedOutput({
        ...generatedOutput,
        [qIndex]: data.stdout.trim().replace(/\s+/g, " ")
      });
    } catch (err) {
      console.error(err);
      alert("Judge error");
    }
  }

  function addTestCase(qIndex) {
    const input = inputs[qIndex];
    const output = generatedOutput[qIndex];

    if (!input || !output) {
      alert("Generate output first");
      return;
    }

    const updated = [...questions];

    updated[qIndex].testCases.push({
      input: input.trim(),
      expectedOutput: output
    });

    setQuestions(updated);

    setGeneratedOutput({
      ...generatedOutput,
      [qIndex]: ""
    });
  }

  async function save() {
    try {
      for (let q of questions) {
        await Client.post(`/admin/exams/${examId}/coding-questions`, q);
      }

      alert("Saved successfully");
      navigate(`/admin/exams/${examId}/coding-manual`);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  }

  return (
    <div className="exam-page">
      <div className="exam-container">
        <div className="page-header">
          <div>
            <div className="hero-badge">AI coding authoring</div>
            <h2>Generate Coding Questions</h2>
            <p>Draft coding prompts, validate sample outputs, and assemble testcase sets in one view.</p>
          </div>
        </div>

        <div className="field-panel">
          <div className="form-grid">
            <div className="field-stack">
              <label>Topic</label>
              <input
                placeholder="Enter topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="field-stack">
              <label>Question Count</label>
              <input
                type="number"
                min="1"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button className="primary-btn" onClick={generate} style={{ marginTop: "20px" }}>
          {loading ? "Generating..." : "Generate"}
        </button>

        {loading && (
          <div className="preview-stack" style={{ marginTop: "20px" }}>
            <div className="skeleton-card" />
          </div>
        )}

        {questions.length > 0 && (
          <>
            <h3 style={{ marginTop: "26px" }}>Preview</h3>

            {questions.map((q, i) => (
              <div key={i} className="question-preview">
                <h4>{q.title}</h4>
                <p>{q.description}</p>

                <p>Difficulty: {q.difficulty}</p>
                <p>Marks: {q.marks}</p>

                <div className="editor-shell">
                  <div className="editor-toolbar">
                    <strong>Reference Solution</strong>
                    <span>Java template from the generated output</span>
                  </div>
                  <Editor
                    height="300px"
                    defaultLanguage="java"
                    value={solutions[i] || ""}
                    theme="vs-dark"
                    onChange={(value) =>
                      setSolutions({ ...solutions, [i]: value })
                    }
                  />
                </div>

                <div className="field-panel">
                  <p className="helper-text">
                    Input Guide: Single -&gt; 5 | Two -&gt; 5 10 | Array -&gt; line one size, line two values, line three extra argument.
                  </p>

                  <div className="field-stack">
                    <label>Input</label>
                    <textarea
                      placeholder="Enter input"
                      onChange={(e) =>
                        setInputs({ ...inputs, [i]: e.target.value })
                      }
                    />
                  </div>

                  <div className="button-row">
                    <button className="ghost-btn" onClick={() => generateOutput(i)}>
                      Generate Output
                    </button>

                    <button className="secondary-btn" onClick={() => addTestCase(i)}>
                      Add Testcase
                    </button>
                  </div>

                  <div className="field-stack" style={{ marginTop: "16px" }}>
                    <label>Output</label>
                    <pre>{generatedOutput[i]}</pre>
                  </div>
                </div>

                <p><b>Testcases</b></p>

                <div className="results-stack">
                  {(q.testCases || []).map((t, j) => (
                    <div key={j} className="testcase-card">
                      <h4>Testcase {j + 1}</h4>
                      <span className="label">Input</span>
                      <pre>{t.input}</pre>
                      <span className="label">Output</span>
                      <pre>{t.expectedOutput}</pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button className="submit-btn" onClick={save}>
              Save Questions
            </button>
          </>
        )}
      </div>
    </div>
  );
}
