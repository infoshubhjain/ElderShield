import React, { createContext, useContext, useMemo, useRef, useState } from "react";

export type VoiceIntent =
  | "find_activity"
  | "send_message"
  | "order_items"
  | "check_schedule"
  | "open_profile"
  | "ask_help"
  | "unknown";

interface VoiceContextValue {
  listening: boolean;
  supported: boolean;
  lastTranscript: string;
  lastIntent: VoiceIntent;
  startListening: () => void;
  stopListening: () => void;
  clear: () => void;
}

const VoiceContext = createContext<VoiceContextValue | undefined>(undefined);

interface Props {
  children: React.ReactNode;
}

type SpeechRecognitionType = typeof window.SpeechRecognition extends undefined
  ? any
  : SpeechRecognition;

function detectIntent(text: string): VoiceIntent {
  const value = text.toLowerCase();
  if (value.includes("activity") || value.includes("friend") || value.includes("match")) return "find_activity";
  if (value.includes("message") || value.includes("chat")) return "send_message";
  if (value.includes("order") || value.includes("grocery") || value.includes("medicine")) return "order_items";
  if (value.includes("schedule") || value.includes("calendar")) return "check_schedule";
  if (value.includes("profile") || value.includes("setting")) return "open_profile";
  if (value.includes("help") || value.includes("emergency") || value.includes("support")) return "ask_help";
  return "unknown";
}

export const VoiceProvider = ({ children }: Props) => {
  const [listening, setListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastIntent, setLastIntent] = useState<VoiceIntent>("unknown");
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  const supported = useMemo(
    () => typeof window !== "undefined" && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    []
  );

  const stopListening = () => {
    recognitionRef.current?.stop?.();
    setListening(false);
  };

  const startListening = () => {
    if (!supported) {
      setListening(true);
      return;
    }

    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setLastTranscript(transcript);
      setLastIntent(detectIntent(transcript));
    };
    recognition.onerror = () => {
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const clear = () => {
    setLastTranscript("");
    setLastIntent("unknown");
    setListening(false);
  };

  return (
    <VoiceContext.Provider
      value={{
        listening,
        supported,
        lastTranscript,
        lastIntent,
        startListening,
        stopListening,
        clear
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within VoiceProvider");
  return ctx;
};
