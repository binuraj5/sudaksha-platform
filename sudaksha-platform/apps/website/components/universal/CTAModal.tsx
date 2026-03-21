'use client';

import { useState, useEffect, useRef } from 'react';
import { useCTAModalContext } from '@/context/CTAModalContext';
import { generateSubjectLine, intentLabels } from '@/lib/generateSubjectLine';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { CTAContext, AudienceType, LeadFormData } from '@/types/cta';

const AUDIENCE_THEME: Record<AudienceType, { border: string; bg: string; text: string; ring: string; buttonBg: string; buttonHover: string }> = {
  corporate:   { border: 'border-sudaksha-blue-500', bg: 'bg-sudaksha-blue-50', text: 'text-sudaksha-blue-600', ring: 'focus:ring-sudaksha-blue-500', buttonBg: 'bg-sudaksha-blue-600', buttonHover: 'hover:bg-sudaksha-blue-700' },
  institution: { border: 'border-sudaksha-orange-500', bg: 'bg-sudaksha-orange-50', text: 'text-sudaksha-orange-600', ring: 'focus:ring-sudaksha-orange-500', buttonBg: 'bg-sudaksha-orange-500', buttonHover: 'hover:bg-sudaksha-orange-600' },
  individual:  { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-600', ring: 'focus:ring-purple-500', buttonBg: 'bg-purple-600', buttonHover: 'hover:bg-purple-700' },
  general:     { border: 'border-gray-400', bg: 'bg-gray-50', text: 'text-gray-600', ring: 'focus:ring-gray-400', buttonBg: 'bg-gray-800', buttonHover: 'hover:bg-gray-900' },
};

const MODAL_TITLES: Record<string, string> = {
  schedule_call:      'Schedule a Strategy Session',
  download_brochure:  'Download the Brochure',
  get_proposal:       'Request a Custom Proposal',
  enquire_program:    'Enquire About This Program',
  campus_assessment:  'Schedule a Campus Assessment',
  career_counseling:  'Book a Career Counseling Session',
  free_assessment:    'Start Your Free Assessment',
  roi_analysis:       'Get a Detailed ROI Analysis',
  discuss_industry:   'Discuss Your Industry Needs',
  talk_to_expert:     'Talk to an Expert',
  design_program:     'Design Your Training Program',
  start_process:      'Start the Discovery Process',
  general_contact:    'Get in Touch',
};

const SUBMIT_LABELS: Record<string, string> = {
  schedule_call:      'Book My Session',
  download_brochure:  'Send Me the Brochure',
  get_proposal:       'Request Proposal',
  enquire_program:    'Send Enquiry',
  campus_assessment:  'Schedule Assessment',
  career_counseling:  'Book Counseling',
  free_assessment:    'Start Assessment',
  roi_analysis:       'Get My ROI Report',
  discuss_industry:   'Start the Conversation',
  talk_to_expert:     'Connect Me to an Expert',
  design_program:     'Start Designing My Program',
  start_process:      'Begin Discovery',
  general_contact:    'Send Message',
};

// Extracted outside to prevent re-render focus loss
const InputEl = ({ name, label, type = 'text', required = false, isSelect = false, options = [], value, onChange, themeClass }: any) => {
  const commonClass = `w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sudaksha-navy-900 placeholder-gray-400 focus:outline-none focus:ring-2 ${themeClass} focus:border-transparent transition-shadow`;
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-sudaksha-navy-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {isSelect ? (
        <select name={name} required={required} onChange={onChange} value={value || ''} className={commonClass}>
          <option value="" disabled>Select an option</option>
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea name={name} required={required} onChange={onChange} value={value || ''} rows={3} className={commonClass} />
      ) : (
        <input type={type} name={name} required={required} onChange={onChange} value={value || ''} className={commonClass} />
      )}
    </div>
  );
};

