'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Users, Monitor, MapPin, Clock, DollarSign, CheckCircle,
  ArrowRight, Calendar, Award, Zap, Target, Shield, Building2,
  Wifi, Video, Headphones, BookOpen, AlertCircle
} from 'lucide-react';

interface DeliveryOption {
  title: string;
  description: string;
  features: string[];
  bestFor: string;
  techRequirements: string[];
  included: string[];
  notIncluded: string[];
}

interface PricingModel {
  title: string;
  description: string;
  suitableFor: string;
  example: string;
  minimum: string;
  benefits: string[];
  considerations: string[];
}

interface DeliveryFormatsProps {
  deliveryData: {
    headline: string;
    options: DeliveryOption[];
  };
  pricingData: {
    headline: string;
    models: PricingModel[];
    addOnServices: {
      title: string;
      description: string;
      pricing: string;
    }[];
  };
}

export default function DeliveryFormats({ deliveryData, pricingData }: DeliveryFormatsProps) {
  const [activeDelivery, setActiveDelivery] = useState<number | null>(null);
  const [activePricing, setActivePricing] = useState<number | null>(null);

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

  const getDeliveryIcon = (title: string) => {
    const icons: { [key: string]: any } = {
      'ON-SITE/IN-PERSON': MapPin,
      'VIRTUAL/LIVE-ONLINE': Video,
      'HYBRID/MIXED MODE': Monitor,
      'SELF-PACED/ONLINE': Headphones,
    };
    return icons[title] || Building2;
  };

  const getDeliveryColor = (index: number) => {
    const colors = [
      'from-blue-600 to-blue-700',
      'from-green-600 to-green-700',
      'from-purple-600 to-purple-700',
      'from-orange-600 to-orange-700',
    ];
    return colors[index % colors.length];
  };

  return (
    <section id="delivery-pricing" className="py-20 bg-gradient-to-br from-white via-sudaksha-blue-50 to-sudaksha-orange-50 relative overflow-hidden">
      <div className="relative z-10 w-full">
        {/* Delivery Formats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="mb-20"
        >
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-sudaksha-navy-900 mb-6">
              {deliveryData.headline}
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-sudaksha-navy-700 max-w-3xl mx-auto mb-8">
              Choose the delivery format that best fits your team's needs, schedule, and learning preferences.
            </motion.p>
            <motion.div variants={itemVariants} className="w-24 h-1 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-orange-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-1 w-screen mx-auto"
             style={{ 
               width: '100vw', 
               maxWidth: '100vw',
               marginLeft: 'calc(-50vw + 50%)',
               marginRight: 'calc(-50vw + 50%)',
               paddingLeft: '0',
               paddingRight: '0'
             }}>
            {deliveryData.options.map((option, index) => {
              const IconComponent = getDeliveryIcon(option.title);
              const isActive = activeDelivery === index;
              
              return (
                <motion.div key={option.title} variants={cardVariants} className="group" onMouseEnter={() => setActiveDelivery(index)} onMouseLeave={() => setActiveDelivery(null)}>
                  <div className={`h-full bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border-2 ${isActive ? 'border-sudaksha-blue-400' : 'border-sudaksha-navy-200'}`}>
                    <div className={`bg-gradient-to-r ${getDeliveryColor(index)} p-6 relative overflow-hidden`}>
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-white/20 transform rotate-45 scale-150" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{option.title}</h3>
                        <p className="text-white/90 text-sm">{option.description}</p>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-6">
                        <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-sudaksha-blue-600" />
                          Best For:
                        </h4>
                        <div className="bg-sudaksha-blue-50 rounded-lg p-3">
                          <p className="text-sm text-sudaksha-navy-700">{option.bestFor}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-sudaksha-green-600" />
                          Features:
                        </h4>
                        <div className="space-y-2">
                          {option.features.slice(0, isActive ? undefined : 3).map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-sudaksha-green-500 rounded-full mt-1.5 flex-shrink-0" />
                              <span className="text-sm text-sudaksha-navy-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                        {option.features.length > 3 && !isActive && (
                          <p className="text-sudaksha-blue-600 text-sm font-medium mt-2">+{option.features.length - 3} more features</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Pricing Models Section */}
        <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl lg:text-5xl font-bold text-sudaksha-navy-900 mb-6">
              {pricingData.headline}
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-sudaksha-navy-700 max-w-3xl mx-auto mb-8">
              Transparent pricing models designed to provide maximum value and flexibility for your organization.
            </motion.p>
            <motion.div variants={itemVariants} className="w-24 h-1 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-orange-500 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-1 w-screen mx-auto"
             style={{ 
               width: '100vw', 
               maxWidth: '100vw',
               marginLeft: 'calc(-50vw + 50%)',
               marginRight: 'calc(-50vw + 50%)',
               paddingLeft: '0',
               paddingRight: '0'
             }}>
            {pricingData.models.map((model, index) => {
              const isActive = activePricing === index;
              const colors = ['from-sudaksha-blue-600 to-sudaksha-blue-700', 'from-sudaksha-orange-500 to-sudaksha-orange-600', 'from-sudaksha-green-600 to-sudaksha-green-700', 'from-sudaksha-purple-600 to-sudaksha-purple-700'];
              
              return (
                <motion.div key={model.title} variants={cardVariants} className="group" onMouseEnter={() => setActivePricing(index)} onMouseLeave={() => setActivePricing(null)}>
                  <div className={`h-full bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border-2 ${isActive ? 'border-sudaksha-orange-400' : 'border-sudaksha-navy-200'}`}>
                    <div className={`bg-gradient-to-r ${colors[index % colors.length]} p-6 relative overflow-hidden`}>
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-white/20 transform rotate-45 scale-150" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <DollarSign className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{model.title}</h3>
                        <p className="text-white/90 text-sm">{model.description}</p>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-6">
                        <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-sudaksha-blue-600" />
                          Suitable For:
                        </h4>
                        <div className="bg-sudaksha-blue-50 rounded-lg p-3">
                          <p className="text-sm text-sudaksha-navy-700">{model.suitableFor}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-sudaksha-green-600" />
                          Example:
                        </h4>
                        <div className="bg-sudaksha-green-50 rounded-lg p-3">
                          <p className="text-sm text-sudaksha-navy-700 mb-2">{model.example}</p>
                          <p className="text-xs text-sudaksha-navy-600">Minimum: {model.minimum}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-sudaksha-orange-600" />
                          Benefits:
                        </h4>
                        <div className="space-y-2">
                          {model.benefits.slice(0, isActive ? undefined : 3).map((benefit, benefitIndex) => (
                            <div key={benefitIndex} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-sudaksha-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                              <span className="text-sm text-sudaksha-navy-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                        {model.benefits.length > 3 && !isActive && (
                          <p className="text-sudaksha-orange-600 text-sm font-medium mt-2">+{model.benefits.length - 3} more benefits</p>
                        )}
                      </div>

                      <div className="mb-6">
                        <h4 className="font-semibold text-sudaksha-navy-800 mb-3 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 text-sudaksha-purple-600" />
                          Considerations:
                        </h4>
                        <div className="space-y-2">
                          {model.considerations.slice(0, isActive ? undefined : 2).map((consideration, considerationIndex) => (
                            <div key={considerationIndex} className="flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-sudaksha-purple-500 rounded-full mt-1.5 flex-shrink-0" />
                              <span className="text-sm text-sudaksha-navy-700">{consideration}</span>
                            </div>
                          ))}
                        </div>
                        {model.considerations.length > 2 && !isActive && (
                          <p className="text-sudaksha-purple-600 text-sm font-medium mt-2">+{model.considerations.length - 2} more considerations</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center mt-16">
          <div className="bg-gradient-to-r from-sudaksha-blue-50 to-sudaksha-orange-50 rounded-2xl p-8 max-w-4xl mx-auto border border-sudaksha-navy-200">
            <h3 className="text-2xl font-bold text-sudaksha-navy-900 mb-4">Need a Custom Solution?</h3>
            <p className="text-sudaksha-navy-700 mb-6">We can create tailored delivery and pricing models to meet your specific requirements. Let's discuss your needs.</p>
            <motion.a href="#final-cta" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-sudaksha-blue-600 to-sudaksha-orange-500 text-white font-semibold rounded-lg shadow-cta hover:shadow-cta-hover transition-all duration-300 group">
              Get Custom Quote
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
