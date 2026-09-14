import type { MouseEventHandler, ReactNode } from "react";
import { Button, type ButtonState } from "../Button/Button";
import { ButtonIcon, type ButtonIconState } from "../ButtonIcon/ButtonIcon";
import "./button-group.css";

export type ButtonGroupVariant = "Horizontal" | "Vertical";
export type ButtonGroupSize = "M" | "L";

export interface ButtonGroupProps {
  variant?: ButtonGroupVariant;
  size?: ButtonGroupSize;
  className?: string;

  /** The Primary action's label. Rendered top (Vertical) or filling remaining width (Horizontal). */
  primaryCta: string;
  onPrimaryClick?: MouseEventHandler<HTMLButtonElement>;
  primaryState?: ButtonState;

  /** Vertical only: the Secondary action's label, rendered below the Primary button. */
  secondaryCta?: string;
  onSecondaryClick?: MouseEventHandler<HTMLButtonElement>;
  secondaryState?: ButtonState;

  /** Horizontal only: the Secondary action is icon-only, rendered before the Primary button. */
  secondaryIcon?: ReactNode;
  secondaryAriaLabel?: string;
  secondaryIconState?: ButtonIconState;
}

export function ButtonGroup({
  variant = "Vertical",
  size = "M",
  className,
  primaryCta,
  onPrimaryClick,
  primaryState = "Default",
  secondaryCta,
  onSecondaryClick,
  secondaryState = "Default",
  secondaryIcon,
  secondaryAriaLabel,
  secondaryIconState = "Default",
}: ButtonGroupProps) {
  const classes = [
    "button-group",
    `button-group--${variant.toLowerCase()}`,
    `button-group--${size.toLowerCase()}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (variant === "Horizontal") {
    return (
      <div className={classes}>
        <ButtonIcon
          variant="Secondary"
          size={size}
          state={secondaryIconState}
          icon={secondaryIcon}
          aria-label={secondaryAriaLabel ?? ""}
          onClick={onSecondaryClick}
        />
        <Button
          className="button-group__fill"
          variant="Primary"
          size={size}
          state={primaryState}
          cta={primaryCta}
          onClick={onPrimaryClick}
        />
      </div>
    );
  }

  return (
    <div className={classes}>
      <Button
        variant="Primary"
        size={size}
        state={primaryState}
        cta={primaryCta}
        onClick={onPrimaryClick}
      />
      <Button
        variant="Secondary"
        size={size}
        state={secondaryState}
        cta={secondaryCta ?? ""}
        onClick={onSecondaryClick}
      />
    </div>
  );
}
