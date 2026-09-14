Knowie design system rules

This file covers behavior: which component to use, how the scaffold works, how things get named, and what never to do. It does not repeat any value. For colors, sizes, or type scale, look in tokens/tokens.json and reference the token by name.

The two layers, and which one you touch

tokens/tokens.json has two layers. Primitives hold raw values. Semantic tokens reference primitives by name and describe a role — what the value is for, not what it looks like.

Components consume the semantic layer only. A component never points at a primitive directly, and a screen never hardcodes a raw value. If a component needs a color, it asks for interactive.primary, not color.violet.50-2 — even though those two currently resolve to the same value. The semantic name is what lets that value change later without touching every screen that uses it.

Which component to reach for
button — a single tappable action with a text label. "Continue," "Try again," "Check answer."
buttonIcon — a single tappable action with no label, only when the icon's meaning is unambiguous on its own (close, back). If a student might not recognize the icon, use button with an icon instead.
buttonGroup — two related actions presented together, like "Skip" and "Continue." Don't place two button instances side by side by hand; this component already does that.
chips — a short filter, tag, or selection state. Topic labels, selected answer choices.
iconSlot — any standalone icon on screen. Never place a raw icon shape directly; this component controls sizing and spacing.
mascotSlot — anywhere Knowie appears and needs to react to something (correct, incorrect, listening, idle). Check both the size property and the nested pose property when you duplicate an instance — they're independent.
progressIndicator — overall completion through a session or a set. It only has five fixed progress stops (0/25/50/75/100), not a continuous range.
sessionBar — the fixed header for every screen in the recall loop: close control, session progress, and the XP chip for the current term. See "Components added this sprint" for the full writeup.
snackbar — a short, temporary system message the student doesn't need to act on. Never use it for something that needs a decision.
textBlock — a title with an optional supporting line underneath.
appBar — exists in the library but isn't used in any current screen. Screens currently build their own nav bar by hand. If you start using appBar, you're introducing a pattern the rest of the file doesn't follow yet — do that on purpose, not by accident.

If none of these fit, see the last rule in the never-do list before building anything new.

How the scaffold is composed

scaffold is a component set with one variant axis, size, covering eight device frames (phone, tablet portrait/landscape, desktop). Every screen should be an instance of one of these, not a hand-built frame at the same dimensions — a hand-built frame won't pick up changes to the shared scaffold later.

Inside, a scaffold has a fixed status bar at the top, and four content slots:

topNavigation — navigation items: back buttons, the home top nav with streaks, and similar. Hide it with showTopNavSlot when a screen has no top nav.
middleContent — the screen's main content. Nearly every component in the system is a valid fit here.
bottomContent — the bottom navigation bar, a chat input field, or similar persistent bottom UI. Hide it with showBottomNavSlot.
bottomSheetOnly — content that appears only while a bottom sheet is open, separate from whatever's already in bottomContent. Pair it with showBottomSheetBackground to show the scrim behind the sheet.

One caution: the slot pickers in Figma list "preferred" components for each slot, but in this file those presets point at component keys that don't resolve locally — they're likely inherited from whatever library this file was copied from. Don't trust the preset list at face value. Use the actual local component sets described above.

Components added this sprint
skeletonLine

No variant axis, no properties. Fixed height, free width — resize each instance to fit, and stack as many as a given moment needs. Look up its exact height and corner radius in tokens/tokens.json; as of this sprint neither value has a matching token, so both are unbound raw numbers on the component. Flag that gap to the system owner before treating it as settled.

What it is: A single rounded placeholder bar standing in for a line of text while Knowie's response loads.
When to use it: Use inside the Knowie bubble on Processing. Resize each instance to whatever width fits, and stack as many as the moment needs, there's no fixed count.
Don't: Don't bind its fill to a text color. It's a loading placeholder, and interactive.loading exists for exactly this.
Known gap: the flow has no design for what happens if loading runs long enough that a plain repeating skeleton stops looking like "still working" and starts looking broken. No timeout or error state exists for this today.
recordingControl

One variant axis, state, with two values: Listening and Paused. One exposed property, Text (TEXT type), which drives the label in both variants — set it to match the state's copy rather than editing the label layer directly.

