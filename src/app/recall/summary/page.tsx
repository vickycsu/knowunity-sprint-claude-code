"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/Button/Button";
import { IconSlot } from "@/components/IconSlot/IconSlot";
import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import { MicIcon } from "@/components/icons/MicIcon";
import { SummaryCard, type SummaryCardTermIndex } from "@/components/SummaryCard/SummaryCard";
import { XCloseIcon } from "@/components/icons/XCloseIcon";
import { TERMS } from "../_lib/terms";
import { useSummary, type SummaryBucket, type TermOutcome } from "../_lib/session";
import "./summary.css";

const BUCKET_ORDER: SummaryBucket[] = ["Good", "Partial", "NeedsPractice"];

export default function SummaryPage() {
  const router = useRouter();
  const outcomes = useSummary();
  // The expanded row is tracked by term number, not by its position in a
  // bucket — positions shift as the buckets fill differently each session.
  const [expandedTerm, setExpandedTerm] = useState<number | null>(null);
  const [sheetTerm, setSheetTerm] = useState<number | null>(null);

  const expanded = outcomes.find((outcome) => outcome.term === expandedTerm) ?? null;
  const sheetScript = sheetTerm === null ? null : (TERMS[sheetTerm] ?? null);

  function bucketOf(bucket: SummaryBucket): TermOutcome[] {
    return outcomes.filter((outcome) => outcome.bucket === bucket);
  }

  function card(bucket: SummaryBucket) {
    const terms = bucketOf(bucket);
    // An empty bucket is a real, common result — a student who gets
    // everything right has nothing in "Needs practice". Showing an empty
    // card would read as a bucket that failed to load.
    if (terms.length === 0) return null;

    const detailIndex = terms.findIndex((outcome) => outcome.term === expandedTerm);

    return (
      <div key={bucket} className="summary__bucket">
        <SummaryCard
          tone={bucket}
          term1={terms[0].name}
          term2={terms[1]?.name}
          term3={terms[2]?.name}
          term4={terms[3]?.name}
          showRow2={terms.length > 1}
          showRow3={terms.length > 2}
          showRow4={terms.length > 3}
          expandedTerm={
            detailIndex >= 0 ? ((detailIndex + 1) as SummaryCardTermIndex) : undefined
          }
          onToggleTerm={(index) => {
            const tapped = terms[index - 1];
            if (!tapped) return;
            setExpandedTerm((current) => (current === tapped.term ? null : tapped.term));
          }}
        />
        {detailIndex >= 0 && expanded ? <Detail outcome={expanded} onExplainMore={setSheetTerm} /> : null}
      </div>
    );
  }

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

        {BUCKET_ORDER.map(card)}

        <div className="summary__spacer" />

        <Button
          cta="Continue"
          variant="Primary"
          size="L"
          onClick={() => router.push("/course/biology/plan?afterSession=1")}
        />
      </div>

      {sheetScript && sheetTerm !== null ? (
        <div className="summary__sheet-scrim" onClick={() => setSheetTerm(null)}>
          <div className="summary__sheet" onClick={(event) => event.stopPropagation()}>
            <div className="summary__sheet-handle" />

            <div className="summary__sheet-header">
              <button
                type="button"
                className="summary__close"
                aria-label="Close"
                onClick={() => setSheetTerm(null)}
              >
                <IconSlot size="200" icon={<XCloseIcon />} />
              </button>
              <h2 className="summary__sheet-title">{sheetScript.name}</h2>
            </div>

            <div className="summary__sheet-composing">
              <MascotSlot size="XL" pose="standby" />
              <p className="summary__sheet-composing-text">Let&rsquo;s review it together!</p>
            </div>

            <div className="summary__sheet-divider" />

            <div className="summary__sheet-definitions">
              {sheetScript.explainMore.map((definition) => (
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

/**
 * The expanded row's panel. It shows the student their own answer first,
 * because that is the thing they can't otherwise check — the transcript is
 * gone once the term resolves, and seeing it is how a misheard answer reads
 * as "it misheard me" rather than "I failed".
 *
 * "The answer" only appears when they didn't get there on their own; a term
 * they explained correctly doesn't need correcting.
 */
function Detail({
  outcome,
  onExplainMore,
}: {
  outcome: TermOutcome;
  onExplainMore: (term: number) => void;
}) {
  const script = TERMS[outcome.term];
  if (!script) return null;
  const needsAnswer = outcome.bucket !== "Good";

  return (
    <div className="summary__detail">
      <p className="summary__detail-label">
        {outcome.skipped
          ? "You skipped this one"
          : outcome.source === "text"
            ? "What you typed"
            : "What you said"}
      </p>
      {outcome.skipped ? null : (
        <p className="summary__detail-said">&ldquo;{outcome.transcript}&rdquo;</p>
      )}

      {needsAnswer ? (
        <>
          <p className="summary__detail-label">The answer</p>
          {/* The same answer the reveal gives, which is written to follow
              "Here's the piece you were missing: " — standing alone here, it
              needs its own capital. */}
          <p className="summary__detail-answer">
            {script.answer.charAt(0).toUpperCase() + script.answer.slice(1)}
          </p>
          <div className="summary__detail-actions">
            <Button
              cta="Explain more"
              variant="Primary"
              size="M"
              onClick={() => onExplainMore(outcome.term)}
            />
            {/* No destination — a single-term "Practice again" isn't
                decided anywhere; SPEC.md only defines a session-level
                "Review Again" relaunch for every flagged term at once,
                not a per-term retry from this panel. Rendered per
                explicit request to match Figma, functionally inert. See
                component-gaps.md. */}
            <Button cta="Practice again" variant="Secondary" size="M" />
          </div>
        </>
      ) : null}
    </div>
  );
}
