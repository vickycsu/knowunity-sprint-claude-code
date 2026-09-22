import { chromium } from "playwright";
import path from "node:path";

const BASE = "http://localhost:3000";
const OUT = "/Users/vcs/Documents/00_Design Work & Projects/2026_Knowunity/knowunity-sprint-claude-code/eval/shots5";

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  colorScheme: "dark",
});

async function shot(name, url, { wait = 400, action, statusCheck = true } = {}) {
  const page = await context.newPage();
  const resp = await page.goto(BASE + url, { waitUntil: "networkidle" });
  const status = resp ? resp.status() : null;
  await page.waitForTimeout(wait);
  if (action) await action(page);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log(`${name}\t${url}\tstatus=${status}`);
  await page.close();
  return status;
}

// 01-02: Study plan context
await shot("01-study-plan", "/course/biology/plan");

// 03: Prompt idle (term 1)
await shot("03-prompt-idle", "/recall/1/prompt");

// 04: Recording — Listening (default)
await shot("04-recording-listening", "/recall/1/recording");

// 05: Recording — Paused (interact: click Pause button, aria-label="Pause")
await shot("05-recording-paused", "/recall/1/recording", {
  action: async (page) => {
    await page.getByRole("button", { name: "Pause" }).click();
    await page.waitForTimeout(300);
  },
});

// 06: Recording — say it back (sayback attempt, prefilled transcript, Listening)
await shot("06-recording-sayback", "/recall/1/recording?attempt=sayback");

// 07: Processing — normal ("Knowie is reading your answer"), grab before 2.5s auto-nav
await shot("07-processing-normal", "/recall/1/processing?attempt=1", { wait: 300 });

// 08: Processing — slow / "Still thinking..." (needs >4000ms, before 6000ms auto-nav)
await shot("08-processing-slow", "/recall/1/processing?attempt=1&slow=1", { wait: 4400 });

// 09: Result — empty (term1 attempt1)
await shot("09-result-empty", "/recall/1/result?attempt=1");

// 10: Result — pass (term1 attempt2)
await shot("10-result-pass", "/recall/1/result?attempt=2");

// 11: Result — hint1 (term2 attempt1)
await shot("11-result-hint1", "/recall/2/result?attempt=1");

// 12: Result — hint2 (term2 attempt2)
await shot("12-result-hint2", "/recall/2/result?attempt=2");

// 13: Result — reveal (term2 attempt3)
await shot("13-result-reveal", "/recall/2/result?attempt=3");

// 14: Summary
await shot("14-summary", "/recall/summary");

// 15: Leaving sheet (interact: click close/X on prompt screen)
await shot("15-leaving-sheet", "/recall/1/prompt", {
  action: async (page) => {
    await page.getByRole("button").filter({ hasText: "" }).first();
    // SessionBar's close control — try common accessible names
    const closeBtn = page.locator('button[aria-label*="lose" i], button[aria-label*="exit" i]').first();
    if (await closeBtn.count()) {
      await closeBtn.click();
    } else {
      // fallback: click first button inside header/sessionbar region
      await page.locator("header button, .session-bar button, [class*='sessionBar'] button, [class*='session-bar'] button").first().click();
    }
    await page.waitForTimeout(300);
  },
});

// 16: Dead route — /recall/1/text (known 404 / failure path)
await shot("16-text-route-404", "/recall/1/text");

// 17: Permission states — attempt direct guess at a route, expect 404 (documents that it doesn't exist)
await shot("17-permission-primer-404", "/recall/1/permission");

await browser.close();
console.log("done");
