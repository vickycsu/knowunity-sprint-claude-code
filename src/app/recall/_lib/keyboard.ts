"use client";

/**
 * Keeps the software keyboard open across the route change into the typing
 * turn.
 *
 * iOS and Android only raise the keyboard when an input is focused during a
 * user gesture. Tapping the keyboard icon navigates first, so by the time
 * the textarea mounts the gesture is long gone and `autoFocus` raises
 * nothing — the student arrives at a typing screen with no way to type until
 * they tap the box a second time.
 *
 * The fix is to claim the keyboard inside the tap itself, using a throwaway
 * input that lives outside React so it survives the navigation, then hand
 * focus to the real textarea once it exists. Moving focus between two text
 * inputs keeps the keyboard up; letting focus drop to nothing closes it.
 */

const HANDOFF_ID = "recall-keyboard-handoff";

/** Longer than a client-side route change, short enough to never be seen. */
const ABANDON_MS = 4000;

let abandonTimer: ReturnType<typeof setTimeout> | null = null;

function existing(): HTMLInputElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById(HANDOFF_ID) as HTMLInputElement | null;
}

/**
 * Call synchronously inside the tap that opens the typing turn, before
 * navigating. Anything awaited first loses the gesture.
 */
export function claimKeyboard(): void {
  if (typeof document === "undefined") return;

  let input = existing();
  if (!input) {
    input = document.createElement("input");
    input.id = HANDOFF_ID;
    input.type = "text";
    input.setAttribute("aria-hidden", "true");
    input.tabIndex = -1;
    // It has to be rendered and focusable to hold the keyboard, so it can't
    // use display:none or visibility:hidden. 16px keeps iOS from zooming the
    // viewport the way it does for smaller text in an input.
    input.style.cssText = [
      "position:fixed",
      "top:0",
      "left:0",
      "width:1px",
      "height:1px",
      "padding:0",
      "border:0",
      "outline:0",
      "opacity:0",
      "font-size:16px",
      "z-index:-1",
    ].join(";");
    document.body.appendChild(input);
  }

  input.focus();

  // If the navigation never lands, don't leave a focused input behind
  // holding the keyboard open over whatever screen the student is on.
  if (abandonTimer) clearTimeout(abandonTimer);
  abandonTimer = setTimeout(releaseKeyboard, ABANDON_MS);
}

/** Removes the stand-in. Safe to call when nothing claimed the keyboard. */
export function releaseKeyboard(): void {
  if (abandonTimer) {
    clearTimeout(abandonTimer);
    abandonTimer = null;
  }
  existing()?.remove();
}

/**
 * Hands the keyboard to the real input. Call from a ref callback so it runs
 * during commit, while the browser still treats this as the same focus
 * sequence the tap began.
 */
export function handOffKeyboardTo(element: HTMLTextAreaElement | null): void {
  if (!element) return;
  element.focus();
  releaseKeyboard();
}
