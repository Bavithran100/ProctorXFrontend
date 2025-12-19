import { useState } from "react";
import "../AdminMonitoring.css";

/* ✅ Declare component OUTSIDE render */
function TabButton({ id, label, activeTab, onChange }) {
  return (
    <button
      className={`info-tab ${activeTab === id ? "active-tab" : ""}`}
      onClick={() => onChange(id)}
    >
      {label}
    </button>
  );
}

export default function ExamInformation() {
  const [tab, setTab] = useState("OVERVIEW");

  return (
    <div className="admin-page">
      <div className="admin-container">

        <h2>📘 ProctorX – Exam Information</h2>
        <p className="admin-subtitle">Secure • Monitored • Fair</p>

        {/* 🔹 TAB NAVBAR */}
        <div className="info-tab-bar">
          <TabButton id="OVERVIEW" label="📘 Overview" activeTab={tab} onChange={setTab} />
          <TabButton id="WORKFLOW" label="🔁 Workflow" activeTab={tab} onChange={setTab} />
          <TabButton id="RULES" label="🚨 Rules" activeTab={tab} onChange={setTab} />
          <TabButton id="MALPRACTICE" label="⚠️ Malpractice" activeTab={tab} onChange={setTab} />
          <TabButton id="SECURITY" label="🔐 Security" activeTab={tab} onChange={setTab} />
          <TabButton id="NOTES" label="📝 Notes" activeTab={tab} onChange={setTab} />
        </div>

        <hr />

        {/* CONTENT */}
        {tab === "OVERVIEW" && (
          <section>
            <h3>What is ProctorX?</h3>
            <p>
              <b>ProctorX</b> is a secure online examination platform designed to
              conduct fair, monitored, and tamper-resistant exams.
            </p>
          </section>
        )}

        {tab === "WORKFLOW" && (
          <section>
            <h3>Exam Workflow</h3>
            <ul>
              <li>Secure login</li>
              <li>Timed availability</li>
              <li>Strict one-session rule</li>
              <li>Live monitoring</li>
              <li>Admin intervention</li>
              <li>One-time submission</li>
            </ul>
          </section>
        )}

        {tab === "RULES" && (
          <section>
            <h3>Exam Rules</h3>
            <ul>
              <li>No tab switching</li>
              <li>No refresh</li>
              <li>No copy/paste</li>
              <li>No dev tools</li>
            </ul>
          </section>
        )}

        {tab === "MALPRACTICE" && (
          <section>
            <h3>Malpractice Monitoring</h3>
            <ul>
              <li>Tab switch detection</li>
              <li>Window blur detection</li>
              <li>Copy / paste tracking</li>
              <li>Inactivity monitoring</li>
            </ul>
          </section>
        )}

        {tab === "SECURITY" && (
          <section>
            <h3>Security & Fairness</h3>
            <ul>
              <li>Session-based authentication</li>
              <li>Server-side scoring</li>
              <li>Audit logs</li>
            </ul>
          </section>
        )}

        {tab === "NOTES" && (
          <section>
            <h3>Important Notes</h3>
            <ul>
              <li>Stable internet required</li>
              <li>Do not refresh</li>
              <li>Follow instructions carefully</li>
            </ul>
          </section>
        )}

      </div>
    </div>
  );
}
