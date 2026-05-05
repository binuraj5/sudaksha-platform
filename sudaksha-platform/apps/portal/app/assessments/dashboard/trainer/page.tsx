'use client';

/**
 * Trainer Dashboard — /assessments/dashboard/trainer
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T10
 *
 * Shows:
 *  • 4-metric summary: sessions this month, avg class score, participants assessed, next session
 *  • Upcoming sessions list (DRAFT | ACTIVE)
 *  • Recent COMPLETED sessions (last 5)
 *  • Quick-create session button
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen, Users, TrendingUp, Calendar,
  Loader2, Play, Eye, CheckCircle2, Clock, XCircle, PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ── Types ────────────────────────────────────────────────────────────────────

interface TrainingSession {
  id: string;
  moduleTitle: string;
  sessionDate: string;
  status: string;
  questionCount: number;
  totalParticipants: number;
  results?: { rawScore: number }[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return <Badge className="bg-green-100 text-green-700 border-green-200 gap-1"><Play className="h-3 w-3" />Live</Badge>;
    case 'DRAFT':
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1"><Clock className="h-3 w-3" />Draft</Badge>;
    case 'COMPLETED':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200 gap-1"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
    case 'CANCELLED':
      return <Badge className="bg-gray-100 text-gray-600 gap-1"><XCircle className="h-3 w-3" />Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function avgScore(sessions: TrainingSession[]): number {
  const scored = sessions.filter(s => s.results && s.results.length > 0);
  if (!scored.length) return 0;
  const total = scored.reduce((sum, s) => {
    const avg = s.results!.reduce((a, r) => a + r.rawScore, 0) / s.results!.length;
    return sum + avg;
  }, 0);
  return Math.round(total / scored.length);
}

function StatCard({
  icon: Icon, label, value, sub, color
}: { icon: React.ElementType; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />{label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TrainerDashboard() {
  const { data: authSession, status } = useSession();
  const router = useRouter();

  const [upcoming, setUpcoming] = useState<TrainingSession[]>([]);
  const [recent, setRecent] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const userId = (authSession?.user as { id?: string })?.id;
    if (!userId) return;

    async function fetchSessions() {
      try {
        const [upRes, recentRes] = await Promise.all([
          fetch(`/api/training/sessions?trainerId=${userId}&status=DRAFT,ACTIVE`),
          fetch(`/api/training/sessions?trainerId=${userId}&status=COMPLETED&limit=5`),
        ]);
        const upData = await upRes.json();
        const recentData = await recentRes.json();
        setUpcoming(upData.sessions ?? []);
        setRecent(recentData.sessions ?? []);
      } catch (err) {
        console.error('Failed to load sessions', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [status, authSession]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sessionsThisMonth = [...upcoming, ...recent].filter(
    s => new Date(s.sessionDate) >= monthStart
  ).length;

  const uniqueParticipants = new Set(
    recent.flatMap(s => s.results?.map((_, i) => i) ?? [])
  ).size;

  const nextSession = [...upcoming]
    .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
    .find(s => new Date(s.sessionDate) >= now);

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainer Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your training sessions and class assessments</p>
        </div>
        <Button
          onClick={() => router.push('/assessments/training/sessions/new')}
          className="gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Session
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Sessions This Month" value={sessionsThisMonth} color="text-indigo-600" />
        <StatCard icon={TrendingUp} label="Avg Class Score" value={`${avgScore(recent)}%`} color="text-emerald-600" />
        <StatCard icon={Users} label="Participants Assessed" value={recent.reduce((s, r) => s + r.totalParticipants, 0)} color="text-violet-600" />
        <StatCard
          icon={Calendar}
          label="Next Session"
          value={nextSession ? new Date(nextSession.sessionDate).toLocaleDateString() : '—'}
          sub={nextSession?.moduleTitle}
          color="text-sky-600"
        />
      </div>

      {/* Upcoming Sessions */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Upcoming &amp; Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No upcoming sessions. Create one to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 font-medium">Module</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Questions</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {upcoming.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium">{s.moduleTitle}</td>
                      <td className="py-3 text-gray-600">{new Date(s.sessionDate).toLocaleDateString()}</td>
                      <td className="py-3 text-gray-600">{s.questionCount}</td>
                      <td className="py-3">{statusBadge(s.status)}</td>
                      <td className="py-3">
                        {s.status === 'DRAFT' ? (
                          <Button size="sm" variant="outline" onClick={() => router.push(`/assessments/training/sessions/${s.id}/live`)}>
                            <Play className="h-3 w-3 mr-1" />Activate
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => router.push(`/assessments/training/sessions/${s.id}/live`)}>
                            <Eye className="h-3 w-3 mr-1" />Monitor
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Completed Sessions */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No completed sessions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-3 font-medium">Module</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Participants</th>
                    <th className="pb-3 font-medium">Avg Score</th>
                    <th className="pb-3 font-medium">Results</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recent.map(s => {
                    const avg = s.results?.length
                      ? Math.round(s.results.reduce((a, r) => a + r.rawScore, 0) / s.results.length)
                      : null;
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="py-3 font-medium">{s.moduleTitle}</td>
                        <td className="py-3 text-gray-600">{new Date(s.sessionDate).toLocaleDateString()}</td>
                        <td className="py-3 text-gray-600">{s.totalParticipants}</td>
                        <td className="py-3">
                          {avg !== null
                            ? <span className={avg >= 60 ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>{avg}%</span>
                            : <span className="text-gray-400">—</span>
                          }
                        </td>
                        <td className="py-3">
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/assessments/training/sessions/${s.id}/results`)}>
                            View Results
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
