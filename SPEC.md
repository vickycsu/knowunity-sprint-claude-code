# SPEC

This prototype is the Next.js app in this repo (`src/app/`). Every screen listed
below is a page with its own route, reached by the student clicking through the
app — not a URL typed in or a state flag on one page pretending to be several
screens. Storybook (`npm run storybook`) stays the component catalog: every
component named below is a real export from `src/components/`, verified against
its Storybook docs before being named here.

## What we're building

A voice active-recall step inside Knowunity's study plan: after finishing a run
of topics, the student explains four terms out loud (or types them), gets up to
two hints before an answer reveal, and sees an honest summary of what they
actually know. Recall is entirely mocked — every transcript, verdict, and hint
is scripted, no audio leaves the device and no model is called.

## Screen list, build order

Easiest first — but "easiest" means cheapest to find out your components
don't fit together, not just fewest components. `SessionBar` appears on five
of the eight screens below and has a known open problem (its 24px fixed
height vs. a real 44×44 tap target, see `docs/component-proposals.md`). That
problem should surface on the simplest possible screen that uses it, with
nothing else going on, rather than for the first time on a screen that's also
juggling the permission primer, the hint ladder, or a missing icon — at that
point you can't tell which of three things broke. That's why Processing is
second, ahead of Prompt and Recording, even though Prompt runs first in the
actual user flow: it's the cheapest `SessionBar` + `MascotSlot` composition to
build, with zero other open gaps riding along with it.

### 1. Study plan (entry)
- **Route:** `/`
- **File:** `src/app/page.tsx`
- **States:** single static state. (A second state — the Review Again block —
  only appears once a session has produced terms that need it; see Screen 7.)
- **Components:** `TextBlock` (course / plan heading), `Button` (the recall
  card's tap target, primary, labeled with the term count, e.g. "Explain 4
  terms out loud" — see Open: no generic card component exists in the library,
  this is a placeholder pattern, not a documented one).
- **Student can:** tap the recall card.
- **Leads to:** `/recall/1/prompt` (term 1, first attempt).

### 2. Processing
- **Route:** `/recall/[term]/processing`
- **File:** `src/app/recall/[term]/processing/page.tsx`
- **Why second:** uses `SessionBar` and `MascotSlot` — components five of the
  eight screens depend on — with no other open gap riding along (no missing
  icon, no text-entry gap, no branching logic). Built with hardcoded dev props
  (a fixed term/progress) before Prompt or Recording exist to send it real
  data. If `SessionBar`'s height doesn't actually fit `MascotSlot` and the rest
  of a real screen, or the close control's 44×44 target doesn't reconcile with
  the bar the way `docs/component-proposals.md` assumes, this is where that
  shows up — cheaply, on a screen with nothing else to debug.
- **States:**
  - Normal — under the scripted delay, matches the brief's <4s target.
  - Taking a moment — past the scripted delay, a visibly different message
    ("Still thinking...") while the skeleton keeps animating, per the "if time"
    timeout decision.
- **Components:** `SessionBar`, `MascotSlot`, `SkeletonLine` × 3 stacked
  ("Stacked (Knowie bubble on Processing)" story — `width="100%"`, `"80%"`,
  `"60%"`), `TextBlock` (only in the "taking a moment" state, for the updated
  caption).
- **Student can:** nothing — this screen has no input, it resolves on its own.
- **Leads to:** auto-navigates to `/recall/[term]/result` once the scripted
  outcome resolves.

### 3. Summary
- **Route:** `/recall/summary`
- **File:** `src/app/recall/summary/page.tsx`
- **States:** default (loaded once all 4 terms have resolved); each `SummaryCard`
  row can be expanded independently via its own `expandedTerm` state.
- **Components:** `TextBlock` (XL, "Nice work" / session recap), up to three
  `SummaryCard` instances — `tone="Good"`, `tone="Partial"`, `tone="NeedsPractice"`
  — each populated with the terms that landed in that bucket via `term1`/`term2`/
  `term3`, `showRow2`, `showRow3`, and `onToggleTerm` to expand a row in place.
  `Button` (primary, "Continue").
- **Student can:** tap a term row to expand it in place; tap "Explain more" on
  an expanded row (see Open: no bottom sheet component exists); tap Continue.
- **Leads to:** Continue → `/` (which now shows the Review Again block if any
  term landed in Needed a hint or Needs practice).

