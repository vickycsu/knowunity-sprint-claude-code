"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Pause, Trash2 } from "lucide-react";
import { SessionBar } from "@/components/SessionBar/SessionBar";
import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import { RecordingControl } from "@/components/RecordingControl/RecordingControl";
import { IconSlot } from "@/components/IconSlot/IconSlot";
import { LeavingSheet } from "../../_components/LeavingSheet";
import {
  SESSION_LENGTH,
  TERMS,
  attemptFor,
  progressFor,
  questionForAttempt,
} from "../../_lib/terms";
import { saveDraft, useXpEarnedBefore } from "../../_lib/session";
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
  const question = isSayItBack ? script.question : questionForAttempt(term, attemptNumber);

  const [takeState, setTakeState] = useState<TakeState>("listening");
  // What the student has "said" so far. Starts empty and fills in while
  // listening; a scripted empty take simply never fills.
  const [transcript, setTranscript] = useState("");
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
  }

  function handleClear() {
    setTranscript("");
    setHeardWords(0);
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
    <main className="recording">
      <SessionBar
        progress={progressFor(term)}
        counterText={`${term}/${SESSION_LENGTH}`}
        xpLabel={`${xpBefore} XP`}
        onClose={() => setLeavingSheetOpen(true)}
      />

      <div className="recording__body">
        <MascotSlot size="2XL" pose="standby" />

        <div className="recording__bubble">
          <p className="recording__question">{question}</p>
        </div>

        <div className="recording__transcript">
          {isPaused ? (
            <textarea
              className="recording__transcript-input"
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              rows={2}
              aria-label="Your answer"
            />
          ) : (
            <p
              className={`recording__transcript-text${
                hasWords
                  ? " recording__transcript-text--live"
                  : " recording__transcript-text--waiting"
              }`}
              aria-live="polite"
            >
              {hasWords ? live : "Start explaining — your words appear here."}
            </p>
          )}
        </div>

        <div className="recording__spacer" />

        {isPaused ? <p className="recording__stage-label">Paused</p> : null}

        <div className="recording__record-row">
          {isPaused ? (
            <button
              type="button"
              className="recording__side-button"
              aria-label="Clear answer"
              disabled={!hasWords}
              onClick={handleClear}
            >
              <IconSlot size="250" icon={<Trash2 size="100%" strokeWidth={2} aria-hidden="true" />} />
            </button>
          ) : (
            <span className="recording__side-spacer" aria-hidden="true" />
          )}

          <RecordingControl
            state={isPaused ? "Paused" : "Listening"}
            text={isPaused ? "Tap to resume" : "Tap to send"}
            onClick={() => (isPaused ? setTakeState("listening") : handleSend())}
          />

          {!isPaused ? (
            <button
              type="button"
              className="recording__side-button"
              aria-label="Pause"
              onClick={handlePause}
            >
              <IconSlot size="250" icon={<Pause size="100%" strokeWidth={2} aria-hidden="true" />} />
            </button>
          ) : (
            <span className="recording__side-spacer" aria-hidden="true" />
          )}
        </div>

        {isPaused ? (
          <button type="button" className="recording__send" onClick={handleSend}>
            Send
          </button>
        ) : null}

        <button type="button" className="recording__type-instead" onClick={handleTypeInstead}>
          Type instead
        </button>
      </div>

      <LeavingSheet
        open={leavingSheetOpen}
        onKeepGoing={() => setLeavingSheetOpen(false)}
        onExit={() => router.push("/course/biology/plan")}
      />
    </main>
  );
}
