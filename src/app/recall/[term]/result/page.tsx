"use client";

import { useState, type ReactNode } from "react";
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
  xpEarnedBefore,
  xpForTerm,
  type Verdict,
} from "../../_lib/terms";
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

  const script = TERMS[term] ?? TERMS[1];
  const attempt = script.attempts[attemptNumber - 1] ?? script.attempts[0];
  const verdict = attempt.verdict;
  const verdictMeta = VERDICT_META[verdict];

  const nextTerm = term + 1;
  const isLastTerm = term >= SESSION_LENGTH;
  const nextScript = TERMS[nextTerm];

  const [leavingSheetOpen, setLeavingSheetOpen] = useState(false);

  function handleAdvance() {
    if (isLastTerm) {
      router.push("/recall/summary");
    } else {
      router.push(`/recall/${nextTerm}/prompt`);
    }
  }

  function handleSkip() {
    handleAdvance();
  }

  function handleRetry() {
    router.push(`/recall/${term}/recording?attempt=${attemptNumber + 1}`);
  }

  return (
    <main className="result">
      <SessionBar
        progress={progressFor(verdict === "pass" ? nextTerm : term)}
        counterText={`${Math.min(verdict === "pass" ? nextTerm : term, SESSION_LENGTH)}/${SESSION_LENGTH}`}
        xpLabel={`${xpEarnedBefore(term) + (verdict === "pass" ? xpForTerm(term) : 0)} XP`}
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

        {verdict !== "pass" && verdict !== "empty" ? (
          <p className={`result__quote${verdict === "reveal" ? " result__quote--reveal" : ""}`}>
            &ldquo;{attempt.transcript}&rdquo;
          </p>
        ) : null}

        {verdict === "empty" ? (
          <>
            <div className="result__bubble">
              <p className="result__copy">{questionForAttempt(term, attemptNumber)}</p>
            </div>
            <div className="result__empty-transcript">We didn&rsquo;t catch anything.</div>
          </>
        ) : (
          <div className="result__bubble">
            <p className="result__copy">{attempt.bubbleCopy}</p>
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
              onClick={() => router.push(`/recall/${term}/text`)}
            >
              Type instead
            </button>
          </div>
        ) : verdict === "reveal" ? (
          <div className="result__actions">
            <Button
              cta="Try it in your own words"
              variant="Primary"
              size="L"
              onClick={() => router.push(`/recall/${term}/recording?attempt=sayback`)}
            />
            <button type="button" className="result__link" onClick={handleAdvance}>
              Next question
            </button>
          </div>
        ) : verdict === "hint1" || verdict === "hint2" ? (
          <>
            {attempt.caption ? <p className="result__caption">{attempt.caption}</p> : null}
            <div className="result__mic-row result__mic-row--hint">
              <button
                type="button"
                className="result__mic result__mic--hint"
                aria-label="Start speaking"
                onClick={handleRetry}
              >
                <IconSlot size="400" icon={<MicIcon />} />
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
                onClick={() => router.push(`/recall/${nextTerm}/text`)}
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
