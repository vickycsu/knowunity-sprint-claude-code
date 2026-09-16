# Component proposals

Four gaps surfaced while checking the recall screens (see `SPEC.md`, Open)
against Storybook. Per design-system.md's own rule — "name the gap and propose
what you'd call the new component, then let a human decide" — these are
proposals, not built components. Nothing here should be treated as final until
it's been added to the Figma file and Storybook by whoever owns those.

Naming and shape below follow design-system.md's existing conventions:
camelCase component names, Title Case variant values, `show`-prefixed booleans
for visibility toggles, semantic tokens only.

---

## 1. `textInput`

**Why:** Two screens in the recall loop need typed text and neither can be
built without it — the text-fallback answer (`/recall/[term]/text`) and the
editable transcript in Recording → Paused (`/recall/[term]/recording`). No
text entry component exists in the library today.

**What it is:** A multiline text-entry surface that can be empty or prefilled.
Height behavior is determined by the consuming screen; it must not create an
internally scrolling region unless a specific use case requires it.

The editable transcript is an optional recovery path for misrecognition, not
a required step before submitting.

**Variant axis:** `state` — `Default` | `Focused` | `Disabled`.

**Props:**
```
value: string          // current text
placeholder?: string   // shown when value is empty
state?: "Default" | "Focused" | "Disabled" = "Default"
onChange?: (value: string) => void
autoFocus?: boolean
```

**Tokens:** border color follows `state` — `border.default` at rest,
`interactive.primary` when `Focused`, `interactive.disabled` when `Disabled`.
Text uses `text.primary`; placeholder uses `text.tertiary` (the same token
sprint-context already flags for contrast-on-cards — check it here too, this
sits on `background.surface`, not the page background).

**Doesn't do:** No validation states, no character counter, no multi-field
form pattern — this recall flow only ever needs one field on screen at a time.

---

## 2. `bottomSheet`

**Why:** "Explain more" on the Summary screen opens a bottom sheet over the
term row. Design-system.md's scaffold already reserves a `bottomSheetOnly`
slot and a `showBottomSheetBackground` scrim toggle for exactly this pattern —
but no actual sheet component was findable to put in that slot.

**Before treating this as a new component, verify which of these it actually
is:**
1. An existing component that simply wasn't documented.
2. A partial component (exists, but incomplete — e.g. no scrim, no variants)
   that needs finishing rather than building from scratch.
3. Merely an example or bare-bones asset in a screen file, never promoted to
   the reusable library.

What I checked so far: searched the published library on the sprint-context
Figma file (`SRxdKe78xKqws8V2CGvFCi`) for "sheet" and "scaffold" — zero
results for both. That only covers components *published* from that file,
not every local/unpublished node, so it rules out (1) but doesn't distinguish
between (2) and (3) — someone with Figma access to that file should check the
scaffold's `bottomSheetOnly` slot directly to see what's actually sitting in
it today before this gets scoped as new work.

**What it is:** A sheet that slides up from the bottom, with a scrim behind
it and a dismiss action, wrapping whatever content a screen needs to show
without leaving it.

**Variant axis:** none, pending the check above.

**Height behavior:** sized to its content up to some maximum, not full-screen
and not fixed-height. This recall use case does not require internal
scrolling — "Explain more" content is a paragraph or two. The component
should not introduce scrolling unless its content exceeds the available
height.

**Props:**
```
open: boolean
onClose: () => void
title?: string          // optional heading inside the sheet
children: ReactNode      // the sheet's content — e.g. the full explanation text
```

**Tokens:** sheet surface uses `background.surface` (elevated, same as any
raised card), corner radius on the top two corners only — check
`tokens/tokens.json` for whichever radius token the existing elevated surfaces
use, don't introduce a new one for this. Scrim reuses whatever token backs
`showBottomSheetBackground` today.

**Doesn't do:** No nested scroll region, no multi-step sheet, no drag-to-dismiss
gesture spec — keep it to tap-the-scrim-or-the-close-control to dismiss, since
that's all this flow needs.

---

## 3. `sessionBar` — add an "enable microphone" affordance

**Why:** Not a new component — a change to an existing one. After a mic
denial, the recall loop needs a persistent, visible way back to voice for the
rest of the session (and future sessions), living in the session bar per our
earlier decision. `sessionBar`'s current props (`progress`, `counterText`,
`xpLabel`, `onClose`) have no slot for it.

