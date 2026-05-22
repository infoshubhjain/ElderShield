import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LargeButton } from "../components/LargeButton";
import { api } from "../api/client";
import { useAuth } from "../state/AuthContext";

export const Onboarding = () => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
   const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const handlePhoneSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    api
      .requestOtp(phone)
      .then(() => setStep("otp"))
      .catch(() => setError("Could not send code. Please check your number."));
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    api
      .verifyOtp(phone, otp)
      .then((res) => {
        setSession(res.token, res.user);
        navigate("/home");
      })
      .catch(() => setError("Code did not work. Please try again."));
  };

  return (
    <div className="screen" aria-label="Welcome">
      {step === "phone" && (
        <form onSubmit={handlePhoneSubmit} className="form">
          <h1 className="screen-title">Welcome to ElderShield</h1>
          <p className="helper-text" style={{ marginTop: "-1rem" }}>
            Comprehensive elderly care and social connection
          </p>
          {error && <div className="error-text" role="alert">{error}</div>}
          <label className="field-label">
            Your phone number
            <input
              className="field-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </label>
          <LargeButton type="submit" icon="→">
            Continue
          </LargeButton>
        </form>
      )}
      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} className="form">
          <h1 className="screen-title">Enter code</h1>
          <p className="helper-text">We sent a code to your phone. Please enter it below.</p>
          {error && <div className="error-text" role="alert">{error}</div>}
          <label className="field-label">
            Verification code
            <input
              className="field-input"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
            />
          </label>
          <LargeButton type="submit" icon="✓">
            Finish
          </LargeButton>
        </form>
      )}
    </div>
  );
};


