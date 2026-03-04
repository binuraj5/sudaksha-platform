'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Phone, MessageCircle, Calendar } from 'lucide-react';

const contactOptions = [
  {
    id: 'call',
    icon: Phone,
    title: '📞 CALL US NOW',
    subtitle: 'For Immediate Assistance',
    sections: [
      {
        title: 'Individuals',
        contact: '+91-XXXXX-XXXXX',
      },
      {
        title: 'Corporates',
        contact: '+91-XXXXX-XXXXX',
      },
      {
        title: 'Institutions',
        contact: '+91-XXXXX-XXXXX',
      },
    ],
    hours: 'Mon-Sat, 9 AM - 8 PM IST',
    sunday: 'Sunday: 10 AM - 5 PM (Limited)',
    action: 'Call Now',
    actionType: 'tel',
    primary: true,
  },
  {
    id: 'whatsapp',
    icon: MessageCircle,
    title: '💬 WHATSAPP US',
    subtitle: 'Fastest Response (Avg: 5 minutes)',
    description: 'Scan QR Code or Click to open WhatsApp chat',
    qrPlaceholder: true,
    hours: 'Mon-Sat, 9 AM - 8 PM',
    action: 'WhatsApp Button',
    actionType: 'whatsapp',
    primary: true,
  },
  {
    id: 'appointment',
    icon: Calendar,
    title: '📅 SCHEDULE APPOINTMENT',
    subtitle: 'Book a Time That Works for You',
    options: [
      'Career Counseling (30 min)',
      'Program Demo Class (60 min)',
      'Campus Tour (if in Bangalore)',
      'Corporate Consultation (45 min)',
    ],
    availability: 'Next Available: Today, 3 PM | Tomorrow, 10 AM',
    action: 'Book Appointment',
    actionType: 'calendar',
    primary: false,
  },
];

export function PrimaryContactOptions() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {contactOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`rounded-2xl p-8 lg:p-12 ${
                option.primary
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Content */}
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-2xl lg:text-3xl font-bold mb-2 ${
                      option.primary ? 'text-white' : 'text-gray-900'
                    }`}>
                      {option.title}
                    </h3>
                    <p className={`text-lg ${
                      option.primary ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {option.subtitle}
                    </p>
                  </div>

                  {/* Call Options */}
                  {option.id === 'call' && (
                    <div className="space-y-4">
                      {option.sections?.map((section) => (
                        <div key={section.title}>
                          <p className="font-semibold text-white mb-1">{section.title}:</p>
                          <p className="text-xl font-mono text-blue-100">{section.contact}</p>
                        </div>
                      ))}
                      <div className="text-sm text-blue-100 space-y-1">
                        <p><strong>Hours:</strong> {option.hours}</p>
                        <p><strong>{option.sunday}</strong></p>
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Options */}
                  {option.id === 'whatsapp' && (
                    <div className="space-y-4">
                      <p className="text-blue-100">{option.description}</p>
                      <div className="bg-white bg-opacity-10 rounded-lg p-4 inline-block">
                        <div className="w-32 h-32 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">QR Code</span>
                        </div>
                      </div>
                      <p className="text-sm text-blue-100">
                        <strong>Available:</strong> {option.hours}
                      </p>
                    </div>
                  )}

                  {/* Appointment Options */}
                  {option.id === 'appointment' && (
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-gray-900 mb-2">Choose:</p>
                        {option.options?.map((opt) => (
                          <p key={opt} className="text-gray-600">• {opt}</p>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>{option.availability}</strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="flex justify-center lg:justify-end">
                  <button
                    className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                      option.primary
                        ? 'bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {option.action}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}





