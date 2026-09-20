import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SummaryCard } from "./SummaryCard";

const DESCRIPTION = `**What it is:** A tone-colored card summarizing a group of terms by outcome — Good explanations, Needed a hint, or Needs practice — with up to three tappable term rows, each marked with a check or an x and a chevron signaling it can be expanded.

**When to use it:** Use on the session summary screen, one card per outcome bucket. The header label and row icon are both derived from \`tone\`, not separate props. Each row is a tone-darkened pill (\`feedback/{tone}/on-bold\` as its own background) nested inside the brighter \`feedback/{tone}/bold\` card — not flat text sitting directly on the card's own background. Pass \`expandedTerm\` and \`onToggleTerm\` to drive which row is expanded; the card itself only renders the chevron affordance and reports taps — the expanded content is composed by whatever uses this component.

**Don't:** Don't pass more than three terms. Don't use it for anything other than the session summary's three fixed buckets — it isn't a general-purpose list card.

**Implementation note:** newly added to Storybook from the Figma component (node 15671:9218) — it wasn't yet in \`docs/design-system.md\`'s component list. In the Figma file, the chevron is a separate \`chevron-down\` instance hand-positioned on top of each row at the screen level (see \`Card / Good\` on Screen 15), not part of the \`summaryCard\` component itself — it's built into this component instead so every consumer gets the expand affordance for free rather than re-placing it by hand. A few values deviate from the Figma file, flagged for the system owner rather than eyeballed:
- The header label is rendered in sentence case in code ("Good explanations", "Needed a hint", "Needs practice" — matching \`docs/sprint-context.md\`'s Outcome bucket names) with \`text-transform: uppercase\` for the visual match. The Figma layer has the caps typed directly into the text content (\`textCase: ORIGINAL\`), which conflicts with the sentence-case hard rule — this implementation keeps the underlying content sentence case and treats the caps as a visual style instead.
- The chevron uses IconSlot size 300 (24px). The Figma instance is 28px, which has no matching token — 24px and 32px are equidistant; 24px was chosen so it doesn't outweigh the row's own 20px check/x icon.
- Row corner radius uses \`--color-size-radius-600\` (24px), matching the outer card. The Figma layer's row radius is 20px, which has no matching token — 24px and 16px are equidistant, and 24px was chosen to match the card's own radius rather than picked arbitrarily.
- Row padding uses \`--color-size-space-400\` (16px) on all four sides. The Figma layer has an asymmetric 14px top / 16px left-bottom-right, and 14px has no matching token in tokens/tokens.json — 16px (the nearest existing token) is used symmetrically instead.
- The Figma layer's 1% letter-spacing on both header and row text has no matching token in tokens/tokens.json's type scale and is omitted rather than hardcoded.`;

const meta = {
  title: "Components/SummaryCard",
  component: SummaryCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    tone: { control: "select", options: ["Good", "Partial", "NeedsPractice"] },
    showRow2: { control: "boolean" },
    showRow3: { control: "boolean" },
    expandedTerm: { control: "select", options: [undefined, 1, 2, 3] },
  },
  args: {
    tone: "Good",
    term1: "Cell membrane",
    term2: "Cytoplasm",
    term3: "Nucleus",
    showRow2: false,
    showRow3: false,
    onToggleTerm: fn(),
  },
} satisfies Meta<typeof SummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Good: Story = {
  args: {
    tone: "Good",
    term1: "Cell membrane",
    term2: "Cytoplasm",
    showRow2: true,
  },
};

export const Partial: Story = {
  args: {
    tone: "Partial",
    term1: "Nucleus",
    showRow2: false,
    showRow3: false,
  },
};

export const NeedsPractice: Story = {
  name: "Needs practice",
  args: {
    tone: "NeedsPractice",
    term1: "Osmosis",
    showRow2: false,
    showRow3: false,
  },
};

export const ThreeTerms: Story = {
  name: "Three terms",
  args: {
    tone: "Good",
    term1: "Cell membrane",
    term2: "Cytoplasm",
    term3: "Mitochondria",
    showRow2: true,
    showRow3: true,
  },
};

export const Expanded: Story = {
  name: "Row expanded",
  args: {
    tone: "Good",
    term1: "Cell membrane",
    term2: "Cytoplasm",
    showRow2: true,
    expandedTerm: 2,
  },
};

export const TappingARowTogglesIt: Story = {
  name: "Tapping a row calls onToggleTerm",
  args: {
    tone: "Good",
    term1: "Cell membrane",
    term2: "Cytoplasm",
    showRow2: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const rows = canvas.getAllByRole("button");

    await expect(rows[0]).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(rows[0]);
    await expect(args.onToggleTerm).toHaveBeenCalledWith(1);

    await userEvent.click(rows[1]);
    await expect(args.onToggleTerm).toHaveBeenCalledWith(2);
  },
};
