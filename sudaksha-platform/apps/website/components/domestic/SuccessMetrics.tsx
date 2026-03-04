'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  BarChart3, TrendingUp, Users, Target, Award, Clock,
  CheckCircle, ArrowRight, Brain, Heart, Zap, Shield,
  Activity, PieChart, LineChart, Star, ThumbsUp
} from 'lucide-react';

interface SuccessMetric {
  label: string;
  value: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
  category: string;
}

interface SuccessMetricsProps {
  data: {
    headline: string;
    categories: {
      category: string;
      metrics: SuccessMetric[];
    }[];
    roiCalculator: {
      title: string;
      description: string;
      factors: {
        name: string;
        impact: string;
        description: string;
      }[];
    };
    measurementApproach: {
      title: string;
      phases: {
        phase: string;
        activities: string[];
        tools: string[];
      }[];
    };
  };
}

export default function SuccessMetrics({ data }: SuccessMetricsProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'Technical Training': BarChart3,
      'Behavioral Training': Users,
      'Employment Models': Target,
      'Organizational Impact': TrendingUp,
    };
    return icons[category] || Activity;
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'from-blue-600 to-blue-700',
      'from-green-600 to-green-700',
      'from-purple-600 to-purple-700',
      'from-orange-600 to-orange-700',
    ];
    return colors[index % colors.length];
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <section id="success-metrics" className="py-20 bg-gradient-to-br from-sudaksha-navy-900 via-sudaksha-navy-800 to-sudaksha-blue-900 relative overflow-hidden">
      <div className="relative z-10 w-full">
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center mb-16">
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {data.headline}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-sudaksha-blue-200 max-w-3xl mx-auto mb-8">
            We measure what matters. From individual competency improvement to organizational business impact, our comprehensive metrics framework ensures you see the ROI of your training investment.
          </motion.p>
          <motion.div variants={itemVariants} className="w-24 h-1 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-blue-400 mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-1 w-screen mb-20">
          {data.categories.map((category, index) => {
            const IconComponent = getCategoryIcon(category.category);
            const isActive = activeCategory === index;
            
            return (
              <motion.div key={category.category} variants={cardVariants} className="group" onMouseEnter={() => setActiveCategory(index)} onMouseLeave={() => setActiveCategory(null)}>
                <div className={`h-full bg-gradient-to-br ${getCategoryColor(index)} rounded-2xl shadow-xl overflow-hidden border border-white/20 backdrop-blur-sm`}>
                  <div className="p-6 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{category.category}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="text-white/90 text-sm">{category.metrics.length} metrics</div>
                        <div className="w-2 h-2 bg-white/50 rounded-full" />
                        <div className="text-white/90 text-sm">tracked</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/10 backdrop-blur-sm">
                    <div className="space-y-4">
                      {category.metrics.slice(0, isActive ? undefined : 3).map((metric, metricIndex) => (
                        <div key={metricIndex} className="bg-white/10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-semibold text-sm">{metric.label}</h4>
                            <div className="flex items-center space-x-2">
                              {getTrendIcon(metric.trend)}
                              <span className="text-white font-bold">{metric.value}</span>
                            </div>
                          </div>
                          <p className="text-sudaksha-blue-200 text-xs">{metric.description}</p>
                        </div>
                      ))}
                    </div>
                    
                    {category.metrics.length > 3 && !isActive && (
                      <p className="text-sudaksha-blue-200 text-sm font-medium text-center">
                        +{category.metrics.length - 3} more metrics
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="max-w-6xl mx-auto mb-20">
          <div className="bg-gradient-to-r from-sudaksha-blue-800/50 to-sudaksha-orange-800/50 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">{data.roiCalculator.title}</h3>
            <p className="text-sudaksha-blue-200 text-center mb-8">{data.roiCalculator.description}</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.roiCalculator.factors.map((factor, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="w-12 h-12 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-orange-600 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">{factor.name}</h4>
                  <p className="text-sudaksha-orange-300 text-sm font-medium mb-2">{factor.impact}</p>
                  <p className="text-sudaksha-blue-200 text-xs">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-white mb-4">{data.measurementApproach.title}</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {data.measurementApproach.phases.map((phase, index) => (
              <motion.div key={phase.phase} variants={cardVariants} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-white">{phase.phase}</h4>
                  <div className="w-10 h-10 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-blue-700 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sudaksha-blue-200 font-semibold text-sm mb-2">Activities:</h5>
                    <ul className="space-y-1">
                      {phase.activities.map((activity, activityIndex) => (
                        <li key={activityIndex} className="text-sudaksha-blue-100 text-sm flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="text-sudaksha-blue-200 font-semibold text-sm mb-2">Tools:</h5>
                    <div className="flex flex-wrap gap-2">
                      {phase.tools.map((tool, toolIndex) => (
                        <span key={toolIndex} className="text-xs bg-sudaksha-blue-800/50 text-sudaksha-blue-200 px-2 py-1 rounded">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center mt-16">
          <div className="bg-gradient-to-r from-sudaksha-orange-600/20 to-sudaksha-blue-600/20 rounded-2xl p-8 max-w-4xl mx-auto border border-sudaksha-navy-600 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">Want to See Your Potential ROI?</h3>
            <p className="text-sudaksha-blue-200 mb-6">Let us run a customized ROI analysis based on your specific training needs and organizational goals.</p>
            <motion.a href="#final-cta" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-sudaksha-orange-500 to-sudaksha-orange-600 text-white font-semibold rounded-lg shadow-cta hover:shadow-cta-hover transition-all duration-300 group">
              Request ROI Analysis
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
