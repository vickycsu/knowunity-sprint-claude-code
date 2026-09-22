# Scorecard 03 — Knowunity voice recall prototype

Graded against `eval/rubric.md`, current working-tree state (includes the uncommitted fixes on top
of `scorecard-02.md`: `component-gaps.md`, `prompt.css`, `result.css`, `SummaryCard.tsx` — the
Summary row-icon fix and the two touch-target/contrast patches scorecard-02 logged are live in this
run, not reused from a prior screenshot set). `scorecard-01.md` and `scorecard-02.md` are left
untouched as prior baselines; this is a fresh third run, not an edit to either.

**Method:** 17 fresh dark-mode 390×844 renders were captured against the live dev server
(`eval/shots3/`), covering every reachable state including failure paths — the dead `/recall/[term]/text`
route (404) and a probed guess at a permission-primer route (also 404, confirming no such route
exists). Before dispatching critics, these renders were compared pairwise for any two
semantically-distinct states rendering identically (Listening vs. Paused, hint1 vs. hint2, empty vs.
pass, and the Summary "Needed a hint" vs. "Needs practice" row icons) — **no broken pair was found**;
see the render/compare section below.

Three adversarial critics (Craft/Structure, System fidelity/Coherence, UX judgment/Accessibility)
then ran blind, in separate subagent contexts, each given only `eval/rubric.md`, the render manifest
above, and its own two dimensions — no critic saw another critic's output, this scorecard, or either
prior scorecard. A fourth, non-adversarial critic (Ambition) scored separately under the same
isolation; its score is informational and excluded from the weighted total.

## Total: 4.8 / 10 (weighted)

`(7×3 + 5×3 + 5×3 + 3×3 + 4×2 + 4×1) / 15 = 72/15 = 4.8`

| Dimension | Weight | Score | Weighted contribution |
| --- | --- | --- | --- |
| System fidelity | High | 7/10 | 21 |
| Coherence | High | 5/10 | 15 |
| Craft | High | 5/10 | 15 |
| UX judgment | High | 3/10 | 9 |
| Accessibility | Medium | 4/10 | 8 |
| Structure | Low | 4/10 | 4 |
| **Total** | | | **72/150 → 4.8/10** |
| Ambition (informational, not in total) | — | 6/10 | — |

Compared to scorecard-02 (5.0/10): System fidelity held roughly flat (7 vs. 7). Coherence fell (6→5)
on a newly-measured defect (reveal doesn't advance progress). Craft held flat (4 vs. 5, within the
±1 swing scorecard-02 already documented as re-grading noise). UX judgment held at the floor (2→3,
still dominated by the same dead text-fallback route). Accessibility fell (6→4) because this round's
critic measured a contrast pairing scorecard-02's critic didn't check (SummaryCard's partial-row
text) and found a real, new hard-gate failure. Structure fell (6→4) because this round's critic
weighted the dead `/text` route — present in every prior round too — against the rubric's explicit
4-band language more strictly than either prior round did. Treat dimension-to-dimension deltas of
±1–2 as consistent with the ±1 grading noise scorecard-02 already established, not necessarily code
regressions; the Accessibility and Structure drops are backed by newly-surfaced or newly-weighted
evidence, not by anything getting worse in the code.

---

## Render/compare pass (before critics ran)

All 17 reachable states (plus two deliberately-probed dead routes) were rendered fresh at 390×844,
dark mode, in `eval/shots3/`, and the pairs the system is supposed to distinguish were checked side
by side:

- **Listening vs. Paused** (`04-recording-listening.png` / `05-recording-paused.png`) — clearly
  distinct: gradient bloom + "Tap to send" vs. flat fill + "Paused" label + trash/resume controls.
  Not identical.
