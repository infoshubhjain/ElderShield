import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { appApi, AppMatch } from "../services/appApi";
import { TopBar } from "../components/navigation/TopBar";
import "./MatchResultsPage.css";

export const MatchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activityId = (location.state as { activityId?: string })?.activityId;

  const [matches, setMatches] = useState<AppMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!activityId) {
      navigate("/activities");
      return;
    }

    appApi
      .findMatches(activityId)
      .then((result) => {
        if (Array.isArray(result)) {
          setMatches(result);
          setStatusMessage(null);
        } else {
          setMatches([]);
          setStatusMessage(result.message || "Searching for people nearby...");
        }
      })
      .catch(() => setStatusMessage("Could not search right now. Please try again."))
      .finally(() => setIsLoading(false));
  }, [activityId, navigate]);

  const handleDecision = async (matchId: string, decision: "ACCEPTED" | "REJECTED") => {
    await appApi.respondMatch(matchId, decision);
    if (decision === "ACCEPTED") navigate("/messages");
    else setMatches((prev) => prev.filter((m) => m.id !== matchId));
  };

  if (isLoading) {
    return (
      <div className="match-results-page">
        <TopBar title="Finding friends" backTo="/activities" />
        <div className="page-loading">
          <div className="loading" aria-label="Finding matches"></div>
          <p>Finding friends nearby...</p>
        </div>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="match-results-page">
        <TopBar title="Match status" backTo="/activities" />
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-text">{statusMessage || "No matches yet."}</p>
          <button className="btn-primary" onClick={() => navigate("/activities")}>Try another activity</button>
        </div>
      </div>
    );
  }

  return (
    <div className="match-results-page">
      <TopBar title="Potential companions" backTo="/activities" />
      <p className="page-subtitle">Confirm to start chatting safely.</p>

      <div className="match-list">
        {matches.map((match) => (
          <div key={match.id} className="match-card">
            <div className="match-info">
              <h2 className="match-name">{match.otherUser?.name || "Companion"}</h2>
              <p className="match-details">Activity: {match.activity.name}</p>
              <p className="match-details">Status: {match.status || "PENDING"}</p>
            </div>
            <div className="match-actions">
              <button className="btn-primary" onClick={() => handleDecision(match.id, "ACCEPTED")}>Connect</button>
              <button className="btn-secondary" onClick={() => handleDecision(match.id, "REJECTED")}>Skip</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
