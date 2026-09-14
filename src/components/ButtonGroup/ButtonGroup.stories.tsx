import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ButtonGroup } from "./ButtonGroup";

const DESCRIPTION = `**What it is:** A group containing exactly two \`button\` instances, arranged horizontally or vertically in M or L size.

**When to use it:** Use when two related actions need to be presented together and given equal structural prominence.

**Don't:** Don't use it for three or more actions, or to avoid defining action hierarchy. Use individual buttons when more than two actions are needed.`;

const CloseIcon = (
  <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const meta = {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["Horizontal", "Vertical"] },
    size: { control: "select", options: ["M", "L"] },
  },
  args: {
    variant: "Vertical",
    size: "M",
    primaryCta: "Continue",
    secondaryCta: "Skip",
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VerticalM: Story = {
  name: "Vertical/M",
  args: { variant: "Vertical", size: "M", primaryCta: "Continue", secondaryCta: "Skip" },
};

export const VerticalL: Story = {
  name: "Vertical/L",
  args: { variant: "Vertical", size: "L", primaryCta: "Continue", secondaryCta: "Skip" },
};

export const HorizontalM: Story = {
  name: "Horizontal/M",
  args: {
    variant: "Horizontal",
    size: "M",
    primaryCta: "Continue",
    secondaryIcon: CloseIcon,
    secondaryAriaLabel: "Close",
  },
};

export const HorizontalL: Story = {
  name: "Horizontal/L",
  args: {
    variant: "Horizontal",
    size: "L",
    primaryCta: "Continue",
    secondaryIcon: CloseIcon,
    secondaryAriaLabel: "Close",
  },
};
