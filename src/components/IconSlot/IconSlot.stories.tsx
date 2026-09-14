import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { IconSlot, type IconSlotSize } from "./IconSlot";

const DESCRIPTION = `**What it is:** A reusable container for a single icon with predefined size variants.

**When to use it:** Use through components that require an icon, such as \`buttonIcon\` or \`chips\`, rather than placing and sizing raw icons independently.

**Don't:** Don't treat \`iconSlot\` as a standalone screen-level component or manually resize the icon outside its defined size variants.`;

const PlaceholderIcon = (
  <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const meta = {
  title: "Components/IconSlot",
  component: IconSlot,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["100", "150", "200", "250", "300", "400"] },
    icon: { control: false },
  },
  args: {
    icon: PlaceholderIcon,
    size: "400",
  },
} satisfies Meta<typeof IconSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

function sizeStory(size: IconSlotSize): Story {
  return {
    name: `size=${size}`,
    args: { size },
  };
}

export const Size100: Story = sizeStory("100");
export const Size150: Story = sizeStory("150");
export const Size200: Story = sizeStory("200");
export const Size250: Story = sizeStory("250");
export const Size300: Story = sizeStory("300");
export const Size400: Story = sizeStory("400");
