'use client';

import { useState, useEffect } from 'react';
import { useCTACapture } from '@/hooks/useCTACapture';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePage?: string;
}

export function DemoBookingModal({ isOpen, onClose, sourcePage = '/' }: DemoModalProps) {
  const { capture } = useCTACapture();
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '', mode: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await capture({
      sourcePage,
      ctaLabel: 'Book Free Demo',
      ctaType: 'form_submit',
      intent: 'demo_class',
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: `Date: ${form.date}. Time: ${form.time}. Mode: ${form.mode}`,
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-orange-600 text-white p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          <h2 className="text-xl font-bold">Book a Free Demo Class</h2>
          <p className="text-orange-100 text-sm mt-1">Experience Sudaksha's teaching style — completely free.</p>
        </div>
        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Demo Class Booked!</h3>
            <p className="text-gray-500 text-sm mb-6">We'll send a confirmation to {form.email} with the joining link.</p>
            <button onClick={onClose} className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Your full name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="+91 …" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="you@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Time</label>
              <div className="flex gap-3">
                {['10 AM', '3 PM'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(f => ({ ...f, time: t }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${form.time === t ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-300 text-gray-600 hover:border-orange-400'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mode</label>
              <div className="flex gap-3">
                {['Online', 'Offline'].map(m => (
                  <button key={m} type="button" onClick={() => setForm(f => ({ ...f, mode: m }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition ${form.mode === m ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-300 text-gray-600 hover:border-orange-400'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-60 transition">
              {loading ? 'Booking…' : 'Book My Demo Class →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
