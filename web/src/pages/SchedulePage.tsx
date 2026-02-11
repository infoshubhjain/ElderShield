import { useEffect, useMemo, useState } from "react";
import { appApi, AppMatch } from "../services/appApi";
import { TopBar } from "../components/navigation/TopBar";
import "./SchedulePage.css";

const SLOTS = [
  { label: "Morning", hour: 10 },
  { label: "Afternoon", hour: 14 },
  { label: "Evening", hour: 18 }
] as const;

export const SchedulePage = () => {
  const [matches, setMatches] = useState<AppMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    appApi
      .listMatches()
      .then(setMatches)
      .catch(() => setMatches([]))
      .finally(() => setIsLoading(false));
  }, []);

  const accepted = useMemo(
    () => matches.filter((m) => m.status === "ACCEPTED" || !m.status),
    [matches]
  );

  const handleSchedule = async (matchId: string, slotHour: number) => {
    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + 1);
    scheduled.setHours(slotHour, 0, 0, 0);

    await appApi.scheduleMatch(matchId, scheduled.toISOString());
    setMatches((prev) =>
      prev.map((match) =>
        match.id === matchId ? { ...match, scheduledFor: scheduled.toISOString() } : match
      )
    );
    setStatus("Schedule updated.");
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading" aria-label="Loading schedule"></div>
        <p>Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div className="schedule-page">
      <TopBar title="My schedule" backTo="/home" />

      {status && <div className="status-message success">{status}</div>}

      {accepted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p className="empty-state-text">No accepted matches yet to schedule.</p>
        </div>
      ) : (
        <div className="schedule-list">
          {accepted.map((match) => (
            <div key={match.id} className="schedule-item">
              <div className="schedule-item-header">
                <h2 className="schedule-activity-name">{match.activity.name}</h2>
              </div>
              <p className="schedule-date">With: {match.otherUser?.name || "Companion"}</p>
              <p className="schedule-time">
                {match.scheduledFor
                  ? `Scheduled: ${new Date(match.scheduledFor).toLocaleString()}`
                  : "Not scheduled yet"}
              </p>
              <div className="schedule-slot-actions">
                {SLOTS.map((slot) => (
                  <button key={slot.label} className="btn-secondary" onClick={() => handleSchedule(match.id, slot.hour)}>
                    Set {slot.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
