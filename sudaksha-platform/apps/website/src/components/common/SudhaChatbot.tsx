'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCTACapture } from '@/hooks/useCTACapture';
import { CounselorModal } from './CounselorModal';
import { QuoteRequestModal } from './QuoteRequestModal';

type ChatStep = 'init' | 'student' | 'pro' | 'company' | 'done';

interface Message {
  from: 'bot' | 'user';
  text: string;
}

/**
 * Sudha — Sudaksha's rule-based chatbot widget (bottom-left).
 * Routes users to the appropriate modal and fires capture() at each step.
 */
export default function SudhaChatbot() {
  const pathname = usePathname();
  const { capture } = useCTACapture();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ChatStep>('init');
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: "Hi 👋 I'm Sudha, Sudaksha's assistant. Are you a student, a working professional, or from a company?" },
  ]);
  const [counselorOpen, setCounselorOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  const addBot = (text: string) => setMessages(m => [...m, { from: 'bot', text }]);
  const addUser = (text: string) => setMessages(m => [...m, { from: 'user', text }]);

  const handleOption = async (label: string, next: ChatStep | 'counselor' | 'quote' | 'courses') => {
    addUser(label);
    await capture({ sourcePage: pathname, ctaLabel: `Chatbot - ${label}`, ctaType: 'button_click', intent: next === 'quote' ? 'corporate_quote' : next === 'counselor' ? 'counseling' : undefined });

    if (next === 'student') {
      setStep('student');
      setTimeout(() => addBot("What are you looking for?"), 400);
    } else if (next === 'pro') {
      setStep('pro');
      setTimeout(() => addBot("What's your goal?"), 400);
    } else if (next === 'company') {
      setStep('company');
      setTimeout(() => addBot("What do you need?"), 400);
    } else if (next === 'counselor') {
      setStep('done');
      setTimeout(() => { addBot("I'll connect you with a counselor right now!"); setTimeout(() => { setCounselorOpen(true); setIsOpen(false); }, 800); }, 400);
    } else if (next === 'quote') {
      setStep('done');
      setTimeout(() => { addBot("Let me connect you with our corporate team!"); setTimeout(() => { setQuoteOpen(true); setIsOpen(false); }, 800); }, 400);
    } else if (next === 'courses') {
      setStep('done');
      setTimeout(() => { addBot("Great! Head over to our courses page to explore."); setTimeout(() => window.location.href = '/courses', 1000); }, 400);
    }
  };

  const OPTIONS: Record<ChatStep, { label: string; next: Parameters<typeof handleOption>[1] }[]> = {
    init: [
      { label: 'Student / Fresh Graduate', next: 'student' },
      { label: 'Working Professional', next: 'pro' },
      { label: 'From a Company', next: 'company' },
    ],
    student: [
      { label: 'Get Placed 🎯', next: 'counselor' },
      { label: 'Upskill Fast ⚡', next: 'counselor' },
      { label: 'Explore Courses 📚', next: 'courses' },
    ],
    pro: [
      { label: 'Switch Career 🔄', next: 'counselor' },
      { label: 'Get Promoted 🚀', next: 'counselor' },
      { label: 'Learn New Tech 💻', next: 'courses' },
    ],
    company: [
      { label: 'Train My Team 🏋️', next: 'quote' },
      { label: 'Hire Trained Talent 👥', next: 'quote' },
      { label: 'Assessment Services 📊', next: 'quote' },
    ],
    done: [],
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label="Chat with Sudha"
        className="fixed bottom-6 left-6 z-[9998] w-14 h-14 rounded-full bg-blue-900 text-white shadow-xl flex items-center justify-center hover:bg-blue-800 hover:scale-110 transition-all active:scale-95"
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.25c-5.385 0-9.75 3.694-9.75 8.25 0 2.41 1.147 4.574 2.978 6.074a.75.75 0 01.172.91L4.5 19.5l3.018-1.006A9.97 9.97 0 0012 19.5c5.385 0 9.75-3.694 9.75-8.25S17.385 2.25 12 2.25z" /></svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-[9997] w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
          <div className="bg-blue-900 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">S</div>
            <div>
              <p className="font-bold text-sm">Sudha</p>
              <p className="text-xs text-blue-200">Sudaksha Assistant · Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 max-h-64 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${msg.from === 'user' ? 'bg-blue-900 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Options */}
          {OPTIONS[step].length > 0 && (
            <div className="px-4 pb-4 space-y-2">
              {OPTIONS[step].map(opt => (
                <button key={opt.label} onClick={() => handleOption(opt.label, opt.next)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-blue-200 text-blue-900 text-sm font-semibold hover:bg-blue-50 transition">
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <CounselorModal isOpen={counselorOpen} onClose={() => setCounselorOpen(false)} sourcePage={pathname} />
      <QuoteRequestModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} sourcePage={pathname} />
    </>
  );
}
