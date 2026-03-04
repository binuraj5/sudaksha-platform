// CTA Tracking Utility
// This can be used throughout the application to track CTA clicks and conversions

export interface CTAEvent {
  ctaId: string
  userId?: string
  sessionId: string
  eventType: 'CLICK' | 'CONVERSION' | 'IMPRESSION'
  eventData: {
    pageUrl: string
    formName?: string
    buttonName?: string
    buttonText?: string
    timestamp: string
    ipAddress?: string
    userAgent?: string
    formData?: any
    [key: string]: any
  }
}

export interface CTATracker {
  ctaId: string
  ctaText: string
  ctaUrl: string
  pageUrl: string
  formName?: string
  buttonName?: string
  buttonText?: string
}

class CTATrackingService {
  private static instance: CTATrackingService
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  static getInstance(): CTATrackingService {
    if (!CTATrackingService.instance) {
      CTATrackingService.instance = new CTATrackingService()
    }
    return CTATrackingService.instance
  }

  private generateSessionId(): string {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }

  // Track CTA click
  async trackCTAClick(tracker: CTATracker, userId?: string): Promise<void> {
    const event: CTAEvent = {
      ctaId: tracker.ctaId,
      userId,
      sessionId: this.sessionId,
      eventType: 'CLICK',
      eventData: {
        pageUrl: tracker.pageUrl,
        formName: tracker.formName,
        buttonName: tracker.buttonName,
        buttonText: tracker.buttonText,
        timestamp: new Date().toISOString(),
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent
      }
    }

    await this.sendEvent(event)
  }

  // Track CTA conversion (form submission, purchase, etc.)
  async trackCTAConversion(tracker: CTATracker, userId?: string, formData?: any): Promise<void> {
    const event: CTAEvent = {
      ctaId: tracker.ctaId,
      userId,
      sessionId: this.sessionId,
      eventType: 'CONVERSION',
      eventData: {
        pageUrl: tracker.pageUrl,
        formName: tracker.formName,
        buttonName: tracker.buttonName,
        buttonText: tracker.buttonText,
        timestamp: new Date().toISOString(),
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        formData
      }
    }

    await this.sendEvent(event)
  }

  // Track CTA impression
  async trackCTAImpression(tracker: CTATracker, userId?: string): Promise<void> {
    const event: CTAEvent = {
      ctaId: tracker.ctaId,
      userId,
      sessionId: this.sessionId,
      eventType: 'IMPRESSION',
      eventData: {
        pageUrl: tracker.pageUrl,
        timestamp: new Date().toISOString(),
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent
      }
    }

    await this.sendEvent(event)
  }

  private async sendEvent(event: CTAEvent): Promise<void> {
    try {
      await fetch('/api/admin/communication?action=cta-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ctaId: event.ctaId,
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
          endDate: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to send CTA event:', error)
    }
  }

  private async getClientIP(): Promise<string> {
    // In a real implementation, this would get the client IP
    return '192.168.1.100'
  }

  // Generate CTA tracker data
  generateCTATracker(
    ctaId: string,
    ctaText: string,
    ctaUrl: string,
    formName?: string,
    buttonName?: string,
    buttonText?: string
  ): CTATracker {
    return {
      ctaId,
      ctaText,
      ctaUrl,
      pageUrl: window.location.href,
      formName,
      buttonName,
      buttonText
    }
  }
}

// React Hook for CTA Tracking
export function useCTATracking() {
  const tracker = CTATrackingService.getInstance()

  const trackClick = async (
    ctaId: string,
    ctaText: string,
    ctaUrl: string,
    options?: {
      formName?: string
      buttonName?: string
      buttonText?: string
      userId?: string
    }
  ) => {
    const trackerData = tracker.generateCTATracker(
      ctaId,
      ctaText,
      ctaUrl,
      options?.formName,
      options?.buttonName,
      options?.buttonText
    )
    
    await tracker.trackCTAClick(trackerData, options?.userId)
  }

  const trackConversion = async (
    ctaId: string,
    ctaText: string,
    ctaUrl: string,
    options?: {
      formName?: string
      buttonName?: string
      buttonText?: string
      userId?: string
      formData?: any
    }
  ) => {
    const trackerData = tracker.generateCTATracker(
      ctaId,
      ctaText,
      ctaUrl,
      options?.formName,
      options?.buttonName,
      options?.buttonText
    )
    
    await tracker.trackCTAConversion(trackerData, options?.userId, options?.formData)
  }

  const trackImpression = async (
    ctaId: string,
    ctaText: string,
    ctaUrl: string,
    options?: {
      userId?: string
    }
  ) => {
    const trackerData = tracker.generateCTATracker(ctaId, ctaText, ctaUrl)
    await tracker.trackCTAImpression(trackerData, options?.userId)
  }

  return {
    trackClick,
    trackConversion,
    trackImpression
  }
}

// Example usage in React components:
/*
import { useCTATracking } from '@/lib/cta-tracking'

function CourseEnrollmentButton() {
  const { trackClick, trackConversion } = useCTATracking()
  
  const handleClick = async () => {
    await trackClick('cta-enroll-now', 'Enroll Now', '/courses/full-stack/enroll', {
      formName: 'Course Enrollment Form',
      buttonName: 'Enroll Now Button',
      buttonText: 'Enroll Now'
    })
  }
  
  const handleFormSubmit = async (formData: any) => {
    await trackConversion('cta-enroll-now', 'Enroll Now', '/courses/full-stack/enroll', {
      formName: 'Course Enrollment Form',
      buttonName: 'Submit Enrollment',
      buttonText: 'Complete Enrollment',
      userId: formData.userId,
      formData
    })
  }
  
  return (
    <button onClick={handleClick}>
      Enroll Now
    </button>
  )
}
*/

export default CTATrackingService
