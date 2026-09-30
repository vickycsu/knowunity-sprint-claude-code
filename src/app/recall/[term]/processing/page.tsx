"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SessionBar } from "@/components/SessionBar/SessionBar";
import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import { SkeletonLine } from "@/components/SkeletonLine/SkeletonLine";
import { LeavingSheet } from "@/app/recall/_components/LeavingSheet";
import { SESSION_LENGTH, TERMS, attemptFor, progressFor } from "@/app/recall/_lib/terms";
import { readDraft, saveAttempt, useXpEarnedBefore } from "@/app/recall/_lib/session";
import "./processing.css";

// Outcomes are prepopulated, so the wait is held open deliberately:
// voice-ux.md principle 6 treats the "thinking" beat as part of the
// interaction, and collapsing it to zero would make Knowie's reply land
// before the student has finished reading their own answer.
const THINKING_MS = 1600;
const SLOW_THRESHOLD_MS = 4000;
// ?slow=1 previews the "still thinking" state on demand. Dev-only.
const SLOW_DELAY_MS = 6000;

export default function ProcessingPage() {
  const params = useParams<{ term: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSlow = searchParams.get("slow") === "1";
  const attempt = searchParams.get("attempt") ?? "1";
  const isSayItBack = attempt === "sayback";

  const term = Number(params.term);
  const [takingAMoment, setTakingAMoment] = useState(false);
  const [leavingSheetOpen, setLeavingSheetOpen] = useState(false);
  const xpBefore = useXpEarnedBefore(term);
  // Grading consumes the draft, so it has to happen exactly once — React
  // runs effects twice in development, and a second pass would find no draft
  // and regrade the answer as empty. The ref gates the write only; the
  // timers below are set on every pass, since the first pass's cleanup
  // tears them down again.
  const gradedRef = useRef<number | null>(null);

  useEffect(() => {
    if (gradedRef.current === null) {
      const draft = readDraft();
      const attemptNumber = draft?.attemptNumber ?? (isSayItBack ? TERMS[term].attempts.length : Number(attempt));
      const source = draft?.source ?? "voice";
      gradedRef.current = attemptNumber;

      if (isSayItBack) {
        // Unaided practice is ungraded and always advances — it still passes
        // through this thinking state, but there is no verdict to reach.
        saveAttempt(
          term,
          { attemptNumber, transcript: draft?.transcript ?? "", source, verdict: "pass", bubbleCopy: "" },
          false,
        );
      } else {
        let scripted = attemptFor(term, attemptNumber);
        // "Nothing was captured" is a microphone beat. A student who typed
        // an answer plainly did give one, so the typed path skips past a
        // scripted empty take to the next real outcome.
        if (source === "text" && scripted.verdict === "empty") {
          scripted = attemptFor(term, attemptNumber + 1);
          gradedRef.current = attemptNumber + 1;
        }
        saveAttempt(
          term,
          {
            attemptNumber: gradedRef.current,
            // Their own words when they typed; the scripted take when they spoke.
            transcript: source === "text" ? (draft?.transcript ?? "") : scripted.transcript,
            source,
            verdict: scripted.verdict,
            bubbleCopy: scripted.bubbleCopy,
            caption: scripted.caption,
          },
          // "empty" and the two hints leave the term open for a retry; only
          // a pass or a reveal closes it.
          scripted.verdict === "pass" || scripted.verdict === "reveal",
        );
      }
    }

    const graded = gradedRef.current;
    const totalDelay = isSlow ? SLOW_DELAY_MS : THINKING_MS;
    const slowTimer = isSlow
      ? setTimeout(() => setTakingAMoment(true), SLOW_THRESHOLD_MS)
      : undefined;

    const navigateTimer = setTimeout(() => {
      if (isSayItBack) {
        if (term >= SESSION_LENGTH) router.push("/recall/summary");
        else router.push(`/recall/${term + 1}/prompt`);
      } else {
        router.push(`/recall/${term}/result?attempt=${graded}`);
      }
    }, totalDelay);

    return () => {
      if (slowTimer) clearTimeout(slowTimer);
      clearTimeout(navigateTimer);
    };
  }, [attempt, isSayItBack, isSlow, router, term]);

  return (
    <main className="processing">
      <SessionBar
        progress={progressFor(term)}
        counterText={`${term}/${SESSION_LENGTH}`}
        xpLabel={`${xpBefore} XP`}
        onClose={() => setLeavingSheetOpen(true)}
      />

      <div className="processing__body">
        <div className="processing__spacer" />
        <MascotSlot size="2XL" pose="thinking" />
        <div className="processing__bubble">
          <SkeletonLine width="262px" />
          <SkeletonLine width="197px" />
        </div>
        <div className="processing__spacer" />
        <p className="processing__caption">
          {takingAMoment ? "Still thinking..." : "Knowie is reading your answer"}
        </p>
      </div>

      <LeavingSheet
        open={leavingSheetOpen}
        onKeepGoing={() => setLeavingSheetOpen(false)}
        onExit={() => router.push("/course/biology/plan")}
      />
    </main>
  );
}
