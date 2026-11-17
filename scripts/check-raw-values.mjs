#!/usr/bin/env node
// check:tokens — finds raw values that bypass the token layer.
//
// Every color and size should come through var(--…) from build/css/tokens.css.
// This scans src/**/*.css (comments stripped) for raw hex colors, rgb()/hsl()
// color functions, and px/rem/em lengths, and src/**/*.{ts,tsx} for raw hex
// and color functions. A bare 0 needs no token and isn't flagged.
//
// Not scanned: src/stories/ (the Foundations page renders the token scale
// itself, so raw sizes there are documentation, not product), and px inside
// .tsx, which is computed at runtime (e.g. the keyboard inset) rather than
// written by hand.
//
// Known limitation: a hex-looking id selector (#fade) in CSS would be flagged.
// None exist today.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const SKIP_DIRS = new Set([join(SRC, "stories")]);

// Raw values already disclosed as deliberate exceptions. Each one names where
// it's logged. Keyed by file::value, so the same value elsewhere is still caught.
// Add a value here only after it's logged in component-gaps.md or
// docs/design-system.md — never to make the check pass.
const KNOWN_EXCEPTIONS = new Set([
  // component-gaps.md: RecordingControl reduced to 180 / 140 / 32 per explicit
  // request; the illustration scale has nothing between 120 and 178.
  "src/components/RecordingControl/recording-control.css::180px",
  "src/components/RecordingControl/recording-control.css::140px",
  "src/components/RecordingControl/recording-control.css::32px",
  // component-gaps.md (pause/resume crossfade): the overlay repeats
  // RecordingControl's 140px circle and 32px glow so the two states match.
  "src/app/recall/[term]/recording/recording.css::140px",
  "src/app/recall/[term]/recording/recording.css::32px",
  // component-gaps.md: empty-state transcript border is violet.500 at 45% in
  // Figma; no semantic token expresses a translucent violet border.
  "src/app/recall/[term]/result/result.css::rgba(145, 120, 230, 0.45)",
  // component-gaps.md: ButtonIcon bevel shadow; no elevation/shadow token yet.
  "src/components/ButtonIcon/button-icon.css::-2px",
  "src/components/ButtonIcon/button-icon.css::-4px",
  "src/components/ButtonIcon/button-icon.css::rgba(0, 0, 0, 0.15)",
  // component-gaps.md: MascotSlot thinking bob; no motion distance token.
  "src/components/MascotSlot/mascot-slot.css::-6px",
  // docs/design-system.md (sessionBar, Known gap): hand-built 44px close frame.
  "src/components/SessionBar/session-bar.css::44px",
]);

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const COLOR_FN = /\b(?:rgba?|hsla?)\([^)]*\)/g;
const LENGTH = /(?<![\w-])-?\d*\.?\d+(?:px|rem|em)\b/g;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (!SKIP_DIRS.has(path)) walk(path, out);
    } else if (/\.(css|tsx?)$/.test(name)) {
      out.push(path);
    }
  }
  return out;
}

// Blank out comments but keep newlines, so line numbers stay true.
function stripComments(text, isCss) {
  const blank = (m) => m.replace(/[^\n]/g, " ");
  let out = text.replace(/\/\*[\s\S]*?\*\//g, blank);
  if (!isCss) out = out.replace(/^\s*\/\/.*$/gm, blank);
  return out;
}

const findings = [];
const files = walk(SRC);

for (const file of files) {
  const rel = relative(ROOT, file);
  const isCss = file.endsWith(".css");
  const lines = stripComments(readFileSync(file, "utf8"), isCss).split("\n");
  const patterns = isCss ? [HEX, COLOR_FN, LENGTH] : [HEX, COLOR_FN];

  lines.forEach((line, i) => {
    for (const pattern of patterns) {
      for (const match of line.matchAll(pattern)) {
        const value = match[0];
        if (pattern === LENGTH && parseFloat(value) === 0) continue;
        if (KNOWN_EXCEPTIONS.has(`${rel}::${value}`)) continue;
        findings.push({ file: rel, line: i + 1, value });
      }
    }
  });
}

if (findings.length > 0) {
  let report = `\n✗ check:tokens — ${findings.length} raw value(s) outside the token layer\n\n`;
  for (const f of findings) report += `  ${f.file}:${f.line}  ${f.value}\n`;
  report +=
    `\nUse a semantic token from tokens/tokens.json instead. If no token fits, stop and say so.\n` +
    `If the value is a deliberate exception, log it in component-gaps.md first, then add it to\n` +
    `KNOWN_EXCEPTIONS in scripts/check-raw-values.mjs with a comment saying where it's logged.\n`;
  process.stderr.write(report);
  process.exit(1);
}

console.log(`✓ check:tokens — no raw values across ${files.length} file(s) in src/`);
