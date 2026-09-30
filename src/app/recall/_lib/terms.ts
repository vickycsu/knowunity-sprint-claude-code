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
  /**
   * The concept this term tests, as the Summary and the study plan name it.
   * Title Case, matching every other concept name in this prototype.
   */
  name: string;
  question: string;
  attempts: Attempt[];
  /** Shown as "The answer" in the Summary when this concept is flagged. */
  answer: string;
  /** Shown in the Summary's "Explain more" sheet. */
  explainMore: { term: string; copy: string }[];
}

// Per-term scripted content. The spoken answers are prepopulated: tapping the
// mic replays the scripted take for that term and attempt rather than
// transcribing live. Term 1 (empty -> pass), term 2 (hint1 -> hint2 ->
// reveal), and term 1's original question all match Figma's actual authored
// copy ("Screen 04/07/11" for term 1, "Screen 08/09/10" for term 2's hint
// flow). Terms 3-4 are single-pass placeholders pending their own screens.
export const TERMS: Record<number, TermScript> = {
  1: {
    name: "Plasma Membrane",
    question: "In your own words, what does the cell membrane do?",
    answer:
      "the membrane surrounds the cell and controls what enters and leaves it, because it's selectively permeable.",
    explainMore: [
      {
        term: "Plasma membrane",
        copy: "The layer around a cell that holds it together and controls what enters and leaves.",
      },
      {
        term: "Selectively permeable",
        copy: "Letting some things through and holding others back, rather than everything or nothing.",
      },
    ],
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
    name: "Membrane Permeability",
    question: "In your own words, what does the cell membrane do?",
    answer:
      "the membrane is selectively permeable. Small molecules pass, larger ones need a protein channel.",
    explainMore: [
      {
        term: "Selectively permeable",
        copy: "Letting some things through and holding others back, rather than everything or nothing.",
      },
      {
        term: "Protein channel",
        copy: "A passage through the membrane for molecules too large to slip across on their own.",
      },
    ],
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
    name: "Osmosis",
    question: "In your own words, what is osmosis?",
    answer:
      "osmosis is water moving across a membrane from where there's more water to where there's less.",
    explainMore: [
      {
        term: "Osmosis",
        copy: "Water moving across a membrane, from where there is more water to where there is less.",
      },
      {
        term: "Semi-permeable membrane",
        copy: "A barrier that lets some things through and holds others back.",
      },
    ],
    attempts: [
      {
        verdict: "pass",
        transcript: "It's when water moves across a membrane from an area with more water to an area with less.",
        bubbleCopy: "That's it exactly.",
      },
    ],
  },
  4: {
    name: "Membrane Transport",
    question: "In your own words, how do substances move across the cell membrane?",
    answer:
      "small molecules diffuse straight through, larger ones use protein channels, and moving something against its gradient costs energy.",
    explainMore: [
      {
        term: "Diffusion",
        copy: "Molecules spreading from where they are crowded to where they are not, with no energy spent.",
      },
      {
        term: "Active transport",
        copy: "Moving a substance against its gradient, which the cell has to spend energy to do.",
      },
    ],
    attempts: [
      {
        verdict: "pass",
        transcript: "Small molecules move through channels or pumps, and some need energy to cross.",
        bubbleCopy: "Exactly right.",
      },
    ],
  },
};

/** The scripted take for a term and attempt, clamped to what the script has. */
export function attemptFor(term: number, attemptNumber: number): Attempt {
  const script = TERMS[term] ?? TERMS[1];
  return script.attempts[attemptNumber - 1] ?? script.attempts[script.attempts.length - 1];
}

/**
 * The question shown on Recording (and, for a first attempt, Prompt).
 * Attempt 1 gets the term's original question; each retry after a hint gets
 * the previous attempt's response, which already embeds the narrower
 * follow-up question. A retry after "empty" re-shows the original, since
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
