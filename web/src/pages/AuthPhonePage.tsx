import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { appApi } from "../services/appApi";
import "./AuthPhonePage.css";

export const AuthPhonePage = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caregiverMode, setCaregiverMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await appApi.requestOtp(phone);
      navigate("/auth/otp", { state: { phone, caregiverMode, name } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-progress" aria-label="Step 1 of 2">
        <span className="auth-progress-step active">1</span>
        <span className="auth-progress-step">2</span>
      </div>

      <h1 className="auth-title">Welcome to ElderShield</h1>
      <p className="auth-subtitle">Comprehensive elderly care and social connection.</p>

      {error && (
        <div className="status-message error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="input-label" htmlFor="name">Your name (optional)</label>
        <input
          id="name"
          className="input-field"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="How should we address you?"
        />

        <label className="input-label" htmlFor="phone">Your phone number</label>
        <input
          id="phone"
          type="tel"
          className="input-field"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter your phone number"
          required
          autoFocus
          aria-required="true"
        />

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={caregiverMode}
            onChange={(e) => setCaregiverMode(e.target.checked)}
            className="checkbox-input"
          />
          <span>I am setting this up with help from a caregiver</span>
        </label>

        <button type="submit" className="btn-primary" disabled={isLoading || !phone.trim()}>
          {isLoading ? "Sending code..." : "Continue"}
        </button>
      </form>
    </div>
  );
};