What it is: The circular, glowing affordance shown while Knowie is actively recording, replacing the idle mic button for the duration of the take.
When to use it: Use only inside the live recording screens. Listening while audio is being captured, Paused when the student pauses mid-answer. Set the Text property to match the state's copy.
What each state means: Listening is the glowing state, live while audio is being captured. Paused is the flat, non-glowing state — the frame's fill is background.surface — shown when the student pauses mid-answer.
Don't: Don't reuse it as a generic loading spinner or decorative glow elsewhere. It signals one specific thing: whether the mic is live right now.
Open question: the Listening bloom's gradient fill and its drop shadow color have no matching token in tokens/tokens.json. That's a system-owner conversation, not something to resolve by substituting the nearest violet primitive. Flag it before treating the color as final.
Known gaps: no visual difference exists between "listening and picking up sound" and "listening but hearing silence." No transition state exists between tapping "Tap to send" and the next screen appearing. No state exists for a hardware interruption mid-recording, like a mic disconnecting.
sessionBar

No variant axis, no properties of its own. It composes a hand-built Close control, a nested progressIndicator instance, and a nested chips instance (the XP chip) — change progress or XP by editing those nested instances directly, the same way you'd edit a button inside buttonGroup, rather than adding a property to sessionBar itself.

What it is: The fixed header used across the recall loop, combining a close control, session progress, and the XP chip for the current term.
When to use it: Use on every screen in the Ask & Answer loop and its result and edge-case screens. To change progress or XP state, select into the nested Progress or XP Chip instance and set its own properties.
Don't: Don't add a variant for hidden progress, a different thickness, or a missing chip. Thickness is fixed at 24 with the counter always visible.
Known gap: the Close control isn't an instance of buttonIcon — it's a hand-built 44px frame with an 18px icon, and neither size matches any token in tokens/tokens.json (the icon scale is 8/12/16/20/24/32; the space scale has 40 and 48, not 44). Flag this to the system owner rather than treating either raw number as settled.
Naming and structure conventions
Component names are camelCase nouns naming the object: button, buttonIcon, iconSlot, mascotSlot, skeletonLine, recordingControl, sessionBar. Follow this pattern for anything new.
Variant axis values are Title Case: Primary, Secondary, Default, Pressed, Loading, Listening, Paused.
Boolean properties are prefixed show: showLeftIcon, showCaption, showBottomNavSlot. A boolean that toggles visibility of something should read as a yes/no question about that thing being shown.
Exposed TEXT properties are named Text, matching chips. The layer it drives is named Label, Title Case, regardless of what the component itself is called. Bind the property to that layer's characters before combining variants into a set, not after — each variant gets its own default value for the property even though the property itself is shared across the set once combined.
A variant doesn't need to mirror every layer of every other variant. recordingControl's Listening variant has a Bloom layer; Paused doesn't, because it's a flat filled circle with no glow. Layer names only need to match across variants where the same property has to bind consistently — here, that's Label for the shared Text property.
A component with no variant axis and no properties is a valid pattern, not an unfinished one — skeletonLine is one shape, one binding, resized freely per instance. Don't add a variant axis or a property just because other components in the file have them.
Semantic tokens are a lowercase, slash-delimited path: category first, then role — background.page, interactive.onPrimary, feedback.error.bold. Match this shape for anything new; check tokens/tokens.json for the exact existing groups before adding a sibling.
Primitive tokens keep the category prefix already in use for that category — color.* stays lowercase, Space.*/Radius.*/Icon.* keep their capitalized prefix. Don't invent a new casing style for a category that already has one.
Labels, buttons, and headings are sentence case. Capitals only for proper nouns — Knowie, PRO.
A pill or stadium shape with no matching radius token should bind to Radius.Full rather than a raw number, even when the shape's actual height means the rendered radius is some other fixed value. Figma clamps a full radius down to half the shortest side automatically, so the token still resolves to the correct visual result without hardcoding that half-height number. skeletonLine's corner radius uses this pattern.
Never do this
Never invent a value that isn't in tokens/tokens.json. If a color, size, or type style you need doesn't exist, say so and ask rather than eyeballing a close number.
Never use a CSS fallback like var(--token, #333). If a token resolves to nothing, that's a bug in the token or the binding — fix it. A fallback hides the break instead of surfacing it.
Sentence case on every label, button, and heading. Capitals only for proper nouns.
Never put an appearance word in a semantic name. "Purple," "dark," "small" — those describe how a primitive looks and belong only in the primitive layer (color.violet.500). A semantic name describes a role (interactive.primary), never a look.
Never read a primitive directly from a component or a screen. Components consume the semantic layer. The semantic layer is the only thing allowed to reference a primitive.
Never build something new when a component in this system already does the job. Check the component list above and the actual file before you draw anything new from scratch.
Never invent a component to fill a gap. This system is meant to grow on purpose, not by accident. If nothing fits, name the gap and propose what you'd call the new component — then let a human decide whether to add it.