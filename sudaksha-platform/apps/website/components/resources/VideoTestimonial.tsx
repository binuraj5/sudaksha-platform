'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Play, Star } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export function VideoTestimonial() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="py-16 lg:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Real Stories, Real Transformations
            </h2>
            <p className="text-xl text-gray-600">
              Hear directly from our successful students
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Video Thumbnail */}
            <div className="relative aspect-video bg-gray-800">
              {/* Placeholder for video thumbnail */}
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 ml-1" />
                  </div>
                  <p className="text-sm opacity-80">Video Testimonial</p>
                </div>
              </div>

              {/* Play Button Overlay */}
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group"
              >
                <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors duration-200">
                  <Play className="w-6 h-6 text-gray-900 ml-1" />
                </div>
              </button>
            </div>

            {/* Content */}
            <div className="p-8 text-white">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm text-gray-300">Verified Review</span>
              </div>

              <h3 className="text-2xl font-bold mb-4">
                "From Unemployed Graduate to Software Developer in 4 Months"
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-gray-300 mb-2">Priya Malhotra</p>
                  <p className="text-blue-400 font-medium">B.Tech CSE, Placed at Infosys</p>
                  <p className="text-green-400 font-semibold">₹7.2 LPA</p>
                </div>
                <div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    "I applied to 150 companies after graduation. Zero interviews. After Sudaksha's finishing school, I got 3 offers. The difference? Real projects, modern skills, and interview confidence."
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setIsPlaying(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 font-medium"
                >
                  <Play className="w-4 h-4" />
                  <span>Watch Full Story (2 min)</span>
                </button>

                <Link
                  href="/success-stories"
                  className="border border-gray-400 text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
                >
                  Read 500+ More Success Stories
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Video Modal (would be implemented with actual video player) */}
      {isPlaying && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center">
            <p className="text-gray-600 mb-4">
              Video player would be implemented here with actual video content.
            </p>
            <button
              onClick={() => setIsPlaying(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}





