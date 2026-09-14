import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MascotSlot, type MascotSlotSize } from "./MascotSlot";

const DESCRIPTION = `**What it is:** A reusable container for Knowie with four size variants and a nested mascot instance.

**When to use it:** Use when Knowie appears as part of a screen or interaction state. Choose the size based on the role and available space.

**Don't:** Don't assume that changing the mascot size changes its expression or state. Size and mascot state should be treated as separate properties.

**Audit note:** Homie's instance-swap property has 16 pose options in Figma; this product only uses \`standby\`.`;

const meta = {
  title: "Components/MascotSlot",
  component: MascotSlot,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["XL", "2XL", "3XL", "4XL"] },
    pose: { control: "select", options: ["standby"] },
  },
  args: {
    size: "XL",
    pose: "standby",
  },
} satisfies Meta<typeof MascotSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

function sizeStory(size: MascotSlotSize): Story {
  return {
    name: `size=${size}`,
    args: { size },
  };
}

export const SizeXL: Story = sizeStory("XL");
export const Size2XL: Story = sizeStory("2XL");
export const Size3XL: Story = sizeStory("3XL");
export const Size4XL: Story = sizeStory("4XL");
