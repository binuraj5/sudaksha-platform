import { useState } from 'react';

export interface CaptureData {
  type?: string;
  source?: string;
  payload?: Record<string, any>;
  // Convenience fields used at call sites — all optional
  ctaLabel?: string;
  sourcePage?: string;
  intent?: string;
  userType?: string;
  programInterest?: string;
  ctaType?: string;
  [key: string]: any; // allow any additional fields
}

export function useCTACapture() {
  const [isCapturing, setIsCapturing] = useState(false);

  const capture = async (data: CaptureData) => {
    setIsCapturing(true);
    try {
      const response = await fetch('/api/admin/communication/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to capture CTA action');
        return false;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error in useCTACapture:', error);
      return false;
    } finally {
      setIsCapturing(false);
    }
  };

  return { capture, isCapturing };
}
