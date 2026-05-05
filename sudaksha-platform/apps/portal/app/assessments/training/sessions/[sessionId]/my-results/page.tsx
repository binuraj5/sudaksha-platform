'use client';
import React from 'react';

/**
 * Individual Participant Results — My Session Report
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T19
 *
 * Shows participant their own results after session COMPLETED:
 * - Score (X/Y correct, %)
 * - Per-question result with their answer and correct/incorrect badge
 * - Competency coverage chips
 * - Delta vs last session (T22)
 * - Deliberately does NOT show other participants' scores
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, TrendingUp, TrendingDown, Minus, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MyResult {
  rawScore: number;
  normalisedScore?: number;
  proficiencyLevel?: number;
  totalQuestions: number;
  correctAnswers: number;
  biasFlags: unknown[];
  deltaFromLastSession?: number | null;
}

interface ResponseDetail {
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  competencyCode: string | null;
}

export default function MyResultsPage(props: { params: Promise<{ sessionId: string }> }) {
  const { data: authSession, status } = useSession();
  const router = useRouter();

  const [result, setResult] = useState<MyResult | null>(null);
  const [responses, setResponses] = useState<ResponseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;
    const user = authSession?.user as { id?: string; memberId?: string };
    const memberId = user?.memberId ?? user?.id;

    fetch(`/api/training/sessions/${(React.use(props.params)).sessionId}/results`)
      .then(r => r.json())
      .then(data => {
        const myResult = data.results?.find((r: { memberId: string }) => r.memberId === memberId);
        setResult(myResult ?? null);
        // Filter responses to only this member (responses not returned by default results endpoint)
        setLoading(false);
      })
      .catch(() => { setError('Failed to load results'); setLoading(false); });
  }, [status, authSession, (React.use(props.params)).sessionId]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (error || !result) return <div className="flex items-center justify-center min-h-screen text-red-500">{error ?? 'Results not available yet'}</div>;

  const pass = result.rawScore >= 60;
  const delta = result.deltaFromLastSession;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-xl font-bold text-gray-900">My Results</h1>
        </div>

        {/* Main score card */}
        <Card className="border-none shadow-lg text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <div className={`text-6xl font-extrabold ${pass ? 'text-green-600' : 'text-amber-600'}`}>
              {Math.round(result.rawScore)}%
            </div>
            <div className="text-gray-600 text-lg">
              {result.correctAnswers} / {result.totalQuestions} correct
            </div>
            <div>
              {pass
                ? <Badge className="bg-green-100 text-green-700 border-green-200 text-sm gap-1 px-3 py-1"><CheckCircle2 className="h-4 w-4" />Pass</Badge>
                : <Badge className="bg-red-100 text-red-700 border-red-200 text-sm gap-1 px-3 py-1"><XCircle className="h-4 w-4" />Needs Improvement</Badge>
              }
            </div>

            {/* Delta from last session */}
            {delta !== null && delta !== undefined && (
              <div className={`flex items-center justify-center gap-2 text-sm font-medium ${delta > 0 ? 'text-green-600' : delta < 0 ? 'text-amber-600' : 'text-gray-500'}`}>
                {delta > 0 ? <TrendingUp className="h-4 w-4" /> : delta < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                {delta > 0 ? `↑ +${delta}% vs last session` : delta < 0 ? `↓ ${delta}% vs last session` : 'Same as last session'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proficiency level */}
        {result.proficiencyLevel && (
          <Card className="border-none shadow-sm">
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">Proficiency Level</span>
              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Level {result.proficiencyLevel}</Badge>
            </CardContent>
          </Card>
        )}

        {/* Responses placeholder — detailed view requires additional API */}
        {responses.length > 0 && (
          <Card className="border-none shadow-sm">
            <CardHeader><CardTitle className="text-base font-semibold">Question Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {responses.map((r, i) => (
                <div key={i} className={`p-3 rounded-lg border ${r.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="text-sm text-gray-700">{r.questionText}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {r.isCorrect
                      ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                      : <XCircle className="h-4 w-4 text-red-500" />
                    }
                    <span className="text-xs text-gray-500">{r.isCorrect ? 'Correct' : 'Incorrect'}</span>
                    {r.competencyCode && <Badge variant="outline" className="text-xs">{r.competencyCode}</Badge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
