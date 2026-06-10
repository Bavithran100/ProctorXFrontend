import { useEffect, useState } from "react";
import Client from "../Client";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function TodayExams() {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Client.get("/student/exams/today")
      .then(res => { setExams(res.data); console.log(res); })
      .catch(() => alert("Please login"));
  }, []);

  const now = new Date();

  function getButtonState(exam) {
    console.log(exam.startTime);
    const start = new Date(exam.startTime);
    const end = new Date(exam.endTime + "Z");

    if (now < start) return { text: "Not Started", disabled: true };
    if (now > end) return { text: "Exam Ended", disabled: true };

    return { text: "Start Exam", disabled: false };
  }

  return (
    <div className="exam-page">
      <div className="exam-container">
        <div className="page-header">
          <div>
            <div className="hero-badge">Student exam queue</div>
            <h2>Today's Exams</h2>
            <p>Join exams that are currently active within their scheduled availability window.</p>
          </div>
        </div>

        {exams.length === 0 && (
          <div className="empty-state">
            No active exams available right now.
          </div>
        )}

        {exams.map(exam => {
          const btn = getButtonState(exam);

          return (
            <div key={exam.id} className="exam-card">
              <h3>{exam.title}</h3>
              <div className="meta-grid">
                <div className="meta-item">
                  <span>Duration</span>
                  {exam.duration} mins
                </div>
                <div className="meta-item">
                  <span>Exam Entry</span>
                  {new Date(exam.startTime).toLocaleString()}
                </div>
                <div className="meta-item">
                  <span>Exam Close</span>
                  {new Date(exam.endTime).toLocaleString()}
                </div>
                <div className="meta-item">
                  <span>Exam Type</span>
                  {exam.examType}
                </div>
              </div>

              <button
                disabled={btn.disabled}
                onClick={() => {
                  if (exam.examType === "CODING") {
                    navigate(`/exam/${exam.id}/start-coding`);
                  } else {
                    navigate(`/exam/${exam.id}/start`);
                  }
                }}
              >
                {btn.text}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
