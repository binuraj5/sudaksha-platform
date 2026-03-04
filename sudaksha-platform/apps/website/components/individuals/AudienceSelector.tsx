'use client';

import { motion } from 'framer-motion';
import { Code, Briefcase, TrendingUp, Users, ArrowRight } from 'lucide-react';

interface AudienceOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  stats: string[];
  color: string;
  programs: number;
}

interface AudienceSelectorProps {
  data: {
    headline: string;
    subheadline: string;
    audiences: AudienceOption[];
  };
  onAudienceSelect: (audienceId: string) => void;
}

const iconMap = {
  Code,
  Briefcase,
  TrendingUp,
  Users,
};

export default function AudienceSelector({ data, onAudienceSelect }: AudienceSelectorProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
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

        {/* Audience Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {data.audiences.map((audience) => {
            const IconComponent = iconMap[audience.icon as keyof typeof iconMap] || Users;
            
            return (
              <motion.div
                key={audience.id}
                variants={cardVariants}
                whileHover={{ y: -5 }}
                className="relative group cursor-pointer"
                onClick={() => onAudienceSelect(audience.id)}
              >
                <div className={`relative bg-gradient-to-br ${audience.color} rounded-2xl p-8 h-full transition-all duration-300 hover:shadow-2xl`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-hero-gradient bg-size-200 animate-gradient-shift" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {audience.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-white/90 font-medium mb-4">
                      {audience.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-white/80 text-sm mb-6 leading-relaxed">
                      {audience.description}
                    </p>

                    {/* Stats */}
                    <div className="space-y-2 mb-6">
                      {audience.stats.map((stat, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />
                          <span className="text-white/90 text-sm">{stat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Programs Count */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                      <span className="text-white/80 text-sm">
                        {audience.programs} Programs Available
                      </span>
                      <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-sudaksha-navy-600 mb-4">
            Not sure which path is right for you?
          </p>
          <motion.a
            href="#career-counseling"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-6 py-3 bg-sudaksha-orange-500 text-white font-semibold rounded-lg hover:bg-sudaksha-orange-600 transition-colors duration-300"
          >
            Talk to Career Counselor
            <ArrowRight className="ml-2 w-4 h-4" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
