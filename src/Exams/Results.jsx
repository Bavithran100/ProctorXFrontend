import { useEffect, useState } from "react";
import Client from "../Client";
import "../AdminMonitoring.css";

export default function Results() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    Client.get("/student/results")
      .then(res => setResults(res.data))
      .catch(() => alert("Failed to load results"));
  }, []);

  return (
    <div className="results-page">
      <div className="results-container">
        <div className="page-header">
          <div>
            <div className="hero-badge">Student performance</div>
            <h2>My Exam Results</h2>
            <p>Review submitted exams, scores, and pass or fail outcomes.</p>
          </div>
        </div>

        {results.length === 0 && (
          <p className="empty-results">No exams attempted yet</p>
        )}

        {results.length > 0 && (
          <div className="table-shell">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Score</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td>{r.examTitle}</td>
                    <td>{r.score} / {r.totalMarks}</td>
                    <td>{new Date(r.submittedAt).toLocaleString()}</td>
                    <td>
                      <span
                        className={
                          r.score >= r.totalMarks / 2 ? "result-status pass" : "result-status fail"
                        }
                      >
                        {r.score >= r.totalMarks / 2 ? "Pass" : "Fail"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
