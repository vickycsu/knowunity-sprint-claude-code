import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Chips, type ChipsColor, type ChipsSize } from "./Chips";

const DESCRIPTION = `**What it is:** A compact pill-shaped control with an optional leading icon, label, and trailing icon. It has four sizes, two color variants, and active/inactive states.

**When to use it:** Use for compact labels, filters, modes, or lightweight selection controls where the content can be expressed as a short label.

**Don't:** Don't use chips as the primary action when the action needs the stronger hierarchy or affordance of a button.`;

const PlaceholderIcon = (
  <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 8h8M8 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const meta = {
  title: "Components/Chips",
  component: Chips,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["XXS", "XS", "S", "M"] },
    color: { control: "select", options: ["Primary", "pro"] },
    active: { control: "boolean" },
    showLeftIcon: { control: "boolean" },
    showRightIcon: { control: "boolean" },
  },
  args: {
    label: "Label",
    size: "XXS",
    color: "Primary",
    active: false,
    showLeftIcon: false,
    showRightIcon: false,
  },
} satisfies Meta<typeof Chips>;

export default meta;
type Story = StoryObj<typeof meta>;

function variant(size: ChipsSize, color: ChipsColor, active: boolean): Story {
  return {
    name: `size=${size}, color=${color}, active=${active ? "True" : "False"}`,
    args: { size, color, active },
  };
}

// Primary
export const XXSPrimaryFalse: Story = variant("XXS", "Primary", false);
export const XXSPrimaryTrue: Story = variant("XXS", "Primary", true);
export const XSPrimaryFalse: Story = variant("XS", "Primary", false);
export const XSPrimaryTrue: Story = variant("XS", "Primary", true);
export const SPrimaryFalse: Story = variant("S", "Primary", false);
export const SPrimaryTrue: Story = variant("S", "Primary", true);
export const MPrimaryFalse: Story = variant("M", "Primary", false);
export const MPrimaryTrue: Story = variant("M", "Primary", true);

// pro
export const XXSProFalse: Story = variant("XXS", "pro", false);
export const XXSProTrue: Story = variant("XXS", "pro", true);
export const XSProFalse: Story = variant("XS", "pro", false);
export const XSProTrue: Story = variant("XS", "pro", true);
export const SProFalse: Story = variant("S", "pro", false);
export const SProTrue: Story = variant("S", "pro", true);
export const MProFalse: Story = variant("M", "pro", false);
export const MProTrue: Story = variant("M", "pro", true);

// With icons, shown at the default combination
export const WithIcons: Story = {
  name: "With left and right icon",
  args: {
    size: "S",
    color: "Primary",
    active: true,
    showLeftIcon: true,
    showRightIcon: true,
    leftIcon: PlaceholderIcon,
    rightIcon: PlaceholderIcon,
  },
};
