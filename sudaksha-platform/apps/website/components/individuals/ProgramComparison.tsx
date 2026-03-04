'use client';

import { motion } from 'framer-motion';
import { Check, X, Info } from 'lucide-react';

interface ComparisonTable {
  headers: string[];
  rows: {
    feature: string;
    values: (string | boolean | null)[];
    important?: boolean;
  }[];
}

interface ProgramComparisonProps {
  data: {
    headline: string;
    subheadline: string;
    programs: {
      name: string;
      duration: string;
      difficulty: string;
      bestFor: string;
      placementRate: string;
      avgSalary: string;
      learningCurve: string;
      jobMarket: string;
      futureScope: string;
    }[];
    comparisonTable: ComparisonTable;
  };
}

export default function ProgramComparison({ data }: ProgramComparisonProps) {
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
  } as const;

  const renderCellValue = (value: string | boolean | null) => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex justify-center">
          {value ? (
            <Check className="w-5 h-5 text-sudaksha-green-500" />
          ) : (
            <X className="w-5 h-5 text-sudaksha-red-500" />
          )}
        </div>
      );
    }
    if (value === null) {
      return <span className="text-sudaksha-navy-400">-</span>;
    }
    return <span className="text-sudaksha-navy-700">{value}</span>;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-sudaksha-green-600 bg-sudaksha-green-100';
      case 'medium': return 'text-sudaksha-orange-600 bg-sudaksha-orange-100';
      case 'hard': return 'text-sudaksha-red-600 bg-sudaksha-red-100';
      default: return 'text-sudaksha-navy-600 bg-sudaksha-navy-100';
    }
  };

  const getJobMarketColor = (market: string) => {
    if (market.toLowerCase().includes('highest')) return 'text-sudaksha-green-600 bg-sudaksha-green-100';
    if (market.toLowerCase().includes('high')) return 'text-sudaksha-blue-600 bg-sudaksha-blue-100';
    if (market.toLowerCase().includes('very high')) return 'text-sudaksha-purple-600 bg-sudaksha-purple-100';
    return 'text-sudaksha-navy-600 bg-sudaksha-navy-100';
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-sudaksha-navy-900 mb-4">
            {data.headline}
          </h2>
          <p className="text-lg text-sudaksha-navy-700 max-w-3xl mx-auto">
            {data.subheadline}
          </p>
        </motion.div>

        {/* Quick Comparison Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {data.programs.map((program, index) => (
            <motion.div
              key={program.name}
              variants={itemVariants}
              className="bg-gradient-to-br from-sudaksha-blue-50 to-sudaksha-orange-50 rounded-xl p-6 border border-sudaksha-navy-100"
            >
              <h3 className="text-lg font-bold text-sudaksha-navy-900 mb-4">{program.name}</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-sudaksha-navy-600 uppercase tracking-wide">Duration</span>
                  <p className="font-semibold text-sudaksha-navy-800">{program.duration}</p>
                </div>
                
                <div>
                  <span className="text-xs text-sudaksha-navy-600 uppercase tracking-wide">Difficulty</span>
                  <p className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(program.difficulty)}`}>
                    {program.difficulty}
                  </p>
                </div>
                
                <div>
                  <span className="text-xs text-sudaksha-navy-600 uppercase tracking-wide">Best For</span>
                  <p className="text-sm text-sudaksha-navy-700">{program.bestFor}</p>
                </div>
                
                <div>
                  <span className="text-xs text-sudaksha-navy-600 uppercase tracking-wide">Placement Rate</span>
                  <p className="font-semibold text-sudaksha-green-600">{program.placementRate}</p>
                </div>
                
                <div>
                  <span className="text-xs text-sudaksha-navy-600 uppercase tracking-wide">Average Salary</span>
                  <p className="font-semibold text-sudaksha-blue-600">{program.avgSalary}</p>
                </div>
                
                <div>
                  <span className="text-xs text-sudaksha-navy-600 uppercase tracking-wide">Job Market</span>
                  <p className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getJobMarketColor(program.jobMarket)}`}>
                    {program.jobMarket}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Detailed Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-sudaksha-navy-100"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header */}
              <thead className="bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-blue-700 text-white">
                <tr>
                  {data.comparisonTable.headers.map((header, index) => (
                    <th
                      key={index}
                      className={`px-4 py-4 text-left font-semibold ${
                        index === 0 ? 'sticky left-0 bg-sudaksha-blue-600 z-10' : ''
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {data.comparisonTable.rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`border-b border-sudaksha-navy-100 ${
                      row.important ? 'bg-sudaksha-blue-50' : rowIndex % 2 === 0 ? 'bg-white' : 'bg-sudaksha-navy-50'
                    }`}
                  >
                    {row.values.map((value, valueIndex) => (
                      <td
                        key={valueIndex}
                        className={`px-4 py-3 ${
                          valueIndex === 0 ? 'sticky left-0 bg-white z-10 font-semibold text-sudaksha-navy-800' : 'text-center'
                        } ${row.important && valueIndex === 0 ? 'bg-sudaksha-blue-50' : ''}`}
                      >
                        {valueIndex === 0 ? value : renderCellValue(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recommendation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 bg-gradient-to-r from-sudaksha-orange-50 to-sudaksha-blue-50 rounded-2xl p-8"
        >
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Info className="w-6 h-6 text-sudaksha-blue-600 mr-2" />
              <h3 className="text-xl font-bold text-sudaksha-navy-900">Need Help Choosing?</h3>
            </div>
            <p className="text-sudaksha-navy-700 mb-6 max-w-2xl mx-auto">
              Our career counselors can help you select the right program based on your background, interests, and career goals. Get personalized guidance to make the best decision for your future.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Schedule Career Counseling
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
