"use client";

import { useSyncExternalStore } from "react";
import { SESSION_LENGTH, TERMS, type Verdict } from "./terms";

/**
 * Where a real answer lives between screens.
 *
 * Recording, Processing and Result are three separate routes, so the thing
 * the student actually said has to survive two navigations. sessionStorage
 * (not localStorage) is the right lifetime: one study session, cleared when
 * the tab closes, never carried into someone else's run of the prototype.
 */

const STORAGE_KEY = "knowunity.recall.session";

export type AnswerSource = "voice" | "text";

export interface AttemptRecord {
  attemptNumber: number;
  /** Verbatim, as transcribed or typed. */
  transcript: string;
  source: AnswerSource;
  verdict: Verdict;
  /** Knowie's reply for this attempt. */
  bubbleCopy: string;
  caption?: string;
}

export interface TermRecord {
  attempts: AttemptRecord[];
  /** Set once the term stops accepting retries. */
  resolved?: Verdict;
}

export interface Draft {
  term: number;
  attemptNumber: number;
  transcript: string;
  source: AnswerSource;
}

interface SessionState {
  terms: Record<number, TermRecord>;
  draft?: Draft;
}

const EMPTY: SessionState = { terms: {} };

// Screens subscribe to this store through useSyncExternalStore, which calls
// its snapshot getter on every render and compares by identity. Re-parsing
// the JSON each time would hand back a fresh object every render and spin
// forever, so the last parse is cached against its raw string.
let cachedRaw: string | null = null;
let cachedState: SessionState = EMPTY;

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function read(): SessionState {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  if (!raw) {
    cachedRaw = null;
    cachedState = EMPTY;
    return EMPTY;
  }
  if (raw !== cachedRaw) {
    try {
      cachedState = JSON.parse(raw) as SessionState;
      cachedRaw = raw;
    } catch {
      return EMPTY;
    }
  }
  return cachedState;
}

function write(state: SessionState): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(state);
    window.sessionStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedState = state;
  } catch {
    // Private browsing with storage blocked. The flow still runs; the
    // student just loses XP continuity across screens, which beats crashing.
  }
  listeners.forEach((listener) => listener());
}

export function resetSession(): void {
  write(EMPTY);
}

/** Recording (or the text fallback) hands the raw answer to Processing. */
export function saveDraft(draft: Draft): void {
  write({ ...read(), draft });
}

export function readDraft(): Draft | undefined {
  return read().draft;
}

/** Processing writes the graded attempt; Result reads it back. */
export function saveAttempt(term: number, record: AttemptRecord, resolved: boolean): void {
  const state = read();
  const existing = state.terms[term] ?? { attempts: [] };
  const attempts = existing.attempts.filter(
    (attempt) => attempt.attemptNumber !== record.attemptNumber,
  );
  attempts.push(record);
  attempts.sort((a, b) => a.attemptNumber - b.attemptNumber);

  state.terms[term] = {
    attempts,
    resolved: resolved ? record.verdict : existing.resolved,
  };
  delete state.draft;
  write(state);
}

export function readAttempt(term: number, attemptNumber: number): AttemptRecord | undefined {
  return read().terms[term]?.attempts.find(
    (attempt) => attempt.attemptNumber === attemptNumber,
  );
}

/** Marks a term finished without an answer — "Skip question". */
export function skipTerm(term: number): void {
  const state = read();
  const existing = state.terms[term] ?? { attempts: [] };
  state.terms[term] = { ...existing, resolved: "reveal" };
  delete state.draft;
  write(state);
}

/**
 * XP per sprint-context.md: 25 for a good explanation, 10 when it took a
 * hint to get there, 0 for a revealed or skipped answer. A pass is "hinted"
 * when it wasn't the first attempt — which is only knowable from the real
 * run, not from a script.
 */
function neededAHint(record: TermRecord): boolean {
  // Only a hint counts as needing help. An attempt that captured nothing is
  // a recording that went wrong, not a gap in what the student knew, and it
  // shouldn't cost them the "good explanation" they gave on the next try.
  return record.attempts.some(
    (attempt) => attempt.verdict === "hint1" || attempt.verdict === "hint2",
  );
}

function xpFor(record: TermRecord): number {
  if (record.resolved !== "pass") return 0;
  if (!record.attempts.some((attempt) => attempt.verdict === "pass")) return 0;
  return neededAHint(record) ? 10 : 25;
}

