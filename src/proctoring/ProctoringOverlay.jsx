import { useEffect, useRef, useState } from "react";
import Client from "../Client";
import useYoloDetector from "./useYoloDetector";
import { COCO_CELL_PHONE, COCO_PERSON } from "./yoloUtils";
import "./proctoring.css";

export default function ProctoringOverlay({ examId }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const personCount = useRef(0);
  const phoneCount = useRef(0);
  const sent = useRef({ camera: false, fullscreen: false, multiple: false, phone: false });
  const [status, setStatus] = useState("Starting camera monitor...");
  const { detect, loadModel, loading, error } = useYoloDetector();

  useEffect(() => {
    let cancelled = false;
    let timer;
    const logEvent = (event, count = 1) => Client.post(`/student/exams/${examId}/malpractice`, null, { params: { event, count } }).catch(() => {});

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
        if (cancelled) return stream.getTracks().forEach((track) => track.stop());
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const ready = await loadModel();
        if (!ready || cancelled) return;
        setStatus("AI camera monitoring active");
        const processFrame = async () => {
          if (cancelled) return;
          try {
            const detections = await detect(videoRef.current);
            if (detections.filter((item) => item.classId === COCO_PERSON).length > 1) personCount.current += 1;
            if (detections.some((item) => item.classId === COCO_CELL_PHONE)) phoneCount.current += 1;
            if (personCount.current >= 50 && !sent.current.multiple) { sent.current.multiple = true; logEvent("MULTIPLE_PERSON", personCount.current); setStatus("Multiple-person risk logged"); }
            if (phoneCount.current >= 70 && !sent.current.phone) { sent.current.phone = true; logEvent("MOBILE_PHONE", phoneCount.current); setStatus("Mobile-phone risk logged"); }
          } catch { setStatus("AI frame processing is retrying..."); }
          if (!cancelled) timer = setTimeout(processFrame, 2000);
        };
        processFrame();
      } catch {
        if (!sent.current.camera) { sent.current.camera = true; logEvent("CAMERA_UNAVAILABLE"); }
        setStatus("Camera unavailable — contact the coordinator.");
      }
    }

    const fullscreenChange = () => {
      if (!document.fullscreenElement && !sent.current.fullscreen) { sent.current.fullscreen = true; logEvent("FULLSCREEN_EXIT"); setStatus("Fullscreen exited — return to fullscreen."); }
    };
    document.addEventListener("fullscreenchange", fullscreenChange);
    start();
    return () => { cancelled = true; clearTimeout(timer); document.removeEventListener("fullscreenchange", fullscreenChange); streamRef.current?.getTracks().forEach((track) => track.stop()); };
  }, [detect, examId, loadModel]);

  return <aside className="proctor-overlay"><video ref={videoRef} muted playsInline autoPlay /><span>{error || (loading ? "Loading YOLO..." : status)}</span></aside>;
}