- **Result: hint1 vs. hint2** (`11-result-hint1.png` / `12-result-hint2.png`) — clearly distinct:
  different pill color/icon/label ("Almost there" vs. "Try again"), different caption ("Let's try
  again" vs. "Tap to answer"). Not identical.
- **Result: empty vs. Result: pass** (`09-result-empty.png` / `10-result-pass.png`) — clearly
  distinct. Not identical.
- **Summary row icons, "Needed a hint" vs. "Needs practice"** (`14-summary.png`) — the scorecard-02
  hard-gate fix is confirmed live and correct in this render: checkmark on the Osmosis (partial) row,
  X on the Membrane Transport (needs-practice) row. Not identical.
- **Processing: normal vs. slow** (`07-processing-normal.png` / `08-processing-slow.png`) — the only
  visible difference is the caption text ("Knowie is reading your answer" vs. "Still thinking...");
  everything else (mascot pose, skeleton lines) is intentionally identical. Flagged here for
  visibility, not as a defect — Craft's critic separately judged this an under-designed escalation,
  see below.

**No two states that should be visually distinct rendered identically.** This hard gate passes,
independently re-confirmed by the System fidelity critic's own check.

---

## Hard gates

| Gate | Result | Evidence |
| --- | --- | --- |
| **Contrast ≥ 4.5:1 on actual rendered background** | **FAILED** | UX/Accessibility critic computed WCAG contrast from `tokens/tokens.json`'s actual hex/alpha values (not eyeballed): `SummaryCard`'s "Needed a hint" (partial) row — `feedback.partial.on-subtle` (`color.violet.400`, #7b65e0) text on `feedback.partial.on-bold` (`color.violet.950`, #0e0a18) background — computes to **4.45:1**, below the 4.5:1 threshold for the 18px regular body text used there (`summary-card.css`). Visually confirmable in `14-summary.png`: the Osmosis row's text reads visibly dimmer than the Good/NeedsPractice rows next to it (10.74:1 and 9.73:1). Fix: swap `on-subtle` for a lighter violet primitive, or use `text.primary`/`text.on-accent` for this row. A second, not-yet-triggered risk was also measured: `text.tertiary` on `background.surface` (a card) computes to 4.35:1 — also fails — but no currently-built screen places that exact pairing, so it's a fragile near-miss, not an active violation; treat it as unsafe rather than verified-safe. |
| **Touch targets ≥ 44×44pt** | **Passed** | Independently re-verified by the UX/Accessibility critic from actual CSS values, not renders: `SessionBar`'s close is a hardcoded 44×44, `.prompt__skip`/`.result__link`/`.prompt__type-instead`/`.result__type-instead` explicitly pad to `space-1100` (44px), `recording__side-button` resolves to 48×48. |
| **No raw hex in component/screen source (outside `tokens/tokens.json` / `build/css/tokens.css`)** | **Passed** | Re-confirmed by grep across all `.css`/`.tsx` under `src/app` and `src/components` — zero hits. Note: this gate is narrowly about hex literals; it does not catch two raw non-hex values the System fidelity critic separately flagged as untokenized (`ButtonIcon`'s `rgba(0,0,0,0.15)` shadow, `MascotSlot`'s `translateY(-6px)` bob) — see System fidelity findings. |
| **No two semantically-distinct states render identically** | **Passed** | Re-confirmed across all 17 states in `shots3/` — see render/compare pass above. |
| **No state distinguished by color alone** | **Passed** | UX/Accessibility critic confirmed Listening/Paused (shape + label, not just glow color) and all Result verdicts (icon + label text) carry redundant non-color signals; the scorecard-02 Summary-icon fix holds. |

**One hard gate failed this round: Contrast.** Per the rubric, this is a defect to fix regardless of
the weighted total — it is not averaged into Accessibility's 4/10, it stands on its own as a release
blocker.

---

## Per-dimension findings (evidence, from the three adversarial critics)

### System fidelity — 7/10
- **Two untokenized, undisclosed raw values found:** `ButtonIcon/button-icon.css:77,81` —
  `box-shadow: inset 0 -2px 0 rgba(0,0,0,0.15)` / `inset 0 -4px 0 rgba(0,0,0,0.15)` — has an inline
  comment acknowledging it's a Figma value, not a token, but isn't logged in `component-gaps.md`
  alongside the system's other disclosed exceptions (topic-ring gradient, illustration sizes,
  empty-state border alpha). `MascotSlot/mascot-slot.css:43` — `transform: translateY(-6px)` in the
  `thinking` bob keyframe — a raw pixel motion value with no token and no disclosure anywhere. Fix:
  add a `motion.*`/`elevation.*` semantic token for each, or log both in `component-gaps.md`
  consistently with the system's other tracked exceptions.
- **Real positive finding, independently re-verified:** `accent.brand.ring-gradient`
  (`tokens.json:1852`) and `size.illustration.1300`/`1100` (`tokens.json:1278`) both exist as real
  tokens and are correctly consumed via `var(--color-...)` in `plan.css`/`prompt.css`/`result.css` —
  `component-gaps.md`'s "Closed" annotations for these two gaps are accurate, not just claimed.
- **System-wide convention worth flagging, not scored as a fresh defect:** `size.illustration.*` /
  `size.icon.*` / `size.space.*` are referenced directly from screen CSS
  (`prompt.css:59-60`, `result.css:126-127,179-180`, `mascot-slot.css:13-30`) with no semantic
  aliasing layer — there is no semantic spacing/size layer at all in this system, only for color.
  Pre-existing, not introduced by the current diff.
- Hard gate (no raw hex) passes cleanly, confirmed by grep across all component/screen source.

### Coherence — 5/10
- **New this round, confirmed by rendering: progress/counter fails to advance on Result: reveal.**
  `result/page.tsx:70-73` only advances the shown progress/counter when `verdict === "pass"` — but
  reveal is also a terminal, term-resolving verdict per sprint-context.md ("progress advances only
  when a term resolves"). Confirmed by comparing `10-result-pass.png` (term 1 resolves via pass,
  counter correctly reads "2/4") against `13-result-reveal.png` (term 2 resolves via reveal, counter
  still reads "2/4" instead of "3/4"). Fix: advance on any terminal verdict
  (`verdict === "pass" || verdict === "reveal"`), not just `pass`.
- **Pause vs. Cancel still isn't legible from the UI alone** (same finding as scorecard-01/02,
  reconfirmed against `05-recording-paused.png`): the discard control is a bare trash icon with an
  accessible-only label (`aria-label="Cancel and re-record"`), no visible text, next to a clearly
  labeled "Tap to resume." Fix: add a visible label matching the treatment `IconSlot`+text already
  gets elsewhere in the same row.
