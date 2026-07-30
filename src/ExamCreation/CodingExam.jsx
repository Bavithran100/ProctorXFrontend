import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import Client from "../Client";
import "../App.css";
import CountDownTimer from "./CountDownTimer";
import ProctoringOverlay from "../proctoring/ProctoringOverlay";

export default function CodingExam() {
  const autoSubmittedRef = useRef(false);
  const scoreRef = useRef(0);
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
  const [exam, setExam] = useState(null);
  const [current, setCurrent] = useState(0);
  const [code, setCode] = useState(BOILER_CODE);
  const [results, setResults] = useState([]);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(null);

  const submitExam = useCallback(async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const res = await Client.post(
        `/student/exams/${examId}/coding-submit`,
        { score: scoreRef.current }
      );

      alert("Exam submitted. Score: " + res.data.score);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Unable to submit coding exam");
    } finally {
      setSubmitting(false);
    }
  }, [examId, navigate, submitting]);

  useEffect(() => {
    scoreRef.current = score;
    if (exam) {
      Client.post(`/student/exams/${examId}/coding-progress`, { score }).catch(() => {});
    }
  }, [exam, examId, score]);

  useEffect(() => {
    async function startCodingExam() {
      try {
        const startResponse = await Client.get(`/student/exams/${examId}/start`);
        const questionsResponse = await Client.get(`/student/exams/${examId}/coding-questions`);
        setExam(startResponse.data.exam);
        setRemainingSeconds(startResponse.data.remainingSeconds);
        setQuestions(questionsResponse.data);
      } catch (error) {
        console.error(error);
        if (error.response?.data === "SESSION_WAITING") {
          alert("You are in the waiting state. Contact your coordinator to continue this exam.");
        } else if (error.response?.data === "EXAM_TERMINATED_BY_COORDINATOR") {
          alert("Your exam was submitted by the coordinator.");
        } else if (error.response?.data === "EXAM_INACTIVE_SUBMITTED" || error.response?.data === "EXAM_TIME_OVER_SUBMITTED") {
          alert("Your exam has been submitted using your saved progress.");
        } else {
          alert("Unable to start coding exam.");
        }
        navigate("/dashboard");
      }
    }

    startCodingExam();
  }, [examId, navigate]);

  useEffect(() => {
    if (!exam) return;

    function logEvent(event) {
      Client.post(
        `/student/exams/${exam.id}/malpractice`,
        null,
        { params: { event } }
      ).catch(() => {});
    }

    const onBlur = () => logEvent("WINDOW_BLUR");
    const onVisibilityChange = () => {
      if (document.hidden) logEvent("TAB_SWITCH");
    };
    const onCopy = () => logEvent("COPY");
    const onPaste = () => logEvent("PASTE");
    const onContextMenu = event => {
      event.preventDefault();
      logEvent("RIGHT_CLICK");
    };
    const onPageHide = () => logEvent("PAGE_REFRESH");

    window.addEventListener("blur", onBlur);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContextMenu);

    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, [exam]);

  useEffect(() => {
    if (!exam) return;

    const sendHeartbeat = () => {
      Client.post(`/student/exams/${exam.id}/heartbeat`)
        .then(response => {
          if (response.headers["x-exam-warning"]) {
            alert("Warning: " + response.data);
          }
        })
        .catch(error => {
          if (
            error.response?.data === "EXAM_TIME_OVER_SUBMITTED" &&
            !autoSubmittedRef.current
          ) {
            autoSubmittedRef.current = true;
            alert("Time finished. Submitting coding exam...");
            navigate("/dashboard");
          } else if (error.response?.data === "EXAM_INACTIVE_SUBMITTED") {
            alert("Your exam was inactive for more than 10 minutes. Your saved progress was submitted.");
            navigate("/dashboard");
          } else if (error.response?.data === "SESSION_WAITING") {
            alert("The coordinator has moved you to the waiting list. You are not allowed to continue this exam. Contact your coordinator.");
            navigate("/dashboard");
          } else if (error.response?.data === "EXAM_TERMINATED_BY_COORDINATOR") {
            alert("Your exam was submitted by the coordinator.");
            navigate("/dashboard");
          } else if (error.response?.status === 403) {
            alert("Your exam session was stopped by admin");
            navigate("/dashboard");
          }
        });
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 5000);

    return () => clearInterval(interval);
  }, [exam, navigate, submitExam]);

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

  if (!q || !exam) {
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
      <ProctoringOverlay examId={exam.id} />
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

        <CountDownTimer
          durationMinutes={exam.duration}
          remainingSeconds={remainingSeconds}
          onTimeUp={() => {
            if (!autoSubmittedRef.current) {
              autoSubmittedRef.current = true;
              alert("Time is over. Submitting coding exam...");
              submitExam();
            }
          }}
        />

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
            <button className="submit-btn" onClick={submitExam} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Exam"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
