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
 * Restyled 2026-11-17 to the owner's reference screenshot (the live app's
 * "Please don't leave" sheet): page-dark sheet with a hairline top edge,
 * Knowie centred with room around them, a large headline, one line of
 * encouragement, and two full-width buttons. Triggered by
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
        <div className="leaving-sheet__mascot">
          <MascotSlot size="2XL" pose="standby" />
        </div>
        <div className="leaving-sheet__text">
          <h2 className="leaving-sheet__title">Please don’t leave</h2>
          <p className="leaving-sheet__body">Let me help you prep</p>
        </div>
        <div className="leaving-sheet__actions">
          <Button cta="Keep learning" variant="Primary" size="L" onClick={onKeepGoing} />
          <Button cta="Leave" variant="Secondary" size="L" onClick={onExit} />
        </div>
      </div>
    </div>
  );
}
