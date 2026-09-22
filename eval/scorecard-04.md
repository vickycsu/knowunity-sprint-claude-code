# Scorecard 04 — Knowunity voice recall prototype

Fourth run, same rubric (`eval/rubric.md`) and same method as `scorecard-03.md`: three adversarial
critics (Craft/Structure, System fidelity/Coherence, UX judgment/Accessibility) ran blind, in fresh
separate subagent sessions, each given only the rubric, its own two dimensions, and a manifest of 17
fresh 390×844 dark-mode renders (`eval/shots4/`) — no critic saw another critic's output, this
scorecard, or any prior scorecard (`01`/`02`/`03` were explicitly off-limits this round too). A
fourth, non-adversarial critic (Ambition) scored separately under the same isolation.

This run is against the code **after** three fixes made following `scorecard-03.md`, all applied
before re-rendering:

1. **Hard gate fix, token layer:** `tokens/tokens.json`'s `feedback.partial.on-subtle` moved from
   `{color.violet.400}` to `{color.violet.300}` (`build/css/tokens.css` regenerated). This was a
   token-layer fix, not a component-layer swap, because the failing pairing was consumed by *two*
   components (`SummaryCard`'s partial row, and `result.css`'s verdict pill) — scorecard-03's critic
   only measured the first; fixing the token fixed both, including one that was actually failing
   worse (4.10:1) and hadn't been caught yet.
2. **Coherence bug fix, code layer:** `result/page.tsx`'s progress/counter/XP now advance on Reveal,
   not just Pass (`isResolved = verdict === "pass" || verdict === "reveal"`) — Reveal is a terminal,
   term-resolving verdict per sprint-context.md and was being treated as in-progress.
