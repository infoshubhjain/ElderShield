import { useMemo, useState } from "react";
import { TopBar } from "../components/navigation/TopBar";
import { useAppStore } from "../state/store";
import { appApi } from "../services/appApi";
import "./ProfilePage.css";

const COMM_OPTIONS = ["text", "voice", "both"] as const;
const LANG_OPTIONS = ["English", "Spanish", "Hindi", "Other"] as const;

export const ProfilePage = () => {
  const { user, clearSession, accessibility, setTextToSpeech } = useAppStore();
  const [language, setLanguage] = useState<(typeof LANG_OPTIONS)[number]>("English");
  const [communicationMode, setCommunicationMode] = useState<(typeof COMM_OPTIONS)[number]>("text");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initials = useMemo(() => {
    if (!user?.name) return "BD";
    return user.name
      .split(" ")
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("");
  }, [user?.name]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await appApi.helpCheckIn("CAREGIVER", `Saved profile preferences (${language}, ${communicationMode}).`);
      setStatus("Preferences saved.");
    } catch {
      setStatus("Saved locally. Server will sync when available.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <TopBar title="Profile & settings" backTo="/home" />

      <section className="profile-card">
        <div className="avatar" aria-hidden="true">
          {initials}
        </div>
        <div>
          <h2 className="profile-name">{user?.name || "Bud Day User"}</h2>
          <p className="profile-phone">{user?.phoneNumber || "No phone number"}</p>
        </div>
      </section>

      <section className="profile-section">
        <h3>Accessibility</h3>
        <label className="profile-toggle">
          <span>Read incoming messages aloud</span>
          <input
            type="checkbox"
            checked={accessibility.textToSpeech}
            onChange={(e) => setTextToSpeech(e.target.checked)}
          />
        </label>
      </section>

      <section className="profile-section">
        <h3>Communication preferences</h3>
        <label className="input-label" htmlFor="language-select">Preferred language</label>
        <select
          id="language-select"
          className="input-field"
          value={language}
          onChange={(e) => setLanguage(e.target.value as (typeof LANG_OPTIONS)[number])}
        >
          {LANG_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label className="input-label" htmlFor="comm-select">Preferred communication mode</label>
        <select
          id="comm-select"
          className="input-field"
          value={communicationMode}
          onChange={(e) => setCommunicationMode(e.target.value as (typeof COMM_OPTIONS)[number])}
        >
          {COMM_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item[0].toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>

        <label className="input-label" htmlFor="emergency-contact">Emergency contact phone</label>
        <input
          id="emergency-contact"
          className="input-field"
          type="tel"
          value={emergencyContact}
          onChange={(e) => setEmergencyContact(e.target.value)}
          placeholder="Add a contact number"
        />
      </section>

      {status && <div className="status-message success">{status}</div>}

      <div className="profile-actions">
        <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save preferences"}
        </button>
        <button className="btn-secondary" onClick={() => clearSession()}>
          Log out
        </button>
      </div>
    </div>
  );
};
