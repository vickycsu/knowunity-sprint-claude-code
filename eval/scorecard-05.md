# Scorecard 05 — Knowunity voice recall prototype

Fifth run, same rubric (`eval/rubric.md`) and same method as `scorecard-03.md`/`scorecard-04.md`:
three adversarial critics (Craft/Structure, System fidelity/Coherence, UX judgment/Accessibility) ran
blind, in fresh separate subagent sessions, each given only the rubric, its own two dimensions, and a
manifest of 17 fresh 390×844 dark-mode renders (`eval/shots5/`) — no critic saw another critic's
output, this scorecard, or any prior scorecard (`01`–`04` were explicitly off-limits again). A
fourth, non-adversarial critic (Ambition) scored separately under the same isolation.

This run is against the code **after** the touch-target fix made following `scorecard-04.md`:
`.recording__send` (the Paused-state "Send" link — the only submit path when a student has already
paused, though not the sole submit path overall, since the large `RecordingControl` circle sends
directly from Listening) now has an enforced `min-width`/`min-height: var(--color-size-space-1100)`
(44px), matching the pattern already used by `.result__skip`/`.result__link`. Verified live before
this run: the rendered hit box measures exactly 44×44px with no layout change to the visible button.

## Total: 5.1 / 10 (weighted)

`(5×3 + 5×3 + 5×3 + 5×3 + 6×2 + 4×1) / 15 = 76/15 = 5.1`

| Dimension | Weight | Score (04 → 05) | Weighted contribution |
| --- | --- | --- | --- |
| System fidelity | High | 7 → **5**/10 | 15 |
| Coherence | High | 6 → **5**/10 | 15 |
| Craft | High | 4 → **5**/10 | 15 |
| UX judgment | High | 5 → **5**/10 | 15 |
| Accessibility | Medium | 4 → **6**/10 | 12 |
| Structure | Low | 4 → **4**/10 | 4 |
| **Total** | | **5.2 → 5.1** | 76/150 |
| Ambition (informational) | — | 5 → **6**/10 | — |

## Direction, not size — what actually moved and why

The total is essentially flat (5.2 → 5.1), but that number hides the real story: **two High-weight
dimensions moved backward** (System fidelity −2, Coherence −1), and that backward movement is almost
exactly offset by Accessibility's forward move (+2, the touch-target gate closing). Per the brief for
these re-runs, the direction matters more than the total — so the two drops need the same scrutiny
scorecard-04's Craft drop got.

**System fidelity, 7 → 5, and Coherence, 6 → 5 — verified NOT a regression from this round's fix.**
Both drops trace to the same newly-surfaced finding, read from two different angles:
- **Hint2's verdict pill uses the wrong semantic token role.** `result/page.tsx`'s `VERDICT_META`
  sets `hint2: { tone: "error" }`, rendered via `feedback.error.*` (a red pill) — but
  `sprint-context.md` groups hint1 and hint2 together as one category (`Result: partial (hint 1, hint
  2)`), distinct from Reveal's separate fail category, and the term hasn't resolved at hint2 (XP and
  progress are unaffected, same as hint1). `feedback.error` is documented in `tokens.json` itself as
  "used for incorrect answer banners" — the wrong role for a state that isn't a failure. Screenshot
  confirms: `11-result-hint1.png` shows the correct violet "partial" pill, `12-result-hint2.png` shows
  a red "error" pill for what should read as the same continuing-retry state.
