import { MascotSlot } from "@/components/MascotSlot/MascotSlot";
import "./knowie-asks.css";

export interface KnowieAsksProps {
  question: string;
}

/**
 * The question, said by Knowie. Knowie sits small at the bubble's side like a
 * chat avatar so the question, not the mascot, is what the eye lands on.
 * Shared by Prompt, Recording and the typing turn so the question holds the
 * same place as the student moves between them.
 */
export function KnowieAsks({ question }: KnowieAsksProps) {
  return (
    <div className="knowie-asks">
      <MascotSlot size="XL" pose="standby" />
      <div className="knowie-asks__bubble">
        <p className="knowie-asks__question">{question}</p>
      </div>
    </div>
  );
}
