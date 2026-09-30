"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Keyboard } from "lucide-react";
import { SessionBar } from "@/components/SessionBar/SessionBar";
import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import { IconSlot } from "@/components/IconSlot/IconSlot";
import { MicIcon } from "@/components/icons/MicIcon";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { InfoCircleIcon } from "@/components/icons/InfoCircleIcon";
import { AlertCircleIcon } from "@/components/icons/AlertCircleIcon";
import { Button } from "@/components/Button/Button";
import { LeavingSheet } from "../../_components/LeavingSheet";
import {
  SESSION_LENGTH,
  TERMS,
  progressFor,
  questionForAttempt,
  type Verdict,
} from "../../_lib/terms";
import { readAttempt, skipTerm, useAttempt, useXpThrough } from "../../_lib/session";
import { claimKeyboard } from "../../_lib/keyboard";
import "./result.css";

const VERDICT_META: Record<Verdict, { label: string; icon: ReactNode; tone: string } | null> = {
  pass: { label: "Correct", icon: <CheckIcon />, tone: "success" },
  hint1: { label: "Almost there", icon: <InfoCircleIcon />, tone: "partial" },
  hint2: { label: "Try again", icon: <AlertCircleIcon />, tone: "error" },
  reveal: null,
  empty: null,
};

export default function ResultPage() {
  const params = useParams<{ term: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const term = Number(params.term);
  const attemptNumber = Number(searchParams.get("attempt") ?? "1");

  const nextTerm = term + 1;
  const isLastTerm = term >= SESSION_LENGTH;
  const nextScript = TERMS[nextTerm];

  const [leavingSheetOpen, setLeavingSheetOpen] = useState(false);
  // The graded attempt was written by Processing and read back from the
  // session store, so this screen renders the verdict for the answer that
  // was actually given.
  const attempt = useAttempt(term, attemptNumber);
  const emptyQuestion = questionForAttempt(term, attemptNumber);

  const verdict = attempt?.verdict ?? "empty";
  const verdictMeta = VERDICT_META[verdict];
  // Progress advances on any terminal verdict — a reveal resolves the term
  // exactly as a pass does. Hints and empty takes leave it open.
  const isResolved = verdict === "pass" || verdict === "reveal";
  const xp = useXpThrough(term, isResolved);

  // Landing here without a graded attempt means a reload or a hand-typed URL,
  // not a real turn — send them back to the question rather than showing a
  // verdict for an answer nobody gave.
  useEffect(() => {
    if (readAttempt(term, attemptNumber)) return;
    router.replace(`/recall/${term}/prompt`);
  }, [attemptNumber, router, term]);

  function handleAdvance() {
    if (isLastTerm) router.push("/recall/summary");
    else router.push(`/recall/${nextTerm}/prompt`);
  }

  function handleSkip() {
    skipTerm(term);
    handleAdvance();
  }

  function handleRetry() {
    router.push(`/recall/${term}/recording?attempt=${attemptNumber + 1}`);
  }

  return (
    <main className="result">
      <SessionBar
        progress={progressFor(isResolved ? nextTerm : term)}
        counterText={`${Math.min(isResolved ? nextTerm : term, SESSION_LENGTH)}/${SESSION_LENGTH}`}
        xpLabel={`${xp} XP`}
        onClose={() => setLeavingSheetOpen(true)}
      />

      <div className="result__body">
        <MascotSlot size="2XL" pose="standby" />

        {verdictMeta ? (
          <div className={`result__verdict result__verdict--${verdictMeta.tone}`}>
            <IconSlot size="150" icon={verdictMeta.icon} />
            <span className="result__verdict-label">{verdictMeta.label}</span>
          </div>
        ) : null}

        {/* The student's own words, verbatim from the transcript, so a
            misheard answer reads as "it misheard me" rather than "I failed". */}
        {verdict !== "pass" && verdict !== "empty" && attempt?.transcript ? (
          <p className={`result__quote${verdict === "reveal" ? " result__quote--reveal" : ""}`}>
            &ldquo;{attempt.transcript}&rdquo;
          </p>
        ) : null}

        {verdict === "empty" ? (
          <>
            <div className="result__bubble">
              <p className="result__copy">{emptyQuestion}</p>
            </div>
            <div className="result__empty-transcript">We didn&rsquo;t catch anything.</div>
          </>
        ) : (
          <div className="result__bubble">
            <p className="result__copy">{attempt?.bubbleCopy ?? ""}</p>
            {verdict === "pass" && !isLastTerm && nextScript ? (
              <p className="result__copy">Moving on. {nextScript.question}</p>
            ) : null}
          </div>
        )}

        <div className="result__spacer" />

        {verdict === "empty" ? (
          <div className="result__actions">
            <Button cta="Record again" variant="Primary" size="L" onClick={handleRetry} />
            <button
              type="button"
              className="result__link"
              onClick={() => {
                  claimKeyboard();
                  router.push(`/recall/${term}/text`);
                }}
            >
              Type instead
            </button>
          </div>
        ) : verdict === "reveal" ? (
          // Caption above a mic, matching the hint and pass rows and the
          // live app's own revealed-answer screen — a filled primary button
          // read as a different kind of action from every other "answer
          // this" moment in the loop, when it is the same one.
          <>
            <p className="result__caption">Try it in your own words</p>
            <div className="result__mic-row">
              <button
                type="button"
                className="result__mic"
                aria-label="Start speaking"
                onClick={() => router.push(`/recall/${term}/recording?attempt=sayback`)}
              >
                <IconSlot size="400" icon={<MicIcon />} />
              </button>
              <button
                type="button"
                className="result__type-instead"
                aria-label="Type instead"
                onClick={() => {
                  claimKeyboard();
                  router.push(`/recall/${term}/text?attempt=sayback`);
                }}
              >
                <IconSlot size="250" icon={<Keyboard size="100%" strokeWidth={2} aria-hidden="true" />} />
              </button>
            </div>
            <button type="button" className="result__skip" onClick={handleAdvance}>
              Next question
            </button>
          </>
        ) : verdict === "hint1" || verdict === "hint2" ? (
          <>
            {attempt?.caption ? <p className="result__caption">{attempt.caption}</p> : null}
            <div className="result__mic-row result__mic-row--hint">
              <button
                type="button"
                className="result__mic result__mic--hint"
                aria-label="Start speaking"
                onClick={handleRetry}
              >
                <IconSlot size="400" icon={<MicIcon />} />
              </button>
              {/* Figma's hint frames draw the mic alone, with no keyboard
                  affordance. Added anyway: voice-ux.md's "always offer a
                  non-voice path" is a hard rule, and a retry is exactly
                  where a student who can't speak gets stuck. Flagged in
                  component-gaps.md. */}
              <button
                type="button"
                className="result__type-instead"
                aria-label="Type instead"
                onClick={() => {
                  claimKeyboard();
                  router.push(`/recall/${term}/text?attempt=${attemptNumber + 1}`);
                }}
              >
                <IconSlot size="250" icon={<Keyboard size="100%" strokeWidth={2} aria-hidden="true" />} />
              </button>
            </div>
            <button type="button" className="result__skip" onClick={handleSkip}>
              Skip question
            </button>
          </>
        ) : isLastTerm || !nextScript ? (
          <Button cta="Continue" variant="Primary" size="L" onClick={handleAdvance} />
        ) : (
          <>
            <div className="result__mic-row">
              <button
                type="button"
                className="result__mic"
                aria-label="Start speaking"
                onClick={() => router.push(`/recall/${nextTerm}/recording`)}
              >
                <IconSlot size="400" icon={<MicIcon />} />
              </button>
              <button
                type="button"
                className="result__type-instead"
                aria-label="Type instead"
                onClick={() => {
                  claimKeyboard();
                  router.push(`/recall/${nextTerm}/text`);
                }}
              >
                <IconSlot size="250" icon={<Keyboard size="100%" strokeWidth={2} aria-hidden="true" />} />
              </button>
            </div>

            <button type="button" className="result__skip" onClick={handleSkip}>
              Skip question
            </button>
          </>
        )}
      </div>

      <LeavingSheet
        open={leavingSheetOpen}
        onKeepGoing={() => setLeavingSheetOpen(false)}
        onExit={() => router.push("/course/biology/plan")}
      />
    </main>
  );
}
