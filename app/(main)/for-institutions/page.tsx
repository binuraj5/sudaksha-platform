'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, GraduationCap, Users, BookOpen, Award, Handshake, TrendingUp } from 'lucide-react';

export default function ForInstitutions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
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
              Partner with Educational Excellence
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Empower your institution with industry-aligned IT training programs and bridge the gap between education and employment
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Partner With Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center px-8 py-4 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                View Programs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Partner with Sudaksha?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Build successful careers for your students with our comprehensive partnership programs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: GraduationCap,
                title: "Industry-Aligned Curriculum",
                description: "Courses designed with input from leading tech companies to ensure relevance"
              },
              {
                icon: Users,
                title: "Expert Faculty Support",
                description: "Access to our network of industry professionals and trainers"
              },
              {
                icon: BookOpen,
                title: "Comprehensive Resources",
                description: "Complete learning materials, labs, and assessment tools"
              },
              {
                icon: Award,
                title: "Certification Programs",
                description: "Industry-recognized certifications that enhance student employability"
              },
              {
                icon: Handshake,
                title: "Placement Support",
                description: "Connect your students with our network of hiring partners"
              },
              {
                icon: TrendingUp,
                title: "Growth Tracking",
                description: "Detailed analytics and progress reports for student performance"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <benefit.icon className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Models */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Partnership Models</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Flexible partnership options to suit your institution's needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Training Partner",
                description: "Integrate our courses into your curriculum with full faculty training and support",
                features: ["Curriculum Integration", "Faculty Training", "Certification Programs", "Placement Support"]
              },
              {
                title: "Skill Development Center",
                description: "Establish a dedicated center for advanced IT skills training on your campus",
                features: ["Dedicated Infrastructure", "Custom Programs", "Industry Projects", "Internship Opportunities"]
              }
            ].map((model, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white p-8 rounded-lg shadow-lg"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{model.title}</h3>
                <p className="text-gray-600 mb-6">{model.description}</p>
                <ul className="space-y-2">
                  {model.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Transform Your Institution's IT Education
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join us in shaping the next generation of IT professionals
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Start Partnership Discussion
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
