'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CTAContext } from '@/types/cta';

interface CTAModalContextValue {
  isOpen: boolean;
  ctaContext: CTAContext | null;
  openModal: (ctx: CTAContext) => void;
  closeModal: () => void;
  markSubmitted: () => void;
  submitted: boolean;
}

const CTAModalContext = createContext<CTAModalContextValue | null>(null);

export function CTAModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ctaContext, setCTAContext] = useState<CTAContext | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const openModal = useCallback((ctx: CTAContext) => {
    setCTAContext(ctx);
    setSubmitted(false);
    setIsOpen(true);
    
    // We are firing the analytics/audit in the background
    fetch('/api/admin/communication/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'modal_opened', 
        ctaType: 'modal_open',
        userType: ctx.audienceType,
        intent: ctx.intent,
        sourcePage: ctx.pageUrl,
        ctaLabel: ctx.ctaLabel,
        customData: {
          section: ctx.section,
          page: ctx.page,
          prefill: ctx.prefill
        }
      }),
    }).catch(console.error);
  }, []);

  const closeModal = useCallback(() => {
    if (!submitted && ctaContext) {
      fetch('/api/admin/communication/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'modal_abandoned',
          ctaType: 'modal_abandon',
          userType: ctaContext.audienceType,
          intent: ctaContext.intent,
          sourcePage: ctaContext.pageUrl,
          ctaLabel: ctaContext.ctaLabel,
          customData: {
            section: ctaContext.section,
            page: ctaContext.page,
            prefill: ctaContext.prefill
          }
        }),
      }).catch(console.error);
    }
    setIsOpen(false);
  }, [ctaContext, submitted]);

  const markSubmitted = useCallback(() => setSubmitted(true), []);

  return (
    <CTAModalContext.Provider value={{ isOpen, ctaContext, openModal, closeModal, markSubmitted, submitted }}>
      {children}
    </CTAModalContext.Provider>
  );
}

export function useCTAModalContext() {
  const ctx = useContext(CTAModalContext);
  if (!ctx) throw new Error('useCTAModalContext must be used within CTAModalProvider');
  return ctx;
}
