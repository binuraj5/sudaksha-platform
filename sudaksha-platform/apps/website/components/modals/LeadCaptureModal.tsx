'use client';

import { useState } from 'react';
import { useCTACapture } from '@/hooks/useCTACapture';
import { X, Loader2 } from 'lucide-react';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  title: string;
  description?: string;
  source?: string;
  fileToDownload?: string;
}

export function LeadCaptureModal({ isOpen, onClose, type, title, description, source, fileToDownload }: LeadCaptureModalProps) {
  const { capture, isCapturing } = useCTACapture();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
    };

    const success = await capture({
      type,
      source: source || window.location.pathname,
      payload
    });

    if (success) {
      setIsSuccess(true);
      if (fileToDownload) {
        // Automatically trigger file download if one is attached to this CTA target
        const a = document.createElement('a');
        a.href = fileToDownload;
        a.download = fileToDownload.split('/').pop() || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl font-bold">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600">
              {fileToDownload ? 'Your download will begin shortly.' : 'We have received your details and will get back to you soon.'}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            {description && <p className="text-gray-600 mb-6">{description}</p>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" name="name" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input required type="email" name="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input required type="tel" name="phone" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="+91 98765 43210" />
              </div>
              {type === 'Partnership' || type === 'Quote' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company/Organization</label>
                  <input required type="text" name="company" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="TechCorp India" />
                </div>
              ) : null}
              
              <button
                type="submit"
                disabled={isCapturing}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex justify-center items-center mt-6 disabled:bg-blue-400"
              >
                {isCapturing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Details'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
