import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="card">
        <h1>ProctorX</h1>
        <p className="subtitle">Secure Online Examination Platform</p>

        <button className="btn" onClick={() => navigate("/login")}>
          Login
        </button>

        <button
          className="btn secondary"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>
    </div>
  );
}
