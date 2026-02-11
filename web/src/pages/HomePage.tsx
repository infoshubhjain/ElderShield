import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../state/store";
import "./HomePage.css";

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAppStore();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="home-page">
      <h1 className="home-greeting">
        {greeting}{user?.name ? `, ${user.name}` : ""}
      </h1>
      <p className="home-subtitle">Choose one action. We keep each step simple.</p>

      <div className="home-highlight" role="status" aria-live="polite">
        <p className="home-highlight-title">Today&apos;s quick tip</p>
        <p className="home-highlight-text">Use the microphone to say: "Open messages" or "Order groceries".</p>
      </div>

      <div className="home-buttons">
        <button className="home-button" onClick={() => navigate("/activities")}>
          <span className="home-button-icon" aria-hidden="true">👥</span>
          <span className="home-button-text">Find an activity or friend</span>
        </button>

        <button className="home-button" onClick={() => navigate("/messages")}>
          <span className="home-button-icon" aria-hidden="true">💬</span>
          <span className="home-button-text">Messages</span>
        </button>

        <button className="home-button" onClick={() => navigate("/order")}>
          <span className="home-button-icon" aria-hidden="true">🛒</span>
          <span className="home-button-text">Order essentials</span>
        </button>

        <button className="home-button" onClick={() => navigate("/schedule")}>
          <span className="home-button-icon" aria-hidden="true">📅</span>
          <span className="home-button-text">My schedule</span>
        </button>

        <button className="home-button" onClick={() => navigate("/profile")}>
          <span className="home-button-icon" aria-hidden="true">⚙️</span>
          <span className="home-button-text">Profile and settings</span>
        </button>

        <button className="home-button home-button-danger" onClick={() => navigate("/help")}>
          <span className="home-button-icon" aria-hidden="true">🆘</span>
          <span className="home-button-text">Help or emergency</span>
        </button>
      </div>
    </div>
  );
};
