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
        <h2>📊 My Exam Results</h2>

        {results.length === 0 && (
          <p className="empty-results">No exams attempted yet</p>
        )}

        {results.length > 0 && (
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
                        r.score >= r.totalMarks / 2 ? "pass" : "fail"
                      }
                    >
                      {r.score >= r.totalMarks / 2 ? "✅ Pass" : "❌ Fail"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
