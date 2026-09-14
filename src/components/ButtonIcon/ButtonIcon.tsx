import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoadingSpinnerIcon } from "../icons/LoadingSpinnerIcon";
import "./button-icon.css";

export type ButtonIconVariant = "Primary" | "Secondary" | "Tertiary";
export type ButtonIconSize = "S" | "M" | "L";
export type ButtonIconState = "Default" | "Pressed" | "Disabled" | "Loading";

export interface ButtonIconProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "disabled"> {
  /** The icon to render. Its meaning must be unambiguous without a label (close, back, mic). */
  icon: ReactNode;
  /** Required: icon-only buttons need an accessible name since there's no visible label. */
  "aria-label": string;
  variant?: ButtonIconVariant;
  size?: ButtonIconSize;
  state?: ButtonIconState;
}

export function ButtonIcon({
  icon,
  variant = "Primary",
  size = "S",
  state = "Default",
  className,
  ...rest
}: ButtonIconProps) {
  const isDisabled = state === "Disabled" || state === "Loading";
  const isLoading = state === "Loading";

  const classes = [
    "btn-icon",
    `btn-icon--${variant.toLowerCase()}`,
    `btn-icon--${size.toLowerCase()}`,
    state === "Pressed" ? "btn-icon--pressed" : "",
    state === "Disabled" ? "btn-icon--disabled" : "",
    isLoading ? "btn-icon--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      disabled={isDisabled}
      aria-busy={isLoading}
      {...rest}
    >
      <span className="btn-icon__inner">
        {isLoading ? (
          <span className="btn-icon__spinner" aria-hidden="true">
            <LoadingSpinnerIcon />
          </span>
        ) : (
          <span className="btn-icon__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </span>
    </button>
  );
}
