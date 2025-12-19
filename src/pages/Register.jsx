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
      confirmPassword: "",
      role: "STUDENT"
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
        password: state.password,
        role: state.role
      });

      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h2>Create Account</h2>
        <p className="subtitle">Join ProctorX</p>

        {error && <p className="error">{error}</p>}

        <input name="name" placeholder="Full Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} />

        <select name="role" onChange={handleChange}>
          <option value="STUDENT">Student</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button className="btn" onClick={handleRegister} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <div className="switch">
          Already registered?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </div>
      </div>
    </div>
  );
}
