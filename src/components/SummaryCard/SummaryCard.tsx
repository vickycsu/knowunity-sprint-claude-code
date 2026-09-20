import type { ReactNode } from "react";
import { IconSlot } from "../IconSlot/IconSlot";
import { CheckIcon } from "../icons/CheckIcon";
import { XCloseIcon } from "../icons/XCloseIcon";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import "./summary-card.css";

export type SummaryCardTone = "Good" | "Partial" | "NeedsPractice";
export type SummaryCardTermIndex = 1 | 2 | 3;

const TONE_CLASS: Record<SummaryCardTone, string> = {
  Good: "good",
  Partial: "partial",
  NeedsPractice: "needs-practice",
};

const HEADER_LABEL: Record<SummaryCardTone, string> = {
  Good: "Good explanations",
  Partial: "Needed a hint",
  NeedsPractice: "Needs practice",
};

const ROW_ICON: Record<SummaryCardTone, ReactNode> = {
  Good: <CheckIcon />,
  Partial: <XCloseIcon />,
  NeedsPractice: <XCloseIcon />,
};

export interface SummaryCardProps {
  tone: SummaryCardTone;
  /** First term. Always shown — every card has at least one row. */
  term1: string;
  term2?: string;
  term3?: string;
  showRow2?: boolean;
  showRow3?: boolean;
  /** The term currently expanded, if any. Each row shows a chevron so the student knows it can be tapped open. */
  expandedTerm?: SummaryCardTermIndex;
  /** Called with the tapped row's term index. */
  onToggleTerm?: (term: SummaryCardTermIndex) => void;
}

export function SummaryCard({
  tone,
  term1,
  term2,
  term3,
  showRow2 = false,
  showRow3 = false,
  expandedTerm,
  onToggleTerm,
}: SummaryCardProps) {
  const icon = ROW_ICON[tone];

  function row(index: SummaryCardTermIndex, term: string) {
    const expanded = expandedTerm === index;
    return (
      <button
        type="button"
        className="summary-card__row"
        aria-expanded={expanded}
        onClick={() => onToggleTerm?.(index)}
      >
        <IconSlot size="250" icon={icon} />
        <span className="summary-card__term">{term}</span>
        <span className={`summary-card__chevron${expanded ? " summary-card__chevron--expanded" : ""}`}>
          <IconSlot size="300" icon={<ChevronDownIcon />} />
        </span>
      </button>
    );
  }

  return (
    <div className={`summary-card summary-card--${TONE_CLASS[tone]}`}>
      <div className="summary-card__header">{HEADER_LABEL[tone]}</div>
      <div className="summary-card__rows">
        {row(1, term1)}
        {showRow2 && term2 ? row(2, term2) : null}
        {showRow3 && term3 ? row(3, term3) : null}
      </div>
    </div>
  );
}
