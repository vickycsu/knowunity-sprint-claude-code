# Scorecard 02 — Knowunity voice recall prototype

Second full panel run, same method as `eval/scorecard-01.md`: three adversarial critics (Craft/
Structure, System fidelity/Coherence, UX judgment/Accessibility) ran blind, in separate contexts,
each given only the rubric and 18 real dark-mode 390×844 Playwright renders of every state that
exists in the built code — no critic saw another critic's output, another run's output, or the
render/compare pass below. A fourth, non-adversarial critic (Ambition) scored separately; its
score is informational and excluded from the weighted total.

This run is against the code as it stands **after** the two hard-gate fixes made following
scorecard-01 (the `text.tertiary`→`text.secondary` swap on Result: empty, and the 44×44 touch
targets on `.prompt__skip`/`.result__skip`/`.result__link`). Screenshots for this run are a fresh
capture (`shots2/`), not reused from the first pass. `scorecard-01.md` is left untouched as the
original baseline.

> **Update, same session:** the hard gate below that failed (Summary row icons) was fixed
> immediately after this scorecard was written, before any other finding — per the rule that a
> failed gate gets fixed first regardless of score. Two System-fidelity findings (the stale
> `component-gaps.md` entries for the gradient and mic-button-size tokens) were also closed out,
> since they were cheap (a doc edit, not a code change) and high-impact (a gap log a reader can't
> trust is worse than no gap log). See each row for what changed. The weighted total and
> per-dimension scores above are left as originally graded; nothing else in this scorecard was
> touched.

## Total: 5.0 / 10 (weighted)

`(7×3 + 6×3 + 4×3 + 2×3 + 6×2 + 6×1) / 15 = 75/15 = 5.0`

| Dimension | Weight | Score (01 → 02) | Weighted contribution |
| --- | --- | --- | --- |
| System fidelity | High | 6 → **7**/10 | 21 |
| Coherence | High | 6 → **6**/10 | 18 |
| Craft | High | 5 → **4**/10 | 12 |
| UX judgment | High | 3 → **2**/10 | 6 |
| Accessibility | Medium | 3 → **6**/10 | 12 |
| Structure | Low | 7 → **6**/10 | 6 |
| **Total** | | **4.9 → 5.0** | 75/150 |
| Ambition (informational) | — | 6 → **6**/10 | — |

Read the movement carefully — it isn't all "the fixes worked":

- **Accessibility rose 3→6** almost entirely because of the two hard-gate fixes: both were
  independently re-verified this round by computation (not by trusting the prior scorecard), and
  both hold. But a **new** hard-gate violation surfaced this round (Summary row icons, see below),
  which is why Accessibility landed at 6, not 8+.
- **UX judgment fell 3→2.** The text-fallback dead route and the unbuilt permission primer/denied
  states were found both times, but this round's critic weighted the *combination* — "the primary
  accessibility/situational escape hatch is broken everywhere it appears" — more severely than the
  first pass did, and treated it as worse than the rubric's own worked example. This is legitimate
  re-grading, not a regression: nothing about the code got worse between runs.
- **Craft fell 5→4.** Same underlying spacer-rhythm finding as round 1, but this round's critic
  characterized it as "the layout strategy for the entire recall loop" rather than a per-screen
  issue, which the rubric's 4-band ("missing/unaddressed Must-tier defect") supports more than the
  6-band does. Also legitimate re-grading of the same evidence, not new breakage.
- **System fidelity rose 6→7** because this round's critic checked whether the two stale
  `component-gaps.md` entries flagged in round 1 (the gradient token, the mic-button size token)
  were *actually* still stale — and found both have real tokens now (`accent.brand.ring-gradient`,
  `size.illustration.1100`/`1300`) that are correctly consumed in code. The code was already
  compliant; only the gap log was behind. That's a documentation defect, not a code defect, which
  is why it moved the score up rather than down.

Take from this: **adversarial LLM critics are not perfectly deterministic scorers** — the same
code, graded twice, produced a ±1 swing on four of six dimensions from re-weighting identical or
near-identical evidence, not from the code changing. Treat the weighted total as a band (roughly
4.9–5.0 here), not a precise number, and trust the underlying findings — which stayed almost
entirely consistent between runs — more than the score.

