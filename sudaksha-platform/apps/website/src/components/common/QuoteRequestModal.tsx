'use client';

import { useState, useEffect } from 'react';
import { useCTACapture } from '@/hooks/useCTACapture';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePage?: string;
  planName?: string;
}

/**
 * Corporate quote request modal.
 * Used by: Get Started (corporate), Starter/Accelerator/Enterprise plan CTAs (/consult)
 */
export function QuoteRequestModal({ isOpen, onClose, sourcePage = '/', planName }: QuoteModalProps) {
  const { capture } = useCTACapture();
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', teamSize: '', message: '' });
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
      ctaLabel: planName ? `Get Started - ${planName}` : 'Get Corporate Training Quote',
      ctaType: 'form_submit',
      intent: 'corporate_quote',
      userType: 'corporate',
      name: form.name,
      email: form.email,
      phone: form.phone,
      programInterest: planName,
      message: `Company: ${form.company}. Team size: ${form.teamSize}. ${form.message}`,
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-900 text-white p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none">&times;</button>
          <h2 className="text-xl font-bold">Request a Quote</h2>
          <p className="text-blue-200 text-sm mt-1">{planName ? `${planName} — ` : ''}Tell us about your team and we'll get back within 24 hours.</p>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Received!</h3>
            <p className="text-gray-500 text-sm mb-6">Our corporate team will contact you at {form.email} within 24 hours with a customised proposal.</p>
            <button onClick={onClose} className="px-6 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name *</label>
                <input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Acme Corp" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="you@company.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Team Size</label>
              <select value={form.teamSize} onChange={e => setForm(f => ({ ...f, teamSize: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select team size</option>
                <option>10–50</option>
                <option>51–200</option>
                <option>201–500</option>
                <option>500+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Message (optional)</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Tell us about your training goals…" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 disabled:opacity-60 transition">
              {loading ? 'Sending…' : 'Submit Request →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
