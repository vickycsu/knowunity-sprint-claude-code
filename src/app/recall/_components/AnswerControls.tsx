import type { ReactNode } from "react";
import { IconSlot } from "@/components/IconSlot/IconSlot";
import { MicIcon } from "@/components/icons/MicIcon";
import "./answer-controls.css";

export interface AnswerLinksProps {
  /** "Type instead" everywhere you'd speak; "Speak instead" on the typing turn. */
  switchLabel: string;
  onSwitch: () => void;
}

/**
 * The way out of any answer moment: switch modality, centred under the
 * main action, in the same place and style on every screen.
 */
export function AnswerLinks({ switchLabel, onSwitch }: AnswerLinksProps) {
  return (
    <div className="answer-links">
      <button type="button" className="answer-links__link" onClick={onSwitch}>
        {switchLabel}
      </button>
    </div>
  );
}

export interface AnswerControlsProps {
  /** Short line above the mic, e.g. "Try it in your own words". */
  caption?: string;
  onMic: () => void;
  onTypeInstead: () => void;
  /** An extra action between the mic and the link, e.g. "Next question" after a reveal. */
  children?: ReactNode;
}

/**
 * Every "answer this" moment in the loop — Prompt, the empty take, both
 * hints, the reveal and the next question after a pass — shares one layout:
 * an optional caption, the mic alone and centred, then Type instead.
 */
export function AnswerControls({ caption, onMic, onTypeInstead, children }: AnswerControlsProps) {
  return (
    <div className="answer-controls">
      {caption ? <p className="answer-controls__caption">{caption}</p> : null}
      <button type="button" className="answer-controls__mic" aria-label="Start speaking" onClick={onMic}>
        <IconSlot size="400" icon={<MicIcon />} />
      </button>
      {children}
      {/* Always last, so the link sits at the same spot on every screen. */}
      <AnswerLinks switchLabel="Type instead" onSwitch={onTypeInstead} />
    </div>
  );
}
