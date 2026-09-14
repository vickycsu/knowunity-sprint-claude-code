import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoadingSpinnerIcon } from "../icons/LoadingSpinnerIcon";
import "./button.css";

export type ButtonVariant = "Primary" | "Secondary" | "Tertiary";
export type ButtonSize = "S" | "M" | "L";
export type ButtonState = "Default" | "Pressed" | "Disabled" | "Loading";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "disabled"> {
  /** The button's label. Sentence case only — "Continue," "Try again." */
  cta: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  showLeftIcon?: boolean;
  showRightIcon?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  cta,
  variant = "Primary",
  size = "S",
  state = "Default",
  showLeftIcon = false,
  showRightIcon = false,
  leftIcon,
  rightIcon,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = state === "Disabled" || state === "Loading";
  const isLoading = state === "Loading";

  const classes = [
    "btn",
    `btn--${variant.toLowerCase()}`,
    `btn--${size.toLowerCase()}`,
    state === "Pressed" ? "btn--pressed" : "",
    state === "Disabled" ? "btn--disabled" : "",
    isLoading ? "btn--loading" : "",
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
      aria-label={isLoading ? cta : undefined}
      {...rest}
    >
      <span className="btn__inner">
        {isLoading ? (
          <span className="btn__spinner" aria-hidden="true">
            <LoadingSpinnerIcon />
          </span>
        ) : (
          <span className="btn__content">
            {showLeftIcon && leftIcon ? <span className="btn__icon">{leftIcon}</span> : null}
            <span className="btn__label">{cta}</span>
            {showRightIcon && rightIcon ? <span className="btn__icon">{rightIcon}</span> : null}
          </span>
        )}
      </span>
    </button>
  );
}