- **Session summary is structurally disconnected from the loop it summarizes.**
  `summary/page.tsx:14-31,103-144` buckets terms into hardcoded constants
  (`GOOD_TERMS`/`PARTIAL_TERMS`/`NEEDS_PRACTICE_TERMS`) independent of `_lib/terms.ts`'s actual
  scripted verdicts — playing the real loop (term 2 ends in reveal) and landing on Summary shows
  generic placeholder content, not a reflection of what happened. Honestly flagged in
  `component-gaps.md` as a "data-consistency gap," which is good System-fidelity practice, but the
  Coherence defect stands regardless of disclosure.
- What holds up: `SessionBar`'s progress/counter/XP are genuinely computed from one shared source
  (`_lib/terms.ts`) across every loop screen, not rebuilt per screen; hint copy quotes the student's
  prior words identically at both hint points; transcript is live text while Listening, editable only
  while Paused, read-only on every Result screen — confirmed across all four loop screens' source.

### Craft — 5/10
- **Systemic dead void across Prompt, Recording, and Result, not a designed rhythm.**
  `prompt.css:19-21`, `recording.css` (`.recording__spacer`), `result.css:109` all share the identical
  one-line `flex: 1 1 auto` spacer, producing ~280–320px of flat, motion-free black space on every
  one of these screens (confirmed in `03`, `04`, `05`, `10`, `11`, `12`). On Listening specifically,
  this is the exact moment Principle 1 requires status to be unmistakable, yet the top two-thirds of
  the screen carries no status signal — it's all loaded onto the RecordingControl glow alone. Fix:
  give the void a deliberate job, or justify the choice explicitly per state.
- **Recording → Processing seam has no transition — a known, flagged, unaddressed gap.**
  `docs/design-system.md`'s recordingControl section states plainly no transition state exists
  between "Tap to send" and the next screen; nothing in the current code adds one. Per the rubric's
  own worked example, this caps the seam's score at the 6-band, not 9, regardless of how clean
  Processing looks in isolation.
- **skeletonLine and recordingControl's previously-flagged gaps are still open** (unbound
  height/radius, unbound bloom gradient) — confirmed untouched by the current diff, capping those
  screens' craft score at 6 per the rubric's explicit rule.
