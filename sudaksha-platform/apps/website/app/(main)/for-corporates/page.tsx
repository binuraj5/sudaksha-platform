'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Users, Target, TrendingUp, Award, Clock, Globe } from 'lucide-react';
import { QuoteRequestModal } from '@/src/components/common/QuoteRequestModal';
import { useCTACapture } from '@/hooks/useCTACapture';

export default function ForCorporates() {
  const router = useRouter();
  const { capture } = useCTACapture();
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Corporate Training Solutions
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your workforce with industry-leading IT training programs tailored to your organization's needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  capture({ sourcePage: '/for-corporates', ctaLabel: 'Get Started', intent: 'corporate_quote', userType: 'corporate' });
                  setQuoteOpen(true);
                }}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  capture({ sourcePage: '/for-corporates', ctaLabel: 'Explore Programs', intent: 'browse_courses', userType: 'corporate' });
                  router.push('/for-corporates/domestic');
                }}
                className="inline-flex items-center px-8 py-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Explore Programs
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Sudaksha?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We deliver comprehensive training solutions that drive real business results
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Expert Instructors",
                description: "Learn from industry professionals with 10+ years of real-world experience"
              },
              {
                icon: Target,
                title: "Customized Curriculum",
                description: "Tailored training programs aligned with your business objectives"
              },
              {
                icon: TrendingUp,
                title: "Proven Results",
                description: "95% satisfaction rate with measurable skill improvements"
              },
              {
                icon: Award,
                title: "Certification Programs",
                description: "Industry-recognized certifications that validate skills"
              },
              {
                icon: Clock,
                title: "Flexible Scheduling",
                description: "Weekday, weekend, and online options to suit your team"
              },
              {
                icon: Globe,
                title: "Global Delivery",
                description: "Training available both domestically and internationally"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Team?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Let us design a custom training program that meets your specific needs
            </p>
            <button
              onClick={() => {
                capture({ sourcePage: '/for-corporates', ctaLabel: 'Schedule a Consultation', intent: 'corporate_quote', userType: 'corporate' });
                setQuoteOpen(true);
              }}
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Schedule a Consultation
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      <QuoteRequestModal isOpen={quoteOpen} onClose={() => setQuoteOpen(false)} sourcePage="/for-corporates" />
    </div>
  );
}
