import { useCallback, useRef, useState } from "react";
import * as ort from "onnxruntime-web";
import { createFrameBuffer, parseYoloOutput, videoToTensor, YOLO_INPUT_SIZE } from "./yoloUtils";

export default function useYoloDetector() {
  const sessionRef = useRef(null);
  const frameBufferRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadModel = useCallback(async () => {
    if (sessionRef.current) return true;
    setLoading(true);
    setError("");
    try {
      ort.env.wasm.proxy = true;
      ort.env.wasm.numThreads = 1;
      sessionRef.current = await ort.InferenceSession.create("/models/yolov8n-320.onnx", {
        executionProviders: ["wasm"]
      });
      frameBufferRef.current = createFrameBuffer();
      return true;
    } catch (loadError) {
      console.error("YOLO model loading failed", loadError);
      setError("Could not load the local YOLOv8n model.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const detect = useCallback(async (video) => {
    if (!sessionRef.current || !video || video.readyState < 2) return [];
    const tensor = new ort.Tensor("float32", videoToTensor(video, frameBufferRef.current), [1, 3, YOLO_INPUT_SIZE, YOLO_INPUT_SIZE]);
    const inputName = sessionRef.current.inputNames[0];
    const results = await sessionRef.current.run({ [inputName]: tensor });
    return parseYoloOutput(results[sessionRef.current.outputNames[0]]);
  }, []);

  return { detect, error, loadModel, loading };
}
