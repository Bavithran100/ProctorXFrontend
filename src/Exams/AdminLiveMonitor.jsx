import { useEffect, useMemo, useState } from "react";
import Client from "../Client";
import "../AdminMonitoring.css";

const isAttending = (status) => status === "ACTIVE" || status === "WAITING";
const isCompleted = (status) => status === "SUBMITTED" || status === "TERMINATED";

export default function AdminLiveMonitor() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState(null);

  const loadSessions = () => {
    Client.get("/admin/monitor/live-sessions")
      .then((res) => { setSessions(res.data); setLoading(false); })
      .catch(() => alert("Failed to load live monitoring data"));
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const exams = useMemo(() => {
    const grouped = new Map();
    sessions.forEach((session) => {
      if (!grouped.has(session.examId)) grouped.set(session.examId, { id: session.examId, title: session.examTitle, sessions: [] });
      grouped.get(session.examId).sessions.push(session);
    });
    return [...grouped.values()].map((exam) => ({
      ...exam,
      attending: exam.sessions.filter((session) => isAttending(session.status)).length,
      completed: exam.sessions.filter((session) => isCompleted(session.status)).length,
      inactive: exam.sessions.filter((session) => session.inactive).length,
      videoRisk: exam.sessions.reduce((sum, session) => sum + (session.videoRiskCount || 0), 0)
    })).sort((a, b) => b.attending - a.attending || a.title.localeCompare(b.title));
  }, [sessions]);

  const selectedExam = exams.find((exam) => exam.id === selectedExamId) || exams.find((exam) => exam.attending > 0) || exams[0];
  const liveExamCount = exams.filter((exam) => exam.attending > 0).length;
  const attendingCount = sessions.filter((session) => isAttending(session.status)).length;
  const completedCount = sessions.filter((session) => isCompleted(session.status)).length;
  const flaggedCount = sessions.filter((session) => session.inactive || session.riskScore >= 4).length;

  const takeAction = async (sessionId, action) => {
    let remark = "";
    if (action === "WARN") { remark = prompt("Enter prompt message for the student:"); if (!remark) return; }
    if (action === "TERMINATE" && !window.confirm("Submit this student's current progress and terminate the exam?")) return;
    try {
      await Client.post(`/admin/actions/${sessionId}`, null, { params: { action, remark } });
      loadSessions();
    } catch (error) {
      alert(error.response?.data || "Coordinator action failed. Check the session status.");
    }
  };

  const riskClass = (score) => score >= 7 ? "risk-high" : score >= 4 ? "risk-mid" : "risk-low";
  const formatTime = (seconds = 0) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  if (loading) return <div className="admin-page"><div className="admin-container loading-card"><div className="hero-badge">Live session visibility</div><h3 className="loading-dots">Loading live exams</h3><div className="skeleton-card" /></div></div>;

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="page-header"><div><div className="hero-badge">Refreshes every 5 seconds</div><h2>Exam Control Room</h2><p className="admin-subtitle">Track each exam, attendance, completed attempts, risks, and student-level live status.</p></div></div>

        <section className="monitor-summary-grid">
          <div className="monitor-stat"><span>Live Exams</span><strong>{liveExamCount}</strong><small>with students currently attending</small></div>
          <div className="monitor-stat"><span>Students Attending</span><strong>{attendingCount}</strong><small>active or waiting sessions</small></div>
          <div className="monitor-stat"><span>Completed Attempts</span><strong>{completedCount}</strong><small>submitted or coordinator-terminated</small></div>
          <div className="monitor-stat danger"><span>Needs Attention</span><strong>{flaggedCount}</strong><small>inactive or elevated-risk students</small></div>
        </section>

        <section className="exam-overview-section">
          <div className="section-heading"><h3>Exam List</h3><span>{exams.length} exams with session history</span></div>
          {exams.length === 0 ? <div className="empty-state">No exam sessions have started yet.</div> : <div className="exam-monitor-grid">{exams.map((exam) => <button key={exam.id} className={`exam-monitor-card ${selectedExam?.id === exam.id ? "selected" : ""}`} onClick={() => setSelectedExamId(exam.id)}><span className="exam-card-title">{exam.title}</span><div><b>{exam.attending}</b><small> attending</small></div><div><b>{exam.completed}</b><small> completed</small></div><footer>{exam.inactive} inactive · {exam.videoRisk} video risk</footer></button>)}</div>}
        </section>

        {selectedExam && <section className="student-session-section">
          <div className="section-heading"><div><h3>{selectedExam.title}</h3><span>Student attempts and live controls</span></div><span className="exam-attendance-chip">{selectedExam.attending} attending / {selectedExam.completed} completed</span></div>
          <div className="table-shell"><table className="monitor-table"><thead><tr><th>Student</th><th>Session</th><th>Time Left</th><th>Current Score</th><th>Reconnects</th><th>Risk</th><th>Events</th><th>Actions</th></tr></thead><tbody>
            {selectedExam.sessions.map((session) => <tr key={session.sessionId}><td><strong>{session.studentName}</strong><small className="row-meta">ID: {session.studentId}</small></td><td><span className={`session-status ${session.status.toLowerCase()}`}>{session.status}</span><small className="row-meta">{session.inactive ? "Inactive" : "Last heartbeat active"}</small></td><td>{formatTime(session.remainingSeconds)}</td><td>{session.currentScore}</td><td>{session.disconnectCount} / 3</td><td><span className={riskClass(session.riskScore)}>{session.riskScore}</span><small className="row-meta">Video: {session.videoRiskCount || 0} · Flags: {session.malpracticeCount}</small></td><td><div className="event-pills">{Object.entries(session.events || {}).length ? Object.entries(session.events).map(([type, count]) => <span key={type}>{type.replaceAll("_", " ")}: {count}</span>) : <span>None</span>}</div></td><td>{isAttending(session.status) && <div className="action-stack"><button className="action-btn warn" title="Prompt student" onClick={() => takeAction(session.sessionId, "WARN")}>!</button>{session.status === "WAITING" ? <button className="action-btn resume" title="Resume student" onClick={() => takeAction(session.sessionId, "NORMAL")}>✓</button> : <button className="action-btn waiting" title="Move student to waiting" onClick={() => takeAction(session.sessionId, "WAITING")}>W</button>}<button className="action-btn terminate" title="Submit and terminate" onClick={() => takeAction(session.sessionId, "TERMINATE")}>X</button></div>}</td></tr>)}
          </tbody></table></div>
        </section>}
      </div>
    </div>
  );
}
