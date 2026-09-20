"use client";

import { Suspense, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Star,
  ClipboardList,
  ClipboardCheck,
  BotMessageSquare,
  Folder,
  Calendar,
  Target,
  BookOpen,
  EllipsisVertical,
  ChevronLeft,
  Plus,
  Pencil,
  Share,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { IconSlot } from "@/components/IconSlot/IconSlot";
import { MicIcon } from "@/components/icons/MicIcon";
import "./plan.css";

interface SettingsRow {
  label: string;
  icon: ReactNode;
  colorVar: string;
}

// Colors sourced from tokens.json's `accent` semantic family (green/brand/
// coral/magenta) plus `feedback.error` for the destructive action — not
// specified in sprint-context.md or design-system.md (this menu is outside
// the recall feature's decided scope), built per explicit request. See
// component-gaps.md.
const SETTINGS_ROWS: SettingsRow[] = [
  { label: "Create new plan", icon: <Plus size="100%" strokeWidth={2} aria-hidden="true" />, colorVar: "--color-accent-green-bold" },
  { label: "Edit plan", icon: <Pencil size="100%" strokeWidth={2} aria-hidden="true" />, colorVar: "--color-accent-brand-bold" },
  { label: "Share plan", icon: <Share size="100%" strokeWidth={2} aria-hidden="true" />, colorVar: "--color-accent-coral-bold" },
  { label: "Give feedback", icon: <MessageCircle size="100%" strokeWidth={2} aria-hidden="true" />, colorVar: "--color-accent-magenta-bold" },
  { label: "Delete plan", icon: <Trash2 size="100%" strokeWidth={2} aria-hidden="true" />, colorVar: "--color-feedback-error-bold" },
];

// Figma tags the done-node icon explicitly as "icon / star (lucide)"; the
// others (todo/chat/folder/meta) aren't tagged but Lucide is the confirmed
// source library for this file, so they're pulled from the same set rather
// than hand-approximated. The nav bar's chat icon is a custom "myai-chat"
// component in Figma (bot-in-a-bubble shape) with no exact Lucide
// equivalent — BotMessageSquare is the closest semantic match, not a pixel
// match. The meta row's icons are "akar-icons:calendar" and
// "fluent:target-arrow-16-regular" in Figma — different icon sets entirely;
// substituted Lucide's Calendar/Target rather than adding two more icon
// library dependencies for two icons.
const StarIcon = <Star size="100%" fill="currentColor" strokeWidth={0} aria-hidden="true" />;
const QuizIcon = <ClipboardList size="100%" strokeWidth={1.8} aria-hidden="true" />;
const ChatIcon = <BotMessageSquare size="100%" strokeWidth={1.8} aria-hidden="true" />;
const FolderIcon = <Folder size="100%" strokeWidth={1.8} aria-hidden="true" />;

// Figma's "Practice Exam" current-node icon is "hugeicons:quiz-03", a
// library not otherwise used anywhere in this project — substituted
// Lucide's ClipboardCheck (closest match, distinct from the plain
// ClipboardList already used for todo nodes) rather than adding a second
// icon library for one icon.
const ExamIcon = <ClipboardCheck size="100%" strokeWidth={1.8} aria-hidden="true" />;

type TopicNodeState = "done" | "current" | "todo";

interface TopicNode {
  state: TopicNodeState;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

const TOPIC_NODES: TopicNode[] = [
  { state: "done", title: "Cell Structure and Function" },
  { state: "done", title: "Cell Size" },
  { state: "done", title: "Plasma Membrane" },
  {
    state: "current",
    title: "Explain it out loud",
    subtitle: "Practice your knowledge from the last 3 topics",
  },
  { state: "todo", title: "Membrane Permeability" },
  { state: "todo", title: "Membrane Transport" },
];

// Figma's "Screen 18 / Plan: Unit 2, after the session" — the recall step
// flips to done and a new "Practice Exam" node becomes current. Only the
// just-completed step changes state; 2.4/2.5 stay "todo" as they were
// before (Figma's own example also shows them as "done," but that reads
// like unrelated further progress bundled into the same illustrative
// frame, not something completing the recall session itself would cause —
// not copied here). "Practice Exam" has no destination anywhere in
// sprint-context.md/SPEC.md, so it's non-interactive, same as other
// static nodes.
const TOPIC_NODES_AFTER_SESSION: TopicNode[] = [
  { state: "done", title: "Cell Structure and Function" },
  { state: "done", title: "Cell Size" },
  { state: "done", title: "Plasma Membrane" },
  { state: "done", title: "Explain it out loud" },
  { state: "current", title: "Practice Exam", icon: ExamIcon },
  { state: "todo", title: "Membrane Permeability" },
  { state: "todo", title: "Membrane Transport" },
];

// Same status as every other scripted concept name in this prototype —
// draft, matching Figma's own example rather than this build's actual
// per-term outcome data (which doesn't assign human-readable concept names
// per term yet). Flagged in component-gaps.md.
const REVIEW_AGAIN_CONCEPTS = ["Nucleus", "Osmosis"];

function TopicRing({ state, icon }: { state: TopicNodeState; icon?: ReactNode }) {
  const defaultIcon = state === "done" ? StarIcon : state === "current" ? <MicIcon /> : QuizIcon;
  return (
    <span className={`topic-ring topic-ring--${state}`}>
      <IconSlot size="300" icon={icon ?? defaultIcon} />
    </span>
  );
}

export default function StudyPlanPage() {
  return (
    <Suspense fallback={null}>
      <StudyPlanContent />
    </Suspense>
  );
}

function StudyPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [settingsOpen, setSettingsOpen] = useState(false);
  // This is how the real flow reaches Screen 18 today: Summary's close and
  // Continue both navigate here with ?afterSession=1 once all 4 terms
  // resolve. It's a query param rather than real persisted session state
  // (no shared state/storage connects the recall loop's actual per-term
  // outcomes back to this screen — that's a bigger piece of work), so the
  // Review Again block always shows the same two example concepts
  // regardless of what actually happened in the session just finished.
  // Also reachable directly as a manual preview, same as Processing's
  // ?slow=1.
  const afterSession = searchParams.get("afterSession") === "1";
  const topicNodes = afterSession ? TOPIC_NODES_AFTER_SESSION : TOPIC_NODES;

  return (
    <main className="study-plan">
      <header className="study-plan__app-bar">
        <button
          type="button"
          className="study-plan__back"
          aria-label="Back to Biology"
          onClick={() => router.push("/course/biology")}
        >
          <IconSlot size="300" icon={<ChevronLeft size="100%" strokeWidth={2} aria-hidden="true" />} />
        </button>
        <div className="study-plan__app-bar-text">
          <h1 className="study-plan__title">Biology Unit 2: Cells Exam</h1>
          <div className="study-plan__meta">
            <span className="study-plan__meta-item">
              <IconSlot size="200" icon={<Calendar size="100%" strokeWidth={1.8} aria-hidden="true" />} />
              6 days left
            </span>
            <span className="study-plan__meta-dot" aria-hidden="true">
              &middot;
            </span>
            <span className="study-plan__meta-item">
              <IconSlot size="200" icon={<Target size="100%" strokeWidth={1.8} aria-hidden="true" />} />
              Grade goal: A
            </span>
          </div>
        </div>
        <button
          type="button"
          className="study-plan__kebab"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          <IconSlot size="300" icon={<EllipsisVertical size="100%" strokeWidth={2} aria-hidden="true" />} />
        </button>
      </header>

      <div className="study-plan__body">
        <div className="study-plan__tabs">
          <span className="study-plan__tab study-plan__tab--active">Plan</span>
          <span className="study-plan__tab">Materials</span>
        </div>

        <div className="study-plan__topic-pill">
          <span className="study-plan__topic-pill-label">Unit 2: Cells</span>
          <span className="study-plan__topic-pill-divider" aria-hidden="true" />
          <span className="study-plan__topic-pill-icon">
            <IconSlot size="300" icon={<BookOpen size="100%" strokeWidth={2} aria-hidden="true" />} />
          </span>
        </div>

        <ol className="study-plan__path">
          {topicNodes.map((node) =>
            node.state === "current" && node.title === "Explain it out loud" ? (
              <li key={node.title}>
                <button
                  type="button"
                  className="study-plan__node"
                  onClick={() => router.push("/recall/1/prompt")}
                >
                  <TopicRing state={node.state} icon={node.icon} />
                  <span className="study-plan__node-label">
                    <span className="study-plan__node-title">{node.title}</span>
                    {node.subtitle ? (
                      <span className="study-plan__node-subtitle">{node.subtitle}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            ) : (
              <li key={node.title} className="study-plan__node study-plan__node--static">
                <TopicRing state={node.state} icon={node.icon} />
                <span className="study-plan__node-label">
                  <span className="study-plan__node-title">{node.title}</span>
                </span>
              </li>
            )
          )}
        </ol>
      </div>

      {afterSession ? (
        <div className="study-plan__review-again">
          <div className="study-plan__review-again-card">
            <p className="study-plan__review-again-label">Review again</p>
            {REVIEW_AGAIN_CONCEPTS.map((concept) => (
              <div key={concept} className="study-plan__review-again-concept">
                {concept}
              </div>
            ))}
            {/* "New session scoped to the flagged concepts" (SPEC.md's
                Review Again decision) isn't implemented — this always
                restarts the same fixed 4-term session, same as the
                regular recall card. Flagged in component-gaps.md. */}
            <button
              type="button"
              className="study-plan__review-again-start"
              onClick={() => router.push("/recall/1/prompt")}
            >
              Start review
            </button>
          </div>
        </div>
      ) : null}

      <nav className="study-plan__nav-bar">
        <span className="study-plan__nav-slot">
          <IconSlot size="300" icon={ChatIcon} />
        </span>
        <span className="study-plan__nav-slot study-plan__nav-slot--accent">
          <IconSlot size="300" icon={FolderIcon} />
        </span>
        <span className="study-plan__avatar" aria-hidden="true" />
      </nav>

      {settingsOpen ? (
        <div className="study-plan__sheet-scrim" onClick={() => setSettingsOpen(false)}>
          <div className="study-plan__sheet" onClick={(event) => event.stopPropagation()}>
            <div className="study-plan__sheet-handle" />
            <h2 className="study-plan__sheet-title">Settings</h2>
            <ul className="study-plan__sheet-rows">
              {SETTINGS_ROWS.map((row) => (
                <li key={row.label}>
                  <button
                    type="button"
                    className="study-plan__sheet-row"
                    onClick={() => setSettingsOpen(false)}
                  >
                    <span
                      className="study-plan__sheet-row-icon"
                      style={{ color: `var(${row.colorVar})` }}
                    >
                      <IconSlot size="300" icon={row.icon} />
                    </span>
                    <span className="study-plan__sheet-row-label">{row.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </main>
  );
}