export function CTAModal() {
  const { isOpen, closeModal, ctaContext, markSubmitted } = useCTAModalContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [form, setForm] = useState<Partial<LeadFormData>>({});

  useEffect(() => {
    if (isOpen && ctaContext) {
      document.body.style.overflow = 'hidden';
      // Hydrate form pre-fills dynamically
      setForm({
        programOfInterest: ctaContext.prefill?.program || '',
      });
      setSuccess(false);
      setError('');
      setTimeout(() => firstInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, ctaContext]);

  if (!isOpen || !ctaContext) return null;

  const theme = AUDIENCE_THEME[ctaContext.audienceType] || AUDIENCE_THEME.general;
  const title = MODAL_TITLES[ctaContext.intent] || 'Contact Us';
  const submitLabel = SUBMIT_LABELS[ctaContext.intent] || 'Submit';
  const subjectLine = generateSubjectLine(ctaContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Align payload to our existing capture API
      const res = await fetch('/api/admin/communication/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'form_submitted',
          ctaType: 'form_submit',
          userType: ctaContext.audienceType,
          intent: ctaContext.intent,
          sourcePage: ctaContext.pageUrl,
          ctaLabel: ctaContext.ctaLabel,
          name: form.fullName,
          email: form.email,
          phone: form.phone,
          message: form.message,
          customData: {
            ...form,
            subjectLine,
            section: ctaContext.section,
            page: ctaContext.page,
            prefill: ctaContext.prefill
          }
        }),
      });

      if (!res.ok) throw new Error('Submission failed');
      
      setSuccess(true);
      markSubmitted();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={closeModal}
      />

      {/* Modal Card */}
      <div className={`relative w-full max-w-[560px] bg-white border border-gray-100 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-t-[4px] ${theme.border}`}>
        
        {/* Header */}
        <div className={`p-6 border-b border-gray-100 flex items-start justify-between shrink-0 ${theme.bg}`}>
          <div>
            <h2 className={`text-2xl font-bold mb-2 ${theme.text.replace('text-', 'text-').replace('-600', '-900')}`}>{title}</h2>
            <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-white ${theme.text} shadow-sm border border-gray-200`}>
                {ctaContext.audienceType}
              </span>
              <span className="font-medium">{ctaContext.page}</span>
              <span className="opacity-50">›</span>
              <span className="font-medium">{ctaContext.section}</span>
            </div>
          </div>
          <button 
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-full transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/50">
          
          {success ? (
             <div className="flex flex-col items-center justify-center py-12 text-center">
               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle className="w-8 h-8 text-green-600" />
               </div>
               <h3 className="text-2xl font-bold text-sudaksha-navy-900 mb-3">You're all set!</h3>
               <p className="text-sudaksha-navy-700 mb-6 max-w-sm leading-relaxed">
                 We've received your request and will be in touch within 24 hours.
               </p>
               <div className="text-xs text-gray-500 bg-gray-100 px-4 py-2 rounded-lg mb-8 max-w-sm border border-gray-200">
                 <p className="font-mono">{subjectLine}</p>
               </div>
               <button 
                 onClick={closeModal}
                 className="px-8 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-sudaksha-navy-900 rounded-lg font-medium transition-colors shadow-sm"
               >
                 Close window
               </button>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Context Badges */}
              {(ctaContext.prefill?.industry || ctaContext.prefill?.model || ctaContext.prefill?.partnershipModel) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {ctaContext.prefill.industry && <span className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-sudaksha-navy-600 shadow-sm">Industry: <strong>{ctaContext.prefill.industry}</strong></span>}
                  {ctaContext.prefill.model && <span className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-sudaksha-navy-600 shadow-sm">Model: <strong>{ctaContext.prefill.model}</strong></span>}
                  {ctaContext.prefill.partnershipModel && <span className="text-xs bg-white border border-gray-200 rounded px-2 py-1 text-sudaksha-navy-600 shadow-sm">Interested in: <strong>{ctaContext.prefill.partnershipModel}</strong></span>}
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mr-3 mt-0.5 text-red-500" />
                  {error}
                </div>
              )}

              {/* Universal Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputEl themeClass={theme.ring} value={form.fullName} onChange={handleInput} name="fullName" label="Full Name" required />
                <InputEl themeClass={theme.ring} value={form.phone} onChange={handleInput} name="phone" label="Phone Number" type="tel" required />
              </div>
              <InputEl themeClass={theme.ring} value={form.email} onChange={handleInput} name="email" label="Email Address" type="email" required />

              {/* Corporate Fields */}
              {ctaContext.audienceType === 'corporate' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 mt-4">
                  <InputEl themeClass={theme.ring} value={form.companyName} onChange={handleInput} name="companyName" label="Company Name" required />
                  <InputEl themeClass={theme.ring} value={form.designation} onChange={handleInput} name="designation" label="Your Designation" required />
                  <InputEl themeClass={theme.ring} value={form.teamSize} onChange={handleInput} name="teamSize" label="Team Size" isSelect options={['5–20', '21–50', '51–200', '201–500', '500+']} />
                  <InputEl themeClass={theme.ring} value={form.trainingNeed} onChange={handleInput} name="trainingNeed" label="Primary Training Need" isSelect options={['Tech Upskilling', 'Leadership', 'Compliance', 'New Hire Onboarding', 'Other']} />
                </div>
              )}

              {/* Institution Fields */}
              {ctaContext.audienceType === 'institution' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 mt-4">
                  <InputEl themeClass={theme.ring} value={form.institutionName} onChange={handleInput} name="institutionName" label="Institution Name" required />
                  <InputEl themeClass={theme.ring} value={form.institutionType} onChange={handleInput} name="institutionType" label="Institution Type" required isSelect options={['Private Engineering College', 'Government College', 'Polytechnic', 'University', 'Deemed University', 'Other']} />
                  <InputEl themeClass={theme.ring} value={form.studentCount} onChange={handleInput} name="studentCount" label="Approx. Student Count" isSelect options={['<500', '500–1000', '1000–3000', '3000+']} />
                  <InputEl themeClass={theme.ring} value={form.currentPlacementRate} onChange={handleInput} name="currentPlacementRate" label="Current Placement Rate" isSelect options={['<30%', '30–50%', '50–70%', '70%+', "Don't Track"]} />
                </div>
              )}

              {/* Individual Fields */}
              {ctaContext.audienceType === 'individual' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 mt-4">
                  <InputEl themeClass={theme.ring} value={form.currentStatus} onChange={handleInput} name="currentStatus" label="Current Status" required isSelect options={['Fresher (0–1 yr)', 'Working Professional', 'Career Switcher', 'Student (Final Year)']} />
                  <InputEl themeClass={theme.ring} value={form.experienceYears} onChange={handleInput} name="experienceYears" label="Years of Experience" isSelect options={['0', '1–3', '3–5', '5–10', '10+']} />
                  <div className="sm:col-span-2">
                    <InputEl themeClass={theme.ring} value={form.programOfInterest} onChange={handleInput} name="programOfInterest" label="Program of Interest (Optional)" />
                  </div>
                </div>
              )}

              <InputEl themeClass={theme.ring} value={form.message} onChange={handleInput} name="message" label="Additional Notes (Optional)" type="textarea" />

              <div className="pt-4 mt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-md text-white ${theme.buttonBg} ${theme.buttonHover} disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Processing...</>
                  ) : (
                    <>{submitLabel} &rarr;</>
                  )}
                </button>
                <p className="text-center text-xs text-gray-500 mt-4">
                  By submitting this form, you agree to our privacy policy. Your data is secure.
                </p>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
