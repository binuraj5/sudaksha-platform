'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, Clock, Phone, Car } from 'lucide-react';
import Link from 'next/link';

const offices = [
  {
    id: 'bangalore',
    name: 'BANGALORE (HEAD OFFICE)',
    address: '123, Tech Park Road, Whitefield, Bangalore - 560066',
    mapUrl: '#',
    directions: 'Nearest Metro: Whitefield Station',
    parking: 'Parking: Available',
    hours: 'Walk-ins Welcome: Mon-Sat, 10 AM - 6 PM',
    appointment: 'Book Visit',
    isPrimary: true,
  },
  {
    id: 'hyderabad',
    name: 'HYDERABAD OFFICE',
    address: '456, Software Layout, Gachibowli, Hyderabad - 500032',
    phone: '+91 91210 44435',
    directions: 'Get Directions',
    mapUrl: '#',
  },
  {
    id: 'pune',
    name: 'PUNE OFFICE',
    address: '789, IT Hub, Hinjewadi, Pune - 411057',
    phone: '+91 91210 44435',
    directions: 'Get Directions',
    mapUrl: '#',
  },
];

export function VisitUs() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Visit Us
          </h2>
          <p className="text-xl text-gray-600">
            Meet us in person at our offices
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {offices.map((office, index) => (
            <motion.div
              key={office.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`rounded-2xl p-8 ${
                office.isPrimary
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    office.isPrimary ? 'text-white' : 'text-gray-900'
                  }`}>
                    {office.name}
                  </h3>
                </div>

                {/* Address */}
                <div className="space-y-3">
                  <div className={`flex items-start space-x-3 ${
                    office.isPrimary ? 'text-blue-100' : 'text-gray-600'
                  }`}>
                    <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm leading-relaxed">{office.address}</p>
                  </div>

                  {/* Map Placeholder */}
                  <div className={`bg-gray-200 rounded-lg h-32 flex items-center justify-center ${
                    office.isPrimary ? 'bg-white bg-opacity-10' : ''
                  }`}>
                    <span className={`text-sm ${
                      office.isPrimary ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      🗺️ Embedded Google Map
                    </span>
                  </div>

                  <Link
                    href={office.mapUrl}
                    className={`inline-flex items-center space-x-2 text-sm font-medium ${
                      office.isPrimary
                        ? 'text-blue-100 hover:text-white'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    <span>{office.directions}</span>
                  </Link>
                </div>

                {/* Office-specific details */}
                {office.isPrimary ? (
                  <div className="space-y-3 text-blue-100">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{office.hours}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4" />
                      <span className="text-sm">{office.parking}</span>
                    </div>
                    <Link
                      href="#appointment"
                      className="inline-block bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium text-sm"
                    >
                      {office.appointment}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-mono">{office.phone}</span>
                    </div>
                    <Link
                      href={office.mapUrl}
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <span>{office.directions}</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}





