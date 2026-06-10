import { useEffect, useState } from "react";
import Client from "../Client";
import "../AdminMonitoring.css";

export default function AdminMalpracticeHistory() {
  const [logs, setLogs] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("MALPRACTICE");

  useEffect(() => {
    Promise.all([
      Client.get("/admin/malpractice/logs"),
      Client.get("/admin/malpractice/history")
    ])
      .then(([logRes, actionRes]) => {
        setLogs(logRes.data);
        setActions(actionRes.data);
        setLoading(false);
      })
      .catch(() => alert("Failed to load history"));
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container loading-card">
          <div className="hero-badge">History viewer</div>
          <h3 className="loading-dots">Loading malpractice history</h3>
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
            <div className="hero-badge">Audit trails</div>
            <h2>Malpractice & Admin Action History</h2>
            <p className="admin-subtitle">Switch between student events and admin interventions.</p>
          </div>
        </div>

        <div className="toggle-bar">
          <label>
            <input
              type="radio"
              name="view"
              value="MALPRACTICE"
              checked={view === "MALPRACTICE"}
              onChange={() => setView("MALPRACTICE")}
            />
            Student Malpractice
          </label>

          <label>
            <input
              type="radio"
              name="view"
              value="ACTIONS"
              checked={view === "ACTIONS"}
              onChange={() => setView("ACTIONS")}
            />
            Admin Actions
          </label>
        </div>

        {view === "MALPRACTICE" && (
          <>
            <h3>Student Malpractice Events</h3>

            <div className="table-shell">
              <table className="monitor-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Student</th>
                    <th>Exam</th>
                    <th>Event</th>
                    <th>Severity</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-row">
                        No malpractice events found
                      </td>
                    </tr>
                  )}

                  {logs.map(l => (
                    <tr key={l.id}>
                      <td>{new Date(l.timestamp).toLocaleString()}</td>
                      <td>{l.session.student.name}</td>
                      <td>{l.session.exam.title}</td>
                      <td>{l.eventType}</td>
                      <td>{l.severity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === "ACTIONS" && (
          <>
            <h3>Admin Actions</h3>

            <div className="table-shell">
              <table className="monitor-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Admin</th>
                    <th>Student</th>
                    <th>Exam</th>
                    <th>Action</th>
                    <th>Remark</th>
                  </tr>
                </thead>

                <tbody>
                  {actions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-row">
                        No admin actions found
                      </td>
                    </tr>
                  )}

                  {actions.map(a => (
                    <tr key={a.id}>
                      <td>{new Date(a.timestamp).toLocaleString()}</td>
                      <td>{a.admin.name}</td>
                      <td>{a.session.student.name}</td>
                      <td>{a.session.exam.title}</td>
                      <td>{a.action}</td>
                      <td>{a.remark || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
