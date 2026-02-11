import { BackButton } from "./BackButton";
import { VoiceMicButton } from "../VoiceMicButton";
import "./TopBar.css";

interface TopBarProps {
  title: string;
  backTo?: string;
  showBack?: boolean;
}

export const TopBar = ({ title, backTo, showBack = true }: TopBarProps) => {
  return (
    <header className="top-bar" role="banner">
      <div className="top-bar-left">{showBack && <BackButton to={backTo} />}</div>
      <h1 className="top-bar-title">{title}</h1>
      <div className="top-bar-right">
        <VoiceMicButton />
      </div>
    </header>
  );
};
