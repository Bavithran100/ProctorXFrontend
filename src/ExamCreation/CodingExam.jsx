import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Client from "../Client";
import "../App.css";

export default function CodingExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const BOILER_CODE = `
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // ===== INPUT =====


        // ===== LOGIC =====


        // ===== OUTPUT =====


    }
}
`;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [code, setCode] = useState(BOILER_CODE);
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    Client.get(`/student/exams/${examId}/coding-questions`)
      .then(res => setQuestions(res.data));
  }, []);

  const q = questions[current];

  async function runCode(input) {
    const cleanedCode = (code || "").trim();
    const res = await Client.post("/code-execution/generate-output", {
      script: cleanedCode,
      stdin: input
    });

    return res.data.stdout;
  }

  async function runTests() {
    let passed = 0;
    let res = [];

    for (let t of q.testCases) {
      const out = await runCode(t.input);

      const actual = out?.trim();
      const expected = t.expectedOutput.trim();
      const ok = actual === expected;

      if (ok) passed++;

      res.push({
        input: t.input,
        expected,
        actual,
        passed: ok
      });
    }

    setResults(res);

    if (passed === q.testCases.length) {
      setScore(score + q.marks);
    }
  }

  function nextQuestion() {
    setCurrent(current + 1);
    setResults([]);
    setCode("");
  }

  async function submitExam() {
    console.log(score);
    const res = await Client.post(
      `/student/exams/${examId}/coding-submit`,
      { score }
    );

    alert("Exam submitted. Score: " + res.data.score);

    navigate("/dashboard");
  }

  if (!q) {
    return (
      <div className="exam-page">
        <div className="exam-container loading-shell">
          <div className="hero-badge">Coding assessment</div>
          <h2 className="loading-dots">Loading</h2>
          <div className="skeleton-card" style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="exam-page">
      <div className="exam-container">
        <div className="page-header">
          <div>
            <div className="hero-badge">Coding exam workspace</div>
            <h2>{q.title}</h2>
            <p>{q.description}</p>
          </div>
          <div className="meta-grid" style={{ minWidth: "min(100%, 380px)" }}>
            <div className="meta-item">
              <span>Question</span>
              {current + 1} / {questions.length}
            </div>
            <div className="meta-item">
              <span>Score</span>
              {score}
            </div>
            <div className="meta-item">
              <span>Marks</span>
              {q.marks}
            </div>
          </div>
        </div>

        <h3>Sample Testcases</h3>
        <div className="sample-grid">
          {(q.testCases || []).map((t, i) => (
            <div key={i} className="testcase-card">
              <h4>Case {i + 1}</h4>
              <span className="label">Input</span>
              <pre>{t.input}</pre>
              <span className="label">Expected Output</span>
              <pre>{t.expectedOutput}</pre>
            </div>
          ))}
        </div>

        <div className="editor-shell">
          <div className="editor-toolbar">
            <strong>Java Editor</strong>
            <span>Monaco editor with preserved exam logic</span>
          </div>
          <Editor
            height="360px"
            defaultLanguage="java"
            value={code}
            theme="vs-dark"
            onChange={v => setCode(v || "")}
          />
        </div>

        <div className="button-row">
          <button className="primary-btn" onClick={runTests}>Run Code</button>
        </div>

        {results.length > 0 && (
          <div className="results-stack" style={{ marginTop: "24px" }}>
            {results.map((r, i) => (
              <div key={i} className={`result-card ${r.passed ? "pass" : "fail"}`}>
                <div className="question-preview-header">
                  <h4>Test Result {i + 1}</h4>
                  <span className={`result-status ${r.passed ? "pass" : "fail"}`}>
                    {r.passed ? "PASS" : "FAIL"}
                  </span>
                </div>
                <span className="label">Input</span>
                <pre>{r.input}</pre>
                <span className="label">Expected</span>
                <pre>{r.expected}</pre>
                <span className="label">Output</span>
                <pre>{r.actual}</pre>
              </div>
            ))}
          </div>
        )}

        <div className="button-row" style={{ marginTop: "24px" }}>
          {current < questions.length - 1 ? (
            <button className="secondary-btn" onClick={nextQuestion}>
              Next Question
            </button>
          ) : (
            <button className="submit-btn" onClick={submitExam}>
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
