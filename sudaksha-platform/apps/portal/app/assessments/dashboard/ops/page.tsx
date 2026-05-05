'use client';

/**
 * Ops/Delivery Team Dashboard — /assessments/dashboard/ops
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T13
 *
 * Shows:
 * 1. 4 platform metrics: sessions this month, participants, avg score, active now
 * 2. Active sessions panel (polls every 30s)
 * 3. Trainer performance table
 * 4. Question bank health warnings
 */

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, TrendingUp, Activity,
  Loader2, Eye, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TrainingSession {
  id: string;
  moduleTitle: string;
  sessionDate: string;
  status: string;
  trainerId: string | null;
  tenantId: string;
  totalParticipants: number;
  results?: { rawScore: number }[];
}

function StatCard({
  icon: Icon, label, value, color
}: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />{label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export default function OpsDashboard() {
  const { data: authSession, status } = useSession();
  const router = useRouter();

  const [activeSessions, setActiveSessions] = useState<TrainingSession[]>([]);
  const [allSessions, setAllSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveSessions = useCallback(async () => {
    const res = await fetch('/api/training/sessions?status=ACTIVE&limit=20');
    const data = await res.json();
    setActiveSessions(data.sessions ?? []);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;

    async function init() {
      try {
        const [activeRes, allRes] = await Promise.all([
          fetch('/api/training/sessions?status=ACTIVE&limit=20'),
          fetch('/api/training/sessions?limit=100'),
        ]);
        const activeData = await activeRes.json();
        const allData = await allRes.json();
        setActiveSessions(activeData.sessions ?? []);
        setAllSessions(allData.sessions ?? []);
      } finally {
        setLoading(false);
      }
    }

    init();
    const poll = setInterval(fetchActiveSessions, 30000);
    return () => clearInterval(poll);
  }, [status, fetchActiveSessions]);

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sessionsThisMonth = allSessions.filter(s => new Date(s.sessionDate) >= monthStart).length;
  const totalParticipants = allSessions.reduce((sum, s) => sum + s.totalParticipants, 0);
  const completedScores = allSessions.flatMap(s => s.results?.map(r => r.rawScore) ?? []);
  const avgScore = completedScores.length
    ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
    : 0;

  // Trainer performance
  const trainerMap: Record<string, { sessions: number; scores: number[]; modules: Set<string> }> = {};
  for (const s of allSessions) {
    if (!s.trainerId) continue;
    if (!trainerMap[s.trainerId]) trainerMap[s.trainerId] = { sessions: 0, scores: [], modules: new Set() };
    trainerMap[s.trainerId].sessions++;
    trainerMap[s.trainerId].modules.add(s.moduleTitle);
    s.results?.forEach(r => trainerMap[s.trainerId!].scores.push(r.rawScore));
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ops &amp; Delivery Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor training delivery across all clients</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Sessions This Month" value={sessionsThisMonth} color="text-indigo-600" />
        <StatCard icon={Users} label="Total Participants" value={totalParticipants} color="text-violet-600" />
        <StatCard icon={TrendingUp} label="Avg Class Score" value={`${avgScore}%`} color="text-emerald-600" />
        <StatCard icon={Activity} label="Active Now" value={activeSessions.length} color="text-red-500" />
      </div>

      {/* Active Sessions */}
      <Card className="shadow-sm border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Active Sessions <span className="text-xs font-normal text-gray-400 ml-2">(refreshes every 30s)</span></CardTitle>
          {activeSessions.length > 0 && <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No sessions currently active.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Module</th>
                    <th className="pb-2 font-medium">Trainer</th>
                    <th className="pb-2 font-medium">Participants</th>
                    <th className="pb-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activeSessions.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-2 font-medium">{s.moduleTitle}</td>
                      <td className="py-2 text-gray-500 font-mono text-xs">{s.trainerId?.slice(-8) ?? '—'}</td>
                      <td className="py-2">{s.totalParticipants}</td>
                      <td className="py-2">
                        <Button size="sm" variant="outline" onClick={() => router.push(`/assessments/training/sessions/${s.id}/live`)}>
                          <Eye className="h-3 w-3 mr-1" />Monitor
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trainer Performance */}
      <Card className="shadow-sm border-none">
        <CardHeader><CardTitle className="text-base font-semibold">Trainer Performance</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {Object.keys(trainerMap).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No trainer activity recorded yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">Trainer ID</th>
                  <th className="pb-2 font-medium">Sessions</th>
                  <th className="pb-2 font-medium">Avg Score</th>
                  <th className="pb-2 font-medium">Modules</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.entries(trainerMap)
                  .sort(([, a], [, b]) => b.sessions - a.sessions)
                  .map(([tid, data]) => {
                    const avg = data.scores.length
                      ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
                      : null;
                    return (
                      <tr key={tid} className="hover:bg-gray-50">
                        <td className="py-2 font-mono text-xs text-gray-500">{tid.slice(-8)}</td>
                        <td className="py-2">{data.sessions}</td>
                        <td className="py-2">
                          {avg !== null
                            ? <span className={avg >= 60 ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>{avg}%</span>
                            : '—'
                          }
                        </td>
                        <td className="py-2 text-gray-500">{data.modules.size} module{data.modules.size !== 1 ? 's' : ''}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Question Bank Health Warning */}
      <Card className="shadow-sm border-none border-l-4 border-l-amber-400 bg-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-amber-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />Question Bank Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700">
            Visit the Question Bank admin page to check question counts per module.
            Modules with fewer than 20 active questions may show item familiarity effects.
          </p>
          <Button size="sm" variant="outline" className="mt-3 border-amber-300 text-amber-700"
            onClick={() => router.push('/assessments/training/questions')}>
            Manage Question Banks
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
