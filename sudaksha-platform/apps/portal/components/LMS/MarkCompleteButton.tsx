/**
 * MarkCompleteButton — client wrapper for module completion
 * SEPL/INT/2026/IMPL-GAPS-01 Step G16
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface Props {
  activityId: string;
  alreadyCompleted: boolean;
}

export function MarkCompleteButton({ activityId, alreadyCompleted }: Props) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(alreadyCompleted);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = async () => {
    if (busy || done) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/lms/${activityId}/complete`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Failed to mark complete');
        return;
      }
      setDone(true);
      // SEPL/INT/2026/IMPL-GAPS-01 Step G17 — route to first micro-assessment if returned.
      const microIds: string[] = Array.isArray(data?.microAssessmentIds) ? data.microAssessmentIds : [];
      if (data.nextStep === 'MICRO_ASSESSMENT' && microIds.length > 0) {
        router.push(`/assessments/lms/micro/${microIds[0]}`);
      } else {
        router.push('/assessments/lms');
      }
      router.refresh();
    } catch {
      setError('Network error.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="inline-flex items-center gap-2 px-5 py-3 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm font-medium">
        <CheckCircle2 className="h-4 w-4" />
        Module complete
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {busy ? 'Saving…' : 'Mark Complete'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
