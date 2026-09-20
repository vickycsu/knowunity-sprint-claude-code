import type { ReactNode } from "react";
import { IconSlot } from "../IconSlot/IconSlot";
import { Chips, type ChipsColor } from "../Chips/Chips";
import { InfoCircleIcon } from "../icons/InfoCircleIcon";
import { CheckCircleIcon } from "../icons/CheckCircleIcon";
import { AlertCircleIcon } from "../icons/AlertCircleIcon";
import "./snackbar.css";

export type SnackbarVariant = "Default" | "Success" | "Error";

const ICON_BY_VARIANT: Record<SnackbarVariant, ReactNode> = {
  Default: <InfoCircleIcon />,
  Success: <CheckCircleIcon />,
  Error: <AlertCircleIcon />,
};

const CHIP_COLOR_BY_VARIANT: Record<SnackbarVariant, ChipsColor> = {
  Default: "Info",
  Success: "Success",
  Error: "Error",
};

export interface SnackbarProps {
  variant?: SnackbarVariant;
  /** The message. Figma's own default, "Up to 2 lines of text...", is placeholder example text, not real copy — always pass a real message. */
  text: string;
  /**
   * The nested chip's label. Figma's own default, "1/2 words", is placeholder example text, not
   * real copy — always pass a real label. Not a promoted property on the Figma component (it's
   * fixed per variant in the file); exposed here because a snackbar with a hardcoded chip label
   * isn't usable. Flag this to the system owner so it can be promoted in Figma.
   */
  chipLabel: string;
}

export function Snackbar({ variant = "Default", text, chipLabel }: SnackbarProps) {
  return (
    <div className="snackbar">
      <div className={`snackbar__card snackbar__card--${variant.toLowerCase()}`}>
        <div className="snackbar__icon-container">
          <IconSlot size="300" icon={ICON_BY_VARIANT[variant]} />
        </div>
        <div className="snackbar__content">
          <p className="snackbar__text">{text}</p>
        </div>
        <Chips
          size="S"
          color={CHIP_COLOR_BY_VARIANT[variant]}
          active
          label={chipLabel}
          showLeftIcon={false}
          showRightIcon={false}
        />
      </div>
    </div>
  );
}
