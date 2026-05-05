/**
 * DownloadBoardBriefButton
 * SEPL/INT/2026/IMPL-GAPS-01 Step G11
 * Triggers /api/clients/[clientId]/reports/generate with EXECUTIVE template
 */
'use client';

import { useState } from 'react';
import { Loader2, Download, CheckCircle2 } from 'lucide-react';

interface Props {
  clientId: string;
}

export function DownloadBoardBriefButton({ clientId }: Props) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      // Find an EXECUTIVE template (system-seeded by G9)
      const tmplRes = await fetch(`/api/clients/${clientId}/reports/templates`);
      const templates = tmplRes.ok ? await tmplRes.json() : [];
      const exec = templates.find?.((t: { type?: string }) => t.type === 'EXECUTIVE');
      const templateId = exec?.id ?? templates?.[0]?.id;
      if (!templateId) {
        setError('No EXECUTIVE template available — run report-templates seed.');
        return;
      }

      const res = await fetch(`/api/clients/${clientId}/reports/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          name: `Board Brief — ${new Date().toLocaleDateString()}`,
          filters: { templateType: 'EXECUTIVE' },
        }),
      });

      if (!res.ok) {
        setError('Report generation failed. Try again.');
        return;
      }

      setDone(true);
      setTimeout(() => setDone(false), 3500);
    } catch (e) {
      setError('Network error.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-60 transition-colors"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" />
          : done ? <CheckCircle2 className="h-4 w-4 text-green-400" />
          : <Download className="h-4 w-4" />}
        {done ? 'Brief queued' : busy ? 'Generating…' : 'Download Board Brief'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
