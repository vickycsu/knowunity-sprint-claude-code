@AGENTS.md
# Knowunity voice recall prototype

Mobile iOS voice active-recall step inside Knowunity's study plan. After a run of completed topics, the student explains the concepts out loud. Knowie replies in text. Recall is mocked.

## Storybook tools

When working on UI, use the storybook tools to read the component library before answering or writing anything. Never assume a component prop exists. Query the documentation, and use only props that are documented or shown in a story. If a prop isn't there, stop and ask me.

## Hard rules

- Mobile only, 390px wide, dark mode only. No light mode, no desktop.
- Every color, size, spacing, radius and type value comes from tokens/tokens.json, through a semantic token. If nothing matches, stop and tell me.
- Build from the components listed in docs/design-system.md. If nothing fits, stop and tell me before making a new one.
- The recall is mocked. No speech-to-text, no audio, no model calls.
- Sentence case on every label, button and heading. Capitals only for proper nouns (Knowie, PRO).
- Scope is docs/sprint-context.md. Build what is under Decisions. Nothing under Not building.
- Replace the starter code in src/app/. Do not extend it as a foundation.
- Where claude.md or docs/ conflicts with a skill in .claude/skills/, claude.md and docs/ win.

## Never

- No CSS fallbacks like var(--token, #333).
- No primitive tokens (color.violet.500, Space.4) in a component or screen. Semantic layer only.
- No new dependencies without asking.
- No subtext unless it adds information not already on screen.
- No edits to AGENTS.md.

## Where things are

- tokens/tokens.json — semantic design tokens. Read before writing styles.
- build/css/tokens.css is generated; never edit it, edit tokens/tokens.json and run npm run tokens.
- docs/sprint-context.md — locked decisions and scope. Read first every session.
- docs/design-system.md — components, naming conventions and component rules. Read before building UI.
- docs/design-brief.md — problem, constraints and success metrics. Read when sprint-context does not cover the question.
- docs/voice-ux.md — recall interaction rules, principles and states. Read when designing or building recall.
- docs/reference/ — screenshots of the live app and beta. Use when matching existing layouts.
- public/images/ — project image assets.
- src/app/ — prototype implementation.
- .claude/skills/ — task-specific design skills. Invoke when relevant.
- AGENTS.md — generated Next.js guidance. Read before writing Next.js code.