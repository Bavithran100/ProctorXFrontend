import { useEffect, useState } from "react";
import Client from "../Client";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function TodayExams() {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Client.get("/student/exams/today")
      .then(res =>{ setExams(res.data); console.log(res);})
      .catch(() => alert("Please login"));
  }, []);


  const now = new Date();

  function getButtonState(exam) {
    console.log(exam.startTime);
   const start = new Date(exam.startTime);
    const end = new Date(exam.endTime+"Z");

    if (now < start) return { text: "Not Started", disabled: true };
    if (now > end) return { text: "Exam Ended", disabled: true };

    return { text: "Start Exam", disabled: false };
  }

  return (
    <div className="exam-page">
      <div className="exam-container">
        <h2>📅 Today’s Exams</h2>

        {exams.map(exam => {
          const btn = getButtonState(exam);

          return (
            <div key={exam.id} className="exam-card">
              <h3>{exam.title}</h3>
              <p>Duration: {exam.duration} mins</p>
              <p>Exam Entry: {new Date(exam.startTime).toLocaleString()}</p>
            
              <p>Exam close: {new Date(exam.endTime).toLocaleString()}</p>

              <button
                disabled={btn.disabled}
                onClick={() => navigate(`/exam/${exam.id}/start`)}
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
