import { useEffect, useRef, useState } from "react";

export default function CountDownTimer({
  durationMinutes,
  onTimeUp
}) {
  const timeUpHandled = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState(
    durationMinutes * 60
  );

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (!timeUpHandled.current) {
        timeUpHandled.current = true;
        onTimeUp();
      }
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="timer">
      ⏱ Time Left:{" "}
      <b>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </b>
    </div>
  );
}
