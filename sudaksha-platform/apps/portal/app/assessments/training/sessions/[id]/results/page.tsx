'use client';
import React from 'react';

/**
 * Session Results Page — /assessments/training/sessions/[id]/results
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T12
 *
 * Full class report after session completion:
 * 1. Class summary metrics
 * 2. Score distribution bar chart
 * 3. Question breakdown table (flags <40% correct rate)
 * 4. Participant results table (sorted by score, pass/fail badge)
 * 5. Competency coverage section
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, Download, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SessionResult {
  id: string;
  memberId: string;
  rawScore: number;
  normalisedScore?: number;
  proficiencyLevel?: number;
  biasFlags: unknown[];
  responseTimeMs?: number;
}

interface QuestionStat {
  text: string;
  difficulty: number;
  correct: number;
  total: number;
  competencyCode: string | null;
}

interface ResultsData {
  session: {
    id: string;
    moduleTitle: string;
    sessionDate: string;
    status: string;
    totalParticipants: number;
    questionCount: number;
    activityName: string;
  };
  results: SessionResult[];
  questionStats: QuestionStat[];
  classStats: { avgScore: number; median: number; minScore: number; maxScore: number };
}

const DIFFICULTY_LABEL: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };

function ScoreBand({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>{label}</span><span>{count}</span>
      </div>
      <div className="h-5 rounded bg-gray-100 overflow-hidden">
        <div className="h-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SessionResultsPage(props: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/training/sessions/${(React.use(props.params)).id}/results`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load results'); setLoading(false); });
  }, [(React.use(props.params)).id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (error || !data) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error ?? 'No data'}</div>;
  }

  const { session, results, questionStats, classStats } = data;
  const scores = results.map(r => r.rawScore);
  const bands = [
    { label: '0–40%', count: scores.filter(s => s <= 40).length },
    { label: '41–60%', count: scores.filter(s => s > 40 && s <= 60).length },
    { label: '61–80%', count: scores.filter(s => s > 60 && s <= 80).length },
    { label: '81–100%', count: scores.filter(s => s > 80).length },
  ];

  const competencies = [...new Set(questionStats.map(q => q.competencyCode).filter(Boolean))];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.moduleTitle}</h1>
            <p className="text-sm text-gray-500">{session.activityName} · {new Date(session.sessionDate).toLocaleDateString()}</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
      </div>

      {/* Class summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Score', value: `${classStats.avgScore}%` },
          { label: 'Median', value: `${classStats.median}%` },
          { label: 'Participants', value: session.totalParticipants },
          { label: 'Questions', value: session.questionCount },
        ].map(({ label, value }) => (
          <Card key={label} className="border-none shadow-sm">
            <CardHeader className="pb-1"><CardTitle className="text-xs text-gray-500 font-medium">{label}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-indigo-700">{value}</p></CardContent>
          </Card>
        ))}
      </div>

      {/* Score distribution */}
      <Card className="shadow-sm border-none">
        <CardHeader><CardTitle className="text-base font-semibold">Score Distribution</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {results.length === 0
            ? <p className="text-sm text-gray-400 text-center py-4">No responses recorded.</p>
            : bands.map(b => <ScoreBand key={b.label} label={b.label} count={b.count} total={results.length} />)
          }
        </CardContent>
      </Card>

      {/* Question breakdown */}
      <Card className="shadow-sm border-none">
        <CardHeader><CardTitle className="text-base font-semibold">Question Breakdown</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 font-medium">Question</th>
                <th className="pb-2 font-medium">Difficulty</th>
                <th className="pb-2 font-medium">Correct %</th>
                <th className="pb-2 font-medium">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {questionStats.map((q, i) => {
                const correctPct = q.total > 0 ? Math.round((q.correct / q.total) * 100) : 0;
                const flagged = correctPct < 40 && q.total > 0;
                return (
                  <tr key={i} className={flagged ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                    <td className="py-2 max-w-xs truncate">{q.text}</td>
                    <td className="py-2 text-gray-600">{DIFFICULTY_LABEL[q.difficulty] ?? '—'}</td>
                    <td className="py-2">
                      <span className={correctPct >= 60 ? 'text-green-600 font-medium' : correctPct >= 40 ? 'text-amber-600 font-medium' : 'text-red-600 font-medium'}>
                        {correctPct}%
                      </span>
                    </td>
                    <td className="py-2">
                      {flagged && <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1"><AlertTriangle className="h-3 w-3" />Low</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Participant results */}
      <Card className="shadow-sm border-none">
        <CardHeader><CardTitle className="text-base font-semibold">Participant Results</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          {results.length === 0
            ? <p className="text-sm text-gray-400 text-center py-4">No participant results.</p>
            : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2 font-medium">Member</th>
                    <th className="pb-2 font-medium">Score</th>
                    <th className="pb-2 font-medium">Result</th>
                    <th className="pb-2 font-medium">Flags</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.map(r => {
                    const pass = r.rawScore >= 60;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="py-2 font-mono text-xs text-gray-500">{r.memberId.slice(-8)}</td>
                        <td className="py-2 font-medium">{Math.round(r.rawScore)}%</td>
                        <td className="py-2">
                          {pass
                            ? <Badge className="bg-green-100 text-green-700 border-green-200 gap-1"><CheckCircle2 className="h-3 w-3" />Pass</Badge>
                            : <Badge className="bg-red-100 text-red-700 border-red-200 gap-1"><XCircle className="h-3 w-3" />Fail</Badge>
                          }
                        </td>
                        <td className="py-2">
                          {Array.isArray(r.biasFlags) && r.biasFlags.length > 0
                            ? <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1"><AlertTriangle className="h-3 w-3" />Flagged</Badge>
                            : <span className="text-gray-400 text-xs">—</span>
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          }
        </CardContent>
      </Card>

      {/* Competency coverage */}
      {competencies.length > 0 && (
        <Card className="shadow-sm border-none">
          <CardHeader><CardTitle className="text-base font-semibold">Competency Coverage</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {competencies.map(c => (
                <Badge key={c} variant="outline" className="text-indigo-700 border-indigo-200">{c}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
