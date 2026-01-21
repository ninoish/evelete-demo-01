import { useEffect, useState } from "react";

export default function SpeechRecognitionInput({
  onResponse,
}: {
  onResponse?: (transcript: string) => void;
}) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const handleStart = () => {
    setIsListening(true);
    recognition.start();
    console.log("Start");
  };
  const handleStop = () => {
    setIsListening(false);
    recognition.stop();
    console.log("Stop.");
  };

  const handleReset = () => {
    setIsListening(false);
    setTranscript("");
    recognition.abort();
    console.log("handleReset.");
  };

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SpeechRecognition();
    r.continuous = true;
    r.lang = "ja-JP";
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onresult = (event) => {
      console.log("onResult", event);

      const t = Object.keys(event.results)
        .map((key) => {
          return event.results[key][0].transcript;
        })
        .join(", ");
      setTranscript(t);
      if (onResponse) {
        onResponse(t);
      }
    };

    setRecognition(r);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p className="whitespace-nowrap">🎤 : {isListening ? "on" : "off"}</p>
      {isListening ? (
        <button
          className="p-2 rounded shadow bg-red-600 text-white"
          type="button"
          onClick={handleStop}
        >
          Voice Recording Stop
        </button>
      ) : (
        <button
          className="p-2 rounded shadow bg-green-600 text-white"
          type="button"
          onClick={handleStart}
        >
          Voice Recording Start
        </button>
      )}

      <button
        className="p-1 rounded shadow bg-slate-600 text-white"
        type="button"
        onClick={handleReset}
      >
        Reset
      </button>
    </div>
  );
}
