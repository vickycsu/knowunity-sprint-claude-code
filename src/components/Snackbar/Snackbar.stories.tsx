import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Snackbar, type SnackbarVariant } from "./Snackbar";

const DESCRIPTION = `**What it is:** A temporary message component with Default, Success, and Error variants. It includes an icon, text, and nested chip.

**When to use it:** Use only for brief system feedback that does not require persistent visibility or a dedicated action.

**Don't:** Don't use it for information the student needs to review later or for an interaction that requires an immediate decision.

**Implementation notes (flagged for the system owner):**
- The icon had no real color binding in Figma — it inherited the icon library's raw preview fill, which happens to match the card's own background and would render invisible. Built here using each variant's matching accent/feedback token instead (\`accent.blue.bold\` / \`feedback.success.bold\` / \`feedback.error.bold\`), same family as the chip.
- The card's outer vertical padding was bound to a Figma variable (\`Padding/sm\`) with no matching token in tokens.json. Substituted \`Space/200\`, which matches the value exactly and is already used for this same frame's other padding sides.
- The nested chip's label isn't a promoted property on the Figma component — it's fixed per variant in the file. Exposed here as a required \`chipLabel\` prop since a hardcoded chip label isn't usable.
- Every variant has a hidden "action button" baked into the Figma component with no property exposed to show it. Left out entirely here — it's not on the component's real property surface, and this component's own "Don't" rule says not to use it for anything needing a decision.
- The nested chip needed three color options (Info/Success/Error) that didn't exist on this project's \`Chips\` component yet. Extended \`Chips\` with them rather than duplicating chip markup inline — see its own story for the new options.`;

const meta = {
  title: "Components/Snackbar",
  component: Snackbar,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["Default", "Success", "Error"] },
  },
  args: {
    variant: "Default",
    text: "Nice recall! You matched the key idea.",
    chipLabel: "+10 XP",
  },
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

function variant(name: SnackbarVariant, text: string, chipLabel: string): Story {
  return {
    name: `variant=${name}`,
    args: { variant: name, text, chipLabel },
  };
}

export const Default: Story = variant(
  "Default",
  "Keep going — you're making good progress today.",
  "Session"
);
export const Success: Story = variant("Success", "Nice recall! You matched the key idea.", "+10 XP");
export const Error: Story = variant(
  "Error",
  "That didn't quite match. Let's try the next one.",
  "Retry"
);
