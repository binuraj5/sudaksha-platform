'use client';
import React from 'react';

/**
 * Participant Session UI — Take Assessment
 * SEPL/INT/2026/IMPL-PHASE3-01 Step T16 + T17
 *
 * Mobile-friendly quiz UI for live session participants.
 * - Joins session on mount (T17 — increments participant count)
 * - Fetches questions (correctOptionId hidden by API)
 * - Shows one question at a time with response time capture
 * - Submits via POST /api/training/sessions/[id]/respond
 * - Auto-advances after 1.5s on submission
 * - Shows completion screen — score deliberately hidden
 */

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: Array<{ id: string; text: string }>;
  difficultyLevel: number;
  competencyCode: string | null;
}

export default function TakeSessionPage(props: { params: Promise<{ sessionId: string }> }) {
  const { data: authSession, status } = useSession();
  const sessionId = (React.use(props.params)).sessionId;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStatus, setSessionStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const questionStartTime = useRef<number>(Date.now());

  useEffect(() => {
    if (status !== 'authenticated') return;

    async function init() {
      try {
        // Join the session (T17 — increments totalParticipants once)
        const joinRes = await fetch(`/api/training/sessions/${sessionId}/join`, { method: 'POST' });
        const joinData = await joinRes.json();

        if (!joinRes.ok) {
          setSessionStatus(joinData.status ?? 'NOT_ACTIVE');
          setLoading(false);
          return;
        }

        // Fetch questions (correctOptionId excluded by API)
        const questionsRes = await fetch(`/api/training/sessions/${sessionId}/questions`);
        const questionsData = await questionsRes.json();

        if (!questionsRes.ok) {
          setSessionStatus(questionsData.status ?? 'NOT_ACTIVE');
          setLoading(false);
          return;
        }

        setQuestions(questionsData.questions ?? []);
        setSessionStatus('ACTIVE');
        questionStartTime.current = Date.now();
      } catch {
        setError('Failed to connect to session');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [status, sessionId]);

  async function handleSubmit() {
    if (!selectedOption || submitted) return;
    const responseTimeMs = Date.now() - questionStartTime.current;
    setSubmitted(true);

    const res = await fetch(`/api/training/sessions/${sessionId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: questions[currentIndex].id,
        selectedOptionId: selectedOption,
        responseTimeMs,
      }),
    });
    const data = await res.json();
    setIsCorrect(data.isCorrect ?? null);

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setCompleted(true);
      } else {
        setCurrentIndex(i => i + 1);
        setSelectedOption(null);
        setSubmitted(false);
        setIsCorrect(null);
        questionStartTime.current = Date.now();
      }
    }, 1500);
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  if (sessionStatus !== 'ACTIVE') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
        <Card className="max-w-sm w-full shadow-lg border-none">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <Clock className="h-12 w-12 text-amber-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Waiting for trainer</h2>
            <p className="text-gray-500">Session not yet started. Please wait for your trainer to activate the session.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
        <Card className="max-w-sm w-full shadow-lg border-none">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900">Assessment Complete!</h2>
            <p className="text-gray-500">Your responses have been submitted. Your trainer will share results shortly.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;

  const progress = Math.round(((currentIndex) / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-4">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{progress}% complete</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Card */}
        <Card className="shadow-lg border-none">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              {question.competencyCode && (
                <Badge variant="outline" className="text-indigo-700 border-indigo-200 text-xs">{question.competencyCode}</Badge>
              )}
              <p className="text-lg font-semibold text-gray-900 leading-relaxed">{question.questionText}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {(question.options as Array<{ id: string; text: string }>).map(opt => {
                let optionStyle = 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50';
                if (selectedOption === opt.id && !submitted) optionStyle = 'border-indigo-500 bg-indigo-50';
                if (submitted && selectedOption === opt.id) {
                  optionStyle = isCorrect ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50';
                }

                return (
                  <button
                    key={opt.id}
                    disabled={submitted}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all text-sm font-medium ${optionStyle}`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {submitted && isCorrect !== null && (
              <div className={`flex items-center gap-2 text-sm font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </div>
            )}

            {/* Submit button */}
            <Button
              className="w-full"
              disabled={!selectedOption || submitted}
              onClick={handleSubmit}
            >
              {submitted ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Answer'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
