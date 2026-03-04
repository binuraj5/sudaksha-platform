'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useQuery } from '@tanstack/react-query';
import { Quote, Star, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  photo: string;
  previousRole: string;
  currentRole: string;
  salaryTransformation: string;
  companyLogo: string;
  rating: number;
  course: string;
  quote: string;
}

export function Testimonials() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: testimonials = [] } = useQuery({
    queryKey: ['featured-testimonials'],
    queryFn: async () => {
      const res = await fetch('/api/reviews/featured');
      if (!res.ok) throw new Error('Failed to fetch testimonials');
      return res.json() as Promise<Testimonial[]>;
    }
  });

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (!testimonials.length) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-screen-xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Real Stories, Incredible Journeys
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from students who transformed their careers with Sudaksha
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 lg:p-12">
            {/* Quote Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute top-4 left-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center"
            >
              <Quote className="w-6 h-6 text-white" />
            </motion.div>

            {/* Testimonial Content */}
            <motion.div
              key={currentTestimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <blockquote className="text-2xl lg:text-3xl text-gray-900 font-medium mb-8 leading-relaxed">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Student Info */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900">{currentTestimonial.name}</div>
                  <div className="text-gray-600 mb-2">
                    {currentTestimonial.previousRole} → {currentTestimonial.currentRole}
                  </div>
                  <div className="text-lg font-semibold text-green-600 mb-2">
                    {currentTestimonial.salaryTransformation}
                  </div>
                  <div className="flex items-center justify-center space-x-1 mb-3">
                    {renderStars(currentTestimonial.rating)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Course: {currentTestimonial.course}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation */}
            <div className="absolute top-1/2 transform -translate-y-1/2 left-4 right-4 flex justify-between">
              <button
                onClick={prevTestimonial}
                className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={nextTestimonial}
                className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-blue-600 w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">4.8/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">5,000+</div>
            <div className="text-gray-600">Success Stories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 mb-2">92%</div>
            <div className="text-gray-600">Would Recommend</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <a
            href="/success-stories"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            View All Success Stories
            <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
