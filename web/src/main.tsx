import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { VoiceProvider } from "./voice/VoiceContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <VoiceProvider>
      <App />
    </VoiceProvider>
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .catch(() => {
        // no-op for local development
      });
  });
}
