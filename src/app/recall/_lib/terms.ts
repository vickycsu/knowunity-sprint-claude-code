import type { ProgressIndicatorProgress } from "@/components/ProgressIndicator/ProgressIndicator";

export const SESSION_LENGTH = 4;

export type Verdict = "pass" | "hint1" | "hint2" | "reveal" | "empty";

export interface Attempt {
  verdict: Verdict;
  /** What the student is scripted to have said this attempt. Empty string for "empty". */
  transcript: string;
  /** Knowie's response, shown in the Result screen's bubble. Unused for "empty" — that state re-shows the question instead of a response, since there's nothing to respond to. */
  bubbleCopy: string;
  /** Small caption above the mic row on hint Result screens (hint1/hint2 only). */
  caption?: string;
}

export interface TermScript {
  question: string;
  attempts: Attempt[];
}

// Per-term scripted content. Term 1 (empty -> pass), term 2 (hint1 -> hint2
// -> reveal), and term 1's original question all match Figma's actual
// authored copy ("Screen 04/07/11" for term 1, "Screen 08/09/10" for term
// 2's hint flow). Terms 3-4 are still single-pass placeholders pending
// their own screens, same draft status as before.
export const TERMS: Record<number, TermScript> = {
  1: {
    question: "In your own words, what does the cell membrane do?",
    attempts: [
      {
        verdict: "empty",
        transcript: "",
        bubbleCopy: "",
      },
      {
        verdict: "pass",
        transcript: "It protects the cell and regulates the transport of materials coming in and exiting the cell.",
        bubbleCopy: "That's exactly right.",
      },
    ],
  },
  2: {
    question: "In your own words, what does the cell membrane do?",
    attempts: [
      {
        verdict: "hint1",
        transcript: "It controls what goes in and out of the cell.",
        bubbleCopy:
          "That's correct, but let's get more specific. How does the cell membrane decide what can enter and leave the cell?",
        caption: "Let's try again",
      },
      {
        verdict: "hint2",
        transcript: "It lets small molecules through.",
        bubbleCopy:
          "You got that it lets small molecules through. But what makes the membrane let some things through and not others?",
        caption: "Tap to answer",
      },
      {
        verdict: "reveal",
        transcript: "I'm not sure how it decides what to let through.",
        bubbleCopy:
          "Here's the piece you were missing: the membrane is selectively permeable. Small molecules pass, larger ones need a protein channel.",
      },
    ],
  },
  3: {
    question: "In your own words, what is osmosis?",
    attempts: [
      {
        verdict: "pass",
        transcript: "It's when water moves across a membrane from an area with more water to an area with less.",
        bubbleCopy: "That's it exactly.",
      },
    ],
  },
  4: {
    question: "In your own words, how do substances move across the cell membrane?",
    attempts: [
      {
        verdict: "pass",
        transcript: "Small molecules move through channels or pumps, and some need energy to cross.",
        bubbleCopy: "Exactly right.",
      },
    ],
  },
};

// XP earned once a term fully resolves, per sprint-context.md: 25 pass, 10
// hinted, 0 revealed/skipped/empty. "Empty" only ever appears as a
// mid-term attempt (never a term's *last* attempt in any script built so
// far — it always leads to a retry), so this value isn't exercised yet
// either, but it's here for when a term ends on an unrecovered empty take.
const XP_BY_VERDICT: Record<Verdict, number> = {
  pass: 25,
  hint1: 0,
  hint2: 0,
  reveal: 0,
  empty: 0,
};

function finalVerdict(term: number): Verdict {
  const script = TERMS[term];
  const last = script?.attempts[script.attempts.length - 1];
  return last?.verdict ?? "pass";
}

/** Total XP from every term strictly before `term` (i.e. already resolved). */
export function xpEarnedBefore(term: number): number {
  let total = 0;
  for (let t = 1; t < term; t += 1) {
    total += XP_BY_VERDICT[finalVerdict(t)];
  }
  return total;
}

/** XP `term` itself contributes once its last scripted attempt resolves. */
export function xpForTerm(term: number): number {
  return XP_BY_VERDICT[finalVerdict(term)];
}

/**
 * The question shown in Recording's (and, for a first attempt, Prompt's)
 * bubble. Attempt 1 gets the term's original question; each retry after a
 * hint gets the *previous* attempt's full response, since that response
 * already embeds the narrower follow-up question (matching Figma's Result
 * screens, which merge the hint response and the next question into one
 * bubble rather than showing a separate "question" field per hint). A
 * retry after "empty" re-shows the same original question instead, since
 * there was no response to embed a follow-up in.
 */
export function questionForAttempt(term: number, attemptNumber: number): string {
  const script = TERMS[term] ?? TERMS[1];
  if (attemptNumber <= 1) return script.question;
  const previous = script.attempts[attemptNumber - 2];
  if (!previous || previous.verdict === "empty") return script.question;
  return previous.bubbleCopy;
}

export function progressFor(termNumber: number): ProgressIndicatorProgress {
  const stops: ProgressIndicatorProgress[] = ["0", "25", "50", "75", "100"];
  return stops[Math.min(Math.max(termNumber - 1, 0), stops.length - 1)];
}
