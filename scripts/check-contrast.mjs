#!/usr/bin/env node
// Every text/background token pairing actually used in the codebase gets its
// contrast ratio computed here, once, instead of re-discovered by hand by a
// different critic on a different token pair each review round (scorecards
// 01, 03, 04, 05 each independently caught a contrast failure — always a
// pairing nobody had computed yet, never one that had already been checked).
//
// Reads resolved colors from build/css/tokens.css (already flattened to real
// hex/rgba by style-dictionary — alpha tokens included), scans every src/**/*.css
// file for `color`/`background`/`background-color` declarations that reference
// a --color-* custom property IN THE SAME RULE BLOCK, and checks every such
// pairing against the WCAG AA 4.5:1 floor for normal-size text. This assumes
// normal (not large) text throughout, matching how every contrast finding in
// this project's eval history was actually graded — a real false positive on
// genuinely large text is a case to add to KNOWN_SAFE below, not a reason to
// loosen the default.
//
// Known limitation: this only catches a background declared in the SAME block
// as the color that sits on it. A text color whose background is set on an
// ancestor selector in a different block (rather than `background: none` +
// inheriting) won't be paired here — that needs real DOM/cascade resolution,
// which a static CSS scan can't do. Two of this project's five recurring
// contrast near-misses (text.tertiary on background.input, inherited from a
// parent wrapper) are exactly this case and won't be caught by this script;
// they're still worth a manual spot-check until this script grows a real
// cascade-aware pass.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const TOKENS_CSS = join(ROOT, "build/css/tokens.css");
const SRC_DIR = join(ROOT, "src");
const CONTRAST_MIN = 4.5;

// Pairings confirmed safe to ignore — a text token and a background token
// that are both used somewhere in the same file but never actually render
// together. Add an entry here only after checking the real render, with a
// comment saying why.
const KNOWN_SAFE = new Set([
  // background-stacking (tokens.json: "Additive white layer for stacking
  // elevation on dark surfaces") is never a standalone opaque background —
  // it's an additive overlay composited on top of whatever surface is
  // already there (confirmed: button-icon.css:137 stacks it inside a
  // linear-gradient(), never sets it alone). Computing contrast against it
  // as if it were the final rendered surface produces a false failure.
  "src/components/SessionBar/session-bar.css::color-text-primary::color-background-stacking",
  "src/app/recall/summary/summary.css::color-text-primary::color-background-stacking",
  "src/app/course/biology/plan/plan.css::color-text-primary::color-background-stacking",
  "src/app/course/biology/plan/plan.css::color-text-secondary::color-background-stacking",
  // text.disabled (tokens.json: "signaling 'unavailable'... disabled
  // buttons, toggles, sliders") only pairs with background.surface in a
  // disabled control state — WCAG 2.1 explicitly exempts disabled/inactive
  // UI components from the contrast requirement (Success Criterion 1.4.3).
  "src/components/Button/button.css::color-text-disabled::color-background-surface",
  "src/components/ButtonIcon/button-icon.css::color-text-disabled::color-background-surface",
]);

function parseColor(value) {
  value = value.trim();
  if (value.startsWith("#")) {
    let hex = value.slice(1);
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
  const [r, g, b, a = 1] = parts;
  return { r, g, b, a };
}

function parseTokens(cssText) {
  const map = new Map();
  const varRe = /--([a-zA-Z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\s*;/g;
  let m;
  while ((m = varRe.exec(cssText))) {
    const color = parseColor(m[2]);
    if (color) map.set(m[1], color);
  }
  return map;
}

function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function compositeOver(fg, bg) {
  if (fg.a >= 1) return fg;
  const a = fg.a;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
  };
}

function walk(dir, exts, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, exts, out);
    else if (exts.includes(extname(full))) out.push(full);
  }
  return out;
}

// Splits into rule blocks (selector { ...declarations... }) and returns each
// block's own color/background pairing candidates — not a file-wide set.
function findBlockPairs(cssText) {
  const blocks = [];
  const blockRe = /\{([^{}]*)\}/g;
  let m;
  while ((m = blockRe.exec(cssText))) {
    const body = m[1];
    const textVars = new Set();
    const bgVars = new Set();
    const declRe = /([a-zA-Z-]+)\s*:\s*[^;]*var\(--([a-zA-Z0-9-]+)\)/g;
    let d;
    while ((d = declRe.exec(body))) {
      const [, prop, varName] = d;
      if (prop === "color") textVars.add(varName);
      if (prop === "background" || prop === "background-color") bgVars.add(varName);
    }
    if (textVars.size && bgVars.size) blocks.push({ textVars, bgVars });
  }
  return blocks;
}

const tokens = parseTokens(readFileSync(TOKENS_CSS, "utf8"));
const cssFiles = walk(SRC_DIR, [".css"]);

const failures = [];
let pairsChecked = 0;

for (const file of cssFiles) {
  const text = readFileSync(file, "utf8");
  const blocks = findBlockPairs(text);
  if (blocks.length === 0) continue;
  const relFile = file.slice(ROOT.length);

  for (const { textVars, bgVars } of blocks) {
    for (const t of textVars) {
      const fg = tokens.get(t);
      if (!fg) continue;
      for (const b of bgVars) {
        const bg = tokens.get(b);
        if (!bg) continue;
        if (KNOWN_SAFE.has(`${relFile}::${t}::${b}`)) continue;

        pairsChecked++;
        const composited = compositeOver(fg, bg);
        const ratio = contrastRatio(composited, bg);
        if (ratio < CONTRAST_MIN) {
          failures.push({ file: relFile, text: t, background: b, ratio });
        }
      }
    }
  }
}

if (failures.length) {
  console.error(`\n✗ check:contrast — ${failures.length} pairing(s) below ${CONTRAST_MIN}:1\n`);
  for (const f of failures) {
    console.error(`  ${f.file}`);
    console.error(
      `    color: var(--${f.text})  on  background: var(--${f.background})  →  ${f.ratio.toFixed(2)}:1\n`
    );
  }
  console.error(
    `Checked ${pairsChecked} text/background pairing(s) across ${cssFiles.length} file(s) in src/.\n` +
      `If a failing pairing never actually renders together, add it to KNOWN_SAFE in scripts/check-contrast.mjs with a comment saying why — after checking the real render, not before.\n`
  );
  process.exit(1);
} else {
  console.log(
    `✓ check:contrast — all ${pairsChecked} text/background pairing(s) across ${cssFiles.length} file(s) in src/ clear ${CONTRAST_MIN}:1`
  );
}
