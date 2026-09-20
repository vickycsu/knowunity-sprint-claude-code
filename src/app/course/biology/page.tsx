"use client";

import { useRouter } from "next/navigation";
import { Folder, EllipsisVertical, BotMessageSquare, ChevronLeft } from "lucide-react";
import { IconSlot } from "@/components/IconSlot/IconSlot";
import { Button } from "@/components/Button/Button";
import "./course.css";

interface Unit {
  slug: string;
  name: string;
  href?: string;
}

// Only "Unit 2: Cells" has a built plan behind it — the other three units
// have no decided destination anywhere in this prototype's scope, so they're
// static rows rather than links to invented routes. Same precedent as the
// Study plan screen's done/todo topic nodes.
const UNITS: Unit[] = [
  { slug: "unit-1", name: "Unit 1: Chemistry of Life" },
  { slug: "unit-2", name: "Unit 2: Cells", href: "/course/biology/plan" },
  { slug: "unit-3", name: "Unit 3: Cellular Energetics" },
  { slug: "unit-4", name: "Unit 4: Cell Communication and Cell Cycle" },
];

export default function BiologyCoursePage() {
  const router = useRouter();

  return (
    <main className="course">
      <div className="course__body">
        <div className="course__header">
          <button
            type="button"
            className="course__back"
            aria-label="Back to Courses"
            onClick={() => router.push("/")}
          >
            <IconSlot size="300" icon={<ChevronLeft size="100%" strokeWidth={2} aria-hidden="true" />} />
          </button>
          <h1 className="course__title">Biology</h1>
        </div>

        <ul className="course__list">
          {UNITS.map((unit) =>
            unit.href ? (
              <li key={unit.slug}>
                <button
                  type="button"
                  className="course__row"
                  onClick={() => router.push(unit.href!)}
                >
                  <span className="course__row-icon">
                    <IconSlot size="200" icon={<Folder size="100%" strokeWidth={1.5} aria-hidden="true" />} />
                  </span>
                  <span className="course__row-name">{unit.name}</span>
                  <span className="course__row-kebab" aria-hidden="true">
                    <IconSlot size="200" icon={<EllipsisVertical size="100%" strokeWidth={2} aria-hidden="true" />} />
                  </span>
                </button>
              </li>
            ) : (
              <li key={unit.slug} className="course__row course__row--static">
                <span className="course__row-icon">
                  <IconSlot size="200" icon={<Folder size="100%" strokeWidth={1.5} aria-hidden="true" />} />
                </span>
                <span className="course__row-name">{unit.name}</span>
                <span className="course__row-kebab" aria-hidden="true">
                  <IconSlot size="200" icon={<EllipsisVertical size="100%" strokeWidth={2} aria-hidden="true" />} />
                </span>
              </li>
            )
          )}
        </ul>

        <div className="course__spacer" />

        {/* No destination — "add a topic" isn't a decided flow anywhere in
            this prototype's scope. See component-gaps.md. */}
        <Button cta="Add a topic" variant="Primary" size="L" className="course__create" />
      </div>

      <nav className="course__nav-bar">
        <span className="course__nav-slot">
          <IconSlot size="300" icon={<BotMessageSquare size="100%" strokeWidth={1.8} aria-hidden="true" />} />
        </span>
        <span className="course__nav-slot course__nav-slot--accent">
          <IconSlot size="300" icon={<Folder size="100%" strokeWidth={1.8} aria-hidden="true" />} />
        </span>
        <span className="course__avatar" aria-hidden="true" />
      </nav>
    </main>
  );
}
