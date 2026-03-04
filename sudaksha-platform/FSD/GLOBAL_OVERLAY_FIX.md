# Global Overlay Fix Guide

**Purpose:** Resolve gray overlay blocking all pages (localhost:3000/*) so the application is fully accessible.

**Reference:** STRATEGIC_ACTION_PLAN.md — Step 1: Fix Blocking Issues

---

## 1. Check Root Layout

**File:** `app/layout.tsx`

- Ensure there is **no** full-screen overlay div that is always rendered (e.g. `fixed inset-0` with high z-index).
- Overlays should only appear inside **modals/dialogs** that are conditionally shown (e.g. when `open === true`).
- If you see a wrapper like `<div className="fixed inset-0 z-[9999] bg-gray-500/50 pointer-events-auto">` around `{children}`, remove it or make it conditional.

**Safe pattern:** Layout should only render theme/session providers and `{children}`. No global overlay in layout.

---

## 2. Check Global CSS

**File:** `src/styles/globals.css` (or `app/globals.css` if used)

- Ensure no rule applies `pointer-events: none` to `body` or `html` in a way that blocks interaction.
- Ensure no rule creates a full-screen pseudo-element (e.g. `::before` / `::after` on `body`) that captures clicks.

**Safe pattern:** Base styles only (e.g. Tailwind `@layer base`). No full-screen overlay or pointer-events blocking in global CSS.

---

## 3. Check for Stuck Modal State

- Search the codebase for `fixed inset-0` or `position: fixed` with `inset: 0` in **layout** or **root** components.
- Confirm any such overlay is inside a component that only renders when a modal/dialog is open (e.g. state-driven).
- If a dialog uses a global store or URL state, ensure the “close” action clears that state so the overlay can unmount.

---

## 4. Quick Fix (If Overlay Is in Layout)

If an overlay is in `app/layout.tsx`:

1. Remove the overlay div, or
2. Make it conditional, e.g. `{showOverlay && <div className="fixed inset-0 ..." />}`, and ensure `showOverlay` is false by default and only set when needed (e.g. loading or maintenance mode).

If the overlay is in CSS:

1. Remove or override the rule that creates the full-screen block.
2. Ensure `pointer-events` on `body`/`html` are not set to `none` unless intended (e.g. only during a specific modal).

---

## 5. Verify

1. Restart dev server: `npm run dev`
2. Open `http://localhost:3000` and `http://localhost:3000/assessments`
3. Confirm no gray overlay blocks the page.
4. Confirm buttons and links are clickable.

---

## 6. Current Codebase Note

As of the last check:

- **app/layout.tsx** — No full-screen overlay; only `ThemeProvider`, `Providers`, `Toaster`, and `{children}`.
- **src/styles/globals.css** — No global overlay or pointer-events rule that blocks the whole page.
- Overlays found are **inside** modals/dialogs (e.g. in `_dialog.tsx`, `alert-dialog`, enrollment/course modals) and are conditionally rendered.

If a gray overlay appears in your environment, use the steps above to locate and remove or make it conditional.
