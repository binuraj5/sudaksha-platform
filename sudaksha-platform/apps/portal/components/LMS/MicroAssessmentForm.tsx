/**
 * MicroAssessmentForm — client-side runner for milestone micro-assessments
 * SEPL/INT/2026/IMPL-GAPS-01 Step G17
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  type: string;
  options?: { text: string; isCorrect?: boolean }[] | null;
}

interface Props {
  microId: string;
  competencyName: string;
  questions: Question[];
}

export function MicroAssessmentForm({ microId, competencyName, questions }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    microScore: number;
    blendedScore: number | null;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = questions.every(q => answers[q.id] != null && answers[q.id] !== '');

  const handleSubmit = async () => {
    if (busy || !allAnswered) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/lms/micro/${microId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: questions.map(q => ({ questionId: q.id, answer: answers[q.id] })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Failed to submit micro-assessment.');
        return;
      }
      setResult({
        microScore: data.microScore ?? 0,
        blendedScore: data.blendedScore ?? null,
        message: data.message ?? 'Progress check complete — keep going!',
      });
    } catch {
      setError('Network error.');
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center space-y-5">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{result.message}</h2>
          <p className="text-sm text-gray-500 mt-2">
            Score: <span className="font-semibold text-gray-900">{result.microScore}%</span>
            {result.blendedScore != null && (
              <> · Updated competency score: <span className="font-semibold text-indigo-600">{result.blendedScore}</span></>
            )}
          </p>
        </div>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => router.push('/assessments/lms')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Modules <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-1">
          Progress Check · {competencyName}
        </p>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
          Answer {questions.length} quick {questions.length === 1 ? 'question' : 'questions'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          This is a brief progress check — your existing competency score will be lightly updated.
        </p>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-xs font-bold text-gray-400 tabular-nums">Q{idx + 1}</span>
            <p className="text-base font-semibold text-gray-900">{q.text}</p>
          </div>

          {Array.isArray(q.options) && q.options.length > 0 ? (
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const value = String(opt.text);
                const checked = answers[q.id] === value;
                return (
                  <label
                    key={oi}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={value}
                      checked={checked}
                      onChange={() => setAnswers(a => ({ ...a, [q.id]: value }))}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-800">{value}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <input
              type="text"
              value={answers[q.id] ?? ''}
              onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
              placeholder="Your answer…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>
      ))}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={busy || !allAnswered}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {busy ? 'Submitting…' : 'Submit Progress Check'}
        </button>
      </div>
    </div>
  );
}