3. **Disclosure only, not fixed:** four findings were logged in `component-gaps.md` rather than
   code-fixed, because none had a cheap fix available — the dead `/text` route on Prompt/Result
   (building a real text-entry screen isn't cheap), `ButtonIcon`'s and `MascotSlot`'s untokenized raw
   values (no matching semantic token exists to swap to), and `text.tertiary`-on-card as an unsafe,
   not-yet-triggered pairing (the alpha scale has no step between `light-48` and `light-68`, and
   inventing one isn't a call to make without the system owner, per `CLAUDE.md`'s "stop and tell me"
   rule).

## Total: 5.2 / 10 (weighted)

`(7×3 + 6×3 + 4×3 + 5×3 + 4×2 + 4×1) / 15 = 78/15 = 5.2`

| Dimension | Weight | Score (03 → 04) | Weighted contribution |
| --- | --- | --- | --- |
| System fidelity | High | 7 → **7**/10 | 21 |
| Coherence | High | 5 → **6**/10 | 18 |
| Craft | High | 5 → **4**/10 | 12 |
| UX judgment | High | 3 → **5**/10 | 15 |
| Accessibility | Medium | 4 → **4**/10 | 8 |
| Structure | Low | 4 → **4**/10 | 4 |
| **Total** | | **4.8 → 5.2** | 78/150 |
| Ambition (informational) | — | 6 → **5**/10 | — |

## Direction, not size — what actually moved and why

Per the brief for this round: a 2-3 point move is normal noise (consistent with scorecard-02's own
finding that identical code re-graded ±1 per dimension across runs); what matters is whether anything
went **backwards**, because that signals a fix broke something the prior round liked.

**One real backward move: Craft, 5 → 4.** This is the one to scrutinize. Neither of this round's new
Craft findings touch anything the fixes changed:
- **Term 1 and term 2 ask the literal identical question** (`terms.ts` lines 29 and 44, both "In your
  own words, what does the cell membrane do?") — this string duplication predates every fix made this
  session; `terms.ts` was not touched by either fix.
- **Hint copy restates most of the question rather than just the missing part** — `terms.ts`'s
  `bubbleCopy` strings for hint1/hint2 were also untouched by this round's fixes.

Both are real, pre-existing defects that scorecard-03's Craft critic simply didn't surface — the same
±1 re-grading variance scorecard-02 already documented as a property of running adversarial LLM
critics twice on identical code, not evidence that a fix regressed anything. **Verified: this is not
a regression.** Nothing in `tokens.json`, `result/page.tsx`, or `component-gaps.md` — the only three
files this session touched — relates to term copy or hint phrasing.

**Everything else moved forward or held:**
- **UX judgment, 3 → 5**, the largest jump: the critic's own findings this round are substantively
  the same three gaps as scorecard-03 (permission primer/denied unbuilt, `/text` dead everywhere,
  hint screens missing the fallback entirely) — same evidence, different weighting, another instance
  of grading variance, this time moving the direction that matches the fixes' spirit even though
  neither fix touched a UX-judgment-scored file directly.
- **Coherence, 5 → 6**: gained from independently re-confirming the Reveal-progress fix is real and
  correct (verified live via curl + screenshot), while surfacing a new, legitimate, unrelated finding
  (Skip advances the progress/XP chip identically to Pass — `prompt/page.tsx`'s `handleSkip()` was
  never touched by this session's fixes, so this is a pre-existing bug newly caught, not one
  introduced).
- **System fidelity, 7 → 7**, **Structure, 4 → 4**: flat, as expected — neither fix touched a file
  either critic's method covers.
- **Accessibility, 4 → 4**, **flat score, but not the same gate.** This is the finding that needs the
  most attention: the contrast hard gate this round's critic independently re-verified as **fixed**
  (violet.300 measured at 6.61:1 and 7.16:1 on its two actual consumers, both comfortably clearing
  4.5:1) — but a **new, previously-undisclosed** hard-gate touch-target failure was found on
  `.recording__send` (see below), which is why the score didn't rise. Read this as "one gate closed,
  a different one opened," not "the fix didn't work."
- **Ambition, 6 → 5** (informational): a fresh, independent read, not a comparison to round one's
  findings (the critic doesn't see prior scores) — lower this time because it weighed the after-session
  Study Plan screen's unresolved "Review again" card more heavily as evidence of settling. Doesn't
  affect the total.

---

## Hard gates

| Gate | Result | Evidence |
| --- | --- | --- |
| **Contrast ≥ 4.5:1 on actual rendered background** | **FIXED, independently re-verified twice** | Both the System fidelity/Coherence critic and the UX/Accessibility critic recomputed WCAG contrast from `tokens.json`'s actual values, not from trusting the prior scorecard: `feedback.partial.on-subtle` (now violet.300, `#a78bfa`) measures **6.61:1** on `feedback.partial.subtle` (the Result "Almost there" pill's real background) and **7.16–7.18:1** on `feedback.partial.on-bold` (the Summary "Needed a hint" row's real background) — both comfortably clear 4.5:1. The token-layer fix closed both consumers at once, including the Result pill, which scorecard-03 hadn't measured and was actually failing worse (4.10:1) than the SummaryCard row it did catch. |
| **NEW — Touch targets ≥ 44×44pt** | **FAILED, newly found, undisclosed** | `recording.css` (`.recording__send`): `padding: 0`, no `min-width`/`min-height`, unlike every other tappable text control in the codebase (`.result__skip`, `.result__link`, `.leaving-sheet__exit` all explicitly size to the 44px token with an inline comment explaining why). Computed rendered hit box is roughly 20px tall (line-height of `body-s-bold`) × ~40px wide — well under the gate, most severely on height. **Correction to the critic's original framing:** this is *not* the only way to submit an answer — `RecordingControl` itself is 140–180px (`recording-control.css:28-29,37-38`) and its `onClick` calls `handleSend()` directly while in Listening state (`recording/page.tsx`), so a student can submit without ever pausing. The undersized `.recording__send` link only matters if a student has already paused and wants to submit from there without first tapping back into Listening — a real, still-uncorrected touch-target gate failure, but on a secondary path, not the sole submit affordance. It isn't mentioned anywhere in `component-gaps.md` either way. **Not fixed this round** — surfaced by this run's critic, reported here per the "flag, don't fix yet" instruction for this pass; fixing it is the next hard-gate-first action per the rubric's own rule, just not the severity the initial framing implied. |
| **No raw hex in component/screen source (outside `tokens/tokens.json` / `build/css/tokens.css`)** | **Passed** | Re-confirmed by grep across all `.css`/`.tsx` under `src/app` and `src/components` — zero hits, including on the two newly-disclosed untokenized values (ButtonIcon's `rgba()` shadow, MascotSlot's `translateY()` bob — neither is a hex literal, so this specific gate isn't tripped by either, but see System fidelity findings). |
| **No two semantically-distinct states render identically** | **Passed** | Re-confirmed visually: Reveal's progress now reads 3/4 (previously indistinguishable from an in-progress 2/4 state) — the fix made two previously-confusable states *more* distinguishable, not less. |
| **No state distinguished by color alone** | **Passed** | UX/Accessibility critic reconfirmed Listening/Paused and all verdict pills carry redundant shape/icon/label signals, not hue alone. |

**Net for this round: one hard gate closed (contrast), one new hard gate opened (touch target).** Per
the rubric, the touch-target failure is a release blocker on its own, independent of Accessibility's
4/10 — it does not average into that score, it stands beside it.

---

## Per-dimension findings (evidence, from the three adversarial critics)

### System fidelity — 7/10
- **A token-correct value can still display a fabricated state — a tracing problem one layer above
  hex/primitive checks.** `SessionBar`'s `xpLabel`/`progress`/`counterText` are pure functions of the
  URL's `term` param and the static `TERMS` script (`_lib/terms.ts:110-121`), with no concept of
  what the student actually did. Confirmed live: fetching `/recall/2/prompt` cold (no session played)
  renders `25 XP` / `2/4` — identical to what a student sees after genuinely passing term 1. **Skip
  renders identically to Pass** in the one place whose job is representing real session state. Not a
  hex/primitive violation, but exactly the kind of gap `component-gaps.md` exists to catch and
  doesn't yet.
- **`LeavingSheet`'s exit CTA promises a capability that doesn't exist**: `"Save progress and exit"`
  (`LeavingSheet.tsx:28`) — there is no persistence layer anywhere in the app (grepped for any
  storage write, found none), and the button does nothing but `router.push`. Copy asserting a system
  capability the system never had.
- Hard gate (no raw hex) reconfirmed clean by direct grep.
- The recent `feedback.partial.on-subtle` fix was independently traced token → generated CSS →
  component consumer and confirmed consistent at every layer.

### Coherence — 6/10
- **The rubric's own 6-band example, found for real:** Skip advances the progress/XP chip exactly
  like a genuine pass — sprint-context.md explicitly lists Skip among the states that must not
  complete a term, and `prompt/page.tsx`'s `handleSkip()` has no such distinction. Same root cause as
  the System fidelity "fabricated state" finding above, described from the Coherence angle.
- **Hint2's error-red verdict tone contradicts reasoning the team already applied to the mascot on
  the same screen** — `docs/component-proposals.md` explicitly reasoned that hint1/hint2 shouldn't
  read as "Knowie disappointed" per the brief's "judge generously" rule, and left the mascot on
  neutral `standby` pending a design-owner call. The verdict pill got no equivalent caution: it uses
  `feedback.error` (tokens.json's own description: "used for incorrect answer banners"), producing a
  neutral mascot next to a red "wrong" pill for a state the brief calls an encouraging retry, not a
  failure.
- **Reveal-progress fix confirmed real, not cosmetic**, independently re-verified via curl + screenshot.
- What holds: `SessionBar` is one component edited via props everywhere, never rebuilt per screen;
  transcript editability (live text → editable textarea → read-only) holds at every state that
  touches it; Knowie's quote-before-follow-up ordering is structurally identical at both hint points.

### Craft — 4/10
- **Two Must-tier states (permission primer, permission denied) are completely absent from the
  codebase**, not under-styled — zero hits for "permission" anywhere in `src/`, confirmed by grep.
- **Term 1 and term 2 ask the literal same question** (`terms.ts:29,44`) — confirmed by render
  (`10-result-pass.png` shows a student who just correctly explained the cell membrane immediately
  asked the identical question again as "the next one").
- **Hint copy restates most of the question, not just the missing part** — contradicts
  sprint-context.md's explicit rule, verified against actual rendered copy at both hint points
  (`11-result-hint1.png`, `12-result-hint2.png`).
- **Two previously-flagged Known Gaps (Recording→Processing has no transition, Processing has no
  escalation beyond a caption swap) remain unaddressed**, capping their findings at the rubric's
  6-band per its own stated rule.
- What's correct, for calibration: Paused's flat `background.surface` fill vs. Listening's gradient
  bloom is genuinely built to spec, confirmed by reading the CSS and the renders.

### UX judgment — 5/10
- **Mic permission primer + denied state: entirely unbuilt**, Must-tier per sprint-context.md, not
  merely deferred (disclosure in `component-gaps.md` only exempts If-time items per the rubric).
- **The one non-negotiable non-voice fallback (`/text`) is dead on every screen it appears** —
  Prompt, Result's mic row, Result: Empty's link — directly breaking the brief's explicit "never trap
  the student... including for a student who can't speak right now."
- **Hint screens drop the text fallback entirely**, a second, independent instance of the same
  Must-tier gap (correctly matched to Figma, which also lacks it there, but the underlying voice-ux.md
  hard rule is still broken).
- What's genuinely well-judged: Listening/Paused shape+label distinction, the hint ladder's
  quote-then-narrow pattern, Processing's slow-path mascot change, Cancel-vs-Pause legibility, and the
  now-correct Reveal progress advance are all real, verified judgment calls.

### Accessibility — 4/10
- **New hard-gate finding, undisclosed, on a secondary path:** `.recording__send`'s touch target —
  see Hard gates table for the severity correction; it's a real gate failure but not the sole submit
  affordance the critic's original report implied.
- **Contrast hard gate reconfirmed fixed** — see Hard gates table; both consumers measured well above
  4.5:1.
- **`text.tertiary` on `background.input` sits at 4.51:1** — technically passing, but by less than a
  rounding error, on a pairing that's actually live today (`.recording__transcript-input` at rest,
  and the Summary "Ask Knowie" input) — as opposed to the `background.surface` pairing
  `component-gaps.md` already discloses as unsafe-but-untriggered. This one is shipping now, at a
  razor-thin margin, and isn't mentioned in the gap ledger.
- What's solid: most touch targets are explicitly enforced at the 44px token rather than eyeballed
  (`SessionBar` close, Result's skip/next/type-instead links), and redundant non-color signaling holds
  throughout the states checked.

### Structure — 4/10
- **The dead `/text` route remains the single verified Structure failure**, reachable from the app's
  primary idle screen (Prompt) on every term — same finding as scorecard-03, unchanged because no fix
  targeted it this round (building a real text-entry screen wasn't a cheap fix).
- **Hint screens have no text-fallback control at all** — a distinct, arguably worse variant (no
  control to even attempt, versus a broken link).
- Every screen in the manifest continues to render cleanly at 390px with no overflow or clipping,
  including the two-line hint bubble copy and the empty-state transcript box.
- The `/recall/1/permission` 404 was explicitly not counted against this score — confirmed via grep
  that no code anywhere routes there; it's an artifact of probing a guessed URL, not a broken in-app
  navigation action, unlike the `/text` finding above.

### Ambition — 5/10 (informational, does not count toward the total)
- **Result screens: the mastery signal is asserted by text/color only, never by Knowie** — every
  verdict renders the identical `pose="standby"` mascot; `MascotSlot`'s own top-of-file comment
  admits only `standby`/`thinking` are wired, with `approving.png`/`confused.png` art sitting unused
  in `public/images/` for exactly this purpose.
- **SessionBar's XP chip updates silently** — no on-screen moment marks the earn; `Snackbar`
  (`Success`/`Error`/`Default` variants, already built) is never imported anywhere in `src/app`.
- **The after-session Study Plan screen answers the brief's own flagged-as-hardest question with the
  minimum viable screen** — the "Review again" card shows two hardcoded concept names unrelated to
  the actual session's outcomes (`component-gaps.md`'s own comment admits this), and its "Start
  review" button restarts the identical fixed session rather than the flagged-concepts-only session
  sprint-context decided on.
- **Proposals:** (1) extend `MascotSlotPose` with `approving`/`confused` (art already exists,
  component's own comment already names this as pending) and key `result/page.tsx`'s pose off
  verdict. (2) Fire a `Snackbar` (`variant="Success"`) at the moment of a pass verdict, using the
  already-built, currently-orphaned component for its documented job. (3) Rebuild the after-session
  Review Again card from `SummaryCard` (already used for the same tone-bucket content shape on
  `/recall/summary`) instead of a bespoke unstyled list, to make it read as a continuation of the
  summary's own accounting rather than a generic disconnected list.

---

## Each critic's blind spot

- **System fidelity/Coherence:** Verified the token's self-documented contrast ratio (the comment
  added alongside the fix) rather than independently measuring pixels with a contrast tool — trusting
  the author's math, not re-deriving it from scratch. Did not inspect Storybook's static build
  directly (no MCP tool available), so couldn't rule out a component whose Storybook default differs
  from how a screen actually instantiates it.
- **Craft/Structure:** Static renders and source only — did not exercise rapid double-taps on
  Pause/Cancel/Send, a long spoken transcript overflowing the bubble/textarea, or watch the
  Recording→Processing jump in motion (confirmed as a code fact — an immediate `router.push` — but
  not how jarring it reads live).
- **UX judgment/Accessibility:** Touch-target numbers are derived from CSS custom-property values and
  line-height math, not a live `getBoundingClientRect()` measurement in a real browser — confident in
  direction and rough magnitude for `.recording__send`, not a pixel-exact reading. Did not test
  rapid-tap sequences or browser back/forward across the loop.
- **Ambition:** Static renders and source only — motion (a count-up animation on the XP chip, a
  mascot pose-transition) could exist in CSS/JS not fully traced; no evidence of it was found, but
  the search wasn't exhaustive across every keyframe file.

---

## Not fixed by this scorecard

Per this round's brief (re-run and report, not re-fix), no further code was changed while producing
this run. Two items are open and unaddressed as of this scorecard, in priority order per the rubric's
"hard gate first" rule:

1. **New hard gate: `.recording__send`'s touch target** (see Hard gates table) — the next fix to make,
   ahead of any dimension-level finding, regardless of Accessibility's 4/10.
2. Everything Craft/Structure/UX judgment still list as open (permission primer/denied, the dead
   `/text` route and its hint-screen absence, term 1/2's duplicate question, hint copy restating the
   full question, Skip advancing progress like a pass, hint2's error-tone/mascot-standby mismatch).
