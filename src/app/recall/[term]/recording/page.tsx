"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Pause, Trash2 } from "lucide-react";
import { SessionBar } from "@/components/SessionBar/SessionBar";
import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import { RecordingControl } from "@/components/RecordingControl/RecordingControl";
import { IconSlot } from "@/components/IconSlot/IconSlot";
import { LeavingSheet } from "../../_components/LeavingSheet";
import { SESSION_LENGTH, TERMS, progressFor, questionForAttempt, xpEarnedBefore } from "../../_lib/terms";
import "./recording.css";

type TakeState = "listening" | "paused";

const SAY_IT_BACK_TRANSCRIPT =
  "Letting me try that again in my own words: it's selectively permeable, so small molecules pass through and larger ones need a channel.";

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
    : (script.attempts[attemptNumber - 1] ?? script.attempts[0]).transcript;
  const question = questionForAttempt(term, attemptNumber);

  const [takeState, setTakeState] = useState<TakeState>("listening");
  const [transcript, setTranscript] = useState(scriptedTranscript);
  const [leavingSheetOpen, setLeavingSheetOpen] = useState(false);

  function handleCancelAndRerecord() {
    setTranscript(scriptedTranscript);
    setTakeState("listening");
  }

  function handleSend() {
    if (isSayItBack) {
      // Unaided practice — always advances regardless of what was said,
      // per sprint-context.md. No Processing/Result step for this take.
      if (term >= SESSION_LENGTH) {
        router.push("/recall/summary");
      } else {
        router.push(`/recall/${term + 1}/prompt`);
      }
      return;
    }
    router.push(`/recall/${term}/processing?attempt=${attemptNumber}`);
  }

  return (
    <main className="recording">
      <SessionBar
        progress={progressFor(term)}
        counterText={`${term}/${SESSION_LENGTH}`}
        xpLabel={`${xpEarnedBefore(term)} XP`}
        onClose={() => setLeavingSheetOpen(true)}
      />

      <div className="recording__body">
        <MascotSlot size="2XL" pose="standby" />

        <div className="recording__bubble">
          <p className="recording__question">{question}</p>
        </div>

        <div className="recording__transcript">
          {takeState === "listening" ? (
            <p className="recording__transcript-text recording__transcript-text--live">{transcript}</p>
          ) : (
            <textarea
              className="recording__transcript-input"
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              rows={2}
            />
          )}
        </div>

        <div className="recording__spacer" />

        {takeState === "paused" ? <p className="recording__stage-label">Paused</p> : null}

        <div className="recording__record-row">
          {takeState === "paused" ? (
            <button
              type="button"
              className="recording__side-button"
              aria-label="Cancel and re-record"
              onClick={handleCancelAndRerecord}
            >
              <IconSlot size="250" icon={<Trash2 size="100%" strokeWidth={2} aria-hidden="true" />} />
            </button>
          ) : (
            <span className="recording__side-spacer" aria-hidden="true" />
          )}

          <RecordingControl
            state={takeState === "listening" ? "Listening" : "Paused"}
            text={takeState === "listening" ? "Tap to send" : "Tap to resume"}
            onClick={() =>
              takeState === "listening" ? handleSend() : setTakeState("listening")
            }
          />

          {takeState === "listening" ? (
            <button
              type="button"
              className="recording__side-button"
              aria-label="Pause"
              onClick={() => setTakeState("paused")}
            >
              <IconSlot size="250" icon={<Pause size="100%" strokeWidth={2} aria-hidden="true" />} />
            </button>
          ) : (
            <span className="recording__side-spacer" aria-hidden="true" />
          )}
        </div>

        {takeState === "paused" ? (
          <button type="button" className="recording__send" onClick={handleSend}>
            Send
          </button>
        ) : null}
      </div>

      <LeavingSheet
        open={leavingSheetOpen}
        onKeepGoing={() => setLeavingSheetOpen(false)}
        onExit={() => router.push("/course/biology/plan")}
      />
    </main>
  );
}
