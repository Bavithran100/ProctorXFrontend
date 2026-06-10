import { useEffect, useState } from "react";
import Client from "../Client";
import "../App.css";

export default function UpcomingExams() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    Client.get("/student/exams/upcoming")
      .then(res => setExams(res.data))
      .catch((err) => alert(err));
  }, []);

  return (
    <div className="exam-page">
      <div className="exam-container">
        <div className="page-header">
          <div>
            <div className="hero-badge">Upcoming schedule</div>
            <h2>Upcoming Exams</h2>
            <p>Review what is scheduled next so students know when to return.</p>
          </div>
        </div>

        {exams.length === 0 && <div className="empty-state">No upcoming exams</div>}

        {exams.map(exam => (
          <div key={exam.id} className="exam-card">
            <h3>{exam.title}</h3>
            <div className="meta-grid">
              <div className="meta-item">
                <span>Duration</span>
                {exam.duration} mins
              </div>
              <div className="meta-item">
                <span>Starts At</span>
                {new Date(exam.startTime).toLocaleString()}
              </div>
              <div className="meta-item">
                <span>Ends At</span>
                {new Date(exam.endTime).toLocaleString()}
              </div>
            </div>

            <button disabled>
              Not Started Yet
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
