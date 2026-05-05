/**
 * LockdownAssessmentWrapper
 * SEPL/INT/2026/IMPL-GAPS-01 Step G15
 *
 * Bridges the server-rendered take page to the BrowserLockdown client component.
 * Owns the violation count + POST to /api/assessments/[id]/violation.
 */
'use client';

import { useRef } from 'react';
import { BrowserLockdown } from '@/components/Assessment/BrowserLockdown';

interface Props {
  enabled: boolean;
  assessmentId: string;
  children: React.ReactNode;
}

export function LockdownAssessmentWrapper({ enabled, assessmentId, children }: Props) {
  // Per-type counts so the server can apply progressive severity.
  const counts = useRef<Record<string, number>>({});

  const handleViolation = (type: string) => {
    counts.current[type] = (counts.current[type] ?? 0) + 1;
    // Fire-and-forget — never block UI on logging.
    fetch(`/api/assessments/${assessmentId}/violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, count: counts.current[type] }),
      keepalive: true, // survive page unload
    }).catch(() => { /* silent — never break the assessment flow */ });
  };

  return (
    <BrowserLockdown enabled={enabled} onViolation={handleViolation}>
      {children}
    </BrowserLockdown>
  );
}
