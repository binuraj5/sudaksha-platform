'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Clock, User, Play } from 'lucide-react';
import Link from 'next/link';

const events = [
  {
    id: 1,
    type: 'Webinar',
    title: 'Breaking Into Tech Without a CS Degree',
    date: 'Saturday, Feb 10, 2025',
    time: '11:00 AM - 12:00 PM IST',
    speaker: 'Priya Sharma, Career Coach',
    registration: 'Free Registration',
    description: 'Learn how to transition into tech from non-technical backgrounds.',
    isLive: true,
  },
  {
    id: 2,
    type: 'Workshop',
    title: 'Build Your First Web App in 2 Hours',
    date: 'Sunday, Feb 18, 2025',
    time: '10:00 AM - 12:00 PM IST',
    speaker: 'Hands-on, Live Coding',
    registration: 'Free, Limited Seats',
    description: 'Practical workshop to create your first web application.',
    isLive: false,
  },
];

export function WebinarsEvents() {
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
            Webinars & Events
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our free webinars and workshops to accelerate your learning journey
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {event.type}
                </span>
                {event.isLive && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                    Live
                  </span>
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {event.title}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  {event.date}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  {event.time}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  {event.speaker}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {event.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-green-600 font-medium text-sm">
                  {event.registration}
                </span>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                  Register Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link
            href="/events"
            className="inline-flex items-center px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            View All Events
          </Link>
        </motion.div>
      </div>
    </div>
  );
}





