import { useReducer, useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../AuthSlice";
import { useNavigate } from "react-router-dom";
import Client from "../Client";
import "../App.css";

export default function Login() {
  const [state, dispatchForm] = useReducer(
    (state, action) => ({ ...state, [action.name]: action.value }),
    { email: "", password: "" }
  );

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleChange(e) {
    dispatchForm({ name: e.target.name, value: e.target.value });
  }

  async function handleLogin() {
    setError("");
    try {
      setLoading(true);
      const res = await Client.post("/Login", state);

      dispatch(loginSuccess({
        user: res.data.email,
        role: res.data.role
      }));

      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to ProctorX</p>

        {error && <p className="error">{error}</p>}

        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />

        <button className="btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="switch">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>Create one</span>
        </div>
      </div>
    </div>
  );
}