- **A full Must-tier state (mic permission primer / denied) has zero pixels drawn for it** — not
  stubbed, not styled, per `component-gaps.md`'s own admission. Honestly logged, but a state with no
  built version at all can't be scored "individually clean."
- What's genuinely 9-band quality: the hint ladder's copy is real and specific per moment, not
  templated (verified against actual attempt text, not assumed); Knowie visibly quotes the student's
  own words before each follow-up; Processing's two skeleton line widths (262px/197px) are a real
  per-moment judgment matching Figma, not a fixed default.

### UX judgment — 3/10
- **The text fallback — the brief's one non-negotiable non-voice escape hatch — is dead everywhere
  it appears, and unflagged.** Every "Type instead" control (`prompt/page.tsx:59`,
  `result/page.tsx:117-118,168`) routes to `/recall/[term]/text`, which does not exist
  (`16-text-route-404.png` shows the literal 404). Unlike the hint-screen text-fallback gap, this one
  — on Prompt and Result — has no note anywhere in `component-gaps.md`. The control is visually
  present and looks functional, so a student commits to it before discovering the trap. Fix: build
  the route, even minimally mocked, or disable/hide the control and log it as a Must-tier gap.
- **Mic permission primer + denied state, Must-tier per sprint-context.md, is entirely unbuilt and
  the check is skipped in code, not deferred behind a flag** — confirmed via `17-permission-primer-404.png`
  and a grep turning up no permission-related code anywhere in `src/app/recall`. sprint-context.md
  scoped this as buildable within sprint ("designed and mocked... no real native permission flow"),
  so this is a scope miss, not an out-of-scope item.
- **Result: empty's only two escape routes are "Record again" and the same broken "Type instead"** —
  a student who can't get a clean recording and can't/won't speak has no working non-voice path. Same
  root cause as finding 1, called out separately because it's exactly the scenario Principle 5 exists
  for.
- What's genuinely well-judged, for calibration: Listening/Paused differ by shape, fill, and label,
  not color alone; verdict states use distinct icon+label combinations; Processing's slow-state is
  real and distinct; skip is present on every prompt/hint screen; the SummaryCard icon fix shows the
  build actively catching and correcting a color-alone violation mid-sprint. Can't offset the hard
  failure on the one required path per the rubric's "don't average a gate failure away" rule.

### Accessibility — 4/10
- **Hard gate failure, measured:** see Hard gates table — `SummaryCard`'s "Needed a hint" row text
  computes to 4.45:1, below the 4.5:1 threshold for its 18px regular body text.
- **A second contrast pairing — `text.tertiary` on `background.surface` (a card), the exact trap
  sprint-context.md calls out — computes to 4.35:1, also failing,** though no currently-built screen
  hits this exact pairing. Flagged as unsafe-but-unhit, not verified-safe: don't rely on it not having
  been triggered yet.
- **No `aria-live` region anywhere in the recall loop** — zero hits across
  `src/app/recall/**/*.tsx`. State transitions (Listening → Paused → Processing → Result) are
  Principle 1's core "status unmistakable at every step" requirement, but that guarantee is entirely
  visual; a screen-reader user gets no announcement when state changes underneath them. Not one of
  the rubric's four named hard gates, but a real gap in the same territory.
- What's solid: touch targets are handled with real discipline throughout, with inline comments
  naming the gate each one hits; color-alone violations were actively hunted and fixed
  (SummaryCard icons, RecordingControl shape/label). This is why the score isn't lower — but per the
  rubric, the one measured hard-gate failure caps it at 4 regardless.

### Structure — 4/10
- **The "Type instead" text fallback — a Must-tier, frequently-reachable navigation action —
  404s**, verified both by rendering (`16-text-route-404.png`/`17-permission-primer-404.png` show
  Next.js's literal 404 page) and by source (`prompt/page.tsx:59` calls `router.push` to a route with
  no corresponding directory anywhere under `src/app/recall/[term]/`). This single verified 404 on a
  Must-tier, frequently-reachable action is enough on its own to land Structure in the rubric's 4-band
  per its own definition — the rest of the build rendering cleanly doesn't average it back up, per
  the "don't average a gate failure away" instruction.
- **Every other screen in the manifest renders cleanly at 390px with no overflow or clipping** —
  confirmed by direct inspection of all render pairs, including the longer Reveal/hint bubbles. Dark
  mode applied consistently throughout.
