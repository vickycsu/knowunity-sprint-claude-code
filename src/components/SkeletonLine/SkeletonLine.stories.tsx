import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SkeletonLine } from "./SkeletonLine";

const DESCRIPTION = `**What it is:** A single rounded placeholder bar standing in for a line of text while Knowie's response loads.

**When to use it:** Use inside the Knowie bubble on Processing. Resize each instance to whatever width fits, and stack as many as the moment needs — there's no fixed count.

**Don't:** Don't bind its fill to a text color. It's a loading placeholder, and \`interactive.loading\` exists for exactly this.

**Known gap:** the flow has no design for what happens if loading runs long enough that a plain repeating skeleton stops looking like "still working" and starts looking broken. No timeout or error state exists for this today.

**Implementation note:** the Figma component has no variant axis and no properties — this is one shape, one binding, resized freely per instance, matching design-system.md's guidance not to add a variant or prop just because other components have them. Two values used here deviate from the current Figma file and are flagged for the system owner:
- Height uses \`--color-size-space-400\` (16px). The Figma layer's height (18px) has no matching token at all, even as a raw number on the component — 16px is the closest existing token, not a confirmed value.
- Fill uses \`--color-interactive-loading\` per this description's own "Don't" rule. The Figma layer is currently bound to \`interactive/primary\` instead, which contradicts that rule — flagged as a binding bug in the file, not followed here.`;

const meta = {
  title: "Components/SkeletonLine",
  component: SkeletonLine,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  args: {
    width: "100%",
  },
} satisfies Meta<typeof SkeletonLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: "180px",
  },
};

export const StackedInKnowieBubble: Story = {
  name: "Stacked (Knowie bubble on Processing)",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--color-size-space-200)" }}>
      <SkeletonLine width="100%" />
      <SkeletonLine width="80%" />
      <SkeletonLine width="60%" />
    </div>
  ),
};
