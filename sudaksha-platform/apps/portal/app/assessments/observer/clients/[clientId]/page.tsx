'use client';

/**
 * Observer Client Drill-Down Page
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T15
 *
 * Shows full session history + question bank + trainer assignments for a specific client.
 * Write CTAs (Edit, Add Session) only rendered when isCrossTenantRole.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, ArrowLeft, PlusCircle, BookOpen, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TrainingSession {
  id: string;
  moduleTitle: string;
  sessionDate: string;
  status: string;
  totalParticipants: number;
  trainerId: string | null;
  results?: { rawScore: number }[];
}

export default function ObserverClientPage({ params }: { params: { clientId: string } }) {
  const { data: authSession, status } = useSession();
  const router = useRouter();
  const clientId = params.clientId;

  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const role = (authSession?.user as { role?: string })?.role ?? '';
  const canWrite = role === 'SUDAKSHA_OBSERVER' || role === 'SUDAKSHA_ADMIN';

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch(`/api/training/observer/sessions?tenantId=${clientId}`)
      .then(r => r.json())
      .then(d => setSessions(d.sessions ?? []))
      .finally(() => setLoading(false));
  }, [status, clientId]);

  const PAGE_SIZE = 20;
  const pageSessions = sessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(sessions.length / PAGE_SIZE);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client / Tenant</h1>
            <p className="text-sm text-gray-500 font-mono">{clientId}</p>
          </div>
        </div>
        {canWrite && (
          <Button onClick={() => router.push(`/assessments/training/sessions/new?tenantId=${clientId}`)} className="gap-2">
            <PlusCircle className="h-4 w-4" />Add Session
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500 flex items-center gap-1"><BookOpen className="h-3 w-3" />Sessions</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-indigo-600">{sessions.length}</p></CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500 flex items-center gap-1"><Users className="h-3 w-3" />Participants</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-violet-600">{sessions.reduce((s, r) => s + r.totalParticipants, 0)}</p></CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp className="h-3 w-3" />Avg Score</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {(() => {
                const scores = sessions.flatMap(s => s.results?.map(r => r.rawScore) ?? []);
                return scores.length ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}%` : '—';
              })()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Session history */}
      <Card className="shadow-sm border-none">
        <CardHeader><CardTitle className="text-base font-semibold">Session History ({sessions.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {sessions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No sessions recorded for this client.</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Module</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Participants</th>
                    <th className="pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pageSessions.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-2 font-medium">{s.moduleTitle}</td>
                      <td className="py-2 text-gray-600">{new Date(s.sessionDate).toLocaleDateString()}</td>
                      <td className="py-2"><Badge variant="outline">{s.status}</Badge></td>
                      <td className="py-2">{s.totalParticipants}</td>
                      <td className="py-2">
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/assessments/training/sessions/${s.id}/results`)}>
                          Results
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                  <span className="text-sm text-gray-500 self-center">Page {page} of {totalPages}</span>
                  <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
