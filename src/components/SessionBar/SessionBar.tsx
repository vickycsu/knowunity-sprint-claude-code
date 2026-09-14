import { IconSlot } from "../IconSlot/IconSlot";
import { ProgressIndicator, type ProgressIndicatorProgress } from "../ProgressIndicator/ProgressIndicator";
import { Chips } from "../Chips/Chips";
import "./session-bar.css";

const CloseIcon = (
  <svg width="100%" height="100%" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path
      d="M4 4l10 10M14 4L4 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const XPIcon = (
  <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2l2 4 4 .5-3 3 .7 4.5L8 12l-3.7 2 .7-4.5-3-3L6 6z" fill="currentColor" />
  </svg>
);

export interface SessionBarProps {
  /** The session's current progress stop. */
  progress?: ProgressIndicatorProgress;
  /** The counter label, e.g. "1/4". The counter is always visible — this is not an optional toggle. */
  counterText: string;
  /** The XP chip's label, e.g. "0 XP". */
  xpLabel: string;
  onClose?: () => void;
}

export function SessionBar({ progress = "0", counterText, xpLabel, onClose }: SessionBarProps) {
  return (
    <div className="session-bar">
      <button
        type="button"
        className="session-bar__close"
        onClick={onClose}
        aria-label="Close"
      >
        <IconSlot size="200" icon={CloseIcon} />
      </button>
      <div className="session-bar__progress">
        <ProgressIndicator
          variant="Primary"
          thickness="24"
          progress={progress}
          showText
          counterText={counterText}
        />
      </div>
      <div className="session-bar__xp">
        <Chips size="S" color="Primary" active label={xpLabel} showLeftIcon leftIcon={XPIcon} />
      </div>
    </div>
  );
}
