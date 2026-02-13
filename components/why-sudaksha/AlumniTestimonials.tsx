'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Play } from 'lucide-react';
import Link from 'next/link';

const testimonials = [
  {
    id: 1,
    type: 'Fresher Success',
    thumbnail: '/api/placeholder/300/200',
    name: 'Priya Malhotra',
    achievement: 'B.Tech CSE, Unemployed 9 months → Software Engineer @ Infosys, ₹7.2 LPA',
    quote: '"I tried 4 institutes before Sudaksha. Others taught, Sudaksha transformed. The difference? Personal attention, real projects, relentless placement support."',
    videoTime: '2-min video',
  },
  {
    id: 2,
    type: 'Career Switcher',
    thumbnail: '/api/placeholder/300/200',
    name: 'Meera Desai, Age 30',
    achievement: '5 years HR → Data Analyst @ E-commerce, ₹8 LPA',
    quote: '"At 30, I thought tech was impossible. Sudaksha\'s counselor believed in me when I didn\'t. Foundation program + specialization + placement support = career transformation."',
    videoTime: '3-min video',
  },
  {
    id: 3,
    type: 'Working Professional',
    thumbnail: '/api/placeholder/300/200',
    name: 'Rajesh Kumar',
    achievement: 'Manual Tester → Automation Lead, ₹9 LPA (100% salary jump)',
    quote: '"Weekend batch fit my schedule. Real trainers (not YouTubers). Portfolio projects that impressed employers. 6 months = career breakthrough."',
    videoTime: '2-min video',
  },
  {
    id: 4,
    type: 'Small Town Success',
    thumbnail: '/api/placeholder/300/200',
    name: 'Vikram from Bihar',
    achievement: 'Small town, limited resources → Software Engineer @ TCS',
    quote: '"ISA option made it possible. English was weak, they helped. Rural background, they didn\'t judge. Today I support my family. Thank you Sudaksha."',
    videoTime: '3-min video',
  },
  {
    id: 5,
    type: 'College Placement',
    thumbnail: '/api/placeholder/300/200',
    name: 'Tier-3 College Principal',
    achievement: '42% to 77% placement rate in 2 years',
    quote: '"We partnered with Sudaksha. They didn\'t just train students—they transformed our institution. Faculty trained, curriculum modernized, students placed. Best decision we made."',
    videoTime: '2-min video',
  },
  {
    id: 6,
    type: 'Corporate Training',
    thumbnail: '/api/placeholder/300/200',
    name: 'HR Head, FinTech Company',
    achievement: 'Trained 50 employees, 40% productivity improvement',
    quote: '"We tried 3 training vendors. Sudaksha was different. Custom curriculum, practitioner trainers, measurable outcomes. Our engineers now ship features 40% faster."',
    videoTime: '2-min video',
  },
];

export function AlumniTestimonials() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Alumni Say
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Don't Take Our Word. Take Theirs.
          </p>
          <p className="text-lg text-gray-500">
            Video Testimonial Grid (6 videos)
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Video Thumbnail */}
              <div className="relative h-48 bg-gray-200 overflow-hidden group cursor-pointer">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                      <Play className="w-6 h-6 ml-0.5" />
                    </div>
                    <p className="text-sm opacity-80">{testimonial.videoTime}</p>
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {testimonial.type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">
                  {testimonial.name}
                </h3>

                <p className="text-blue-600 font-medium text-sm mb-4">
                  {testimonial.achievement}
                </p>

                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  "{testimonial.quote}"
                </p>

                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>Watch {testimonial.videoTime}</span>
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
            href="/success-stories"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Watch 100+ More Success Stories
          </Link>
        </motion.div>
      </div>
    </div>
  );
}





