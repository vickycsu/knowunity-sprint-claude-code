import "./progress-indicator.css";

export type ProgressIndicatorVariant = "Primary" | "Coral";
export type ProgressIndicatorThickness = "24" | "16";
export type ProgressIndicatorProgress = "0" | "25" | "50" | "75" | "100";

export interface ProgressIndicatorProps {
  variant?: ProgressIndicatorVariant;
  thickness?: ProgressIndicatorThickness;
  progress?: ProgressIndicatorProgress;
  showText?: boolean;
  /** The counter label, e.g. "1/4". Only rendered when showText is true. */
  counterText?: string;
}

export function ProgressIndicator({
  variant = "Primary",
  thickness = "24",
  progress = "0",
  showText = false,
  counterText,
}: ProgressIndicatorProps) {
  return (
    <div
      className={`progress-indicator progress-indicator--${thickness} progress-indicator--${variant.toLowerCase()}`}
    >
      <div className="progress-indicator__track">
        <div className={`progress-indicator__fill progress-indicator__fill--${progress}`} />
        {showText && counterText ? (
          <span className="progress-indicator__counter">{counterText}</span>
        ) : null}
      </div>
    </div>
  );
}
