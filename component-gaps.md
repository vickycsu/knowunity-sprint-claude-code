# Component gaps

Gaps found while building screens against `docs/design-system.md`'s component
list. Per `build-screen`'s process: built inline from semantic tokens where
possible, logged here rather than stopping. Anything needed on a second
screen gets promoted to a real component with a Storybook story instead of
inlined again — noted below where that's already happened.

## Shared: LeavingSheet (`src/app/recall/_components/LeavingSheet.tsx`)

Matches Figma's "Screen 14 / Leaving mid-session" exactly (mascot, "Leaving
already?" title, `Button` "Keep going", "Save progress and exit" link — all
colors confirmed via bound Figma variables, including
`text.link-hover` for the exit link, which is unbound raw color in Figma but
matches that token's value exactly).

Wired to every recall-loop screen's `SessionBar` close button: Processing,
Prompt, Recording, and Result. This **replaced** an earlier ad-hoc "Discard
this take?" dialog built for the Recording screen before this real Figma
frame had been checked — that invented dialog is now deleted (component and
CSS) in favor of the actual designed pattern, which turns out to be the same
one used everywhere else, not something Recording-specific. Lesson: don't
invent a confirmation dialog's content/copy without checking whether Figma
already specifies one, even under a differently-named screen ("Leaving
mid-session" wasn't an obvious search target from "discard this take").

Lives in a Next.js private folder (`_components`, excluded from routing)
since it's specific to the recall flow, not a general design-system atom —
promoted to a shared implementation per the "needed twice, stop inlining it"
rule, since it was needed by four screens simultaneously once found.

## Screen 1 — Study plan (`/course/biology/plan`, moved from `/` — see Screen 01 below)

- **App bar, tabs, topic pill, topic path (node ring + label), bottom nav
  bar** — none of these exist as components in Storybook or
  `docs/design-system.md`'s list. All built inline in `src/app/page.tsx` from
  semantic tokens only. `appBar` is listed in design-system.md as "exists in
  the library but isn't used in any current screen" — this screen is the
  first to need it, and it still isn't built, so it's inlined here too.
- **Path node "done" ring uses a violet gradient fill in Figma**
  (node 15671:10998, stops #7080eb → #beacfc), same class of gap as
  `RecordingControl`'s Listening bloom. First pass wrongly substituted a
  green `feedback.success` treatment (caught by comparing a screenshot of
  the actual Figma frame against the built page — wrong hue family
  entirely, not just an approximation); second pass substituted a flat
  `border.focus`. **Closed:** `accent.brand.ring-gradient` now exists as a
  real semantic token (`tokens/tokens.json`) and is what `plan.css` actually
  consumes (`var(--color-accent-brand-ring-gradient)`) — this is no longer a
  raw-value exception, it was left saying so after the token landed. The
  135deg angle is still a clean approximation of Figma's gradient transform
  matrix, not a 1:1 derivation, which is the one part of this gap that's
  still real.
- **Ring icons sized at `IconSlot size="250"` (20px) initially looked too
  small for the 64px ring** (Figma's icon-to-ring ratio is closer to 0.35).
  Bumped to `size="300"` (24px) for a closer match.
- **Path node ring diameter is 80px in Figma; no token equals 80.** Built at
  `size.illustration.800` (64px) instead — nearest existing token, not an
  invented value. Logged as a Figma diff, not a token gap to fix.
- **Nav bar background is `color.neutral.950` (#0a0a0a) in Figma, with no
  semantic alias** (`background.page` is the nearest semantic near-black, at
  `color.navy.950-2` / #090c18 — a different primitive). Substituted
  `background.page`. Flag to the system owner if the exact neutral-black is
  required.
- **Nav bar's "Scrim" is an unbound gradient** (fade-to-black behind the nav
  content) — omitted; nav bar uses a flat semantic background instead.
- **Star, quiz, chat, and folder icons were first built as hand-drawn inline
  SVGs**, approximating shapes rather than using real vectors. Figma tags the
  done-node icon explicitly as `icon / star (lucide)`, confirming Lucide as
  the source library — added `lucide-react` as a new dependency (confirmed
  with the design owner first, per CLAUDE.md's "no new dependencies without
  asking" rule) and swapped in the real `Star`, `ClipboardList`, and `Folder`
  icons.
- **Folder icon's stroke color is a bound Figma variable, `border/focus`** —
  confirmed by resolving the actual variable binding (not just a matching
  hex). Corrected from an earlier guess (`text.link-hover`, same hex value by
  coincidence, wrong semantic source) to `border.focus`.
- **Nav bar's chat icon is a custom `myai-chat` component in Figma** (a
  bot-in-a-bubble shape), not a generic message icon — `MessageCircle` was a
  weak match. Lucide has no exact equivalent; swapped to `BotMessageSquare`
  as the closest semantic match (AI-chat, not just chat). Still an
  approximation, flagged as such — not a pixel match to the custom Figma
  component.
- **Plan meta row's icons ("akar-icons:calendar" and
  "fluent:target-arrow-16-regular" in Figma) are from two more icon sets
  entirely**, added when the design owner updated the Figma file. Rather than
  adding two more icon library dependencies for two icons, substituted
  Lucide's `Calendar` and `Target` — approximations, not the exact Figma
  vectors.
- **Topic pill's book icon** ("akar-icons:book" in Figma, 24x24, another
  icon set) — substituted Lucide's `BookOpen` (per feedback, an open-book
  shape specifically), same reasoning as the meta icons
  above.
- **Topic pill's vertical divider (between the label and the book icon) has
  no corresponding node in Figma at all** — added directly per explicit
  request, not sourced from the design file. Styled with `border.strong`
  (the same token the sheet handle already uses) as a reasonable subtle-line
  choice, not a value confirmed against Figma. Flag if the design owner adds
  a real divider spec later — this should be checked against it, not assumed
  correct.
- **Settings drawer (kebab menu + bottom sheet with Create new plan / Edit
  plan / Share plan / Give feedback / Delete plan) is entirely outside this
  sprint's decided scope.** None of it is in `docs/sprint-context.md`'s
  Decisions, and it isn't part of the recall feature at all — it's generic
  study-plan chrome, added per explicit request with a reference screenshot
  from the live app. Built as a screen-scoped local sheet (same throwaway
  pattern as the Summary screen's "Explain more" stand-in, since no
  `bottomSheet` component exists) with a kebab (`EllipsisVertical`) button in
  the app bar. Every row is fully mocked — tapping any of the five rows just
  closes the sheet; none of them navigate anywhere or perform a real action,
  since none of those actions (creating/editing/sharing/deleting a plan,
  feedback) are decided or built anywhere in this prototype. Colors sourced
  from tokens.json's `accent` semantic family (green/brand/coral/magenta,
  matching the screenshot's palette almost exactly) plus `feedback.error` for
  the destructive row — all real semantic tokens, not invented.
- **Mic icon** — needed here (current-node ring) and by SPEC.md's Screen 4
  (Prompt, not yet built) — promoted straight to a shared component,
  `src/components/icons/MicIcon.tsx`, per the "needed twice" rule. Not
  explicitly tagged "(lucide)" in Figma like the star icon, but now sourced
  from `lucide-react`'s `Mic` for consistency with the rest of the file's
  confirmed icon library, rather than a hand-drawn approximation.
- **Nav bar icon colors initially both built as `text.secondary`** — a
  screenshot comparison against the Figma frame showed the folder icon is
  actually violet-stroked (`text.link-hover`, `#a78bfa`, exact match) while
  the chat icon is the dimmer white (`text.secondary`, as originally built).
  Corrected the folder icon only.
- **Nav bar's two nav-button labels are literal placeholder text ("Label") in
  Figma itself**, and its avatar needs an image asset that doesn't exist in
  `public/images/`. Built the nav bar's structure (bar, two icon slots,
  avatar circle) without labels or a real avatar image — decision confirmed
  with the design owner rather than shipping placeholder copy as real
  content.
