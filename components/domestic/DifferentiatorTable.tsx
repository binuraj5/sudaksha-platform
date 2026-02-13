'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

// Temporary type definition
interface DifferentiatorSection {
  headline: string;
  comparisons: {
    aspect: string;
    traditional: string;
    sudaksha: string;
  }[];
}

interface DifferentiatorTableProps {
  data: DifferentiatorSection;
}

export default function DifferentiatorTable({ data }: DifferentiatorTableProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-br from-sudaksha-blue-50 via-white to-sudaksha-orange-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-hero-gradient bg-size-200 animate-gradient-shift" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-4"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-sudaksha-navy-900 mb-6"
          >
            {data.headline}
          </motion.h2>
          
          <motion.div
            variants={itemVariants}
            className="w-24 h-1 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-orange-500 mx-auto rounded-full"
          />
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          {/* Desktop Table */}
          <div className="hidden lg:block">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-0 bg-white rounded-t-2xl shadow-card overflow-hidden">
              <div className="p-6 bg-sudaksha-navy-50 border-r border-sudaksha-navy-200">
                <h3 className="text-lg font-bold text-sudaksha-navy-900">Aspect</h3>
              </div>
              <div className="p-6 bg-red-50 border-r border-red-200">
                <h3 className="text-lg font-bold text-red-700 flex items-center">
                  <XCircle className="w-5 h-5 mr-2" />
                  Traditional Vendors
                </h3>
              </div>
              <div className="p-6 bg-green-50">
                <h3 className="text-lg font-bold text-green-700 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Sudaksha Domestic B2B
                </h3>
              </div>
            </div>

            {/* Table Rows */}
            <div className="bg-white rounded-b-2xl shadow-card overflow-hidden">
              {data.comparisons.map((comparison, index) => (
                <motion.div
                  key={comparison.aspect}
                  variants={rowVariants}
                  className={`grid grid-cols-3 gap-0 border-b border-sudaksha-navy-100 last:border-b-0 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-sudaksha-blue-50/30'
                  } hover:bg-sudaksha-blue-50/50 transition-colors duration-300`}
                >
                  {/* Aspect Column */}
                  <div className="p-6 border-r border-sudaksha-navy-100">
                    <h4 className="font-semibold text-sudaksha-navy-800">
                      {comparison.aspect}
                    </h4>
                  </div>

                  {/* Traditional Column */}
                  <div className="p-6 border-r border-sudaksha-navy-100">
                    <div className="flex items-start space-x-3">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sudaksha-navy-700 leading-relaxed">
                        {comparison.traditional}
                      </p>
                    </div>
                  </div>

                  {/* Sudaksha Column */}
                  <div className="p-6 relative group">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sudaksha-navy-700 leading-relaxed font-medium">
                        {comparison.sudaksha}
                      </p>
                    </div>
                    
                    {/* Hover highlight */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile/Tablet Accordion */}
          <div className="lg:hidden space-y-4">
            {data.comparisons.map((comparison, index) => (
              <motion.div
                key={comparison.aspect}
                variants={rowVariants}
                className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300"
              >
                {/* Aspect Header */}
                <div className="p-6 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-blue-700">
                  <h3 className="text-xl font-bold text-white">
                    {comparison.aspect}
                  </h3>
                </div>

                {/* Comparison Content */}
                <div className="p-6 space-y-6">
                  {/* Traditional */}
                  <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">Traditional Vendors</h4>
                      <p className="text-sudaksha-navy-700 leading-relaxed">
                        {comparison.traditional}
                      </p>
                    </div>
                  </div>

                  {/* Sudaksha */}
                  <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">Sudaksha Domestic B2B</h4>
                      <p className="text-sudaksha-navy-700 leading-relaxed font-medium">
                        {comparison.sudaksha}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mt-16"
        >
          <motion.a
            href="#training-categories"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-orange-500 text-white font-semibold rounded-lg shadow-cta hover:shadow-cta-hover transition-all duration-300 group"
          >
            Explore Our Training Solutions
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.a>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