---

## Hard gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Contrast ≥ 4.5:1 on actual rendered background | **PASSED** (independently re-verified) | `result.css:79-83` now uses `text.secondary` (`alpha.light-68`) on `background.input`. This round's critic independently computed the luminance/contrast from `tokens.json`'s actual hex/alpha values rather than trusting the code comment or the prior scorecard: `text.tertiary` on `background.input` ≈4.51:1 (confirming it was right on the line, matching round 1's fix rationale), `text.secondary` on the same background ≈7.72:1 — a comfortable, re-confirmed pass. |
| Touch targets ≥ 44×44pt | **PASSED** (independently re-verified) | `.prompt__skip`, `.result__skip`, `.result__link` confirmed at exactly `space.1100` = 44px via `tokens.json:1086-1089` cross-referenced against the CSS. `SessionBar`'s close control is a raw `44px × 44px` (not tokenized — a System-fidelity note, not an Accessibility one) but still meets the gate. |
| **NEW — No state distinguished by color alone** | **FIXED** | `SummaryCard.tsx:24-26` rendered the identical `XCloseIcon` for both the `Partial` ("Needed a hint") and `NeedsPractice` ("Needs practice") buckets — confirmed visually in `16-summary-expanded.png`, where the violet-bucket Osmosis row and the red-bucket Membrane Transport row both showed an X glyph, differing only by hue. This exact code was present in round 1 too; round 1's critics didn't surface it, round 2's did. Checked live against Figma (`figma_capture_screenshot` on "Screen 15 / Session summary", node `15666:1274`) before fixing rather than guessing a replacement icon — Figma's own frame uses a **checkmark** for "Needed a hint" rows, not an X; only "Needs practice" gets the X. Changed `Partial` from `XCloseIcon` to `CheckIcon` (already imported for `Good`) to match Figma exactly — this was a Figma-fidelity bug, not just an accessibility nicety, and the fix is a one-line component change, no new icon needed. Re-rendered and confirmed (`26-summary-icon-fixed.png`). |
| No raw hex outside `tokens/tokens.json` / `build/css/tokens.css` | **Passed** | Re-confirmed, zero hits. |
| No two semantically-distinct states render identically | **Passed** | Re-confirmed across all 18 states in `shots2/`. |

---

## Per-dimension findings (evidence, from the three adversarial critics)

### System fidelity — 7/10
- Zero raw hex, zero direct primitive-token references anywhere in `src/app`/`src/components`.
  The remaining raw px values (`RecordingControl`'s 180/140px, `SessionBar`'s 44px close,
  `result.css`'s `rgba(145,120,230,0.45)` border) are each documented, deliberate exceptions
  matching `component-gaps.md` — the "gap named, not papered over" pattern the rubric's 9-band
  describes.
- **Fixed:** two `component-gaps.md` entries were stale **in the direction of understating
  progress**: the gradient-gap entry (lines 40–52) said no token exists, but
  `accent.brand.ring-gradient` (`tokens.json:1852-1863`) does and is correctly consumed at
  `plan.css:202`. The mic-button-size entry similarly predated `size.illustration.1100`/`1300`
  (`tokens.json:1270-1285`), correctly consumed at `prompt.css:59-60` and
  `result.css:126-127,179-180`. Both entries closed out in `component-gaps.md` to say so — a cheap
  doc edit, not a code change, but high-impact: a gap log nobody can trust without re-verifying
  against the code isn't doing its job.
- **New this round:** `docs/design-system.md` states `mascotSlot` exists to let Knowie "react to
  something (correct, incorrect, listening, idle)," but `docs-show` on the live Storybook
  component confirms only `pose?: "standby" | "thinking"` are implemented — no correct/incorrect
  poses exist. Every Result screen renders `pose="standby"` regardless of verdict. This mismatch
  between the design-system doc's stated intent and the component's actual API is exactly what
  `component-gaps.md` exists to catch, and it isn't logged there.

### Coherence — 6/10
- The loop's shared instrumentation holds under trace: one `SessionBar` renders identically
  Prompt → Recording → Processing → Result; progress only advances on `verdict === "pass"`
  (`result/page.tsx:71`), confirmed static at "2/4" through hint1/hint2/reveal in `11`–`13`;
  Knowie-quotes-the-student's-words holds identically at both hint points.
- **New this round, investigated and not applicable:** this critic read hint2's `"error"` tone
  (the same `feedback.error.*` family as the terminal-fail vocabulary) and reveal's missing pill as
  a contradiction of the pass/partial/fail model. Checked directly against the live Figma file
  before treating this as a defect (`figma_capture_screenshot` on "Result: Partial", node
  `15671:10950` — Screens 8/9/10): Figma itself gives hint1 and hint2 two visually distinct pill
  colors (not the same "partial" tone twice), and Screen 10 ("Answer revealed") genuinely has no
  verdict pill at all — the built app matches Figma exactly on both counts. This finding doesn't
  hold once checked against source; not fixed, because there's nothing to fix.
- Cancel (take-level, discards the current recording) vs. the session-level close (exits
  everything) isn't legible from the UI alone: the cancel control is icon-only (a trash glyph,
  `aria-label="Cancel and re-record"` — accessible to screen readers, not to a sighted student
  reading the screen), confirmed in `05-recording-paused.png`. Two different "leave/undo"
  affordances, no visible text distinguishing them.