- **iOS status bar and home indicator omitted entirely** — device chrome, not
  app content, not in Storybook, and redundant in a browser viewport.
  Confirmed with the design owner.
- Tabs are visual only (Plan shown active, Materials inactive) — no tab
  switching behavior, since Materials isn't part of this sprint's scope.
- Done/todo topic nodes are non-interactive display only — tapping them isn't
  specified anywhere; only the "Explain it out loud" (current) node is a real
  tap target, per SPEC.md and sprint-context.md.
- **Back button (top-left of the app bar, mirroring the kebab) has no
  corresponding element in Figma's frame at all** — re-checked the live App
  bar node directly, still just Title + Plan meta. Added per explicit
  request now that the screen has a real parent in the route hierarchy
  (`/course/biology`) to go back to. `ChevronLeft` from the same approved
  `lucide-react` set, positioned as the mirror image of the settings kebab.
- **Back/kebab tap targets corrected from 48px (`space-1200`) to a literal
  44px** — the user asked to confirm the tap target was 44px; it wasn't.
  44 isn't on the spacing scale (nearest tokens are 40/48), so this uses a
  raw value rather than a token, matching the exact precedent already
  established and logged for `SessionBar`'s close control (see the plan's
  Appendix). Also bumped both icons from `IconSlot size="200"` (16px) to
  `size="300"` (24px) — the chevron read as too small at 16px inside even a
  correctly-sized tap target.
