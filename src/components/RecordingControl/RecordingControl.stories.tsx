import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RecordingControl } from "./RecordingControl";

const DESCRIPTION = `**What it is:** The circular, glowing affordance shown while Knowie is actively recording, replacing the idle mic button for the duration of the take.

**When to use it:** Use only inside the live recording screens. Listening while audio is being captured, Paused when the student pauses mid-answer. Set the \`text\` prop to match the state's copy.

**What each state means:** Listening is the glowing state, live while audio is being captured. Paused is the flat, non-glowing state — the frame's fill is background.surface — shown when the student pauses mid-answer.

**Don't:** Don't reuse it as a generic loading spinner or decorative glow elsewhere. It only signals whether the mic is live right now.`;

const meta = {
  title: "Components/RecordingControl",
  component: RecordingControl,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: DESCRIPTION,
      },
    },
  },
  argTypes: {
    state: { control: "select", options: ["Listening", "Paused"] },
  },
  args: {
    state: "Listening",
  },
} satisfies Meta<typeof RecordingControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateListening: Story = {
  name: "state=Listening",
  args: { state: "Listening" },
};

export const StatePaused: Story = {
  name: "state=Paused",
  args: { state: "Paused" },
};
