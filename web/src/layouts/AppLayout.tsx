/**
 * Root layout component
 * Shows app name and accessibility controls on home screen
 * Shows TopBar on all other screens
 * Includes persistent microphone button on home screen
 */

import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAppStore } from "../state/store";
import { VoiceMicButton } from "../components/VoiceMicButton";
import { AccessibilityControls } from "../components/AccessibilityControls";
import "../styles/global.css";
import "../styles/components.css";
import "./AppLayout.css";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { accessibility } = useAppStore();
  const location = useLocation();
  const isHomeScreen = location.pathname === "/home";

  return (
    <div
      className="app-layout"
      data-font-size={accessibility.fontSize}
      data-high-contrast={accessibility.highContrast}
    >
      {isHomeScreen ? (
        <header className="app-header" role="banner">
          <h1 className="app-title">ElderShield</h1>
          <AccessibilityControls />
        </header>
      ) : null}

      <main className="app-main" role="main" aria-live="polite">
        {children}
      </main>

      {isHomeScreen && <VoiceMicButton standalone />}
    </div>
  );
};
