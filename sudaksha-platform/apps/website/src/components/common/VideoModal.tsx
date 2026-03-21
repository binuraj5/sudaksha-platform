'use client';

import { useState, useEffect } from 'react';
import { useCTACapture } from '@/hooks/useCTACapture';
import { CounselorModal } from './CounselorModal';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePage?: string;
  studentName: string;
  story: string;
  role: string;
  company: string;
  videoUrl?: string; // optional YouTube/Vimeo URL — when available, embed it
  posterBg?: string; // tailwind bg colour class
}

/**
 * Video / story modal.
 * Phase 1: shows story card with "Talk to Counselor" CTA.
 * Phase 2: when videoUrl is supplied, renders an iframe player instead.
 */
export function VideoModal({ isOpen, onClose, sourcePage = '/', studentName, story, role, company, videoUrl, posterBg = 'bg-blue-900' }: VideoModalProps) {
  const { capture } = useCTACapture();
  const [counselorOpen, setCounselorOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      capture({ sourcePage, ctaLabel: `Watch Story - ${studentName}`, ctaType: 'video_play' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const embedUrl = videoUrl
    ? videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
    : null;

  return (
    <>
      <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Poster or Video */}
          {embedUrl ? (
            <div className="aspect-video w-full">
              <iframe src={embedUrl} className="w-full h-full" allow="autoplay; fullscreen" allowFullScreen title={`${studentName} story`} />
            </div>
          ) : (
            <div className={`${posterBg} aspect-video w-full flex flex-col items-center justify-center text-white relative`}>
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative text-center px-6">
                <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mx-auto mb-4 text-4xl font-black">
                  {studentName.charAt(0)}
                </div>
                <p className="text-xl font-bold">{studentName}</p>
                <p className="text-sm text-white/75 mt-1">{role} at {company}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-white/60 bg-white/10 rounded-full px-4 py-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  Video coming soon
                </div>
              </div>
            </div>
          )}

          {/* Story card */}
          <div className="p-6">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            <h3 className="font-bold text-gray-900 text-lg mb-2">{studentName}'s Story</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{story}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{studentName}</p>
                <p className="text-xs text-gray-500">{role} · {company}</p>
              </div>
              <button
                onClick={() => { onClose(); setCounselorOpen(true); }}
                className="px-4 py-2 bg-blue-900 text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition">
                Talk to a Counselor Like {studentName.split(' ')[0]} →
              </button>
            </div>
          </div>
        </div>
      </div>
      <CounselorModal isOpen={counselorOpen} onClose={() => setCounselorOpen(false)} sourcePage={sourcePage} />
    </>
  );
}
