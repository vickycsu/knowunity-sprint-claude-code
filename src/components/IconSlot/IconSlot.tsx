import type { ReactNode } from "react";
import "./icon-slot.css";

export type IconSlotSize = "100" | "150" | "200" | "250" | "300" | "400";

export interface IconSlotProps {
  /** The icon to render. iconSlot only controls sizing and spacing — bring your own icon. */
  icon: ReactNode;
  size?: IconSlotSize;
}

export function IconSlot({ icon, size = "400" }: IconSlotProps) {
  return <span className={`icon-slot icon-slot--${size}`}>{icon}</span>;
}
