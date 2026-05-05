'use client';
import React from 'react';

/**
 * Class Report Page — Print Optimised
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T19.2
 *
 * A shareable/printable version of the class report for a trainer/ops.
 * Has CSS print styles applied.
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Download, Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionResult {
  memberId: string;
  rawScore: number;
}

interface QuestionStat {
  text: string;
  correct: number;
  total: number;
  competencyCode: string | null;
}

interface ResultsData {
  session: {
    moduleTitle: string;
    sessionDate: string;
    totalParticipants: number;
    activityName: string;
  };
  results: SessionResult[];
  questionStats: QuestionStat[];
  classStats: { avgScore: number; median: number };
}

export default function ClassReportPage(props: { params: Promise<{ sessionId: string }> }) {
  const router = useRouter();
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/training/sessions/${(React.use(props.params)).sessionId}/results`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [(React.use(props.params)).sessionId]);

  if (loading) return <div className="flex items-center justify-center min-h-screen print:hidden"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!data) return <div className="flex items-center justify-center min-h-screen">Failed to load</div>;

  const competencies = [...new Set(data.questionStats.map(q => q.competencyCode).filter(Boolean))];

  return (
    <div className="min-h-screen bg-white">
      {/* Non-print controls */}
      <div className="print:hidden p-4 border-b bg-gray-50 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" />Print</Button>
          <Button><Download className="h-4 w-4 mr-2" />Download PDF</Button>
        </div>
      </div>

      {/* Print Document Layout */}
      <div className="max-w-4xl mx-auto p-12 print:p-0 text-gray-900">
        
        {/* Header */}
        <div className="border-b-2 border-indigo-600 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{data.session.moduleTitle}</h1>
            <p className="text-lg text-gray-600 mt-1">{data.session.activityName}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p className="font-semibold text-gray-900">Date: {new Date(data.session.sessionDate).toLocaleDateString()}</p>
            <p>Powered by ADAPT-16™</p>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Participants</div>
            <div className="text-3xl font-bold mt-1">{data.session.totalParticipants}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Avg Class Score</div>
            <div className="text-3xl font-bold mt-1">{data.classStats.avgScore}%</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Median Score</div>
            <div className="text-3xl font-bold mt-1">{data.classStats.median}%</div>
          </div>
        </div>

        {/* Competencies */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Competencies Addressed</h2>
          <div className="flex flex-wrap gap-2">
            {competencies.map(c => (
              <span key={c} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-sm font-medium">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Participant Results */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Participant Roster</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Member ID</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Score</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((r, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 px-4 font-mono text-gray-600">{r.memberId.slice(-8)}</td>
                  <td className="py-2 px-4 text-right font-medium">{Math.round(r.rawScore)}%</td>
                  <td className="py-2 px-4">
                    {r.rawScore >= 60 ? <span className="text-green-600 font-medium">Pass</span> : <span className="text-amber-600 font-medium">Review</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t text-center text-xs text-gray-400">
          <p>Confidential • Sudaksha Enterprise Platform • Generated {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
