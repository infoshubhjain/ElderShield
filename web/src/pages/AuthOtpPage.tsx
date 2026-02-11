import { useState, FormEvent, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { appApi } from "../services/appApi";
import { useAppStore } from "../state/store";
import { TopBar } from "../components/navigation/TopBar";
import "./AuthOtpPage.css";

export const AuthOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSession } = useAppStore();
  const phone = (location.state as { phone?: string })?.phone || "";
  const caregiverMode = (location.state as { caregiverMode?: boolean })?.caregiverMode || false;
  const name = (location.state as { name?: string })?.name || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!phone) {
      navigate("/auth/phone");
      return;
    }
    inputRef.current?.focus();
  }, [phone, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await appApi.verifyOtp(phone, otp, { name });
      setSession(
        {
          id: result.user.id,
          name: result.user.name,
          phoneNumber: result.user.phoneNumber,
          role: result.user.role
        },
        result.token
      );
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code did not work. Please try again.");
      setOtp("");
      inputRef.current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <TopBar title="Enter code" backTo="/auth/phone" showBack />

      <div className="auth-progress" aria-label="Step 2 of 2">
        <span className="auth-progress-step active">1</span>
        <span className="auth-progress-step active">2</span>
      </div>

      <h2 className="auth-subtitle">Enter verification code</h2>
      <p className="auth-subtitle">We sent a code to {phone}. Enter the 6 digits.</p>

      {caregiverMode && <div className="status-message">Caregiver mode enabled.</div>}
      {error && (
        <div className="status-message error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <label className="input-label" htmlFor="otp">Verification code</label>
        <input
          id="otp"
          ref={inputRef}
          type="text"
          className="input-field"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(value);
            setError(null);
          }}
          placeholder="Enter 6-digit code"
          maxLength={6}
          required
          inputMode="numeric"
          pattern="[0-9]{6}"
        />
        <p className="input-hint">Test code: <strong>123456</strong></p>

        <button type="submit" className="btn-primary" disabled={isLoading || otp.length !== 6}>
          {isLoading ? "Verifying..." : "Finish sign in"}
        </button>
      </form>
    </div>
  );
};
