import { useEffect, useState } from "react";

import "../style/loading.scss";

const steps = [
  "Parsing Resume",
  "Extracting Skills",
  "Calculating ATS Match",
  "Generating Technical Questions",
  "Generating Behavioral Questions",
  "Optimizing Resume",
  "Building Preparation Roadmap",
];

export default function LoadingScreen() {
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 8;
      });
    }, 900);

    return () => clearInterval(timer);
  }, []);

  const currentStep = Math.floor(progress / 15);

  return (
    <main className="loading-page">
      <div className="loading-card">
        <div className="robot">🤖</div>

        <h1>QuickAI</h1>

        <p className="subtitle">
          Building your personalized interview report...
        </p>

        <div className="progress">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="progress-number">{Math.floor(progress)}%</div>

        <div className="steps">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`step ${
                index < currentStep
                  ? "done"
                  : index === currentStep
                    ? "active"
                    : ""
              }`}
            >
              {index < currentStep ? "✓" : index === currentStep ? "⏳" : "○"}

              <span>{step}</span>
            </div>
          ))}
        </div>

        <p className="footer">This usually takes 15–30 seconds</p>
      </div>
    </main>
  );
}
