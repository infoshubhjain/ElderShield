import { useState } from "react";
import { TopBar } from "../components/navigation/TopBar";
import { appApi } from "../services/appApi";
import "./HelpPage.css";

export const HelpPage = () => {
  const [status, setStatus] = useState<string | null>(null);

  const runAction = async (kind: "EMERGENCY" | "SUPPORT" | "CAREGIVER", message: string) => {
    await appApi.helpCheckIn(kind);
    setStatus(message);
  };

  return (
    <div className="help-page">
      <TopBar title="Help and emergency" backTo="/home" />

      {status && <div className="status-message success">{status}</div>}

      <div className="help-buttons">
        <a className="btn-danger help-button-large" href="tel:911" onClick={() => runAction("EMERGENCY", "Emergency request logged. Calling 911...") }>
          <span className="help-button-icon" aria-hidden="true">🆘</span>
          <span className="help-button-text">Call emergency services (911)</span>
        </a>

        <a className="btn-primary help-button-large" href="tel:+18005551234" onClick={() => runAction("SUPPORT", "Support team notified.") }>
          <span className="help-button-icon" aria-hidden="true">📞</span>
          <span className="help-button-text">Call ElderShield support</span>
        </a>

        <button className="btn-secondary help-button-large" onClick={() => runAction("CAREGIVER", "Caregiver alert sent.")}>
          <span className="help-button-icon" aria-hidden="true">👨‍👩‍👧</span>
          <span className="help-button-text">Notify caregiver</span>
        </button>
      </div>

      <div className="help-info">
        <h2 className="help-info-title">Safety reminder</h2>
        <p className="help-info-text">If you are in immediate danger, call emergency services right away.</p>
        <p className="help-info-text">ElderShield support is for non-life-threatening help.</p>
      </div>
    </div>
  );
};
