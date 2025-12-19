import { useEffect, useState } from "react";
import Client from "../Client";
import "../AdminMonitoring.css";

export default function AdminLiveMonitor() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = () => {
    Client.get("/admin/monitor/live-sessions")
      .then(res => {
        setSessions(res.data);
        setLoading(false);
      })
      .catch(() => alert("Failed to load live sessions"));
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const takeAction = (sessionId, action) => {
    let remark = "";

    if (action === "WARN") {
      remark = prompt("Enter warning message:");
      if (!remark) return;
    }

    if (action === "TERMINATE") {
      const ok = window.confirm("Terminate this exam?");
      if (!ok) return;
    }

    Client.post(`/admin/actions/${sessionId}`, null, {
      params: { action, remark }
    }).then(loadSessions);
  };

  const riskClass = score => {
    if (score >= 7) return "risk-high";
    if (score >= 4) return "risk-mid";
    return "risk-low";
  };

  if (loading) return <h3>Loading live exams...</h3>;

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h2>👀 Admin Live Monitoring</h2>
        <p className="admin-subtitle">
          Auto-refreshing every 5 seconds
        </p>

        <table className="monitor-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Exam</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Flags</th>
              <th>Inactive</th>
              <th>Actions</th>
              <th>Events</th>
            </tr>
          </thead>

          <tbody>
            {sessions.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-row">
                  No active exam sessions
                </td>
              </tr>
            )}

            {sessions.map(s => (
              <tr key={s.sessionId}>
                <td>{s.studentName}</td>
                <td>{s.examTitle}</td>
                <td>{s.status}</td>

                <td className={riskClass(s.riskScore)}>
                  {s.riskScore}
                </td>

                <td>{s.malpracticeCount}</td>

                <td>
                  <span className={s.inactive ? "inactive-yes" : "inactive-no"}>
                    {s.inactive ? "YES" : "NO"}
                  </span>
                </td>
                <td>
                  {Object.entries(s.events).map(([type, count]) => (
                    <div key={type}>
                      {type}: {count}
                    </div>
                  ))}
                </td>


                <td>
                  <button
                    className="action-btn"
                    onClick={() => takeAction(s.sessionId, "WARN")}
                  >
                    ⚠
                  </button>

                  <button
                    className="action-btn"
                    onClick={() => takeAction(s.sessionId, "LOCK")}
                  >
                    🔒
                  </button>

                  <button
                    className="action-btn"
                    onClick={() => takeAction(s.sessionId, "TERMINATE")}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
