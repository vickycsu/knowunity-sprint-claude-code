"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Keyboard } from "lucide-react";
import { SessionBar } from "@/components/SessionBar/SessionBar";
import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import { IconSlot } from "@/components/IconSlot/IconSlot";
import { MicIcon } from "@/components/icons/MicIcon";
import { LeavingSheet } from "../../_components/LeavingSheet";
import { MicPermissionSheet } from "../../_components/MicPermissionSheet";
import { SESSION_LENGTH, TERMS, progressFor } from "../../_lib/terms";
import { skipTerm, useXpEarnedBefore } from "../../_lib/session";
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

  function handleSkip() {
    skipTerm(term);
    if (term >= SESSION_LENGTH) {
      router.push("/recall/summary");
    } else {
      router.push(`/recall/${term + 1}/prompt`);
    }
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
        <MascotSlot size="2XL" pose="standby" />
        <div className="prompt__bubble">
          <p className="prompt__question">{script.question}</p>
        </div>
        <div className="prompt__spacer" />

        <div className="prompt__mic-row">
          <button
            type="button"
            className="prompt__mic"
            aria-label="Start speaking"
            onClick={handleMicTap}
          >
            <IconSlot size="400" icon={<MicIcon />} />
          </button>
          <button
            type="button"
            className="prompt__type-instead"
            aria-label="Type instead"
            onClick={() => {
              // Claimed inside the tap; anything async first loses the
              // gesture and the keyboard never opens.
              claimKeyboard();
              router.push(`/recall/${term}/text`);
            }}
          >
            <IconSlot size="250" icon={<Keyboard size="100%" strokeWidth={2} aria-hidden="true" />} />
          </button>
        </div>

        <button type="button" className="prompt__skip" onClick={handleSkip}>
          Skip question
        </button>
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
