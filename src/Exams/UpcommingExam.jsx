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
        <h2>⏳ Upcoming Exams</h2>

        {exams.length === 0 && <p>No upcoming exams</p>}

        {exams.map(exam => (
          <div key={exam.id} className="exam-card">
            <h3>{exam.title}</h3>

            <p>Duration: {exam.duration} mins</p>

            <p>
              Starts at:{" "}
              <strong>
                {new Date(exam.startTime).toLocaleString()}
              </strong>
            </p>

            <p>
              Ends at:{" "}
              {new Date(exam.endTime).toLocaleString()}
            </p>

            <button disabled>
              Not Started Yet
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
