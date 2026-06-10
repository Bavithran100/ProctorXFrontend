import { useNavigate } from "react-router-dom";
import "../App.css";

export default function DashboardCards({ role }) {
  const navigate = useNavigate();

  const studentCards = [
    {
      title: "Today's Exams",
      description: "Open active exams, verify availability windows, and launch attempts.",
      action: "View / Start",
      path: "/exams/today",
      icon: "TX"
    },
    {
      title: "Upcoming Exams",
      description: "Review the next scheduled assessments and planned exam timings.",
      action: "View",
      path: "/exams/upcoming",
      icon: "UP"
    },
    {
      title: "Missed Exams",
      description: "Check assessments that are no longer available to attempt.",
      action: "View Missed",
      path: "/exams/missed",
      icon: "MS"
    }
  ];

  const performanceCards = [
    {
      title: "Results",
      description: "Track completed exams, scores, and overall performance status.",
      action: "View Results",
      path: "/results",
      icon: "RS"
    }
  ];

  const infoCards = [
    {
      title: "Instructions",
      description: "Review platform rules, workflow, and exam-day guidelines.",
      action: "Read Rules",
      path: "/rules",
      icon: "IN"
    }
  ];

  const adminActions = role === "COORDINATOR"
    ? [
        { label: "Create Exam", path: "/admin/create-exam" },
        { label: "Monitor Live Exams", path: "/admin/monitor" },
        { label: "Malpractice Logs", path: "/admin/malpractice" }
      ]
    : [
        { label: "Manage Users", path: "/admin/users" },
        { label: "Approve Coordinators", path: "/admin/approve" },
        { label: "All Exams", path: "/admin/exams" }
      ];

  return (
    <>
      {role === "STUDENT" && (
        <>
          <div className="summary-grid">
            <div className="summary-card">
              <span>Exam Hub</span>
              <strong>Ready</strong>
              Open active assessments and keep track of availability windows.
            </div>
            <div className="summary-card">
              <span>Performance</span>
              <strong>Tracked</strong>
              Review outcome history and submission status from one place.
            </div>
            <div className="summary-card">
              <span>Rules</span>
              <strong>Visible</strong>
              Keep guidelines close before your next monitored attempt.
            </div>
          </div>

          <section className="section">
            <div className="section-header">
              <h3>Exams</h3>
              <p className="section-subtitle">Access the assessments relevant to your current schedule.</p>
            </div>
            <div className="section-grid">
              {studentCards.map((card) => (
                <div key={card.title} className="dashboard-card">
                  <div className="card-icon">{card.icon}</div>
                  <div>
                    <h4>{card.title}</h4>
                    <p>{card.description}</p>
                  </div>
                  <div className="card-footer">
                    <button onClick={() => navigate(card.path)}>
                      {card.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <h3>Performance</h3>
              <p className="section-subtitle">Return to your result history and recent scoring outcomes.</p>
            </div>
            <div className="section-grid">
              {performanceCards.map((card) => (
                <div key={card.title} className="dashboard-card">
                  <div className="card-icon">{card.icon}</div>
                  <div>
                    <h4>{card.title}</h4>
                    <p>{card.description}</p>
                  </div>
                  <div className="card-footer">
                    <button onClick={() => navigate(card.path)}>
                      {card.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="section-header">
              <h3>Information</h3>
              <p className="section-subtitle">Review the expectations before entering a monitored session.</p>
            </div>
            <div className="section-grid">
              {infoCards.map((card) => (
                <div key={card.title} className="dashboard-card">
                  <div className="card-icon">{card.icon}</div>
                  <div>
                    <h4>{card.title}</h4>
                    <p>{card.description}</p>
                  </div>
                  <div className="card-footer">
                    <button onClick={() => navigate(card.path)}>
                      {card.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {role === "COORDINATOR" && (
        <section className="section admin-section">
          <div className="section-header">
            <h3>Coordinator Panel</h3>
            <p className="section-subtitle">Build exams and supervise live student sessions.</p>
          </div>

          <div className="admin-grid">
            {adminActions.map((action) => (
              <button key={action.label} onClick={() => navigate(action.path)}>
                {action.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {role === "ADMIN" && (
        <section className="section admin-section">
          <div className="section-header">
            <h3>Admin Panel</h3>
            <p className="section-subtitle">Manage approvals, users, and platform-wide oversight.</p>
          </div>

          <div className="admin-grid">
            {adminActions.map((action) => (
              <button key={action.label} onClick={() => navigate(action.path)}>
                {action.label}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