- **Secondary dead-ends exist but are honestly flagged, not silent:** "Create a course," "Add a
  topic," "Ask Knowie," and Summary's "Practice again" render as real buttons with no `onClick`, per
  `component-gaps.md` — explicitly out of this sprint's decided scope, noted as lower-severity
  instances of the same pattern, not scored as equivalent to the `/text` failure.
- Summary's "Continue" destination (`/course/biology/plan?afterSession=1`) isn't in the render
  manifest, so per the rubric's verification rule this critic declined to score it either way.

### Ambition — 6/10 (informational, does not count toward the total)
- **The one real decision this round:** Result: pass merges the affirmation with the next term's
  prompt on one screen instead of a clean two-screen hand-off — `component-gaps.md` documents this as
  a deliberate reconciliation of "one beat, then next prompt" against a routes-per-screen
  architecture, not a default. A genuine, justified judgment call, credited plainly.
- **Everywhere else settles.** `MascotSlot` never reacts across the whole Result flow — every verdict
  (pass, hint1, hint2, reveal, empty) renders the identical `pose="standby"`
  (`result/page.tsx:78`), even though unused art (`approving.png`, `confused.png`, etc.) already sits
  in `public/images/` next to the two poses actually wired in, and the pose type was already extended
  once this sprint for Processing's `"thinking"` state — the same cheap move wasn't repeated for the
  moment that matters most.
- Session summary answers "is the claim earned?" with a bucket label and nothing else — per-term XP
  (already computed, already defined in sprint-context.md) is visible nowhere on the screen, only
  which bucket a term landed in. The brief's own language ("overconfidence has to cost something") is
  never made visible.
- The XP chip in `SessionBar` updates silently between Processing and Result with no in-moment
  feedback tied to the verdict that just earned it, despite `Chips` already supporting
  `color="Success"` unused.
- **Proposals:** (1) extend `MascotSlotPose` with `"approving"`/`"confused"` (art already exists) and
  switch `result/page.tsx:78`'s hardcoded pose on verdict tone. (2) Render `SessionBar`'s XP chip with
  `color="Success"` specifically on a pass-verdict Result screen, a screen-scoped swap, not a new
  component. (3) Add a small `Chips("S")` instance to `SummaryCard`'s row layout
  (`SummaryCard.tsx:60`) showing that term's actual earned XP, making "earned, not flattered" legible
  per-term rather than only at the bucket level.

---

## Each critic's blind spot

- **System fidelity/Coherence:** Verification was source-reading plus static screenshot inspection,
  not measurement or live interaction — did not click through the loop in the running app to confirm
  the reveal-progress bug's downstream effect self-corrects once a student actually advances to the
  next screen (inferred from `progressFor(term)` being recomputed fresh per page, not observed
  directly).
- **Craft/Structure:** Graded entirely from static PNG renders and source reading — did not drive the
  live dev server, so rapid/double-tapping cancel, tapping continue before a transition finishes, or
  confirming the skeleton-pulse/mascot-bob CSS animations actually play smoothly (vs. jank or a
  `prefers-reduced-motion` regression) were out of reach; only the `@keyframes` declarations were
  confirmed to exist, not their live behavior.
- **UX judgment/Accessibility:** Contrast and touch-target values were computed arithmetically from
  token hex/alpha values and CSS rules, not measured against a live-rendered DOM with a devtools
  color picker or real touch surface. No keyboard-only or screen-reader (VoiceOver) pass was run
  through the loop — the `aria-live` gap is inferred from the attribute's absence, not from listening
  to what a screen reader actually announces at each transition.
- **Ambition:** Static renders only — did not interact with the live dev server, so anything
  dependent on motion, timing, or sequencing (whether the XP chip already count-up-animates in a way
  a screenshot can't show, whether the mascot's "thinking" bob reads as more alive in motion than the
  stills suggest) could be under- or over-credited.

---

## Not fixed by this scorecard

Per the panel's brief ("fix nothing, just flag it"), no code was changed while producing this run —
unlike scorecard-01 and scorecard-02, where hard-gate fixes were applied immediately after grading.
The one hard gate that failed this round (SummaryCard contrast) and the newly-measured Coherence
defect (reveal not advancing progress) are both open and unaddressed as of this scorecard.
