# sprint-context

## What this is

A mobile iOS voice active-recall step inside Knowunity’s study plan.
The student explains recently learned concepts out loud and receives text feedback from Knowie. Design source of truth: Figma file `SRxdKe78xKqws8V2CGvFCi`, page **Flow_v2** (node 15666:908). Every value comes from `tokens.json`.

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
- Voice uses explicit start/stop with cancel and re-record before sending, because the student stays in control of when an answer is submitted.
- Transcript is editable before sending and read-only after a verdict, because changing the answer after judging would invalidate the result.
- Feedback uses two hints followed by an answer reveal: “Almost there” with a narrower question, then “Try again” with a second narrower question, then the answer with “Try it in your own words” and “Next question,” because students should get another retrieval attempt before seeing the answer.
- Each hint restates only the missing part, because repeating the full question or revealing the answer weakens retrieval.
- Knowie quotes the student’s own words before the follow-up question, because the student needs to see which part of their answer was accepted.

### Outcome
- Summary has three buckets: Good explanations, Needed a hint, and Needs practice, because the student needs an honest signal of how well they recalled each concept.
- Tapping a concept expands it in place; “Explain more” opens a bottom sheet over the summary.
- XP is 25 for a good explanation, 10 for a hinted answer, and 0 for a revealed answer, because the reward should reflect recall quality.
- Everything in Needed a hint and Needs practice goes into a Review Again block with the count, concept names, and “Start review,” because recall should affect what the student studies next.
- Review Again sits below the plan path, because it is follow-up work rather than part of the completed path.

### System
- Navigation calls the section “Topic,” 
- No subtext unless it adds information not already shown.
- Use semantic tokens from tokens.json; never approximate color, spacing, radius, or type values.
- text.link uses violet.500-2; text.tertiary resolves through color/alpha/light-50.
- Check tertiary text contrast on cards, not only on the page background.
- Type is Greed Standard: Light, Regular, SemiBold, Bold, and Italic only.

## Not building

- Entry from the Tools drawer, after a quiz or practice exam, or as a standalone feature.
- A start sheet or standalone first-run explainer.
- A parallel text-first experience.
- Session lengths other than 4 terms.
- Transcript editing after a verdict.
- Voice output or a two-way voice conversation.
- Auto-detection of when the student has finished speaking.
- Full coverage of every possible voice edge case.
- Naming-convention normalization or Display L removal.
