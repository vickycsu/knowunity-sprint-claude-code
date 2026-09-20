"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "../../../components/Button/Button";
import { IconSlot } from "../../../components/IconSlot/IconSlot";
import { MascotSlot } from "../../../components/MascotSlot/MascotSlot";
import { MicIcon } from "../../../components/icons/MicIcon";
import { SummaryCard, type SummaryCardTermIndex } from "../../../components/SummaryCard/SummaryCard";
import { XCloseIcon } from "../../../components/icons/XCloseIcon";
import "./summary.css";

type Tone = "Good" | "Partial" | "NeedsPractice";
type ToneBucket = readonly [] | readonly [string] | readonly [string, string] | readonly [string, string, string];

function assertMaxThree(tone: Tone, terms: readonly string[]): asserts terms is ToneBucket {
  if (terms.length > 3) {
    throw new Error(`Summary bucket "${tone}" has ${terms.length} terms; SummaryCard supports at most 3.`);
  }
}

// Dev-only hardcoded session data — the real per-term outcome script is
// Screens 4-7 work, not built yet.
const GOOD_TERMS: readonly string[] = ["Cell Structure and Function", "Plasma Membrane"];
const PARTIAL_TERMS: readonly string[] = ["Osmosis"];
const NEEDS_PRACTICE_TERMS: readonly string[] = ["Membrane Transport"];

assertMaxThree("Good", GOOD_TERMS);
assertMaxThree("Partial", PARTIAL_TERMS);
assertMaxThree("NeedsPractice", NEEDS_PRACTICE_TERMS);

// Real authored copy from Figma's "Concept detail / Osmosis" panel (node
// 15675:7090) — the only term with scripted quote/answer content today.
const CONCEPT_DETAIL: Record<string, { said: string; answer: string }> = {
  Osmosis: {
    said: "“It’s when water moves around.”",
    answer:
      "Water moving across a membrane, from where there is more water to where there is less.",
  },
};

// Real authored copy from Figma's "Screen 17 / Explain more" (node
// 15666:1397) — again, only Osmosis has scripted content; "Explain more"
// is only wired up from Osmosis's expanded row for that reason.
const EXPLAIN_MORE: Record<
  string,
  { definitions: { term: string; copy: string }[] }
> = {
  Osmosis: {
    definitions: [
      {
        term: "Osmosis",
        copy: "Water moving across a membrane, from where there is more water to where there is less.",
      },
      {
        term: "Semi-permeable membrane",
        copy: "A barrier that lets some things through and holds others back.",
      },
    ],
  },
};

interface ExpandedState {
  tone: Tone;
  term: SummaryCardTermIndex;
  termName: string;
}

export default function SummaryPage() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<ExpandedState | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  function toggle(tone: Tone, terms: readonly string[]) {
    return (term: SummaryCardTermIndex) => {
      const termName = terms[term - 1];
      setExpanded((current) =>
        current?.tone === tone && current.term === term ? null : { tone, term, termName }
      );
    };
  }

  const detail = expanded ? CONCEPT_DETAIL[expanded.termName] : undefined;

  return (
    <main className="summary">
      <div className="summary__header-bar">
        <button
          type="button"
          className="summary__close"
          aria-label="Close"
          onClick={() => router.push("/course/biology/plan?afterSession=1")}
        >
          <IconSlot size="200" icon={<XCloseIcon />} />
        </button>
      </div>

      <div className="summary__body">
        <h1 className="summary__headline">Here&rsquo;s how it went</h1>

        <SummaryCard
          tone="Good"
          term1={GOOD_TERMS[0]}
          term2={GOOD_TERMS[1]}
          showRow2={GOOD_TERMS.length > 1}
          expandedTerm={expanded?.tone === "Good" ? expanded.term : undefined}
          onToggleTerm={toggle("Good", GOOD_TERMS)}
        />

        <SummaryCard
          tone="Partial"
          term1={PARTIAL_TERMS[0]}
          expandedTerm={expanded?.tone === "Partial" ? expanded.term : undefined}
          onToggleTerm={toggle("Partial", PARTIAL_TERMS)}
        />
        {expanded?.tone === "Partial" && detail ? (
          <div className="summary__detail">
            <p className="summary__detail-said">{detail.said}</p>
            <p className="summary__detail-label">The answer</p>
            <p className="summary__detail-answer">{detail.answer}</p>
            <div className="summary__detail-actions">
              <Button
                cta="Explain more"
                variant="Primary"
                size="M"
                onClick={() => setSheetOpen(true)}
              />
              {/* No destination — a single-term "Practice again" isn't
                  decided anywhere; SPEC.md only defines a session-level
                  "Review Again" relaunch for every flagged term at once,
                  not a per-term retry from this panel. Rendered per
                  explicit request to match Figma, functionally inert. See
                  component-gaps.md. */}
              <Button cta="Practice again" variant="Secondary" size="M" />
            </div>
          </div>
        ) : null}

        <SummaryCard
          tone="NeedsPractice"
          term1={NEEDS_PRACTICE_TERMS[0]}
          expandedTerm={expanded?.tone === "NeedsPractice" ? expanded.term : undefined}
          onToggleTerm={toggle("NeedsPractice", NEEDS_PRACTICE_TERMS)}
        />

        <div className="summary__spacer" />

        <Button
          cta="Continue"
          variant="Primary"
          size="L"
          onClick={() => router.push("/course/biology/plan?afterSession=1")}
        />
      </div>

      {sheetOpen ? (
        <div className="summary__sheet-scrim" onClick={() => setSheetOpen(false)}>
          <div className="summary__sheet" onClick={(event) => event.stopPropagation()}>
            <div className="summary__sheet-handle" />

            <div className="summary__sheet-header">
              <button
                type="button"
                className="summary__close"
                aria-label="Close"
                onClick={() => setSheetOpen(false)}
              >
                <IconSlot size="200" icon={<XCloseIcon />} />
              </button>
              <h2 className="summary__sheet-title">Osmosis</h2>
            </div>

            <div className="summary__sheet-composing">
              <MascotSlot size="XL" pose="standby" />
              <p className="summary__sheet-composing-text">Let&rsquo;s review it together!</p>
            </div>

            <div className="summary__sheet-divider" />

            <div className="summary__sheet-definitions">
              {EXPLAIN_MORE.Osmosis.definitions.map((definition) => (
                <div key={definition.term} className="summary__sheet-definition">
                  <p className="summary__sheet-definition-term">{definition.term}</p>
                  <p className="summary__sheet-definition-copy">{definition.copy}</p>
                </div>
              ))}
            </div>

            {/* "Ask Knowie" has no destination — a free-form follow-up chat
                with Knowie isn't a decided feature anywhere in this
                prototype's scope. Rendered as a real-looking, non-functional
                input, same treatment as "Create a course" earlier. See
                component-gaps.md. */}
            <div className="summary__sheet-ask">
              <IconSlot size="250" icon={<Plus size="100%" strokeWidth={2} aria-hidden="true" />} />
              <input
                type="text"
                className="summary__sheet-ask-input"
                placeholder="Ask Knowie…"
                readOnly
              />
              <IconSlot size="250" icon={<MicIcon />} />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
