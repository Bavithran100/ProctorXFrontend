import { useNavigate } from "react-router-dom";
import "../App.css";
import Navbar from "./Navbar";

export default function Landing() {
  const navigate = useNavigate();

  async function testJavaCode() {
    const code = `
import java.util.*;

public class Main{
 public static void main(String[] args){
  Scanner sc = new Scanner(System.in);
  int n = sc.nextInt();
  System.out.println(n*2);
 }
}
`;

    const res = await fetch(
      "https://judge029.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": "b0ef6114d0msh70ec7d7f6544e50p1bf18djsnb08c31664023",
          "X-RapidAPI-Host": "judge029.p.rapidapi.com"
        },
        body: JSON.stringify({
          language_id: 62,
          source_code: code,
          stdin: "5"
        })
      }
    );

    const data = await res.json();

    console.log("Output:", data.stdout);
  }

  return (
    <div className="page">
      <div className="hero-panel">
        <div className="hero-copy">
          <div className="hero-badge">Secure exam delivery with live proctoring intelligence</div>
          <h1>ProctorX</h1>
          <p className="subtitle">
            A focused online examination workspace for secure assessments, coordinator workflows,
            and monitored coding rounds.
          </p>

          <div className="feature-list" style={{ marginTop: "24px" }}>
            <div className="feature-item">
              <strong>Live Monitoring</strong>
              Track behavior, inactivity, and session integrity in real time.
            </div>
            <div className="feature-item">
              <strong>Coding + MCQ</strong>
              Deliver both standard tests and developer-style coding assessments.
            </div>
            <div className="feature-item">
              <strong>Timed Sessions</strong>
              Keep every attempt controlled with strict start, end, and submit states.
            </div>
            <div className="feature-item">
              <strong>Admin Controls</strong>
              Review users, approve access, and act on suspicious activity quickly.
            </div>
          </div>
        </div>

        <div className="card auth-card">
          <h2>Enter the Platform</h2>
          <p className="subtitle">Choose how you want to continue into ProctorX.</p>

          <div className="field-stack" style={{ marginTop: "24px" }}>
            <button className="btn full" onClick={() => navigate("/login")}>
              Login
            </button>

            <button
              className="btn secondary full"
              onClick={() => navigate("/register")}
            >
              Register
            </button>

            <button className="ghost-btn" onClick={testJavaCode}>
              Test CodeArena
            </button>
            <Navbar />
          </div>
        </div>
      </div>
    </div>
  );
}
