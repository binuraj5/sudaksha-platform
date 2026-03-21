'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useCTACapture } from '@/hooks/useCTACapture';

const PROGRAMS = [
  'Java Full Stack Plus',
  'Python Full Stack',
  'Data Science & Analytics',
  'MERN Stack Development',
  'DevOps & Cloud Engineering',
  'QA Automation Testing',
  'Other',
];

/**
 * Exit-intent popup — shows when mouse exits toward the browser chrome.
 * Only on / and /courses. Suppressed after first show per session.
 */
export default function ExitIntentPopup() {
  const pathname = usePathname();
  const { capture } = useCTACapture();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', interest: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const shownRef = useRef(false);

  const TARGET_PAGES = ['/', '/courses'];

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 0 && !shownRef.current && TARGET_PAGES.includes(pathname)) {
      shownRef.current = true;
      sessionStorage.setItem('_exit_shown', '1');
      setIsOpen(true);
    }
  }, [pathname]);

  useEffect(() => {
    if (sessionStorage.getItem('_exit_shown')) shownRef.current = true;
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [handleMouseLeave]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await capture({
      sourcePage: pathname,
      ctaLabel: 'Exit Intent Popup',
      ctaType: 'form_submit',
      intent: 'brochure',
      name: form.name,
      email: form.email,
      programInterest: form.interest,
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-blue-900 to-indigo-800 text-white p-6 text-center">
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          <div className="text-4xl mb-3">🎁</div>
          <h2 className="text-xl font-bold">Wait — get our free program guide before you leave</h2>
          <p className="text-blue-200 text-sm mt-2">We'll email you our complete catalog with fees, outcomes, and placement stats.</p>
        </div>
        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-3">📧</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Check your inbox!</h3>
            <p className="text-gray-500 text-sm mb-5">Your program guide is on its way to {form.email}.</p>
            <button onClick={() => setIsOpen(false)} className="px-6 py-2 bg-blue-900 text-white rounded-lg font-semibold text-sm hover:bg-blue-800 transition">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your name" />
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your email address" />
            <select value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">I'm interested in…</option>
              {PROGRAMS.map(p => <option key={p}>{p}</option>)}
            </select>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 disabled:opacity-60 transition text-sm">
              {loading ? 'Sending…' : 'Send Me the Guide →'}
            </button>
            <p className="text-xs text-gray-400 text-center">No spam, ever. Unsubscribe with one click.</p>
          </form>
        )}
      </div>
    </div>
  );
}