### 4. Prompt (Idle)
- **Route:** `/recall/[term]/prompt`
- **File:** `src/app/recall/[term]/prompt/page.tsx`
- **States:**
  - Idle, mic available — resting state, question shown.
  - Idle, permission primer open — an in-context sheet over this same screen,
    shown only on the very first mic tap of the student's history (not per
    session, not per term).
  - Idle, mic denied — shown on every subsequent term once a mic permission
    denial has occurred, in this session or a past one; mic control replaced
    by text entry, `SessionBar` shows the "Enable microphone" affordance
    (see Open: no such slot exists on `SessionBar` today).
- **Components:** `SessionBar` (`progress`, `counterText` e.g. `"1/4"`,
  `xpLabel`, `onClose`), `MascotSlot` (`pose="standby"` — no other pose exists;
  see Open), `TextBlock` (the question), `ButtonIcon` (mic tap affordance —
  see Open: no mic icon exists in `src/components/icons`), `Button`
  (`variant="Tertiary"`, "Type instead"), `Button` (`variant="Tertiary"`,
  "Skip question").
- **Student can:** tap the mic, tap "Type instead," tap "Skip question," (first
  mic tap only) respond Allow/Don't Allow on the primer sheet.
- **Leads to:**
  - Tap mic (permission already granted, or Allow on primer) →
    `/recall/[term]/recording`.
  - Don't Allow on primer → same screen, now in the mic-denied state.
  - Tap "Type instead" → `/recall/[term]/text`.
  - Tap "Skip question" → silent transition, no acknowledgment screen, straight
    to `/recall/[term+1]/prompt`, or `/recall/summary` if term 4.

### 5. Text fallback
- **Route:** `/recall/[term]/text`
- **File:** `src/app/recall/[term]/text/page.tsx`
- **States:** entry (empty field), filled, sending.
- **Components:** `SessionBar`, `TextBlock` (the question), a text-entry
  surface (see Open: no text input/textarea component exists in the library —
  this screen cannot be built as documented components alone today), `Button`
  (primary, "Send"), `Button` (`variant="Tertiary"`, "Skip question").
- **Student can:** type an answer, send it, or skip.
- **Leads to:** Send → `/recall/[term]/processing`. Skip → same as Screen 4's
  skip.

### 6. Recording
- **Route:** `/recall/[term]/recording`
- **File:** `src/app/recall/[term]/recording/page.tsx`
- **States:**
  - Listening — `RecordingControl` `state="Listening"`.
  - Paused — `RecordingControl` `state="Paused"`, transcript shown, editable.
  - Discard confirmation — a contextual overlay, shown only when the student
    taps the `SessionBar` close while a take (recording or paused) is in
    progress; not shown from Idle.
- **Components:** `SessionBar`, `RecordingControl` (`state`, `text` matching
  the state's copy), a text-entry surface for the Paused transcript (see Open,
  same gap as Screen 5), `Button` (primary, "Send" — Paused only, per
  sprint-context's "labeled send control"), `ButtonIcon` (pause / resume, cancel
  — see Open: pause/resume/cancel icons aren't in `src/components/icons`
  either), `MascotSlot`.
- **Student can:** pause, resume, cancel & re-record (unlimited, free — never
  counts toward the hint ladder), send (only from Paused), or trigger the
  discard confirmation via close.
- **Leads to:**
  - Send → `/recall/[term]/processing`.
  - Cancel & re-record → same route, reset to Listening with a fresh take.
  - Confirm discard on close → `/` (progress up to the last resolved term is
    kept).

### 7. Result
- **Route:** `/recall/[term]/result`
- **File:** `src/app/recall/[term]/result/page.tsx`
- **States:**
  - Pass — Knowie quotes the student's words, affirms, +25 XP.
  - Partial, hint 1 ("Almost there") — quotes the accepted part, narrower
    question, +0 XP yet (XP lands only once the term fully resolves).
  - Partial, hint 2 ("Try again") — same template as hint 1, different copy,
    second narrower question.
  - Fail / answer revealed — the answer, "Next question" primary, "Try it in
    your own words" (say-it-back) secondary, +0 XP.
  - Empty / silent — its own minimal state ("Didn't catch that — try again"),
    not a reuse of fail.
  - Say-it-back (optional sub-state, entered from a hinted pass or from
    reveal) — an unaided repeat attempt before advancing; skippable.
