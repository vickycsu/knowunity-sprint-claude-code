import type { ButtonHTMLAttributes } from "react";
import "./recording-control.css";

export type RecordingControlState = "Listening" | "Paused";

const DEFAULT_TEXT: Record<RecordingControlState, string> = {
  Listening: "Tap to send",
  Paused: "Tap to resume",
};

export interface RecordingControlProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  state?: RecordingControlState;
  /** Matches the state's copy — set it rather than relying on the default for a production screen. */
  text?: string;
}

export function RecordingControl({
  state = "Listening",
  text,
  className,
  ...rest
}: RecordingControlProps) {
  const label = text ?? DEFAULT_TEXT[state];
  const classes = [
    "recording-control",
    `recording-control--${state.toLowerCase()}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (state === "Listening") {
    return (
      <button type="button" className={classes} {...rest}>
        <span className="recording-control__bloom" aria-hidden="true" />
        <span className="recording-control__label">{label}</span>
      </button>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      <span className="recording-control__label">{label}</span>
    </button>
  );
}
