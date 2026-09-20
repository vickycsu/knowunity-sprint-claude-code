import { Mic } from "lucide-react";

/**
 * Figma's `icon / mic` (node 15671:11036, "Explain it out loud" path node on
 * Screen 03) isn't tagged to a specific icon library there, but Lucide is the
 * confirmed source for this file's other icons (e.g. `icon / star (lucide)`),
 * and Lucide's Mic is the standard match. Also needed by the Prompt screen's
 * mic tap affordance (SPEC.md Screen 4) — shared rather than inlined
 * per-screen since two screens need it.
 */
export function MicIcon() {
  return <Mic size="100%" strokeWidth={1.8} aria-hidden="true" />;
}
