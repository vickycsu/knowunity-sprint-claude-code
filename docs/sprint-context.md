# sprint-context

## What this is

A mobile iOS voice active-recall step inside Knowunity’s study plan.
The student explains recently learned concepts out loud and receives text feedback from Knowie. Design source of truth: Figma file `SRxdKe78xKqws8V2CGvFCi`, page **Flow_v2** (node 15666:908). Every value comes from `tokens/tokens.json`.

## Concept

After completing a run of topics, the student explains each concept in their own words, gets up to two hints before an answer reveal, and concepts they struggled with are carried forward for review.

## Where the recall step lives

Inside the study plan path, as a card between topic rows: Courses → course → plan → "Explain it out loud".

## Decisions

### Entry
- Recall card follows completed topics and names how many it covers, because the study plan already knows what the student just studied.
- Tapping the card goes directly to the first question, because an extra start sheet adds friction.
- Recall card lives in the Plan tab, because recall is part of the study path

### Loop
- Session contains 4 terms and shows progress as “1/4”, because the session should be short and bounded.
- Every loop screen has the same session bar with close, progress, counter, and XP.
- Progress advances only when a term resolves, because hints, retries, and edge states do not complete a term.
- Every prompt and hint screen has “Skip question.”
- Answer path is Prompt → Recording → Recording paused → Processing → Result.
- Paused state shows the transcript, a “Paused” label, and a labeled send control, because the student should see what was heard before committing.
- Voice is the primary input and text is a one-tap fallback, because students must be able to continue when they cannot speak.
- Voice uses explicit start/stop, with the take clearable before sending, because the student stays in control of when recording starts and when an answer is submitted.
- Transcript is editable before sending and read-only after a verdict, because changing the answer after judging would invalidate the result.
- Feedback uses two hints followed by an answer reveal: “Almost there” with a narrower question, then “Try again” with a second narrower question, then the answer with “Try it in your own words” over a mic and “Next question” below, because students should get another retrieval attempt before seeing the answer.
- Each hint restates only the missing part, because repeating the full question or revealing the answer weakens retrieval.
- Knowie quotes the student’s own words before the follow-up question, because the student needs to see which part of their answer was accepted.

### Typing instead of speaking (added 2026-09-23)

- Voice stays primary; typing is a per-turn fallback, not a mode. Nothing remembers a preference for it, because a parallel text-first experience is out of scope.
- Tapping to type opens the keyboard with it. The tap claims the keyboard before navigating, since mobile browsers only raise it for a focus that happens inside a gesture. Added 2026-09-30.
- Reachable in one tap from every screen in the loop: the keyboard icon on Prompt, "Type instead" during a recording, on both hint screens, on the empty-answer result, and from the permission primer, the denied sheet and the "still waiting for your microphone" sheet.
- Laid out as a compose screen, not a form. The question stays at the top, the compose block sits directly above the keyboard, and the dead space is between them rather than underneath the send button. Knowie collapses out of the way once the keyboard is up or an answer is on screen.
- The answer carries across the switch in both directions, so a garbled transcript gets fixed by typing rather than retyped, and a typed draft survives a trip to the microphone and back.
- Enter makes a new line; Cmd/Ctrl+Enter sends. An explanation runs to several sentences, so swallowing Enter into a send is the wrong default here.
- A typed answer goes through the same Processing and the same judge as a spoken one. The Summary labels which one it was ("What you said" / "What you typed").

### Answers are prepopulated (reverted 2026-09-25)

- The recall is mocked again. Tapping the mic replays that term and attempt's scripted take, revealed a word at a time so it reads as listening; nothing touches a microphone API. Live transcription was built 2026-09-23 and removed today: it depended on the browser's Web Speech API, which did not work reliably on the owner's machine, and a prototype that cannot be demonstrated is worse than one with fixed answers.
- Verdicts, hints, the reveal and the XP that follows are all scripted per attempt, so a walkthrough always shows the intended ladder.
- The typing turn stays real — the student's own words come back on the Result screen and in the Summary — but the outcome is the same scripted one, so both paths behave predictably.
- A typed answer skips past a scripted "nothing was captured" beat, since that state is about a microphone and a typed answer plainly isn't empty.
- The permission primer stays as a visual mock, as originally specified: it explains why the mic is wanted and offers "Type instead", but grants nothing.
- The session still records what happened per term, so the Summary and Review again keep reporting the run rather than a fixed example.

### Voice states (scope locked 2026-09-14)

Triage of the state list in docs/voice-ux.md. This section is the source of truth where the two disagree.

Build:
- Idle (mic ready, prompt shown)
- Recording / listening
- Pause / resume — keeps the current take; the student stops speaking temporarily and resumes into the same take. Committed flow; overrides the "out of scope" row in voice-ux.md.
- Processing
- Result: pass
- Result: partial (hint 1, hint 2)
- Result: fail / answer revealed
- Clear the take before sending — empties the transcript and stays paused, so the student taps to resume when they are ready. Distinct from pause: pause keeps the take, clear empties it. Both are required.
- Text fallback turn
- Mic permission primer + mocked permission sheet — designed and mocked in the web app; no real permission flow is engineered. The primer is an in-context sheet over the Prompt screen on the first mic tap, not a standalone start screen, so it stays inside the "no start sheet" rule above.
- Permission denied → route to text. The primer's "Type instead" is that path; with no real permission request there is no denial to handle.
- Skip a term

If time:
- Judge slow / timeout — reuses the Processing pattern with a retry, no new visual system.

Not a separate designed state:
- Noisy / garbled transcript — covered by the Result screens already showing the transcript plus generous judging.
- Dropped network — covered by "Leaving mid-session" saving progress; no dedicated screen.

### Outcome
- Summary reports the session the student just finished, not an example: the buckets, the concept names, the read-back of their own answer and the Review Again list all come from what actually happened. Added 2026-09-23.
- A bucket with nothing in it is hidden, because an empty card reads as a bucket that failed to load rather than as a clean sheet.
- Summary has three buckets: Good explanations, Needed a hint, and Needs practice, because the student needs an honest signal of how well they recalled each concept.
- Tapping a concept expands it in place; “Explain more” opens a bottom sheet over the summary.
- XP is 25 for a good explanation, 10 for a hinted answer, and 0 for a revealed answer, because the reward should reflect recall quality.
- Everything in Needed a hint and Needs practice goes into a Review Again block with the count, concept names, and “Start review,” because recall should affect what the student studies next. The block is hidden when every concept landed in Good explanations.
- Review Again sits below the plan path, because it is follow-up work rather than part of the completed path.

### System
- Navigation calls the section “Topic,” 
- No subtext unless it adds information not already shown.
- Use semantic tokens from tokens/tokens.json; never approximate color, spacing, radius, or type values.
- text.link uses violet.500-2; text.tertiary resolves through color/alpha/light-50.
- Check tertiary text contrast on cards, not only on the page background.
- Type is Greed Standard: Light, Regular, SemiBold, Bold, and Italic only.

## Not building

- Entry from the Tools drawer, after a quiz or practice exam, or as a standalone feature.
- A start sheet or standalone first-run explainer.
- A parallel text-first experience. (The single text fallback *turn* is built — it is the one path that works with no microphone, and every mic edge state routes to it.)
- Session lengths other than 4 terms.
- Transcript editing after a verdict.
- Voice output or a two-way voice conversation.
- Auto-detection of when the student has finished speaking.
- Full coverage of every possible voice edge case.
- Student switching language mid-answer. Known gap.
- A dedicated screen for noisy / garbled transcript or for dropped network (see Voice states).
- Naming-convention normalization or Display L removal.
