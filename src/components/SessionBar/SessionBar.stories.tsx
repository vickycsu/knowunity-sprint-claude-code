import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SessionBar } from "./SessionBar";

const DESCRIPTION = `**What it is:** The fixed header used across the recall loop, combining a close control, session progress, and the XP chip for the current term.

**When to use it:** Use on every screen in the Ask & Answer loop and its result and edge-case screens. To change progress or XP state, pass the \`progress\`, \`counterText\`, and \`xpLabel\` props — the same way you'd edit a nested instance in Figma.

**Don't:** Don't add a variant for hidden progress, a different thickness, or a missing chip. Thickness is fixed at 24 with the counter always visible.`;

const meta = {
  title: "Components/SessionBar",
  component: SessionBar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  args: {
    progress: "0",
    counterText: "1/4",
    xpLabel: "0 XP",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 390 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SessionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
