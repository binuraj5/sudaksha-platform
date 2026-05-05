/**
 * BrowserLockdown — proctored assessment integrity guard
 * SEPL/INT/2026/IMPL-GAPS-01 Step G15
 * Patent claim C-09 — browser lockdown mechanism
 *
 * Behaviour when `enabled` is true:
 *   1. Requests fullscreen on mount (best-effort — user can still escape).
 *   2. Detects tab/window visibility loss and surfaces a sticky warning banner.
 *   3. Prevents copy / paste / cut on assessment content.
 *   4. Suppresses right-click context menu inside the wrapped subtree.
 *   5. Triggers `beforeunload` warning when the user tries to close/navigate.
 *   6. Calls `onViolation(type)` for each detected violation so the host can
 *      log it server-side. Three known types: TAB_SWITCH, COPY, PASTE.
 *
 * When `enabled` is false: renders children with no listeners, no overlay,
 * no behavioural changes — the wrapped runner is unaffected.
 */
'use client';

import { useEffect, useState, useRef } from 'react';

type ViolationType = 'TAB_SWITCH' | 'COPY' | 'PASTE' | 'CUT';

interface Props {
  enabled: boolean;
  onViolation?: (type: ViolationType) => void;
  warningThreshold?: number; // banner stays after this many tab switches (default 3)
  children: React.ReactNode;
}

export function BrowserLockdown({
  enabled,
  onViolation,
  warningThreshold = 3,
  children,
}: Props) {
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);
  const violationRef = useRef(onViolation);
  violationRef.current = onViolation;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // ── Fullscreen request (best effort) ────────────────────────────────────
    const requestFs = () => {
      const el = document.documentElement;
      el.requestFullscreen?.().catch(() => {
        /* permission denied or already fullscreen — silent */
      });
    };
    requestFs();

    // ── Tab visibility detection ────────────────────────────────────────────
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(c => {
          const next = c + 1;
          setWarning(
            `Tab switch detected (${next}/${warningThreshold}). ` +
            `Assessment integrity may be flagged.`
          );
          return next;
        });
        violationRef.current?.('TAB_SWITCH');
      }
    };

    // ── Copy / paste / cut prevention ───────────────────────────────────────
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      violationRef.current?.('COPY');
      setWarning('Copying assessment content is disabled.');
    };
    const preventPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      violationRef.current?.('PASTE');
      setWarning('Pasting into the assessment is disabled.');
    };
    const preventCut = (e: ClipboardEvent) => {
      e.preventDefault();
      violationRef.current?.('CUT');
      setWarning('Cutting assessment content is disabled.');
    };

    // ── Exit attempt warning ────────────────────────────────────────────────
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore the custom string but require returnValue to be set.
      e.returnValue = 'Your assessment progress may be lost.';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('paste', preventPaste);
    document.addEventListener('cut', preventCut);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('paste', preventPaste);
      document.removeEventListener('cut', preventCut);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, warningThreshold]);

  // Auto-clear short-lived warnings (copy/paste/cut) after a few seconds.
  // Tab-switch warnings are sticky — reset only on user dismissal.
  useEffect(() => {
    if (!warning || warning.includes('Tab switch')) return;
    const t = setTimeout(() => setWarning(null), 4000);
    return () => clearTimeout(t);
  }, [warning]);

  if (!enabled) {
    // No-op pass-through when lockdown is disabled.
    return <>{children}</>;
  }

  const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div onContextMenu={handleContextMenu} className="relative">
      {warning && (
        <div
          role="alert"
          className="fixed top-0 left-0 right-0 z-[60] bg-red-600 text-white text-sm font-medium text-center py-2 px-4 shadow-lg flex items-center justify-center gap-3"
        >
          <span>⚠️ {warning}</span>
          <button
            type="button"
            onClick={() => setWarning(null)}
            className="ml-2 text-white/80 hover:text-white text-xs underline"
            aria-label="Dismiss warning"
          >
            Dismiss
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
