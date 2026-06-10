import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { loginSuccess } from "../AuthSlice";
import Client from "../Client";
import Navbar from "./Navbar";
import DashboardCards from "./DashboardCards";
import "../App.css";

export default function Dashboard() {
  const dispatch = useDispatch();

  const role = useSelector(state => state.auth.role);
  const approved = useSelector(state => state.auth.approved);
  const authChecked = useSelector(state => state.auth.authChecked);

  useEffect(() => {
    async function refreshAuth() {
      try {
        const res = await Client.get("/me");

        dispatch(loginSuccess({
          user: res.data.email,
          role: res.data.role,
          approved: res.data.approved
        }));
      } catch {
        console.log("Session expired");
      }
    }

    refreshAuth();
  }, [dispatch]);

  if (!authChecked) {
    return (
      <div className="page">
        <div className="card loading-card">
          <div className="hero-badge">Preparing your workspace</div>
          <h2 className="loading-dots">Loading dashboard</h2>
          <div className="skeleton-card" style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  if ((role === "COORDINATOR" || role === "STUDENT") && approved === false) {
    return (
      <div className="page">
        <div className="card">
          <div className="hero-badge">Access pending</div>
          <h2>Waiting for Admin Approval</h2>
          <p className="subtitle">
            Your coordinator account is under review.
            Please wait until admin approves your access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Navbar />
      <main className="dashboard-main">
        <div className="dashboard-shell">
          <div className="dashboard-hero">
            <div>
              <div className="hero-badge">Role based control center</div>
              <h2>Dashboard</h2>
              <p>
                Access exams, monitor sessions, and manage platform activity from a single
                streamlined workspace.
              </p>
            </div>
          </div>
          <DashboardCards role={role} />
        </div>
      </main>
    </div>
  );
}
