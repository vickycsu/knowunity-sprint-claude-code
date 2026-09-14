import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button, type ButtonSize, type ButtonState, type ButtonVariant } from "./Button";

const DESCRIPTION = `**What it is:** A labeled action button with Primary, Secondary, and Tertiary styles; S, M, and L sizes; four interaction states; and an optional leading icon.

**When to use it:** Use when an action benefits from a visible text label. Choose the style and size based on the action's hierarchy and available space. Use Primary for the most important action when one clear primary action is needed.

**Don't:** Don't make every action Primary. Reserve the strongest emphasis for the action that matters most in the current context.`;

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["Primary", "Secondary", "Tertiary"] },
    size: { control: "select", options: ["S", "M", "L"] },
    state: { control: "select", options: ["Default", "Pressed", "Disabled", "Loading"] },
  },
  args: {
    cta: "Continue",
    variant: "Primary",
    size: "S",
    state: "Default",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

function variant(name: string, variant: ButtonVariant, size: ButtonSize, state: ButtonState): Story {
  return {
    name,
    args: { variant, size, state },
  };
}

// Primary
export const PrimarySDefault: Story = variant("Primary/S/Default", "Primary", "S", "Default");
export const PrimarySPressed: Story = variant("Primary/S/Pressed", "Primary", "S", "Pressed");
export const PrimarySDisabled: Story = variant("Primary/S/Disabled", "Primary", "S", "Disabled");
export const PrimarySLoading: Story = variant("Primary/S/Loading", "Primary", "S", "Loading");
export const PrimaryMDefault: Story = variant("Primary/M/Default", "Primary", "M", "Default");
export const PrimaryMPressed: Story = variant("Primary/M/Pressed", "Primary", "M", "Pressed");
export const PrimaryMDisabled: Story = variant("Primary/M/Disabled", "Primary", "M", "Disabled");
export const PrimaryMLoading: Story = variant("Primary/M/Loading", "Primary", "M", "Loading");
export const PrimaryLDefault: Story = variant("Primary/L/Default", "Primary", "L", "Default");
export const PrimaryLPressed: Story = variant("Primary/L/Pressed", "Primary", "L", "Pressed");
export const PrimaryLDisabled: Story = variant("Primary/L/Disabled", "Primary", "L", "Disabled");
export const PrimaryLLoading: Story = variant("Primary/L/Loading", "Primary", "L", "Loading");

// Secondary
export const SecondarySDefault: Story = variant("Secondary/S/Default", "Secondary", "S", "Default");
export const SecondarySPressed: Story = variant("Secondary/S/Pressed", "Secondary", "S", "Pressed");
export const SecondarySDisabled: Story = variant("Secondary/S/Disabled", "Secondary", "S", "Disabled");
export const SecondarySLoading: Story = variant("Secondary/S/Loading", "Secondary", "S", "Loading");
export const SecondaryMDefault: Story = variant("Secondary/M/Default", "Secondary", "M", "Default");
export const SecondaryMPressed: Story = variant("Secondary/M/Pressed", "Secondary", "M", "Pressed");
export const SecondaryMDisabled: Story = variant("Secondary/M/Disabled", "Secondary", "M", "Disabled");
export const SecondaryMLoading: Story = variant("Secondary/M/Loading", "Secondary", "M", "Loading");
export const SecondaryLDefault: Story = variant("Secondary/L/Default", "Secondary", "L", "Default");
export const SecondaryLPressed: Story = variant("Secondary/L/Pressed", "Secondary", "L", "Pressed");
export const SecondaryLDisabled: Story = variant("Secondary/L/Disabled", "Secondary", "L", "Disabled");
export const SecondaryLLoading: Story = variant("Secondary/L/Loading", "Secondary", "L", "Loading");

// Tertiary
export const TertiarySDefault: Story = variant("Tertiary/S/Default", "Tertiary", "S", "Default");
export const TertiarySPressed: Story = variant("Tertiary/S/Pressed", "Tertiary", "S", "Pressed");
export const TertiarySDisabled: Story = variant("Tertiary/S/Disabled", "Tertiary", "S", "Disabled");
export const TertiarySLoading: Story = variant("Tertiary/S/Loading", "Tertiary", "S", "Loading");
export const TertiaryMDefault: Story = variant("Tertiary/M/Default", "Tertiary", "M", "Default");
export const TertiaryMPressed: Story = variant("Tertiary/M/Pressed", "Tertiary", "M", "Pressed");
export const TertiaryMDisabled: Story = variant("Tertiary/M/Disabled", "Tertiary", "M", "Disabled");
export const TertiaryMLoading: Story = variant("Tertiary/M/Loading", "Tertiary", "M", "Loading");
export const TertiaryLDefault: Story = variant("Tertiary/L/Default", "Tertiary", "L", "Default");
export const TertiaryLPressed: Story = variant("Tertiary/L/Pressed", "Tertiary", "L", "Pressed");
export const TertiaryLDisabled: Story = variant("Tertiary/L/Disabled", "Tertiary", "L", "Disabled");
export const TertiaryLLoading: Story = variant("Tertiary/L/Loading", "Tertiary", "L", "Loading");

// With icon (showLeftIcon), shown at the default S/Primary combination
export const WithLeftIcon: Story = {
  name: "With left icon",
  args: {
    variant: "Primary",
    size: "S",
    state: "Default",
    showLeftIcon: true,
    leftIcon: (
      <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M4 8h8M8 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
};
