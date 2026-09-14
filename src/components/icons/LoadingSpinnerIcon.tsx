import "./loading-spinner-icon.css";

/**
 * Vector data extracted directly from Figma's `loading-01` component
 * (node 3248:81187 / vector 3248:80752), an 8-ray radial icon, not a ring.
 * Rays are listed clockwise starting at 12 o'clock, each split into its own
 * path (Figma ships them as one merged path) so a comet-tail opacity
 * gradient plus a stepped rotation reproduces the per-ray chase look
 * without independent per-ray keyframes.
 */
const RAYS = [
  "M 6.5 2.33 L 6.5 0.67 C 6.5 0.3 6.8 0 7.17 0 C 7.53 0 7.83 0.3 7.83 0.67 L 7.83 2.33 C 7.83 2.7 7.53 3 7.17 3 C 6.8 3 6.5 2.7 6.5 2.33 Z",
  "M 11.14 2.31 C 11.4 2.05 11.82 2.05 12.08 2.31 C 12.34 2.57 12.34 2.99 12.08 3.25 L 11.14 4.19 C 10.88 4.45 10.46 4.45 10.2 4.19 C 9.93 3.93 9.93 3.51 10.2 3.25 L 11.14 2.31 Z",
  "M 13.33 6.5 C 13.7 6.5 14 6.8 14 7.17 C 14 7.53 13.7 7.83 13.33 7.83 L 12.33 7.83 C 11.97 7.83 11.67 7.53 11.67 7.17 C 11.67 6.8 11.97 6.5 12.33 6.5 L 13.33 6.5 Z",
  "M 10.53 10.53 C 10.79 10.27 11.21 10.27 11.47 10.53 L 11.94 11 C 12.2 11.26 12.2 11.68 11.94 11.94 C 11.68 12.2 11.26 12.2 11 11.94 L 10.53 11.47 C 10.27 11.21 10.27 10.79 10.53 10.53 Z",
  "M 6.5 13.83 L 6.5 11.17 C 6.5 10.8 6.8 10.5 7.17 10.5 C 7.53 10.5 7.83 10.8 7.83 11.17 L 7.83 13.83 C 7.83 14.2 7.53 14.5 7.17 14.5 C 6.8 14.5 6.5 14.2 6.5 13.83 Z",
  "M 3.86 9.53 C 4.12 9.27 4.54 9.27 4.8 9.53 C 5.07 9.79 5.07 10.21 4.8 10.47 L 2.92 12.36 C 2.66 12.62 2.24 12.62 1.98 12.36 C 1.72 12.1 1.72 11.67 1.98 11.41 L 3.86 9.53 Z",
  "M 3 6.5 C 3.37 6.5 3.67 6.8 3.67 7.17 C 3.67 7.53 3.37 7.83 3 7.83 L 0.67 7.83 C 0.3 7.83 0 7.53 0 7.17 C 0 6.8 0.3 6.5 0.67 6.5 L 3 6.5 Z",
  "M 2.11 2.17 C 2.37 1.91 2.8 1.91 3.06 2.17 L 4.47 3.58 C 4.73 3.84 4.73 4.26 4.47 4.52 C 4.21 4.79 3.79 4.79 3.53 4.52 L 2.11 3.11 C 1.85 2.85 1.85 2.43 2.11 2.17 Z",
];

const OPACITIES = [1, 0.86, 0.72, 0.58, 0.44, 0.3, 0.16, 0.08];

export function LoadingSpinnerIcon() {
  return (
    <svg
      className="loading-spinner-icon"
      width="100%"
      height="100%"
      viewBox="0 0 14 14.5"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden="true"
    >
      {RAYS.map((d, i) => (
        <path key={i} d={d} fill="currentColor" opacity={OPACITIES[i]} />
      ))}
    </svg>
  );
}
