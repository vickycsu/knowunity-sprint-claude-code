# Eval rubric — Knowunity voice recall prototype

Scores are 1–10 per dimension. Weighted per the table below. Read the scoring rules before
scoring anything — they change what a passing score means, not just how anchors read.

| Dimension | What it asks | Weight |
| --- | --- | --- |
| System fidelity | Does every value trace back to a token, and every component to the library | High |
| Coherence | Does it read as one product, or as screens that arrived separately | High |
| Craft | Spacing, rhythm, states, the small deliberate decisions | High |
| UX judgment | Are the states handled, the hierarchy clear, the failure paths designed | High |
| Accessibility | Contrast, touch targets, whether meaning ever rests on color alone | Medium |
| Structure | Does the layout hold together and the thing render | Low |

---

## Scoring rules

- **"Looks good" is a 6, not a 9.** A screen that reads fine at a glance defaults to a 6. A 9
  survives a senior critique untouched — someone who knows this system pokes at token choices,
  state coverage, and edge cases and finds nothing to correct.
- **A dimension scores 8 or above only if it was verified by rendering, measuring, or testing.**
  Reading the source and confirming it *should* work is not verification. If you didn't render
  the screen, measure the value, or run the state, cap that dimension at 7 regardless of how
  clean the code looks.
- Score each screen/state independently where a dimension applies unevenly (e.g. Processing may
  nail Craft while Result: fail doesn't) — don't let one strong screen average out a weak one
  silently. Note per-screen deltas in the writeup.

---

## Dimensions

### System fidelity — High

**What it's scoring:** every color, size, spacing, radius, and type value resolves to a semantic
token in `tokens/tokens.json` (not a primitive, never a raw value), and every UI element is an
instance of a component from `docs/design-system.md` — not a hand-built lookalike.

- **4 — Untraced values.** Raw hex or raw pixel values appear in component or screen code
  (`#1a1a1a`, `padding: 16px`). Or a primitive token is referenced directly in a screen
  (`color.violet.500` instead of `interactive.primary`). Or a screen uses a hand-built element
  where a system component exists (e.g. a custom nav bar built by hand instead of flagging that
  `appBar` is unused-but-available, or a hand-drawn record button instead of `recordingControl`).
- **6 — Tokens used, but the wrong layer or the wrong component.** Every value is a token, but
  some references point at primitives instead of semantics (works today, breaks the moment the
  primitive changes underneath it). Or a component is close-but-not-quite the documented one —
  e.g. two `button` instances placed side by side by hand instead of using `buttonGroup`. This is
  the "looks identical, wrong plumbing" band.
- **9 — Every value semantic, every component sourced, every gap flagged instead of papered
  over.** `text.link` uses `violet.500-2`, `text.tertiary` resolves through
  `color/alpha/light-50` and was checked for contrast *on the card it sits on*, not just the page
  background — because sprint-context calls this out as a real trap, not a formality. Known gaps
  (skeletonLine's unbound height/radius, recordingControl's unbound bloom gradient, sessionBar's
  44px close control not matching any token) are named in `component-gaps.md` or inline, not
  silently eyeballed to the nearest value. Nothing invented; nothing guessed.

### Coherence — High

**What it's scoring:** whether the loop — Prompt → Recording → Paused → Processing → Result →
Outcome — reads as one continuous product a single team built, versus screens that were each
solved locally and never reconciled against each other.

- **4 — Screens disagree with each other.** The session bar looks or behaves differently across
  loop screens. XP chip, progress stops, or close control shift position or style between states.
  Hint copy pattern breaks on the second hint. Knowie's presence (mascotSlot pose/size) is
  inconsistent for equivalent states across screens.
- **6 — Consistent surface, inconsistent logic.** Visually uniform — same header, same spacing
  rhythm — but the underlying decisions don't line up: progress advances on a screen where
  sprint-context says it shouldn't (hints/retries/skip must not advance the "1/4" counter), or the
  distinction between Pause (keeps the take) and Cancel (discards the take) isn't legible from the
  UI alone.
- **9 — The system's own rules hold everywhere, including the seams.** sessionBar is genuinely one
  instance edited via its nested progress/XP children, never rebuilt per screen. Transcript is
  editable before a verdict and read-only after, exactly and only there. Knowie quoting the
  student's own words before the follow-up question happens identically at both hint points. A
  senior reviewer moving screen to screen finds zero moments where they have to guess which state
  they're in.

### Craft — High

**What it's scoring:** the deliberate small decisions — spacing rhythm, state transitions,
loading/empty/paused treatment, motion — that separate "assembled" from "designed."

- **4 — Default spacing, missing states.** Components dropped in with default padding and no
  attention to rhythm between them. A required state from `docs/voice-ux.md`'s Must list is
  missing or unstyled (e.g. Paused looks like a broken Listening state instead of its own
  documented flat, non-glowing `background.surface` fill).
- **6 — Each state exists and looks acceptable in isolation.** Every Must-tier state from
  sprint-context is present and individually clean, but transitions between them aren't
  considered — e.g. skeletonLine count/width is arbitrary rather than judged per message length,
  or the jump from "Tap to send" to the next screen has no transition (a Known gap the system
  doc explicitly flags — building through it without addressing it is a 6, not a 9).
- **9 — States compose into a sequence, not a set.** Recording → Paused → Processing reads as one
  continuous take, not three disconnected screens. skeletonLine width/count is judged per moment
  rather than fixed. Hint restates only the missing part (per sprint-context, never the full
  question) — verified against actual hint copy, not assumed from the component. Every deliberate
  choice can be justified by a rule in voice-ux.md, sprint-context.md, or the design-system, not
  by "it seemed reasonable."

### UX judgment — High

**What it's scoring:** state coverage against the Must-tier list, hierarchy inside each screen,
and whether failure/edge paths are designed rather than assumed away — measured against
`docs/voice-ux.md`'s six principles and the brief's "never trap the student" rule.

- **4 — A required path dead-ends or is missing.** Permission denied doesn't route to text.
  Skip isn't present on a prompt or hint screen. The student can reach a screen with no way out
  (no skip, no text fallback, no cancel).
- **6 — Every Must-tier state exists and technically works, but the judgment behind edge cases is
  generic.** Processing shows a skeleton but doesn't calmly communicate "still working" the way
  Principle 6 asks for — it just spins. The primer explains permissions but doesn't follow the
  Babbel-style in-context framing sprint-context and voice-ux.md both point to. Nothing is
  broken, but nothing shows a specific judgment call either.
- **9 — Every Must-tier state built, every deferred item explicitly flagged (not silently
  dropped), and edge-case handling shows a specific, arguable decision.** System status is
  distinct and unmistakable at every step (idle/listening/paused/processing/result — no
  color-alone signaling, per Principle 1). The denied-permission state tells the student what
  they're missing and how to recover, not just "access denied." A close reading of the transcript
  vs. verdict framing shows the "misheard, not wrong" distinction from Principle 4 was actually
  designed, not assumed. If-time items (empty recording, judge timeout) are either built or
  explicitly logged as deferred — never quietly absent with no trace.

### Accessibility — Medium

**What it's scoring:** contrast, touch target size, and whether any state or meaning is
communicated by color alone — checked by measurement, not by eye.

- **4 — Fails a hard gate.** Body text below 4.5:1, a tappable target under 44pt, or a state
  (e.g. pass/partial/fail, recording vs. paused) distinguished only by color/hue with no shape,
  icon, or motion backup — a direct violation of Principle 1's "pair it with a shape, icon, or
  motion."
- **6 — Passes the gates but wasn't stress-tested on real placement.** Contrast was checked
  against the page background but not against the actual card/surface a text token sits on —
  exactly the trap sprint-context calls out for `text.tertiary`. Touch targets meet 44pt in the
  common case but a secondary control (like sessionBar's close, flagged as a non-token 44px
  hand-built frame) wasn't re-measured after implementation.
- **9 — Measured, not assumed, and verified in the harder case.** Contrast ratios were measured
  with a tool against the actual rendered surface, including tertiary text on cards. Every
  tappable element was measured at 44pt or larger, including icon-only controls. Every
  state-carrying color has a redundant non-color signal, checked by looking at the screen in
  grayscale or by listing states verbally without naming colors.

### Structure — Low

**What it's scoring:** the baseline — does the thing render, does the layout hold together at
390px, does navigation between screens actually connect.

- **4 — Broken.** A screen doesn't render, overflows the 390px frame, or a navigation action
  (skip, cancel, continue) doesn't lead anywhere or leads to the wrong screen.
- **6 — Renders and holds together.** Every screen displays at 390px without overflow or clipping,
  every action wired in `component-gaps.md`/SPEC.md routes correctly, dark mode applied
  throughout.
- **9 — Holds together under resize and rapid interaction, not just a static look.** Layout
  survives longer transcripts, longer prompt text, and repeated rapid taps (double-tapping
  cancel, tapping continue before a transition finishes) without breaking — confirmed by actually
  interacting with it, not by reading the JSX and assuming flex-wrap handles it.

---

## Hard gates

These are pass/fail, independent of the weighted score above. A failure on any gate is a defect
to fix regardless of how high the weighted total comes in — do not average a gate failure away.

- **Contrast.** Body text ≥ 4.5:1 against its actual rendered background (not the page background
  if the text sits on a card or surface token).
- **Touch targets.** Every tappable control ≥ 44×44pt, including icon-only controls and
  hand-built elements not yet backed by a token (e.g. sessionBar's close control).
- **No raw hex in component source.** Grep for `#` followed by a hex pattern in component and
  screen files — zero hits outside `tokens/tokens.json` itself and generated `build/css/tokens.css`.
- **No two states that should differ rendering identically.** Any pair of states the system
  distinguishes semantically — Listening vs. Paused, pass vs. partial vs. fail, idle vs.
  processing — must be visually distinguishable when rendered side by side. Render both and diff
  them; don't infer from the component definition that they differ.
