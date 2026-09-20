"use client";

import { useRouter } from "next/navigation";
import { Folder, EllipsisVertical, BotMessageSquare } from "lucide-react";
import { IconSlot } from "../components/IconSlot/IconSlot";
import { Button } from "../components/Button/Button";
import "./page.css";

interface Course {
  slug: string;
  name: string;
}

const COURSES: Course[] = [
  { slug: "biology", name: "Biology" },
  { slug: "chemistry", name: "Chemistry" },
];

export default function CoursesPage() {
  const router = useRouter();

  return (
    <main className="courses">
      <div className="courses__body">
        <h1 className="courses__title">Courses</h1>

        <ul className="courses__list">
          {COURSES.map((course) => (
            <li key={course.slug}>
              <button
                type="button"
                className="courses__row"
                onClick={() => router.push(`/course/${course.slug}`)}
              >
                <span className="courses__row-icon">
                  <IconSlot size="200" icon={<Folder size="100%" strokeWidth={1.5} aria-hidden="true" />} />
                </span>
                <span className="courses__row-name">{course.name}</span>
                <span className="courses__row-kebab" aria-hidden="true">
                  <IconSlot size="200" icon={<EllipsisVertical size="100%" strokeWidth={2} aria-hidden="true" />} />
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="courses__spacer" />

        {/* No destination — "create a course" isn't a decided flow anywhere
            in this prototype's scope. See component-gaps.md. */}
        <Button cta="Create a course" variant="Primary" size="L" className="courses__create" />
      </div>

      <nav className="courses__nav-bar">
        <span className="courses__nav-slot">
          <IconSlot size="300" icon={<BotMessageSquare size="100%" strokeWidth={1.8} aria-hidden="true" />} />
        </span>
        <span className="courses__nav-slot courses__nav-slot--accent">
          <IconSlot size="300" icon={<Folder size="100%" strokeWidth={1.8} aria-hidden="true" />} />
        </span>
        <span className="courses__avatar" aria-hidden="true" />
      </nav>
    </main>
  );
}
