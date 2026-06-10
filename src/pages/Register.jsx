import { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import Client from "../Client";
import "../App.css";

export default function Register() {
  const [state, dispatchForm] = useReducer(
    (state, action) => ({ ...state, [action.name]: action.value }),
    {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleChange(e) {
    dispatchForm({ name: e.target.name, value: e.target.value });
  }

  async function handleRegister() {
    setError("");

    if (state.password.length < 6)
      return setError("Password must be at least 6 characters");

    if (state.password !== state.confirmPassword)
      return setError("Passwords do not match");

    try {
      setLoading(true);

      await Client.post("/Register", {
        name: state.name,
        email: state.email,
        password: state.password
      });

      navigate("/login");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="auth-shell auth-layout">
        <div className="auth-side-panel">
          <div>
            <div className="hero-badge">Coordinator onboarding</div>
            <h1 style={{ margin: 0, fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
              Request controlled platform access
            </h1>
            <p className="subtitle">
              Create a coordinator account for exam setup, approval workflows, and real-time
              operational monitoring.
            </p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <strong>Approval flow</strong>
              Every coordinator signup moves through an admin review step.
            </div>
            <div className="feature-item">
              <strong>Secure management</strong>
              Build exams, publish questions, and supervise sessions.
            </div>
            <div className="feature-item">
              <strong>Role-aware access</strong>
              The same platform adapts to admins, coordinators, and students.
            </div>
            <div className="feature-item">
              <strong>Unified workspace</strong>
              Keep creation, monitoring, and reporting in one dashboard.
            </div>
          </div>
        </div>

        <div className="card auth-card">
          <h2>Coordinator Registration</h2>
          <p className="subtitle">
            Request access to ProctorX
          </p>

          {error && <p className="error">{error}</p>}

          <div className="field-stack">
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
            />

            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              onChange={handleChange}
            />
          </div>

          <button
            className="btn full"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <div className="switch">
            Already registered?{" "}
            <span onClick={() => navigate("/login")}>
              Login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
