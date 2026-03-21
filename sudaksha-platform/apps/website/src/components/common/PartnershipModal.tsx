'use client';

import { useState, useEffect } from 'react';
import { useCTACapture } from '@/hooks/useCTACapture';

interface PartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePage?: string;
}

export function PartnershipModal({ isOpen, onClose, sourcePage = '/' }: PartnershipModalProps) {
  const { capture } = useCTACapture();
  const [form, setForm] = useState({ name: '', institution: '', phone: '', email: '', message: '' });
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
      ctaLabel: 'Start Partnership Discussion',
      ctaType: 'form_submit',
      intent: 'partnership',
      userType: 'institution',
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: `Institution: ${form.institution}. ${form.message}`,
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-purple-900 text-white p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          <h2 className="text-xl font-bold">Start a Partnership Discussion</h2>
          <p className="text-purple-200 text-sm mt-1">Let's explore how Sudaksha can strengthen your institution.</p>
        </div>
        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-500 text-sm mb-6">Our partnerships team will reach out to {form.email} within 2 business days.</p>
            <button onClick={onClose} className="px-6 py-2 bg-purple-900 text-white rounded-lg font-semibold hover:bg-purple-800 transition">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Institution *</label>
                <input required value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="College / University" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="+91 …" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="you@institution.edu" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                placeholder="Tell us about your student intake, current programs, and what you're looking for…" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-purple-900 text-white font-bold rounded-lg hover:bg-purple-800 disabled:opacity-60 transition">
              {loading ? 'Sending…' : 'Start Discussion →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
