"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SessionBar } from "@/components/SessionBar/SessionBar";
import { LeavingSheet } from "../../_components/LeavingSheet";
import { KnowieAsks } from "../../_components/KnowieAsks";
import { MicPermissionSheet } from "../../_components/MicPermissionSheet";
import { AnswerControls } from "../../_components/AnswerControls";
import { SESSION_LENGTH, TERMS, progressFor } from "../../_lib/terms";
import { takeHint, useXpEarnedBefore } from "../../_lib/session";
import { claimKeyboard } from "../../_lib/keyboard";
import "./prompt.css";

export default function PromptPage() {
  const params = useParams<{ term: string }>();
  const router = useRouter();
  const term = Number(params.term);
  const script = TERMS[term] ?? TERMS[1];
  const [leavingSheetOpen, setLeavingSheetOpen] = useState(false);
  // The primer is a first-encounter moment, so it appears on term 1 only —
  // re-priming something already "granted" on every term would be friction
  // the real flow wouldn't have.
  const [primerOpen, setPrimerOpen] = useState(false);
  const xpBefore = useXpEarnedBefore(term);

  function handleMicTap() {
    if (term === 1) {
      setPrimerOpen(true);
      return;
    }
    router.push(`/recall/${term}/recording`);
  }

  function handleHint() {
    takeHint(term, 1);
    router.push(`/recall/${term}/result?attempt=1`);
  }

  function handleTypeInstead() {
    // Claimed inside the tap; anything async first loses the gesture and
    // the keyboard never opens.
    claimKeyboard();
    router.push(`/recall/${term}/text`);
  }

  return (
    <main className="prompt">
      <SessionBar
        progress={progressFor(term)}
        counterText={`${term}/${SESSION_LENGTH}`}
        xpLabel={`${xpBefore} XP`}
        onClose={() => setLeavingSheetOpen(true)}
      />

      <div className="prompt__body">
        <div className="prompt__spacer" />
        <KnowieAsks question={script.question} />
        <div className="prompt__spacer" />

        <AnswerControls
          onMic={handleMicTap}
          onTypeInstead={handleTypeInstead}
          onHint={handleHint}
        />
      </div>

      <MicPermissionSheet
        open={primerOpen}
        onAllow={() => router.push(`/recall/${term}/recording`)}
        onTypeInstead={() => {
          claimKeyboard();
          router.push(`/recall/${term}/text`);
        }}
        onDismiss={() => setPrimerOpen(false)}
      />

      <LeavingSheet
        open={leavingSheetOpen}
        onKeepGoing={() => setLeavingSheetOpen(false)}
        onExit={() => router.push("/course/biology/plan")}
      />
    </main>
  );
}