- **Components:** `SessionBar` (XP chip updates live here), `MascotSlot`,
  `TextBlock` (Knowie's response + quote + hint/reveal copy — scripted per
  term, drafted by me for review, see "How the mocked recall behaves"),
  `Chips` (`color="Success"`, small XP-earned tag on pass), `ButtonGroup`
  (`variant="Vertical"` — primary/secondary pairing varies by state: partial's
  primary re-enters recording, pass/reveal's primary is "Next question").
- **Student can:** on partial, retry; on pass/reveal, advance (optionally via
  say-it-back first); on empty, retry.
- **Leads to:**
  - Pass or fail/reveal → `/recall/[term+1]/prompt`, or `/recall/summary` if
    term 4.
  - Partial or empty → `/recall/[term]/recording` (same term, next attempt,
    full machine reused per our earlier decision).
  - Say-it-back → records one more take through the same recording machine,
    then always advances regardless of its outcome (it's unaided practice, not
    a judged attempt).

### 8. Review Again (relaunch, not a new screen)
- Reuses Screens 4–7 exactly, scoped to the terms that landed in Needed a hint
  or Needs practice, launched from the Review Again block on `/` (Screen 1).
- **Student can:** tap "Start review" on the Review Again block.
- **Leads to:** `/recall/1/prompt` for a new session whose term set is the
  flagged concepts, not the original 4.

## Out of scope

- A parallel text-first experience, or text as anything other than a one-tap
  fallback from Idle.
- Entry from the Tools drawer, after a quiz/exam, or as a standalone feature.
- A start sheet or standalone first-run explainer.
- Session lengths other than 4 terms.
- Transcript editing after a verdict.
- Voice output or two-way voice conversation.
- Auto-detection of when the student has finished speaking.
- Mic hardware busy (on a call, etc.) — known gap, no UI, no fallback state.
- Student switching language mid-answer — known gap, no UI, no fallback state.
- A dedicated screen for noisy/garbled transcript or dropped network — both
  fall back to existing states (generous judging, and "leaving mid-session"
  respectively), no new screen.
- A real native permission flow, or any real browser mic/permission API call
  (`getUserMedia`, Permissions API) — the primer, the OS sheet, denial, and
  re-grant are all simulated UI state, end to end.
- Naming-convention normalization or Display L removal.

## How the mocked recall behaves

- Outcomes are scripted per term, not per input: the fixed 4-term session has
  a pre-assigned outcome for each term (e.g. term 1 = pass, term 2 = hint 1,
  term 3 = hint 2 → reveal, term 4 = skip or empty), so one run demonstrates
  every state without depending on what the tester actually says or types.
- Voice transcripts are pre-written per term, matching the intended outcome —
  the "what was heard" text is fixed content, not a reflection of the tester's
  actual speech.
- Knowie's quote-back and hint/reveal copy is drafted content, one set per
  term, flagged for review rather than final.
- The session is a single fixed scenario: one course, one set of 4 terms —
  not a data-driven engine that could take a different course or term set
  without rebuilding.
- XP is 25 for a pass, 10 for a hinted resolution, 0 for a reveal or a skip;
  it updates live in the `SessionBar` xpLabel at each Result.
- A skipped term and a revealed term are treated the same afterward: both land
  in Needs practice at 0 XP and both feed Review Again.
- Cancel & re-record is unlimited and never touches the hint ladder; only a
  sent (judged) attempt advances it.
- Session progress persists through a real page reload (not just in-memory
  React state), so "leaving mid-session" is verifiable by actually reloading.
- Mic permission denial persists across sessions, matching real iOS
  (no re-prompting after Don't Allow); tapping "Enable microphone" performs a
  mocked re-grant rather than linking anywhere real.

## Verification

Each item below is something a person or a script can actually run and get a
pass/fail on — not "confirm the flow works end to end." This list is also
most of the Module 12 rubric, arriving early rather than reconstructed at
submission time.

**Machine-checkable:**

1. `npm run dev` starts with no error output; `curl -sI http://localhost:3000/`
   returns `200`.
2. `npm run build` completes with no type errors.
3. `grep -rn "var(--[a-zA-Z-]*, " src/app src/components` returns nothing — a
   hit is a CSS fallback, which is a bug per CLAUDE.md's hard rule.
4. `grep -rnE "#[0-9a-fA-F]{3,6}\b" src/app` returns nothing outside
   `tokens/tokens.json` itself — a hit is a hardcoded color instead of a
   semantic token.
5. For every screen route, in a 390×844 viewport:
   `document.documentElement.scrollWidth <= 390` and
   `document.documentElement.scrollHeight` produces no horizontal scrollbar.
   Automatable with a headless-browser script that visits each route in
   `src/app/` and asserts this; manually, it's DevTools' device toolbar plus a
   look for any horizontal scroll affordance.
6. `window.matchMedia('(prefers-color-scheme: light)').matches` being `true`
   never changes what renders — force light mode in DevTools on every screen
   and confirm the page looks identical to dark mode (i.e. dark mode isn't
   conditionally applied, it's the only mode).

**Manual click-through — a specific run, not "click around":**

7. From `/`, tap the recall card, and go through three consecutive terms
   without editing the URL bar: at least one must resolve as a straight pass,
   and at least one must be a miss — walked through at least one hint before
   it resolves (pass on retry or reveal). Confirm the counter in `SessionBar`
   reads `1/4` → `2/4` → `3/4` → `4/4` in order, with no skipped or repeated
   number.
8. On one of those terms, tap "Type instead" instead of the mic, type
   anything, send it, and confirm it completes that term the same way a voice
   answer would — reaches Processing, then a Result screen, then advances.
   This is the concrete check that text and voice aren't two diverging
   implementations.
9. First mic tap of the run: confirm the permission primer appears before
   Recording opens. Reload the page and confirm the primer does not appear
   again on the next mic tap — this is the one check that actually exercises
   the persistence requirement, not just in-app navigation.
10. Reload mid-session after resolving at least one term, and confirm the
    resumed screen's `SessionBar` counter matches the last resolved term
    (e.g. shows `2/4`, not `1/4` and not `4/4`).
11. Mid-recording, tap the `SessionBar` close and confirm a discard
    confirmation appears before the take is lost; from Idle, tap close and
    confirm it exits with no confirmation step.
12. Complete all 4 terms, reach `/recall/summary`, and confirm every term
    that was answered appears in exactly one of the three buckets — count
    them, the total across buckets must equal 4.
13. Tap "Start review" from the Review Again block and confirm the new
    session's term count matches the number flagged in Needed a hint plus
    Needs practice, not 4.
14. For every component instance in the built screens, `docs-show` its
    Storybook entry and confirm every prop passed in code appears in that
    component's documented `Props` type — this is a literal diff, not a
    judgment call.

## Open

Things we discussed that aren't decided, or that surfaced while checking the
component library against this screen list — flagging rather than picking:

- **No generic card/entry component.** The recall card on `/` and the Review
  Again block are both being represented with `Button`/`TextBlock` directly on
  the page rather than a dedicated component, because none exists. Confirm
  that's acceptable or name what a real component should look like.
- **No text input/textarea component exists anywhere in the library.** This
  blocks the Text fallback screen (5) and the editable transcript in Recording
  → Paused (6) as documented components. Needs a decision before either can be
  built to spec.
- **No bottom sheet component exists.** Blocks "Explain more" on the Summary
  screen (3) as a documented component.
- **No mic, pause, resume, or cancel icon exists in `src/components/icons`.**
  `ButtonIcon` requires an `icon` prop but there's nothing to pass it for the
  mic tap (Screen 4) or the in-recording controls (Screen 6).
- **`SessionBar` has no slot for the "Enable microphone" affordance** we
  decided belongs there — its documented props are `progress`, `counterText`,
  `xpLabel`, `onClose` only. Adding one is a system-owner decision, not
  something to bolt on unilaterally.
- **`SummaryCard` caps at three terms per tone** (`term1`/`term2`/`term3`).
  With only 4 terms total this is usually fine, but the scripted-per-term
  outcome set must be written so no single bucket ever needs a 4th term, or
  the component needs to change.
- **`MascotSlot` only has a `standby` pose.** Result, Recording, and
  Processing all imply Knowie reacting (correct, incorrect, listening) per
  design-system.md's own description of the component, but no other pose is
  documented as existing yet.
- Whether an empty/silent result consumes a hint-ladder attempt, or is treated
  as a free retry outside the ladder, wasn't settled.
- Whether the discard-confirmation on close (Screen 6) is its own route or an
  in-page overlay/dialog wasn't settled — written above as an in-page overlay
  as the more likely reading of "every screen is a page with its own route,"
  but worth confirming since it's the one interaction in this spec that isn't
  clearly one or the other.
