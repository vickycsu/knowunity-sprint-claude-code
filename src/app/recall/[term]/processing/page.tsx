"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { SessionBar } from "../../../../components/SessionBar/SessionBar";
import { MascotSlot } from "../../../../components/MascotSlot/MascotSlot";
import { SkeletonLine } from "../../../../components/SkeletonLine/SkeletonLine";
import { LeavingSheet } from "@/app/recall/_components/LeavingSheet";
import { SESSION_LENGTH, progressFor, xpEarnedBefore } from "@/app/recall/_lib/terms";
import "./processing.css";

// Dev-only, undocumented: no scripted outcome data exists yet to drive a
// genuinely slow term, and neither SPEC.md nor a Figma frame specifies one.
// ?slow=1 previews the "taking a moment" state on demand until real per-term
// timing exists.
const NORMAL_DELAY_MS = 2500;
const SLOW_THRESHOLD_MS = 4000;
const SLOW_DELAY_MS = 6000;

export default function ProcessingPage() {
  const params = useParams<{ term: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSlow = searchParams.get("slow") === "1";
  const attempt = searchParams.get("attempt") ?? "1";

  const term = Number(params.term);
  const [takingAMoment, setTakingAMoment] = useState(false);
  const [leavingSheetOpen, setLeavingSheetOpen] = useState(false);

  useEffect(() => {
    const totalDelay = isSlow ? SLOW_DELAY_MS : NORMAL_DELAY_MS;

    const slowTimer = isSlow
      ? setTimeout(() => setTakingAMoment(true), SLOW_THRESHOLD_MS)
      : undefined;

    const navigateTimer = setTimeout(() => {
      router.push(`/recall/${term}/result?attempt=${attempt}`);
    }, totalDelay);

    return () => {
      if (slowTimer) clearTimeout(slowTimer);
      clearTimeout(navigateTimer);
    };
  }, [isSlow, router, term, attempt]);

  return (
    <main className="processing">
      <SessionBar
        progress={progressFor(term)}
        counterText={`${term}/${SESSION_LENGTH}`}
        xpLabel={`${xpEarnedBefore(term)} XP`}
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
