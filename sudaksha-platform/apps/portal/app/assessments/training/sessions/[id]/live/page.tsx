'use client';
import React from 'react';

/**
 * Live Session View — /assessments/training/sessions/[id]/live
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T11
 *
 * Trainer's real-time view during an active session.
 * Polls /api/training/sessions/[id]/status every 5 seconds.
 * Shows per-question response progress, participant grid, elapsed time,
 * and End Session button.
 */

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Loader2, Users, Clock, StopCircle, CheckCircle2, Circle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// ── Types ─────────────────────────────────────────────────────────────────────

interface SessionStatus {
  sessionId: string;
  status: string;
  totalParticipants: number;
  responseCounts: Record<string, number>;
  participantAnswered: Record<string, string[]>;
  startedAt: string | null;
  completedAt: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatElapsed(startedAt: string | null): string {
  if (!startedAt) return '0:00';
  const seconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LiveSessionPage(props: { params: Promise<{ id: string }> }) {
  const { data: authSession, status } = useSession();
  const router = useRouter();
  const sessionId = (React.use(props.params)).id;

  const [liveStatus, setLiveStatus] = useState<SessionStatus | null>(null);
  const [elapsed, setElapsed] = useState('0:00');
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/training/sessions/${sessionId}/status`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data: SessionStatus = await res.json();
      setLiveStatus(data);
      if (data.status === 'COMPLETED') {
        router.push(`/assessments/training/sessions/${sessionId}/results`);
      }
    } catch {
      setError('Unable to load session status');
    }
  }, [sessionId, router]);

  // Poll every 5 seconds
  useEffect(() => {
    if (status !== 'authenticated') return;
    fetchStatus();
    const poll = setInterval(fetchStatus, 5000);
    return () => clearInterval(poll);
  }, [fetchStatus, status]);

  // Update elapsed timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(formatElapsed(liveStatus?.startedAt ?? null));
    }, 1000);
    return () => clearInterval(timer);
  }, [liveStatus?.startedAt]);

  async function endSession() {
    if (!confirm('End this session? Scores will be computed for all participants.')) return;
    setEnding(true);
    try {
      await fetch(`/api/training/sessions/${sessionId}/complete`, { method: 'POST' });
      router.push(`/assessments/training/sessions/${sessionId}/results`);
    } catch {
      setError('Failed to end session');
      setEnding(false);
    }
  }

  if (status === 'loading' || !liveStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {error ? <p className="text-red-500">{error}</p> : <Loader2 className="h-8 w-8 animate-spin text-primary" />}
      </div>
    );
  }

  const questionIds = Object.keys(liveStatus.responseCounts);
  const participantIds = Object.keys(liveStatus.participantAnswered);
  const totalExpected = liveStatus.totalParticipants || Math.max(participantIds.length, 1);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="inline-flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            Live Session
          </h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{elapsed}</span>
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{participantIds.length} responding</span>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={endSession}
          disabled={ending}
          className="gap-2"
        >
          {ending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StopCircle className="h-4 w-4" />}
          End Session
        </Button>
      </div>

      {/* Question Response Progress */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Response Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {questionIds.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Waiting for first responses…</p>
          ) : (
            questionIds.map((qId, idx) => {
              const count = liveStatus.responseCounts[qId] ?? 0;
              const pct = Math.round((count / totalExpected) * 100);
              return (
                <div key={qId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Question {idx + 1}</span>
                    <span className="font-medium text-gray-900">{count} / {totalExpected}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Participant Grid */}
      <Card className="shadow-sm border-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Participants <Badge variant="outline" className="ml-2">{participantIds.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {participantIds.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No participants have responded yet.</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {participantIds.map(pid => {
                const answered = liveStatus.participantAnswered[pid]?.length ?? 0;
                const done = answered >= questionIds.length && questionIds.length > 0;
                return (
                  <div key={pid}
                    className={`p-3 rounded-lg border text-center text-xs ${done
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}
                  >
                    {done
                      ? <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-green-600" />
                      : <Circle className="h-5 w-5 mx-auto mb-1 text-amber-400" />
                    }
                    <span className="font-mono">{pid.slice(-6)}</span>
                    <div className="mt-1 text-gray-500">{answered}/{questionIds.length}</div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
