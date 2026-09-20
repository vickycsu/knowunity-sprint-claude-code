import type { CSSProperties } from "react";
import "./skeleton-line.css";

export interface SkeletonLineProps {
  /** CSS width for this instance. Free width by design — resize per instance, there's no fixed count of lines. */
  width?: CSSProperties["width"];
  className?: string;
}

export function SkeletonLine({ width = "100%", className }: SkeletonLineProps) {
  const classes = ["skeleton-line", className].filter(Boolean).join(" ");
  return <div className={classes} style={{ width }} />;
}