**The 24px height is a real constraint, not a detail to work around.**
`sessionBar`'s thickness is fixed at 24 (its own "Known gap" note already
flags this against the Close control's 44px frame). Any tappable addition
needs a real 44×44 interaction target per iOS guidance, which doesn't fit
inside a 24px visual bar. The bar itself shouldn't grow to accommodate this.
The existing Close control already appears to reconcile a 44×44 interaction
target with the 24px visual bar. Inspect that implementation before deciding
how another action should be accommodated — whatever pattern it uses is the
starting point, not something to solve fresh.

**Open question on shape, not just size:** is the right fix "add a mic chip,"
or should `sessionBar` expose a general-purpose contextual action slot that
this use case happens to be the first consumer of? A single-purpose
`showEnableMic` prop only solves this one case; a slot would also cover
whatever the next contextual session-bar action turns out to be. Worth
deciding which before building either.

**Not proposing `enableMicLabel` (or any string-label prop) yet.** If this
ends up being an icon-only / compact action rather than a labeled chip, a
text prop is solving the wrong problem. And if it does carry text,
Knowunity's other languages run longer than English — a fixed-width slot in
a 24px bar sized for "Enable microphone" may not survive translation. Get the
shape decision first; text handling follows from that, not the other way
around.

**Doesn't do:** Doesn't touch `sessionBar`'s existing progress/XP composition,
and doesn't assume `chips` is the right visual for this until the slot-vs-prop
question above is settled.

---

## 4. `mascotSlot` — add poses beyond `standby`

**Why:** Not a new component — `mascotSlot`'s own write-up in design-system.md
already frames it as "anywhere Knowie appears and needs to react to something
(correct, incorrect, listening, idle)," but the component's `pose` prop only
exposes `standby` today.

**Audit against the actual brand assets, not an invented pose list.**
`public/images/` already contains six Knowie images: `standby.png`,
`thinking.png`, `approving.png`, `excited.png`, `confused.png`,
`giggling.png` (plus `mascotSlotBase.png`, which looks like the frame/mask
the others sit inside, not a pose itself). Only `standby` is currently wired
up as a `pose` value — the rest exist as assets but aren't exposed by the
component. So this isn't "design new poses," it's "wire up poses that already
have art," and it should only cover the ones a recall state actually needs:

- **Idle/Prompt** → `standby`. Already wired, no change.
- **Processing** → `thinking`. This is the clearest existing asset match for
  the processing state; confirm with the mascot owner before treating the
  mapping as final.
- **Result: pass** → `excited` or `approving` both exist and both plausibly
  fit — this is a real choice for whoever owns Knowie's expression, not
  something to default silently.
- **Result: partial (hint 1/2) and Result: fail/reveal** → the brief's
  "judge generously" rule means neither of these should read as Knowie being
  disappointed. `confused` is the literal nearest asset but risks landing as
  discouraging in exactly the moment we need the opposite tone — this needs a
  read from whoever owns the mascot before it's assigned to either state, not
  a default. Until then, safer to leave both on `standby` than to guess.
- **Recording, Skip, Summary, say-it-back** — nothing in sprint-context or
  voice-ux.md calls for a distinct reaction at these moments. Not requesting
  poses here without a stated need, per "add only the poses that are actually
  required."

**Proposed props change**, covering only the states with a clean asset match:
```
pose?: "standby" | "thinking" | "excited" | "approving" = "standby"
```
`confused` and `giggling` stay unwired until the tone question above is
resolved, rather than being added speculatively.

**Doesn't do:** No animation/transition spec between poses, and doesn't
resolve the pass-state `excited` vs. `approving` choice or the
partial/reveal tone question — both need a decision from whoever owns
Knowie's expression, not a default I pick.

---

## What happens while these are open

Do not create reusable production components for these gaps until the
proposals are resolved. For screen exploration, temporary local
implementations are allowed only when they preserve the proposed interaction
and can be replaced without redesigning the screen.

In practice, naming by screen rather than number since SPEC.md's build order
can change (it already has once): I can still build and click through
Processing, Summary, Prompt, Text fallback, Recording, and Result with
throwaway local stand-ins for `textInput` (Text fallback, Recording) and
`bottomSheet` (Summary) — scoped to that screen's file, not exported as a
shared component — and with `sessionBar` (Processing, Prompt, Recording,
Result) and `mascotSlot` (same four) left exactly as they are today — no
enable-mic affordance, no poses beyond `standby` — rather than a stubbed prop
that would need
unpicking later. Nothing built this way gets promoted into the component
library; it's replaced outright once each proposal resolves.
