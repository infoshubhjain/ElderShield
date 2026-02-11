import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appApi, AppMatch } from "../services/appApi";
import { TopBar } from "../components/navigation/TopBar";
import "./MessagesListPage.css";

export const MessagesListPage = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<AppMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    appApi
      .listMatches()
      .then(setMatches)
      .catch(() => setMatches([]))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="messages-list-page">
        <TopBar title="Messages" backTo="/home" />
        <div className="page-loading">
          <div className="loading" aria-label="Loading messages"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  const conversations = matches.filter((match) => match.status === "ACCEPTED" || !match.status);

  return (
    <div className="messages-list-page">
      <TopBar title="Messages" backTo="/home" />

      {conversations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <p className="empty-state-text">No conversations yet. Find a companion first.</p>
          <button className="btn-primary" onClick={() => navigate("/activities")}>Find a friend</button>
        </div>
      ) : (
        <div className="messages-list">
          {conversations.map((match) => (
            <button
              key={match.id}
              className="message-list-item"
              onClick={() => navigate(`/messages/${match.id}`)}
            >
              <div className="message-list-icon" aria-hidden="true">👤</div>
              <div className="message-list-content">
                <div className="message-list-name">{match.otherUser?.name || "Companion"}</div>
                <div className="message-list-activity">{match.activity.name}</div>
              </div>
              <div className="message-list-arrow" aria-hidden="true">
                {match.unreadCount ? `(${match.unreadCount})` : "→"}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
