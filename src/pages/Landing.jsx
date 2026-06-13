import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "../App.css";
import Navbar from "./Navbar";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
};

const features = [
  ["01", "Live session oversight", "Track behavior, inactivity, and exam integrity signals in real time."],
  ["02", "Flexible assessments", "Deliver focused MCQ exams and practical coding rounds from one platform."],
  ["03", "Controlled workflows", "Keep scheduling, timed attempts, approvals, and submissions organized."],
  ["04", "Actionable audit trails", "Review malpractice events and admin interventions with clear context."]
];

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
    <div className="landing-page">
      <header className="landing-nav">
        <div className="brand-mark">
          <span className="brand-symbol">P</span>
          <span>ProctorX</span>
        </div>
        <div className="landing-nav-links">
          <a href="#platform">Platform</a>
          <a href="#trust">Trust</a>
          <button className="nav-login" onClick={() => navigate("/login")}>Log in</button>
          <button className="nav-cta" onClick={() => navigate("/register")}>Get started</button>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <Motion.div className="landing-hero-copy" {...fadeUp}>
            <div className="hero-badge"><span className="badge-dot" /> Built for high-integrity assessments</div>
            <h1>Exams run better when trust is built in.</h1>
            <p>
              ProctorX gives institutions one calm, secure workspace to create,
              deliver, monitor, and review online assessments.
            </p>
            <div className="hero-actions">
              <button className="btn" onClick={() => navigate("/login")}>Enter workspace <span>→</span></button>
              <button className="ghost-btn" onClick={() => navigate("/register")}>Create coordinator account</button>
            </div>
            <div className="hero-proof">
              <span><b>Real-time</b> oversight</span>
              <span><b>Role-based</b> controls</span>
              <span><b>One</b> focused platform</span>
            </div>
          </Motion.div>

          <Motion.div
            className="dashboard-preview"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="preview-topbar">
              <div className="preview-brand"><span className="brand-symbol small">P</span> ProctorX</div>
              <div className="preview-user">Coordinator workspace</div>
            </div>
            <div className="preview-layout">
              <aside className="preview-sidebar">
                <span className="active">Overview</span>
                <span>Exams</span>
                <span>Live monitor</span>
                <span>Reports</span>
              </aside>
              <div className="preview-main">
                <div className="preview-heading">
                  <div><small>Good morning</small><h3>Exam operations</h3></div>
                  <span className="live-chip"><i /> 12 live</span>
                </div>
                <div className="preview-stats">
                  <div><span>Active sessions</span><strong>128</strong><small>Across 6 exams</small></div>
                  <div><span>Integrity score</span><strong>98.4%</strong><small>Healthy sessions</small></div>
                  <div><span>Completed</span><strong>2,410</strong><small>This semester</small></div>
                </div>
                <div className="preview-table">
                  <div className="preview-row preview-labels"><span>Exam</span><span>Students</span><span>Status</span></div>
                  <div className="preview-row"><span>Data Structures</span><span>48 / 52</span><span className="status-ok">Live</span></div>
                  <div className="preview-row"><span>Java Fundamentals</span><span>36 / 36</span><span className="status-ok">Live</span></div>
                  <div className="preview-row"><span>Operating Systems</span><span>44 / 48</span><span className="status-warn">Review</span></div>
                </div>
              </div>
            </div>
          </Motion.div>
        </section>

        <section className="logo-strip" aria-label="Platform capabilities">
          <span>SECURE DELIVERY</span><span>LIVE MONITORING</span><span>CODING ASSESSMENTS</span><span>AUDIT READY</span>
        </section>

        <section id="platform" className="landing-section">
          <Motion.div className="section-intro" {...fadeUp}>
            <div className="eyebrow">Everything in one place</div>
            <h2>A focused operating system for modern exams.</h2>
            <p>From setup to submission, every role sees exactly what it needs without unnecessary complexity.</p>
          </Motion.div>
          <div className="landing-feature-grid">
            {features.map(([number, title, description], index) => (
              <Motion.article key={title} className="landing-feature-card" {...fadeUp} transition={{ ...fadeUp.transition, delay: index * 0.06 }}>
                <span className="feature-number">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className="feature-line" />
              </Motion.article>
            ))}
          </div>
        </section>

        <section id="trust" className="landing-section stats-section">
          <Motion.div className="stats-copy" {...fadeUp}>
            <div className="eyebrow">Designed for confidence</div>
            <h2>Clear signals. Fast decisions. Fairer outcomes.</h2>
            <p>ProctorX keeps exam teams informed while students stay focused on the assessment in front of them.</p>
          </Motion.div>
          <Motion.div className="landing-stats" {...fadeUp}>
            <div><strong>3</strong><span>purpose-built role workspaces</span></div>
            <div><strong>5s</strong><span>live monitoring refresh cycle</span></div>
            <div><strong>2</strong><span>assessment formats supported</span></div>
          </Motion.div>
        </section>

        <section className="landing-section testimonial-section">
          <Motion.blockquote {...fadeUp}>
            <span className="quote-mark">“</span>
            <p>ProctorX brings exam creation, live oversight, and integrity review into one composed workflow.</p>
            <footer><span className="testimonial-avatar">PX</span><div><strong>Built for examination teams</strong><small>Secure assessment operations</small></div></footer>
          </Motion.blockquote>
        </section>

        <section className="landing-section">
          <Motion.div className="landing-cta" {...fadeUp}>
            <div>
              <div className="eyebrow">Ready when you are</div>
              <h2>Bring clarity to every assessment.</h2>
              <p>Enter your workspace or request coordinator access to get started.</p>
            </div>
            <div className="hero-actions">
              <button className="btn" onClick={() => navigate("/login")}>Log in to ProctorX</button>
              <button className="ghost-btn" onClick={() => navigate("/register")}>Register</button>
              <button className="text-action" onClick={testJavaCode}>Test CodeArena</button>
            </div>
          </Motion.div>
        </section>
      </main>

      <div className="landing-account-bar">
        <Navbar />
      </div>

      <footer className="landing-footer">
        <div className="brand-mark"><span className="brand-symbol">P</span><span>ProctorX</span></div>
        <span>Secure online examination control</span>
      </footer>
    </div>
  );
}
