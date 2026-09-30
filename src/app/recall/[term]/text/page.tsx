"use client";

import { useState, useSyncExternalStore } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SessionBar } from "@/components/SessionBar/SessionBar";
import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import { Button } from "@/components/Button/Button";
import { LeavingSheet } from "../../_components/LeavingSheet";
import { SESSION_LENGTH, TERMS, progressFor, questionForAttempt } from "../../_lib/terms";
import { saveDraft, skipTerm, useCarriedDraft, useXpEarnedBefore } from "../../_lib/session";
import { handOffKeyboardTo, releaseKeyboard } from "../../_lib/keyboard";
import "./text.css";

/**
 * The typing turn (F9). Voice stays the primary affordance; this is the one
 * tap away that makes every voice edge state recoverable — a denied or dead
 * microphone, a browser that can't transcribe, a library, a shared room, or
 * a student who doesn't speak.
 *
 * Graded by exactly the same judge as a spoken answer: the modality
 * changes, the rubric doesn't.
 *
 * Laid out as a compose screen rather than a form, because that is what a
 * phone keyboard turns it into. The question stays at the top, the compose
 * block sits directly above the keyboard, and the dead space is between
 * them instead of underneath the send button.
 */

/**
 * How much of the viewport the software keyboard is covering. `100dvh`
 * doesn't shrink for the keyboard on iOS, so the send button would sit
 * underneath it — this measures the real visible area instead. Read through
 * useSyncExternalStore so there's no effect writing layout state on mount.
 */
function subscribeViewport(onChange: () => void): () => void {
  const viewport = typeof window === "undefined" ? undefined : window.visualViewport;
  viewport?.addEventListener("resize", onChange);
  viewport?.addEventListener("scroll", onChange);
  return () => {
    viewport?.removeEventListener("resize", onChange);
    viewport?.removeEventListener("scroll", onChange);
  };
}

function keyboardInset(): number {
  const viewport = typeof window === "undefined" ? undefined : window.visualViewport;
  if (!viewport) return 0;
  return Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
}

/**
 * Sizes the box and takes the keyboard the tap claimed on the way in. Both
 * happen in a ref callback rather than an effect, because the focus has to
 * land while the browser still counts it as part of that tap — an effect
 * runs a beat too late and the keyboard never opens.
 */
function mountInput(element: HTMLTextAreaElement | null) {
  fitToContent(element);
  handOffKeyboardTo(element);
}

/** Grows the box with the answer, up to the max-height its stylesheet sets. */
function fitToContent(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = "auto";
  const max = Number.parseFloat(window.getComputedStyle(element).maxHeight);
  element.style.height = `${Number.isNaN(max) ? element.scrollHeight : Math.min(element.scrollHeight, max)}px`;
}

export default function TextPage() {
  const params = useParams<{ term: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const term = Number(params.term);
  const attemptParam = searchParams.get("attempt");
  // Unaided practice after a reveal. Ungraded, and it replays the term's
  // original question rather than a hint's follow-up — same slot the voice
  // version uses, so the two can't produce different records.
  const isSayItBack = attemptParam === "sayback";
  const attemptNumber = isSayItBack ? 4 : Number(attemptParam ?? "1");

  const question = isSayItBack
    ? (TERMS[term] ?? TERMS[1]).question
    : questionForAttempt(term, attemptNumber);
  const xpBefore = useXpEarnedBefore(term);
  const carried = useCarriedDraft(term, attemptNumber);
  const inset = useSyncExternalStore(subscribeViewport, keyboardInset, () => 0);

  // Null until the student touches the box, so an answer carried over from
  // the microphone can appear without an effect writing it into state.
  const [typed, setTyped] = useState<string | null>(null);
  const [leavingSheetOpen, setLeavingSheetOpen] = useState(false);

  const answer = typed ?? carried;
  const canSend = answer.trim().length > 0;
  // Knowie steps aside when the space is genuinely needed: the keyboard is
  // up, or there's an answer on screen that matters more than the mascot.
  // Deliberately not tied to focus — autoFocus fires before React attaches
  // the handler, so the first load would miss it.
  const composing = inset > 0 || answer.length > 0;

  function handleSend() {
    if (!canSend) return;
    saveDraft({
      term,
      attemptNumber,
      transcript: answer.trim(),
      source: "text",
    });
    router.push(
      `/recall/${term}/processing?attempt=${isSayItBack ? "sayback" : attemptNumber}`,
    );
  }

  function handleSpeakInstead() {
    releaseKeyboard();
    // Keep what they typed rather than discarding it, so coming back to the
    // keyboard restores the draft instead of starting over.
    if (answer.trim()) {
      saveDraft({
        term,
        attemptNumber,
        transcript: answer.trim(),
        source: "text",
      });
    }
    router.push(
      `/recall/${term}/recording?attempt=${isSayItBack ? "sayback" : attemptNumber}`,
    );
  }

  function handleSkip() {
    releaseKeyboard();
    skipTerm(term);
    if (term >= SESSION_LENGTH) router.push("/recall/summary");
    else router.push(`/recall/${term + 1}/prompt`);
  }

  return (
    <main
      className={`text-turn${composing ? " text-turn--composing" : ""}`}
      style={{ "--keyboard-inset": `${inset}px` } as React.CSSProperties}
    >
      <SessionBar
        progress={progressFor(term)}
        counterText={`${term}/${SESSION_LENGTH}`}
        xpLabel={`${xpBefore} XP`}
        onClose={() => setLeavingSheetOpen(true)}
      />

      <div className="text-turn__prompt">
        {/* On a phone this space is the difference between seeing your own
            answer and not. The question itself never leaves. */}
        <div className="text-turn__mascot">
          <MascotSlot size="2XL" pose="standby" />
        </div>
        <div className="text-turn__bubble">
          <p className="text-turn__question">{question}</p>
        </div>
      </div>

      <div className="text-turn__compose">
        {carried && typed === null ? (
          <p className="text-turn__carried-note">Your answer so far — edit it however you like.</p>
        ) : null}

        <textarea
          ref={mountInput}
          className="text-turn__input"
          value={answer}
          onChange={(event) => {
            setTyped(event.target.value);
            fitToContent(event.target);
          }}
          onKeyDown={(event) => {
            // Enter inserts a newline — an explanation runs to several
            // sentences, and swallowing them into a send is the wrong
            // default here. Cmd/Ctrl+Enter is the deliberate send.
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder="Explain it in your own words"
          aria-label="Your answer"
          rows={2}
        />

        <Button
          cta="Send"
          variant="Primary"
          size="L"
          state={canSend ? "Default" : "Disabled"}
          onClick={handleSend}
        />

        <div className="text-turn__links">
          <button type="button" className="text-turn__link" onClick={handleSpeakInstead}>
            Speak instead
          </button>
          <button type="button" className="text-turn__skip" onClick={handleSkip}>
            Skip question
          </button>
        </div>
      </div>

      <LeavingSheet
        open={leavingSheetOpen}
        onKeepGoing={() => setLeavingSheetOpen(false)}
        onExit={() => router.push("/course/biology/plan")}
      />
    </main>
  );
}
