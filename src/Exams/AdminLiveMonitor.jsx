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
      remark = prompt("Enter prompt message for the student:");
      if (!remark) return;
    }

    if (action === "TERMINATE") {
      const ok = window.confirm("Submit this student's current progress and terminate the exam?");
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

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container loading-card">
          <div className="hero-badge">Live session visibility</div>
          <h3 className="loading-dots">Loading live exams</h3>
          <div className="skeleton-card" style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="page-header">
          <div>
            <div className="hero-badge">Auto-refresh every 5 seconds</div>
            <h2>Admin Live Monitoring</h2>
            <p className="admin-subtitle">
              Observe risk signals, activity flags, and intervene without changing the exam flow.
            </p>
          </div>
        </div>

        <div className="table-shell">
          <table className="monitor-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Exam</th>
                <th>Status</th>
                <th>Time Left</th>
                <th>Score</th>
                <th>Reconnects</th>
                <th>Risk</th>
                <th>Flags</th>
                <th>Inactive</th>
                <th>Events</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {sessions.length === 0 && (
                <tr>
                  <td colSpan="11" className="empty-row">
                    No active exam sessions
                  </td>
                </tr>
              )}

              {sessions.map(s => (
                <tr key={s.sessionId}>
                  <td>{s.studentName}</td>
                  <td>{s.examTitle}</td>
                  <td>{s.status}</td>

                  <td>{Math.floor(s.remainingSeconds / 60)}:{String(s.remainingSeconds % 60).padStart(2, "0")}</td>
                  <td>{s.currentScore}</td>
                  <td>{s.disconnectCount} / 3</td>

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
                    <div className="events-stack">
                      {Object.entries(s.events).map(([type, count]) => (
                        <div key={type}>
                          {type}: {count}
                        </div>
                      ))}
                    </div>
                  </td>

                  <td>
                    {(s.status === "ACTIVE" || s.status === "WAITING") && (
                    <div className="action-stack">
                      <button
                        className="action-btn warn"
                        onClick={() => takeAction(s.sessionId, "WARN")}
                      >
                        !
                      </button>

                      {s.status === "WAITING" ? (
                        <button
                          className="action-btn lock"
                          onClick={() => takeAction(s.sessionId, "NORMAL")}
                          title="Return student to normal exam access"
                        >
                          ✓
                        </button>
                      ) : (
                        <button
                          className="action-btn lock"
                          onClick={() => takeAction(s.sessionId, "WAITING")}
                          title="Move student to waiting state"
                        >
                          W
                        </button>
                      )}

                      <button
                        className="action-btn terminate"
                        onClick={() => takeAction(s.sessionId, "TERMINATE")}
                      >
                        X
                      </button>
                    </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
