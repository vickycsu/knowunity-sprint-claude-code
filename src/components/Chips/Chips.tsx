import type { ReactNode } from "react";
import { IconSlot, type IconSlotSize } from "../IconSlot/IconSlot";
import "./chips.css";

export type ChipsSize = "XXS" | "XS" | "S" | "M";
export type ChipsColor = "Primary" | "pro";

const ICON_SIZE_BY_CHIP_SIZE: Record<ChipsSize, IconSlotSize> = {
  XXS: "150",
  XS: "150",
  S: "200",
  M: "250",
};

export interface ChipsProps {
  /** The chip's label. Figma's own default, "1/2 words," is placeholder example text, not real copy — always pass a real label. */
  label: string;
  size?: ChipsSize;
  color?: ChipsColor;
  active?: boolean;
  showLeftIcon?: boolean;
  showRightIcon?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Chips({
  label,
  size = "XXS",
  color = "Primary",
  active = false,
  showLeftIcon = true,
  showRightIcon = true,
  leftIcon,
  rightIcon,
}: ChipsProps) {
  const iconSize = ICON_SIZE_BY_CHIP_SIZE[size];
  const classes = [
    "chip",
    `chip--${size.toLowerCase()}`,
    active ? "chip--active" : "chip--inactive",
    active ? `chip--${color.toLowerCase()}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {showLeftIcon && leftIcon ? (
        <span className="chip__icon">
          <IconSlot size={iconSize} icon={leftIcon} />
        </span>
      ) : null}
      <span className="chip__label">{label}</span>
      {showRightIcon && rightIcon ? (
        <span className="chip__icon">
          <IconSlot size={iconSize} icon={rightIcon} />
        </span>
      ) : null}
    </span>
  );
}
