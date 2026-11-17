"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Pencil, RotateCcw, Send } from "lucide-react";
import { SessionBar } from "@/components/SessionBar/SessionBar";
import { RecordingControl } from "@/components/RecordingControl/RecordingControl";
import { IconSlot } from "@/components/IconSlot/IconSlot";
import { LeavingSheet } from "../../_components/LeavingSheet";
import { KnowieAsks } from "../../_components/KnowieAsks";
import { AnswerLinks } from "../../_components/AnswerControls";
import { SESSION_LENGTH, TERMS, attemptFor, progressFor } from "../../_lib/terms";
import { saveDraft, useQuestion, useXpEarnedBefore } from "../../_lib/session";
import { claimKeyboard } from "../../_lib/keyboard";
import "./recording.css";

const SAY_IT_BACK_TRANSCRIPT =
  "Letting me try that again in my own words: it's selectively permeable, so small molecules pass through and larger ones need a channel.";

/**
 * How fast the scripted take appears, per word. The answer is prepopulated,
 * not transcribed — revealing it a word at a time is what makes the mock
 * read as listening rather than as text that was always there.
 */
const WORD_INTERVAL_MS = 130;

type TakeState = "listening" | "paused";

export default function RecordingPage() {
  const params = useParams<{ term: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const term = Number(params.term);
  const script = TERMS[term] ?? TERMS[1];

  const attemptParam = searchParams.get("attempt");
  const isSayItBack = attemptParam === "sayback";
  const attemptNumber = isSayItBack ? script.attempts.length : Number(attemptParam ?? "1");
  const scriptedTranscript = isSayItBack
    ? SAY_IT_BACK_TRANSCRIPT
    : attemptFor(term, attemptNumber).transcript;
  const askedQuestion = useQuestion(term, attemptNumber);
  const question = isSayItBack ? script.question : askedQuestion;

  const [takeState, setTakeState] = useState<TakeState>("listening");
  // The pause/resume crossfade only plays after a real state change, not on arrival.
  const [hasToggled, setHasToggled] = useState(false);
  // What the student has "said" so far. Starts empty and fills in while
  // listening; a scripted empty take simply never fills.
  const [transcript, setTranscript] = useState("");
  // Paused text is read-only until the student taps Edit.
  const [editing, setEditing] = useState(false);
  const [heardWords, setHeardWords] = useState(0);
  const [leavingSheetOpen, setLeavingSheetOpen] = useState(false);
  const xpBefore = useXpEarnedBefore(term);

  const words = scriptedTranscript ? scriptedTranscript.split(" ") : [];

  useEffect(() => {
    if (takeState !== "listening" || heardWords >= words.length) return;
    const timer = setTimeout(() => setHeardWords((n) => n + 1), WORD_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [heardWords, takeState, words.length]);

  // While listening, the box shows the take as it arrives. Once paused, it
  // becomes editable text the student owns.
  const live = words.slice(0, heardWords).join(" ");
  const shown = takeState === "paused" ? transcript : live;
  const hasWords = shown.trim().length > 0;

  function handlePause() {
    setTranscript(live);
    setTakeState("paused");
    setHasToggled(true);
  }

  // Redo: throw the take away and go straight back to listening.
  function handleRedo() {
    setTranscript("");
    setHeardWords(0);
    setEditing(false);
    setTakeState("listening");
  }

  function handleResume() {
    setEditing(false);
    setTakeState("listening");
  }

  function handleSend() {
    saveDraft({ term, attemptNumber, transcript: shown.trim(), source: "voice" });
    router.push(
      isSayItBack
        ? `/recall/${term}/processing?attempt=sayback`
        : `/recall/${term}/processing?attempt=${attemptNumber}`,
    );
  }

  function handleTypeInstead() {
    claimKeyboard();
    if (shown.trim()) {
      saveDraft({ term, attemptNumber, transcript: shown.trim(), source: "voice" });
    }
    router.push(`/recall/${term}/text?attempt=${attemptParam ?? attemptNumber}`);
  }

  const isPaused = takeState === "paused";

  return (
    <main className={`recording${editing ? " recording--editing" : ""}`}>
      <SessionBar
        progress={progressFor(term)}
        counterText={`${term}/${SESSION_LENGTH}`}
        xpLabel={`${xpBefore} XP`}
        onClose={() => setLeavingSheetOpen(true)}
      />

      <div className="recording__body">
        <KnowieAsks question={question} />

        <div className="recording__transcript">
          {isPaused ? (
            <>
              {editing ? (
                <textarea
                  className="recording__transcript-input"
                  value={transcript}
                  onChange={(event) => setTranscript(event.target.value)}
                  rows={2}
                  aria-label="Your answer"
                  autoFocus
                />
              ) : (
                <p className="recording__transcript-text">{transcript}</p>
              )}
              <div className="recording__transcript-actions">
                <button type="button" className="recording__transcript-action" onClick={handleRedo}>
                  <IconSlot size="150" icon={<RotateCcw size="100%" strokeWidth={2} aria-hidden="true" />} />
                  Redo
                </button>
                {/* While editing, the student is already composing — Edit
                    becomes Send, right where their attention is. */}
                {editing ? (
                  <button
                    type="button"
                    className="recording__transcript-action"
                    disabled={!hasWords}
                    onClick={handleSend}
                  >
                    <IconSlot size="150" icon={<Send size="100%" strokeWidth={2} aria-hidden="true" />} />
                    Send
                  </button>
                ) : (
                  <button
                    type="button"
                    className="recording__transcript-action"
                    onClick={() => setEditing(true)}
                  >
                    <IconSlot size="150" icon={<Pencil size="100%" strokeWidth={2} aria-hidden="true" />} />
                    Edit
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="recording__transcript-text" aria-live="polite">
              {live}
            </p>
          )}
        </div>

        <div className="recording__spacer" />

        {/* Everything below stays mounted in both states and only fades, so
            pausing or resuming never moves the circle or the thumb's target.
            `inert` keeps the faded-out half out of reach and out of the
            accessibility tree. */}
        {/* Faded out while editing: the student is typing, so the voice
            controls step back. `inert` keeps them out of reach meanwhile. */}
        <div className="recording__record-row" inert={editing}>
          {/* Balances the send button so the circle stays centred. */}
          <span className="recording__side-spacer" aria-hidden="true" />

          <div className="recording__control-slot" data-state={hasToggled ? takeState : undefined}>
            <RecordingControl
              state={isPaused ? "Paused" : "Listening"}
              text={isPaused ? "Tap to resume" : "Tap to pause"}
              onClick={isPaused ? handleResume : handlePause}
            />
          </div>

          {/* Send stays put in both states — the one way to commit the take. */}
          <button
            type="button"
            className="recording__side-button"
            aria-label="Send"
            disabled={!hasWords}
            onClick={handleSend}
          >
            <IconSlot size="250" icon={<Send size="100%" strokeWidth={2} aria-hidden="true" />} />
          </button>
        </div>

        <div className="recording__links" inert={editing}>
          <AnswerLinks switchLabel="Type instead" onSwitch={handleTypeInstead} centered />
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
