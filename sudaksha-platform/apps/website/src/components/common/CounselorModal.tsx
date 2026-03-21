'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCTACapture } from '@/hooks/useCTACapture';

interface CounselorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePage?: string;
}

/**
 * Slide-in counselor booking drawer.
 * Used by: Book Free Consultation, Talk to Career Counselor, Talk to Counselor
 */
export function CounselorModal({ isOpen, onClose, sourcePage = '/' }: CounselorModalProps) {
  const { capture } = useCTACapture();
  const [form, setForm] = useState({ name: '', phone: '', email: '', situation: '', bestTime: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await capture({
      sourcePage,
      ctaLabel: 'Talk to Career Counselor',
      ctaType: 'form_submit',
      intent: 'counseling',
      userType: 'individual',
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: `Situation: ${form.situation}. Best time: ${form.bestTime}`,
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
        <div className="bg-blue-900 text-white p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          <h2 className="text-xl font-bold">Talk to a Career Counselor</h2>
          <p className="text-blue-200 text-sm mt-1">Free, personalised guidance for your career journey.</p>
        </div>

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">We'll call you within 2 hours!</h3>
            <p className="text-gray-500 text-sm mb-6">A Sudaksha counselor will reach out at {form.phone || 'your number'} during your preferred time.</p>
            <button onClick={onClose} className="px-6 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input ref={firstInputRef} required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
              <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">I am currently a…</label>
              <select value={form.situation} onChange={e => setForm(f => ({ ...f, situation: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select your situation</option>
                <option value="Fresh Graduate">Fresh Graduate</option>
                <option value="Working Professional">Working Professional</option>
                <option value="Career Switcher">Career Switcher</option>
                <option value="Corporate HR">Corporate HR / L&D</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Best time to call</label>
              <div className="flex gap-3">
                {['Morning (9–12)', 'Afternoon (12–5)', 'Evening (5–8)'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, bestTime: t }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition ${form.bestTime === t ? 'bg-blue-900 text-white border-blue-900' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
                    {t.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 disabled:opacity-60 transition mt-2">
              {loading ? 'Submitting…' : 'Book My Counseling Session →'}
            </button>
            <p className="text-xs text-gray-400 text-center">No spam. We'll only call once to understand your goals.</p>
          </form>
        )}
      </div>
    </div>
  );
}
