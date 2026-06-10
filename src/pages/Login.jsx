import { useReducer, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../AuthSlice";
import { useNavigate, useLocation } from "react-router-dom";
import Client from "../Client";
import "../App.css";

export default function Login() {
  const [state, dispatchForm] = useReducer(
    (state, action) => ({ ...state, [action.name]: action.value }),
    { email: "", password: "" }
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  function handleChange(e) {
    dispatchForm({ name: e.target.name, value: e.target.value });
  }

  async function handleLogin() {
    setError("");

    try {
      setLoading(true);

      const res = await Client.post("/Login", state);

      dispatch(
        loginSuccess({
          user: res.data.email,
          role: res.data.role,
          approved: res.data.approved
        })
      );
      console.log(res.data.approved) + "normal";

      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  function loginWithGoogle() {
    window.location.href =
      "https://proctorxbackend-1.onrender.com/oauth2/authorization/google";
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("oauth") === "true") {
      checkSession();
    }
  }, []);

  async function checkSession() {
    try {
      setCheckingAuth(true);

      const res = await Client.get("/me");

      dispatch(
        loginSuccess({
          user: res.data.email,
          role: res.data.role,
          approved: res.data.approved
        })
      );
      console.log(res.data.approved + "google");

      navigate("/dashboard");
    } catch {
      setError("Google login failed");
    } finally {
      setCheckingAuth(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="page">
        <div className="card loading-card">
          <div className="hero-badge">Authentication in progress</div>
          <h2 className="loading-dots">Signing you in</h2>
          <p>Please wait while we verify your account.</p>
          <div className="skeleton-card" style={{ width: "100%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="auth-shell auth-layout">
        <div className="auth-side-panel">
          <div>
            <div className="hero-badge">Modern proctoring workspace</div>
            <h1 style={{ margin: 0, fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
              Secure access for every exam role
            </h1>
            <p className="subtitle">
              Sign in to manage exam operations, monitor sessions, or launch student assessments
              from one controlled environment.
            </p>
          </div>

          <div className="feature-list">
            <div className="feature-item">
              <strong>Session aware</strong>
              Restores authenticated access and role context automatically.
            </div>
            <div className="feature-item">
              <strong>Google onboarding</strong>
              Lets students enter with a familiar login flow.
            </div>
            <div className="feature-item">
              <strong>Timed exam routing</strong>
              Directs users into the correct dashboard and start screens.
            </div>
            <div className="feature-item">
              <strong>Live integrity signals</strong>
              Built around monitored activity and admin oversight.
            </div>
          </div>
        </div>

        <div className="card auth-card">
          <h2>Login</h2>
          <p className="subtitle">Welcome to ProctorX</p>

          {error && <p className="error">{error}</p>}

          <div className="field-group">
            <label>Admin / Coordinator</label>
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
          </div>

          <button
            className="btn full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <hr className="divider" />

          <div className="field-group">
            <label>Student Login</label>
            <button className="google-btn" onClick={loginWithGoogle}>
              <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="google"
                className="google-icon"
              />
              Sign in with Google
            </button>
          </div>

          <div className="switch">
            Coordinator Registration?{" "}
            <span onClick={() => navigate("/register")}>
              Create account
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
