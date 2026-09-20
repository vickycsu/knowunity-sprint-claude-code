"use client";

import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import { Button } from "@/components/Button/Button";
import "./leaving-sheet.css";

export interface LeavingSheetProps {
  open: boolean;
  onKeepGoing: () => void;
  onExit: () => void;
}

/**
 * Matches Figma's "Screen 14 / Leaving mid-session" exactly. Triggered by
 * every recall-loop screen's SessionBar close button — used on Processing,
 * Prompt, Recording, and Result, so it lives here rather than being
 * inlined per screen (per the "needed twice, promote it" rule).
 */
export function LeavingSheet({ open, onKeepGoing, onExit }: LeavingSheetProps) {
  if (!open) return null;

  return (
    <div className="leaving-sheet-scrim" onClick={onKeepGoing}>
      <div className="leaving-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="leaving-sheet__handle" />
        <MascotSlot size="2XL" pose="standby" />
        <h2 className="leaving-sheet__title">Leaving already?</h2>
        <Button cta="Keep going" variant="Primary" size="L" onClick={onKeepGoing} />
        <button type="button" className="leaving-sheet__exit" onClick={onExit}>
          Save progress and exit
        </button>
      </div>
    </div>
  );
}
