import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  ProgressIndicator,
  type ProgressIndicatorProgress,
  type ProgressIndicatorThickness,
  type ProgressIndicatorVariant,
} from "./ProgressIndicator";

const DESCRIPTION = `**What it is:** A progress indicator available in Primary or Coral, with two thicknesses and five predefined progress values: 0%, 25%, 50%, 75%, and 100%.

**When to use it:** Use when the required progress level matches one of the supported values.

**Don't:** Don't use this component to represent progress that requires a value between the available variants. Do not imply precision the component does not support.`;

const meta = {
  title: "Components/ProgressIndicator",
  component: ProgressIndicator,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    variant: { control: "select", options: ["Primary", "Coral"] },
    thickness: { control: "select", options: ["24", "16"] },
    progress: { control: "select", options: ["0", "25", "50", "75", "100"] },
    showText: { control: "boolean" },
  },
  args: {
    variant: "Primary",
    thickness: "24",
    progress: "0",
    showText: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 350 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

function variant(
  variant: ProgressIndicatorVariant,
  thickness: ProgressIndicatorThickness,
  progress: ProgressIndicatorProgress,
): Story {
  return {
    name: `variant=${variant}, thickness=${thickness}, progress=${progress}`,
    args: { variant, thickness, progress },
  };
}

// Primary, thickness 24
export const Primary24Progress0: Story = variant("Primary", "24", "0");
export const Primary24Progress25: Story = variant("Primary", "24", "25");
export const Primary24Progress50: Story = variant("Primary", "24", "50");
export const Primary24Progress75: Story = variant("Primary", "24", "75");
export const Primary24Progress100: Story = variant("Primary", "24", "100");

// Primary, thickness 16
export const Primary16Progress0: Story = variant("Primary", "16", "0");
export const Primary16Progress25: Story = variant("Primary", "16", "25");
export const Primary16Progress50: Story = variant("Primary", "16", "50");
export const Primary16Progress75: Story = variant("Primary", "16", "75");
export const Primary16Progress100: Story = variant("Primary", "16", "100");

// Coral, thickness 24
export const Coral24Progress0: Story = variant("Coral", "24", "0");
export const Coral24Progress25: Story = variant("Coral", "24", "25");
export const Coral24Progress50: Story = variant("Coral", "24", "50");
export const Coral24Progress75: Story = variant("Coral", "24", "75");
export const Coral24Progress100: Story = variant("Coral", "24", "100");

// Coral, thickness 16
export const Coral16Progress0: Story = variant("Coral", "16", "0");
export const Coral16Progress25: Story = variant("Coral", "16", "25");
export const Coral16Progress50: Story = variant("Coral", "16", "50");
export const Coral16Progress75: Story = variant("Coral", "16", "75");
export const Coral16Progress100: Story = variant("Coral", "16", "100");

// showText, matching sessionBar's usage (counter visible)
export const WithCounterText: Story = {
  name: "showText=true",
  args: { showText: true, counterText: "1/4" },
};
