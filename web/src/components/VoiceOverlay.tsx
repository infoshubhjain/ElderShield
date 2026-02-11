import "./VoiceOverlay.css";

interface VoiceOverlayProps {
  transcription: string;
  unsupported?: boolean;
  canConfirm: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const VoiceOverlay = ({
  transcription,
  unsupported = false,
  canConfirm,
  onClose,
  onConfirm
}: VoiceOverlayProps) => {
  return (
    <div className="voice-overlay" role="dialog" aria-label="Voice assistant">
      <div className="voice-overlay-content">
        <div className="voice-overlay-icon" aria-hidden="true">
          🎤
        </div>
        <p className="voice-listening-text">{unsupported ? "Voice not supported" : "Listening..."}</p>

        {unsupported ? (
          <div className="voice-transcription">
            <p className="voice-transcription-label">Try saying commands later in a supported browser.</p>
            <p className="voice-transcription-text">You can also use the large buttons on the home screen.</p>
          </div>
        ) : transcription ? (
          <div className="voice-transcription">
            <p className="voice-transcription-label">You said:</p>
            <p className="voice-transcription-text">{transcription}</p>
          </div>
        ) : (
          <div className="voice-transcription">
            <p className="voice-transcription-label">Try saying</p>
            <p className="voice-transcription-text">"Open messages" or "Order groceries"</p>
          </div>
        )}

        <div className="voice-overlay-actions">
          <button className="btn-secondary" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="btn-primary" onClick={onConfirm} type="button" disabled={!canConfirm || unsupported}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
