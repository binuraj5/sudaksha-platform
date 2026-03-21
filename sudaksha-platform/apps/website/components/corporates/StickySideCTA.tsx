'use client';

import { useState, useEffect } from 'react';
import { Calendar, FileText, Phone, X } from 'lucide-react';

export default function StickySideCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section
      if (window.scrollY > 800) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay for mobile when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sticky CTA */}
      <div className={`
        fixed right-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-300
        ${isExpanded ? 'w-80' : 'w-auto'}
        ${isExpanded ? 'lg:w-80' : 'lg:w-auto'}
      `}>
        {/* Desktop: Always visible as compact card */}
        <div className="hidden lg:block">
          {!isExpanded ? (
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Need training for your team?
              </p>
              <div className="space-y-2">
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Call
                </button>
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="w-full flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors duration-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Get Quote
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                <p>Phone: +91 91210 44435</p>
                <p>Email: corporate@sudaksha.com</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">
              <button 
                onClick={() => setIsExpanded(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h3 className="font-bold text-gray-900 mb-4">Quick Contact</h3>
              
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="tel" 
                  placeholder="Phone" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea 
                  placeholder="Tell us about your needs" 
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                  Request Callback
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile: Floating button */}
        <div className="lg:hidden">
          {!isExpanded ? (
            <button 
              onClick={() => setIsExpanded(true)}
              className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Calendar className="w-6 h-6" />
            </button>
          ) : (
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 m-4">
              <button 
                onClick={() => setIsExpanded(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h3 className="font-bold text-gray-900 mb-4">Quick Contact</h3>
              
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  type="tel" 
                  placeholder="Phone" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea 
                  placeholder="Tell us about your needs" 
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                  Request Callback
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
