import { useEffect, useState } from "react";

export default function CountDownTimer({
  durationMinutes,
  onTimeUp
}) {
  const [secondsLeft, setSecondsLeft] = useState(
    durationMinutes * 60
  );

  useEffect(() => {
    setSecondsLeft(durationMinutes * 60);
  }, [durationMinutes]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      
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