- Duplicated nav bar (Courses/Course/Plan, unchanged from round 1) is the same Coherence failure
  by the rubric's own definition — not re-detailed here, see scorecard-01.

### Craft — 4/10
- Confirmed strengths: mascot pose/bob and skeletonLine pulse animations exist to cover the
  Principle-6 gap; the verdict pill's subtle-fill/bold-border treatment is a deliberate inline
  build; hint copy narrows rather than repeats.
- **The bottom "dead space" pattern, reassessed as systemic rather than per-screen:** the identical
  undesigned `flex: 1 1 auto` spacer appears on every Must-tier loop screen (`prompt.css:19-21`,
  `recording.css:73-74`, `processing.css:19-20`, `result.css:109-111`, `summary.css:46-47`),
  producing 350–450px of dead vertical space regardless of content length, confirmed across `03`,
  `04`, `05`, `07`, `09`, `10`. This round's critic treats this as "the layout strategy for the
  entire recall loop," not an isolated lapse — which is why it lands in the rubric's 4-band rather
  than the 6-band this time.
- Two Must-tier states (permission primer, permission denied) entirely unbuilt — same finding as
  round 1.
- Listening→Paused seam: `component-gaps.md` itself admits the reserved vertical space above the
  record row only exists in the Paused state, so the layout visibly shifts between the two,
  self-documented as an unaddressed layout shift (confirmed `04` vs `05`).
- Recording→Processing has no transition, a flagged design-system gap (`recordingControl`'s
  documented "no transition state" note) shipped through without being addressed.

### UX judgment — 2/10
- "Type instead" 404s from every screen it appears on (Prompt idle, Result: empty, Result: pass) —
  `/recall/[term]/text/page.tsx` does not exist (`Glob` confirms only prompt/recording/processing/
  result/summary directories under `src/app/recall/[term]/`). This is voice-ux.md's Hard Rule #3
  and Principle 5 broken at the one place they're supposed to be non-negotiable, and it's
  unflagged — `component-gaps.md` references `/text` as a real destination with no caveat that it
  doesn't resolve.
- Mic permission primer and permission-denied→text, both Must-tier per sprint-context.md, are
  entirely unbuilt — the mic tap (`prompt/page.tsx:51`) skips the check altogether. Disclosed in
  `component-gaps.md`, but disclosure doesn't change the coverage failure, and combined with the
  dead `/text` route, a denied-permission student has no route to text either, since that route
  doesn't exist.
- Hint retries (hint1/hint2) drop "Type instead" entirely, leaving only Skip as an out for a
  situationally-mute student — disclosed in `component-gaps.md` as a known contradiction of
  voice-ux.md's own rule.
