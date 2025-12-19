import { useNavigate } from "react-router-dom";
import "../App.css";

export default function DashboardCards({ role }) {
  const navigate = useNavigate();

  return (
    <>
      {/* ===== Exams ===== */}
      <section className="section">
        <h3>📘 Exams</h3>
        <div className="section-grid">
          <div className="dashboard-card">
            <h4>📅 Today’s Exams</h4>
            <button onClick={() => navigate("/exams/today")}>
              View / Start
            </button>
          </div>

          <div className="dashboard-card">
            <h4>⏳ Upcoming Exams</h4>
            <button onClick={() => navigate("/exams/upcoming")}>
              View
            </button>
          </div>

          <div className="dashboard-card">
            <h4>❌ Missed Exams</h4>
            <button onClick={() => navigate("/exams/missed")}>
              View Missed
            </button>
          </div>
        </div>
      </section>

      {/* ===== Performance ===== */}
      <section className="section">
        <h3>📊 Performance</h3>
        <div className="section-grid">
          <div className="dashboard-card">
            <h4>📈 Results</h4>
            <button onClick={() => navigate("/results")}>
              View Results
            </button>
          </div>
        </div>
      </section>

      {/* ===== Information ===== */}
      <section className="section">
        <h3>📜 Information</h3>
        <div className="section-grid">
          <div className="dashboard-card">
            <h4>📜 Instructions</h4>
            <button onClick={() => navigate("/rules")}>
              Read Rules
            </button>
          </div>
        </div>
      </section>

      {/* ===== Admin ===== */}
      {role === "ADMIN" && (
        <section className="section admin-section">
          <h3>🛠 Admin Panel</h3>
          <div className="admin-grid">
            <button onClick={() => navigate("/admin/create-exam")}>
              ➕ Create Exam
            </button>

            <button onClick={() => navigate("/admin/monitor")}>
              👀 Monitor Live Exams
            </button>

            <button onClick={() => navigate("/admin/malpractice")}>
              🚫 Malpractice Logs
            </button>
          </div>
        </section>
      )}
    </>
  );
}
