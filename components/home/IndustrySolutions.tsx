'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { CreditCard, ShoppingCart, Heart, Pill, Truck, BookOpen, Building, Shield, Plane, MapPin, Package, Home, ArrowRight } from 'lucide-react';
import { INDUSTRIES } from '../../lib/constants/home';

export function IndustrySolutions() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard': return CreditCard;
      case 'ShoppingCart': return ShoppingCart;
      case 'Heart': return Heart;
      case 'Pill': return Pill;
      case 'Truck': return Truck;
      case 'BookOpen': return BookOpen;
      case 'Building': return Building;
      case 'Shield': return Shield;
      case 'Plane': return Plane;
      case 'MapPin': return MapPin;
      case 'Package': return Package;
      case 'Home': return Home;
      default: return Building;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
      case 'purple': return 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700';
      case 'red': return 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700';
      case 'green': return 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700';
      case 'orange': return 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700';
      case 'indigo': return 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700';
      case 'gray': return 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700';
      case 'darkblue': return 'from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900';
      case 'sky': return 'from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700';
      case 'teal': return 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700';
      case 'pink': return 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700';
      case 'amber': return 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700';
      default: return 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700';
    }
  };

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Industry-Specific Training Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Customized programs for 12+ verticals with domain-specific expertise
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {INDUSTRIES.map((industry, index) => {
            const Icon = getIcon(industry.icon);
            
            return (
              <motion.div
                key={industry.id}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300"
              >
                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getColorClasses(industry.color)} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative p-6">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={inView ? { scale: 1 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                    className={`w-16 h-16 bg-gradient-to-br ${getColorClasses(industry.color)} rounded-2xl flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{industry.name}</h3>
                  <p className="text-gray-600 mb-4">{industry.tagline}</p>

                  {/* Hover CTA */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 bg-opacity-95 flex items-center justify-center opacity-0 transition-opacity duration-300"
                  >
                    <a
                      href={`/for-corporates/industries/${industry.slug}`}
                      className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Explore Solutions
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