- What works, for calibration: Idle/Listening/Paused/Processing/Result are each visually and
  semantically distinct; the hint ladder narrows correctly at both hints (verified against actual
  attempt copy); Cancel vs. Pause are functionally distinct; the empty/silent-recording state is
  fully built, not sketched, with both "Record again" and "Type instead" (the latter still hits
  the dead route).

### Accessibility — 6/10
- **New hard-gate finding:** Summary's `Partial`/`NeedsPractice` row icons are identical
  (`SummaryCard.tsx:24-26`, both `XCloseIcon`) — see Hard gates table.
- Contrast and touch-target gates independently re-verified as passing by computation from
  `tokens.json`'s actual values, not by trusting the prior scorecard or the code comments — see
  Hard gates table.
- Result verdict pills and Listening/Paused both re-confirmed to carry redundant non-color signals
  (icon + label text; glow + icon + label), not color alone.

### Ambition — 6/10 (informational, does not count toward the total)
- Unchanged read from round 1 in substance: the build's disposition throughout
  `component-gaps.md` is "match Figma exactly, flag deviations" — valuable for System
  fidelity/Craft, but the opposite posture from the brief's "build the stronger version" mandate.
  Two real interpretive stances are credited (treating tap-to-send/pause as distinct affordances
  rather than inventing a mandatory-pause dialog; scripting term 1's empty/silent state as a live
  first attempt rather than a demo-only route).
- Result: pass and Result: fail/reveal use the identical `standby` mascot pose despite
  `docs/design-system.md` describing `mascotSlot` as meant to react "correct, incorrect" — verified
  via `docs-show` that only `standby`/`thinking` are implemented. Proposes extending `mascotSlot`
  with two more poses (a system-owner naming call, flagged as a gap rather than built silently).
- Once a term lands in "Needed a hint," nothing distinguishes a student who self-corrected via
  "Say it back" from one who never revisited it — the sayback take "always advances... regardless
  of its outcome" per `component-gaps.md`, so it can't change the bucket or leave any trace.
  Proposes a `chips` instance (`S Success True`, a real documented variant) in the already-built
  expanded-row detail panel to mark a self-corrected term.
- The Study plan's after-session "Explain it out loud" done-node uses the same violet-gradient
  ring/star treatment as any other completed topic, despite the brief framing this step as the one
  meant to feel different. Proposes a small `chips` instance on that row (e.g. "Recall complete").

---

## Render/compare pass (before critics ran, this round)

Re-rendered all 18 reachable states at 390×844, dark mode, against the running app (fresh capture,
`shots2/`), and diffed pairs that should differ. Same result as round 1: no two states that should
be visually distinct rendered identically. `/recall/[term]/text` and any permission-primer/denied
route still return 404 — unchanged, since that wasn't in scope for the fixes made between rounds.
The two patched screens (Result: empty's contrast; Prompt/Result's Skip and Type-instead touch
targets) were visually spot-checked in the fresh renders and confirmed intact with no layout
regressions.

---

## Each critic's blind spot

- **Craft/Structure:** No interaction sequences exercised (rapid double-taps, long-transcript
  reflow, non-Osmosis summary card taps) — same limitation as round 1. Also explicitly noted:
  no evidence either way on whether the app breaks under repeated/out-of-order taps, which the
  rubric's own 9-bands for both dimensions call out as the differentiator from a 6-7.
- **System fidelity/Coherence:** Couldn't confirm whether `SkeletonLine`'s pulse or `MascotSlot`'s
  thinking-bob actually run in-browser versus existing only as unapplied CSS — static screenshots
  can't show motion either way. No live click-through of Recording → Processing → Result to check
  whether the seam reads as one continuous take in real time.
- **UX judgment/Accessibility:** Contrast numbers are hand-computed from WCAG relative-luminance
  formulas using token hex/alpha values — more rigorous than eyeballing, but not the same as a
  live browser contrast tool, and only one text/surface pairing (the one sprint-context explicitly
  flags) was checked this way, not every pairing in the build. Couldn't interactively trigger the
  `/text` 404 or the mocked OS permission sheet to confirm exactly what a student sees versus
  inferring "dead end" from route-file absence.
- **Ambition:** Static PNGs only, unchanged from round 1 — motion/transition claims in
  `component-gaps.md` remain unverifiable from this method.