/** Total XP from every term before `term` — i.e. already resolved. */
export function xpEarnedBefore(term: number): number {
  const state = read();
  let total = 0;
  for (let t = 1; t < term; t += 1) {
    const record = state.terms[t];
    if (record) total += xpFor(record);
  }
  return total;
}

export function xpForTerm(term: number): number {
  const record = read().terms[term];
  return record ? xpFor(record) : 0;
}

/*
 * Session summary. Three buckets per sprint-context.md: a good explanation,
 * one that needed a hint, and one that still needs practice.
 */

export type SummaryBucket = "Good" | "Partial" | "NeedsPractice";

export interface TermOutcome {
  term: number;
  name: string;
  bucket: SummaryBucket;
  /** What the student actually said or typed, verbatim. Empty if they never answered. */
  transcript: string;
  source?: AnswerSource;
  /** Resolved without a single answered attempt — skipped, or never reached. */
  skipped: boolean;
  /** How many graded attempts it took. */
  attempts: number;
}

function outcomeFor(term: number, record: TermRecord | undefined): TermOutcome {
  const script = TERMS[term] ?? TERMS[1];
  const attempts = record?.attempts ?? [];
  const answered = attempts.filter((attempt) => attempt.transcript.trim().length > 0);
  const passing = attempts.find((attempt) => attempt.verdict === "pass");

  // An unaided pass is a good explanation; a pass that took a hint goes in
  // "Needed a hint". Everything else — a reveal, a skip, or a term the
  // student never resolved — needs practice. Mirrors the XP rule exactly,
  // so the buckets and the XP can never disagree.
  const bucket: SummaryBucket =
    record?.resolved === "pass"
      ? record && neededAHint(record)
        ? "Partial"
        : "Good"
      : "NeedsPractice";

  return {
    term,
    name: script.name,
    bucket,
    // The passing answer if there was one, otherwise their last real try.
    transcript: (passing ?? answered[answered.length - 1])?.transcript ?? "",
    source: (passing ?? answered[answered.length - 1])?.source,
    skipped: answered.length === 0,
    attempts: attempts.length,
  };
}

// useSyncExternalStore compares snapshots by identity, so the computed list
// is memoised against the raw storage string that produced it.
let summaryRaw: string | null = null;
let summaryValue: TermOutcome[] | null = null;

export function summarize(): TermOutcome[] {
  const state = read();
  if (summaryValue !== null && summaryRaw === cachedRaw) return summaryValue;
  const outcomes: TermOutcome[] = [];
  for (let term = 1; term <= SESSION_LENGTH; term += 1) {
    outcomes.push(outcomeFor(term, state.terms[term]));
  }
  summaryRaw = cachedRaw;
  summaryValue = outcomes;
  return outcomes;
}

const NO_OUTCOMES: TermOutcome[] = [];

/*
 * Hooks. sessionStorage isn't available while the server renders, so each
 * one hands React a server snapshot to hydrate against and then re-reads on
 * the client. Writes anywhere in the flow notify every subscriber, so the
 * session bar's XP updates the moment Processing grades an attempt.
 */

/** Total XP from every term before `term`. */
export function useXpEarnedBefore(term: number): number {
  return useSyncExternalStore(
    subscribe,
    () => xpEarnedBefore(term),
    () => 0,
  );
}

/** XP shown once `term` itself has resolved. */
export function useXpThrough(term: number, includeCurrent: boolean): number {
  return useSyncExternalStore(
    subscribe,
    () => xpEarnedBefore(term) + (includeCurrent ? xpForTerm(term) : 0),
    () => 0,
  );
}

/** The graded attempt Processing wrote, or null if this turn never happened. */
export function useAttempt(term: number, attemptNumber: number): AttemptRecord | null {
  return useSyncExternalStore(
    subscribe,
    () => readAttempt(term, attemptNumber) ?? null,
    () => null,
  );
}

/** Every term's outcome, in session order. @see summarize */
export function useSummary(): TermOutcome[] {
  return useSyncExternalStore(
    subscribe,
    summarize,
    () => NO_OUTCOMES,
  );
}

/**
 * An answer handed over when the student switches modality mid-turn, so a
 * garbled transcript can be fixed by typing rather than retyped from
 * scratch, and a typed draft survives a trip to the microphone and back.
 * Empty unless the stored draft belongs to exactly this turn.
 */
export function useCarriedDraft(term: number, attemptNumber: number): string {
  return useSyncExternalStore(
    subscribe,
    () => {
      const draft = read().draft;
      if (!draft || draft.term !== term || draft.attemptNumber !== attemptNumber) return "";
      return draft.transcript;
    },
    () => "",
  );
}

