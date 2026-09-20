---
name: build-screen
description: Use when building or editing any screen in the Knowunity voice recall prototype — a page under src/app/ reached by tapping through the app from the screen before it. A Storybook story alone is not a built screen. Covers reading SPEC.md, checking for a Figma frame, composing from Storybook components only, logging gaps, and wiring every action to its destination.
---

# Building a screen

A screen is a page at its own route in `src/app/`, reached by clicking from
the screen before it in the actual app flow. Storybook is the catalog for
components, not a place screens live — if something only exists as a
Storybook story, it isn't built.

## Method

1. **Read SPEC.md** for this screen's entry: route, file path, every state
   listed, and every component named. Don't build a state or wire an action
   that isn't there, and don't skip one that is.

2. **Check for a Figma frame.** Some screens in the sprint file have one,
   some don't — check before assuming either way.
   - **Has a frame:** match it. When done, list every difference between
     what you built and the frame (spacing, copy, missing state, anything).
   - **No frame:** read `docs/design-brief.md` and `docs/voice-ux.md` for
     how the screen and its states should behave. When done, tell me what
     you had to decide that wasn't written down anywhere.

3. **Query the Storybook MCP for every component you plan to use.** Call
   `docs-list`, then `docs-show` for each one. Never assume a prop exists —
   if it isn't in the docs or shown in a story, it doesn't exist. If a
   prop you need isn't there, stop and ask rather than guessing.

4. **Compose from what's in Storybook first.** That's the only place to
   look for something to reuse — most of the Figma library was never built
   in code, so "it's in Figma" is not a reason to assume a component exists
   here.

5. **When something you need isn't in Storybook:**
   - Build it inline inside the screen, from semantic tokens only.
   - Add a line to `component-gaps.md` (repo root) naming the gap and which
     screen it's for. Don't stop to ask — keep going.
   - Before adding a new line, check whether that same gap is already
     listed for a different screen. If it is, this is now needed twice:
     build it properly as a real component with a Storybook story instead
     of inlining it again, and update both screens to use it.

6. **Every value comes from the generated tokens** — semantic layer only,
   never a primitive (`color.violet.500`, `Space.4`) and never a raw hex or
   px. If nothing in `tokens/tokens.json` fits, stop and say so instead of
   inventing a value.

7. **Mobile only, 390px, dark mode.** No responsive breakpoints, no light
   mode.

8. **Build every state SPEC.md lists for the screen**, including failure /
   error / timeout states — not just the happy path.

9. **Wire every action to where SPEC.md says it goes.** A button, tap
   target, or link with no destination means the screen isn't finished.
   Replace starter code in `src/app/` rather than building alongside it.

## After building

- Run `stories-preview` for this screen's Storybook consumers if you
  touched any shared component, and `test-run` (never a package.json
  script) — fix failures before reporting done.
- Report: Figma diff list, or the undocumented decisions list, whichever
  applies — plus any new `component-gaps.md` lines you added.
