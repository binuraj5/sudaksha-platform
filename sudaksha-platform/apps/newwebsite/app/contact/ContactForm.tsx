'use client'

import { useState } from 'react'

const subjects = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'enterprise-demo', label: 'Enterprise Demo' },
  { value: 'institution-demo', label: 'Institution Demo' },
  { value: 'diagnostic', label: 'Diagnostic Call' },
  { value: 'samyak-demo', label: 'Samyak™ Demo' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'careers', label: 'Careers' },
  { value: 'demo', label: 'General Demo' },
]

export function ContactForm() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    organisation: '',
    subject: 'general',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      })
      if (res.ok) setStatus('sent')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-2xl p-10 text-center border" style={{ borderColor: 'var(--border)' }}>
        <div className="text-5xl mb-4">✓</div>
        <h3 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--dark)' }}>Message received.</h3>
        <p className="font-body text-base" style={{ color: 'var(--muted)' }}>
          We will respond within one business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="font-mono text-xs tracking-wider uppercase block mb-1.5" style={{ color: 'var(--muted)' }}>
            Name *
          </label>
          <input
            type="text"
            required
            value={formState.name}
            onChange={e => setFormState(s => ({ ...s, name: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border font-body text-sm outline-none transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--dark)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--royal)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="font-mono text-xs tracking-wider uppercase block mb-1.5" style={{ color: 'var(--muted)' }}>
            Email *
          </label>
          <input
            type="email"
            required
            value={formState.email}
            onChange={e => setFormState(s => ({ ...s, email: e.target.value }))}
            className="w-full px-4 py-3 rounded-lg border font-body text-sm outline-none transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--dark)' }}
            onFocus={e => (e.target.style.borderColor = 'var(--royal)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div>
        <label className="font-mono text-xs tracking-wider uppercase block mb-1.5" style={{ color: 'var(--muted)' }}>
          Organisation
        </label>
        <input
          type="text"
          value={formState.organisation}
          onChange={e => setFormState(s => ({ ...s, organisation: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border font-body text-sm outline-none transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--dark)' }}
          onFocus={e => (e.target.style.borderColor = 'var(--royal)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          placeholder="Company or institution name"
        />
      </div>

      <div>
        <label className="font-mono text-xs tracking-wider uppercase block mb-1.5" style={{ color: 'var(--muted)' }}>
          Subject *
        </label>
        <select
          required
          value={formState.subject}
          onChange={e => setFormState(s => ({ ...s, subject: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border font-body text-sm outline-none transition-colors bg-white"
          style={{ borderColor: 'var(--border)', color: 'var(--dark)' }}
          onFocus={e => (e.target.style.borderColor = 'var(--royal)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        >
          {subjects.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-mono text-xs tracking-wider uppercase block mb-1.5" style={{ color: 'var(--muted)' }}>
          Message *
        </label>
        <textarea
          required
          rows={5}
          value={formState.message}
          onChange={e => setFormState(s => ({ ...s, message: e.target.value }))}
          className="w-full px-4 py-3 rounded-lg border font-body text-sm outline-none transition-colors resize-none"
          style={{ borderColor: 'var(--border)', color: 'var(--dark)' }}
          onFocus={e => (e.target.style.borderColor = 'var(--royal)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          placeholder="Tell us what you are trying to achieve..."
        />
      </div>

      {status === 'error' && (
        <p className="font-mono text-sm text-red-600">Something went wrong. Please try again or email us directly.</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-primary w-full justify-center"
        style={{ opacity: status === 'sending' ? 0.7 : 1 }}
      >
        {status === 'sending' ? 'Sending...' : 'Send Message →'}
      </button>
    </form>
  )
}
