import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appApi, AppActivity } from "../services/appApi";
import { TopBar } from "../components/navigation/TopBar";
import "./ActivitySelectionPage.css";

export const ActivitySelectionPage = () => {
  const [activities, setActivities] = useState<AppActivity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    appApi
      .getActivities()
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setIsLoading(false));
  }, []);

  const visible = activities.filter((activity) =>
    `${activity.name} ${activity.category || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleContinue = () => {
    if (selectedId) navigate("/matches", { state: { activityId: selectedId } });
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading" aria-label="Loading activities"></div>
        <p>Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="activity-selection-page">
      <TopBar title="Choose an activity" backTo="/home" />
      <p className="page-subtitle">Select what you feel like doing today.</p>

      <label className="input-label" htmlFor="activity-search">Search activity</label>
      <input
        id="activity-search"
        className="input-field"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Type: walk, chat, music..."
      />

      <div className="activity-list">
        {visible.map((activity) => (
          <button
            key={activity.id}
            className={`card ${selectedId === activity.id ? "card-selected" : ""}`}
            onClick={() => setSelectedId(activity.id)}
            aria-pressed={selectedId === activity.id}
          >
            <span className="card-icon" aria-hidden="true">{activity.icon || "👥"}</span>
            <span className="card-content">
              {activity.name}
              {activity.category ? <small className="card-subtitle">{activity.category}</small> : null}
            </span>
          </button>
        ))}
      </div>

      <button className="btn-primary" onClick={handleContinue} disabled={!selectedId}>
        Continue
      </button>
    </div>
  );
};
