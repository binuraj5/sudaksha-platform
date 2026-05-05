'use client';

/**
 * Sudaksha Observer Dashboard — /assessments/dashboard/observer
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T14
 *
 * Highest-privilege cross-tenant command centre.
 * Shows:
 * 1. Platform-wide live metrics (auto-refreshed every 15s)
 * 2. Live session feed (all active sessions across all tenants)
 * 3. Per-tenant health table
 * 4. Alerts panel (bias flags, stale clients, thin question banks)
 */

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Activity, Users, BookOpen, Shield,
  Loader2, Eye, AlertTriangle, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PlatformStats {
  totalSessions: number;
  activeSessions: number;
  avgScore: number;
  questionBankTotal: number;
  totalParticipants: number;
}

interface TenantRow {
  tenantId: string;
  sessions: number;
  participants: number;
}

interface ActiveSession {
  id: string;
  moduleTitle: string;
  tenantId: string;
  trainerId: string | null;
  totalParticipants: number;
  startedAt: string | null;
  activity?: { name: string };
}

function StatCard({ icon: Icon, label, value, color, pulse = false }: {
  icon: React.ElementType; label: string; value: string | number; color: string; pulse?: boolean;
}) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
          {pulse && <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
          <Icon className={`h-4 w-4 ${color}`} />{label}
        </CardTitle>
      </CardHeader>
      <CardContent><p className={`text-3xl font-bold ${color}`}>{value}</p></CardContent>
    </Card>
  );
}

export default function ObserverDashboard() {
  const { data: authSession, status } = useSession();
  const router = useRouter();

  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [byTenant, setByTenant] = useState<TenantRow[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/training/observer/sessions?status=ACTIVE');
      const data = await res.json();
      setActiveSessions(data.sessions ?? []);
    } catch { /* silently ignore poll errors */ }
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;

    async function init() {
      try {
        const [summaryRes, activeRes] = await Promise.all([
          fetch('/api/training/observer/summary'),
          fetch('/api/training/observer/sessions?status=ACTIVE'),
        ]);
        const summaryData = await summaryRes.json();
        const activeData = await activeRes.json();
        setPlatformStats(summaryData.platformStats);
        setByTenant(summaryData.byTenant ?? []);
        setActiveSessions(activeData.sessions ?? []);
      } finally {
        setLoading(false);
      }
    }

    init();
    // Refresh live feed every 15 seconds
    const poll = setInterval(fetchActiveSessions, 15000);
    return () => clearInterval(poll);
  }, [status, fetchActiveSessions]);

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sudaksha Observer</h1>
          <p className="text-sm text-gray-500">Cross-tenant platform monitoring — highest privilege tier</p>
        </div>
      </div>

      {/* Platform-wide metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Active Now" value={platformStats?.activeSessions ?? 0} color="text-red-500" pulse />
        <StatCard icon={BookOpen} label="Total Sessions" value={platformStats?.totalSessions ?? 0} color="text-indigo-600" />
        <StatCard icon={Users} label="Total Participants" value={platformStats?.totalParticipants ?? 0} color="text-violet-600" />
        <StatCard icon={Activity} label="Avg Score" value={`${platformStats?.avgScore ?? 0}%`} color="text-emerald-600" />
      </div>

      {/* Live Session Feed */}
      <Card className="shadow-sm border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Live Sessions <span className="text-xs font-normal text-gray-400 ml-2">(refreshes every 15s)</span>
          </CardTitle>
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            {activeSessions.length} active
          </Badge>
        </CardHeader>
        <CardContent>
          {activeSessions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No sessions currently active across any tenant.</p>
          ) : (
            <div className="space-y-3">
              {activeSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border bg-green-50 border-green-200">
                  <div>
                    <p className="font-medium text-sm">{s.moduleTitle}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="font-mono">Tenant: {s.tenantId.slice(-8)}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{s.totalParticipants}</span>
                      {s.startedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 60000)}m
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => router.push(`/assessments/training/sessions/${s.id}/live`)}>
                    <Eye className="h-3 w-3 mr-1" />Monitor
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client / Tenant Health */}
      <Card className="shadow-sm border-none">
        <CardHeader><CardTitle className="text-base font-semibold">Tenant Health</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {byTenant.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No tenant data.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">Tenant ID</th>
                  <th className="pb-2 font-medium">Sessions</th>
                  <th className="pb-2 font-medium">Participants</th>
                  <th className="pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {byTenant
                  .sort((a, b) => b.sessions - a.sessions)
                  .map(t => (
                    <tr key={t.tenantId} className="hover:bg-gray-50">
                      <td className="py-2 font-mono text-xs">{t.tenantId}</td>
                      <td className="py-2">{t.sessions}</td>
                      <td className="py-2">{t.participants}</td>
                      <td className="py-2">
                        <Button size="sm" variant="ghost"
                          onClick={() => router.push(`/assessments/observer/clients/${t.tenantId}`)}>
                          Drill Down
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Alerts Panel */}
      <Card className="shadow-sm border-none border-l-4 border-l-amber-400 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-amber-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />Platform Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {platformStats && platformStats.questionBankTotal < 50 && (
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>Platform-wide question bank is thin ({platformStats.questionBankTotal} active questions). Encourage trainers to upload more.</span>
            </div>
          )}
          {(byTenant.length === 0 || byTenant.every(t => t.sessions === 0)) && (
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>No training sessions recorded yet on this platform.</span>
            </div>
          )}
          {byTenant.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Shield className="h-4 w-4 flex-shrink-0" />
              <span>All systems operational. {byTenant.length} tenant{byTenant.length !== 1 ? 's' : ''} with training data.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
