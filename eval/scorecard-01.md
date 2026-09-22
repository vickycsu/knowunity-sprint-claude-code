# Scorecard 01 — Knowunity voice recall prototype

Graded against `eval/rubric.md`. Three adversarial critics (Craft/Structure, System
fidelity/Coherence, UX judgment/Accessibility) ran blind, in separate contexts, each given only
the rubric and 18 real dark-mode 390×844 Playwright renders of every state that exists in the
built code — no critic saw another critic's output, and none saw the render/compare pass below
before scoring. A fourth, non-adversarial critic (Ambition) scored separately; its score is
informational and excluded from the weighted total, per the rubric.

> **Update, same session:** both hard gates below (contrast, touch targets) were fixed after this
> scorecard was written — see each gate's row for what changed. The weighted total and
> per-dimension scores above are the *original* scores as graded and are left unchanged; they were
> not re-graded after the fix. Everything else in this scorecard (System fidelity, Coherence,
> Craft, UX judgment beyond the two gates, Accessibility beyond the two gates, Structure, Ambition)
> is still open.

## Total: 4.9 / 10 (weighted)

Weights: High = 3, Medium = 2, Low = 1 (weights are the rubric's, the numeric mapping is this
scorecard's for computing the total). `(6×3 + 6×3 + 5×3 + 3×3 + 3×2 + 7×1) / 15 = 73/15 = 4.9`

| Dimension | Weight | Score | Weighted contribution |
| --- | --- | --- | --- |
| System fidelity | High | 6/10 | 18 |
| Coherence | High | 6/10 | 18 |
| Craft | High | 5/10 | 15 |
| UX judgment | High | 3/10 | 9 |
| Accessibility | Medium | 3/10 | 6 |
| Structure | Low | 7/10 | 7 |
| **Total** | | | **73/150 → 4.9/10** |
| Ambition (informational, not in total) | — | 6/10 | — |

Two High-weight dimensions (System fidelity, Coherence) land at a real 6 — consistent, honestly
self-documented work. The other two High-weight dimensions (Craft, UX judgment) and the one
Medium dimension (Accessibility) pull the total down hard, and UX judgment specifically is
dragged to a 3 by two hard-gate-adjacent failures below. Structure's 7 is capped, not a clean 8+,
because every critic worked from static renders only.

---

## Hard gates

Per the rubric, a hard-gate failure is a defect regardless of the weighted total — it is not
averaged away.

| Gate | Result | Evidence |
| --- | --- | --- |
| Contrast ≥ 4.5:1 on actual rendered background | **FIXED** (was borderline/failing) | `text.tertiary` (`color.alpha.light-48`) on `background.input` (`color.navy.900`, `#1a1c26`) measures ≈4.51:1 with the token's exact alpha (0.4784) — a hair over the line, not a safe margin, on the Result: empty state's substantive copy ("We didn't catch anything," `result.css:68-81`), and the critic's independent math (using the rounded 48%) put it under the line entirely. Either way this is the exact trap `sprint-context.md` names by name. Swapped to `text.secondary` (`alpha.light-68`, ≈7.7:1) on this card — `result.css:68-84`. Re-rendered and confirmed no layout regression (`22-result-empty-fixed.png`). |
| Touch targets ≥ 44×44pt | **FIXED** | `.prompt__skip`, `.result__skip`, `.result__link` (`prompt.css:92-100`, `result.css:156-164`, `result.css:188-195`) were bare `padding: 0` buttons at `body-s-bold` line-height (20px) — roughly a 20px hit box, under half the minimum, on the exact controls the "never trap the student" rule depends on. Added `min-width`/`min-height: var(--color-size-space-1100)` (the token already named "Minimum touch target size" in `tokens.json`) with flex centering, so the label text is unchanged and only the hit area grows. Measured post-fix via Playwright bounding boxes: all three now report `height: 44` exactly (`prompt.css:92-105`, `result.css:156-169`, `result.css:188-199`). `SessionBar`'s close and the mic-row's icon-only Type-instead circle were already correctly sized at 44px. |
| No raw hex outside `tokens/tokens.json` / `build/css/tokens.css` | **Passed** | `grep -rnE "#[0-9a-fA-F]{3,8}" src/components src/app` (excluding `tokens.css`) returns zero hits. Note: this is narrower than System fidelity's finding — raw *pixel* values (`recording-control.css:28-38`) and a raw `rgba()` color (`result.css:77`) exist and are real System-fidelity defects, but neither is hex, so this specific gate passes on its literal wording. |
| No two semantically-distinct states render identically | **Passed** | Listening vs. Paused differ by glow, shape, label, and extra controls, not color alone (04/05). Pass/hint1/hint2/reveal differ by icon, border, and copy (10–13). Processing normal vs. slow differ only by caption text (07/08) — thin, but not identical, and not flagged as a gate failure. |

---

## Per-dimension findings (evidence, from the three adversarial critics)

### System fidelity — 6/10
- Raw non-token pixel values ship in component CSS: `RecordingControl` (`180px`/`140px`,
  `recording-control.css:28-38,64-65`), `SessionBar` close (`44px`, `session-bar.css:14-15`), and
  a raw `rgba(145,120,230,0.45)` border color (`result.css:77`) — all real values, none hex, none
  yet pushed into `tokens.json` as semantic tokens despite being named in comments.
- `component-gaps.md`'s gradient-gap entry (lines 40–52) is stale: `tokens.json:1852-1863` now
  has a real `accent.brand.ring-gradient` token, correctly consumed at `plan.css:202` — but the
  gap log still says no token exists. A reader trusting the log would re-hardcode a hex value that
  no longer needs to exist.
- Verdict pill, `appBar`, `bottomSheet`, and `textInput` gaps were verified as genuine via
  `docs-show` (not assumed) — a real strength, not a rubber-stamped gap log.
- The nav bar (Courses/Course/Plan) is hand-built three separate times with three class prefixes,
  never promoted, despite the project's own "needed twice → promote" rule already having been
  applied to `LeavingSheet` (1 reuse) and `MicIcon` (2 reuses). This already produced a real drift
  bug: the folder icon's color had to be independently corrected per screen.

### Coherence — 6/10
- The loop itself holds: one `SessionBar` instance fed by one shared `terms.ts` module renders
  identically across all 12 loop screenshots; Pause vs. Cancel are genuinely distinct; hint
  quoting is consistent at both hint points; transcript is live → editable → read-only exactly
  where the rule says it should be.
- `SessionBar` disappears entirely at Outcome (`summary/page.tsx` never imports it) with no
  completed (100%) state ever shown and no note anywhere that this is intentional — the loop's
  own tracking instrument is discarded at the exact moment its number would matter most.
- Skip silently advances progress/counter (`prompt/page.tsx` `handleSkip` → `progressFor(term+1)`
  on the next screen) even though `sprint-context.md` explicitly carves out "hints, retries, and
  edge states" as non-resolving — skip is listed as its own edge-state item, and the contradiction
  was never reconciled or flagged the way other decisions are.
- Same duplicated-nav-bar issue as System fidelity is independently a Coherence failure by the
  rubric's own definition ("screens solved locally, never reconciled").

### Craft — 5/10
- Real per-screen strengths: hint copy restates only the missing part at both hint1 and hint2
  (verified against actual copy, not assumed); the verdict pill treatment is a deliberate inline
  build, not lazy `Chips` misuse; the pass-screen's merged affirmation-and-next-question bubble is
  a genuine composed decision, not the literal spec-default separate screen.
- Two Must-tier states (permission primer, permission denied) are entirely unbuilt, not just
  unstyled — `component-gaps.md` admits this honestly, but the rubric's own 4-band names this
  failure mode directly, and it applies twice here.
- The bottom "dead space" between content and controls is an identical `flex: 1 1 auto` spacer
  pattern repeated across Recording, Result, and Processing CSS (`recording.css:73-75`,
  `result.css:105-107`, `processing.css:19-21`) — the same unbroken ~300–400px gap regardless of
  how much text sits above it. This is the rubric's textbook "default spacing, not a judged
  rhythm" pattern, applied consistently rather than per-moment.
- Processing normal vs. slow are pixel-identical except one caption line — no visual escalation
  for a state whose whole job (per voice-ux Principle 6) is active reassurance.
- Hint screens drop "Type instead" (88px mic-only button vs. the 104px mic+keyboard pair
  everywhere else) — flagged in `component-gaps.md` but never resolved in the UI.

### UX judgment — 3/10
- "Type instead" is a dead route wired from three separate places (Prompt idle, Result pass,
  Result empty) — `/recall/[term]/text/page.tsx` does not exist, confirmed by both a live 404
  probe and a `Glob` of `src/app`. No `not-found.tsx` exists either, so a student lands on Next's
  unstyled default page: no session bar, no dark mode, no way back in. This is not logged in
  `component-gaps.md` anywhere — the file discusses the button's *styling* repeatedly but never
  flags that its destination doesn't exist. This is the rubric's UX-4 anchor verbatim ("the
  student can reach a screen with no way out"), hit from three directions.
- Mic permission primer and permission-denied→text are both explicit Must-tier items in
  `sprint-context.md`, both entirely unbuilt (`prompt/page.tsx:51` routes the mic tap straight to
  Recording with no check). Honestly flagged in `component-gaps.md`, but a flagged Must-tier
  absence is still a Must-tier absence — the rubric's 4-band names this scenario directly.
- Recording (Listening/Paused) has no skip and no text-fallback mid-take — the only exits are
  Send, Cancel-and-rerecord (still voice), or abandoning the entire 4-term session via
  `SessionBar`'s close. A student who can't finish speaking and can't/won't speak again has no
  term-level way out, only a session-level one.
- Hint screens (Result: hint1/hint2) drop "Type instead," contradicting voice-ux.md's hard rule
  ("every screen gives the student a way out: skip, or type instead") — flagged in
  `component-gaps.md`, Skip does remain present, so this is real but lesser than the three
  findings above.

### Accessibility — 3/10
- Contrast hard gate fails on `text.tertiary`/`background.input` (≈4.41:1) — see Hard gates table.
  Measured via the actual token hex + alpha values from `tokens.json`, composited and run through
  WCAG relative-luminance math, not eyeballed.
- Touch-target hard gate fails on Skip and Type-instead/secondary-action links across Prompt and
  Result (~20px hit box vs. 44pt minimum) — see Hard gates table. The failure is inconsistent
  (SessionBar's close and the mic-row's Type-instead circle are correctly sized at 44px), which
  means the audit reached some controls and not others.
- Positive control: no color-alone state signaling was found anywhere in the Must-tier states
  rendered — verdict pills pair color with distinct icon and label text; Listening/Paused differ
  by shape, glow, and label, not color.

### Ambition — 6/10 (informational, does not count toward the total)
- Credits two real, specific decisions: the merged pass→next-question bubble (a genuine reading of
  "one beat of acknowledgment," not the safe literal-spec separate screen), and the Plan screen's
  post-session "Review Again" card as a real, non-trivial answer to the brief's "what happens
  after" question.
- Marks down: the Summary screen makes no numeric claim on what was earned (XP visibly accrues
  all loop long, then vanishes at Outcome with no total shown); SummaryCard rows distinguish only
  bucket, not degree of struggle (a one-hint recovery and a full reveal render with the same X
  glyph); Review Again always shows the same two hardcoded example concepts regardless of what the
  student actually missed — "a placeholder screen that technically closes the loop," which the
  rubric's own 9-band explicitly excludes; Knowie's affect is flat across every verdict (no pose
  beyond `standby`/`thinking` exists in `MascotSlot` today — a real component gap, not a build
  oversight).

---

## Render/compare pass (before critics ran)

Rendered all 18 reachable states at 390×844, dark mode, against the running app, and diffed pairs
that should differ. No two states that should be visually distinct rendered identically (see Hard
gates table). Two things surfaced here that the critics later confirmed independently from source:

- `/recall/[term]/text`, and any permission-primer or permission-denied route, return **404** —
  confirmed by direct navigation, not inferred from code.
- Recording/Listening and Recording/Paused for term 1's first attempt render with an empty
  transcript box — this is intentional (that attempt is scripted as the silent-take case), not a
  render failure; the "say it back" Listening state (term 2) was captured separately to confirm
  the component renders scripted content correctly when given any.

---

## Each critic's blind spot

- **Craft/Structure:** No interaction sequences were exercised — rapid double-taps on Send/Cancel/
  Continue, a long transcript typed into the recording textarea for reflow, or tapping the
  non-Osmosis summary cards to confirm firsthand whether they no-op. All inferred from
  `component-gaps.md`'s own text, not rendered.
- **System fidelity/Coherence:** No live Figma cross-check — every "flagged, no token exists"
  claim was taken on the codebase's own word plus one confirmed contradiction (the gradient
  token). Also no verification that CSS animations (skeleton pulse, mascot thinking-bob) actually
  run in-browser versus just existing in the stylesheet.
- **UX judgment/Accessibility:** The 404 finding is inferred from route-file absence and the
  absence of a `not-found.tsx`, not from screenshotting the failure itself (no such screenshot was
  in the provided set). Touch-target and contrast numbers come from resolving tokens/CSS
  mathematically, not from a live browser inspector or contrast-checker overlay, and Tailwind
  preflight's effect on bare-button hit areas wasn't independently ruled out (though SessionBar's
  own explicit 44px override elsewhere suggests preflight isn't adding meaningful padding).
- **Ambition:** Static PNGs only — no way to judge whether the merged pass→next-question bubble or
  the Processing skeleton/mascot motion actually read as intended once animated; ambition that
  lives in motion is invisible to a screenshot-only pass.
