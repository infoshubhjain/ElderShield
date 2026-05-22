import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import '../styles/components/SOS.css';

interface SOSProps {
  onSOS?: (message: string) => void;
}

export const SOSButton: React.FC<SOSProps> = ({ onSOS }) => {
  const [isActive, setIsActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSOSPress = () => {
    setShowConfirm(true);
  };

  const confirmSOS = () => {
    onSOS?.('Emergency SOS activated');
    setIsActive(true);
    setShowConfirm(false);
    setTimeout(() => setIsActive(false), 5000);
  };

  if (isActive) {
    return (
      <div className="sos-activated">
        <AlertTriangle className="sos-icon" />
        <p>Emergency services have been notified</p>
        <p className="sos-small">Your location has been shared with trusted contacts</p>
      </div>
    );
  }

  return (
    <>
      <button
        className="sos-button"
        onClick={handleSOSPress}
        aria-label="Emergency SOS button"
      >
        <AlertTriangle size={40} />
        <span>SOS</span>
      </button>

      {showConfirm && (
        <div className="sos-confirmation">
          <div className="sos-modal">
            <button
              className="sos-close"
              onClick={() => setShowConfirm(false)}
              aria-label="Cancel SOS"
            >
              <X size={28} />
            </button>
            <AlertTriangle className="sos-modal-icon" size={64} />
            <h2>Emergency Alert</h2>
            <p>Press confirm to activate emergency services</p>
            <p className="sos-warning">Your location will be shared with emergency contacts</p>
            <button
              className="btn-danger sos-confirm-btn"
              onClick={confirmSOS}
            >
              Confirm SOS
            </button>
          </div>
        </div>
      )}
    </>
  );
};
