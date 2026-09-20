import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TextBlock, type TextBlockVariant } from "./TextBlock";

const DESCRIPTION = `**What it is:** A text component pairing a Header with an optional Caption, available in four sizes.

**When to use it:** Use when a piece of content needs a heading with supporting text beneath it.

**Don't:** Don't use it for standalone text when no supporting caption is needed. Use the appropriate text style instead.

**Audit note:** No matching usage was confirmed in the reviewed screens. Confirm intended contexts before introducing it into new flows.

**Implementation note:** XL and L share a caption style (18px / 20px line-height / regular) that has no matching \`typeScale\` composite token in this project — built here from the underlying primitives (\`font-size-md\`, \`font-lineHeight-sm\`, \`font-weight-regular\`, \`font-family-default\`) instead, all of which are real tokens. Every other text style below matches an existing \`typeScale\` token exactly.`;

const meta = {
  title: "Components/TextBlock",
  component: TextBlock,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["XL", "L", "M", "S"] },
    showCaption: { control: "boolean" },
  },
  args: {
    variant: "XL",
    title: "Nice work",
    caption: "You've completed today's session.",
    showCaption: true,
  },
} satisfies Meta<typeof TextBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

function variant(name: TextBlockVariant, title: string, caption: string): Story {
  return {
    name: `variant=${name}`,
    args: { variant: name, title, caption, showCaption: true },
  };
}

export const XL: Story = variant("XL", "Nice work", "You've completed today's session.");
export const L: Story = variant("L", "Streak: 4 days", "Keep it going tomorrow.");
export const M: Story = variant("M", "Explain out loud", "Recall what you just studied.");
export const S: Story = variant("S", "Topic recap", "Cell structure and function.");

export const ShowCaptionFalse: Story = {
  name: "showCaption=False",
  args: {
    variant: "XL",
    title: "Nice work",
    showCaption: false,
  },
};
