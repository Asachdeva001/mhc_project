import { useEffect, useRef, useState } from "react";

export default function CameraPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState("");
  const [currentMood, setCurrentMood] = useState("...");

  useEffect(() => {
    let intervalId;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        const context = canvasRef.current.getContext("2d");

        // Send frames every 1 second
        intervalId = setInterval(() => {
          if (videoRef.current) {
            context.drawImage(videoRef.current, 0, 0, 224, 224);
            const frameBase64 = canvasRef.current.toDataURL("image/jpeg");

            fetch("http://localhost:3000/api/mood", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ frame: frameBase64 }),
            })
              .then(res => res.json())
              .then(data => setCurrentMood(data.mood))
              .catch(err => console.error(err));
          }
        }, 1000); // 1 frame per second
      } catch (err) {
        setError("❌ Camera access denied or unavailable.");
      }
    }

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Realtime Mood Detection</h1>
      {error && <p className="text-red-500">{error}</p>}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-2xl shadow-lg w-80 h-60 bg-black mb-4"
      />
      <p className="text-xl font-semibold mb-4">Current Mood: {currentMood}</p>
      <canvas ref={canvasRef} width={224} height={224} style={{ display: "none" }} />
    </div>
  );
}
