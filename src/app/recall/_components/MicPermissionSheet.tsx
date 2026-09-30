"use client";

import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import { Button } from "@/components/Button/Button";
import "./mic-permission-sheet.css";

export interface MicPermissionSheetProps {
  open: boolean;
  onAllow: () => void;
  onTypeInstead: () => void;
  onDismiss: () => void;
}

/**
 * The in-context permission primer, per voice-ux.md principle 3 and
 * sprint-context.md's "Voice states" list: our own screen explains why the
 * mic is needed before any system dialog would appear. It is a sheet over
 * Prompt rather than a standalone screen because sprint-context.md rules out
 * a start sheet before the first question.
 *
 * A visual mock. "Allow microphone" goes straight to the Recording screen —
 * nothing here touches a real microphone API, matching the prototype's
 * prepopulated answers. "Type instead" is the designed opt-out: the student
 * must never be dead-ended by a permission they don't want to grant.
 */
export function MicPermissionSheet({
  open,
  onAllow,
  onTypeInstead,
  onDismiss,
}: MicPermissionSheetProps) {
  if (!open) return null;

  return (
    <div className="mic-sheet-scrim" onClick={onDismiss}>
      <div className="mic-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="mic-sheet__handle" />
        <MascotSlot size="2XL" pose="standby" />
        <h2 className="mic-sheet__title">Explain it to Knowie</h2>
        <p className="mic-sheet__body">Make it stick by explaining it out loud</p>
        <Button cta="Allow microphone" variant="Primary" size="L" onClick={onAllow} />
        <button type="button" className="mic-sheet__link" onClick={onTypeInstead}>
          Type instead
        </button>
      </div>
    </div>
  );
}
