import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Client from "../Client";
import useYoloDetector from "./useYoloDetector";
import { COCO_PERSON } from "./yoloUtils";
import "./proctoring.css";

export default function ExamSecurityGate() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [accepted, setAccepted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));
  const [personVerified, setPersonVerified] = useState(false);
  const [examType, setExamType] = useState(null);
  const [message, setMessage] = useState("Review the rules and begin the secure check.");
  const { detect, error: modelError, loadModel, loading } = useYoloDetector();

  useEffect(() => {
    Client.get(`/student/exams/${examId}/eligibility`)
      .then((response) => setExamType(response.data.examType))
      .catch((error) => {
        const state = error.response?.data;
        alert(state === "SESSION_WAITING"
          ? "You are in the waiting state. Contact your coordinator."
          : "This exam is not available for entry.");
        navigate("/dashboard");
      });

    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreen);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [examId, navigate]);

  async function beginSecurityCheck() {
    if (!accepted) {
      setMessage("Accept the rules before starting the secure check.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraReady(true);
      setMessage("Camera enabled. Enter fullscreen to continue.");
      await loadModel();
    } catch (cameraError) {
      console.error(cameraError);
      setMessage("Camera permission is required to enter this monitored exam.");
    }
  }

  async function enterFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
      setMessage("Fullscreen enabled. Verify that exactly one person is visible.");
    } catch {
      setMessage("Fullscreen was blocked by the browser. Allow fullscreen and try again.");
    }
  }

  async function verifyPerson() {
    try {
      const detections = await detect(videoRef.current);
      const people = detections.filter((item) => item.classId === COCO_PERSON).length;
      if (people === 1) {
        setPersonVerified(true);
        setMessage("Identity presence verified. You may enter the exam.");
      } else {
        setPersonVerified(false);
        setMessage(people === 0 ? "No person detected. Sit clearly in front of the camera." : "More than one person detected. Only one student may be visible.");
      }
    } catch (detectionError) {
      console.error(detectionError);
      setMessage("Camera frame could not be processed. Keep the camera visible and retry.");
    }
  }

  function enterExam() {
    if (!accepted || !cameraReady || !fullscreen || !personVerified || loading || modelError) return;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    navigate(examType === "CODING" ? `/exam/${examId}/start-coding` : `/exam/${examId}/start`);
  }

  return (
    <div className="exam-page">
      <div className="exam-container proctor-gate">
        <div className="page-header"><div><div className="hero-badge">Secure exam entry</div><h2>Camera & Fullscreen Check</h2><p>Complete all checks before your exam session starts.</p></div></div>
        <div className="field-panel"><h3>Exam rules</h3><ul className="proctor-rules"><li>Keep your camera on and remain in fullscreen.</li><li>Only one person may be visible.</li><li>Phone and multiple-person detections are logged for the coordinator.</li><li>Tab switching, copy/paste, refresh, and existing restrictions remain active.</li><li>Do not leave the exam for more than 10 minutes; only three reconnects are allowed.</li></ul><label className="proctor-consent"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /> I understand and accept these monitored exam rules.</label></div>
        <div className="proctor-camera-card"><video ref={videoRef} muted playsInline autoPlay className="proctor-camera" /><div className="proctor-status"><span className={cameraReady ? "status-good" : "status-pending"}>Camera: {cameraReady ? "ready" : "required"}</span><span className={fullscreen ? "status-good" : "status-pending"}>Fullscreen: {fullscreen ? "active" : "required"}</span><span className={personVerified ? "status-good" : "status-pending"}>One person: {personVerified ? "verified" : "required"}</span></div></div>
        <p className="helper-text">{modelError || (loading ? "Loading local YOLOv8n model..." : message)}</p>
        <div className="button-row"><button className="primary-btn" onClick={beginSecurityCheck}>Enable Camera & Model</button><button className="secondary-btn" onClick={enterFullscreen} disabled={!cameraReady}>Enter Fullscreen</button><button className="ghost-btn" onClick={verifyPerson} disabled={!cameraReady || !fullscreen || loading || Boolean(modelError)}>Verify One Person</button><button className="submit-btn" onClick={enterExam} disabled={!accepted || !cameraReady || !fullscreen || !personVerified || loading || Boolean(modelError)}>Enter Exam</button></div>
      </div>
    </div>
  );
}