- **"After session" state added** (Figma's "Screen 18 / Plan: Unit 2, after
  the session"), reached via a `?afterSession=1` query param. First pass
  only reachable as a manual dev preview — nothing in the actual flow
  navigated there, so finishing a real session never showed it. Fixed:
  Summary's close (X) and "Continue" both now navigate to
  `/course/biology/plan?afterSession=1` instead of the bare route, so
  completing (or exiting from) Summary — the actual end of the session —
  reaches this state for real. Still a query param rather than persisted
  session state (no shared storage connects the recall loop's actual
  per-term outcomes back to this screen), so the Review Again block always
  shows the same two example concepts regardless of what actually happened
  in the session just finished — that's the next real gap if this needs to
  reflect true results.
  - "Explain it out loud" flips to `done`; a new `current` node, "Practice
    Exam," appears after it. Practice Exam has no destination anywhere in
    SPEC.md/sprint-context.md and no Figma link either — non-interactive,
    like other static nodes.
  - Figma's own example also shows 2.4/2.5 flipping to `done`, which reads
    like unrelated further progress bundled into the same illustrative
    frame rather than something completing the recall session would
    actually cause — **not** copied; only the just-completed step changes
    state.
  - "Practice Exam"'s icon is Figma's `hugeicons:quiz-03`, a library not
    used anywhere else in this project — substituted Lucide's
    `ClipboardCheck` (closest match, distinct from the plain `ClipboardList`
    already used for todo nodes) rather than adding another icon library.
  - **Corrected the done-ring icon color while cross-checking this
    screen**: was `text.inverse` (an approximation from Screen 1), actually
    binds to `accent.brand.on-bold` in Figma. Fixed in the shared
    `.topic-ring--done` style, so both the before- and after-session states
    get the correct color.
  - **Added the "·" separator** between "6 days left" and "Grade goal: A"
    (Figma has one; the original Screen 1 build didn't) — additive only,
    did not revert the larger `space-400` gap between those two items from
    an earlier explicit request, even though Figma's own spacing there is
    tighter (`space-200`).
  - **Review Again block**: label + card (concept pills, "Start review").
    Concept names ("Nucleus," "Osmosis") are Figma's own example content,
    not derived from this build's actual per-term outcome data —
    `terms.ts` doesn't assign human-readable concept names per term yet,
    and Summary's hardcoded bucket terms were built independently of
    `terms.ts` to begin with, so there's an existing data-consistency gap
    across screens this doesn't resolve.
  - **"Review again" label size iterated twice.** Figma spec'd
    `caption-m-bold` (12px) — read as too small to stand out, bumped to
    `headline-s` (21px Bold, matching the screen's title) — then that read
    as too big, dialed back to `headline-xs-bold` (18px) as a middle
    ground. Also removed the "Concepts from your last session"
    intro line entirely, and moved the "Review again" label from a separate
    line above the card to inside it. All deliberate deviations from the
    Figma frame, not oversights.
  - **Review Again card is now sticky to the bottom of the screen**, per
    explicit request — moved out of the scrollable `.study-plan__body`
    (which changed from `min-height: 100vh` page-scroll to a fixed
    `height: 100vh` container with the body itself scrolling internally,
    `overflow-y: auto; min-height: 0`). The card and the nav bar below it
    now sit outside that scrolling area, so they stay visible while the
    topic path scrolls independently. This is a real layout-model change
    (not just spacing), and it's a further deviation from Figma, which
    doesn't show or specify this behavior at all — built purely from the
    request, not a source frame.
  - **"Start review" matches no documented `Button` variant** — a violet
    fill (`accent.brand.bold`/`accent.brand.on-bold`) that none of Primary
    (off-white)/Secondary (navy)/Tertiary (transparent) produce. Built
    inline with the real bound colors.
  - **"Start review" navigates to the same fixed 4-term session**
    (`/recall/1/prompt`) as the regular recall card — SPEC.md's actual
    decision ("a new session whose term set is the flagged concepts, not
    the original 4") isn't implemented; that needs the outcome-tracking
    system this prototype doesn't have yet. Flagged rather than faked.

## Screen 2 — Processing (`/recall/[term]/processing`)

*(Retroactively documented — this section was missing from earlier versions
of this file despite the screen being built and its gaps discussed with the
user; reconstructed here from the actual implementation and conversation
history so this file stays a reliable pre-read for future screens.)*

- **2 stacked `SkeletonLine`s, not 3** — Figma's actual "Knowie bubble" (node
  15666:1129) has exactly two skeleton lines (262px, 197px wide), not the
  three Storybook's generic "Stacked" story example uses.
- **Mascot size is `2XL`** (120×120, matching Figma exactly), pose
  `"thinking"` — required extending `MascotSlot`'s `pose` prop (previously
  only `"standby"` existed) to wire up the already-existing `thinking.png`
  asset. This was the first of two screens/decisions where a `MascotSlot`
  pose got extended for real use.
- **Caption copy is real, not placeholder**: "Knowie is reading your answer"
  (normal state) — taken directly from the Figma frame.
- **`SkeletonLine` had no animation at all — a real pre-existing gap, not
  just a polish request.** `voice-ux.md`'s Principle 6 explicitly requires
  "a skeleton/animated state, not a dead spinner"; the component shipped as
  a static bar. Added a plain opacity pulse (`@keyframes`, no new token
  needed) plus a `prefers-reduced-motion` guard. Shared-component change —
  every future consumer of `SkeletonLine` gets this animation now, not just
  Processing.
- **`MascotSlot`'s "thinking" pose got a subtle bob animation**, scoped to
  that pose only (`standby` stays static, since it's the resting pose used
  everywhere else). Required exposing `pose` as a CSS class
  (`mascot-slot--${pose}`) — previously only `size` was exposed this way.
  Also a shared-component change, `prefers-reduced-motion`-guarded.
- **Storybook's `test-run` tool errored with "Tests are already running"**
  on both animation changes — likely a stuck job left over from the earlier
  timeouts on the Recording screen's `RecordingControl` change.
  `stories-preview` worked and returned live URLs
  (`components-skeletonline--default`,
  `components-mascotslot--pose-thinking`); confirmed the actual CSS animations
  compiled and serve correctly via a direct build-output check instead.
  Worth restarting Storybook's test runner if this keeps happening.
- **No Figma frame exists for the "taking a moment" (slow-processing)
  state** — sprint-context.md lists it under "If time," not "Build." Added a
  dev-only `?slow=1` query param to preview it on demand
  (`/recall/1/processing?slow=1`), with copy from SPEC.md's own example
  ("Still thinking..."). Undocumented decision, not written down anywhere
  else.
- **`SessionBar` receives hardcoded dev props** (`progress`, `counterText`,
  `xpLabel`) since Prompt/Recording didn't exist yet at the time to feed it
  real state — now that Prompt exists (see Screen 4 below) and links here,
  this remains hardcoded per-term rather than passed via route state; a
  future pass could thread real session state through instead.
- **An empty, unlabeled "Link / Cancel" frame** (342×40, zero children) sits
  in the Figma body with no bound text or icon — read as a stray/leftover
  layer, not a real affordance, and not built. Contradicts SPEC.md's own
  "Student can: nothing" for this screen if it were real.
- Status bar and home indicator omitted, same decision as every other
  screen.

## Screen 4 — Prompt (`/recall/[term]/prompt`)

Matches Figma's "Screen 04 / Prompt" (node 15666:1058) closely for the base
"Idle, mic available" state — the only state with a Figma frame today.

- **`SessionBar`'s progress bar renders as a linear/pill shape in this
  frame** (a filled rectangle inside a rounded track), not the ring shape
  our built `ProgressIndicator`/`SessionBar` components use. This is a
  pre-existing discrepancy between Figma and the shipped component (visible
  on Processing's `SessionBar` too, just not noticed until inspecting this
  frame's progress bar closely) — not something to fix ad hoc in this
  screen, since `SessionBar` is shared across the whole recall loop per
  design-system.md. Flag to the system owner: either the component or the
  Figma frame is out of date with the other.
- **Neither the mic button nor "Type instead" matches any documented
  `Button`/`ButtonIcon` size.** The mic button is 104px in Figma — larger
  than `ButtonIcon`'s biggest size (`L`, 56px) by a wide margin. Built
  inline instead. First pass used `illustration.1500` (120px, nearest
  existing token) but that visibly overshot — corrected to the real 104px
  value directly, same "use the exact value" exception as the topic-ring
  gradient and the 44px tap targets elsewhere. **Closed:** `size.illustration.1300`
  (104px, this row's mic) now exists as a real semantic token and is what
  `prompt.css`/`result.css` actually consume — this is no longer a
  raw-value exception, it was left saying so after the token landed. (The
  hint row's smaller 88px mic below is also tokenized, as
  `size.illustration.1100`.) Its icon is 46px in Figma;
  `IconSlot`'s largest documented size is `size="400"` (32px) — used at that
  ceiling since no larger documented size exists, rather than inventing one.
  "Type instead" is a 44px bordered ghost circle — closer to
  platform-minimum sizing than to `ButtonIcon`'s Tertiary variant (which has
  no border in its documented CSS) — also built inline.
- **The mic and "Type instead" buttons were first laid out as a flex row
  with one `gap` value, which was wrong.** Checking the actual Figma
  coordinates (not just component sizes) showed the mic is independently
  centered in its row (dead center of a 342px-wide row) while "Type
  instead" is pinned near the right edge, ~30px from it — the two aren't a
  coupled pair at all. A shared-gap flex row inevitably pulled the keyboard
  icon toward the mic no matter the gap value. Corrected: mic centered via
  the row's own `justify-content: center` (as the only in-flow child),
  "Type instead" pulled out of flow with `position: absolute; right:
  space.700` (28px, nearest token to Figma's 30px edge offset). Worth
  remembering for future screens: check child *positions*, not just sizes,
  when a Figma frame has `layoutMode: NONE` instead of auto-layout.
- **"Skip question" is bare text in Figma, not a `Button` component** —
  SPEC.md's original write-up assumed `variant="Tertiary"` `Button`, but the
  actual frame has no button chrome at all, just a text link (15px
  SemiBold, `text.primary`). Built to match the frame, not SPEC.md's
  speculative component list.
- **Questions are per-term draft copy, not final** — only term 1's question
  ("what does the cell membrane do?") is Figma's actual authored text; terms
  2–4 are placeholders standing in for scripted content that's Result
  screen work (SPEC.md Screen 7), not built yet. Terms match the four
  already hardcoded on the Summary screen (Plasma Membrane, Cell Structure
  and Function, Osmosis, Membrane Transport).
- **Permission primer and mic-denied states are not built** — no Figma frame
  exists for either today (separate frames: "Screen 12 / Mic access denied"
  in the Edge Cases section, not yet built). Only the base "Idle, mic
  available" state from this specific frame is implemented.
- **Mic tap navigates straight to Recording** (`/recall/[term]/recording`,
  now built — see Screen 5 below), skipping the permission-primer check
  entirely, since that state isn't built anywhere. Flagged, not silently
  decided as final behavior.
- **"Type instead" routes to `/recall/[term]/text`, which doesn't exist** —
  no `text/` route is built anywhere under `src/app/recall/[term]/`, so
  every tap 404s. This was previously flagged only for the hint screens
  (which have no "Type instead" control at all, see Screen 7 below) — this
  is the separate, more serious instance: the control here is visually
  present, looks functional, and is the brief's one non-negotiable
  non-voice fallback, so a student commits to it before discovering the
  dead end. Same defect on Result's own mic row and Result: Empty's "Type
  instead" link (see Screen 7). Flagged now rather than left silent; not
  fixed this pass — building a real text-entry screen is out of scope for
  a cheap fix.
- Status bar and home indicator omitted, same decision as every other
  screen.

## Screen 5 — Recording (`/recall/[term]/recording`)

Matches Figma's "Screen 05 / Recording" (Listening) and "Screen 05a /
Recording, paused" closely.

- **`RecordingControl` initially needed zero changes** — its Listening/Paused
  sizes, gradient stops, and text colors all matched Figma's bound
  variables exactly on inspection (`accent.brand.on-subtle` →
  `interactive.primary-active` gradient, `text.on-accent` label). First
  screen in this build where a documented component required no adjustment
  at first pass.
- **`RecordingControl`'s Listening size was then reduced from Figma's exact
  spec, per explicit request.** The real 225px circle / 178px bloom / 52px
  glow read as too large in practice, and the glow was bleeding into the
  adjacent pause button regardless of layout spacing. Reduced to 180px /
  140px / 32px — real pixel values, not on the illustration scale (which
  jumps from 120 straight to 178/180, nothing between, so no token fits a
  smaller Listening state). This is a **shared-component change**, not a
  screen-local one — it affects every future screen that uses
  `RecordingControl`'s Listening state. Flag to the system owner: this is
  now a deliberate deviation from the Figma source, not a match to it.
- **`RecordingControl`'s Paused size followed up the same way** — Figma's
  180px flat circle now read as bigger than Listening's shrunk 140px bloom,
  making the "quieter" Paused state look larger than the "active" Listening
  one. Shrunk to match at 140px. Same shared-component-change caveat as
  above.
- **"Listening..." label removed entirely**, per explicit request — "Paused"
  still shows in the Paused state, but nothing renders during Listening.
  The reserved vertical space above the record row now only exists in the
  Paused state, so the layout shifts slightly between states; not treated
  as a bug since removing the label was the explicit ask.
- **Storybook's `test-run` tool timed out twice** attempting to verify this
  change (a pure CSS size/blur edit, no prop or behavior change) —
  `stories-preview` succeeded and returned a working preview URL, so
  Storybook itself was reachable; the test-runner specifically didn't
  respond. Recorded here since the change went out without that automated
  check completing — worth a manual look at
  `components-recordingcontrol--state-listening` if precision matters.
- Also added real spacing (`space.400`, screen-local, not touching the
  shared component) between `RecordingControl` and the side buttons in
  `recording.css` — Figma specs `gap: 0` here, but the glow bleeds past the
  box regardless of the control's own size, so zero gap reads as crowded at
  any scale.
- **Interaction reading is a judgment call, not explicit anywhere.** Figma
  literally labels the big circle "Tap to send" during Listening (matching
  `RecordingControl`'s own default text) and shows a separate small
  pause-icon button beside it. Read literally: tapping the big circle sends
  immediately (skipping an explicit pause), and the small button is an
  optional path to pause-then-review before sending. This reconciles with
  sprint-context.md's "explicit start/stop... before sending" without
  requiring a mandatory pause step. Implemented this way; flagging since
  sprint-context.md doesn't explicitly confirm this reading over "the big
  circle should always pause, never send directly."
- **Transcript field uses a plain paragraph while Listening, a real
  `<textarea>` while Paused** — sprint-context.md decides the transcript
  "is editable before sending," and no `textInput` component exists yet
  (`component-proposals.md` #1, still unresolved). Built inline per that
  proposal's own guidance for what to do while it's open. Textarea styling
  (dim `text.tertiary` at rest, `text.primary` on focus) matches the
  proposal's own drafted default/focus states, realized here for the first
  time.
- **Per-term transcripts are draft copy**, same status as the Prompt
  screen's questions — only term 1's matches Figma's actual authored text;
  terms 2–4 are placeholders for scripted content that's Result screen work
  (SPEC.md Screen 7).
- **~~Discard-confirmation dialog has no Figma frame~~ — corrected.** First
  pass invented a "Discard this take?" dialog since SPEC.md's own Open
  section flagged this as unsettled. It wasn't unsettled — Figma has a real
  frame for it ("Screen 14 / Leaving mid-session"), just not filed under a
  name that reads like "discard." Replaced with the shared `LeavingSheet`
  (see the top-level "Shared: LeavingSheet" entry) — same component now
  used on every recall-loop screen's close button, not a Recording-specific
  dialog.
- **`SessionBar` close always triggers the `LeavingSheet`** on this screen
  — per SPEC.md, Recording has no Idle state, so every close tap happens
  mid-take.
- **Closed:** `.recording__send` (the Paused-state "Send" link) had no
  enforced touch target — `padding: 0`, no `min-width`/`min-height`, unlike
  every other tappable text control in this codebase. Not the sole way to
  submit (tapping the large `RecordingControl` circle while Listening sends
  directly, per the "Interaction reading" note above), but a real hard-gate
  failure on the path a student takes if they've already paused. Fixed to
  the same `min-width/min-height: var(--color-size-space-1100)` (44px)
  pattern already used on `.result__skip`/`.result__link`.
- **Cancel & re-record resets the transcript to the term's scripted
  default**, not empty — recall is mocked/deterministic, so a "fresh take"
  reproduces the same scripted transcript rather than simulating a new
  recognition result.
- Status bar and home indicator omitted, same decision as every other
  screen.

## Screen 7 — Result (`/recall/[term]/result`) — Pass, Hint 1, Hint 2, Reveal, Empty

Matches Figma's "Screen 07 / Correct", "Screen 08 / Hint", "Screen 09 /
Second hint", and "Screen 10 / Answer revealed" closely. This screen
surfaced a real structural discovery, not just a styling gap:

- **Figma merges the Result (pass) acknowledgment with the *next* term's
  prompt onto one screen** — the affirmation ("That's exactly right.") and
  the next question sit in the same bubble, and the same mic/keyboard/skip
  controls from the Prompt screen appear directly below, now targeting
  `nextTerm` instead of `term`. This isn't what SPEC.md's original Screen 7
  write-up describes (a standalone result screen navigating to a *separate*
  `/recall/[term+1]/prompt` route) — SPEC.md's routing model says "every
  screen is a page with its own route," so this page renders the merged
  view but still treats tapping mic/keyboard/skip as real navigations to
  `/recall/[nextTerm]/recording`, `/text`, or the skip logic, rather than
  answering inline with no URL change. This reconciles the "one beat of
  acknowledgment, then next prompt" brief language with the routes-per-screen
  architecture, but it's an interpretation, not a confirmed decision — flag
  if the intent was actually to answer the next question without any
  navigation at all.
- **The "Correct" verdict pill matches no documented component.** `Chips`
  only has "inactive" (`background.surface`) or "active" (solid bold fill)
  — Figma's actual treatment is a third combination (subtle fill + bold
  border + on-subtle text/icon) that Chips doesn't expose. Built inline;
  all three colors confirmed via bound Figma variables
  (`feedback.success.subtle/bold/on-subtle`), reusing the existing
  `CheckIcon` component.
- **No Figma frame exists for the last term (4) passing** — Figma's example
  is specifically term 1→2. Built a fallback for `term >= 4`: affirmation
  only, no merged next-question, and a single `Button` "Continue" to
  `/recall/summary` in place of the mic row. A judgment call, not a
  confirmed design.
- **Per-term affirmation copy is draft**, same status as every other
  scripted line in this loop — placeholders pending real Result screen
  content (SPEC.md's own "flagged for review, not final").
- **Hint 1, Hint 2, and Reveal are now built** for term 2, per explicit
  request ("term 2 is partially correct, two hints, then moves on"). Only
  Empty/silent remains unbuilt (no Figma frame inspected yet).
- **Per-term data consolidated into one shared module**
  (`src/app/recall/_lib/terms.ts`) — Prompt, Recording, and Result each had
  their own slightly-different per-term dictionary before this; the hint
  flow needs the same attempt-sequence data in all three, so it's now one
  source of truth (`TERMS[term].attempts[]`) instead of three drifting
  copies. XP is now computed from actual verdicts
  (`xpEarnedBefore`/`xpForTerm`), replacing the old `25 × term`
  simplification everywhere it was used (Prompt, Recording, Processing,
  Result all updated).
- **Attempt number is carried via a `?attempt=` query param**, not a route
  segment — `/recall/[term]/recording?attempt=2`,
  `/recall/[term]/result?attempt=2`. Treated as real state (unlike the
  `?slow=1` dev-only toggle on Processing) since it's genuinely part of
  where the student is in a term's retry loop, but it's a judgment call:
  SPEC.md's "every screen is a page with its own route" could also read as
  wanting `/recall/[term]/result/[attempt]` as a route segment instead.
- **Recording's question bubble on a retry shows the *previous* attempt's
  full response** (`questionForAttempt` in `terms.ts`), not a separate
  "question" field — Figma's hint Result screens already embed the
  narrower follow-up question inside Knowie's response text, so reusing
  that text is what actually produces the narrowed question on the retry
  screen. Not an explicit SPEC.md decision, inferred from how the content
  is structured in Figma.
- **Hint screens (Hint 1/Hint 2) have no "Type instead" fallback at all** —
  checked Figma directly, the Mic row there has only the mic button (88px,
  smaller than the 104px used elsewhere), no keyboard icon. This
  contradicts voice-ux.md's own "always offer a non-voice path" hard rule.
  Matched the frame exactly and flagged the conflict rather than silently
  adding a keyboard button Figma doesn't show, or silently dropping the
  voice-ux.md principle.
- **The mic-row "Type instead" and Empty's "Type instead" link on this
  screen both route to `/recall/[term]/text`, which 404s** — same
  unbuilt-route defect as Screen 4's Prompt "Type instead" (see above), now
  confirmed on both the Result mic row and Result: Empty. Every "Type
  instead" control in the loop is currently dead. Flagged, not fixed this
  pass.
- **Progress/counter/XP now advance on Reveal, not just Pass** — Reveal is a
  terminal verdict (its only exit is "Next question"), so it resolves the
  term the same way Pass does; `sprint-context.md`'s "progress advances only
  when a term resolves" rule wasn't being applied to it. Fixed in
  `result/page.tsx` (`isResolved = verdict === "pass" || verdict ===
  "reveal"`, used for `progress`, `counterText`, and `xpLabel`) — previously
  only checked `verdict === "pass"`, so a term ending in Reveal (like term
  2's hint sequence) left the session bar showing the term as still
  in-progress even after the student moved on.
- **"Try it in your own words" (Reveal) routes to `/recall/[term]/recording
  ?attempt=sayback`**, a special non-numeric attempt value. That take
  always advances to the next term on Send regardless of what's
  said/typed, per sprint-context.md ("always advances regardless of its
  outcome... unaided practice, not a judged attempt") — implemented by
  skipping Processing/Result entirely for that one take, not by scripting
  a fake "pass" outcome for it.
- **Figma's hint-flow example frames all show session counter "1/4"**, which
  would literally mean this is term 1's alternate branch, not term 2 — but
  the user's explicit instruction was "the *second* question" gets the
  hint treatment. Built term 2 with the hint sequence as instructed; the
  counter now correctly reads "2/4" during term 2's hint/reveal screens
  rather than matching Figma's literal (likely just a copy-paste demo
  artifact) "1/4".
- **Reveal's "Try it in your own words" / "Next question" node *names* in
  Figma are swapped relative to their actual label text** (the button
  layer is named "button / Next term" but reads "Try it in your own
  words"; the link layer is named "Link / Say it back" but reads "Next
  question"). Went with the actual rendered text, not the layer names.
- Status bar and home indicator omitted, same decision as every other
  screen.
- **Empty/silent ("Screen 11 / Nothing heard") is now built.** Unlike the
  other verdicts, everything on this screen maps to real, already-built
  components/tokens with zero gaps to fill in: `MascotSlot`, the same
  `Knowie bubble` treatment, and a real `Button` ("Record again," Primary,
  size L — content-hug width, exactly matching Figma's own instance with no
  adjustment needed) plus a bare-text "Type instead" link. No verdict pill,
  no "Skip question" (Figma's frame genuinely doesn't have one here, unlike
  every hint/pass screen).
  - **Integrated into term 1's real script, not left as a standalone demo**
    — term 1 now scripts an `empty` first attempt before the `pass` that
    was already there, so the normal flow (tap the recall card → Prompt →
    Recording → this screen → "Record again" → the real pass) demonstrates
    it for real. This changes term 1's previously-verified single-attempt
    pass behavior into a two-attempt (empty → pass) sequence — worth
    knowing if term 1's behavior is checked against earlier notes/tests.
  - **Bubble shows the original question again, not a Knowie response** —
    structurally different from hint1/hint2/reveal (which show a response).
    There's nothing to respond to when nothing was heard, so
    `questionForAttempt` re-shows the same question; a retry after "empty"
    also re-shows that same question rather than treating "empty" like a
    hint that narrows the follow-up.
  - **The empty-state transcript box's border is violet.500 at 45%
    opacity in Figma** — no semantic token expresses a translucent violet
    border (`border.selected`/`accent.brand.bold` are the same violet but
    fully opaque). Used the real `rgba()` value directly, same "deliberate
    exception" pattern as the topic-ring gradient elsewhere in this
    project.
  - XP contribution for "empty" is defined (0, matching skip/reveal) but
    not yet exercised by any built script — "empty" only ever appears as a
    recoverable mid-term attempt so far, never a term's final unresolved
    state.

## Screen 01 — Courses (`/`)

Figma's "Screen 01 / Courses" (node 15666:1559), a supporting frame in the
"1 · Entry" section — not one of SPEC.md's 8 recall-loop screens, out of the
sprint's decided scope, built per explicit request following the Figma
file's own Courses → Course → Plan order.

- **Route restructure:** the Study plan screen moved from `/` to
  `/course/biology/plan` to make room for Courses at `/`, matching the real
  product hierarchy (Courses is upstream of a specific course's plan).
  Updated every existing `router.push("/")` call in Processing and Summary
  (close buttons, Continue) to point at `/course/biology/plan` instead —
  "back to plan" should return to the plan, not the top-level course list.
- **All colors resolved from real bound Figma variables**, not guessed from
  hex: `background.page`, `background.surface`, `text.primary`,
  `text.secondary`, `interactive.primary`, `interactive.on-primary`,
  `accent.brand.on-subtle` (the folder icon's color) — every one confirmed
  via `figma.variables.getVariableByIdAsync`, not hex-matched.
  `border.focus` for the nav bar's folder icon, same as Screen 1's, confirmed
  again from the same bound variable.
- **"Create a course" button has no destination.** Not a decided flow
  anywhere in sprint-context.md — rendered as a real, functional-looking
  `Button` with no `onClick`, since there's nowhere for it to go yet.
- **Tapping a course row navigates to `/course/[slug]`** (Figma's "Screen 02
  / Course: Biology", not built) — both rows 404 for now. Consistent with
  this project's established pattern of wiring links to their true eventual
  destination rather than skipping ahead to the one screen that happens to
  exist (`/course/biology/plan`).
- **Per-row kebab (⋮) is decorative only**, not a separate tap target — the
  whole row is one button per Figma's own flat, non-distinct treatment of
  the glyph there.
- Status bar and home indicator omitted, same decision as Screen 1.
- **Course rows were built too short** (~44px, sized by the 20px text line
  plus 12px padding) against Figma's actual 60px row (12px padding plus a
  36px-tall icon wrapper) — this made the unrelated, correctly-sized 56px
  "Create a course" button look oversized purely by comparison, since
  everything next to it had shrunk. Fixed with `min-height:
  var(--color-size-space-1600)` (64px, nearest token to Figma's 60 — not on
  the spacing scale exactly) rather than chasing the odd 36px icon-wrapper
  number literally.
- **44x44 tap targets on the row folder icon and row kebab were tried and
  reverted.** Expanding those two to a 44x44 box (same precedent as the
  back/kebab buttons) visibly pushed the row text away from the folder icon,
  since the gap is measured edge-to-edge of the now-much-wider icon box, not
  the visible glyph. Reverted both to their original unsized inline-flex —
  the folder icon and kebab render at their Figma-verified sizes (16px) with
  no forced touch box, since neither is currently a separate tap target
  anyway (the whole row is the button). The nav bar icons' 44x44 tap targets
  were left as-is — no gap-adjacent-text problem there, since they don't sit
  next to a text label.

## Screen 02 — Course: Biology (`/course/biology`)

Figma's "Screen 02 / Course: Biology" (node 15666:920) — same class of gap
as Screen 01: not one of SPEC.md's 8 recall-loop screens, built to complete
the Courses → Course → Plan hierarchy per explicit request. Structurally
near-identical to Screen 01 (Courses): same row treatment, same nav bar, same
button pattern — reused the same class-naming convention with a `course__`
prefix instead of `courses__` since it's a different route/file, not a
shared component (screens in this codebase each own their layout CSS; see
design-system.md's note that nav bars etc. are hand-built per screen today).
Applied the row min-height fix from Screen 01 (64px, `space-1600`) from the
start rather than re-discovering it.

- **All colors confirmed via the same bound Figma variables** as Screen 01 —
  `background.page`, `background.surface`, `text.primary`, `text.secondary`,
  `interactive.primary`, `interactive.on-primary`, `accent.brand.on-subtle`,
  `border.focus`. No new colors introduced.
- **Only "Unit 2: Cells" is a real link** (→ `/course/biology/plan`, the
  already-built Study plan screen). Units 1, 3, and 4 have no plan content
  or destination decided anywhere in this prototype's scope — built as
  static, non-interactive rows rather than invented routes. Same precedent
  as the Study plan screen's done/todo topic nodes (only the current node is
  a real tap target).
- **"Add a topic" button has no destination**, same reasoning as Screen 01's
  "Create a course" — not a decided flow, rendered without an `onClick`.
- Status bar and home indicator omitted, same decision as Screens 1 and 01.
- **Back button, same reasoning and treatment as Screen 1's** — no
  corresponding Figma element, added because the screen now has a real
  parent (`/`) to go back to. Built at the correct 44px tap target and 24px
  icon from the start, since Screen 1's version needed a follow-up fix for
  both.

## Screen 3 — Summary (`/recall/summary`)

- **`bottomSheet`** for "Explain more" — no component exists (confirmed
  against the Figma file, zero results for "sheet"/"scaffold"). Built as a
  throwaway, screen-scoped local stand-in per `docs/component-proposals.md`'s
  guidance on what to do while the proposal is open — not exported, not a
  shared component, replaced outright once the proposal resolves. Content
  now matches Figma's actual "Screen 17 / Explain more" frame (previously
  just a title + answer paragraph): close + title header, `MascotSlot`
  `size="XL"` with "Let's review it together!", a divider, a list of term
  definitions (Osmosis's sheet shows two: "Osmosis" and "Semi-permeable
  membrane," not just the one term it's opened from), and an "Ask Knowie"
  input row.
- **"Ask Knowie" has no destination.** A free-form follow-up chat with
  Knowie isn't a decided feature anywhere in sprint-context.md or SPEC.md
  — rendered as a real-looking, `readOnly` input (icons: `Plus` and the
  shared `MicIcon`), same treatment as "Create a course" and "Add a topic"
  on the Courses/Course screens: visually real, functionally inert.
- **No scripted per-term quote/answer content exists yet** (that's Result
  screen work, SPEC.md Screen 7, not built). Figma's "Concept detail /
  Osmosis" panel (node 15675:7090) has real authored copy for exactly one
  term — wired that one up as the only working example of the expanded
  detail panel. The other three hardcoded dev terms expand their
  `SummaryCard` chevron (built into the component already) but show no
  detail panel below, since there's no scripted content to show yet.
- **"Practice again" is now built visually** (per explicit request to match
  "Screen 16 / Session summary, concept open"), side by side with "Explain
  more" — two `Button`s in a row (`Explain more` Primary, `Practice again`
  Secondary, both `flex: 1` to fill the panel width, matching Figma's
  163px-each/8px-gap layout proportionally). **Still has no destination** —
  SPEC.md only defines a session-level "Review Again" relaunch for every
  flagged term at once (from Screen 1), not a per-term retry from this
  panel, so wiring a real `onClick` here would be inventing a flow SPEC.md
  doesn't have. Rendered with no `onClick` at all, same "visually real,
  functionally inert" treatment as "Create a course"/"Add a topic"/"Ask
  Knowie" elsewhere. First pass also had "Explain more" as `Secondary` and
  no "Practice again" at all — corrected once Screen 16's actual button
  colors were checked (Explain more is the light/primary-styled one).
- **Screen 16's `summaryCard` instances are bound to a completely different,
  external variable collection** than the rest of this file — variable IDs
  there have a library-key-hash prefix
  (`VariableID:<40-char-hash>/<local-id>`) instead of the plain
  `VariableID:<id>` format every other resolved variable in this project
  has used. Visually this renders as bright green/yellow/red bold card
  fills — notably a **yellow** "Needed a hint" card, not violet. This
  doesn't match `tokens.json`'s actual `feedback.partial.bold` (which is
  violet) or the already-built `SummaryCard` component (which already
  correctly uses `feedback.success/partial/error.bold` from this project's
  real token set). Read as a stale/unmigrated library reference on this one
  Figma frame, per design-system.md's own warning about not trusting
  inherited presets — did **not** copy the yellow into the build. Continued
  using the real `SummaryCard` component (violet partial tone) as already
  built. Flag to the system owner: this Figma frame needs to be re-bound to
  the current local variable collection.
- **Term names shown in Screen 16 ("Cell membrane," "Cytoplasm," "Nucleus")
  don't match this build's hardcoded terms**, and most of that frame's rows
  are literally empty placeholder text — read as a generic/stock
  illustration, not authoritative content, so the existing hardcoded terms
  (`Cell Structure and Function`, `Plasma Membrane`, `Osmosis`, `Membrane
  Transport`) were kept rather than renamed to match.
- **Session data itself is hardcoded dev data** (4 terms, bucketed
  Good/Partial/NeedsPractice) since the real per-term outcome script doesn't
  exist yet (Screens 4–7). Bucketing includes both a compile-time type
  (`ToneBucket`, max 3 elements) and a runtime `assertMaxThree` check at the
  point terms are grouped by tone — the two-layer guard from the earlier
  SummaryCard 3-term-cap discussion, in place now so the real outcome script
  inherits it rather than needing it added later.

## Shared: cross-component token gaps

Not tied to one screen — found while reconciling the eval panel's System
fidelity findings against the actual gap ledger.

- **`ButtonIcon`'s bevel shadow is an untokenized raw value**
  (`button-icon.css`: `box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.15)` /
  `inset 0 -4px 0 rgba(0, 0, 0, 0.15)`, Primary & Secondary only). Already
  commented in the CSS as "Figma value, not a token," but that comment alone
  isn't the same disclosure this ledger gives every other raw-value
  exception (topic-ring gradient, empty-state border alpha, etc.) — logged
  here now for consistency. Flag to the system owner: no `elevation.*` or
  `shadow.*` semantic token exists yet for this bevel.
- **`MascotSlot`'s "thinking" bob keyframe uses a raw pixel motion value**
  (`mascot-slot.css`: `transform: translateY(-6px)` in
  `@keyframes mascot-slot-thinking-bob`) — no `motion.*` distance token
  exists to express it, and unlike the bevel shadow above, this one had no
  disclosure anywhere before now. Flag to the system owner: no motion-token
  layer exists in `tokens.json` at all yet, only color/size/type/stroke.
- **`text.tertiary` (`color.alpha.light-48`) is unsafe on `background.surface`
  (a card) — computes to ~4.35:1, below the 4.5:1 gate.** No screen
  currently places that exact pairing (today's usages are all on
  `background.input`/`background.page`, which clear the gate), so this
  isn't an active failure, but it's the same "tertiary on a card" trap
  `sprint-context.md` already warns about, one step removed. **Not fixed
  this pass:** `tokens.json`'s alpha scale jumps directly from `light-48`
  (0.4784) to `light-68` (0.6784) with nothing between — closing this gap
  by raising `text.tertiary`'s alpha would require either reusing
  `light-68` (making tertiary visually identical to `text.secondary`,
  defeating the point of having two tiers) or inventing a new alpha step,
  which `CLAUDE.md`'s hard rule says to stop and ask about rather than do
  silently. Flag to the system owner: `text.tertiary` should not be placed
  on `background.surface` until either a token exists to make that safe or
  a design call is made to collapse the two tiers.
