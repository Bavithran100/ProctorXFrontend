import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Client from "../Client";
import "../App.css";
import CountDownTimer from "./CountDownTimer";

export default function StartExam() {
  const autoSubmittedRef = useRef(false);

  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(null);

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
    const onContextMenu = e => {
      e.preventDefault();
      logEvent("RIGHT_CLICK");
    };

    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContextMenu);

    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContextMenu);
    };
  }, [exam]);

  useEffect(() => {
    if (!exam) return;

    const interval = setInterval(() => {
      Client.post(`/student/exams/${exam.id}/heartbeat`)
        .then(res => {
          if (res.headers["x-exam-warning"]) {
            alert("âš ï¸ WARNING: " + res.data);
          }
        })
        .catch(err => {
          if (
            err.response?.data === "EXAM_TIME_OVER_SUBMITTED" &&
            !autoSubmittedRef.current
          ) {
            autoSubmittedRef.current = true;

            alert("â° Time finished! Auto submitting exam...");
            navigate("/dashboard");
          }
          else if (err.response?.data === "EXAM_INACTIVE_SUBMITTED") {
            alert("Your exam was inactive for more than 10 minutes. Your saved progress was submitted.");
            navigate("/dashboard");
          }
          else if (err.response?.data === "SESSION_WAITING") {
            alert("You are not allowed to continue this exam. Contact your coordinator.");
            navigate("/dashboard");
          }
          else if (err.response?.data === "EXAM_TERMINATED_BY_COORDINATOR") {
            alert("Your exam was submitted by the coordinator.");
            navigate("/dashboard");
          }
          else if (err.response?.status === 403) {
            alert("Your exam session was stopped by admin");
            navigate("/dashboard");
          }
        });
    }, 10000);

    return () => clearInterval(interval);
  }, [exam, navigate]);

  useEffect(() => {
    Client.get(`/student/exams/${examId}/start`)
      .then(res => {
        setExam(res.data.exam);
        setRemainingSeconds(res.data.remainingSeconds);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        if (err.response?.data === "SESSION_WAITING") {
          alert("You are not allowed to continue this exam. Contact your coordinator.");
        } else if (err.response?.data === "EXAM_TERMINATED_BY_COORDINATOR") {
          alert("Your exam was submitted by the coordinator.");
        } else if (err.response?.data === "EXAM_INACTIVE_SUBMITTED" || err.response?.data === "EXAM_TIME_OVER_SUBMITTED") {
          alert("Your exam has been submitted using your saved progress.");
        } else {
          alert("Unable to load exam or exam already submitted.");
        }
        navigate("/dashboard");
      });
  }, [examId, navigate]);

  function handleOptionChange(questionId, option) {
    setAnswers(prev => {
      const nextAnswers = { ...prev, [questionId]: option };
      Client.post(`/student/exams/${examId}/progress`, { answers: nextAnswers }).catch(() => {});
      return nextAnswers;
    });
  }

  async function handleSubmit() {
    if (Object.keys(answers).length !== exam.questions.length) {
      if (autoSubmittedRef.current == true) {
        alert("submitted successfully without answering all questions !!!");
      } else {
        alert("Please answer all questions");
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        answers: Object.keys(answers).map(qId => ({
          question: { id: Number(qId) },
          selectedOption: answers[qId]
        }))
      };

      const res = await Client.post(
        `/student/exams/${exam.id}/submit`,
        payload
      );

      alert(`Submitted successfully!\nScore: ${res.data.score}`);
      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      alert("Submission failed ! | You already submitted ");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="exam-page">
        <div className="exam-container loading-card">
          <div className="hero-badge">Preparing exam session</div>
          <h3 className="loading-dots">Loading exam</h3>
          <div className="skeleton-card" style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  if (!exam) return <h3>Exam not found</h3>;

  return (
    <div className="exam-page">
      <div className="exam-container">
        <div className="page-header">
          <div>
            <div className="hero-badge">Live monitored attempt</div>
            <h2>{exam.title}</h2>
            <p>{exam.description}</p>
          </div>
          <div className="meta-grid" style={{ minWidth: "min(100%, 420px)" }}>
            <div className="meta-item">
              <span>Duration</span>
              {exam.duration} minutes
            </div>
            <div className="meta-item">
              <span>Questions</span>
              {exam.questions.length}
            </div>
          </div>
        </div>

        <CountDownTimer
          durationMinutes={exam.duration}
          remainingSeconds={remainingSeconds}
          onTimeUp={() => {
            alert("â° Time is over! Auto submitting...");
            handleSubmit();
          }}
        />

        <div className="question-list">
          {exam.questions.map((q, index) => (
            <div key={q.id} className="question">
              <h4>{index + 1}. {q.questionText}</h4>

              <div className="options-grid options-list">
              {[
                { key: "A", text: q.optionA },
                { key: "B", text: q.optionB },
                { key: "C", text: q.optionC },
                { key: "D", text: q.optionD }
              ].map((opt) => (
                  <label key={opt.key} className="option">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      checked={answers[q.id] === opt.key}
                      onChange={() => handleOptionChange(q.id, opt.key)}
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          className="submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Exam"}
        </button>
      </div>
    </div>
  );
}
