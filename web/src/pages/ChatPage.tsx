import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { appApi, AppMatch } from "../services/appApi";
import { useAppStore } from "../state/store";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import { TopBar } from "../components/navigation/TopBar";
import "./ChatPage.css";

interface Message {
  id: string;
  senderId: string;
  content: string | null;
  createdAt: string;
}

export const ChatPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, accessibility } = useAppStore();
  const { speak } = useTextToSpeech();
  const [match, setMatch] = useState<AppMatch | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      navigate("/messages");
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const [allMatches, loadedMessages] = await Promise.all([appApi.listMatches(), appApi.getMessages(id)]);
        if (cancelled) return;
        const found = allMatches.find((m) => m.id === id) || null;
        setMatch(found);
        setMessages(loadedMessages as Message[]);
      } catch {
        if (!cancelled) setError("Could not load conversation.");
      }
    };

    load();
    const timer = window.setInterval(load, 8000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [id, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const title = useMemo(() => match?.otherUser?.name || "Messages", [match?.otherUser?.name]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !messageText.trim() || sending) return;

    setSending(true);
    setError(null);
    try {
      const newMessage = await appApi.sendMessage(id, messageText.trim());
      setMessages((prev) => [...prev, newMessage as Message]);
      setMessageText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-page">
      <TopBar title={title} backTo="/messages" />

      <div className="chat-conversation">
        {match ? <p className="chat-activity">{match.activity.name}</p> : null}

        {error ? <div className="status-message error">{error}</div> : null}

        <div className="chat-messages-container">
          {messages.map((msg) => {
            const isSent = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`message-bubble ${isSent ? "sent" : "received"}`}>
                <p>{msg.content}</p>
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                {!isSent && accessibility.textToSpeech && msg.content ? (
                  <button className="read-aloud-button" onClick={() => speak(msg.content || "")}>Read</button>
                ) : null}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-form">
          <textarea
            className="textarea-field"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message"
            rows={3}
          />
          <div className="chat-actions">
            <button type="submit" className="btn-primary" disabled={!messageText.trim() || sending}>
              {sending ? "Sending..." : "Send"}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate("/help")}>Need help</button>
          </div>
        </form>
      </div>
    </div>
  );
};
