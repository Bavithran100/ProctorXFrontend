import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Client from "../Client";
import "../App.css";
 import { useRef } from "react";
 import CountDownTimer from "./CountDownTimer";

export default function StartExam() {
 

const autoSubmittedRef = useRef(false);

  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);


  
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
          alert("⚠️ WARNING: " + res.data);
        }
      })
      .catch(err => {
        if (
          err.response?.status === 403 &&
          err.response?.data === "TIME_OVER" &&
          !autoSubmittedRef.current
        ) {
          autoSubmittedRef.current = true;

          alert("⏰ Time finished! Auto submitting exam...");
          handleSubmit();   // 🔥 auto submit
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
        setExam(res.data);
        setLoading(false);
  

      })
      .catch(err => {
        console.log(err);
        alert("Unable to load exam or Exam already Submitted");
        navigate("/dashboard");
      });
  }, [examId, navigate]);

  function handleOptionChange(questionId, option) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  }

  async function handleSubmit() {
    
    if (Object.keys(answers).length !== exam.questions.length) {
      if(autoSubmittedRef.current==true){
        alert("submitted successfully without answering all questions !!!")
      }else{
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
    } catch(err) {
console.log(err);
      alert("Submission failed ! | You already submitted ");
      
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <h3>Loading exam...</h3>;
  if (!exam) return <h3>Exam not found</h3>;

  return (
    <div className="exam-page">
      <div className="exam-container">
        <h2>{exam.title}</h2>
        <p>{exam.description}</p>
        <p><b>Duration:</b> {exam.duration} minutes</p>

        <hr/>
              <CountDownTimer
  durationMinutes={exam.duration}
  onTimeUp={() => {
    alert("⏰ Time is over! Auto submitting...");
    handleSubmit();
  }}
/>

        {exam.questions.map((q, index) => (
          <div key={q.id} className="question">
            <h4>{index + 1}. {q.questionText}</h4>

            {[q.optionA, q.optionB, q.optionC, q.optionD].map((opt, i) => (
              <label key={i} className="option">
                <input
                  type="radio"
                  name={`question-${q.id}`}
                  checked={answers[q.id] === opt}
                  onChange={() => handleOptionChange(q.id, opt)}
                />{" "}
                {opt}
              </label>
            ))}
          </div>
        ))}

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