- **Reveal (sprint-context's actual "fail" state) has no verdict pill at all** (`VERDICT_META.reveal =
  null`) — the one state that should carry the fail-toned pill carries nothing, while the
  not-actually-failed hint2 carries it instead. Unflagged in `component-gaps.md`.

**This is not something this session's fixes touched.** The three files this round's fixes changed
were `tokens/tokens.json` (one color value), `build/css/tokens.css` (regenerated from it), and
`src/app/recall/[term]/recording/recording.css` (`.recording__send` sizing) — none relate to
`VERDICT_META`, hint2's tone assignment, or Reveal's pill logic, which live entirely in
`result/page.tsx` and were untouched. This is the same pattern scorecard-04 already established for
its Craft drop: a fresh critic instance catching a real, pre-existing defect the prior round's critic
missed, not a fix breaking something. A secondary, also-pre-existing System fidelity finding
(`component-gaps.md`'s SessionBar progress-shape note describing a "ring" shape that doesn't match the
actual linear-pill component) compounds the same score, for the same reason: stale documentation, not
new breakage.

**Everything that *was* touched moved in the right direction or held:**
- **Accessibility, 4 → 6**: both fixes independently re-verified as real. The contrast fix computes to
  6.61:1 and 7.18:1 on its two actual consumers (unchanged from scorecard-04's numbers, reconfirmed by
  a fresh critic). The touch-target fix computes to exactly 44×44px — the specific gate that failed
  last round is now closed. The score doesn't reach higher because two new *boundary, not failing*
  concerns were flagged: `text.tertiary` on `background.input` sits at 4.52:1, just 0.02 over the
  gate, and `.leaving-sheet__exit` clears 44px only by coincidental padding math, not the deliberate
  `min-width`/`min-height` pattern used everywhere else. Neither is a hard-gate failure.
- **Craft, 4 → 5**: recovered part of scorecard-04's drop; this round's critic independently confirmed
  the term-1/term-2 duplicate-question and hint-copy findings are real but wasn't as severe as
  scorecard-04's critic, more re-grading variance on unchanged code.
- **Structure, 4 → 4**, **UX judgment, 5 → 5**: flat, consistent with neither dimension's files being
  touched this round.
- **Ambition, 5 → 6** (informational): a fresh, independent read; doesn't affect the total.

---

## Hard gates

| Gate | Result | Evidence |
| --- | --- | --- |
| **Contrast ≥ 4.5:1 on actual rendered background** | **Passed, independently re-verified again** | UX/Accessibility critic recomputed from `tokens.json`'s actual values: `feedback.partial.on-subtle` (violet.300) measures 6.61:1 and 7.18:1 on its two real consumers — unchanged and confirmed for the third round running. |
| **Touch targets ≥ 44×44pt** | **Passed — the round-04 failure is now closed** | `.recording__send`'s `min-width`/`min-height: var(--color-size-space-1100)` computed at exactly 44px, cross-referenced against `build/css/tokens.css`. Every other control the critic swept (`result__skip`, `result__link`, `prompt__skip`, `SessionBar`'s close, the base `Button`/`ButtonIcon` components) also clears the gate. Two **boundary-but-passing** notes, not failures: `text.tertiary` on `background.input` sits at 4.52:1 (0.02 over the line, not a safe margin), and `.leaving-sheet__exit` clears 44px by coincidental padding math (24px top padding + 20px line-height) rather than the deliberate token pattern its sibling controls use. Worth hardening before either becomes a real failure under any future spacing/type-scale change, but neither fails the gate today. |
| **No raw hex in component/screen source** | **Passed** | Reconfirmed by grep, zero hits outside `tokens.json`/`build/css/tokens.css`. |
| **No two semantically-distinct states render identically** | **Passed** | No critic this round reported a collision; Reveal's progress figure (3/4) remains correctly distinct from hint1/hint2's (2/4). |
| **No state distinguished by color alone** | **Passed** | Every verdict pill still pairs its color with a distinct icon and label — the hint2 tone finding above is a *wrong semantic role* (System fidelity/Coherence), not a *color-alone* violation (Accessibility); the two are different defects and shouldn't be conflated. |

**All four hard gates pass this round for the first time across five scorecards.** The two
System fidelity/Coherence findings above (hint2's tone, Reveal's missing pill) are real defects but
neither is one of the rubric's four named hard gates — they're High-weight dimension findings, which
is exactly why they still pulled two dimension scores down two points combined.

---

## Per-dimension findings (evidence, from the three adversarial critics)

### System fidelity — 5/10
- **Hint2's verdict pill uses `feedback.error` instead of `feedback.partial`** — see Direction
  section above for full evidence. **Fix:** change `result/page.tsx`'s `VERDICT_META.hint2.tone` from
  `"error"` to `"partial"`, matching hint1 and the sprint-context taxonomy.
- **Reveal has no verdict signal at all** despite being sprint-context's actual "fail" state —
  unflagged in `component-gaps.md`. **Fix:** give Reveal a `feedback.error`-toned pill, or explicitly
  log the omission as a deliberate gap if intentionally deferred.
- **`component-gaps.md`'s SessionBar progress-shape note is stale** — it describes a "ring" shape
  differing from Figma's linear pill, but the actual `ProgressIndicator` component and every rendered
  screenshot show a linear pill matching Figma. A gap ledger entry that no longer matches the code
  undercuts trust in the rest of the ledger.
- What's solid: `background.*`, `text.*`, `interactive.*`, `feedback.success/partial`, and `border.*`
  usage all trace correctly through the semantic layer across every screen checked; both of this
  session's fixes (the contrast token, the touch-target CSS) were independently verified correctly
  implemented via the regenerated `build/css/tokens.css` and rendered screenshots.

### Coherence — 5/10
- **Same hint2/Reveal defect, read as a seam break:** hint1 and hint2 are meant to read as one
  continuous "you're close" sequence per sprint-context, but hint2's color family switches to red
  exactly where nothing has failed yet — a rule that holds at hint1 (matching the rubric's "obviously
  implemented" case) and silently breaks one screen later.
- **Reveal's missing pill breaks the pattern the loop otherwise establishes everywhere** — pass,
  hint1, and hint2 all use the pill+icon+quote pattern to mark outcome; the one state
  sprint-context calls "fail" drops it, forcing a reviewer to infer the outcome from copy alone on
  that one screen.
- **Cancel/re-record is only reachable after first pausing** (the side-button slot is an empty spacer
  during Listening) — not a hard violation of voice-ux.md's Must-tier requirement, but an undisclosed
  asymmetry worth a line in `component-gaps.md`.
- **`MascotSlot`'s static pose compounds the same underlying problem** (the loop under-signals outcome
  at the seams) even though it's honestly disclosed elsewhere (`MascotSlot.stories.tsx`'s audit note,
  `component-proposals.md` #4) — noted here for how it stacks with findings 1–2, not as a new
  violation.
- What's genuinely close to the rubric's 9-band: `SessionBar` composes one `ProgressIndicator` + one
  `Chips` instance, invoked identically across every loop screen with centralized progress/XP math in
  `_lib/terms.ts` — hand-traced against three rendered states (hint1, pass, reveal) and all
  internally consistent with "progress only advances on resolution."

### Craft — 5/10
- **The systemic mid-screen dead void persists across nearly the whole loop** (`prompt.css`,
  `recording.css`, `processing.css`, `result.css` each define an identical content-blind `flex: 1 1
  auto` spacer) — visible as a 350–450px empty gap in 11 of 13 substantive states, unchanged from
  prior rounds since nothing this session touched layout.
- **Recording → Processing still has no transition** — a named, still-open gap
  (`docs/design-system.md` states it explicitly), confirmed unchanged in code.
- **`skeletonLine`'s count is still fixed at two bars regardless of wait length** — Processing:
  normal and Processing: slow render identically apart from caption text, contradicting
  design-system.md's own "stack as many as the moment needs" instruction.
- **Hint1/hint2 stage-label copy varies without a stated rule** ("Let's try again" vs. "Tap to
  answer") — reads as arbitrary rather than rule-driven.
- What's genuine, deliberate craft: Processing's mascot `thinking` pose + bob keyframe and
  `skeletonLine`'s pulse animation (both `prefers-reduced-motion`-guarded); Paused's flat
  `background.surface` fill, correctly distinct from Listening's bloom.

### UX judgment — 5/10
- **Text fallback is a dead 404 from every entry point** — Prompt's "Type instead," Result's mic-row
  keyboard icon, Result: Empty's link. Logged in `component-gaps.md`, but it's Must-tier, not If-time,
  so disclosure doesn't exempt it from the rubric's 4-anchor language, which this matches almost
  verbatim.
- **Mic permission primer + denied state remain entirely unbuilt** — confirmed via
  `component-gaps.md` and the probed 404.
- **Hint screens still drop the text fallback entirely**, contradicting voice-ux.md's hard "always
  offer a non-voice path" rule at exactly the retry moments a student most needs an escape.
- What's genuinely well-judged: Listening/Paused's shape+motion distinction, Cancel-vs-Pause
  legibility, the hint ladder's quote-then-narrow pattern, and verdict chips pairing color with icon +
  label are all real, verified judgment calls — enough to keep this off the 4-band despite three
  Must-tier paths being broken, per the rubric's "don't average a gate failure away" rule cutting both
  ways (real judgment elsewhere doesn't erase the break, but the break doesn't erase the judgment
  either).

### Accessibility — 6/10
- **Both of this session's fixes reconfirmed correct** — see Hard gates table.
- **`text.tertiary` sits right at the contrast floor on its real usages**, not safely above it: 4.52:1
  on `background.input` (the Paused-state transcript textarea, the Summary "Ask Knowie" input), 4.62:1
  on `background.page` — both technically passing, neither a safe margin. No live instance currently
  places it on `background.surface` (would compute to 4.34:1, a real fail) — that specific trap is
  still avoided, but the token's other two live uses are thin enough to be worth hardening.
- **`.leaving-sheet__exit` clears its touch target by coincidental padding math**, not the deliberate
  `min-width`/`min-height` pattern its sibling controls use and comment explicitly — the one hand-built
  control in the loop not verified the way its neighbors were.
- What's solid: every other tappable control swept (skip links, type-instead controls, `SessionBar`'s
  close, the base `Button`/`ButtonIcon` components) explicitly enforces 44px or more; state-pairs
  requiring redundant non-color signals (Listening/Paused, verdict pills) all still pass.

### Structure — 4/10
- **The dead `/text` route remains the single verified Structure failure**, reachable from at least
  three screens with visibly affordant, tappable-looking controls — unchanged because no fix targeted
  it this round.
- 13 of 15 real screens continue to render cleanly at 390×844 with no overflow or clipping; dark mode
  consistent throughout.
- The `/recall/[term]/permission` 404 is confirmed, again, not a defect — zero code anywhere links to
  it; it's an artifact of the manifest's deliberate probe, not a broken in-app action.

### Ambition — 6/10 (informational, does not count toward the total)
- **Result screens still assert mastery through text/color only** — `MascotSlot` hardcoded to
  `pose="standby"` on every verdict, while `approving.png`/`confused.png` sit unused in
  `public/images/` and `docs/design-system.md` explicitly names this component's job as reacting to
  correct/incorrect.
- **The "Say it back" unaided-practice take — the exact moment the brief calls hardest to design — is
  built to produce zero feedback**, routed straight to the next term on Send regardless of content,
  skipping Processing and Result entirely.
- **Session summary never shows a session XP total** — the reward mechanic the brief says should be
  "collected at the end" disappears once the student reaches the one screen meant to make the session
  feel worth something.
- **Proposals:** (1) extend `MascotSlotPose` with `approving`/`confused` (art already exists) and key
  `result/page.tsx`'s pose off verdict tone. (2) Route the sayback take through the real Processing/
  Result path instead of auto-advancing, reusing the existing `pass` tone paired with the new
  `approving` pose and distinct copy. (3) Add one `Chips` instance to the Summary screen (same
  props/icon `SessionBar` already uses) showing the session's total collected XP.

---

## Each critic's blind spot

- **System fidelity/Coherence:** Did not interact with the live app — no browser tool available, so
  "coherence across the seams" checks were source + static screenshots only, not an actual tap-through
  of hint1 → hint2 → reveal → next-term, and no way to check whether the SessionBar's progress fill
  animates or jump-cuts between values that were only compared as static numbers.
- **Craft/Structure:** Static renders and source only — did not exercise a very long transcript in the
  Paused `<textarea>` (no `max-height`/scroll handling exists to verify), rapid double-tapping
  Send/Continue/Tap-to-send before a route transition resolves, or resize/rotation behavior.
- **UX judgment/Accessibility:** No interactive or assistive-technology pass — contrast and
  touch-target findings are computed from token values and CSS, not measured live or confirmed with a
  screen reader, so `aria-live`/focus-management behavior across state changes remains unverified by
  this method. Also could not rule out sub-pixel font-rendering variance shifting the 4.52:1
  `text.tertiary` case in practice.
- **Ambition:** Static renders and source only — motion/timing-based ambition (count-up animations,
  pose transitions) is invisible to this method; none was found in the code read, but the search
  wasn't exhaustive across every keyframe file.

---

## Not fixed by this scorecard

Per this round's brief (re-run and report), no code was changed while producing this run. All four
hard gates now pass, so nothing here is a release blocker — the next priorities by weight are the
hint2 tone/Reveal-pill defect (System fidelity + Coherence, High weight, two dimensions at once) and
the dead `/text` route (UX judgment + Structure, also two dimensions at once), both unchanged across
every round so far because neither has had a cheap fix available yet.
