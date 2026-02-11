import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VoiceOverlay } from "./VoiceOverlay";
import { useVoice } from "../voice/VoiceContext";
import "./VoiceMicButton.css";

interface VoiceMicButtonProps {
  standalone?: boolean;
}

export const VoiceMicButton = ({ standalone = false }: VoiceMicButtonProps) => {
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(false);
  const { listening, supported, lastTranscript, lastIntent, startListening, stopListening, clear } = useVoice();

  const canConfirm = useMemo(() => Boolean(lastTranscript), [lastTranscript]);

  const handleClick = () => {
    if (listening) {
      stopListening();
    } else {
      setShowOverlay(true);
      startListening();
    }
  };

  const executeIntent = () => {
    switch (lastIntent) {
      case "find_activity":
        navigate("/activities");
        break;
      case "send_message":
        navigate("/messages");
        break;
      case "order_items":
        navigate("/order");
        break;
      case "check_schedule":
        navigate("/schedule");
        break;
      case "open_profile":
        navigate("/profile");
        break;
      case "ask_help":
        navigate("/help");
        break;
      default:
        break;
    }
    clear();
    setShowOverlay(false);
  };

  const closeOverlay = () => {
    stopListening();
    clear();
    setShowOverlay(false);
  };

  return (
    <>
      <button
        className={`voice-mic-button ${standalone ? "standalone" : ""}`}
        onClick={handleClick}
        aria-label={listening ? "Stop listening" : "Start voice assistant"}
        aria-pressed={listening}
        type="button"
      >
        <span aria-hidden="true">{listening ? "⏹" : "🎤"}</span>
        <span className="sr-only">{listening ? "Stop listening" : "Start voice assistant"}</span>
      </button>

      {showOverlay && (
        <VoiceOverlay
          transcription={lastTranscript}
          unsupported={!supported}
          canConfirm={canConfirm}
          onClose={closeOverlay}
          onConfirm={executeIntent}
        />
      )}
    </>
  );
};
