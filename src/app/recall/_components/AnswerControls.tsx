import type { ReactNode } from "react";
import { IconSlot } from "@/components/IconSlot/IconSlot";
import { MicIcon } from "@/components/icons/MicIcon";
import "./answer-controls.css";

export interface AnswerLinksProps {
  /** "Type instead" everywhere you'd speak; "Speak instead" on the typing turn. */
  switchLabel: string;
  onSwitch: () => void;
  /** Omitted where there's no hint to give (after the answer is revealed). */
  onHint?: () => void;
  /** A lone link, centred — Recording, where Hint isn't offered. */
  centered?: boolean;
}

/**
 * The two ways out of any answer moment, always in the same place and the
 * same style: switch modality on the left, ask for a hint on the right.
 * The hint slot holds its space even when empty, so "Type instead" never
 * shifts between screens.
 */
export function AnswerLinks({ switchLabel, onSwitch, onHint, centered = false }: AnswerLinksProps) {
  if (centered) {
    return (
      <div className="answer-links answer-links--centered">
        <button type="button" className="answer-links__link" onClick={onSwitch}>
          {switchLabel}
        </button>
      </div>
    );
  }
  return (
    <div className="answer-links">
      <button type="button" className="answer-links__link" onClick={onSwitch}>
        {switchLabel}
      </button>
      {onHint ? (
        <button type="button" className="answer-links__link" onClick={onHint}>
          Hint
        </button>
      ) : (
        <span className="answer-links__link" aria-hidden="true" />
      )}
    </div>
  );
}

export interface AnswerControlsProps {
  /** Short line above the mic, e.g. "Try it in your own words". */
  caption?: string;
  onMic: () => void;
  onTypeInstead: () => void;
  onHint?: () => void;
  /** An extra action between the mic and the links, e.g. "Next question" after a reveal. */
  children?: ReactNode;
}

/**
 * Every "answer this" moment in the loop — Prompt, the empty take, both
 * hints, the reveal and the next question after a pass — shares one layout:
 * an optional caption, the mic alone and centred, then Type instead / Hint.
 */
export function AnswerControls({ caption, onMic, onTypeInstead, onHint, children }: AnswerControlsProps) {
  return (
    <div className="answer-controls">
      {caption ? <p className="answer-controls__caption">{caption}</p> : null}
      <button type="button" className="answer-controls__mic" aria-label="Start speaking" onClick={onMic}>
        <IconSlot size="400" icon={<MicIcon />} />
      </button>
      {children}
      {/* Always last, so the links sit at the same spot on every screen. */}
      <AnswerLinks switchLabel="Type instead" onSwitch={onTypeInstead} onHint={onHint} />
    </div>
  );
}
